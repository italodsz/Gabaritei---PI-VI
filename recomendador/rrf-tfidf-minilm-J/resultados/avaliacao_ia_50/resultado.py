"""Abre a chave só depois das notas (notas_IA.txt, hash em notas_IA.sha256) e compara os métodos."""
import json, statistics as st, random
notas = {a: int(b) for l in open('notas_IA.txt') for a, b in (x.split() for x in l.strip().split('|'))}
ch = json.load(open('chave_NAO_ABRIR.json')); its = ch['itens']
assert set(notas) == {i['item'] for i in its}, set(notas) ^ {i['item'] for i in its}
for i in its: i['nota_IA'] = notas[i['item']]
M = {'anterior': 'titulo (filtro de título, ordem rrf_qwen)', 'novo': 'titulo_area (receita por matéria)'}
def res(sel):
    o = {}
    for m in M:
        x = [i for i in sel if i[m]]; n = [i['nota_IA'] for i in x]
        refs = {}
        for i in x: refs.setdefault(i['bloco'], []).append(i['nota_IA'])
        o[m] = dict(pares=len(n), media=round(st.mean(n), 2), media_1a=round(st.mean(i['nota_IA'] for i in x if i[m] == 1), 2),
                    pct_7mais=round(100 * sum(v >= 7 for v in n) / len(n)), pct_menos5=round(100 * sum(v < 5 for v in n) / len(n)),
                    refs_com_7mais=sum(max(v) >= 7 for v in refs.values()), refs=len(refs))
    return o
out = {'avaliador': 'IA (Claude), às cegas quanto ao método; a mesma IA construiu os dois métodos', 'metodos': M,
       'todas': res(its), **{a: res([i for i in its if i['area'] == a]) for a in ('MT', 'CN', 'CH', 'LC')}}
dif = {}
for b in sorted({i['bloco'] for i in its}):
    x = [i for i in its if i['bloco'] == b]
    dif[b] = st.mean(i['nota_IA'] for i in x if i['novo']) - st.mean(i['nota_IA'] for i in x if i['anterior'])
out['por_referencia'] = dict(novo_melhor=sum(v > 0.01 for v in dif.values()), igual=sum(abs(v) <= 0.01 for v in dif.values()), novo_pior=sum(v < -0.01 for v in dif.values()))
d = list(dif.values()); m0 = st.mean(d); rnd = random.Random(1)
boot = sorted(st.mean(rnd.choices(d, k=len(d))) for _ in range(5000))
out['diferenca_media_por_ref'] = dict(valor=round(m0, 2), ic95=[round(boot[125], 2), round(boot[4874], 2)])
so_n = [i['nota_IA'] for i in its if i['novo'] and not i['anterior']]; so_a = [i['nota_IA'] for i in its if i['anterior'] and not i['novo']]
out['trocas'] = dict(n=len(so_n), media_entraram=round(st.mean(so_n), 2), media_sairam=round(st.mean(so_a), 2))
mat = {}
for i in its:
    for m in M:
        if i[m]: mat.setdefault(i['materia'], {}).setdefault(m, []).append(i['nota_IA'])
out['por_materia'] = {k: {m: round(st.mean(v[m]), 2) for m in M} | {'pares': len(v['novo'])} for k, v in sorted(mat.items())}
json.dump(ch, open('chave_com_notas.json', 'w'), ensure_ascii=False, indent=1)
json.dump(out, open('resultado_IA.json', 'w'), ensure_ascii=False, indent=1)
print(json.dumps(out, ensure_ascii=False, indent=1))
