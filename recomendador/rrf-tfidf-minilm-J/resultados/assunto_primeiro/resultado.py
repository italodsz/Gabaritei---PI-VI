import json, re, random, collections
import numpy as np
from pathlib import Path
H = Path(__file__).parent
n = dict((k, int(v)) for k, v in re.findall(r'(F[\d.]+) (\d+)', open(H/'notas_IA.txt').read()))
ch = json.load(open(H/'chave_NAO_ABRIR.json'))
for i in ch['itens']: i['nota_IA'] = n[i['item']]
json.dump(ch, open(H/'chave_com_notas.json','w'), ensure_ascii=False, indent=1)
A, N, A1, N1, iscas = [], [], [], [], []
for b in range(1, 25):
    it = [i for i in ch['itens'] if i['bloco'] == b]
    a = [i['nota_IA'] for i in it if i['atual']]; m = [i['nota_IA'] for i in it if i['novo']]
    A.append(np.mean(a)); N.append(np.mean(m))
    A1 += [i['nota_IA'] for i in it if i['atual'] == 1]; N1 += [i['nota_IA'] for i in it if i['novo'] == 1]
    iscas += [i['nota_IA'] for i in it if i['isca']]
A, N = np.array(A), np.array(N); d = N - A
rnd = np.random.default_rng(20261111); bs = [d[rnd.integers(0, 24, 24)].mean() for _ in range(10000)]
lo, hi = np.percentile(bs, [2.5, 97.5])
allA = [i['nota_IA'] for i in ch['itens'] if i['atual']]; allN = [i['nota_IA'] for i in ch['itens'] if i['novo']]
r = dict(media_atual=round(A.mean(),2), media_novo=round(N.mean(),2), diferenca=round(d.mean(),2), ic95=[round(lo,2),round(hi,2)],
         primeira_atual=round(np.mean(A1),2), primeira_novo=round(np.mean(N1),2),
         abaixo5_atual=round(np.mean(np.array(allA)<5)*100), abaixo5_novo=round(np.mean(np.array(allN)<5)*100),
         ge7_atual=round(np.mean(np.array(allA)>=7)*100), ge7_novo=round(np.mean(np.array(allN)>=7)*100),
         isca_media=round(np.mean(iscas),2), blocos_melhor=int((d>0).sum()), blocos_pior=int((d<0).sum()), blocos_igual=int((d==0).sum()),
         adota=bool(d.mean() >= 0.3 and lo > 0), por_bloco=[round(x,2) for x in d])
json.dump(r, open(H/'resultado_IA.json','w'), ensure_ascii=False, indent=1); print(json.dumps(r, ensure_ascii=False))
