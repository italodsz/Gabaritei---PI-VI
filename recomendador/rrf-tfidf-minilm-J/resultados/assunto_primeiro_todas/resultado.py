import json, re, sys, collections
import numpy as np
from pathlib import Path
H = Path(__file__).parent; sys.path.insert(0, str(H.parents[1])); import recomendador as rc
ix = rc.Indice()
n = {k: int(v) for k, v in re.findall(r'([A-Z]+[\d.]+) (\d+)', open(H/'notas_IA.txt').read())}
ch = json.load(open(H/'chave_NAO_ABRIR.json'))
for i in ch['itens']: i['nota_IA'] = n.get(i['item'])
json.dump(ch, open(H/'chave_com_notas.json','w'), ensure_ascii=False, indent=1)
B = collections.defaultdict(list)
for i in ch['itens']: B[(i['materia'], i['bloco'])].append(i)
out = {}
for m in sorted({k[0] for k in B}):
    d, tit, iscas, sohN, sohA = [], collections.defaultdict(list), [], [], []
    for (mm, b), L in B.items():
        if mm != m: continue
        so_n = [i['nota_IA'] for i in L if i['novo'] and not i['atual']]
        so_a = [i['nota_IA'] for i in L if i['atual'] and not i['novo']]
        x = (sum(so_n) - sum(so_a)) / 5; d.append(x); sohN += so_n; sohA += so_a
        tit[ix.rot[L[0]['referencia']]['titulo']].append(round(x, 2))
        iscas += [i['nota_IA'] for i in L if i['isca'] and i['nota_IA'] is not None]
    d = np.array(d); g = np.random.default_rng(20261111)
    bs = [d[g.integers(0, len(d), len(d))].mean() for _ in range(10000)]; lo, hi = np.percentile(bs, [2.5, 97.5])
    dec = 'liga' if d.mean() >= 0.3 and lo > 0 else ('inconclusivo' if d.mean() > 0 else 'não liga (piora ou empata)')
    out[m] = dict(refs=len(d), diferenca=round(d.mean(), 2), ic95=[round(lo, 2), round(hi, 2)], melhor=int((d > 0).sum()),
                  pior=int((d < 0).sum()), igual=int((d == 0).sum()), media_so_novo=round(np.mean(sohN), 2) if sohN else None,
                  media_so_atual=round(np.mean(sohA), 2) if sohA else None, isca=round(np.mean(iscas), 2) if iscas else None,
                  decisao=dec, por_titulo={t: [round(np.mean(v), 2), v] for t, v in tit.items()})
json.dump(out, open(H/'resultado_IA.json', 'w'), ensure_ascii=False, indent=1)
for m, r in out.items(): print(f"{m[:28]:28s} n={r['refs']:2d} dif={r['diferenca']:+.2f} IC=[{r['ic95'][0]:+.2f},{r['ic95'][1]:+.2f}] +{r['melhor']}/-{r['pior']}/={r['igual']} soN={r['media_so_novo']} soA={r['media_so_atual']} isca={r['isca']} -> {r['decisao']}")
