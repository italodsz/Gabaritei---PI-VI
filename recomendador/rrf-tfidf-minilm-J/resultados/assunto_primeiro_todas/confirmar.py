"""Confirmação de LP e Química com 12 referências novas cada (não usadas na rodada 1). Mesmo critério."""
import sys, json, random, collections
from pathlib import Path
H = Path(__file__).parent; R = H.parents[1]; sys.path.insert(0, str(R))
import recomendador as rc, pipeline_baseline as bl
ix = rc.Indice()
usadas = set(sum(json.load(open(H / 'chave_NAO_ABRIR.json'))['referencias'].values(), []))
rnd = random.Random('gabaritei-ap-confirmacao-2026-11-11')
itens, refs, txt = [], {}, []
for m, sig in (('Língua Portuguesa', 'CP'), ('Química', 'CQ')):
    L = [i for i, r in ix.rot.items() if r.get('materia') == m and not r.get('defeito') and i in ix.pos and i not in usadas]
    cont = collections.Counter(ix.rot[i]['no'] for i in L + [i for i in usadas if ix.rot.get(i, {}).get('materia') == m])
    cand = sorted(i for i in L if cont[ix.rot[i]['no']] >= 2); rf = rnd.sample(cand, 12); refs[m] = rf
    for b, r in enumerate(rf, 1):
        ix.assunto_primeiro = set(); A = [i for i, _ in ix.ranking(r, 'titulo_area', 'todas')][:5]
        ix.assunto_primeiro = {m}; N = [i for i, _ in ix.ranking(r, 'titulo_area', 'todas')][:5]
        allr = [i for i, _ in ix.ranking(r, 'titulo_area', 'todas')]
        uni = list(dict.fromkeys(A + N)); isca = [c for c in allr[8:] if c not in uni][:1]
        lote = uni + isca; rnd.shuffle(lote)
        sel = [c for c in lote if (c in A) != (c in N) or c in isca]
        if len(sel) > 1: txt.append(f"\n=== {sig}{b} REF: {bl.clean(ix.rows[r]['question'])[-330:]}")
        for k, c in enumerate(lote, 1):
            itens.append(dict(item=f'{sig}{b}.{k}', materia=m, bloco=b, referencia=r, candidata=c,
                              atual=(A.index(c)+1) if c in A else None, novo=(N.index(c)+1) if c in N else None, isca=c in isca))
            if len(sel) > 1 and c in sel: txt.append(f"- {sig}{b}.{k}: {bl.clean(ix.rows[c]['question'])[-210:]}")
json.dump({'referencias': refs, 'itens': itens}, open(H / 'chave_confirmacao_NAO_ABRIR.json', 'w'), ensure_ascii=False, indent=1)
open('/tmp/conf.txt', 'w').write('\n'.join(txt)); print(len(itens))
