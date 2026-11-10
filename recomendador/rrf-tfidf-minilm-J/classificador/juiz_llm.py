"""Segunda etapa do classificador: um modelo de linguagem local escolhe o assunto entre os 10 candidatos.

Rode de dentro de recomendador/rrf-tfidf-minilm-J/, depois de classificar.py:
    pip install -U "transformers>=4.51" accelerate bitsandbytes torch
    python classificador/juiz_llm.py --quantizar-4bit                 # mede no gabarito (339 questões, ~10 min)
    python classificador/juiz_llm.py --quantizar-4bit --tudo          # classifica a base inteira (~1 h)
    python classificador/juiz_llm.py --modelo Qwen/Qwen3-4B ...       # se faltar memória

Como funciona: o modelo lê a questão e a lista de candidatos (A a J), com descrição e regra de fronteira
de cada assunto, e não gera texto. É lida a probabilidade de cada letra no primeiro token da resposta,
o que dá a escolha e uma confiança. Primeiro rode só no gabarito: se a acurácia não passar da etapa 1,
o juiz não deve ser usado.

Saídas em classificador/saida/: juiz_gabarito.json e relatorio_juiz.md (modo padrão); juiz_base.json (--tudo).
"""
import argparse, json, sys, time
from pathlib import Path
import numpy as np

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent
sys.path.insert(0, str(RAIZ))
import pipeline_baseline as bl

LETRAS = 'ABCDEFGHIJ'
SISTEMA = ('Você classifica questões do ENEM em uma árvore curricular do ensino médio. '
           'Escolha o assunto pelo conhecimento que o aluno precisa dominar para responder. '
           'Não classifique pelo cenário, pelo tema de fundo, pelo autor nem pelo gênero do texto. '
           'Respeite as regras de fronteira descritas em cada candidato. Responda só com a letra.')


