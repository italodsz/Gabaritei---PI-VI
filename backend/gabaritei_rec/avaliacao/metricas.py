"""Metricas de classificacao probabilistica (implementacao propria, sem dependencias extras)."""
from __future__ import annotations

import math
from typing import Any, Sequence

import numpy as np


def _arr(x) -> np.ndarray:
    return np.asarray(x, dtype=float)


def roc_auc(y: Sequence[int], p: Sequence[float]) -> float | None:
    y, p = _arr(y), _arr(p)
    n1, n0 = int(y.sum()), int(len(y) - y.sum())
    if n1 == 0 or n0 == 0:
        return None
    ordem = np.argsort(p, kind="mergesort")
    ps = p[ordem]
    ranks = np.empty(len(p))
    i = 0
    while i < len(ps):  # ranks medios para empates
        j = i
        while j + 1 < len(ps) and ps[j + 1] == ps[i]:
            j += 1
        ranks[ordem[i:j + 1]] = (i + j) / 2 + 1
        i = j + 1
    return float((ranks[y == 1].sum() - n1 * (n1 + 1) / 2) / (n1 * n0))


def calibracao(y, p, n_bins: int = 10) -> dict[str, Any]:
    y, p = _arr(y), _arr(p)
    bordas = np.linspace(0, 1, n_bins + 1)
    idx = np.clip(np.digitize(p, bordas[1:-1]), 0, n_bins - 1)
    bins, ece = [], 0.0
    for b in range(n_bins):
        m = idx == b
        if m.sum() == 0:
            continue
        pm, ym = float(p[m].mean()), float(y[m].mean())
        bins.append({"bin": [round(bordas[b], 2), round(bordas[b + 1], 2)], "n": int(m.sum()),
                     "prob_media": round(pm, 4), "taxa_acerto": round(ym, 4)})
        ece += m.sum() / len(y) * abs(pm - ym)
    return {"bins": bins, "ece": round(float(ece), 5)}


def metricas_binarias(y, p, limiar: float) -> dict[str, Any]:
    y, p = _arr(y).astype(int), np.clip(_arr(p), 1e-12, 1 - 1e-12)
    yhat = (p >= limiar).astype(int)
    tp = int(((yhat == 1) & (y == 1)).sum())
    tn = int(((yhat == 0) & (y == 0)).sum())
    fp = int(((yhat == 1) & (y == 0)).sum())
    fn = int(((yhat == 0) & (y == 1)).sum())
    n = len(y)
    prec = tp / (tp + fp) if tp + fp else None
    rec = tp / (tp + fn) if tp + fn else None
    f1 = 2 * prec * rec / (prec + rec) if prec and rec else (0.0 if prec is not None and rec is not None else None)
    tnr = tn / (tn + fp) if tn + fp else None
    bacc = (rec + tnr) / 2 if rec is not None and tnr is not None else None
    return {
        "n": n, "limiar": limiar, "acuracia": (tp + tn) / n if n else None,
        "precisao": prec, "recall": rec, "f1": f1, "especificidade": tnr, "balanced_accuracy": bacc,
        "matriz_confusao": {"vp": tp, "fp": fp, "fn": fn, "vn": tn},
        "roc_auc": roc_auc(y, p),
        "brier": float(np.mean((p - y) ** 2)) if n else None,
        "log_loss": float(-np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))) if n else None,
        "taxa_acerto_observada": float(y.mean()) if n else None,
        "calibracao": calibracao(y, p),
    }


def escolher_limiar_balanced(y, p) -> float:
    """Escolhe o limiar que maximiza balanced accuracy (usar SOMENTE na validacao)."""
    melhor, mel_v = 0.5, -1.0
    for t in np.round(np.arange(0.05, 0.96, 0.01), 2):
        m = metricas_binarias(y, p, float(t))
        v = m["balanced_accuracy"] if m["balanced_accuracy"] is not None else -1
        if v > mel_v:
            melhor, mel_v = float(t), v
    return melhor


def bootstrap_por_aluno(registros: list[dict[str, Any]], func, n_rep: int = 500, semente: int = 0) -> dict[str, Any]:
    """IC 95% por bootstrap reamostrando ALUNOS (respeita o agrupamento)."""
    por_aluno: dict[str, list] = {}
    for r in registros:
        por_aluno.setdefault(r["aluno_id"], []).append(r)
    alunos = list(por_aluno)
    if len(alunos) < 2:
        return {"ic95": None, "nota": "alunos insuficientes para bootstrap"}
    rng = np.random.default_rng(semente)
    vals = []
    for _ in range(n_rep):
        amostra = [r for a in rng.choice(alunos, size=len(alunos), replace=True) for r in por_aluno[a]]
        v = func(amostra)
        if v is not None and not (isinstance(v, float) and math.isnan(v)):
            vals.append(v)
    if not vals:
        return {"ic95": None}
    return {"ic95": [float(np.percentile(vals, 2.5)), float(np.percentile(vals, 97.5))], "n_rep": len(vals),
            "metodo": "bootstrap percentil, reamostragem por aluno"}


def gini(contagens: Sequence[float]) -> float:
    x = np.sort(_arr(contagens))
    if len(x) == 0 or x.sum() == 0:
        return 0.0
    n = len(x)
    return float((2 * np.arange(1, n + 1) - n - 1).dot(x) / (n * x.sum()))
