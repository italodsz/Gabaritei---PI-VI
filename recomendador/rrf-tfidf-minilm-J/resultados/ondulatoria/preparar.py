"""Ondulatória e óptica (11/11/2026), depois de dividir Fenômenos ondulatórios em 'Propagação, reflexão e refração'
e 'Interferência e ressonância'. Referências: todas as 30 questões do título. Compara titulo_area com
título › assunto. Critério fixado antes: liga se diferença média >= 0,3 e IC95 inferior > 0.
Notas já dadas às cegas em testes anteriores (mesma régua 2) são reaproveitadas; pares novos são avaliados às cegas."""
import sys, json, random
from pathlib import Path
H = Path(__file__).parent; R = H.parents[1]; sys.path.insert(0, str(R))
import recomendador as rc, pipeline_baseline as bl
ix = rc.Indice()
nota = {}
for f in ['assunto_primeiro/chave_com_notas.json', 'assunto_primeiro/chave_confirmacao_com_notas.json']:
    for i in json.load(open(R / 'resultados' / f))['itens']: nota[(i['referencia'], i['candidata'])] = i['nota_IA']
refs = sorted(i for i, r in ix.rot.items() if r.get('titulo') == 'Ondulatória e óptica' and r.get('materia') == 'Física' and not r.get('defeito'))
rnd = random.Random('ondulatoria-2026-11-11'); itens, txt = [], []
for b, r in enumerate(refs, 1):
    ix.assunto_primeiro = set(); A = [i for i, _ in ix.ranking(r, 'titulo_area', 'todas')][:5]
    ix.assunto_primeiro = {'Física › Ondulatória e óptica'}; N = [i for i, _ in ix.ranking(r, 'titulo_area', 'todas')][:5]
    dif = [c for c in dict.fromkeys(A + N) if (c in A) != (c in N)]
    novos = [c for c in dif if (r, c) not in nota]; rnd.shuffle(novos)
    if novos: txt.append(f"\n=== O{b} REF: {bl.clean(ix.rows[r]['question'])[-330:]}")
    for c in dict.fromkeys(A + N):
        it = dict(bloco=b, referencia=r, candidata=c, atual=(A.index(c)+1) if c in A else None, novo=(N.index(c)+1) if c in N else None, nota_IA=nota.get((r, c)))
        if c in novos: it['item'] = f'O{b}.{novos.index(c)+1}'; txt.append(f"- {it['item']}: {bl.clean(ix.rows[c]['question'])[-210:]}")
        itens.append(it)
json.dump({'referencias': refs, 'itens': itens}, open(H / 'chave_NAO_ABRIR.json', 'w'), ensure_ascii=False, indent=1)
open('/tmp/ond.txt', 'w').write('\n'.join(txt)); print('refs', len(refs), 'novos', sum('item' in i for i in itens), 'com diferença', len({i['bloco'] for i in itens if (i['atual'] is None) != (i['novo'] is None)}))
