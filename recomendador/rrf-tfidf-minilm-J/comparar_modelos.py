"""Compara MiniLM x Qwen3 (com e sem instrução), sozinhos e em RRF com o TF-IDF, na validação.

Rode depois de gerar_vetores_qwen.py, na mesma pasta. Usa os 45 pares com nota de
base/pares_desenvolvimento_compativeis.jsonl e as mesmas regras do recomendador oficial.
"""
import collections, json, sys
from pathlib import Path
import numpy as np
ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))
import recomendador as R

ix = R.Indice(); docs = ix.docs; X = ix.X
Q = ROOT / 'indice' / 'qwen'
assert json.loads((Q / 'ids.json').read_text()) == [d['id'] for d in docs], 'ordem dos vetores não bate'
VET = {'MiniLM (atual)': ix.M}
for f in sorted(Q.glob('*.npy')):
    VET[f.stem.replace('__', ' · ')] = np.load(f)

lab = collections.defaultdict(dict)
for p in map(json.loads, (ROOT / 'base' / 'pares_desenvolvimento_compativeis.jsonl').open(encoding='utf-8')):
    lab[p['query_id']][p['candidate_id']] = p['human_grade']
val = [d['id'] for d in docs if d['split'] == 'validation']

def ranking(qid, sem, usar_tfidf):
    qi = ix.pos[qid]; q = docs[qi]
    pool = np.array([k for k, d in enumerate(docs) if d['split'] == 'train' and d['area'] == q['area'] and d['family'] != q['family']])
    s_sem = sem[pool] @ sem[qi]
    if usar_tfidf:
        s_tf = (X[pool] @ X[qi].T).toarray().ravel(); s = np.zeros(len(pool))
        for v in (s_tf, s_sem):
            o = np.argsort(-v, kind='stable'); s[o] += 1 / (60 + np.arange(1, len(v) + 1))
    else:
        s = s_sem
    seen, out = set(), []
    for j in np.argsort(-s, kind='stable'):
        d = docs[pool[j]]
        if d['family'] not in seen: seen.add(d['family']); out.append(d['id'])
    return out

def medir(sem, usar_tfidf):
    ok = tot = 0; sk = ns = 0; n2 = []
    for qid in val:
        r = ranking(qid, sem, usar_tfidf); pos = {i: k for k, i in enumerate(r, 1)}
        skq = ix.rows[qid].get('skill')
        if skq is not None:
            for i in r[:3]: ns += 1; sk += ix.rows[i].get('skill') == skq
        L = lab.get(qid, {})
        for a in L:
            for b in L:
                if L[a] > L[b]: tot += 1; ok += pos[a] < pos[b]
        n2 += [pos[a] for a, g in L.items() if g == 2]
    return ok, tot, sk / ns, sorted(n2)

print(f"{'Método':48s} {'Pares certos':>14s} {'Mesma hab@3':>12s}  Posição das nota 2")
for nome, M in VET.items():
    for tf in (False, True):
        ok, tot, h, n2 = medir(M, tf)
        rot = ('RRF TF-IDF + ' if tf else '') + nome
        print(f'{rot:48s} {ok:>3d}/{tot} ({ok/tot:4.0%}) {h:>11.1%}  {n2}')
print('\nReferência: RRF TF-IDF + MiniLM = 34/44 (77%); sorteio ≈ 52%.')
