"""Gera a ordem do candidato com reranker (Qwen3-Reranker-4B, instrução em português, RRF com a
ordem do rrf_qwen, top 20) para uma lista de referências, para montar uma ficha cega.

Coloque em recomendador/rrf-tfidf-minilm-J/ junto com testar_reranker.py e rode:
    python reranquear_referencias.py
Gera resultados_reranker_referencias.json (mande esse arquivo de volta). Usa o mesmo cache do
testar_reranker.py. São 8 referências × 20 candidatas = 160 pares (poucos minutos).
"""
import json, sys, time
from pathlib import Path
import numpy as np
ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))
import recomendador as R, pipeline_baseline as bl
from testar_reranker import Reranker, INSTRUCOES

REFS = ["gq_64efa1ca93543d8cd3920a21", "gq_17661f478f83207f8750992f", "gq_fb83a591a7f133c53142b3f5", "gq_31c35fbf745c475caaecd64f", "gq_d93cca4cd211bdacba067786", "gq_0378c9443902a858bb8237d8", "gq_519b6c60c0caf9d62242442b", "gq_a8c9242936dbbe2c908e9ef9"]
TOP = 20

def main():
    simular = '--simular' in sys.argv
    ix = R.Indice()
    if ix.Q is None: raise SystemExit('Faltam os vetores Qwen em indice/qwen/.')
    nome = 'Qwen3-Reranker-4B-4bit'
    cache_f = ROOT / 'indice' / 'reranker_cache' / f'{nome}.jsonl'; cache_f.parent.mkdir(parents=True, exist_ok=True)
    cache = {}
    if cache_f.exists():
        for l in cache_f.open(encoding='utf-8'):
            r = json.loads(l); cache[(r['i'], r['q'], r['c'])] = r['s']
    texto = lambda i: bl.question_text(ix.rows[i])
    rr = None; rng = np.random.default_rng(0); t0 = time.time(); saida = {}
    for n, q in enumerate(REFS, 1):
        base = [i for i, _ in ix.ranking(q, 'rrf_qwen')][:TOP]
        faltam = [c for c in base if ('pt', q, c) not in cache]
        if faltam:
            if rr is None and not simular:
                print('carregando Qwen/Qwen3-Reranker-4B (4 bits)', flush=True)
                rr = Reranker('Qwen/Qwen3-Reranker-4B', True, 8192)
            with cache_f.open('a', encoding='utf-8') as out:
                for j in range(0, len(faltam), 2):
                    lote = faltam[j:j+2]
                    sc = rng.random(len(lote)).tolist() if simular else rr.pontuar(INSTRUCOES['pt'], texto(q), [texto(c) for c in lote])
                    for c, s in zip(lote, sc):
                        cache[('pt', q, c)] = s; out.write(json.dumps({'i': 'pt', 'q': q, 'c': c, 's': s}) + '\n')
        s = np.array([cache[('pt', q, c)] for c in base])
        f = 1 / (60 + np.arange(1, TOP + 1)); orr = np.argsort(-s, kind='stable'); f[orr] += 1 / (60 + np.arange(1, TOP + 1))
        ordem = [base[j] for j in np.argsort(-f, kind='stable')]
        saida[q] = {'rrf_qwen_top20': base, 'pontuacao_reranker': {c: round(cache[('pt', q, c)], 6) for c in base},
                    'reranker_pt_rrf_top20': ordem}
        print(f'{n}/{len(REFS)} referências | {time.time()-t0:.0f}s', flush=True)
    out = ROOT / 'resultados_reranker_referencias.json'
    out.write_text(json.dumps({'modelo': 'Qwen/Qwen3-Reranker-4B', '4bit': True, 'instrucao': INSTRUCOES['pt'],
                               'forma': 'RRF(k=60) entre a ordem rrf_qwen e a ordem do reranker, top 20',
                               'simulado': simular, 'referencias': saida}, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'pronto: {out}', flush=True)

if __name__ == '__main__':
    if hasattr(sys.stdout, 'reconfigure'): sys.stdout.reconfigure(encoding='utf-8')
    main()
