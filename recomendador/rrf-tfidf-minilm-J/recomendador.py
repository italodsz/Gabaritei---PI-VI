"""Recomendador do Ítalo, modo RRF (TF-IDF + MiniLM em blocos), sobre a base de trabalho.

Uso:
  python recomendador.py construir --minilm-de PASTA_rc1/entrega/vectors   # reaproveita vetores da v2.1-rc1
  python recomendador.py construir --recodificar                          # recalcula o MiniLM (precisa do modelo)
  python recomendador.py buscar --question-id gq_... [--metodo rrf|tfidf|minilm] [--k 5]
  python recomendador.py avaliar                                          # pares de desenvolvimento (validação)

Regras: TF-IDF ajustado só no treino elegível; galeria = treino elegível; mesma área;
exclui e deduplica a família de conteúdo; texto = enunciado + alternativas (sem gabarito,
habilidade, TRI ou rótulos). Consultas do teste são recusadas.
"""
import argparse, collections, hashlib, json, sys
from pathlib import Path
import joblib, numpy as np
from scipy import sparse
from sklearn.feature_extraction.text import TfidfVectorizer

ROOT = Path(__file__).resolve().parent
BASE, IDX = ROOT / 'base', ROOT / 'indice'
VERSAO = 'italo-rrf-v1 (base de trabalho pós etapas 1-3)'
sys.path.insert(0, str(ROOT))
import pipeline_baseline as bl


def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()


def carregar():
    rows = {q['id']: q for q in map(json.loads, (BASE / 'questions.jsonl').open(encoding='utf-8'))}
    el = json.loads((BASE / 'ids_elegiveis.json').read_text())
    return rows, el


def construir(minilm_de=None, recodificar=False):
    rows, el = carregar()
    ids = el['train'] + el['validation'] + el['test']
    texts = [bl.question_text(rows[i]) for i in ids]
    cfg = json.loads((BASE / 'config_baseline.json').read_text())
    p = dict(cfg['tfidf']); p['ngram_range'] = tuple(p['ngram_range'])
    tf = TfidfVectorizer(**p, norm='l2', dtype=np.float32).fit(texts[:len(el['train'])])
    X = tf.transform(texts)
    IDX.mkdir(exist_ok=True)
    joblib.dump(tf, IDX / 'tfidf.joblib', compress=3)
    sparse.save_npz(IDX / 'tfidf.npz', X)
    desatualizados = []
    if recodificar:
        enc = bl.ChunkEncoder(cfg['minilm'])
        M, _ = enc.encode(texts, progress=True)
    else:
        src = Path(minilm_de)
        docs = [json.loads(l) for l in (src / 'documents.jsonl').open(encoding='utf-8')]
        old = np.load(src / 'minilm.npy')
        pos = {d['id']: k for k, d in enumerate(docs)}
        M = np.stack([old[pos[i]] for i in ids])
        desatualizados = [i for i, t in zip(ids, texts) if docs[pos[i]]['text'] != t]
    np.save(IDX / 'minilm.npy', M.astype(np.float32))
    meta = [{'id': i, 'split': rows[i]['split'], 'area': rows[i]['area'],
             'family': rows[i]['content_family_id']} for i in ids]
    (IDX / 'documentos.json').write_text(json.dumps(meta, ensure_ascii=False))
    conf = {'versao': VERSAO, 'base_sha256': sha(BASE / 'questions.jsonl'),
            'elegiveis': {k: len(v) for k, v in el.items()}, 'tfidf': cfg['tfidf'],
            'tfidf_vocabulario': len(tf.vocabulary_), 'minilm': cfg['minilm'],
            'minilm_origem': 'recodificado' if recodificar else 'reaproveitado da v2.1-rc1',
            'minilm_vetores_desatualizados': desatualizados, 'rrf_k': 60,
            'fine_tuning_neural': False}
    (IDX / 'config.json').write_text(json.dumps(conf, ensure_ascii=False, indent=2))
    print(json.dumps(conf, ensure_ascii=False, indent=2))


