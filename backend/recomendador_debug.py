"""Diagnóstico somente de leitura dos índices existentes. Protocolo JSON por linha."""
import contextlib
import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'recomendador/rrf-tfidf-minilm-J'
sys.path.insert(0, str(ROOT))

with contextlib.redirect_stdout(sys.stderr):
    import numpy as np
    from threadpoolctl import threadpool_limits
    import recomendador as rc
    import pipeline_baseline as bl
    THREADS = threadpool_limits(limits=2)


class IndiceObservado(rc.Indice):
    """Captura a chamada oficial, sem substituir a função de ordenação."""
    def _ordem_por_area(self, qi, pool, tf, qw, materia):
        score = super()._ordem_por_area(qi, pool, tf, qw, materia)
        cfg = self.area_cfg['por_materia'].get(materia, self.area_cfg['padrao'])
        self.captura = {'pool': pool.copy(), 'tf': tf.copy(), 'qw': qw.copy(), 'score': score.copy(), 'cfg': cfg}
        return score


def posicoes(values, base=None):
    order = np.argsort(-values, kind='stable') if base is None else np.lexsort((-base, -values))
    ranks = np.empty(len(values), dtype=int)
    ranks[order] = np.arange(1, len(values) + 1)
    return ranks


class Laboratorio:
    def __init__(self):
        start = time.perf_counter()
        self.ix = IndiceObservado()
        self.catalogo = json.loads((ROOT / 'catalogo/recomendacoes_titulo_area.json').read_text(encoding='utf-8'))
        self.load_ms = (time.perf_counter() - start) * 1000

    def diagnostico(self, qid, limit=20, exclude=None):
        start = time.perf_counter()
        ix = self.ix
        if qid not in ix.pos:
            raise ValueError('Questão sem vetor nesta base.')
        qi = ix.pos[qid]; q = ix.docs[qi]; rot = ix.rot[qid]
        if q['split'] == 'test':
            raise ValueError('O teste de 2024 está reservado. Use treino ou validação para diagnosticar melhorias.')
        cfg_all = json.loads((ROOT / 'busca_por_area_v1.json').read_text(encoding='utf-8'))
        cfg = cfg_all['por_materia'].get(rot.get('materia'), cfg_all['padrao'])
        priority = rot.get('materia') in ix._assunto_primeiro() or f"{rot.get('materia')} › {rot.get('titulo')}" in ix._assunto_primeiro()
        stages = []; rejected = []; pool = list(range(len(ix.docs)))

        def etapa(key, label, predicate):
            nonlocal pool
            before = len(pool); removed = [i for i in pool if not predicate(i)]
            removed_set = set(removed); pool = [i for i in pool if i not in removed_set]
            stages.append({'key': key, 'label': label, 'before': before, 'after': len(pool), 'removed': len(removed)})
            for i in removed[:4]:
                d = ix.docs[i]; r = ix.rot[d['id']]
                rejected.append({'id': d['id'], 'year': ix.rows[d['id']]['year'], 'materia': r.get('materia'), 'titulo': r.get('titulo'), 'reason': label})

        etapa('train', 'Galeria de treino', lambda i: ix.docs[i]['split'] == 'train')
        etapa('area', 'Mesma área', lambda i: ix.docs[i]['area'] == q['area'])
        etapa('family', 'Outra família de conteúdo', lambda i: ix.docs[i]['family'] != q['family'])
        etapa('quality', 'Sem defeito ou duplicata', lambda i: not ix.rot[ix.docs[i]['id']].get('defeito') and not ix.rot[ix.docs[i]['id']].get('duplicata'))
        etapa('language', 'Idioma compatível', lambda i: ix._serve(q, ix.docs[i]))
        etapa('title', 'Mesma matéria e título', lambda i: bool(rot.get('titulo')) and (ix.rot[ix.docs[i]['id']].get('materia'), ix.rot[ix.docs[i]['id']].get('titulo')) == (rot.get('materia'), rot.get('titulo')))
        if pool:
            pre = np.array(pool, dtype=int)
            dots = ix.Q[pre] @ ix.Q[qi]
            allowed = {int(i) for i, v in zip(pre, dots) if v < 0.97}
        else:
            allowed = set()
        etapa('near_duplicate', 'Produto Qwen abaixo de 0,97', lambda i: i in allowed)
        ix.captura = None
        ranking = ix.ranking(qid, 'titulo_area', galeria='treino')
        # A deduplicação segue a ordem do ranking oficial, não a ordem dos documentos.
        families_after = len(ranking)
        stages.append({'key': 'deduplicate', 'label': 'Uma sugestão por família', 'before': len(pool), 'after': families_after, 'removed': len(pool)-families_after})
        exclude = set(exclude or [])
        excluded_families = {ix.docs[ix.pos[i]]['family'] for i in exclude if i in ix.pos}
        visible = [(i, s) for i, s in ranking if i not in exclude and ix.docs[ix.pos[i]]['family'] not in excluded_families]
        stages.append({'key': 'history', 'label': 'Exclusões informadas na sessão', 'before': len(ranking), 'after': len(visible), 'removed': len(ranking)-len(visible)})
        results = []
        original_rank = {i: k+1 for k, (i, _) in enumerate(ranking)}
        catalog_rank = {i: k+1 for k, i in enumerate(self.catalogo['recomendacoes'][qid])}
        captured = ix.captura
        if captured:
            p = captured['pool']; tf = captured['tf']; qw = captured['qw']; scores = captured['score']
            assert list(p) == pool, 'A auditoria de filtros não reproduziu o conjunto do método oficial.'
            mn = ix.M[p] @ ix.M[qi]
            vectors = {'tfidf': (tf, cfg['palavras']), 'qwen': (qw, cfg['sentido']), 'minilm': (mn, 0)}
            ranks = {key: posicoes(v) for key, (v, _) in vectors.items()}
            contributions = {key: (weight / (ix.conf['rrf_k'] + ranks[key]) if weight else np.zeros(len(p))) for key, (_, weight) in vectors.items()}
            base = scores.copy() if cfg['palavras'] else qw
            # O desempate dos sinais usa a soma base TF-IDF/Qwen antes dos bônus.
            if cfg['palavras']:
                base = contributions['tfidf'] + contributions['qwen']
            for name, weight in cfg['pecas'].items():
                v = ix.sinais.escore(name, qi, p); key = 'sinal_' + name
                vectors[key] = (v, weight); ranks[key] = posicoes(v, base=base)
                contributions[key] = weight / (ix.conf['rrf_k'] + ranks[key]) if v.any() else np.zeros(len(p))
            reconstructed = sum(contributions.values())
            assert np.allclose(reconstructed, scores, atol=1e-12, rtol=0), 'A decomposição não corresponde ao escore oficial.'
            score_order = posicoes(scores)
            index = {ix.docs[int(j)]['id']: k for k, j in enumerate(p)}
            for position, (cid, score) in enumerate(visible[:limit], 1):
                k = index[cid]; ci = ix.pos[cid]; r = ix.rot[cid]
                result = {'id': cid, 'rank': position, 'officialRank': original_rank[cid], 'catalogRank': catalog_rank.get(cid),
                          'score': score, 'scoreRankBeforePriority': int(score_order[k]), 'sameSubject': r.get('no') == rot.get('no'),
                          'year': ix.rows[cid]['year'], 'split': ix.docs[ci]['split'], 'materia': r.get('materia'), 'titulo': r.get('titulo'),
                          'assunto': r.get('assunto'), 'preview': bl.clean(ix.rows[cid]['question'])[:220], 'components': {}}
                for key, (v, weight) in vectors.items():
                    result['components'][key] = {'value': float(v[k]), 'rank': int(ranks[key][k]), 'weight': weight, 'contribution': float(contributions[key][k]), 'used': bool(weight and contributions[key].any())}
                results.append(result)
        return {'questionId': qid, 'method': 'titulo_area', 'gallery': 'train', 'rrfK': ix.conf['rrf_k'],
                'recipe': cfg, 'subjectPriority': priority, 'results': results, 'stages': stages, 'rejectedExamples': rejected,
                'totalRanked': len(ranking), 'totalAfterExclusions': len(visible), 'querySplit': q['split'],
                'searchText': bl.question_text(ix.rows[qid]),
                'vectors': {'row': qi, 'minilmDimensions': int(ix.M.shape[1]), 'qwenDimensions': int(ix.Q.shape[1]),
                            'minilmNorm': float(np.linalg.norm(ix.M[qi])), 'qwenNorm': float(np.linalg.norm(ix.Q[qi]))},
                'indexLoadMs': self.load_ms, 'durationMs': (time.perf_counter()-start)*1000,
                'baseSha256': ix.conf['base_sha256'], 'qwenSha256': rc.QWEN_SHA256,
                'note': 'Diagnóstico ao vivo sobre os vetores existentes, sem gerar embeddings. A galeria é só o treino; o catálogo do app usa todos os elegíveis. RRF não é probabilidade. Acerto/erro não altera a receita.'}


def main():
    with contextlib.redirect_stdout(sys.stderr):
        lab = Laboratorio()
    print(json.dumps({'event': 'ready', 'loadMs': lab.load_ms}), flush=True)
    for line in sys.stdin:
        request = {}
        try:
            request = json.loads(line)
            with contextlib.redirect_stdout(sys.stderr):
                result = lab.diagnostico(request['questionId'], request.get('limit', 20), request.get('exclude', []))
            response = {'id': request['id'], 'ok': True, 'result': result}
        except Exception as error:
            response = {'id': request.get('id'), 'ok': False, 'error': str(error)}
        print(json.dumps(response, ensure_ascii=False, allow_nan=False), flush=True)


if __name__ == '__main__': main()
