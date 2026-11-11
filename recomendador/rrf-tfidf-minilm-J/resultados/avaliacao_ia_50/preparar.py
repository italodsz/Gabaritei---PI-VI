"""50 referências NOVAS do teste (fora das 20 já usadas), estratificadas por área.
Compara titulo (anterior) x titulo_area (novo), 3 primeiras de cada, galeria 'todas'.
Candidatas embaralhadas por bloco, sem indicar o método."""
import sys, json, random
from pathlib import Path
R = Path(__file__).resolve().parents[2]; sys.path.insert(0, str(R))
import recomendador as rc, pipeline_baseline as bl
ix = rc.Indice()
usadas = set(json.load(open(R / 'resultados/comparacao_direta_titulo/chave.json'))['referencias_av6'] + json.load(open(R / 'resultados/comparacao_direta_titulo/chave.json'))['referencias_novas'])
rnd = random.Random('gabaritei-avaliacao-ia-50-2026-11-11')
pool = {a: [] for a in ('MT', 'CN', 'CH', 'LC')}
for d in ix.docs:
    r = ix.rot.get(d['id'], {})
    if d['split'] == 'test' and d['id'] not in usadas and r.get('titulo') and not r.get('defeito') and not r.get('duplicata'):
        if ix.ranking(d['id'], 'titulo', 'todas')[:3]: pool[d['area']].append(d['id'])
for a in pool: rnd.shuffle(pool[a])
refs = pool['MT'][:13] + pool['CN'][:13] + pool['CH'][:12] + pool['LC'][:12]
falta = 50 - len(refs); refs += pool['CH'][12:12 + falta]
def corta(s, n=230): return s if len(s) <= 2 * n + 10 else s[:n] + ' […] ' + s[-n:]
def ops(q): return ' | '.join(f"{o['label']}) {bl.clean(o.get('text') or '')[:45]}" for o in q['options'])
itens, txt = [], []
for b, r in enumerate(refs, 1):
    A = [i for i, _ in ix.ranking(r, 'titulo', 'todas')[:3]]
    B = [i for i, _ in ix.ranking(r, 'titulo_area', 'todas')[:3]]
    cand = list(dict.fromkeys(A + B)); rnd.shuffle(cand)
    q = ix.rows[r]; t = ix.rot[r]
    txt.append(f"\n===== E{b} {q['area']} · {t['materia']} › {t['titulo']}\nREF: {corta(bl.clean(q['question']))}\n  {ops(q)} [gab {q['answer']}]")
    for k, c in enumerate(cand, 1):
        x = ix.rows[c]
        itens.append(dict(item=f'E{b}.{k}', bloco=b, area=q['area'], materia=t['materia'], referencia=r, candidata=c,
                          anterior=(A.index(c) + 1) if c in A else None, novo=(B.index(c) + 1) if c in B else None))
        txt.append(f"-- E{b}.{k}: {corta(bl.clean(x['question']))}\n  {ops(x)} [gab {x['answer']}]")
json.dump({'semente': 'gabaritei-avaliacao-ia-50-2026-11-11', 'referencias': refs, 'itens': itens},
          open(Path(__file__).parent / 'chave_NAO_ABRIR.json', 'w'), ensure_ascii=False, indent=1)
open('/tmp/e50.txt', 'w').write('\n'.join(txt))
print('refs', len(refs), 'candidatas', len(itens), 'em comum', sum(1 for i in itens if i['anterior'] and i['novo']))