class Indice:
    def __init__(self):
        conf = json.loads((IDX / 'config.json').read_text())
        if conf['base_sha256'] != sha(BASE / 'questions.jsonl'):
            raise SystemExit('A base mudou depois do índice; rode "construir" de novo.')
        self.rows, _ = carregar()
        self.conf = conf
        self.docs = json.loads((IDX / 'documentos.json').read_text())
        self.pos = {d['id']: k for k, d in enumerate(self.docs)}
        self.X = sparse.load_npz(IDX / 'tfidf.npz')
        self.M = np.load(IDX / 'minilm.npy')

    def ranking(self, qid, metodo='rrf'):
        qi = self.pos[qid]; q = self.docs[qi]
        pool = np.array([k for k, d in enumerate(self.docs) if d['split'] == 'train'
                         and d['area'] == q['area'] and d['family'] != q['family']])
        tf = (self.X[pool] @ self.X[qi].T).toarray().ravel()
        mn = self.M[pool] @ self.M[qi]
        if metodo == 'tfidf':
            s = tf
        elif metodo == 'minilm':
            s = mn
        else:
            s = np.zeros(len(pool))
            for v in (tf, mn):
                o = np.argsort(-v, kind='stable')
                s[o] += 1 / (self.conf['rrf_k'] + np.arange(1, len(v) + 1))
        seen, out = set(), []
        for j in np.argsort(-s, kind='stable'):
            d = self.docs[pool[j]]
            if d['family'] not in seen:
                seen.add(d['family']); out.append((d['id'], float(s[j])))
        return out


def buscar(qid, metodo, k):
    ix = Indice()
    if qid not in ix.pos:
        raise SystemExit('Questão fora das elegíveis desta base.')
    if ix.docs[ix.pos[qid]]['split'] == 'test':
        raise SystemExit('Consulta do teste reservado: recusada.')
    for r, (i, s) in enumerate(ix.ranking(qid, metodo)[:k], 1):
        q = ix.rows[i]
        print(json.dumps({'posicao': r, 'escore': round(s, 5), 'id': i, 'ano': q['year'], 'area': q['area'],
                          'trecho': bl.clean(q['question'])[-240:]}, ensure_ascii=False))


def avaliar():
    ix = Indice(); lab = collections.defaultdict(dict)
    for p in map(json.loads, (BASE / 'pares_desenvolvimento_compativeis.jsonl').open(encoding='utf-8')):
        lab[p['query_id']][p['candidate_id']] = p['human_grade']
    for metodo in ('tfidf', 'minilm', 'rrf'):
        ok = tot = 0
        for qid, L in lab.items():
            pos = {i: r for r, (i, _) in enumerate(ix.ranking(qid, metodo))}
            for a in L:
                for b in L:
                    if L[a] > L[b]:
                        tot += 1; ok += pos[a] < pos[b]
        print(f'{metodo:7s} pares na ordem certa: {ok}/{tot} ({ok/tot:.0%})')


if __name__ == '__main__':
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('comando', choices=['construir', 'buscar', 'avaliar'])
    ap.add_argument('--minilm-de'); ap.add_argument('--recodificar', action='store_true')
    ap.add_argument('--question-id'); ap.add_argument('--metodo', default='rrf', choices=['rrf', 'tfidf', 'minilm'])
    ap.add_argument('--k', type=int, default=5)
    a = ap.parse_args()
    if a.comando == 'construir':
        if not (a.recodificar or a.minilm_de):
            ap.error('use --minilm-de PASTA ou --recodificar')
        construir(a.minilm_de, a.recodificar)
    elif a.comando == 'buscar':
        if not a.question_id:
            ap.error('buscar requer --question-id')
        buscar(a.question_id, a.metodo, a.k)
    else:
        avaliar()
