"""Refaz só o TF-IDF depois de corrigir textos em base/questions.jsonl (11/11/2026).
Mantém indice/minilm.npy e os vetores Qwen (mesma ordem de ids) e registra em indice/config.json
quais questões estão com vetores desatualizados. Para atualizar os vetores Qwen dessas questões,
rode no computador que tem o modelo: python atualizar_qwen_parcial.py"""
import json, joblib
from pathlib import Path
from scipy import sparse
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
import pipeline_baseline as bl
import recomendador as rc
R = Path(__file__).parent; IDX = R / 'indice'; BASE = R / 'base'
rows, el = rc.carregar()
docs = json.loads((IDX / 'documentos.json').read_text())
ids = [d['id'] for d in docs]
texts = [bl.question_text(rows[i]) for i in ids]
cfg = json.loads((BASE / 'config_baseline.json').read_text())
p = dict(cfg['tfidf']); p['ngram_range'] = tuple(p['ngram_range'])
ntrain = sum(1 for d in docs if d['split'] == 'train')
tf = TfidfVectorizer(**p, norm='l2', dtype=np.float32).fit(texts[:ntrain])
joblib.dump(tf, IDX / 'tfidf.joblib', compress=3); sparse.save_npz(IDX / 'tfidf.npz', tf.transform(texts))
for d in docs: d['area'] = rows[d['id']]['area']
(IDX / 'documentos.json').write_text(json.dumps(docs, ensure_ascii=False))
conf = json.loads((IDX / 'config.json').read_text())
corr = [i for i in ids if rows[i].get('correcao_texto')]
conf['base_sha256'] = rc.sha(BASE / 'questions.jsonl'); conf['tfidf_vocabulario'] = len(tf.vocabulary_)
conf['qwen_vetores_desatualizados'] = corr; conf['minilm_vetores_desatualizados'] = sorted(set(conf.get('minilm_vetores_desatualizados', [])) | set(corr))
conf['textos_corrigidos_em'] = '2026-11-11'
(IDX / 'config.json').write_text(json.dumps(conf, ensure_ascii=False, indent=2))
print('TF-IDF refeito;', len(corr), 'questões com vetores Qwen/MiniLM desatualizados')
