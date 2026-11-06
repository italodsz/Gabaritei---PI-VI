"""Testa o Qwen3-Reranker reordenando as primeiras sugestões do candidato rrf_qwen.

Coloque este arquivo em recomendador/rrf-tfidf-minilm-J/ (precisa de indice/qwen/ com os vetores
"conceito") e rode, com o .venv ativo:
    pip install -U "transformers>=4.51" accelerate bitsandbytes
    python testar_reranker.py --so-pares          # rápido: só as 10 consultas com pares (200 pares)
    python testar_reranker.py                     # completo: as 136 consultas de validação
Opções: --modelo Qwen/Qwen3-Reranker-8B | --top 20 | --lote 2 | --sem-4bit

O que mede (validação 2023; o teste de 2024 nunca é usado):
- pares na ordem certa nos 44 pares com nota (mesma métrica de antes);
- hab@5: proporção das 5 primeiras com a mesma habilidade oficial (proxy, só no modo completo).
Variantes: reranker sozinho no top N e RRF entre a ordem original e a do reranker; instrução em
inglês (recomendada pela equipe do Qwen) e em português. Pontuações ficam em cache em
indice/reranker_cache/, então rodar de novo é instantâneo.
"""
import argparse, collections, json, sys, time
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))
import recomendador as R
import pipeline_baseline as bl

INSTRUCOES = {
    'en': ('Given an ENEM exam question (the Query), judge whether the candidate question (the Document) '
           'would help a student practice the same core concept and the same operation required by the '
           'Query, regardless of the scenario or topic of the text'),
    'pt': ('Dada uma questão do ENEM (Query), julgue se a questão candidata (Document) ajudaria o aluno a '
           'praticar o mesmo conceito central e a mesma operação exigidos pela Query, independentemente do '
           'cenário ou do tema do texto'),
}
PREFIXO = ('<|im_start|>system\nJudge whether the Document meets the requirements based on the Query and '
           'the Instruct provided. Note that the answer can only be "yes" or "no".<|im_end|>\n<|im_start|>user\n')
SUFIXO = '<|im_end|>\n<|im_start|>assistant\n<think>\n\n</think>\n\n'


