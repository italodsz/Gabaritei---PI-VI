"""Frozen ENEM v2 -> reproducible content representations; no student model training.

Run: python pipeline.py --source /absolute/path/Gabaritei_git_experimento_v2
No input file is modified. Models fit only on asset-free train questions.
"""
import argparse
import collections
import csv
import hashlib
import html
import importlib.metadata
import json
import os
import platform
import re
import subprocess
import sys
import time
import unicodedata
from pathlib import Path

import joblib
import numpy as np
from scipy import sparse
from sklearn.decomposition import TruncatedSVD
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import normalize
from threadpoolctl import threadpool_limits

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'resultados'
MODEL = ROOT / 'modelos'


def digest(path):
    h = hashlib.sha256()
    with Path(path).open('rb') as f:
        for b in iter(lambda: f.read(1024 * 1024), b''):
            h.update(b)
    return h.hexdigest()


def write_json(path, obj):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_text(json.dumps(obj, ensure_ascii=False, indent=2, allow_nan=False) + '\n')


def write_jsonl(path, rows):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with Path(path).open('w') as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False, allow_nan=False) + '\n')


def clean(text):
    text = str(text or '').replace('\\n', '\n').replace('\\t', '\t')
    text = html.unescape(unicodedata.normalize('NFC', text))
    text = re.sub(r'!\[[^\]]*\]\([^)]*\)', ' [imagem] ', text)
    text = re.sub(r'<img\b[^>]*>', ' [imagem] ', text, flags=re.I)
    text = re.sub(r'\[([^\]]+)\]\(https?://[^)]+\)', r'\1', text)
    text = re.sub(r'https?://\S+', ' ', text)
    text = re.sub(r'\[imagem\]', ' ', text, flags=re.I)
    text = text.replace('**', '').replace('__', '')
    return re.sub(r'\s+', ' ', text).strip()


def question_text(q):
    # Deliberately never read answer, skill, TRI, area or generated pedagogy here.
    options = sorted(q['options'], key=lambda x: x['label'])
    return '\n'.join([clean(q['question'])] + [clean(o.get('text', '')) for o in options]).strip()


def load_source(source):
    rows = [json.loads(s) for s in (source / 'data/questions.jsonl').read_text().splitlines()]
    assert len(rows) == 2971 and len({q['id'] for q in rows}) == len(rows)
    assert all(q['year'] <= 2024 and not q['is_abandoned_official'] for q in rows)
    for split, expected in [('train', 2616), ('validation', 177), ('test', 178)]:
        split_rows = [json.loads(s) for s in (source / f'splits/{split}.jsonl').read_text().splitlines()]
        assert len(split_rows) == expected
        assert {q['id'] for q in split_rows} == {q['id'] for q in rows if q['split'] == split}
    family_splits = collections.defaultdict(set)
    for q in rows:
        family_splits[q['content_family_id']].add(q['split'])
    assert all(len(s) == 1 for s in family_splits.values())
    return rows


def make_chunks(token_ids, max_payload, overlap):
    assert 0 <= overlap < max_payload
    if not token_ids:
        raise ValueError('Empty token sequence')
    chunks = []
    start = 0
    while True:
        chunks.append(token_ids[start:start + max_payload])
        if start + max_payload >= len(token_ids):
            break
        start += max_payload - overlap
    return chunks