def monta_prompt(q, cands, nos_por_id):
    linhas = ['QUESTÃO', bl.question_text(q)[:6000], '', 'CANDIDATOS']
    for L, c in zip(LETRAS, cands):
        n = nos_por_id[c['id']]
        t = f"{L}) {n['disciplina_nome']} › {n['grande_tema_nome']} › {n['assunto']}: {n['descricao']}."
        if n.get('fronteira'):
            t += f" Fronteira: {n['fronteira']}"
        linhas.append(t)
    linhas += ['', 'Qual candidato descreve o assunto cobrado pela questão? Responda só com a letra.']
    return '\n'.join(linhas)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--modelo', default='Qwen/Qwen3-8B')
    ap.add_argument('--quantizar-4bit', action='store_true')
    ap.add_argument('--tudo', action='store_true', help='classifica a base inteira, não só o gabarito')
    ap.add_argument('--arvore', default=str(AQUI / 'dados' / 'arvore_v1.2.json'))
    ap.add_argument('--precisao-alvo', type=float, default=0.85)
    a = ap.parse_args()

    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer
    dev = 'cuda' if torch.cuda.is_available() else 'mps' if torch.backends.mps.is_available() else 'cpu'
    kw = {'torch_dtype': torch.float16 if dev != 'cpu' else torch.float32}
    if a.quantizar_4bit:
        if dev != 'cuda':
            raise SystemExit('--quantizar-4bit exige placa NVIDIA (CUDA).')
        from transformers import BitsAndBytesConfig
        kw = {'quantization_config': BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type='nf4',
                                                        bnb_4bit_compute_dtype=torch.float16,
                                                        bnb_4bit_use_double_quant=True),
              'device_map': {'': 0}}
    tok = AutoTokenizer.from_pretrained(a.modelo)
    model = AutoModelForCausalLM.from_pretrained(a.modelo, **kw)
    if not a.quantizar_4bit:
        model.to(dev)
    model.eval()
    dev_in = next(model.parameters()).device

    ids_letra = []
    for L in LETRAS:
        v = {tok.encode(L, add_special_tokens=False)[0], tok.encode(' ' + L, add_special_tokens=False)[-1]}
        ids_letra.append(sorted(v))

    nos_por_id = {n['id']: n for n in json.loads(Path(a.arvore).read_text())['nos']}
    rows = {q['id']: q for q in map(json.loads, (RAIZ / 'base' / 'questions.jsonl').open(encoding='utf-8'))}
    cls = json.loads((AQUI / 'saida' / 'classificacao.json').read_text())
    alvo = [r for r in cls if r['origem'] != 'defeito' and (a.tudo or r['origem'] == 'gabarito')]
    print(f'{len(alvo)} questões | modelo {a.modelo} | dispositivo {dev}', flush=True)

    res, t0 = [], time.time()
    for k, r in enumerate(alvo, 1):
        cands = r['candidatos'][:10]
        msgs = [{'role': 'system', 'content': SISTEMA},
                {'role': 'user', 'content': monta_prompt(rows[r['id']], cands, nos_por_id)}]
        try:
            txt = tok.apply_chat_template(msgs, tokenize=False, add_generation_prompt=True, enable_thinking=False)
        except TypeError:
            txt = tok.apply_chat_template(msgs, tokenize=False, add_generation_prompt=True)
        enc = tok(txt, return_tensors='pt').to(dev_in)
        with torch.no_grad():
            logits = model(**enc).logits[0, -1].float()
        lp = torch.log_softmax(logits, -1)
        s = np.array([max(lp[i].item() for i in ids_letra[j]) for j in range(len(cands))])
        pr = np.exp(s - s.max()); pr /= pr.sum()
        j = int(pr.argmax())
        res.append({'id': r['id'], 'origem': r['origem'], 'gabarito': r['no'] if r['origem'] == 'gabarito' else None,
                    'etapa1': cands[0]['id'], 'juiz': cands[j]['id'], 'confianca': round(float(pr[j]), 4),
                    'probs': {c['id']: round(float(p), 4) for c, p in zip(cands, pr)}})
        if k % 25 == 0:
            print(f'{k}/{len(alvo)}  {time.time()-t0:.0f}s', flush=True)

    nome = 'juiz_base.json' if a.tudo else 'juiz_gabarito.json'
    (AQUI / 'saida' / nome).write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding='utf-8')

    g = [x for x in res if x['gabarito']]
    if g:
        gt = lambda i: i.split('.')[0]
        ac1 = np.mean([x['etapa1'] == x['gabarito'] for x in g])
        acj = np.mean([x['juiz'] == x['gabarito'] for x in g])
        gtj = np.mean([gt(x['juiz']) == gt(x['gabarito']) for x in g])
        conf = np.array([x['confianca'] for x in g]); ok = np.array([x['juiz'] == x['gabarito'] for x in g])
        lim, cob = None, 0.0
        for t in np.unique(np.round(conf, 2)):
            sel = conf >= t
            if sel.sum() >= 20 and ok[sel].mean() >= a.precisao_alvo:
                lim, cob = float(t), float(sel.mean()); break
        rel = ['# Juiz LLM — resultado no gabarito', '', f'Modelo: {a.modelo}. Questões: {len(g)}.', '',
               '| Medida | Resultado |', '|---|---|',
               f'| Assunto, só etapa 1 (embeddings) | {100*ac1:.1f}% |',
               f'| Assunto, com o juiz | {100*acj:.1f}% |',
               f'| Grande tema, com o juiz | {100*gtj:.1f}% |', '',
               (f'Aceitando só confiança ≥ {lim:.2f}, a precisão chega a {100*a.precisao_alvo:.0f}% e cobre {100*cob:.1f}% das questões.'
                if lim is not None else f'Nenhum limiar de confiança atinge {100*a.precisao_alvo:.0f}% de precisão.'),
               '', 'Se o juiz não superar a etapa 1, não use o juiz.']
        (AQUI / 'saida' / 'relatorio_juiz.md').write_text('\n'.join(rel) + '\n', encoding='utf-8')
        print('\n'.join(rel))
    print(f'pronto em {time.time()-t0:.0f}s', flush=True)


if __name__ == '__main__':
    main()
