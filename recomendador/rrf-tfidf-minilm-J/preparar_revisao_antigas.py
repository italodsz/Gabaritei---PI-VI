"""Separa mudanças apenas de marcação das alterações efetivas no texto de busca."""
import difflib
import json
import re
from pathlib import Path
import pipeline_baseline as bl
import recomendador as rc

R = Path(__file__).resolve().parent
ANTES = R.parents[2]/'Gabaritei-base-final-antes/recomendador/rrf-tfidf-minilm-J'

def main():
    old = {q['id']:q for q in map(json.loads,(ANTES/'base/questions.jsonl').read_text(encoding='utf-8').splitlines())}
    rows, el = rc.carregar(); rot, _ = rc.carregar_rotulos()
    oldel = set(sum(json.loads((ANTES/'base/ids_elegiveis.json').read_text(encoding='utf-8')).values(), []))
    changed = json.loads((R/'resultados/base_final/auditoria_base.json').read_text(encoding='utf-8'))['textos_alterados']
    out = []
    norm = lambda t: re.sub(r'\s+', ' ', re.sub(r'[#\\]', '', t)).strip()
    for i in sorted(set(changed) & oldel & set(sum(el.values(), []))):
        before = norm(bl.question_text({**old[i], 'descriptions':[]})); after = norm(bl.question_text(rows[i]))
        ops = difflib.SequenceMatcher(None, before.split(), after.split(), autojunk=False).get_opcodes()
        delta = [{'antes':' '.join(before.split()[a:b]), 'depois':' '.join(after.split()[c:d])} for tag,a,b,c,d in ops if tag != 'equal']
        out.append({'id':i,'area':rows[i]['area'], 'ano':rows[i]['year'], 'posicao':rows[i].get('position'), 'no':rot.get(i,{}).get('no'), 'delta':delta, 'somente_marcacao':not delta})
    (R/'resultados/base_final/revisao_antigas.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
    print('Total:',len(out),'apenas marcação:',sum(q['somente_marcacao'] for q in out),'com diferença:',sum(bool(q['delta']) for q in out))

if __name__ == '__main__': main()
