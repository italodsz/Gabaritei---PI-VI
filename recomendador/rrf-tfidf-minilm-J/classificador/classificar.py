"""Classifica as questões da base na árvore curricular e mede a acurácia no gabarito.

Rode de dentro de recomendador/rrf-tfidf-minilm-J/ (CPU basta, leva menos de 1 minuto):
    python classificador/classificar.py

Sinais combinados para cada par (questão, assunto), sempre dentro da mesma área da prova:
  qwen_desc   similaridade entre a questão e o texto do assunto (vetores de gerar_vetores_arvore.py).
              Se esses vetores ainda não existirem, o sinal fica de fora e o relatório avisa.
  tfidf_desc  similaridade TF-IDF entre a questão e o texto do assunto.
  vizinhos    votos das questões do gabarito mais parecidas (vetores Qwen "conceito" já existentes).
              Na avaliação, a própria questão nunca vota em si mesma (deixa-um-de-fora).

Os pesos são escolhidos por busca em grade no gabarito, também em deixa-um-de-fora.
Saídas em classificador/saida/: classificacao.json, revisao_manual.csv, distribuicao_assuntos.csv, relatorio.md.
"""
import argparse, collections, csv, itertools, json, sys
from pathlib import Path
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent
sys.path.insert(0, str(RAIZ))
import pipeline_baseline as bl

METAS = {'grande_tema': 0.95, 'assunto': 0.85}


