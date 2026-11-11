"""Teste 3 (piloto CN): ordem dentro do título pelas fichas 'o que a questão cobra' (conceito | tarefa).
Variantes: F = só ficha; F+Q = RRF de ficha e Qwen. Escolha pela validação (mesmo assunto nas 3 primeiras,
consultas de treino/validação, galeria treino), depois top 3 nas 12 refs de Natureza (galeria todas)."""
import sys, json
from pathlib import Path
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
H = Path(__file__).parent; R = H.parents[1]; sys.path.insert(0, str(R))
import recomendador as rc
ix = rc.Indice(); K = ix.conf['rrf_k']
ids = json.load(open(H / 'cn_ids.json'))['ids']
fic = {ids[int(k)]: (c, t) for k, c, t in (l.rstrip('\n').split('|') for l in open(H / 'fichas_cn.txt', encoding='utf-8'))}
pos = {i: n for n, i in enumerate(ids)}
vc = TfidfVectorizer(sublinear_tf=True, strip_accents='unicode', ngram_range=(1, 2)).fit([fic[i][0] for i in ids])
vt = TfidfVectorizer(sublinear_tf=True, strip_accents='unicode', ngram_range=(1, 2)).fit([fic[i][1] for i in ids])
C = vc.transform([fic[i][0] for i in ids]); T = vt.transform([fic[i][1] for i in ids])
def sim_f(q, cands):
    a = pos[q]; b = [pos[c] for c in cands]
    return 0.75 * (C[b] @ C[a].T).toarray().ravel() + 0.25 * (T[b] @ T[a].T).toarray().ravel()
def rrf(*vs):
    s = np.zeros(len(vs[0]))
    for v in vs:
        o = np.argsort(-v, kind='stable'); s[o] += 1 / (K + np.arange(1, len(v) + 1))
    return s
def ordem(q, metodo, galeria):
    base = [i for i, _ in ix.ranking(q, 'titulo_area', galeria)]
    if metodo == 'titulo_area' or not base: return base
    f = sim_f(q, base)
    if metodo == 'F': s = f + 1e-6 * rrf(-np.arange(len(base)))
    else: s = rrf(f, -np.arange(len(base), dtype=float))
    return [base[j] for j in np.argsort(-s, kind='stable')]
if __name__ == '__main__':
    out = {}
    cons = [i for i in ids if ix.docs[ix.pos[i]]['split'] in ('train', 'validation')]
    for m in ('titulo_area', 'F', 'F+Q'):
        v = []
        for q in cons:
            L = ordem(q, m, 'treino')
            if len(L) >= 4 and any(ix.rot[c]['no'] == ix.rot[q]['no'] for c in L):
                v.append(np.mean([ix.rot[c]['no'] == ix.rot[q]['no'] for c in L[:3]]))
        out[m] = (round(100 * np.mean(v), 1), len(v))
    print('validação, mesmo assunto nas 3 primeiras (%):', out)
    json.dump(out, open(H / 'validacao_fichas.json', 'w'))
