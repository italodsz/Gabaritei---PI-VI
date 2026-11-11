"""Rodada 2 (11/11): mesmas 24 referências, depois de criar o assunto 'Cor e visão' (FS3.cor-e-visao).
Notas antigas reaproveitadas para pares já avaliados; pares novos avaliados às cegas em notas_IA_r2.txt."""
import sys, json, random
from pathlib import Path
H = Path(__file__).parent; R = H.parents[1]; sys.path.insert(0, str(R))
import recomendador as rc, pipeline_baseline as bl
ix = rc.Indice()
ch = json.load(open(H / 'chave_com_notas.json'))
nota = {(i['referencia'], i['candidata']): i['nota_IA'] for i in ch['itens']}
def top(r, novo):
    ix.assunto_primeiro = {'Física'} if novo else set()
    return [i for i, _ in ix.ranking(r, 'titulo_area', 'todas')][:5]
itens, txt, rnd = [], [], random.Random('assunto-primeiro-r2')
for b, r in enumerate(ch['referencias'], 1):
    A, N = top(r, False), top(r, True)
    novos = [c for c in dict.fromkeys(A + N) if (r, c) not in nota]
    for c in dict.fromkeys(A + N):
        itens.append(dict(bloco=b, referencia=r, candidata=c, atual=(A.index(c)+1) if c in A else None,
                          novo=(N.index(c)+1) if c in N else None, nota_IA=nota.get((r, c))))
    if novos:
        rnd.shuffle(novos); q = ix.rows[r]
        txt.append(f"\n===== F{b} REF: {bl.clean(q['question'])[-400:]}")
        for k, c in enumerate(novos, 1):
            for i in itens:
                if i['bloco'] == b and i['candidata'] == c: i['item'] = f'G{b}.{k}'
            txt.append(f"-- G{b}.{k}: {bl.clean(ix.rows[c]['question'])[-400:]}")
json.dump({'referencias': ch['referencias'], 'itens': itens}, open(H / 'chave_r2_NAO_ABRIR.json', 'w'), ensure_ascii=False, indent=1)
open('/tmp/g.txt', 'w').write('\n'.join(txt)); print('novos', sum('item' in i for i in itens))
