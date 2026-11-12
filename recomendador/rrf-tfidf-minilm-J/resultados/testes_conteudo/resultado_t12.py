import json, statistics as st, random
notas = {a: int(b) for l in open('notas_t12_IA.txt') for a, b in (x.split() for x in l.strip().split('|'))}
ch = json.load(open('chave_t12_NAO_ABRIR.json')); its = ch['itens']
assert set(notas) == {i['item'] for i in its if 'item' in i}
for i in its:
    if 'item' in i: i['nota_IA'] = notas[i['item']]
assert all(i['nota_IA'] is not None for i in its if i['titulo_area'] or i['t1'] or i['t2'])
M = ('titulo_area', 't1', 't2')
def res(sel):
    o = {}
    for m in M:
        x = [i for i in sel if i[m]]; n = [i['nota_IA'] for i in x]
        o[m] = dict(pares=len(n), media=round(st.mean(n), 2), media_1a=round(st.mean(i['nota_IA'] for i in x if i[m] == 1), 2),
                    pct_7mais=round(100 * sum(v >= 7 for v in n) / len(n)), pct_menos5=round(100 * sum(v < 5 for v in n) / len(n)))
    return o
def comp(m):
    d = []
    for b in sorted({i['bloco'] for i in its}):
        x = [i for i in its if i['bloco'] == b]
        d.append(st.mean(i['nota_IA'] for i in x if i[m]) - st.mean(i['nota_IA'] for i in x if i['titulo_area']))
    rnd = random.Random(1); bt = sorted(st.mean(rnd.choices(d, k=len(d))) for _ in range(5000))
    return dict(melhor=sum(v > .01 for v in d), igual=sum(abs(v) <= .01 for v in d), pior=sum(v < -.01 for v in d), dif=round(st.mean(d), 2), ic95=[round(bt[125], 2), round(bt[4874], 2)])
out = {'todas': res(its), **{a: res([i for i in its if i['area'] == a]) for a in ('MT', 'CN', 'CH', 'LC')},
       't1_vs_titulo_area': comp('t1'), 't2_vs_titulo_area': comp('t2'),
       'iscas_media': round(st.mean(i['nota_IA'] for i in its if i['isca'] and not (i['t1'] or i['t2'] or i['titulo_area'])), 2)}
json.dump(ch, open('chave_t12_com_notas.json', 'w'), ensure_ascii=False, indent=1)
json.dump(out, open('resultado_t12_IA.json', 'w'), ensure_ascii=False, indent=1)
for k, v in out.items(): print(k, json.dumps(v, ensure_ascii=False))
