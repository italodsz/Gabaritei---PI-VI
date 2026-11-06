from pathlib import Path
from collections import Counter, defaultdict
from datetime import datetime, timezone
from hashlib import sha256
from itertools import combinations
import json, math, platform, re, statistics, unicodedata

import argparse
parser = argparse.ArgumentParser()
parser.add_argument('dataset', type=Path)
parser.add_argument('--output', type=Path, default=Path('results/fase_01.json'))
args = parser.parse_args()
base = args.dataset
commit = '7e720fa876beb7249adab2f05d3ecf33ae5a2c51'

expected_hash = '22d83ac5d269976b647d34cb8aa66ccbebec6c21b0773487926eb294ee69fbd5'
splits = ('train', 'validation', 'test')
def read_json(path):
    return json.loads((base / path).read_bytes())
def read_rows(path):
    return [json.loads(line) for line in (base / path).read_bytes().splitlines() if line.strip()]

paths = ['data/questions.jsonl', 'ids_elegiveis.json', 'README.md', 'AVISO_INDICES.json',
         'qualidade/bloqueios.json', 'qualidade/alteracoes_2_itens.json',
         'qualidade/evidencia_catalase_indexada.json'] + [f'splits/{s}.jsonl' for s in splits]
hashes = {path: sha256((base / path).read_bytes()).hexdigest() for path in paths}
print(datetime.now(timezone.utc).isoformat(), platform.platform(), platform.python_version(), commit)
print(json.dumps(hashes, indent=2))
if hashes['data/questions.jsonl'] != expected_hash:
    raise ValueError('SHA-256 divergente em data/questions.jsonl')
catalog = read_rows('data/questions.jsonl')
groups = {s: read_rows(f'splits/{s}.jsonl') for s in splits}
eligible = read_json('ids_elegiveis.json')
by_id = {r['id']: r for r in catalog}
def id_set(rows):
    return {r['id'] for r in rows}
print('Catálogo', len(catalog), 'IDs duplicados', len(catalog)-len(by_id))
print('Elegíveis únicos', len(set().union(*map(set, eligible.values()))))
for s, rows in groups.items():
    ids = id_set(rows)
    print(s, len(rows), 'duplicados split/lista', len(rows)-len(ids),
          len(eligible[s])-len(set(eligible[s])), 'diferença lista', len(ids ^ set(eligible[s])),
          'divergências catálogo', sum(by_id.get(r['id']) != r for r in rows),
          'split divergente', sum(r.get('split') != s for r in rows))
blocked = {r['id'] for r in read_json('qualidade/bloqueios.json')}
print('Bloqueios', [(i, i in by_id, [s for s in splits if i in set(eligible[s])],
      by_id.get(i, {}).get('ready_text')) for i in sorted(blocked)])
print('Fórmula corrigida: presente', 'gq_14561aefce51ecddf26b4262' in by_id)
print('Índices', read_json('AVISO_INDICES.json'))
eligible_ids = {s: set(eligible[s]) for s in splits}
eligible_groups = {s: [r for r in rows if r['id'] in eligible_ids[s]] for s, rows in groups.items()}
for s in splits:
    print('Elegiveis presentes', s, len(eligible_groups[s]),
          'faltantes', len(set(eligible[s]) - id_set(groups[s])),
          'extras brutos', len(id_set(groups[s]) - set(eligible[s])),
          'elegiveis ready_text falso', sum(r.get('ready_text') is not True for r in eligible_groups[s]))
assert sum(map(len, groups.values())) == len(catalog)
assert all(id_set(eligible_groups[s]) == set(eligible[s]) for s in splits)

assert len(catalog) == len(by_id) == 2971
assert tuple(len(groups[s]) for s in splits) == (2616, 177, 178)
assert tuple(len(eligible[s]) for s in splits) == (1801, 136, 126)
assert all(len(rows) == len(id_set(rows)) for rows in groups.values())
assert set(by_id) == set().union(*(id_set(rows) for rows in groups.values()))
assert all(by_id[r['id']] == r and r['split'] == s for s, rows in groups.items() for r in rows)
assert all(r['ready_text'] is True for rows in eligible_groups.values() for r in rows)
assert blocked <= set(by_id) and not blocked.intersection(set().union(*map(set, eligible.values())))
assert all(by_id[item]['ready_text'] is False for item in blocked)
print('PASS: SHA-256, counts, unique IDs, catalog equality, eligibility and blocked items')


def normalized(value):
    return ' '.join(re.findall(r'\w+', unicodedata.normalize('NFKC', value).casefold()))

print('Interseções por par de splits')
for left, right in combinations(splits, 2):
    for key in ('id', 'family_id', 'content_family_id', 'co_item', 'question'):
        def index(rows):
            result = defaultdict(list)
            for r in rows:
                value = r.get(key)
                if isinstance(value, str) and key == 'question':
                    value = normalized(value)
                if value:
                    result[value].append(r['id'])
            return result
        a, b = index(groups[left]), index(groups[right])
        common = a.keys() & b.keys()
        assert not common, (left, right, key, sorted(common)[:3])
        print(left, right, key, len(common), 'exemplos',
              [(a[k][0], b[k][0]) for k in sorted(common)[:3]])

# Busca lexical de quase duplicatas por Jaccard de trigramas.
# Um índice invertido reduz comparações. Não detecta todas as paráfrases.
tokens = {}
index = defaultdict(set)
for s, rows in groups.items():
    for r in rows:
        words = normalized(r.get('question') or '').split()
        grams = set(zip(words, words[1:], words[2:]))
        tokens[(s, r['id'])] = grams
        for gram in grams:
            index[gram].add((s, r['id']))