class Reranker:
    def __init__(self, nome, quant4, max_tokens):
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer
        self.torch = torch
        self.tok = AutoTokenizer.from_pretrained(nome, padding_side='left')
        kw = {'torch_dtype': torch.float16}
        if quant4:
            from transformers import BitsAndBytesConfig
            kw = {'quantization_config': BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type='nf4',
                                                            bnb_4bit_compute_dtype=torch.float16,
                                                            bnb_4bit_use_double_quant=True),
                  'device_map': {'': 0}}
        self.model = AutoModelForCausalLM.from_pretrained(nome, **kw).eval()
        if not quant4:
            self.model = self.model.to('cuda' if torch.cuda.is_available() else 'cpu')
        self.yes = self.tok.convert_tokens_to_ids('yes')
        self.no = self.tok.convert_tokens_to_ids('no')
        self.pre = self.tok.encode(PREFIXO, add_special_tokens=False)
        self.suf = self.tok.encode(SUFIXO, add_special_tokens=False)
        self.max_corpo = max_tokens - len(self.pre) - len(self.suf)

    def pontuar(self, instr, consulta, docs):
        torch = self.torch
        corpos = [f'<Instruct>: {instr}\n<Query>: {consulta}\n<Document>: {d}' for d in docs]
        enc = self.tok(corpos, add_special_tokens=False, truncation='longest_first',
                       max_length=self.max_corpo, return_attention_mask=False)
        ids = [self.pre + x + self.suf for x in enc['input_ids']]
        batch = self.tok.pad({'input_ids': ids}, padding=True, return_tensors='pt').to(self.model.device)
        with torch.no_grad():
            logits = self.model(**batch).logits[:, -1, :]
            par = torch.stack([logits[:, self.no], logits[:, self.yes]], dim=1).float()
            return torch.log_softmax(par, dim=1)[:, 1].exp().cpu().tolist()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--modelo', default='Qwen/Qwen3-Reranker-4B')
    ap.add_argument('--top', type=int, default=20)
    ap.add_argument('--lote', type=int, default=2)
    ap.add_argument('--max-tokens', type=int, default=8192)
    ap.add_argument('--sem-4bit', action='store_true')
    ap.add_argument('--so-pares', action='store_true')
    ap.add_argument('--simular', action='store_true', help=argparse.SUPPRESS)  # teste do código sem modelo
    a = ap.parse_args()

    ix = R.Indice()
    if ix.Q is None:
        raise SystemExit('Faltam os vetores Qwen em indice/qwen/.')
    rows = ix.rows
    lab = collections.defaultdict(dict)
    for p in map(json.loads, (ROOT / 'base' / 'pares_desenvolvimento_compativeis.jsonl').open(encoding='utf-8')):
        lab[p['query_id']][p['candidate_id']] = p['human_grade']
    val = [d['id'] for d in ix.docs if d['split'] == 'validation']
    consultas = [q for q in val if q in lab] if a.so_pares else val
    base = {q: [i for i, _ in ix.ranking(q, 'rrf_qwen')] for q in consultas}
    texto = lambda i: bl.question_text(rows[i])

    nome = a.modelo.split('/')[-1] + ('' if a.sem_4bit else '-4bit')
    cache_f = ROOT / 'indice' / 'reranker_cache' / f'{nome}.jsonl'
    cache_f.parent.mkdir(parents=True, exist_ok=True)
    cache = {}
    if cache_f.exists():
        for l in cache_f.open(encoding='utf-8'):
            r = json.loads(l); cache[(r['i'], r['q'], r['c'])] = r['s']
    fazer = [(k, q, c) for k in INSTRUCOES for q in consultas for c in base[q][:a.top] if (k, q, c) not in cache]
    print(f'consultas: {len(consultas)} | top {a.top} | pares a pontuar: {len(fazer)} (em cache: {len(cache)})', flush=True)
    if fazer:
        if a.simular:
            rng = np.random.default_rng(0); rr = None
        else:
            print(f'carregando {a.modelo} (4 bits: {not a.sem_4bit})', flush=True)
            rr = Reranker(a.modelo, not a.sem_4bit, a.max_tokens)
        t0 = time.time()
        with cache_f.open('a', encoding='utf-8') as out:
            grupos = collections.defaultdict(list)
            for k, q, c in fazer: grupos[(k, q)].append(c)
            feitos = 0
            for (k, q), cs in grupos.items():
                for j in range(0, len(cs), a.lote):
                    lote = cs[j:j + a.lote]
                    sc = rng.random(len(lote)).tolist() if rr is None else rr.pontuar(INSTRUCOES[k], texto(q), [texto(c) for c in lote])
                    for c, s in zip(lote, sc):
                        cache[(k, q, c)] = s
                        out.write(json.dumps({'i': k, 'q': q, 'c': c, 's': s}) + '\n')
                    feitos += len(lote)
                out.flush()
                print(f'  {feitos}/{len(fazer)} pares | {time.time()-t0:.0f}s', flush=True)

    def reordenar(q, k, modo):
        top, resto = base[q][:a.top], base[q][a.top:]
        s = np.array([cache[(k, q, c)] for c in top])
        if modo == 'sozinho':
            o = np.argsort(-s, kind='stable')
        else:
            f = np.zeros(len(top)); f += 1 / (60 + np.arange(1, len(top) + 1))
            orr = np.argsort(-s, kind='stable'); f[orr] += 1 / (60 + np.arange(1, len(top) + 1))
            o = np.argsort(-f, kind='stable')
        return [top[j] for j in o] + resto

    def medir(rank):
        ok = tot = h = n = 0; n2 = []
        for q in consultas:
            r = rank(q); pos = {i: p for p, i in enumerate(r, 1)}
            sk = rows[q].get('skill')
            if sk is not None:
                for i in r[:5]: n += 1; h += rows[i].get('skill') == sk
            L = lab.get(q, {})
            for x in L:
                for y in L:
                    if L[x] > L[y]: tot += 1; ok += pos[x] < pos[y]
            n2 += [pos[x] for x, g in L.items() if g == 2]
        return ok, tot, (h / n if n else float('nan')), sorted(n2)

    linhas = [('rrf_qwen (candidato atual)', lambda q: base[q])]
    for k in INSTRUCOES:
        for modo in ('sozinho', 'rrf'):
            linhas.append((f'reranker {k}, {"só reranker" if modo=="sozinho" else "RRF com a ordem atual"}',
                           lambda q, k=k, modo=modo: reordenar(q, k, modo)))
    print(f"\n{'Método':48s} {'Pares certos':>14s} {'hab@5':>7s}  Posição das nota 2")
    for nome_l, f in linhas:
        ok, tot, h, n2 = medir(f)
        print(f'{nome_l:48s} {ok:>3d}/{tot} ({ok/tot:4.0%}) {h:>7.1%}  {n2}')
    print(f'\nReranker: {a.modelo} (4 bits: {not a.sem_4bit}), reordenando o top {a.top}. Referência: rrf_qwen = 39/44.')

if __name__ == '__main__':
    if hasattr(sys.stdout, 'reconfigure'): sys.stdout.reconfigure(encoding='utf-8')
    main()
