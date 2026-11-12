"""Validação (treino+validação, sem teste): época em História e escala em Geografia, como bônus sobre o 'só sentido'.
Medida: mesmo assunto da árvore nas 3 primeiras, como em resultados/busca_por_area/validar.py."""
import sys, json, runpy, collections
from pathlib import Path
import numpy as np
sys.argv = ['x']
g = runpy.run_path(str(Path(__file__).parents[1] / 'busca_por_area' / 'validar.py'))
ix, K, cons, dados, rot, rrf = (g[k] for k in ('ix', 'K', 'cons', 'dados', 'rot', 'rrf'))
def top3(qi, peca=None, w=0.0):
    d = dados(qi)
    if d is None or not d[5].any(): return None
    pool, tf, qw, base, pc, mesmo = d
    s = rrf([qw], [1.0])
    if peca and pc[peca].any():
        o = np.lexsort((-qw, -pc[peca])); s = s.copy(); s[o] += w / (K + np.arange(1, len(qw) + 1))
    return mesmo[np.argsort(-s, kind='stable')[:3]].mean()
out = {}
for m, peca in (('História', 'epoca'), ('Geografia', 'escala')):
    q = [qi for qi in cons if rot(qi)['materia'] == m]
    r = collections.defaultdict(list); por_tit = collections.defaultdict(lambda: collections.defaultdict(list))
    for qi in q:
        for nome, w in (('so_sentido', 0), ('w0.5', .5), ('w1', 1), ('w2', 2)):
            t = top3(qi, peca if w else None, w)
            if t is not None: r[nome].append(t); por_tit[rot(qi)['titulo']][nome].append(t)
    out[m] = {'n': len(r['so_sentido']), **{k: round(100 * np.mean(v), 1) for k, v in r.items()},
              'por_titulo': {t: {'n': len(v['so_sentido']), **{k: round(100 * np.mean(x), 1) for k, x in v.items()}} for t, v in por_tit.items()}}
    print(m, {k: v for k, v in out[m].items() if k != 'por_titulo'})
    for t, v in out[m]['por_titulo'].items(): print('   ', t[:45].ljust(45), v)
json.dump(out, open(Path(__file__).parent / 'validacao.json', 'w'), ensure_ascii=False, indent=1)
