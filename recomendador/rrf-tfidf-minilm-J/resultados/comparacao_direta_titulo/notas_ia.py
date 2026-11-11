import json, statistics as st
N = """C1.3 5|C2.1 8|C2.4 8|C2.5 7|C3.2 5|C3.3 7|C5.2 6|C5.5 5|C6.1 7|C6.4 8|C7.1 5|C7.5 6|C7.6 6|C8.4 7|C8.5 8
C9.1 9|C9.2 6|C9.3 7|C9.4 5|C10.1 4|C10.2 9|C10.3 7|C10.4 4|C10.5 5|C10.6 2|C11.1 5|C11.2 7|C11.3 5|C11.4 6|C11.5 5
C12.1 4|C12.2 6|C12.3 3|C12.4 8|C12.5 2|C13.1 3|C13.2 6|C13.3 4|C13.4 8|C13.5 9|C13.6 2|C14.1 4|C14.2 3|C14.3 4|C14.4 6|C14.5 9
C15.1 9|C15.2 8|C15.3 5|C15.4 6|C16.1 8|C16.2 8|C16.3 7|C16.4 3|C16.5 8|C17.1 7|C17.2 8|C17.3 6|C17.4 6
C18.1 7|C18.2 7|C18.3 7|C18.4 4|C19.1 5|C19.2 4|C19.3 3|C19.4 4|C19.5 6|C19.6 3|C20.1 7|C20.2 8|C20.3 5|C20.4 8|C20.5 7"""
notas = {a: int(b) for a, b in (x.split() for l in N.split('\n') for x in l.split('|'))}
ch = json.load(open('chave.json'))
its = ch['itens']
falt = [i['item'] for i in its if i.get('nota_IA') is None and i['item'] not in notas]
sobra = [k for k in notas if k not in {i['item'] for i in its if i.get('nota_IA') is None}]
print('faltam', falt, 'sobram', sobra, 'n', len(notas))
for i in its:
    if i.get('nota_IA') is None:
        i['nota_IA'] = notas[i['item']]; i['nota_nova'] = True
json.dump(ch, open('chave.json', 'w'), ensure_ascii=False, indent=1)
print(json.dumps(its[0], ensure_ascii=False)); print(ch.keys())
def res(sel):
    o = {}
    for m in ('sem_filtro', 'titulo'):
        x = [i for i in sel if i.get(m)]
        n = [i['nota_IA'] for i in x]
        p1 = [i['nota_IA'] for i in x if i[m] == 1]
        refs = {}
        for i in x: refs.setdefault(i['referencia'], []).append(i['nota_IA'])
        o[m] = dict(pares=len(n), media=round(st.mean(n), 2), media_1a=round(st.mean(p1), 2),
                    pct_7mais=round(100*sum(v >= 7 for v in n)/len(n)), pct_menos5=round(100*sum(v < 5 for v in n)/len(n)),
                    refs_com_7mais=sum(max(v) >= 7 for v in refs.values()), refs=len(refs))
    return o
bl = lambda i: int(i['item'][1:].split('.')[0])
out = {'todas': res(its), 'refs_av6': res([i for i in its if bl(i) <= 8]), 'refs_novas': res([i for i in its if bl(i) > 8])}
amb = [i for i in its if i.get('sem_filtro') and i.get('titulo')]
out['pares_em_comum'] = len(amb)
out['so_sem_filtro_media'] = round(st.mean([i['nota_IA'] for i in its if i.get('sem_filtro') and not i.get('titulo')]), 2)
out['so_titulo_media'] = round(st.mean([i['nota_IA'] for i in its if i.get('titulo') and not i.get('sem_filtro')]), 2)
# por referencia
g = {}
for i in its:
    for m in ('sem_filtro', 'titulo'):
        if i.get(m): g.setdefault(i['referencia'], {}).setdefault(m, []).append(i['nota_IA'])
d = [st.mean(v['titulo']) - st.mean(v['sem_filtro']) for v in g.values() if 'titulo' in v and 'sem_filtro' in v]
out['por_ref'] = dict(titulo_melhor=sum(x > 0.01 for x in d), igual=sum(abs(x) <= 0.01 for x in d), pior=sum(x < -0.01 for x in d), n=len(d), sem_titulo=[r for r, v in g.items() if 'titulo' not in v])
out['aviso'] = 'Notas dadas por IA (autora do metodo), as cegas quanto ao metodo; pares da avaliacao 6 reaproveitam a nota IA anterior.'
json.dump(out, open('resultado_IA.json', 'w'), ensure_ascii=False, indent=1)
print(json.dumps(out, ensure_ascii=False, indent=1))