def normaliza_linhas(M, mascara):
    """Leva cada linha para [0, 1] dentro dos assuntos permitidos (mesma área)."""
    M = np.where(mascara, M, np.nan)
    lo = np.nanmin(M, axis=1, keepdims=True); hi = np.nanmax(M, axis=1, keepdims=True)
    out = (M - lo) / np.maximum(hi - lo, 1e-9)
    return np.nan_to_num(out, nan=0.0)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--arvore', default=str(AQUI / 'dados' / 'arvore_v1.2.json'))
    ap.add_argument('--gabarito', default=str(AQUI / 'dados' / 'gabarito_v1.2.json'))
    ap.add_argument('--vetores', default=str(AQUI / 'vetores'))
    ap.add_argument('--k', type=int, default=5, help='vizinhos do gabarito que votam')
    ap.add_argument('--precisao-alvo', type=float, default=0.85,
                    help='precisão desejada nas questões aceitas sem revisão')
    a = ap.parse_args()
    saida = AQUI / 'saida'; saida.mkdir(exist_ok=True)

    nos = json.loads(Path(a.arvore).read_text())['nos']
    ids = [d['id'] for d in json.loads((RAIZ / 'indice' / 'documentos.json').read_text())]
    pos = {q: i for i, q in enumerate(ids)}
    rows = {q['id']: q for q in map(json.loads, (RAIZ / 'base' / 'questions.jsonl').open(encoding='utf-8'))}
    area_q = np.array([rows[i]['area'] for i in ids])
    area_n = np.array([n['area'] for n in nos])
    gt_n = np.array([n['grande_tema'] for n in nos])
    chave_n = [f"{n['grande_tema']}|{n['assunto']}" for n in nos]
    idx_n = {k: j for j, k in enumerate(chave_n)}
    mascara = area_q[:, None] == area_n[None, :]

    # ---------- gabarito
    gab_todos = json.loads(Path(a.gabarito).read_text())
    gab = [x for x in gab_todos if x['assunto'] and x['id'] in pos]
    fora = [x for x in gab_todos if x['assunto'] and x['id'] not in pos]
    defeitos = {x['id'] for x in gab_todos if not x['assunto']}
    for x in gab:
        assert f"{x['grande_tema']}|{x['assunto']}" in idx_n, x
    gi = np.array([pos[x['id']] for x in gab])
    gy = np.array([idx_n[f"{x['grande_tema']}|{x['assunto']}"] for x in gab])

    # ---------- sinal 1: TF-IDF
    def texto_no(n):
        return f"{n['disciplina_nome']}. {n['grande_tema_nome']}. {n['assunto']}. {n['descricao']}. {n.get('fronteira', '')}"
    qtext = [bl.question_text(rows[i]) for i in ids]
    ntext = [texto_no(n) for n in nos]
    tv = TfidfVectorizer(strip_accents='unicode', sublinear_tf=True, min_df=2, max_df=0.5,
                         ngram_range=(1, 2)).fit(qtext + ntext)
    S_tfidf = normaliza_linhas((tv.transform(qtext) @ tv.transform(ntext).T).toarray(), mascara)

    # ---------- sinal 2: Qwen questão × assunto (opcional)
    S_qwen, origem_qwen = None, 'ausente'
    vd = Path(a.vetores)
    cfgs = sorted(vd.glob('*__config.json')) if vd.exists() else []
    if cfgs:
        cfg = json.loads(cfgs[0].read_text()); nome = cfgs[0].name.split('__')[0]
        assert cfg['ids_questoes'] == ids, 'vetores gerados com outra base'
        assert cfg['ids_assuntos'] == [n['id'] for n in nos], 'vetores gerados com outra árvore: rode gerar_vetores_arvore.py de novo'
        QN = np.load(vd / f'{nome}__questoes.npy'); NN = np.load(vd / f'{nome}__assuntos.npy')
        S_qwen = normaliza_linhas(QN @ NN.T, mascara); origem_qwen = nome

    # ---------- sinal 3: vizinhos do gabarito
    V = np.load(RAIZ / 'indice' / 'qwen' / 'Qwen3-Embedding-8B-4bit__conceito.npy')
    assert json.loads((RAIZ / 'indice' / 'qwen' / 'ids.json').read_text()) == ids
    V = V / np.linalg.norm(V, axis=1, keepdims=True)
    sim_gab = V @ V[gi].T                      # 2063 x n_gab
    sim_gab[gi, np.arange(len(gi))] = -9       # deixa-um-de-fora
    sim_gab[area_q[:, None] != area_q[gi][None, :]] = -9
    S_viz = np.zeros((len(ids), len(nos)))
    top = np.argsort(-sim_gab, axis=1)[:, :a.k]
    for i in range(len(ids)):
        for j in top[i]:
            if sim_gab[i, j] > 0:
                S_viz[i, gy[j]] += sim_gab[i, j] / a.k
    S_viz = normaliza_linhas(S_viz, mascara)

    # ---------- combinação e avaliação deixa-um-de-fora
    def combina(w):
        S = w[0] * S_tfidf + w[2] * S_viz
        if S_qwen is not None:
            S = S + w[1] * S_qwen
        return np.where(mascara, S, -9.0)

    def mede(S, linhas, y):
        pred = S[linhas].argmax(1)
        ordem = np.argsort(-S[linhas], axis=1)
        rank = np.array([list(o).index(t) + 1 for o, t in zip(ordem, y)])
        gt_ok = []
        for li, t in zip(linhas, y):
            m = collections.defaultdict(lambda: -9.0)
            for j in np.where(mascara[li])[0]:
                m[gt_n[j]] = max(m[gt_n[j]], S[li, j])
            gt_ok.append(max(m, key=m.get) == gt_n[t])
        return {'grande_tema': float(np.mean(gt_ok)), 'assunto': float(np.mean(pred == y)),
                **{f'recall@{K}': float(np.mean(rank <= K)) for K in (3, 5, 10)}}

    grade = [0, 0.5, 1, 2]
    melhores = []
    for w in itertools.product(grade, grade if S_qwen is not None else [0], grade):
        if sum(w) == 0:
            continue
        r = mede(combina(w), gi, gy)
        melhores.append((r['assunto'], r['recall@10'], w, r))
    melhores.sort(key=lambda t: (t[0], t[1]), reverse=True)
    _, _, W, RES = melhores[0]
    S = combina(W)

    por_area = {ar: mede(S, gi[area_q[gi] == ar], gy[area_q[gi] == ar]) | {'n': int((area_q[gi] == ar).sum())}
                for ar in ('CH', 'LC', 'CN', 'MT')}

    # ---------- confiança: margem entre 1º e 2º; limiar para atingir a precisão alvo
    def margem(Sl):
        o = np.sort(Sl, axis=1)
        return o[:, -1] - o[:, -2]
    mg = margem(S[gi]); acerto = S[gi].argmax(1) == gy
    limiar, cobertura = None, 0.0
    for t in np.unique(np.round(mg, 3)):
        sel = mg >= t
        if sel.sum() >= 20 and acerto[sel].mean() >= a.precisao_alvo:
            limiar, cobertura = float(t), float(sel.mean()); break

    # ---------- classificação final de toda a base
    gab_por_id = {x['id']: x for x in gab}
    mg_all = margem(S)
    saida_q, revisao = [], []
    for i, qid in enumerate(ids):
        ordem = np.argsort(-S[i])[:10]
        cands = [{'id': nos[j]['id'], 'grande_tema': nos[j]['grande_tema'], 'assunto': nos[j]['assunto'],
                  'score': round(float(S[i, j]), 4)} for j in ordem]
        if qid in gab_por_id:
            x = gab_por_id[qid]; esc = nos[idx_n[f"{x['grande_tema']}|{x['assunto']}"]]
            origem, rev = 'gabarito', False
        elif qid in defeitos:
            esc, origem, rev = None, 'defeito', True
        else:
            esc = nos[ordem[0]]; origem = 'automatico'
            rev = limiar is None or mg_all[i] < limiar
        rec = {'id': qid, 'area': area_q[i], 'origem': origem,
               'no': esc['id'] if esc else None, 'grande_tema': esc['grande_tema'] if esc else None,
               'assunto': esc['assunto'] if esc else None, 'margem': round(float(mg_all[i]), 4),
               'revisao_manual': bool(rev), 'candidatos': cands}
        saida_q.append(rec)
        if rev and origem != 'gabarito':
            revisao.append(rec)

    (saida / 'classificacao.json').write_text(json.dumps(saida_q, ensure_ascii=False, indent=1), encoding='utf-8')
    with (saida / 'revisao_manual.csv').open('w', newline='', encoding='utf-8') as f:
        w = csv.writer(f); w.writerow(['id', 'area', 'margem', 'cand1', 'cand2', 'cand3', 'inicio_enunciado'])
        for r in sorted(revisao, key=lambda r: r['margem']):
            c = [f"{x['grande_tema']} {x['assunto']}" for x in r['candidatos'][:3]]
            w.writerow([r['id'], r['area'], r['margem'], *c, ' '.join(rows[r['id']]['question'].split())[:160]])
    cont = collections.Counter(r['no'] for r in saida_q if r['no'])
    with (saida / 'distribuicao_assuntos.csv').open('w', newline='', encoding='utf-8') as f:
        w = csv.writer(f); w.writerow(['area', 'disciplina', 'grande_tema', 'assunto', 'questoes'])
        for n in nos:
            w.writerow([n['area'], n['disciplina'], n['grande_tema'], n['assunto'], cont.get(n['id'], 0)])

    vazios = sum(1 for n in nos if cont.get(n['id'], 0) == 0)
    ralos = sum(1 for n in nos if 1 <= cont.get(n['id'], 0) <= 2)
    p = lambda v: f'{100*v:.1f}%'
    ok = lambda k: '✅' if RES[k] >= METAS[k] else '❌'
    rel = [f'# Classificador da árvore curricular — relatório', '',
           f"Árvore: {Path(a.arvore).name} ({len(nos)} assuntos). Gabarito: {len(gab)} questões válidas"
           f" ({len(fora)} fora da base de 2063, {len(defeitos)} com defeito).",
           f"Sinal Qwen questão × assunto: **{origem_qwen}**."
           + ('' if S_qwen is not None else ' Rode `gerar_vetores_arvore.py` na GPU para ativá-lo.'),
           f"Pesos escolhidos (tfidf, qwen, vizinhos): {W}", '',
           '## Acurácia no gabarito (deixa-um-de-fora)', '',
           '| Medida | Resultado | Meta |', '|---|---|---|',
           f"| Grande tema | {p(RES['grande_tema'])} | {ok('grande_tema')} 95% |",
           f"| Assunto | {p(RES['assunto'])} | {ok('assunto')} 85% |",
           f"| Assunto certo entre os 3 primeiros | {p(RES['recall@3'])} | |",
           f"| Assunto certo entre os 5 primeiros | {p(RES['recall@5'])} | |",
           f"| Assunto certo entre os 10 primeiros | {p(RES['recall@10'])} | |", '',
           '| Área | n | Grande tema | Assunto | Top 5 | Top 10 |', '|---|---|---|---|---|---|']
    for ar, r in por_area.items():
        rel.append(f"| {ar} | {r['n']} | {p(r['grande_tema'])} | {p(r['assunto'])} | {p(r['recall@5'])} | {p(r['recall@10'])} |")
    rel += ['', '## Revisão manual', '',
            (f"Aceitando só questões com margem ≥ {limiar:.3f}, a precisão no gabarito chega a {p(a.precisao_alvo)}"
             f" e cobre {p(cobertura)} das questões. Foram para `revisao_manual.csv` {len(revisao)} questões.")
            if limiar is not None else
            f"Nenhum limiar de margem atinge {p(a.precisao_alvo)} de precisão; todas as {len(revisao)} questões automáticas vão para revisão.",
            '', '## Distribuição', '',
            f"Assuntos sem nenhuma questão: {vazios}. Assuntos com 1 ou 2 questões: {ralos}. Ver `distribuicao_assuntos.csv`.",
            '', 'O conceito (nível mais fino) não é atribuído por este classificador.']
    (saida / 'relatorio.md').write_text('\n'.join(rel) + '\n', encoding='utf-8')
    print('\n'.join(rel))


if __name__ == '__main__':
    main()
