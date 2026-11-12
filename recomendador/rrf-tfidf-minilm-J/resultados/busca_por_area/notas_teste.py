import json, statistics as st
N = """D1.2 6|D1.1 5|D2.2 9|D2.1 9|D2.3 7|D3.1 6|D4.2 7|D4.1 6|D4.3 6|D5.1 8|D5.2 4|D6.2 6|D6.1 7|D7.2 4|D7.1 5|D8.1 7
D9.4 6|D9.1 6|D9.3 5|D9.2 5|D10.2 8|D10.3 4|D10.1 3|D11.3 8|D11.1 7|D11.2 7|D12.2 2|D12.1 4|D13.3 4|D13.2 3|D13.1 2
D14.3 4|D14.2 6|D14.1 3|D15.3 9|D15.2 6|D15.1 6|D16.3 8|D16.1 8|D16.2 7|D17.1 8|D17.2 8|D17.3 6|D18.1 7|D18.2 7
D19.2 5|D19.3 4|D19.1 4|D20.1 7"""
notas = {a: int(b) for a, b in (x.split() for l in N.split('\n') for x in l.split('|'))}
ch = json.load(open('chave_teste.json')); its = ch['itens']
assert {i['item'] for i in its if 'item' in i} == set(notas), set(notas) ^ {i['item'] for i in its if 'item' in i}
for i in its:
    if 'item' in i: i['nota_IA'] = notas[i['item']]
json.dump(ch, open('chave_teste.json', 'w'), ensure_ascii=False, indent=1)
A = {1:'MT',2:'MT',3:'CN',4:'CN',5:'CH',6:'CH',7:'LC',8:'LC'}
for b in range(9, 21): A[b] = ['MT','CN','CH','LC'][(b-9)//3]
def res(sel):
    o = {}
    for m in ('titulo', 'titulo_area'):
        x = [i for i in sel if i.get(m)]; n = [i['nota_IA'] for i in x]
        refs = {}
        for i in x: refs.setdefault(i['referencia'], []).append(i['nota_IA'])
        o[m] = dict(pares=len(n), media=round(st.mean(n), 2), media_1a=round(st.mean(i['nota_IA'] for i in x if i[m] == 1), 2),
                    pct_7mais=round(100*sum(v >= 7 for v in n)/len(n)), pct_menos5=round(100*sum(v < 5 for v in n)/len(n)),
                    refs_com_7mais=sum(max(v) >= 7 for v in refs.values()), refs=len(refs))
    return o
out = {'todas': res(its), 'refs_av6': res([i for i in its if i['bloco'] <= 8]), 'refs_novas': res([i for i in its if i['bloco'] > 8])}
for a in ('MT', 'CN', 'CH', 'LC'): out[a] = res([i for i in its if A[i['bloco']] == a])
g = {}
for i in its:
    for m in ('titulo', 'titulo_area'):
        if i.get(m): g.setdefault(i['bloco'], {}).setdefault(m, []).append(i['nota_IA'])
d = {b: round(st.mean(v['titulo_area']) - st.mean(v['titulo']), 2) for b, v in g.items()}
out['por_ref'] = dict(melhor=sum(x > 0.01 for x in d.values()), igual=sum(abs(x) <= 0.01 for x in d.values()), pior=sum(x < -0.01 for x in d.values()), diferencas=d)
out['trocas'] = dict(entraram=round(st.mean(i['nota_IA'] for i in its if i['titulo_area'] and not i['titulo']), 2), sairam=round(st.mean(i['nota_IA'] for i in its if i['titulo'] and not i['titulo_area']), 2), n=sum(1 for i in its if i['titulo_area'] and not i['titulo']))
out['iscas_media'] = round(st.mean(i['nota_IA'] for i in its if i.get('isca') and not i['titulo_area']), 2)
out['aviso'] = 'Notas da IA (autora do método), às cegas quanto ao método (novas misturadas com iscas). Referência anterior, sem filtro (rrf_qwen): média 6,21; 1ª posição 6,58.'
json.dump(out, open('resultado_teste_IA.json', 'w'), ensure_ascii=False, indent=1)
for k, v in out.items(): print(k, json.dumps(v, ensure_ascii=False))
