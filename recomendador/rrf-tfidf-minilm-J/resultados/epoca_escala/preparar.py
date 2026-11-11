"""Régua da IA: todas as referências de teste de História (8) e Geografia (12). Compara titulo_area (só sentido)
com titulo_area + época (História) ou + escala (Geografia), peso 0,5. Novas sugestões misturadas com iscas."""
import sys, json, random, copy
from pathlib import Path
H = Path(__file__).parent; R = H.parents[1]; sys.path.insert(0, str(R))
import recomendador as rc, pipeline_baseline as bl
ix = rc.Indice()
nota = {}
for f in ['resultados/avaliacao_ia_50/chave_com_notas.json', 'resultados/testes_conteudo/chave_t12_com_notas.json',
          'resultados/comparacao_direta_titulo/chave.json', 'resultados/busca_por_area/chave_teste.json']:
    for i in json.load(open(R / f))['itens']:
        if i.get('nota_IA') is not None: nota.setdefault((i['referencia'], i['candidata']), i['nota_IA'])
_, el = rc.carregar()
refs = [i for i in el['test'] if ix.rot.get(i, {}).get('materia') in ('História', 'Geografia') and not ix.rot[i].get('defeito')]
def rank(r, peca=None):
    if not hasattr(ix, 'area_cfg'): ix.ranking(r, 'titulo_area', 'todas')
    if peca:
        c = copy.deepcopy(ix.area_cfg['padrao']); c['pecas'][peca] = 0.5; ix.cfg_forcada = c
    try: return [i for i, _ in ix.ranking(r, 'titulo_area', 'todas')]
    finally: ix.cfg_forcada = None
rnd = random.Random('gabaritei-epoca-escala-2026-11-11')
itens, txt = [], []
def corta(s, n=230): return s if len(s) <= 2 * n + 10 else s[:n] + ' […] ' + s[-n:]
def ops(q): return ' | '.join(f"{o['label']}) {bl.clean(o.get('text') or '')[:45]}" for o in q['options'])
for b, r in enumerate(refs, 1):
    peca = 'epoca' if ix.rot[r]['materia'] == 'História' else 'escala'
    B = rank(r); N = rank(r, peca)[:3]
    if not B: continue
    cand = list(dict.fromkeys(B[:3] + N))
    novos = [c for c in cand if (r, c) not in nota]
    iscas = [c for c in B[3:] if c not in cand and (r, c) not in nota][:max(1, len(novos) // 2)]
    lote = novos + iscas; rnd.shuffle(lote)
    for c in dict.fromkeys(cand + lote):
        it = dict(bloco=b, referencia=r, candidata=c, materia=ix.rot[r]['materia'], peca=peca,
                  atual=(B.index(c) + 1) if c in B[:3] else None, novo=(N.index(c) + 1) if c in N else None,
                  isca=c in iscas, nota_IA=nota.get((r, c)))
        if c in lote: it['item'] = f'H{b}.{lote.index(c) + 1}'
        itens.append(it)
    if lote:
        q = ix.rows[r]; txt.append(f"\n===== H{b} {ix.rot[r]['materia']} › {ix.rot[r]['titulo']}\nREF: {corta(bl.clean(q['question']))}\n  {ops(q)} [gab {q['answer']}]")
        for k, c in enumerate(lote, 1):
            x = ix.rows[c]; txt.append(f"-- H{b}.{k}: {corta(bl.clean(x['question']))}\n  {ops(x)} [gab {x['answer']}]")
json.dump({'referencias': refs, 'itens': itens}, open(H / 'chave_NAO_ABRIR.json', 'w'), ensure_ascii=False, indent=1)
open('/tmp/h.txt', 'w').write('\n'.join(txt))
print('refs', len(refs), 'a avaliar', sum('item' in i for i in itens), 'iscas', sum(i['isca'] for i in itens),
      'trocas', sum(1 for i in itens if i['novo'] and not i['atual']))
