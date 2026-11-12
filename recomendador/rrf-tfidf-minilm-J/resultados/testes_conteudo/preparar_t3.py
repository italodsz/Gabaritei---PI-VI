import sys, json, random
from pathlib import Path
H = Path(__file__).parent; R = H.parents[1]; sys.path.insert(0, str(R)); sys.path.insert(0, str(H))
import fichas as F, pipeline_baseline as bl
ix = F.ix
ch = json.load(open(R / 'resultados/avaliacao_ia_50/chave_com_notas.json'))
nota = {(i['referencia'], i['candidata']): i['nota_IA'] for i in ch['itens']}
for i in json.load(open(H / 'chave_t12_com_notas.json'))['itens']:
    if i.get('nota_IA') is not None: nota.setdefault((i['referencia'], i['candidata']), i['nota_IA'])
refs = [r for r in ch['referencias'] if ix.docs[ix.pos[r]]['area'] == 'CN']
rnd = random.Random('gabaritei-fichas-cn-2026-11-11')
itens, txt = [], []
def corta(s, n=230): return s if len(s) <= 2 * n + 10 else s[:n] + ' […] ' + s[-n:]
def ops(q): return ' | '.join(f"{o['label']}) {bl.clean(o.get('text') or '')[:45]}" for o in q['options'])
for b, r in enumerate(refs, 1):
    B = F.ordem(r, 'titulo_area', 'todas'); FQ = F.ordem(r, 'F+Q', 'todas')[:3]; FF = F.ordem(r, 'F', 'todas')[:3]
    novos = [c for c in dict.fromkeys(FQ + FF) if (r, c) not in nota]
    iscas = [c for c in B[3:] if c not in novos and (r, c) not in nota][:max(1, len(novos) // 2)]
    lote = novos + iscas; rnd.shuffle(lote)
    for c in dict.fromkeys(B[:3] + FQ + FF + lote):
        it = dict(bloco=b, referencia=r, candidata=c, materia=ix.rot[r]['materia'], titulo_area=(B.index(c) + 1) if c in B[:3] else None,
                  FQ=(FQ.index(c) + 1) if c in FQ else None, F=(FF.index(c) + 1) if c in FF else None, isca=c in iscas, nota_IA=nota.get((r, c)))
        if c in lote: it['item'] = f'G{b}.{lote.index(c) + 1}'
        itens.append(it)
    if lote:
        q = ix.rows[r]; txt.append(f"\n===== G{b} {ix.rot[r]['materia']} › {ix.rot[r]['titulo']}\nREF: {corta(bl.clean(q['question']))}\n  {ops(q)} [gab {q['answer']}]")
        for k, c in enumerate(lote, 1):
            x = ix.rows[c]; txt.append(f"-- G{b}.{k}: {corta(bl.clean(x['question']))}\n  {ops(x)} [gab {x['answer']}]")
json.dump({'referencias': refs, 'itens': itens}, open(H / 'chave_t3_NAO_ABRIR.json', 'w'), ensure_ascii=False, indent=1)
open('/tmp/g3.txt', 'w').write('\n'.join(txt))
print('refs', len(refs), 'a avaliar', sum('item' in i for i in itens), 'iscas', sum(i['isca'] for i in itens))
