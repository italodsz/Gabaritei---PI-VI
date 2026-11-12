"""Teste 11/11 em Física: titulo_area atual x 'assunto primeiro' (mesmo assunto da árvore, depois o título).
Critério fixado antes das notas: o novo fica se a média por referência das 5 primeiras subir >= 0,3
e o limite inferior do IC95 (bootstrap) da diferença for > 0. Régua 2 (mesmo conteúdo 9-10; tema próximo ~5)."""
import sys, json, random, collections
from pathlib import Path
H = Path(__file__).parent; R = H.parents[1]; sys.path.insert(0, str(R))
import recomendador as rc, pipeline_baseline as bl
ix = rc.Indice()
fis = [i for i, r in ix.rot.items() if r.get('materia') == 'Física' and not r.get('defeito')]
cont = collections.Counter(ix.rot[i]['no'] for i in fis)
cand = sorted(i for i in fis if cont[ix.rot[i]['no']] >= 3)
rnd = random.Random('gabaritei-assunto-primeiro-fisica-2026-11-11')
refs = rnd.sample(cand, 24)
def top(r, novo):
    ix.assunto_primeiro = {'Física'} if novo else set()
    return [i for i, _ in ix.ranking(r, 'titulo_area', 'todas')][:5]
itens, txt = [], []
def corta(s, n=260): return s if len(s) <= 2 * n + 10 else s[:n] + ' […] ' + s[-n:]
def ops(q): return ' | '.join(f"{o['label']}) {bl.clean(o.get('text') or '')[:50]}" for o in q['options'])
for b, r in enumerate(refs, 1):
    A, N = top(r, False), top(r, True)
    allr = [i for i, _ in ix.ranking(r, 'titulo_area', 'todas')]
    uni = list(dict.fromkeys(A + N))
    iscas = [c for c in allr[8:] if c not in uni][:1]
    lote = uni + iscas; rnd.shuffle(lote)
    q = ix.rows[r]
    txt.append(f"\n===== F{b} REF: {corta(bl.clean(q['question']))}\n  {ops(q)} [gab {q['answer']}]")
    for k, c in enumerate(lote, 1):
        itens.append(dict(item=f'F{b}.{k}', bloco=b, referencia=r, candidata=c,
                          atual=(A.index(c) + 1) if c in A else None, novo=(N.index(c) + 1) if c in N else None, isca=c in iscas))
        x = ix.rows[c]; txt.append(f"-- F{b}.{k}: {corta(bl.clean(x['question']))}\n  {ops(x)} [gab {x['answer']}]")
json.dump({'referencias': refs, 'itens': itens}, open(H / 'chave_NAO_ABRIR.json', 'w'), ensure_ascii=False, indent=1)
open('/tmp/f.txt', 'w').write('\n'.join(txt))
print('refs', len(refs), 'itens', len(itens), 'iguais', sum(1 for b in range(1, 25) if len([i for i in itens if i['bloco'] == b]) == 6))
