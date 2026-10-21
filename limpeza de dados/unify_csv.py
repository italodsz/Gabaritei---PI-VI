"""Make one analysis-ready CSV from every acquired ENEM row.

The CSV keeps source occurrences. `canonical` marks one representative of each
exact normalized question, so vector indexes can avoid duplicate embeddings.
"""
import ast
import csv
import hashlib
import json
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path
from rapidfuzz.fuzz import ratio

from pipeline import ROOT, clean, choices, records

COLUMNS = [
    'record_id', 'source', 'source_file', 'source_row', 'source_id', 'year',
    'question_number', 'question_text', 'context_text', 'image_description',
    'option_a', 'option_b', 'option_c', 'option_d', 'option_e', 'answer',
    'vector_text', 'question_hash', 'vector_group_id', 'duplicate_count', 'canonical',
    'answer_conflict', 'option_variant_count',
    'embed_eligible', 'training_eligible', 'split', 'record_type', 'quality_flags',
]

def parse_row(row, source, path, index):
    q = clean(row.get('question') or row.get('question_stem') or row.get('enunciado') or row.get('statement') or row.get('input') or (row.get('description') if source == 'zenodo_questions' else ''))
    context = clean(row.get('context'))
    description = row.get('description') or row.get('descricao') or row.get('image_descriptions') or ''
    if isinstance(description, list):
        description = ' | '.join(clean(v) for v in description)
    description = clean(description)
    opts = choices(row.get('choices') or row.get('alternatives') or row.get('alternatives_text') or row.get('options'))
    if source == 'zenodo_questions':
        try:
            opts = [re.sub(r'^[A-E][).:-]\s*', '', clean(x)) for x in ast.literal_eval(row.get('alternatives') or '[]')]
        except (ValueError, SyntaxError, TypeError):
            opts = []
    if source == 'ocr':
        opts = [clean(row.get('option_' + k)) for k in 'abcde']
    if source == 'mm_eval':
        try:
            messages = json.loads(row['messages']) if isinstance(row.get('messages'), str) else row['messages']
            first = messages[0]
            q = clean(first.get('question'))
            opts = choices(first.get('options') or first.get('choices'))
        except (ValueError, KeyError, IndexError, TypeError):
            pass
    if source == 'audio_description':
        # One row describes a figure. Its prose alternatives are not split safely.
        opts = []
    answer = clean(row.get('answerKey') or row.get('ground_truth') or row.get('label') or row.get('answer') or row.get('correct_answer') or row.get('gabarito') or row.get('output')).upper()
    if source == 'sapiens_2025':
        match = re.match(r'^([A-E])\s*[).:-]', answer)
        answer = match.group(1) if match else ''
    year_raw = clean(row.get('exam_year') or row.get('year') or row.get('ano') or row.get('exam') or row.get('exam_edition') or path.name)
    match = re.search(r'(?:19|20)\d{2}', year_raw)
    year = match.group() if match else ''
    number = clean(row.get('question_number') or row.get('questao') or row.get('num') or row.get('index_question') or '')
    source_id = clean(row.get('id'))
    if not number:
        match = re.search(r'(?:questao|q)[_ -]?(\d+)', source_id, re.I)
        number = match.group(1) if match else ''
    full_q = clean(context + ' ' + q) if context else q
    flags = []
    if len(full_q) < 40: flags.append('short_or_missing_question')
    if len(opts) != 5 or any(not x for x in opts): flags.append('incomplete_options')
    if answer not in 'ABCDE' or len(answer) != 1: flags.append('invalid_answer')
    if not year: flags.append('missing_year')
    if row.get('nullified'): flags.append('nullified')
    if '[[placeholder]]' in full_q: flags.append('visual_placeholder')
    if source in ('2025_d1', '2025_d2') and (row.get('statement_image') is not None or row.get('alternatives_images')): flags.append('visual_asset')
    if source == 'ocr' and row.get('has_images') and not row.get('image_descriptions'): flags.append('visual_asset')
    if source == 'audio_description': flags.append('auxiliary_description')
    if source == 'sapiens_2025': flags.append('answer_only_format')
    normalized = re.sub(r'\W+', '', full_q.casefold())
    qhash = hashlib.sha256(normalized.encode('utf-8')).hexdigest() if normalized else ''
    embed = len(full_q) >= 40 and '[[placeholder]]' not in full_q
    train = embed and len(opts) == 5 and all(opts) and len(answer) == 1 and answer in 'ABCDE' and bool(year) and not row.get('nullified') and not any(f in flags for f in ('visual_asset', 'auxiliary_description', 'answer_only_format'))
    kind = 'description' if source == 'audio_description' else ('question_answer' if source == 'sapiens_2025' else 'multiple_choice')
    rid = hashlib.sha256(f'{source}|{path.relative_to(ROOT)}|{index}'.encode()).hexdigest()[:20]
    return {
        'record_id': rid, 'source': source, 'source_file': str(path.relative_to(ROOT)),
        'source_row': index, 'source_id': source_id, 'year': year,
        'question_number': number, 'question_text': q, 'context_text': context,
        'image_description': description,
        **{f'option_{k}': opts[i] if i < len(opts) else '' for i, k in enumerate('abcde')},
        'answer': answer, 'vector_text': full_q if embed else '',
        'question_hash': qhash, 'vector_group_id': '', 'duplicate_count': 0, 'canonical': False,
        'answer_conflict': False, 'option_variant_count': 0,
        'embed_eligible': embed, 'training_eligible': train, 'split': '',
        'record_type': kind, 'quality_flags': '|'.join(flags),
    }

