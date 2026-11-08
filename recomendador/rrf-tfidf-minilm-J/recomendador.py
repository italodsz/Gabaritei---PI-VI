"""Recomendador do Ítalo, modo RRF (TF-IDF + MiniLM em blocos), sobre a base de trabalho.

Uso:
  python recomendador.py construir --minilm-de PASTA_rc1/entrega/vectors   # reaproveita vetores da v2.1-rc1
  python recomendador.py construir --recodificar                          # recalcula o MiniLM (precisa do modelo)
  python recomendador.py buscar --question-id gq_... [--metodo rrf_qwen|rrf|tfidf|minilm|qwen] [--k 5]   (padrão: rrf_qwen)
  python recomendador.py avaliar                                          # pares de desenvolvimento (validação)
  python recomendador.py exportar [--top 50]                              # catálogo de recomendações para o app

Regras: TF-IDF ajustado só no treino elegível; galeria = treino elegível; mesma área;
exclui e deduplica a família de conteúdo; texto = enunciado + alternativas (sem gabarito,
habilidade, TRI ou rótulos). Consultas do teste são recusadas.

Modos com Qwen (candidatos, ainda não oficiais): usam os vetores em indice/qwen/, gerados por
gerar_vetores_qwen.py com Qwen3-Embedding-8B em 4 bits e a instrução "conceito". O arquivo e
o hash esperados estão em QWEN_ARQUIVO e QWEN_SHA256.
"""
import argparse, collections, hashlib, json, sys
from pathlib import Path
import joblib, numpy as np
from scipy import sparse
from sklearn.feature_extraction.text import TfidfVectorizer

ROOT = Path(__file__).resolve().parent
BASE, IDX = ROOT / 'base', ROOT / 'indice'
VERSAO = 'italo-rrf-v1 (base de trabalho pós etapas 1-3)'
QWEN_ARQUIVO = 'Qwen3-Embedding-8B-4bit__conceito.npy'
QWEN_SHA256 = 'fc20a3c6b052d25942614457df3517988fd3bba36a90715b713bdf75708642de'
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
        self.Q = None
        qf = IDX / 'qwen' / QWEN_ARQUIVO
        if qf.exists():
            if sha(qf) != QWEN_SHA256:
                raise SystemExit(f'{qf.name} não é o arquivo registrado (hash diferente).')
            if json.loads((IDX / 'qwen' / 'ids.json').read_text()) != [d['id'] for d in self.docs]:
                raise SystemExit('A ordem de indice/qwen/ids.json não bate com indice/documentos.json.')
            self.Q = np.load(qf)

    def ranking(self, qid, metodo='rrf', galeria='treino'):
        qi = self.pos[qid]; q = self.docs[qi]
        pool = np.array([k for k, d in enumerate(self.docs) if (galeria == 'todas' or d['split'] == 'train')
                         and d['area'] == q['area'] and d['family'] != q['family']])
        tf = (self.X[pool] @ self.X[qi].T).toarray().ravel()
        mn = self.M[pool] @ self.M[qi]
        if metodo in ('qwen', 'rrf_qwen'):
            if self.Q is None:
                raise SystemExit(f'Vetores Qwen ausentes: coloque {QWEN_ARQUIVO} e ids.json em indice/qwen/.')
            qw = self.Q[pool] @ self.Q[qi]
        if metodo == 'tfidf':
            s = tf
        elif metodo == 'minilm':
            s = mn
        elif metodo == 'qwen':
            s = qw
        else:
            s = np.zeros(len(pool))
            for v in ((tf, qw) if metodo == 'rrf_qwen' else (tf, mn)):
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
    metodos = ('tfidf', 'minilm', 'rrf') + (('qwen', 'rrf_qwen') if ix.Q is not None else ())
    for metodo in metodos:
        ok = tot = 0
        for qid, L in lab.items():
            pos = {i: r for r, (i, _) in enumerate(ix.ranking(qid, metodo))}
            for a in L:
                for b in L:
                    if L[a] > L[b]:
                        tot += 1; ok += pos[a] < pos[b]
        print(f'{metodo:7s} pares na ordem certa: {ok}/{tot} ({ok/tot:.0%})')


# Faixas de dificuldade: tercis do parâmetro b (TRI do INEP) nas questões de treino,
# os mesmos usados no modelo de dificuldade do Gabriel (Fase 2).
TERCIS_B = (0.8005, 1.5630)

def nivel(b):
    if b is None: return None
    return 'facil' if b < TERCIS_B[0] else 'media' if b < TERCIS_B[1] else 'dificil'

def exportar(top):
    ix = Indice(); metodo = 'rrf_qwen'
    if ix.Q is None: raise SystemExit('Faltam os vetores Qwen em indice/qwen/.')
    meta = {}
    for d in ix.docs:
        r = ix.rows[d['id']]; b = (r.get('tri') or {}).get('b')
        meta[d['id']] = {'area': r['area'], 'ano': r['year'], 'habilidade': r.get('skill'),
                         'tri_b': None if b is None else round(float(b), 4), 'nivel': nivel(b)}
    recs = {}
    for n, d in enumerate(ix.docs, 1):
        recs[d['id']] = [i for i, _ in ix.ranking(d['id'], metodo, galeria='todas')[:top]]
        if n % 500 == 0: print(f'{n}/{len(ix.docs)}', flush=True)
    out = ROOT / 'catalogo' / 'recomendacoes_rrf_qwen.json'
    out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps({
        'versao': VERSAO, 'metodo': metodo, 'top': top,
        'base_sha256': ix.conf['base_sha256'], 'qwen_sha256': QWEN_SHA256,
        'galeria': 'todas as questões elegíveis da mesma área, sem a própria família (treino, validação e teste)',
        'ordem': 'cada lista vem da mais para a menos relevante; filtrar por nível sem reordenar',
        'tercis_tri_b': list(TERCIS_B), 'questoes': meta, 'recomendacoes': recs},
        ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print(f'pronto: {out} | {len(recs)} questões × {top} sugestões | {out.stat().st_size/1e6:.1f} MB')

if __name__ == '__main__':
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('comando', choices=['construir', 'buscar', 'avaliar', 'exportar'])
    ap.add_argument('--top', type=int, default=50)
    ap.add_argument('--minilm-de'); ap.add_argument('--recodificar', action='store_true')
    ap.add_argument('--question-id'); ap.add_argument('--metodo', default='rrf_qwen', choices=['rrf', 'tfidf', 'minilm', 'qwen', 'rrf_qwen'])
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
    elif a.comando == 'exportar':
        exportar(a.top)
    else:
        avaliar()
