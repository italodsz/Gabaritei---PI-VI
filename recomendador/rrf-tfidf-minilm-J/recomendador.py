"""Recomendador do Ítalo, modo RRF (TF-IDF + MiniLM em blocos), sobre a base de trabalho.

Uso:
  python recomendador.py construir --minilm-de PASTA_rc1/entrega/vectors   # reaproveita vetores da v2.1-rc1
  python recomendador.py construir --recodificar                          # recalcula o MiniLM (precisa do modelo)
  python recomendador.py buscar --question-id gq_... [--metodo rrf_qwen|rrf|tfidf|minilm|qwen] [--k 5]   (padrão: rrf_qwen)
  python recomendador.py avaliar                                          # pares de desenvolvimento (validação)
  python recomendador.py exportar [--top 50] [--metodo arvore]            # catálogo de recomendações para o app

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
QWEN_SHA256 = '21e0e82b06d84c5be47506dd4136467f1f825b201e1940ce9c6a9c16bc2cfa3d'
sys.path.insert(0, str(ROOT))
import pipeline_baseline as bl


CLS = ROOT / 'classificador'


def carregar_rotulos():
    """Rótulo final de cada questão na árvore v1.2: gabarito à mão, sobrescrito pela classificação
    manual completa (classificador/dados/classificacao_manual.jsonl). Devolve {id: {...}}."""
    arv = json.loads((CLS / 'dados' / 'arvore_v1.2.json').read_text(encoding='utf-8'))
    nos = {n['id']: n for n in arv['nos']}
    viz = {}
    for cadeia in arv.get('vizinhanca_temporal', []):
        for k, g in enumerate(cadeia):
            viz[g] = set(cadeia[max(0, k - 1):k]) | set(cadeia[k + 1:k + 2])
    rot = {}
    for r in json.loads((CLS / 'saida' / 'classificacao.json').read_text(encoding='utf-8')):
        rot[r['id']] = {'no': r['no'] if r['origem'] == 'gabarito' else None, 'defeito': r['origem'] == 'defeito',
                        'duplicata': False}
    for r in map(json.loads, (CLS / 'dados' / 'classificacao_manual.jsonl').open(encoding='utf-8')):
        obs = r.get('obs') or ''
        rot[r['id']] = {'no': r['no'], 'defeito': r['no'] is None, 'duplicata': 'duplicata de' in obs}
    tit = json.loads((CLS / 'dados' / 'titulos_v1.json').read_text(encoding='utf-8'))['por_no']
    for v in rot.values():
        t = tit.get(v['no'], {})
        v['materia'], v['titulo'] = t.get('materia'), t.get('titulo')
        n = nos.get(v['no'])
        v['grande_tema'] = n['grande_tema'] if n else None
        v['assunto'] = n['assunto'] if n else None
    return rot, viz


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
        self.rot, self.viz = carregar_rotulos()

    def faixa(self, q, c):
        """Proximidade pela árvore (régua da v1.2): 0 mesmo assunto, 1 mesmo grande tema,
        2 grande tema vizinho no tempo (História e Literatura), 3 só a semelhança de texto."""
        a, b = self.rot.get(q['id'], {}), self.rot.get(c['id'], {})
        if not a.get('no') or not b.get('no'):
            return 3
        if a['no'] == b['no']:
            return 0
        if a['grande_tema'] == b['grande_tema']:
            return 1
        if b['grande_tema'] in self.viz.get(a['grande_tema'], ()):
            return 2
        return 3

    def ranking(self, qid, metodo='rrf', galeria='treino'):
        qi = self.pos[qid]; q = self.docs[qi]
        pool = np.array([k for k, d in enumerate(self.docs) if (galeria == 'todas' or d['split'] == 'train')
                         and d['area'] == q['area'] and d['family'] != q['family']])
        tf = (self.X[pool] @ self.X[qi].T).toarray().ravel()
        mn = self.M[pool] @ self.M[qi]
        if metodo in ('titulo', 'titulo_area'):
            # 100% dentro do título amplo (matéria + título); ordem = rrf_qwen (titulo) ou a
            # receita da matéria em busca_por_area_v1.json (titulo_area)
            a = self.rot.get(q['id'], {})
            if not a.get('titulo'):
                return []
            ok = [k for k, j in enumerate(pool) if self._serve(q, self.docs[j])
                  and (self.rot[self.docs[j]['id']].get('materia'), self.rot[self.docs[j]['id']].get('titulo')) == (a['materia'], a['titulo'])]
            pool = pool[ok]; tf = tf[ok]; mn = mn[ok]
            if not len(pool):
                return []
        if metodo == 'arvore':
            ok = [k for k, j in enumerate(pool) if self._serve(q, self.docs[j])]
            pool = pool[ok]; tf = tf[ok]; mn = mn[ok]
        if metodo in ('qwen', 'rrf_qwen', 'arvore', 'titulo', 'titulo_area'):
            if self.Q is None:
                raise SystemExit(f'Vetores Qwen ausentes: coloque {QWEN_ARQUIVO} e ids.json em indice/qwen/.')
            qw = self.Q[pool] @ self.Q[qi]
        if metodo == 'titulo_area':
            s = self._ordem_por_area(qi, pool, tf, qw, a['materia'])
        elif metodo == 'tfidf':
            s = tf
        elif metodo == 'minilm':
            s = mn
        elif metodo == 'qwen':
            s = qw
        else:
            s = np.zeros(len(pool))
            for v in ((tf, qw) if metodo in ('rrf_qwen', 'arvore', 'titulo') else (tf, mn)):
                o = np.argsort(-v, kind='stable')
                s[o] += 1 / (self.conf['rrf_k'] + np.arange(1, len(v) + 1))
        seen, out = set(), []
        ordem = np.argsort(-s, kind='stable')
        if metodo == 'titulo_area' and (a['materia'] in self._assunto_primeiro() or f"{a['materia']} › {a['titulo']}" in self._assunto_primeiro()):
            # teste 11/11: mesmo assunto da árvore primeiro; o resto do título amplo completa a lista
            fora = np.array([self.rot[self.docs[j]['id']].get('no') != a['no'] for j in pool])
            ordem = np.lexsort((-s, fora))
        if metodo == 'arvore':
            # 1) mesmo assunto primeiro; 2) o resto por RRF de três listas: TF-IDF, Qwen e a
            # ordem da árvore (mesmo grande tema, depois vizinho no tempo, depois o resto).
            fx = np.array([self.faixa(q, self.docs[j]) for j in pool])
            arv = np.lexsort((-s, fx))
            s = s.copy(); s[arv] += 1 / (self.conf['rrf_k'] + np.arange(1, len(arv) + 1))
            ordem = np.lexsort((-s, fx != 0))
        for j in ordem:
            d = self.docs[pool[j]]
            if d['family'] not in seen:
                seen.add(d['family']); out.append((d['id'], float(s[j])))
        return out


    def _assunto_primeiro(self):
        if hasattr(self, 'assunto_primeiro'):
            return self.assunto_primeiro
        return set(json.loads((ROOT / 'busca_por_area_v1.json').read_text(encoding='utf-8')).get('assunto_primeiro', []))

    def _ordem_por_area(self, qi, pool, tf, qw, materia):
        if not hasattr(self, 'sinais'):
            import sinais
            self.sinais = sinais.Sinais(self)
            self.area_cfg = json.loads((ROOT / 'busca_por_area_v1.json').read_text(encoding='utf-8'))
        c = getattr(self, 'cfg_forcada', None) or self.area_cfg['por_materia'].get(materia, self.area_cfg['padrao'])
        K = self.conf['rrf_k']; s = np.zeros(len(pool))
        for v, w in ((tf, c['palavras']), (qw, c['sentido'])):
            if w:
                o = np.argsort(-v, kind='stable'); s[o] += w / (K + np.arange(1, len(v) + 1))
        base = s.copy() if c['palavras'] else qw
        for peca, w in c['pecas'].items():
            v = self.sinais.escore(peca, qi, pool)
            if v.any():
                o = np.lexsort((-base, -v)); s[o] += w / (K + np.arange(1, len(v) + 1))
        return s

    def _serve(self, q, c):
        """Candidato aceito no modo arvore: sem defeito, sem duplicata e, em língua estrangeira,
        na mesma língua da questão de referência."""
        r = self.rot.get(c['id'], {})
        if r.get('defeito') or r.get('duplicata'):
            return False
        lq, lc = self.rows[q['id']].get('language'), self.rows[c['id']].get('language')
        if lq in ('en', 'es') or lc in ('en', 'es'):
            return lq == lc
        return True


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
    metodos = ('tfidf', 'minilm', 'rrf') + (('qwen', 'rrf_qwen', 'arvore') if ix.Q is not None else ())
    for metodo in metodos:
        ok = tot = 0
        for qid, L in lab.items():
            pos = {i: r for r, (i, _) in enumerate(ix.ranking(qid, metodo))}
            for a in L:
                for b in L:
                    if L[a] > L[b] and a in pos and b in pos:
                        tot += 1; ok += pos[a] < pos[b]
        print(f'{metodo:7s} pares na ordem certa: {ok}/{tot} ({ok/tot:.0%})')


# Faixas de dificuldade: tercis do parâmetro b (TRI do INEP) calculados POR ÁREA nas questões
# de treino, para que "fácil" signifique fácil dentro da própria área.
def tercis_por_area(ix):
    out = {}
    for area in ('MT', 'CN', 'CH', 'LC'):
        bs = [float(ix.rows[d['id']]['tri']['b']) for d in ix.docs if d['split'] == 'train' and d['area'] == area
              and (ix.rows[d['id']].get('tri') or {}).get('b') is not None]
        out[area] = [round(float(x), 4) for x in np.quantile(bs, [1/3, 2/3])]
    return out

def nivel(b, cortes):
    if b is None: return None
    return 'facil' if b < cortes[0] else 'media' if b < cortes[1] else 'dificil'

def exportar(top, metodo='titulo_area'):
    ix = Indice()
    if ix.Q is None: raise SystemExit('Faltam os vetores Qwen em indice/qwen/.')
    cortes = tercis_por_area(ix)
    af = ROOT / 'catalogo' / 'alertas_texto.json'
    alertas = json.loads(af.read_text(encoding='utf-8')) if af.exists() else {}
    def grave(motivos):
        return any('##' not in m and 'Markdown' not in m for m in motivos)
    meta = {}
    for d in ix.docs:
        r = ix.rows[d['id']]; b = (r.get('tri') or {}).get('b')
        al = alertas.get(d['id'], [])
        meta[d['id']] = {'area': r['area'], 'ano': r['year'], 'habilidade': r.get('skill'),
                         'tri_b': None if b is None else round(float(b), 4), 'nivel': nivel(b, cortes[r['area']]),
                         'alerta_texto': al, 'alerta_grave': grave(al)}
        if metodo in ('arvore', 'titulo'):
            rt = ix.rot.get(d['id'], {})
            meta[d['id']].update({'materia': rt.get('materia'), 'titulo': rt.get('titulo'),'grande_tema': rt.get('grande_tema'), 'assunto': rt.get('assunto'),
                                  'lingua': r.get('language'), 'defeito': bool(rt.get('defeito')),
                                  'duplicata': bool(rt.get('duplicata'))})
    recs, mesmo_assunto = {}, {}
    for n, d in enumerate(ix.docs, 1):
        recs[d['id']] = [i for i, _ in ix.ranking(d['id'], metodo, galeria='todas')[:top]]
        if metodo == 'arvore':
            mesmo_assunto[d['id']] = sum(ix.faixa(d, ix.docs[ix.pos[i]]) == 0 for i in recs[d['id']])
        if n % 500 == 0: print(f'{n}/{len(ix.docs)}', flush=True)
    out = ROOT / 'catalogo' / f'recomendacoes_{metodo}.json'
    out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps({
        'versao': VERSAO, 'metodo': metodo, 'top': top,
        'base_sha256': ix.conf['base_sha256'], 'qwen_sha256': QWEN_SHA256,
        'galeria': 'todas as questões elegíveis da mesma área, sem a própria família (treino, validação e teste)',
        'ordem': 'cada lista vem da mais para a menos relevante; filtrar por nível sem reordenar',
        'cortes_nivel_por_area_tri_b': cortes,
        'alerta_grave': 'defeito de conteúdo conhecido (expoente, fórmula, equação, palavras coladas etc.); o app deve evitar sugerir',
        **({'regra_titulo': 'só questões da mesma matéria e do mesmo título amplo (classificador/dados/titulos_v1.json), '
                            'na ordem do rrf_qwen; sem defeitos nem duplicatas; língua estrangeira só na mesma língua; '
                            'a lista pode ter menos que top quando o título é pequeno'} if metodo == 'titulo' else {}),
        **({'arvore': 'árvore curricular v1.2; rótulos em classificador/dados (gabarito + classificação manual)',
            'regra_arvore': 'primeiro as do mesmo assunto; depois RRF de TF-IDF, Qwen e ordem da árvore '
                            '(mesmo grande tema, grande tema vizinho no tempo, resto); sem defeitos nem duplicatas; '
                            'língua estrangeira só na mesma língua',
            'quantas_do_mesmo_assunto': mesmo_assunto} if metodo == 'arvore' else {}),
        'questoes': meta, 'recomendacoes': recs},
        ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print(f'pronto: {out} | {len(recs)} questões × {top} sugestões | {out.stat().st_size/1e6:.1f} MB')

if __name__ == '__main__':
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('comando', choices=['construir', 'buscar', 'avaliar', 'exportar'])
    ap.add_argument('--top', type=int, default=50)
    ap.add_argument('--minilm-de'); ap.add_argument('--recodificar', action='store_true')
    ap.add_argument('--question-id'); ap.add_argument('--metodo', default='titulo_area', choices=['rrf', 'tfidf', 'minilm', 'qwen', 'rrf_qwen', 'arvore', 'titulo', 'titulo_area'])
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
        exportar(a.top, a.metodo)
    else:
        avaliar()
