"""Dificuldade (cortes por area) e psicometria (3PL, EAP).

Separacao de conceitos:
  * dificuldade da questao  -> tri.b e a faixa operacional (facil/media/dificil) por area;
  * proficiencia do aluno   -> theta por area (EAP), com incerteza e quantidade de evidencias;
  * adequacao da recomendacao -> probabilidade prevista de acerto comparada a faixa-alvo.
As faixas sao categorias operacionais do catalogo, nao categorias oficiais do Inep.
"""
from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Any, Iterable, Sequence

import numpy as np

from .config import sha256_obj

AREAS = ("CH", "CN", "LC", "MT")
FAIXAS = ("facil", "media", "dificil")


# ---------------------------------------------------------------- triagem TRI
def triar_parametros(itens: Sequence[dict[str, Any]], cfg_triagem: dict[str, Any]) -> dict[str, dict[str, Any]]:
    """Retorna {id: {"excluir": bool, "motivos": [...], "sinais": [...]}}.

    Nao altera valores. Regras de exclusao (a baixo; b alto + a baixo) sao fixas na config,
    definidas sem consultar validacao/teste. Sinais (IQR por area, |b| alto) sao so informativos.
    """
    res: dict[str, dict[str, Any]] = {}
    k = cfg_triagem["iqr_multiplicador_sinalizar"]
    limites: dict[tuple[str, str], tuple[float, float]] = {}
    for area in AREAS:
        for p in ("a", "b", "c"):
            v = np.array([it["tri"][p] for it in itens if it["area"] == area and _finito(it["tri"].get(p))])
            if len(v) == 0:
                continue
            q1, q3 = np.quantile(v, [0.25, 0.75])
            limites[(area, p)] = (q1 - k * (q3 - q1), q3 + k * (q3 - q1))
    for it in itens:
        tri = it["tri"]
        motivos, sinais = [], []
        a, b, c = tri.get("a"), tri.get("b"), tri.get("c")
        if not all(_finito(x) for x in (a, b, c)):
            motivos.append("parametro_nao_finito")
        else:
            if a <= 0:
                motivos.append("a_nao_positivo")
            if not (0 <= c < 1):
                motivos.append("c_fora_de_[0,1)")
            if a < cfg_triagem["a_minimo"]:
                motivos.append("discriminacao_muito_baixa")
            if b > cfg_triagem["b_alto"] and a < cfg_triagem["a_minimo_quando_b_alto"]:
                motivos.append("dificuldade_alta_com_discriminacao_baixa")
            if abs(b) > cfg_triagem["b_abs_sinalizar"]:
                sinais.append("b_extremo")
            for p, v in (("a", a), ("b", b), ("c", c)):
                lim = limites.get((it["area"], p))
                if lim and not (lim[0] <= v <= lim[1]):
                    sinais.append(f"{p}_outlier_iqr_area")
        res[it["id"]] = {"excluir": bool(motivos), "motivos": motivos, "sinais": sinais}
    return res


def _finito(x: Any) -> bool:
    return isinstance(x, (int, float)) and not isinstance(x, bool) and math.isfinite(x)


# ---------------------------------------------------------------- cortes
def calcular_cortes(itens_treino_aprovados: Iterable[dict[str, Any]], cfg_dif: dict[str, Any],
                    dataset_sha256: str, triagem_versao: str) -> dict[str, Any]:
    """Tercis de tri.b por area, so com itens do treino aprovado. Deterministico."""
    por_area: dict[str, list[float]] = {a: [] for a in AREAS}
    ids: list[str] = []
    for it in itens_treino_aprovados:
        if it["split"] != "train":
            raise ValueError(f"item fora do treino usado no ajuste dos cortes: {it['id']} ({it['split']})")
        por_area[it["area"]].append(float(it["tri"]["b"]))
        ids.append(it["id"])
    q = cfg_dif["quantis"]
    cortes = {}
    for area, bs in por_area.items():
        if len(bs) < 3:
            raise ValueError(f"itens insuficientes para tercis em {area}")
        c1, c2 = np.quantile(np.array(sorted(bs)), q, method=cfg_dif["interpolacao_numpy"])
        cortes[area] = {"c1": round(float(c1), 6), "c2": round(float(c2), 6), "n": len(bs)}
    corpo = {
        "metodo": cfg_dif["metodo"],
        "quantis": q,
        "regra_fronteira": cfg_dif["regra_fronteira"],
        "cortes": cortes,
        "dataset_sha256": dataset_sha256,
        "triagem_versao": triagem_versao,
        "ids_ajuste_sha256": sha256_obj(sorted(ids)),
        "splits_usados": ["train"],
        "aviso": "Categorias operacionais do catalogo; nao sao categorias oficiais do Inep.",
    }
    corpo["versao"] = "cortes-" + sha256_obj(corpo)[:12]
    return corpo


def faixa_de_b(b: float, corte_area: dict[str, float]) -> str:
    if b <= corte_area["c1"]:
        return "facil"
    if b <= corte_area["c2"]:
        return "media"
    return "dificil"


