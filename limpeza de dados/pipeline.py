"""Reproducible ENEM source acquisition and conservative question normalization."""
import argparse
import ast
import csv
import hashlib
import json
import re
import urllib.request
import zipfile
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SOURCES = {
    'maritaca': 'maritaca-ai/enem',
    'challenge': 'eduagarcia/enem_challenge',
    'audio_description': 'tardellirs/enem-audiodescricao',
    'ocr': 'candido-ai/enem-ocr',
    '2025_d1': 'rlimazzz/enem-2025-d1-multimodal',
    '2025_d2': 'rlimazzz/enem-2025-d2-multimodal',
    'sapiens_2025': 'sapiens-technology/enem_2025',
    'mm_eval': 'mm-eval/ENEM',
    'challenge_port': 'nicholasKluge/enem_challenge',
}
HEADERS = {'User-Agent': 'data-EEnem-research/1.0'}

def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=90)

def download(url, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and path.stat().st_size:
        return
    temp = path.with_name(path.name + '.part')
    with get(url) as response, temp.open('wb') as out:
        while block := response.read(1024 * 1024):
            out.write(block)
    temp.replace(path)

def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        while block := stream.read(1024 * 1024):
            digest.update(block)
    return digest.hexdigest()

def acquire():
    manifest = {'retrieved_at_utc': datetime.now(timezone.utc).isoformat(), 'files': [], 'errors': []}
    for label, repo in SOURCES.items():
        try:
            info = json.load(get('https://huggingface.co/api/datasets/' + repo))
            revision = info['sha']
            for entry in info.get('siblings', []):
                name = entry['rfilename']
                if not (name.endswith(('.jsonl', '.parquet', '.csv')) and (name.startswith('data/') or name.startswith('corpus/') or '/' not in name)):
                    continue
                if label == 'audio_description' and name.startswith('corpus/') and name != 'corpus/registros.jsonl':
                    continue
                path = ROOT / 'raw' / label / name
                url = f'https://huggingface.co/datasets/{repo}/resolve/{revision}/{name}'
                try:
                    download(url, path)
                    manifest['files'].append({'source': label, 'repo': repo, 'revision': revision, 'path': str(path.relative_to(ROOT)), 'url': url, 'bytes': path.stat().st_size, 'sha256': sha256(path)})
                except Exception as exc:
                    manifest['errors'].append({'source': label, 'file': name, 'error': str(exc)})
        except Exception as exc:
            manifest['errors'].append({'source': label, 'error': str(exc)})
    try:
        mirror = 'https://raw.githubusercontent.com/wineone/tcc-matheus-lisboa/main/02-dataset/data/cleaned/enem_questions.zip'
        archive = ROOT / 'raw' / 'zenodo_8301716' / 'enem_questions.zip'
        download(mirror, archive)
        expected_md5 = '0389950866be9f8466e2016dcad311be'
        if hashlib.md5(archive.read_bytes()).hexdigest() != expected_md5:
            raise ValueError('Zenodo archive MD5 does not match published record')
        with zipfile.ZipFile(archive) as bundle:
            data = bundle.read('all_questions_df.csv')
        path = archive.parent / 'all_questions_df.csv'
        path.write_bytes(data)
        manifest['files'].append({'source': 'zenodo_questions', 'repo': 'zenodo:8301716', 'revision': '0.0.1', 'path': str(path.relative_to(ROOT)), 'url': 'https://zenodo.org/records/8301716', 'download_mirror': mirror, 'archive_md5': expected_md5, 'bytes': path.stat().st_size, 'sha256': sha256(path)})
    except Exception as exc:
        manifest['errors'].append({'source': 'zenodo_questions', 'error': str(exc)})
    path = ROOT / 'manifests' / 'acquisition.json'
    path.parent.mkdir(exist_ok=True)
    path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    return manifest

def records(path):
    if path.suffix == '.jsonl':
        with path.open(encoding='utf-8') as stream:
            for line in stream:
                if line.strip():
                    yield json.loads(line)
    elif path.suffix == '.csv':
        with path.open(encoding='utf-8-sig', newline='') as stream:
            yield from csv.DictReader(stream)
    elif path.suffix == '.parquet':
        import pyarrow.parquet as pq
        reader = pq.ParquetFile(path)
        for batch in reader.iter_batches(batch_size=512):
            yield from batch.to_pylist()

def clean(value):
    return re.sub(r'\s+', ' ', str(value or '')).strip()

def choices(value):
    if isinstance(value, dict):
        if all(k in value for k in 'ABCDE'):
            return [clean(value[k]) for k in 'ABCDE']
        value = value.get('text') or value.get('alternatives') or value.get('choices') or value
    if isinstance(value, list):
        return [clean(v.get('text') if isinstance(v, dict) else v) for v in value]
    return []

def normalize(row, source, path, index):
    question = clean(row.get('question') or row.get('question_stem') or row.get('enunciado') or row.get('pergunta') or row.get('statement') or (row.get('description') if source == 'zenodo_questions' else ''))
    if source == 'ocr': question = clean(row.get('context')) + ' ' + question
    options = choices(row.get('choices') or row.get('alternatives') or row.get('alternatives_text') or row.get('options'))
    if source == 'zenodo_questions':
        try:
            options = [re.sub(r'^[A-E][).:-]\s*', '', clean(x)) for x in ast.literal_eval(row.get('alternatives') or '[]')]
        except (ValueError, SyntaxError, TypeError):
            options = []
    if source == 'ocr': options = [clean(row.get('option_' + x)) for x in 'abcde']
    if source == 'mm_eval':
        try:
            msg = json.loads(row['messages']) if isinstance(row.get('messages'), str) else row['messages']
            first = msg[0]
            question = clean(first.get('question'))
            options = choices(first.get('alternatives') or first.get('choices') or first.get('options'))
        except (ValueError, KeyError, IndexError, TypeError): pass
    answer = clean(row.get('answerKey') or row.get('ground_truth') or row.get('label') or row.get('answer') or row.get('correct_answer') or row.get('gabarito')).upper()
    year = clean(row.get('exam_year') or row.get('year') or row.get('ano') or row.get('exam') or row.get('exam_edition') or (re.search(r'(?:19|20)\d{2}', str(path)) or [''])[0])
    year_match = re.search(r'(?:19|20)\d{2}', year)
    year = year_match.group() if year_match else ''
    number = clean(row.get('question_number') or row.get('questao') or row.get('num') or row.get('number') or row.get('numero') or row.get('index_question') or '')
    if not number:
        match = re.search(r'(?:questao|q)[_ -]?(\d+)', clean(row.get('id')), re.I)
        number = match.group(1) if match else ''
    quality = []
    if len(question) < 40: quality.append('short_or_missing_question')
    if len(options) != 5 or any(not x for x in options): quality.append('incomplete_options')
    if answer not in 'ABCDE' or len(answer) != 1: quality.append('invalid_answer')
    if not re.fullmatch(r'(?:19|20)\d{2}', year): quality.append('missing_year')
    if row.get('nullified'): quality.append('nullified')
    if '[[placeholder]]' in question or (source in ('2025_d1', '2025_d2') and row.get('statement_image') is not None):
        quality.append('needs_visual_review')
    normalized = re.sub(r'\W+', '', question.casefold())
    fingerprint = hashlib.sha256(normalized.encode()).hexdigest() if normalized else ''
    return {'source': source, 'source_file': str(path.relative_to(ROOT)), 'source_row': index, 'source_id': clean(row.get('id')), 'year': year, 'question_number': number, 'question': question, 'options': options, 'answer': answer, 'fingerprint': fingerprint, 'quality_flags': quality}

def build():
    manifest = json.loads((ROOT / 'manifests' / 'acquisition.json').read_text(encoding='utf-8'))
    out = ROOT / 'processed'; out.mkdir(exist_ok=True)
    counts = Counter(); accepted = []; quarantine = []
    seen = defaultdict(list)
    for item in manifest['files']:
        path = ROOT / item['path']
        try:
            for index, row in enumerate(records(path), 1):
                if not isinstance(row, dict): continue
                record = normalize(row, item['source'], path, index)
                counts[item['source']] += 1
                if record['quality_flags']:
                    quarantine.append(record)
                else:
                    seen[record['fingerprint']].append(record)
        except Exception as exc:
            quarantine.append({'source': item['source'], 'source_file': item['path'], 'quality_flags': ['read_error'], 'error': str(exc)})
    for group in seen.values():
        # Keep each provenance row; split together and designate one primary record.
        if len({r['answer'] for r in group}) > 1:
            for record in group:
                record['quality_flags'].append('answer_conflict')
                quarantine.append(record)
            continue
        group_year = max(int(r['year']) for r in group)
        group_split = 'test' if group_year >= 2024 else ('validation' if group_year == 2023 else 'train')
        for rank, record in enumerate(group):
            record['duplicate_count'] = len(group)
            record['primary'] = rank == 0
            record['split'] = group_split
            accepted.append(record)
    def write(name, rows):
        with (out / name).open('w', encoding='utf-8') as stream:
            for row in rows:
                stream.write(json.dumps(row, ensure_ascii=False, default=str) + '\n')
    write('questions_all.jsonl', accepted)
    write('quarantine.jsonl', quarantine)
    write('train.jsonl', [r for r in accepted if r['primary'] and r['split'] == 'train'])
    write('validation.jsonl', [r for r in accepted if r['primary'] and r['split'] == 'validation'])
    write('test.jsonl', [r for r in accepted if r['primary'] and r['split'] == 'test'])
    report = {'raw_rows_by_source': counts, 'accepted_with_duplicates': len(accepted), 'unique_questions': sum(r['primary'] for r in accepted), 'quarantined': len(quarantine), 'split_counts': dict(Counter(r['split'] for r in accepted if r['primary'])), 'quality_flags': dict(Counter(f for r in quarantine for f in r['quality_flags']))}
    (out / 'quality_report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    return report

if __name__ == '__main__':
    parser = argparse.ArgumentParser(); parser.add_argument('action', choices=['acquire', 'build', 'all']); args = parser.parse_args()
    if args.action in ('acquire', 'all'): print(json.dumps(acquire(), ensure_ascii=False, default=str)[:1000])
    if args.action in ('build', 'all'): print(json.dumps(build(), ensure_ascii=False, default=str))
