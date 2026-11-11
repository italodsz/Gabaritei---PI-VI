"""Estudo (sem mudar o recomendador): a semelhança de sentido (cosseno Qwen) entre referência e sugestão prevê nota baixa?
Usa todos os pares com nota 0-10 da IA já registrados (avaliações de 11/11), só pares do mesmo título."""
import sys, json, glob
from pathlib import Path
import numpy as np
H = Path(__file__).parent; R = H.parents[1]; sys.path.insert(0, str(R))
import recomendador as rc
ix = rc.Indice()
P = {}
for f in ['avaliacao_ia_50/chave_com_notas.json', 'testes_conteudo/chave_t12_com_notas.json', 'testes_conteudo/chave_t3_com_notas.json',
          'comparacao_direta_titulo/chave.json', 'busca_por_area/chave_teste.json', 'epoca_escala/chave_com_notas.json']:
    for i in json.load(open(R / 'resultados' / f))['itens']:
        if i.get('nota_IA') is not None: P.setdefault((i['referencia'], i['candidata']), i['nota_IA'])
rot = ix.rot
pares = [(r, c, n) for (r, c), n in P.items() if r in ix.pos and c in ix.pos and rot[r].get('titulo') == rot[c].get('titulo') and rot[r].get('materia') == rot[c].get('materia')]
cos = np.array([float(ix.Q[ix.pos[c]] @ ix.Q[ix.pos[r]]) for r, c, _ in pares]); nota = np.array([n for *_, n in pares])
area = np.array([ix.docs[ix.pos[r]]['area'] for r, *_ in pares])
ruim = nota < 5
def auc(s, y):
    o = np.argsort(s); r = np.empty(len(s)); r[o] = np.arange(1, len(s) + 1)
    return (r[y].sum() - y.sum() * (y.sum() + 1) / 2) / (y.sum() * (~y).sum())
print('pares', len(pares), 'ruins (<5):', ruim.sum(), f'({ruim.mean():.0%})', 'correlação cos x nota', round(np.corrcoef(cos, nota)[0, 1], 2),
      'AUC (cos baixo -> ruim)', round(auc(-cos, ruim), 2))
out = {'pares': len(pares), 'ruins': int(ruim.sum()), 'corr': round(float(np.corrcoef(cos, nota)[0, 1]), 2), 'auc': round(float(auc(-cos, ruim)), 2), 'por_area': {}, 'cortes': []}
for a in ('MT', 'CN', 'CH', 'LC'):
    m = area == a
    out['por_area'][a] = dict(pares=int(m.sum()), ruins=int(ruim[m].sum()), corr=round(float(np.corrcoef(cos[m], nota[m])[0, 1]), 2), auc=round(float(auc(-cos[m], ruim[m])), 2))
    print(a, out['por_area'][a])
print('\ncorte  | abaixo do corte: pares, % ruins | acima: % ruins | ruins pegos')
for t in np.quantile(cos, [.1, .2, .3, .4, .5]):
    b = cos < t
    lin = dict(corte=round(float(t), 3), abaixo=int(b.sum()), pct_ruins_abaixo=round(100 * ruim[b].mean()), pct_ruins_acima=round(100 * ruim[~b].mean()), ruins_pegos=round(100 * ruim[b].sum() / ruim.sum()))
    out['cortes'].append(lin); print(lin)
# no catálogo inteiro: quantas questões têm a 1ª/3ª sugestão abaixo de cada corte
_, el = rc.carregar(); ids = el['train'] + el['validation'] + el['test']
c1, c3 = [], []
for q in ids:
    L = [i for i, _ in ix.ranking(q, 'titulo_area', 'todas')[:3]]
    if not L: continue
    cs = [float(ix.Q[ix.pos[c]] @ ix.Q[ix.pos[q]]) for c in L]
    c1.append(cs[0]); c3.append(cs[-1])
c1, c3 = np.array(c1), np.array(c3)
out['catalogo'] = [dict(corte=l['corte'], pct_questoes_1a_abaixo=round(100 * (c1 < l['corte']).mean(), 1), pct_questoes_3a_abaixo=round(100 * (c3 < l['corte']).mean(), 1)) for l in out['cortes']]
print('\ncatálogo (', len(c1), 'questões com lista ):'); [print(x) for x in out['catalogo']]
json.dump(out, open(H / 'analise.json', 'w'), ensure_ascii=False, indent=1)
