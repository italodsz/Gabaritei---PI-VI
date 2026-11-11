"""Cada peça acompanha a nota 0-10? Usa os pares já avaliados (avaliações 5, 6 e comparação direta).
Dentro de cada referência: quando uma sugestão tem nota maior que outra, a peça também dá valor maior?"""
import sys, json, collections, ast
from pathlib import Path
import numpy as np
R = Path(__file__).resolve().parents[2]; sys.path.insert(0, str(R))
import recomendador as rc, sinais
ix = rc.Indice(); S = sinais.Sinais(ix)
RES = R / 'resultados'
pares = {}
for n in json.load(open(RES / 'avaliacao_cega_5/resultado_IA.json'))['notas']:
    if n.get('nota_0a10') is not None: pares[(n['referencia'], n['candidata'])] = dict(nota=n['nota_0a10'], conceito=n.get('conceito'), tarefa=n.get('tarefa'))
for n in json.load(open(RES / 'avaliacao_cega_6/resultado.json'))['notas']:
    pares.setdefault((n['referencia'], n['candidata']), {}).update(nota=n['nota_IA'], italo=n['nota_italo'] if isinstance(n['nota_italo'], (int, float)) else None)
for n in json.load(open(RES / 'comparacao_direta_titulo/chave.json'))['itens']:
    pares.setdefault((n['referencia'], n['candidata']), {}).setdefault('nota', n['nota_IA'])
print('pares', len(pares), 'refs', len({r for r, _ in pares}))
rot = lambda i: ix.rot.get(i, {})
def sig(r, c):
    a, b = ix.pos[r], ix.pos[c]; p = np.array([b])
    o = {'tfidf': float((ix.X[p] @ ix.X[a].T).toarray()[0, 0]), 'qwen': float(ix.Q[b] @ ix.Q[a])}
    for pc in sinais.PECAS: o[pc] = float(S.escore(pc, a, p)[0])
    o['mesmo_assunto'] = float(rot(r).get('no') == rot(c).get('no'))
    o['mesmo_titulo'] = float((rot(r).get('materia'), rot(r).get('titulo')) == (rot(c).get('materia'), rot(c).get('titulo')))
    return o
por_ref = collections.defaultdict(list)
for (r, c), v in pares.items():
    if r in ix.pos and c in ix.pos: por_ref[r].append((v, sig(r, c)))
def concord(alvo, so_titulo, areas=None):
    out = {}
    for s in ['tfidf', 'qwen', 'comando', 'nomes', 'formato', 'genero', 'mesmo_assunto']:
        ok = tot = 0
        for r, L in por_ref.items():
            if areas and ix.docs[ix.pos[r]]['area'] not in areas: continue
            L = [x for x in L if x[0].get(alvo) is not None and (not so_titulo or x[1]['mesmo_titulo'])]
            for i in range(len(L)):
                for j in range(len(L)):
                    if L[i][0][alvo] > L[j][0][alvo] + 0.5:
                        tot += 1; d = L[i][1][s] - L[j][1][s]; ok += 1 if d > 1e-9 else 0.5 if abs(d) <= 1e-9 else 0
        out[s] = (round(100 * ok / tot) if tot else None, tot)
    return out
saida = {}
for nome, kw in [('nota, todos os pares', dict(alvo='nota', so_titulo=False)), ('nota, só dentro do título', dict(alvo='nota', so_titulo=True)),
                 ('tarefa (av5)', dict(alvo='tarefa', so_titulo=False)), ('conceito (av5)', dict(alvo='conceito', so_titulo=False)),
                 ('nota do Ítalo (av6)', dict(alvo='italo', so_titulo=True))] + [(f'nota dentro do título, {a}', dict(alvo='nota', so_titulo=True, areas=[a])) for a in ('MT', 'CN', 'CH', 'LC')]:
    saida[nome] = concord(**kw); print(nome, saida[nome])
json.dump(saida, open(Path(__file__).parent / 'sinais_x_notas.json', 'w'), ensure_ascii=False, indent=1)
