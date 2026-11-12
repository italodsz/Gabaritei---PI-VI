"""Testes 1 e 2 sobre as 50 referências de resultados/avaliacao_ia_50 (mesma régua, IA às cegas).
T1 = titulo_area com o mesmo assunto da árvore primeiro (dentro dele, a ordem do titulo_area).
T2 = titulo_area + bônus da alternativa correta (peso 0,5) em todas as matérias.
Sugestões sem nota entram embaralhadas com iscas (4ª a 8ª do titulo_area)."""
import sys, json, random, copy
from pathlib import Path
R = Path(__file__).resolve().parents[2]; sys.path.insert(0, str(R))
import recomendador as rc, pipeline_baseline as bl
ix = rc.Indice()
A50 = R / 'resultados/avaliacao_ia_50'
ch = json.load(open(A50 / 'chave_com_notas.json'))
nota = {(i['referencia'], i['candidata']): i['nota_IA'] for i in ch['itens']}
refs = ch['referencias']
def base(r, n=8): return [i for i, _ in ix.ranking(r, 'titulo_area', 'todas')[:n]]
def t1(r):
    L = [i for i, _ in ix.ranking(r, 'titulo_area', 'todas')]
    a = ix.rot[r]['no']
    return ([i for i in L if ix.rot[i]['no'] == a] + [i for i in L if ix.rot[i]['no'] != a])[:3]
def t2(r):
    m = ix.rot[r]['materia']; ix._ordem_por_area  # garante sinais
    if not hasattr(ix, 'area_cfg'): ix.ranking(r, 'titulo_area', 'todas')
    c = copy.deepcopy(ix.area_cfg['por_materia'].get(m, ix.area_cfg['padrao'])); c['pecas']['resposta'] = 0.5
    ix.cfg_forcada = c
    try: return [i for i, _ in ix.ranking(r, 'titulo_area', 'todas')[:3]]
    finally: ix.cfg_forcada = None
rnd = random.Random('gabaritei-testes-conteudo-t12-2026-11-11')
itens, txt = [], []
def corta(s, n=230): return s if len(s) <= 2 * n + 10 else s[:n] + ' […] ' + s[-n:]
def ops(q): return ' | '.join(f"{o['label']}) {bl.clean(o.get('text') or '')[:45]}" for o in q['options'])
for b, r in enumerate(refs, 1):
    B = base(r); T1 = t1(r); T2 = t2(r)
    novos = [c for c in dict.fromkeys(T1 + T2) if (r, c) not in nota]
    iscas = [c for c in B[3:] if c not in novos and (r, c) not in nota][:max(1, len(novos))]
    lote = novos + iscas; rnd.shuffle(lote)
    for c in dict.fromkeys(B[:3] + T1 + T2 + lote):
        it = dict(bloco=b, area=ix.docs[ix.pos[r]]['area'], materia=ix.rot[r]['materia'], referencia=r, candidata=c,
                  titulo_area=(B.index(c) + 1) if c in B[:3] else None, t1=(T1.index(c) + 1) if c in T1 else None,
                  t2=(T2.index(c) + 1) if c in T2 else None, isca=c in iscas, nota_IA=nota.get((r, c)))
        if c in lote: it['item'] = f'F{b}.{lote.index(c) + 1}'
        itens.append(it)
    if lote:
        q = ix.rows[r]; t = ix.rot[r]
        txt.append(f"\n===== F{b} {q['area']} · {t['materia']} › {t['titulo']}\nREF: {corta(bl.clean(q['question']))}\n  {ops(q)} [gab {q['answer']}]")
        for k, c in enumerate(lote, 1):
            x = ix.rows[c]; txt.append(f"-- F{b}.{k}: {corta(bl.clean(x['question']))}\n  {ops(x)} [gab {x['answer']}]")
json.dump({'referencias': refs, 'itens': itens}, open(Path(__file__).parent / 'chave_t12_NAO_ABRIR.json', 'w'), ensure_ascii=False, indent=1)
open('/tmp/f12.txt', 'w').write('\n'.join(txt))
a = [i for i in itens if 'item' in i]
print('a avaliar', len(a), 'iscas', sum(i['isca'] for i in a), 'T1 novos', sum(1 for i in itens if i['t1'] and i['nota_IA'] is None), 'T2 novos', sum(1 for i in itens if i['t2'] and i['nota_IA'] is None))
