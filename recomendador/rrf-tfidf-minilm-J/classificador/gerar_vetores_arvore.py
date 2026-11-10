"""Gera os vetores Qwen usados pelo classificador da árvore curricular (roda na GPU).

Rode de dentro de recomendador/rrf-tfidf-minilm-J/:
    python classificador/gerar_vetores_arvore.py --quantizar-4bit

Gera em classificador/vetores/:
    <modelo>__assuntos.npy     um vetor por assunto da árvore (texto do assunto, sem instrução)
    <modelo>__questoes.npy     um vetor por questão, com instrução de classificação curricular
    <modelo>__config.json      modelo, instrução, ordem das linhas e hash da árvore

Tempo esperado na RTX 4060 Ti 8 GB: uns 7 minutos (as questões dominam; os 319 assuntos levam segundos).
"""
import argparse, hashlib, json, sys, time
from pathlib import Path
import numpy as np

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent
sys.path.insert(0, str(RAIZ))
import pipeline_baseline as bl

INSTRUCAO = ('Instruct: Dada uma questão do ENEM, identifique o assunto do currículo do ensino médio '
             'que o aluno precisa dominar para responder, ignorando o cenário, o autor e o gênero do texto\nQuery: ')


def texto_no(n):
    partes = [f"{n['disciplina_nome']} › {n['grande_tema_nome']} › {n['assunto']}", n['descricao']]
    if n.get('fronteira'):
        partes.append(n['fronteira'])
    return '. '.join(p.rstrip('.') for p in partes) + '.'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--modelo', default='Qwen/Qwen3-Embedding-8B')
    ap.add_argument('--lote', type=int, default=4)
    ap.add_argument('--max-tokens', type=int, default=8192)
    ap.add_argument('--quantizar-4bit', action='store_true')
    ap.add_argument('--arvore', default=str(AQUI / 'dados' / 'arvore_v1.2.json'))
    a = ap.parse_args()

    import torch
    from sentence_transformers import SentenceTransformer
    dev = 'cuda' if torch.cuda.is_available() else 'mps' if torch.backends.mps.is_available() else 'cpu'
    print(f'dispositivo: {dev}', flush=True)
    mk = {'torch_dtype': torch.float16 if dev != 'cpu' else torch.float32}
    if a.quantizar_4bit:
        if dev != 'cuda':
            raise SystemExit('--quantizar-4bit exige placa NVIDIA (CUDA).')
        from transformers import BitsAndBytesConfig
        mk = {'quantization_config': BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type='nf4',
                                                        bnb_4bit_compute_dtype=torch.float16,
                                                        bnb_4bit_use_double_quant=True),
              'device_map': {'': 0}}
    model = SentenceTransformer(a.modelo, device=None if a.quantizar_4bit else dev,
                                model_kwargs=mk, tokenizer_kwargs={'padding_side': 'left'})
    model.max_seq_length = a.max_tokens

    arv_bytes = Path(a.arvore).read_bytes()
    nos = json.loads(arv_bytes)['nos']
    ids = json.loads((RAIZ / 'indice' / 'documentos.json').read_text())
    ids = [d['id'] for d in ids]
    rows = {q['id']: q for q in map(json.loads, (RAIZ / 'base' / 'questions.jsonl').open(encoding='utf-8'))}
    textos = [bl.question_text(rows[i]) for i in ids]

    out = AQUI / 'vetores'; out.mkdir(exist_ok=True)
    nome = a.modelo.split('/')[-1] + ('-4bit' if a.quantizar_4bit else '')

    t0 = time.time()
    N = model.encode([texto_no(n) for n in nos], batch_size=8, normalize_embeddings=True,
                     show_progress_bar=True, convert_to_numpy=True)
    np.save(out / f'{nome}__assuntos.npy', N.astype(np.float32))
    print(f'assuntos: {N.shape} em {time.time()-t0:.0f}s', flush=True)

    t0 = time.time()
    ordem = np.argsort([-len(t) for t in textos])
    E = model.encode([textos[i] for i in ordem], prompt=INSTRUCAO, batch_size=a.lote,
                     normalize_embeddings=True, show_progress_bar=True, convert_to_numpy=True)
    M = np.zeros_like(E); M[ordem] = E
    np.save(out / f'{nome}__questoes.npy', M.astype(np.float32))
    print(f'questões: {M.shape} em {time.time()-t0:.0f}s', flush=True)

    meta = {'modelo': a.modelo, 'quantizado_4bit': a.quantizar_4bit, 'instrucao_questoes': INSTRUCAO,
            'texto_assunto': 'disciplina › grande tema › assunto. descrição. fronteira.',
            'ids_questoes': ids, 'ids_assuntos': [n['id'] for n in nos],
            'arvore_sha256': hashlib.sha256(arv_bytes).hexdigest()}
    (out / f'{nome}__config.json').write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding='utf-8')
    print('pronto. Agora rode: python classificador/classificar.py', flush=True)


if __name__ == '__main__':
    main()