def main():
    manifest = json.loads((ROOT / 'manifests' / 'acquisition.json').read_text(encoding='utf-8'))
    rows = []
    errors = []
    for item in manifest['files']:
        path = ROOT / item['path']
        try:
            for i, raw in enumerate(records(path), 1):
                if isinstance(raw, dict): rows.append(parse_row(raw, item['source'], path, i))
        except Exception as exc:
            errors.append({'path': str(path), 'error': str(exc)})
    groups = defaultdict(list)
    for row in rows:
        if row['question_hash'] and row['embed_eligible']:
            groups[row['question_hash']].append(row)
    # Exact matches are joined first, then high-confidence near matches caused by
    # headings, accents, whitespace and small OCR changes. Requiring the same
    # question ending avoids merging two items that share a long source passage.
    hashes = list(groups)
    parent = {h: h for h in hashes}
    def find(h):
        while parent[h] != h:
            parent[h] = parent[parent[h]]
            h = parent[h]
        return h
    def union(a, b):
        a, b = find(a), find(b)
        if a != b:
            parent[max(a, b)] = min(a, b)
    def near_norm(value):
        value = unicodedata.normalize('NFKD', value.casefold())
        value = ''.join(c for c in value if not unicodedata.combining(c))
        return re.sub(r'[^a-z0-9]+', '', value)
    by_tail = defaultdict(list)
    for h, group in groups.items():
        sample = group[0]
        normalized = near_norm(sample['vector_text'])
        if len(normalized) >= 40:
            by_tail[normalized[-40:]].append((h, normalized))
    near_pairs = 0
    for items in by_tail.values():
        for i, (ha, qa) in enumerate(items):
            for hb, qb in items[i + 1:]:
                if min(len(qa), len(qb)) / max(len(qa), len(qb)) < .93: continue
                if ratio(qa, qb, score_cutoff=97) >= 97:
                    union(ha, hb)
                    near_pairs += 1
    merged = defaultdict(list)
    for h, group in groups.items():
        merged[find(h)].extend(group)
    unique_rows = []
    for group in merged.values():
        years = [int(r['year']) for r in group if r['year']]
        split_year = max(years) if years else 0
        split = 'test' if split_year >= 2024 else ('validation' if split_year == 2023 else ('train' if split_year else 'unassigned'))
        valid_answers = {r['answer'] for r in group if len(r['answer']) == 1 and r['answer'] in 'ABCDE'}
        answer_conflict = len(valid_answers) > 1
        option_variants = len({tuple(r[f'option_{k}'] for k in 'abcde') for r in group if r['option_a']})
        for row in group:
            row['answer_conflict'] = answer_conflict
            row['option_variant_count'] = option_variants
            if answer_conflict:
                row['training_eligible'] = False
                row['quality_flags'] = (row['quality_flags'] + '|' if row['quality_flags'] else '') + 'answer_conflict'
        # Prefer a complete text-only multiple-choice record as the representative.
        group.sort(key=lambda r: (not r['training_eligible'], r['source'] == 'challenge_port', r['source'] == 'mm_eval', r['source'] == 'audio_description', r['source_file'], r['source_row']))
        group[0]['canonical'] = True
        unique_rows.append(group[0])
        vector_group_id = group[0]['question_hash']
        for row in group:
            row['vector_group_id'] = vector_group_id
            row['duplicate_count'] = len(group)
            row['split'] = split
    out = ROOT / 'processed'; out.mkdir(exist_ok=True)
    for filename, data in [('enem_unificado.csv', unique_rows), ('enem_todas_ocorrencias.csv', rows)]:
        with (out / filename).open('w', encoding='utf-8-sig', newline='') as stream:
            writer = csv.DictWriter(stream, fieldnames=COLUMNS)
            writer.writeheader(); writer.writerows(data)
    report = {
        'source_rows': dict(Counter(r['source'] for r in rows)),
        'total_source_rows': len(rows),
        'exact_question_groups': len(groups),
        'near_duplicate_pairs': near_pairs,
        'unique_questions': len(unique_rows),
        'embed_eligible_rows': sum(r['embed_eligible'] for r in rows),
        'canonical_embed_rows': len(unique_rows),
        'training_eligible_rows': sum(r['training_eligible'] for r in rows),
        'unique_training_eligible': sum(r['training_eligible'] for r in unique_rows),
        'answer_conflict_groups': sum(any(r['answer_conflict'] for r in group) for group in merged.values()),
        'quality_flags': dict(Counter(f for r in rows for f in r['quality_flags'].split('|') if f)),
        'errors': errors,
    }
    (out / 'unified_report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False))

if __name__ == '__main__': main()