near = []
for (s, item), grams in tokens.items():
    hits = Counter(other for gram in grams for other in index[gram] if other[0] > s)
    for (t, candidate), overlap in hits.items():
        score = overlap / (len(grams) + len(tokens[(t, candidate)]) - overlap)
        if 0.8 <= score < 1:
            near.append((round(score, 4), s, item, t, candidate))
print('Quase duplicatas Jaccard >= 0,8 e < 1', len(near), sorted(near, reverse=True)[:20])
print('PASS: no overlap between splits for the five tested keys')

def valid(key, value):
    return (type(value) in (int, float) and math.isfinite(value)
            and (key != 'a' or value > 0) and (key != 'c' or 0 <= value <= 1))

def tri(r, key):
    return (r.get('tri') or {}).get(key)

for name, rows in {'catalog': catalog, **groups}.items():
    print('\n', name)
    for field in ('year','area','application_type','application_format','ready_text','ready_multimodal'):
        print(field, dict(Counter(r.get(field) for r in rows)))
    print('Habilidade por área', dict(Counter((r.get('area'),r.get('skill')) for r in rows)))
    print('Pedagogia (status, método)', Counter((str((r.get('pedagogy') or {}).get('review_status')),
          str((r.get('pedagogy') or {}).get('method'))) for r in rows))
    print('Campos de pedagogia', Counter(k for r in rows for k in (r.get('pedagogy') or {})))
    for key in ('a','b','c'):
        values = [tri(r,key) for r in rows if valid(key,tri(r,key))]
        missing = sum(tri(r,key) is None for r in rows)
        if len(values) < 2:
            print(key, 'válidos', len(values), 'ausentes', missing)
            continue
        q1, _, q3 = statistics.quantiles(values, n=4, method='inclusive')
        low, high = q1-1.5*(q3-q1), q3+1.5*(q3-q1)
        print(key, 'válidos', len(values), 'ausentes', missing, 'inválidos', len(rows)-missing-len(values),
              'mín/med/máx', (min(values),statistics.median(values),max(values)),
              'outliers IQR', sum(not low <= x <= high for x in values))
    strata = defaultdict(list)
    for r in rows:
        strata[(r.get('area'), r.get('year'), r.get('application_type'))].append(tri(r,'b'))
    print('b por área/ano/aplicação (total, válidos, mediana)')
    for stratum, raw in sorted(strata.items(), key=lambda entry: str(entry[0])):
        values = [x for x in raw if valid('b',x)]
        print(stratum, len(raw), len(values), statistics.median(values) if values else None)

train_b = [tri(r,'b') for r in eligible_groups['train'] if valid('b',tri(r,'b'))]
lower, upper = statistics.quantiles(train_b, n=3, method='inclusive')
print('Cortes experimentais ajustados somente no treino', lower, upper)
def difficulty(b):
    if not valid('b', b):
        return 'sem rótulo'
    if b <= lower:
        return 'fácil'
    return 'média' if b <= upper else 'difícil'

for s, rows in eligible_groups.items():
    print(s, dict(Counter(difficulty(tri(r,'b')) for r in rows)),
          dict(Counter((r.get('area'),difficulty(tri(r,'b'))) for r in rows)))
fields = {k for r in catalog for k in r}
print('Campos de eventos no catálogo', sorted(fields & {'student_id','is_correct','timestamp','selected_difficulty','model_version','dataset_version'}))
print('Habilidade ausente', {s: sum(r.get('skill') is None for r in rows) for s, rows in eligible_groups.items()})
print('Maiores b', [(r['id'], r['area'], r['year'], r['application_type'], r['tri'], r['ready_text'])
                    for r in sorted(catalog, key=lambda r: tri(r,'b'), reverse=True)[:8]])
print('Pedagogia certificada por humano', sum((r.get('quality_review') or {}).get('human_certified') is True for r in catalog))

assert all(valid(key, tri(r, key)) for r in catalog for key in ('a','b','c'))
print('PASS: no missing or invalid TRI parameters under the specified domain checks')


summary = {
    'dataset_revision': commit,
    'run_utc': datetime.now(timezone.utc).isoformat(),
    'python': platform.python_version(),
    'hashes': hashes,
    'catalog_count': len(catalog),
    'splits': {
        s: {'raw': len(groups[s]), 'eligible': len(eligible_groups[s]),
            'difficulty': dict(Counter(difficulty(tri(r, 'b')) for r in eligible_groups[s]))}
        for s in splits
    },
    'tri': {
        name: {key: {'min': min(vals), 'median': statistics.median(vals), 'max': max(vals),
                     'quartiles': statistics.quantiles(vals, n=4, method='inclusive'),
                     'valid': len(vals), 'missing': sum(tri(r,key) is None for r in rows),
                     'invalid': sum(tri(r,key) is not None and not valid(key,tri(r,key)) for r in rows)}
               for key in ('a','b','c')
               if (vals := [tri(r,key) for r in rows if valid(key,tri(r,key))])}
        for name, rows in {'catalog': catalog, **groups}.items()
    },
    'difficulty_cutoffs': [lower, upper],
    'blocked_ids': sorted(blocked),
    'near_duplicates_flagged': len(near),
    'student_event_fields': sorted(fields & {'student_id','is_correct','timestamp','selected_difficulty'}),
    'checks_passed': ['sha256', 'counts', 'unique_ids', 'catalog_match',
                      'eligibility', 'blocked_items', 'split_isolation', 'tri_domains'],
}
args.output.parent.mkdir(parents=True, exist_ok=True)
args.output.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
