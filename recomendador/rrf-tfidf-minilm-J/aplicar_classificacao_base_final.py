"""Acrescenta decisões lidas individualmente, com validação da árvore e da área."""
import argparse
import json
from pathlib import Path

R = Path(__file__).resolve().parent

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('area', choices=['MT','CN','CH','LC']); a = ap.parse_args()
    out = R/'resultados/base_final'
    rows = json.loads((out/f'pendentes_{a.area}.json').read_text(encoding='utf-8'))
    nos = {n['id']:n for n in json.loads((R/'classificador/dados/arvore_v1.2.json').read_text(encoding='utf-8'))['nos']}
    dest = R/'classificador/dados/classificacao_manual.jsonl'
    existing = {q['id'] for q in map(json.loads, dest.read_text(encoding='utf-8').splitlines())}
    adds = []; seen = set()
    for line in (out/f'decisoes_{a.area}.tsv').read_text(encoding='utf-8').splitlines():
        i, no, obs = line.split('\t', 2); i = int(i)
        assert i not in seen; seen.add(i)
        q = rows[i]; assert q['id'] not in existing
        n = None if no == 'NULL' else nos[no]
        assert n is None or n['area'] == q['area'] == a.area
        adds.append({'id':q['id'], 'no':None if n is None else no, 'grande_tema':None if n is None else n['grande_tema'], 'assunto':None if n is None else n['assunto'], 'obs':obs})
    assert len(adds) == len(rows), 'A área deve estar integralmente revisada.'
    with dest.open('a', encoding='utf-8', newline='\n') as f:
        for q in adds: f.write(json.dumps(q, ensure_ascii=False)+'\n')
    print(f'{a.area}: {len(adds)} decisões acrescentadas; {sum(q["no"] is None for q in adds)} defeitos.')

if __name__ == '__main__': main()