# ---------------------------------------------------------------- 3PL
def prob_3pl(theta: np.ndarray | float, a: float, b: float, c: float, D: float) -> np.ndarray:
    """P(acerto|theta) = c + (1-c) / (1 + exp(-D*a*(theta-b))), numericamente estavel."""
    z = D * a * (np.asarray(theta, dtype=float) - b)
    # sigmoide estavel: evita overflow de exp para |z| grande
    sig = np.where(z >= 0, 1.0 / (1.0 + np.exp(-np.abs(z))), np.exp(-np.abs(z)) / (1.0 + np.exp(-np.abs(z))))
    return c + (1.0 - c) * sig


@dataclass
class Evidencia:
    a: float
    b: float
    c: float
    acerto: bool
    peso: float = 1.0


@dataclass
class EstimativaTheta:
    theta: float
    dp: float
    n_evidencias: int
    peso_total: float
    grade: np.ndarray = field(repr=False)
    posterior: np.ndarray = field(repr=False)

    def prob_esperada(self, a: float, b: float, c: float, D: float) -> float:
        """Probabilidade preditiva integrando a incerteza do posterior."""
        return float(np.sum(self.posterior * prob_3pl(self.grade, a, b, c, D)))


def grade_theta(cfg_irt: dict[str, Any]) -> np.ndarray:
    g = cfg_irt["grade_theta"]
    n = int(round((g["max"] - g["min"]) / g["passo"])) + 1
    return np.linspace(g["min"], g["max"], n)


def estimar_eap(evidencias: Sequence[Evidencia], cfg_irt: dict[str, Any], D: float) -> EstimativaTheta:
    grade = grade_theta(cfg_irt)
    mu, sd = cfg_irt["prior"]["media"], cfg_irt["prior"]["dp"]
    eps = cfg_irt["eps_probabilidade"]
    logpost = -0.5 * ((grade - mu) / sd) ** 2
    n, peso_total = 0, 0.0
    for ev in evidencias:
        if ev.peso <= 0:
            continue
        p = np.clip(prob_3pl(grade, ev.a, ev.b, ev.c, D), eps, 1 - eps)
        logpost = logpost + ev.peso * (np.log(p) if ev.acerto else np.log1p(-p))
        n += 1
        peso_total += ev.peso
    logpost -= logpost.max()  # log-sum-exp
    post = np.exp(logpost)
    post /= post.sum()
    theta = float(np.sum(grade * post))
    dp = float(math.sqrt(max(np.sum(post * (grade - theta) ** 2), 0.0)))
    return EstimativaTheta(theta=theta, dp=dp, n_evidencias=n, peso_total=peso_total, grade=grade, posterior=post)


# ---------------------------------------------------------------- informacao esperada no posterior
def _entropia_binaria(p: np.ndarray | float) -> np.ndarray:
    p = np.clip(np.asarray(p, dtype=float), 1e-12, 1 - 1e-12)
    return -(p * np.log(p) + (1 - p) * np.log1p(-p))


def ganho_informacao_esperado(est: EstimativaTheta, a: float, b: float, c: float, D: float) -> float:
    """Informacao mutua (nats) entre a resposta ao item e theta, sob o posterior ATUAL do aluno.

    I(Y; theta) = H(Y) - E_post[H(Y | theta)].  Diferente de usar so `a`: um item muito distante do nivel
    estimado tem P(acerto|theta) quase constante no posterior e informa pouco, mesmo com discriminacao alta.
    Tambem incorpora a incerteza: com posterior largo, itens em regioes plausiveis diferentes ganham valor.
    """
    p_grade = prob_3pl(est.grade, a, b, c, D)
    p_pred = float(np.sum(est.posterior * p_grade))
    return float(_entropia_binaria(p_pred) - np.sum(est.posterior * _entropia_binaria(p_grade)))


def trajetoria_status(evidencias: Sequence[Evidencia], cfg: dict[str, Any], D: float) -> list[tuple[float, float, int]]:
    """(theta, dp, n) apos cada evidencia valida, em ordem; O(n) sobre a grade (sem reestimar prefixos)."""
    cfg_irt = cfg["irt"]
    grade = grade_theta(cfg_irt)
    mu, sd = cfg_irt["prior"]["media"], cfg_irt["prior"]["dp"]
    eps = cfg_irt["eps_probabilidade"]
    logpost = -0.5 * ((grade - mu) / sd) ** 2
    out, n = [], 0
    for ev in evidencias:
        if ev.peso <= 0:
            continue
        p = np.clip(prob_3pl(grade, ev.a, ev.b, ev.c, D), eps, 1 - eps)
        logpost = logpost + ev.peso * (np.log(p) if ev.acerto else np.log1p(-p))
        n += 1
        post = np.exp(logpost - logpost.max())
        post /= post.sum()
        th = float(np.sum(grade * post))
        out.append((th, float(math.sqrt(max(np.sum(post * (grade - th) ** 2), 0.0))), n))
    return out
