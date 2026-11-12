import sys, json, random, collections
from pathlib import Path
H = Path(__file__).parent; R = H.parents[1]; sys.path.insert(0, str(R))
import recomendador as rc, pipeline_baseline as bl
ix = rc.Indice()
usadas = set()
for f in ['chave_NAO_ABRIR.json', 'chave_confirmacao_NAO_ABRIR.json']:
    usadas |= set(json.load(open(R / 'resultados/assunto_primeiro' / f))['referencias'])
M = collections.defaultdict(list)
for i, r in ix.rot.items():
    if r.get('materia') and r['materia'] != 'Física' and not r.get('defeito') and i in ix.pos and i not in usadas: M[r['materia']].append(i)
rnd = random.Random('gabaritei-ap-todas-2026-11-11')
def top(r, novo):
    ix.assunto_primeiro = {ix.rot[r]['materia']} if novo else set()
    return [i for i, _ in ix.ranking(r, 'titulo_area', 'todas')][:5]
itens, txt, refs = [], {}, {}
for m in sorted(M):
    cont = collections.Counter(ix.rot[i]['no'] for i in M[m])
    cand = sorted(i for i in M[m] if cont[ix.rot[i]['no']] >= 2)
    rf = rnd.sample(cand, min(12, len(cand))); refs[m] = rf
    sig = ''.join(w[0] for w in m.split() if w[0].isupper())[:3]
    t = []
    for b, r in enumerate(rf, 1):
        A, N = top(r, False), top(r, True)
        if not A: continue
        allr = [i for i, _ in ix.ranking(r, 'titulo_area', 'todas')]
        uni = list(dict.fromkeys(A + N)); isca = [c for c in allr[8:] if c not in uni][:1]
        lote = uni + isca; rnd.shuffle(lote)
        t.append(f"\n=== {sig}{b} REF: {bl.clean(ix.rows[r]['question'])[-330:]}")
        for k, c in enumerate(lote, 1):
            itens.append(dict(item=f'{sig}{b}.{k}', materia=m, bloco=b, referencia=r, candidata=c,
                              atual=(A.index(c)+1) if c in A else None, novo=(N.index(c)+1) if c in N else None, isca=c in isca))
            t.append(f"- {sig}{b}.{k}: {bl.clean(ix.rows[c]['question'])[-210:]}")
    txt[m] = '\n'.join(t)
json.dump({'referencias': refs, 'itens': itens}, open(H / 'chave_NAO_ABRIR.json', 'w'), ensure_ascii=False, indent=1)
for m, t in txt.items(): open(f"/tmp/ap_{m.split()[0]}.txt", 'w').write(t)
c = collections.Counter(i['materia'] for i in itens)
print(c, sum(c.values()))
d = collections.Counter(i['materia'] for i in itens if (i['atual'] is None) != (i['novo'] is None)); print('diferem', d)
