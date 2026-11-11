"""Mesma medida do validar.py (mesmo assunto nas 3 primeiras, sem teste), variando o peso
entre palavras (TF-IDF) e sentido (Qwen) e somando peças ao Qwen puro."""
import sys, json, collections, runpy
from pathlib import Path
import numpy as np
sys.argv = ['x']
g = runpy.run_path(str(Path(__file__).parent / 'validar.py'))
ix, S, K, cons, dados, rot, rrf, sinais = (g[k] for k in ('ix', 'S', 'K', 'cons', 'dados', 'rot', 'rrf', 'sinais'))
def top3(qi, wt, wq, pecas=(), wp=1.0, n=3):
    d = dados(qi)
    if d is None or not d[5].any(): return None
    pool, tf, qw, base, pc, mesmo = d
    if wt == 0: b = qw.copy(); s = rrf([qw], [1.0])
    else: s = rrf([tf, qw], [wt, wq]); b = s
    for p in pecas:
        v = pc[p]
        if v.any():
            o = np.lexsort((-b, -v)); s = s.copy(); s[o] += wp / (K + np.arange(1, len(v) + 1))
    return mesmo[np.argsort(-s, kind='stable')[:n]].mean()
cfgs = {'rrf 1:1 (atual)': (1, 1), 'rrf 1:2': (1, 2), 'rrf 1:4': (1, 4), 'só qwen': (0, 1), 'só tfidf': (1, 0),
        'qwen+comando 0.5': (0, 1, ('comando',), .5), 'qwen+nomes 0.5': (0, 1, ('nomes',), .5), 'qwen+nomes 1': (0, 1, ('nomes',), 1),
        'qwen+formato 0.5': (0, 1, ('formato',), .5), 'qwen+genero 0.5': (0, 1, ('genero',), .5), '1:2+nomes 1': (1, 2, ('nomes',), 1)}
res = collections.defaultdict(lambda: collections.defaultdict(list))
for qi in cons:
    m = rot(qi)['materia']
    for nome, c in cfgs.items():
        t = top3(qi, *c)
        if t is not None: res[m][nome].append(t); res['TODAS'][nome].append(t)
out = {}
print('\n=== mesmo assunto nas 3 primeiras (%), diferença p/ atual ===')
for m in sorted(res):
    b = np.array(res[m]['rrf 1:1 (atual)'])
    out[m] = {'n': len(b), 'atual': round(100 * b.mean(), 1), **{k: round(100 * (np.mean(v) - b.mean()), 1) for k, v in res[m].items() if k != 'rrf 1:1 (atual)'}}
    print(m, json.dumps(out[m], ensure_ascii=False))
json.dump(out, open(Path(__file__).parent / 'validacao_pesos.json', 'w'), ensure_ascii=False, indent=1)
