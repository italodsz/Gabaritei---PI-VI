"""Reavalia a configuração congelada contra a regra simples já existente."""
import hashlib
import json
from pathlib import Path
import sys

import numpy as np

OUT = Path(__file__).resolve().parent
sys.path.insert(0, str(OUT.parent))
from busca_autonoma import metrics, simulate
from busca_margem import TEST


def run():
    source = OUT.parent / "busca_margem.json"
    raw = source.read_bytes()
    historical = json.loads(raw)
    candidate = historical["selected"]
    config = historical["configs"][candidate]
    assert candidate == "bkt_politica_1_4_0.09" and config == [1, 4, 2, 0.09]
    assert tuple(historical["test_seeds"]) == TEST
    results = {}
    for generator in ("logistic", "3pl"):
        for closed in (False, True):
            scenario = f"{generator}/{closed}"
            rows = simulate(TEST, generator, {"taxa": None, candidate: config}, closed=closed)
            simple, model = rows["taxa"], rows[candidate]
            assert len(simple) == len(model) == 486
            reports = {key: metrics(value) for key, value in rows.items()}
            historical_candidate = historical["test"][scenario][candidate]
            assert all(reports[candidate][key] == val for key, val in historical_candidate.items())
            assert all(report["violations"] == 0 for report in reports.values())
            delta = (model[:, 0] - simple[:, 0]) / 36
            samples = np.random.default_rng(42).choice(delta, (2000, len(delta))).mean(axis=1)
            results[scenario] = {
                "resultados": reports,
                "delta_acerto": float(delta.mean()),
                "ic95_bootstrap_pareado": np.quantile(samples, [.025, .975]).tolist(),
            }
    result = {
        "natureza": "simulacao sem treinamento; confronto retrospectivo",
        "candidata": candidate,
        "configuracao": config,
        "referencia": "taxa de acertos suavizada com política de persistência existente",
        "sementes": TEST,
        "passos_por_trajetoria": 36,
        "replicas_bootstrap": 2000,
        "sha256_resultado_historico": hashlib.sha256(raw).hexdigest(),
        "cenarios": results,
    }
    (OUT / "comparacao_regra.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    for scenario, entry in results.items():
        simple = entry["resultados"]["taxa"]
        model = entry["resultados"][candidate]
        print(scenario, f"regra={simple['accuracy']:.4f} candidata={model['accuracy']:.4f}",
              f"delta={entry['delta_acerto']:.4f} IC={entry['ic95_bootstrap_pareado']}")


if __name__ == "__main__":
    run()
