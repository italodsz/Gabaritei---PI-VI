"""Conferência única no teste: as 20 referências da comparação direta, 3 primeiras do titulo_area.
Sugestões ainda sem nota entram embaralhadas com iscas (4ª e 5ª do modo titulo) para a nota ser às cegas."""
import sys, json, random
from pathlib import Path
R = Path(__file__).resolve().parents[2]; sys.path.insert(0, str(R))
import recomendador as rc, pipeline_baseline as bl
ix = rc.Indice()
ch = json.load(open(R / 'resultados/comparacao_direta_titulo/chave.json'))
refs = ch['referencias_av6'] + ch['referencias_novas']
nota = {(i['referencia'], i['candidata']): i['nota_IA'] for i in ch['itens']}
rnd = random.Random('gabaritei-busca-por-area-2026-11-11')
itens, txt = [], []
def corta(s, n=330): return s if len(s) <= 2 * n + 10 else s[:n] + ' […] ' + s[-n:]
for b, r in enumerate(refs, 1):
    novo = [i for i, _ in ix.ranking(r, 'titulo_area', 'todas')[:3]]
    tit = [i for i, _ in ix.ranking(r, 'titulo', 'todas')[:5]]
    cand = {}
    for k, c in enumerate(novo, 1): cand.setdefault(c, {})['titulo_area'] = k
    for k, c in enumerate(tit, 1):
        if k <= 3: cand.setdefault(c, {})['titulo'] = k
        elif c not in cand and sum('isca' in v for v in cand.values()) < 2: cand[c] = {'isca': k}
    sem = [c for c in cand if (r, c) not in nota]; rnd.shuffle(sem)
    q = ix.rows[r]
    if sem:
        txt.append(f"\n===== D{b} {q['area']}\nREF: {corta(bl.clean(q['question']))}\n  " + ' | '.join(f"{o['label']}) {bl.clean(o.get('text') or '')[:60]}" for o in q['options']) + f" [gab {q['answer']}]")
    for c, v in cand.items():
        it = dict(referencia=r, candidata=c, bloco=b, titulo_area=v.get('titulo_area'), titulo=v.get('titulo'), isca=v.get('isca'), nota_IA=nota.get((r, c)))
        if c in sem:
            it['item'] = f'D{b}.{sem.index(c) + 1}'; x = ix.rows[c]
            txt.append(f"-- {it['item']}: {corta(bl.clean(x['question']))}\n  " + ' | '.join(f"{o['label']}) {bl.clean(o.get('text') or '')[:60]}" for o in x['options']) + f" [gab {x['answer']}]")
        itens.append(it)
json.dump({'itens': itens}, open(Path(__file__).parent / 'chave_teste.json', 'w'), ensure_ascii=False, indent=1)
open('/tmp/cd2.txt', 'w').write('\n'.join(txt))
na = [i for i in itens if i['titulo_area']]
print('pares titulo_area', len(na), 'ja com nota', sum(i['nota_IA'] is not None for i in na), 'a avaliar (com iscas)', sum('item' in i for i in itens), 'iscas', sum(bool(i['isca']) and 'item' in i for i in itens))
print('iguais ao titulo no top3:', sum(bool(i['titulo']) for i in na))
