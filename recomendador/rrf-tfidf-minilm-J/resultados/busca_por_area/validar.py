"""Liga uma peça por vez dentro do título e mede, SEM usar o teste.
Consultas: questões de treino e validação com título; galeria: treino (menos a própria família).
Medida: das 3 primeiras sugestões, quantas são do mesmo assunto da árvore v1.2 (proxy de conceito)."""
import sys, json, collections, itertools
from pathlib import Path
import numpy as np
R = Path(__file__).resolve().parents[2]; sys.path.insert(0, str(R))
import recomendador as rc, sinais
ix = rc.Indice(); S = sinais.Sinais(ix); K = ix.conf['rrf_k']
rot = lambda k: ix.rot.get(ix.docs[k]['id'], {})
cons = [k for k, d in enumerate(ix.docs) if d['split'] in ('train', 'validation') and rot(k).get('titulo') and not rot(k).get('defeito')]
grupos = collections.defaultdict(list)
for k, d in enumerate(ix.docs):
    r = rot(k)
    if d['split'] == 'train' and r.get('titulo') and ix._serve(ix.docs[k], d): grupos[(r['materia'], r['titulo'])].append(k)
def rrf(listas, pesos):
    s = np.zeros(len(listas[0]))
    for v, w in zip(listas, pesos):
        o = np.argsort(-v, kind='stable'); s[o] += w / (K + np.arange(1, len(v) + 1))
    return s
cache = {}
def dados(qi):
    if qi not in cache:
        q = ix.docs[qi]; r = rot(qi)
        pool = np.array([j for j in grupos[(r['materia'], r['titulo'])] if ix.docs[j]['family'] != q['family'] and ix._serve(q, ix.docs[j])])
        if len(pool) < 4: cache[qi] = None
        else:
            tf = (ix.X[pool] @ ix.X[qi].T).toarray().ravel(); qw = ix.Q[pool] @ ix.Q[qi]
            base = rrf([tf, qw], [1, 1])
            pc = {p: S.escore(p, qi, pool) for p in sinais.PECAS}
            mesmo = np.array([rot(j)['no'] == r['no'] for j in pool])
            cache[qi] = (pool, tf, qw, base, pc, mesmo)
    return cache[qi]
def top3(qi, pecas, w=1.0):
    d = dados(qi)
    if d is None: return None
    pool, tf, qw, base, pc, mesmo = d
    s = base.copy()
    for p in pecas:
        v = pc[p]
        if not v.any(): continue
        o = np.lexsort((-base, -v)); s[o] += w / (K + np.arange(1, len(v) + 1))
    o = np.argsort(-s, kind='stable')[:3]
    return mesmo[o].mean(), mesmo.any()
configs = [()] + [(p,) for p in sinais.PECAS]
res = collections.defaultdict(lambda: collections.defaultdict(list))
for qi in cons:
    m = rot(qi)['materia']
    for c in configs:
        for w in (1.0, 2.0):
            if not c and w != 1.0: continue
            t = top3(qi, c, w)
            if t and t[1]:
                res[m][(c, w)].append(t[0]); res['TODAS'][(c, w)].append(t[0])
out = {}
for m in sorted(res):
    b = np.mean(res[m][((), 1.0)]); n = len(res[m][((), 1.0)])
    linha = {'n': n, 'base': round(100 * b, 1)}
    for (c, w), v in res[m].items():
        if c:
            dif = np.array(v) - np.array(res[m][((), 1.0)])
            linha[f'{c[0]}_w{int(w)}'] = [round(100 * (np.mean(v) - b), 1), round(float(dif.mean() / (dif.std() / np.sqrt(n) + 1e-9)), 1)]
    out[m] = linha
    print(m, json.dumps(linha, ensure_ascii=False))
json.dump(out, open(Path(__file__).parent / 'validacao_pecas.json', 'w'), ensure_ascii=False, indent=1)