class ChunkEncoder:
    def __init__(self, config):
        import torch
        from sentence_transformers import SentenceTransformer
        from huggingface_hub import model_info
        self.torch = torch
        torch.set_num_threads(config['cpu_threads'])
        torch.manual_seed(42)
        self.config = config
        self.revision = config['revision'] or model_info(config['model_id']).sha
        self.model = SentenceTransformer(config['model_id'], revision=self.revision,
                                         device='cpu', trust_remote_code=False)
        self.model.eval()
        self.tokenizer = self.model.tokenizer
        self.limit = self.model.max_seq_length
        self.payload = self.limit - self.tokenizer.num_special_tokens_to_add(pair=False)
        # This pinned model uses <s> payload </s>. Check rather than assume layout.
        probe = self.tokenizer('verificação', add_special_tokens=False)['input_ids']
        assert self.tokenizer('verificação')['input_ids'] == [self.tokenizer.cls_token_id] + probe + [self.tokenizer.sep_token_id]
        assert self.tokenizer.num_special_tokens_to_add(pair=False) == 2

    def encode(self, texts, progress=False):
        torch = self.torch
        docs = self.tokenizer(texts, add_special_tokens=False, truncation=False,
                              return_attention_mask=False)['input_ids']
        chunks, owners = [], []
        lengths = []
        for i, ids in enumerate(docs):
            parts = make_chunks(ids, self.payload, self.config['chunk_overlap'])
            chunks.extend(parts)
            owners.extend([i] * len(parts))
            lengths.append({'tokens': len(ids), 'chunks': len(parts)})
        result = np.zeros((len(texts), self.model.get_sentence_embedding_dimension()), dtype=np.float32)
        counts = np.zeros(len(texts), dtype=np.int32)
        # Length sorting only optimizes padding. Every token chunk is kept.
        order = sorted(range(len(chunks)), key=lambda i: len(chunks[i]))
        batch = self.config['batch_size']
        for start in range(0, len(order), batch):
            chosen = order[start:start + batch]
            encoded = [{'input_ids': [self.tokenizer.cls_token_id] + chunks[i] + [self.tokenizer.sep_token_id],
                        'attention_mask': [1] * (len(chunks[i]) + 2)} for i in chosen]
            features = self.tokenizer.pad(encoded, padding=True, return_tensors='pt')
            assert features['input_ids'].shape[1] <= self.limit
            with torch.inference_mode():
                vectors = self.model(features)['sentence_embedding']
                vectors = torch.nn.functional.normalize(vectors, p=2, dim=1).cpu().numpy()
            for chunk_i, vector in zip(chosen, vectors):
                result[owners[chunk_i]] += vector
                counts[owners[chunk_i]] += 1
            if progress and (start // batch) % 25 == 0:
                print(f'MiniLM chunks {start + len(chosen)}/{len(order)}', flush=True)
        result /= counts[:, None]
        return normalize(result).astype(np.float32), lengths


def rank_unique(scores, rows, gallery, query_family=None, area=None, k=5):
    chosen, families = [], set()
    for pos in np.argsort(-scores, kind='stable'):
        row_i = int(gallery[pos])
        row = rows[row_i]
        fam = row['content_family_id']
        if fam == query_family or fam in families or (area and row['area'] != area):
            continue
        families.add(fam)
        chosen.append({'rank': len(chosen) + 1, 'id': row['id'], 'score': float(scores[pos]),
                       'area': row['area'], 'skill': row['skill'], 'year': row['year'],
                       'content_family_id': fam, 'text': question_text(row)})
        if len(chosen) == k:
            break
    return chosen


def dot_gallery(query_vectors, gallery_vectors):
    scores = query_vectors @ gallery_vectors.T
    return scores.toarray() if sparse.issparse(scores) else np.asarray(scores)


def vec_audit(name, vectors):
    if sparse.issparse(vectors):
        norms = np.sqrt(vectors.multiply(vectors).sum(axis=1)).A1
        finite = bool(np.isfinite(vectors.data).all())
        unique = len({hashlib.sha256(vectors.getrow(i).indices.tobytes() +
                                    vectors.getrow(i).data.tobytes()).hexdigest()
                      for i in range(vectors.shape[0])})
        mem = vectors.data.nbytes + vectors.indices.nbytes + vectors.indptr.nbytes
    else:
        norms = np.linalg.norm(vectors, axis=1)
        finite = bool(np.isfinite(vectors).all())
        unique = len({hashlib.sha256(x.tobytes()).hexdigest() for x in vectors})
        mem = vectors.nbytes
    assert finite and (norms > 0).all() and unique > 1
    return {'method': name, 'shape': list(vectors.shape), 'finite': finite,
            'zero_vectors': int((norms == 0).sum()), 'exact_distinct_vectors': unique,
            'min_norm': float(norms.min()), 'max_norm': float(norms.max()),
            'matrix_bytes_in_memory': int(mem)}


def evaluate_proxies(name, vectors, rows, train, val, seed):
    # No test rankings. Official labels are diagnostics, not topical relevance truth.
    scores = dot_gallery(vectors[val], vectors[train])
    rng = np.random.default_rng(seed)
    output, area_at5, skill_at5, skill_within, random_area, random_skill_within = [], [], [], [], [], []
    all_areas = sorted({q['area'] for q in rows})
    per_area = {a: [] for a in all_areas}
    for j, i in enumerate(val):
        q = rows[i]
        ranked = rank_unique(scores[j], rows, train, q['content_family_id'])
        same_area = rank_unique(scores[j], rows, train, q['content_family_id'], q['area'])
        match = np.mean([r['area'] == q['area'] for r in ranked])
        area_at5.append(float(match)); per_area[q['area']].append(float(match))
        # Random baseline scores rows uniformly, then applies the same family dedup.
        random_ranked = rank_unique(rng.random(len(train)), rows, train, q['content_family_id'])
        random_area.append(float(np.mean([r['area'] == q['area'] for r in random_ranked])))
        if q['skill'] is not None:
            # Missing candidate labels count as not matching, with this policy explicit.
            skill_at5.append(float(np.mean([(r['area'], r['skill']) == (q['area'], q['skill']) for r in ranked])))
            skill_within.append(float(np.mean([r['skill'] == q['skill'] for r in same_area])))
            rand_in = rank_unique(rng.random(len(train)), rows, train, q['content_family_id'], q['area'])
            random_skill_within.append(float(np.mean([r['skill'] == q['skill'] for r in rand_in])))
        output.append({'method': name, 'query_id': q['id'], 'query_area': q['area'],
                       'query_skill': q['skill'], 'global_top5': ranked, 'same_area_top5': same_area})
    write_jsonl(OUT / f'rankings_validation_{name}.jsonl', output)
    metrics = {'method': name, 'queries': len(val), 'gallery_rows': len(train),
               'area_agreement_at5': float(np.mean(area_at5)),
               'area_agreement_by_query_area': {a: {'n': len(v), 'mean': float(np.mean(v))} for a, v in per_area.items()},
               'queries_with_official_skill': len(skill_at5),
               'official_area_skill_agreement_at5': float(np.mean(skill_at5)),
               'official_skill_agreement_at5_within_area': float(np.mean(skill_within)),
               'random_area_agreement_at5': float(np.mean(random_area)),
               'random_skill_agreement_at5_within_area': float(np.mean(random_skill_within)),
               'semantic_relevance_measured': False, 'test_rankings_executed': False}
    return metrics


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', required=True, type=Path)
    args = parser.parse_args()
    source = args.source.resolve()
    OUT.mkdir(exist_ok=True); MODEL.mkdir(exist_ok=True)
    cfg_path = ROOT / 'config_resolved.json'
    config = json.loads((cfg_path if cfg_path.exists() else ROOT / 'config.json').read_text())
    start_all = time.perf_counter()
    before = {str(p.relative_to(source)): digest(p) for p in sorted(source.rglob('*')) if p.is_file()}
    validator = subprocess.run([sys.executable, str(source / 'validar.py')], capture_output=True, text=True)
    (OUT / 'validacao_v2_original.txt').write_text(validator.stdout + validator.stderr)
    assert validator.returncode == 0 and 'PASS' in validator.stdout
    rows = load_source(source)
    texts = [question_text(q) for q in rows]
    assert all(texts)
    train = np.array([i for i,q in enumerate(rows) if q['split'] == 'train' and not q['assets']])
    val = np.array([i for i,q in enumerate(rows) if q['split'] == 'validation' and not q['assets']])
    test = [i for i,q in enumerate(rows) if q['split'] == 'test' and not q['assets']]
    assert (len(train), len(val), len(test)) == (1830, 136, 127)
    docs = [{'row_index': i, 'id': q['id'], 'split': q['split'], 'area': q['area'],
             'skill': q['skill'], 'year': q['year'], 'language': q['language'],
             'content_family_id': q['content_family_id'], 'has_assets': bool(q['assets']),
             'scope': 'secondary_partial_visual_text' if q['assets'] else 'primary_text_only',
             'text': texts[i], 'text_sha256': hashlib.sha256(texts[i].encode()).hexdigest()}
            for i,q in enumerate(rows)]
    write_jsonl(OUT / 'documentos.jsonl', docs)
    write_json(OUT / 'indices.json', {'train_text_only': train.tolist(), 'validation_text_only': val.tolist(),
                                     'test_text_only': test, 'all_rows': [q['id'] for q in rows]})
    write_jsonl(OUT / 'cobertura_visual.jsonl', [{'id': q['id'], 'assets': len(q['assets']),
                 'descriptions': len(q['descriptions']),
                 'descriptions_reviewed_flag': sum(bool(d.get('reviewed')) for d in q['descriptions']),
                 'descriptions_used': 0, 'reason': 'No independent human semantic approval established'}
                for q in rows if q['assets']])
    print('Inputs prepared; source preserved; fit rows:', len(train), flush=True)
    times = {}
    tf_cfg = dict(config['tfidf']); tf_cfg['ngram_range'] = tuple(tf_cfg['ngram_range'])
    vectorizer = TfidfVectorizer(**tf_cfg, dtype=np.float32, norm='l2')
    t = time.perf_counter()
    with threadpool_limits(limits=4):
        vectorizer.fit([texts[i] for i in train])
        tf = vectorizer.transform(texts)
    times['tfidf_fit_and_transform_all_seconds'] = time.perf_counter() - t
    joblib.dump(vectorizer, MODEL / 'tfidf.joblib', compress=3)
    assert (joblib.load(MODEL / 'tfidf.joblib').transform(texts) != tf).nnz == 0
    sparse.save_npz(OUT / 'tfidf.npz', tf)
    t = time.perf_counter()
    svd = TruncatedSVD(**config['svd'], random_state=config['seed'])
    with threadpool_limits(limits=4):
        svd.fit(tf[train])
        reduced = normalize(svd.transform(tf)).astype(np.float32)
    times['svd_fit_and_transform_all_seconds'] = time.perf_counter() - t
    joblib.dump(svd, MODEL / 'svd.joblib')
    assert np.allclose(joblib.load(MODEL / 'svd.joblib').components_, svd.components_)
    np.save(OUT / 'tfidf_svd.npy', reduced, allow_pickle=False)
    print('TF-IDF and SVD done', flush=True)
    t = time.perf_counter()
    encoder = ChunkEncoder(config['minilm'])
    times['minilm_load_and_download_seconds'] = time.perf_counter() - t
    # Freeze actual model identity after resolution; reruns use this revision.
    revision = encoder.revision
    config['minilm']['revision'] = revision
    write_json(ROOT / 'config_resolved.json', config)
    t = time.perf_counter()
    mini, lengths = encoder.encode(texts, progress=True)
    times['minilm_encode_all_seconds'] = time.perf_counter() - t
    np.save(OUT / 'minilm_chunks.npy', mini, allow_pickle=False)
    write_jsonl(OUT / 'tokenizacao_minilm.jsonl', [{'id': q['id'], **length} for q,length in zip(rows,lengths)])
    vectors = {'tfidf': tf, 'tfidf_svd': reduced, 'minilm': mini}
    audits = [vec_audit(n, v) for n,v in vectors.items()]
    write_json(OUT / 'integridade_vetores.json', audits)
    # Sanity checks: encoding is deterministic and short encoding equals standard model.encode.
    short = ['Porcentagem e descontos em compras.', 'Seleção natural e evolução.']
    a,_ = encoder.encode(short)
    b = encoder.model.encode(short, normalize_embeddings=True, show_progress_bar=False)
    assert np.allclose(a, b, atol=2e-5), float(np.max(np.abs(a-b)))
    assert np.allclose(a, encoder.encode(short)[0], atol=2e-5)
    write_json(OUT / 'sanity_tests.json', {'short_chunk_vs_standard_max_abs_difference': float(np.max(np.abs(a-b))),
                'reencode_deterministic': True, 'all_finite_nonzero': True})
    metrics = []
    for name, value in vectors.items():
        metrics.append(evaluate_proxies(name, value, rows, train, val, config['seed']))
    write_json(OUT / 'metricas_proxy_validacao.json', metrics)
    demo_text = [d['text'] for d in config['demo_queries']]
    qtf = vectorizer.transform(demo_text)
    with threadpool_limits(limits=4):
        qsvd = normalize(svd.transform(qtf)).astype(np.float32)
    qmini,_ = encoder.encode(demo_text)
    demos = []
    for name, qvec in [('tfidf', qtf), ('tfidf_svd', qsvd), ('minilm', qmini)]:
        scores = dot_gallery(qvec, vectors[name][train])
        for j, query in enumerate(config['demo_queries']):
            ranked = rank_unique(scores[j], rows, train, area=query['area'])
            demos.append({'method': name, **query, 'area_filter_applied': True, 'results': ranked})
    write_jsonl(OUT / 'buscas_demonstracao.jsonl', demos)
    # Warm, single-query encode + exact search + family dedup. No network/cold boot.
    latency = {}
    for name in vectors:
        durations = []
        gallery_vec = vectors[name][train]
        for rep in range(3):
            for d in config['demo_queries']:
                t = time.perf_counter()
                if name == 'tfidf':
                    query_vec = vectorizer.transform([d['text']])
                elif name == 'tfidf_svd':
                    with threadpool_limits(limits=4):
                        query_vec = normalize(svd.transform(vectorizer.transform([d['text']])))
                else:
                    query_vec,_ = encoder.encode([d['text']])
                scores = dot_gallery(query_vec, gallery_vec)[0]
                rank_unique(scores, rows, train, area=d['area'])
                durations.append(1000 * (time.perf_counter() - t))
        latency[name] = {'warm_queries': len(durations), 'median_ms': float(np.median(durations)),
                         'p95_ms': float(np.percentile(durations, 95)), 'single_process_cpu': True}
    write_json(OUT / 'latencia.json', latency)
    # Human review packet: blinded candidate IDs shared across methods, blank labels.
    pooled = {}
    for d in demos:
        for r in d['results']:
            key = (d['id'], r['id'])
            pooled[key] = {'query_id': d['id'], 'query_text': d['text'], 'area_filter': d['area'],
                           'candidate_id': r['id'], 'candidate_text': r['text'],
                           'relevance_0_1_2': '', 'reviewer': '', 'notes': ''}
    pooled_rows = list(pooled.values())
    np.random.default_rng(config['seed']).shuffle(pooled_rows)
    with (OUT / 'avaliacao_humana_preencher.csv').open('w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=list(pooled_rows[0])); writer.writeheader(); writer.writerows(pooled_rows)
    environment = {'python': sys.version, 'platform': platform.platform(), 'cpu_logical': os.cpu_count(),
                   'packages': {p: importlib.metadata.version(p) for p in
                   ['numpy','scipy','scikit-learn','torch','sentence-transformers','transformers','tokenizers','huggingface-hub','joblib','threadpoolctl']}}
    write_json(OUT / 'ambiente.json', environment)
    (ROOT / 'requirements-lock.txt').write_text('\n'.join(f'{p}=={v}' for p,v in environment['packages'].items()) + '\n')
    after = {str(p.relative_to(source)): digest(p) for p in sorted(source.rglob('*')) if p.is_file()}
    assert before == after, 'Source mutated during experiment'
    write_json(OUT / 'hashes_fonte_preservada.json', before)
    summary = {'source_questions': len(rows), 'suspended_untouched': 98,
         'primary_text_only': 2093, 'secondary_visual_partial_text': 878,
         'fit_rows': len(train), 'validation_queries': len(val), 'test_rows_not_ranked': len(test),
         'text_distinct': len(set(texts)), 'source_unchanged': True,
         'svd_explained_variance_ratio_sum': float(svd.explained_variance_ratio_.sum()),
         'minilm_revision': revision, 'minilm_max_seq_length': encoder.limit,
         'minilm_payload_tokens': encoder.payload, 'minilm_chunk_overlap': config['minilm']['chunk_overlap'],
         'minilm_total_chunks': sum(x['chunks'] for x in lengths),
         'minilm_docs_exceeding_single_window': sum(x['chunks'] > 1 for x in lengths),
         'minilm_primary_docs_exceeding_single_window': sum(x['chunks'] > 1 for x,q in zip(lengths,rows) if not q['assets']),
         'minilm_token_max': max(x['tokens'] for x in lengths),
         'minilm_token_median': float(np.median([x['tokens'] for x in lengths])),
         'descriptions_used': 0, 'human_reviews_completed': 0,
         'human_review_candidate_pairs': len(pooled_rows),
         'supervised_models_trained': False, 'neural_finetuning_performed': False,
         'best_relevance_model_proven': False, 'times': times,
         'total_pipeline_seconds': time.perf_counter() - start_all}
    write_json(OUT / 'resumo_execucao.json', summary)
    print(json.dumps(summary, ensure_ascii=False, indent=2), flush=True)


if __name__ == '__main__':
    main()
