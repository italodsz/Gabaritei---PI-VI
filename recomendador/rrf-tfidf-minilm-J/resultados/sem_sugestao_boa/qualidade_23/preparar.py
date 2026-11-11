"""Qualidade das sugestões das 23 questões corrigidas (11/11/2026, depois dos vetores Qwen novos).
Para cada uma, as 5 primeiras sugestões do método oficial + 1 isca (posição > 20), embaralhadas.
Notas às cegas, régua 2. Referência de comparação: média das 5 primeiras do método oficial em testes
anteriores (~6,4 a 6,6)."""
import sys, json, random
from pathlib import Path
H = Path(__file__).parent; R = H.parents[2]; sys.path.insert(0, str(R))
import recomendador as rc, pipeline_baseline as bl
ix = rc.Indice()
refs = list(json.load(open(R / 'resultados/sem_sugestao_boa/correcoes_oficiais.json'))['questoes']) + ['gq_1a3a6d4a138f7ba1fba29cef']
rnd = random.Random('qualidade-23-2026-11-11'); itens, txt = [], []
def ops(q): return ' | '.join(f"{o['label']}) {bl.clean(o.get('text') or '')[:40]}" for o in q['options'])
for b, r in enumerate(refs, 1):
    L = [i for i, _ in ix.ranking(r, 'titulo_area', 'todas')]
    top = L[:5]; isca = [c for c in L[20:] if c not in top][:1]
    lote = top + isca; rnd.shuffle(lote)
    q = ix.rows[r]; txt.append(f"\n=== Q{b} REF: {bl.clean(q['question'])[-420:]}\n   {ops(q)}")
    for k, c in enumerate(lote, 1):
        itens.append(dict(item=f'Q{b}.{k}', bloco=b, referencia=r, candidata=c, posicao=(top.index(c)+1) if c in top else None, isca=c in isca))
        txt.append(f"- Q{b}.{k}: {bl.clean(ix.rows[c]['question'])[-230:]}")
json.dump({'referencias': refs, 'itens': itens}, open(H / 'chave_NAO_ABRIR.json', 'w'), ensure_ascii=False, indent=1)
open('/tmp/q23.txt', 'w').write('\n'.join(txt)); print(len(refs), len(itens))
