"""Pipeline de avaliacao: metricas e ausencia de vazamento temporal. Interacoes aqui sao SINTETICAS."""
from __future__ import annotations

import copy
from datetime import datetime, timedelta, timezone

import numpy as np
import pytest

from gabaritei_rec.avaliacao import previsao
from gabaritei_rec.avaliacao.metricas import (bootstrap_por_aluno, escolher_limiar_balanced, gini, metricas_binarias,
                                              roc_auc)


def test_roc_auc_valores_conhecidos():
    assert roc_auc([0, 0, 1, 1], [0.1, 0.4, 0.35, 0.8]) == pytest.approx(0.75)
    assert roc_auc([0, 1], [0.2, 0.9]) == 1.0
    assert roc_auc([0, 1, 0, 1], [0.5, 0.5, 0.5, 0.5]) == 0.5
    assert roc_auc([1, 1], [0.2, 0.3]) is None


def test_metricas_binarias_e_matriz():
    m = metricas_binarias([1, 1, 0, 0, 1], [0.9, 0.4, 0.6, 0.1, 0.7], 0.5)
    assert m["matriz_confusao"] == {"vp": 2, "fp": 1, "fn": 1, "vn": 1}
    assert m["acuracia"] == pytest.approx(0.6)
    assert m["balanced_accuracy"] == pytest.approx((2 / 3 + 1 / 2) / 2)
    assert m["brier"] == pytest.approx(np.mean(np.square(np.array([0.9, 0.4, 0.6, 0.1, 0.7]) - np.array([1, 1, 0, 0, 1]))))


def test_classe_majoritaria_tem_balanced_accuracy_0_5():
    y = [1] * 80 + [0] * 20
    m = metricas_binarias(y, [0.99] * 100, 0.5)
    assert m["acuracia"] == pytest.approx(0.8) and m["balanced_accuracy"] == pytest.approx(0.5)


def test_bootstrap_agrupa_por_aluno_e_gini():
    regs = [{"aluno_id": f"a{i % 5}", "y": i % 2} for i in range(50)]
    r = bootstrap_por_aluno(regs, lambda a: float(np.mean([x["y"] for x in a])), n_rep=50, semente=1)
    assert r["ic95"] is not None and r["metodo"].startswith("bootstrap")
    assert gini([1, 1, 1, 1]) == pytest.approx(0.0)
    assert gini([0, 0, 0, 10]) == pytest.approx(0.75)
    assert 0.0 < escolher_limiar_balanced([0, 1, 0, 1], [0.2, 0.6, 0.3, 0.7]) < 1.0


def _interacoes_sinteticas(cat, n_alunos=30, por_aluno=12, semente=3):
    rng = np.random.default_rng(semente)
    itens = list({it.grupo_conteudo: it for it in cat.ofertaveis()
                  if it.area == "CH" and it.formato == "standard" and it.tipo_aplicacao == "regular"}.values())
    t0 = datetime(2027, 1, 1, tzinfo=timezone.utc)
    regs = []
    for a in range(n_alunos):
        theta = rng.normal()
        esc = rng.choice(len(itens), por_aluno, replace=False)
        for k, j in enumerate(esc):
            it = itens[j]
            p = it.c + (1 - it.c) / (1 + np.exp(-(theta - it.b) * it.a))
            regs.append({"origem": "sintetico", "aluno_id": f"s{a}", "questao_id": it.id, "area": "CH",
                         "enviado_em": (t0 + timedelta(hours=a + 7 * k)).isoformat(), "correta": bool(rng.random() < p),
                         "pulada": False, "tipo": "primeira_sem_ajuda", "usou_dica": False, "gabarito_exposto_antes": False})
    return regs


def test_previsao_usa_apenas_respostas_anteriores(cat, cfg):
    regs = _interacoes_sinteticas(cat)
    evs, _ = previsao.preparar_eventos(regs, cat)
    previsao.prever(evs, cfg, 0.4, 1.0)
    # alterar todas as respostas a partir de um instante nao pode mudar previsoes anteriores ou do proprio instante
    corte = sorted(e["t"] for e in evs)[len(evs) // 2]
    regs2 = copy.deepcopy(regs)
    for r in regs2:
        if datetime.fromisoformat(r["enviado_em"]) >= corte:
            r["correta"] = not r["correta"]
    evs2, _ = previsao.preparar_eventos(regs2, cat)
    previsao.prever(evs2, cfg, 0.4, 1.0)
    for e1, e2 in zip(evs, evs2):
        if e1["t"] <= corte:
            assert e1["p_irt"] == pytest.approx(e2["p_irt"]) and e1["p_previa"] == pytest.approx(e2["p_previa"])


def test_previsao_descarta_repeticoes_dicas_e_pulos(cat, cfg):
    regs = _interacoes_sinteticas(cat, n_alunos=2, por_aluno=5)
    extra = dict(regs[0])
    extra["enviado_em"] = (datetime.fromisoformat(regs[-1]["enviado_em"]) + timedelta(days=1)).isoformat()
    regs += [extra, {**regs[1], "aluno_id": "zz", "usou_dica": True, "tipo": "primeira_com_dica"},
             {**regs[2], "aluno_id": "yy", "pulada": True, "correta": None, "tipo": "pulada"}]
    evs, desc = previsao.preparar_eventos(regs, cat)
    assert desc["repeticao_ou_variante_mesmo_grupo"] == 1
    assert desc["nao_primeira_sem_ajuda"] == 1 and desc["pulada_ou_sem_resposta"] == 1


def test_avaliar_reporta_referencias_e_aviso_sintetico(cat, cfg):
    res = previsao.avaliar(_interacoes_sinteticas(cat), cat, cfg, n_boot=30)
    assert res["status"] == "avaliado" and "SINTETICOS" in res["aviso"]
    assert {"irt_eap_3pl", "ref_acuracia_previa", "ref_majoritaria"} <= set(res["teste"]["modelos"])
    assert "limiar_validacao" in res["teste"]["modelos"]["irt_eap_3pl"]


def test_formato_interacoes_valida_campos(tmp_path):
    p = tmp_path / "x.jsonl"
    p.write_text('{"origem": "real", "aluno_id": "a"}\n', encoding="utf-8")
    with pytest.raises(ValueError):
        previsao.ler_interacoes(p)
