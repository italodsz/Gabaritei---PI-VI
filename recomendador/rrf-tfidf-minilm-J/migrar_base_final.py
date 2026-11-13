"""Auditoria reproduzível da migração; não modifica a branch dataset."""
import collections
import hashlib
import json
import subprocess
from pathlib import Path

R = Path(__file__).resolve().parent
OUT = R / 'resultados/base_final'
SHA = '6b1d2ec687cd2e165bcb56ffe45f526bfeae7bac910212b837ad4925cdc5396f'

def git_bytes(path, rev='origin/recomendador'):
    return subprocess.check_output(['git', 'show', f'{rev}:{path}'], cwd=R)

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    prefix = 'recomendador/rrf-tfidf-minilm-J/'
    baseline = 'a7b5b8c'
    old = [json.loads(l) for l in git_bytes(prefix+'base/questions.jsonl', baseline).decode('utf-8').splitlines()]
    for name, source in [('questions.jsonl', 'data/questions.jsonl'), ('ids_elegiveis.json', 'ids_elegiveis.json')]:
        (R/'base'/name).write_bytes(git_bytes('Dataset/base_trabalho/'+source, 'e6712a8'))
    assert hashlib.sha256((R/'base/questions.jsonl').read_bytes()).hexdigest() == SHA
    rows = [json.loads(l) for l in (R/'base/questions.jsonl').read_text(encoding='utf-8').splitlines()]
    new = {q['id']: q for q in rows}
    el = json.loads((R/'base/ids_elegiveis.json').read_text(encoding='utf-8'))
    rot = {q['id']: q for q in map(json.loads, git_bytes(prefix+'classificador/dados/classificacao_manual.jsonl', baseline).decode('utf-8').splitlines())}
    # Rótulos do gabarito também são efetivos no carregador oficial.
    for q in json.loads(git_bytes(prefix+'classificador/saida/classificacao.json', baseline)):
        if q['origem'] == 'gabarito': rot.setdefault(q['id'], q)
    missing = [new[i] for split in el.values() for i in split if i not in rot]
    for area in ('MT','CN','CH','LC'):
        pending = [q for q in missing if q['area'] == area]
        (OUT/f'pendentes_{area}.json').write_text(json.dumps(pending, ensure_ascii=False, indent=2), encoding='utf-8')
    changed = [q['id'] for q in old if q['id'] in new and (q['question'], q['options'], q.get('descriptions')) != (new[q['id']]['question'], new[q['id']]['options'], new[q['id']].get('descriptions'))]
    audit = {'dataset_commit':'e6712a8', 'sha256':SHA, 'antes':len(old), 'depois':len(rows), 'elegiveis':{s:len(v) for s,v in el.items()}, 'ids_removidos':sorted(set(q['id'] for q in old)-new.keys()), 'textos_alterados':changed, 'sem_rotulo_por_area':dict(collections.Counter(q['area'] for q in missing)), 'sem_rotulo_ids':[q['id'] for q in missing], 'text_scope':dict(collections.Counter(str(d.get('text_scope')) for q in rows for d in q.get('descriptions',[]) if d.get('use_for_recommender') is True))}
    (OUT/'auditoria_base.json').write_text(json.dumps(audit, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({k:v for k,v in audit.items() if k not in ('textos_alterados','sem_rotulo_ids')}, ensure_ascii=False, indent=2))

if __name__ == '__main__': main()
