"""Estabilidade numerica da TRI, EAP e faixas."""
from __future__ import annotations

import math

import numpy as np
import pytest

from gabaritei_rec.perfil import classificar_tentativa, estimar_perfil_area, peso_e_motivo
from gabaritei_rec.psicometria import Evidencia, estimar_eap, faixa_de_b, prob_3pl


@pytest.mark.parametrize("D", [1.0, 1.7])
def test_prob_3pl_estavel_em_extremos(D):
    thetas = np.array([-1e6, -50, -6, 0, 6, 50, 1e6])
    for a, b, c in [(0.01929, 61.05459, 0.21513), (6.7, -2.1, 0.0), (1.5, 0.9, 0.5), (50.0, 0.0, 0.2)]:
        p = prob_3pl(thetas, a, b, c, D)
        assert np.all(np.isfinite(p))
        assert np.all(p >= c - 1e-12) and np.all(p <= 1.0 + 1e-12)
        assert np.all(np.diff(p) >= -1e-12)  # monotona em theta


def test_prob_3pl_valor_conhecido():
    # em theta=b, P = c + (1-c)/2, para qualquer D
    assert prob_3pl(0.7, 1.3, 0.7, 0.2, 1.7) == pytest.approx(0.6)
    assert prob_3pl(0.7, 1.3, 0.7, 0.2, 1.0) == pytest.approx(0.6)


def test_eap_historico_vazio_retorna_prior(cfg):
    est = estimar_eap([], cfg["irt"], 1.0)
    assert est.theta == pytest.approx(0.0, abs=1e-6)
    assert est.dp == pytest.approx(1.0, abs=0.01)
    assert est.n_evidencias == 0


def test_eap_estavel_com_muitas_evidencias_extremas(cfg):
    ev = [Evidencia(a=6.7, b=-2.1, c=0.0, acerto=False)] * 400 + [Evidencia(a=0.019, b=61.0, c=0.2, acerto=True)] * 400
    est = estimar_eap(ev, cfg["irt"], 1.7)
    assert math.isfinite(est.theta) and math.isfinite(est.dp)
    assert cfg["irt"]["grade_theta"]["min"] <= est.theta <= cfg["irt"]["grade_theta"]["max"]
    assert abs(est.posterior.sum() - 1) < 1e-9


def test_eap_direcao_e_incerteza(cfg):
    itens = [(1.5, b, 0.2) for b in np.linspace(-1, 2, 12)]
    acertos = estimar_eap([Evidencia(a, b, c, True) for a, b, c in itens], cfg["irt"], 1.0)
    erros = estimar_eap([Evidencia(a, b, c, False) for a, b, c in itens], cfg["irt"], 1.0)
    assert acertos.theta > 0 > erros.theta
    assert acertos.dp < 1.0 and erros.dp < 1.0


def test_eap_invariante_a_ordem(cfg):
    ev = [Evidencia(1.2, b, 0.2, i % 2 == 0) for i, b in enumerate(np.linspace(-1, 2, 9))]
    e1 = estimar_eap(ev, cfg["irt"], 1.0)
    e2 = estimar_eap(list(reversed(ev)), cfg["irt"], 1.0)
    assert e1.theta == pytest.approx(e2.theta, abs=1e-12)


def test_evidencia_com_peso_zero_ignorada(cfg):
    base = [Evidencia(1.2, 0.5, 0.2, True)]
    e1 = estimar_eap(base, cfg["irt"], 1.0)
    e2 = estimar_eap(base + [Evidencia(1.2, 0.5, 0.2, False, peso=0.0)], cfg["irt"], 1.0)
    assert e1.theta == e2.theta and e2.n_evidencias == 1


def test_faixa_de_b_fronteiras():
    c = {"c1": 0.5, "c2": 1.5}
    assert faixa_de_b(0.5, c) == "facil"
    assert faixa_de_b(0.5000001, c) == "media"
    assert faixa_de_b(1.5, c) == "media"
    assert faixa_de_b(1.6, c) == "dificil"


def test_classificacao_primeira_dica_revisao_exposicao(cfg):
    assert classificar_tentativa(False, False, False) == "primeira_sem_ajuda"
    assert classificar_tentativa(False, False, True) == "primeira_com_dica"
    assert classificar_tentativa(True, False, False) == "repeticao"
    assert classificar_tentativa(True, True, True) == "repeticao"
    assert classificar_tentativa(False, True, True) == "apos_exposicao_gabarito"
    assert peso_e_motivo("primeira_sem_ajuda", True, cfg["perfil"])[0] == 1.0
    for t in ("primeira_com_dica", "repeticao", "apos_exposicao_gabarito"):
        assert peso_e_motivo(t, True, cfg["perfil"])[0] == 0.0
    assert peso_e_motivo("primeira_sem_ajuda", False, cfg["perfil"]) == (0.0, "item_fora_do_grupo_de_escala_ou_triado")


def test_perfil_vazio_explicita_incerteza(cfg):
    est, _ = estimar_perfil_area("MT", [], cfg)
    assert est.status == "sem_historico" and est.n_evidencias == 0 and est.dp == pytest.approx(1.0, abs=0.01)
    assert est.experimental
