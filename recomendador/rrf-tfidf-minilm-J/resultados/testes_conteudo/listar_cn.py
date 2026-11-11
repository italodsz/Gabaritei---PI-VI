"""Lista as questões elegíveis dos títulos das 12 referências de Natureza, para escrever as fichas."""
import sys, json
from pathlib import Path
R = Path(__file__).resolve().parents[2]; sys.path.insert(0, str(R))
import recomendador as rc, pipeline_baseline as bl
rot, _ = rc.carregar_rotulos()
rows, el = rc.carregar(); ids = el['train'] + el['validation'] + el['test']
ch = json.load(open(R / 'resultados/avaliacao_ia_50/chave_com_notas.json'))
tits = sorted({(rot[r]['materia'], rot[r]['titulo']) for r in ch['referencias'] if rows[r]['area'] == 'CN'})
lista = [i for i in ids if (rot.get(i, {}).get('materia'), rot.get(i, {}).get('titulo')) in tits]
json.dump({'titulos': tits, 'ids': lista}, open(Path(__file__).parent / 'cn_ids.json', 'w'), ensure_ascii=False, indent=1)
out = []
for k, i in enumerate(lista):
    q = rows[i]; t = bl.clean(q['question'])
    if len(t) > 420: t = t[:120] + ' […] ' + t[-300:]
    resp = next((bl.clean(o.get('text') or '') for o in q['options'] if o['label'] == q['answer']), '')
    out.append(f"{k}|{rot[i]['materia'][:3]}|{t} => {resp[:110]}")
open('/tmp/cn.txt', 'w').write('\n'.join(out)); print(len(lista), tits)
