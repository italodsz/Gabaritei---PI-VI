"""Confirmação 11/11: referências de Física NUNCA usadas nas rodadas anteriores, só dos títulos onde o
assunto primeiro foi ligado (Mecânica, Termologia, Física moderna e energia, Eletricidade e magnetismo).
Critério fixado antes: confirma se a diferença média > 0 e o IC95 não ficar todo abaixo de zero;
se o IC95 ficar todo abaixo de zero, desliga."""
import sys, json, random, collections
from pathlib import Path
H = Path(__file__).parent; R = H.parents[1]; sys.path.insert(0, str(R))
import recomendador as rc, pipeline_baseline as bl
ix = rc.Indice()
usadas = set(json.load(open(H / 'chave_NAO_ABRIR.json'))['referencias'])
lig = {'Mecânica', 'Termologia', 'Física moderna e energia', 'Eletricidade e magnetismo'}
fis = [i for i, r in ix.rot.items() if r.get('materia') == 'Física' and not r.get('defeito')]
cont = collections.Counter(ix.rot[i]['no'] for i in fis)
cand = sorted(i for i in fis if i not in usadas and ix.rot[i]['titulo'] in lig and cont[ix.rot[i]['no']] >= 3)
rnd = random.Random('gabaritei-confirmacao-fisica-2026-11-11')
refs = rnd.sample(cand, min(20, len(cand)))
def top(r, novo):
    ix.assunto_primeiro = ({'Física › ' + t for t in lig}) if novo else set()
    return [i for i, _ in ix.ranking(r, 'titulo_area', 'todas')][:5]
itens, txt = [], []
for b, r in enumerate(refs, 1):
    A, N = top(r, False), top(r, True)
    allr = [i for i, _ in ix.ranking(r, 'titulo_area', 'todas')]
    uni = list(dict.fromkeys(A + N)); isca = [c for c in allr[8:] if c not in uni][:1]
    lote = uni + isca; rnd.shuffle(lote)
    txt.append(f"\n===== C{b} REF: {bl.clean(ix.rows[r]['question'])[-420:]}")
    for k, c in enumerate(lote, 1):
        itens.append(dict(item=f'C{b}.{k}', bloco=b, referencia=r, candidata=c, atual=(A.index(c)+1) if c in A else None,
                          novo=(N.index(c)+1) if c in N else None, isca=c in isca))
        txt.append(f"-- C{b}.{k}: {bl.clean(ix.rows[c]['question'])[-300:]}")
json.dump({'referencias': refs, 'itens': itens}, open(H / 'chave_confirmacao_NAO_ABRIR.json', 'w'), ensure_ascii=False, indent=1)
open('/tmp/c.txt', 'w').write('\n'.join(txt)); print('candidatas', len(cand), 'refs', len(refs), 'itens', len(itens))
