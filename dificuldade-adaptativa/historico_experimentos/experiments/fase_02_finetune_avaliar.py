import argparse
import json
from pathlib import Path
from time import perf_counter

import numpy as np
import torch
from sklearn.linear_model import Ridge
from sklearn.svm import LinearSVC
from sklearn.preprocessing import StandardScaler

from experiments.fase_02_comparar import features, metrics, ordinal_predict, paired_interval
from experiments.fase_02_finetune import load_data, question_text
from experiments.fase_02_treinamento import LABELS, target
from src.inferencia_finetune import Predictor


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("dataset", type=Path)
    args = parser.parse_args()
    audit, train, val = load_data(args.dataset)
    cuts = audit["difficulty_cutoffs"]
    y, truth = [np.array([LABELS.index(target(r, cuts)) for r in rows]) for rows in (train, val)]
    prior = json.loads(Path("results/fase02r_comparacao.json").read_bytes())
    baseline = prior["results"]["minilm/embedding/multiclass"]
    with np.load("results/fase02r_minilm.npz") as vectors:
        assert vectors["train_ids"].tolist() == [r["id"] for r in train]
        assert vectors["validation_ids"].tolist() == [r["id"] for r in val]
        reference = LinearSVC(random_state=42).fit(vectors["train"], y).predict(vectors["validation"])
    assert metrics(truth, reference, val)["confusion"] == baseline["confusion"]
    all_runs = {}
    for path in sorted(Path("results").glob("ft_*/metricas.json")):
        run = json.loads(path.read_bytes())
        prediction = run.pop("predictions")
        assert [r["id"] for r in prediction] == [r["id"] for r in val]
        pred = np.array([LABELS.index(r["predicted"]) for r in prediction])
        assert [r["actual"] for r in prediction] == [LABELS[i] for i in truth]
        assert metrics(truth, pred, val)["confusion"] == run["confusion"]
        run["paired_ci_vs_minilm"] = paired_interval(truth, pred, reference, 1000)
        run["execution"] = json.loads(path.with_name("execucao.json").read_bytes())
        all_runs[path.parent.name] = run
    best = max(all_runs, key=lambda name: all_runs[name]["macro_f1"])
    predictor = Predictor(Path("results") / best)
    arrays = []
    start = perf_counter()
    with torch.inference_mode(), torch.autocast("cuda", dtype=torch.float16):
        for rows in (train, val):
            batch_outputs = []
            for i in range(0, len(rows), 4):
                inputs = predictor.tokenizer([question_text(r) for r in rows[i:i+4]], padding=True,
                    truncation=True, max_length=predictor.metadata["limit"], return_tensors="pt").to("cuda")
                batch_outputs.append(predictor.model.encoder(**inputs).last_hidden_state[:, 0].float().cpu().numpy())
            arrays.append(np.concatenate(batch_outputs))
    elapsed = perf_counter()-start
    x, v = arrays
    raw_train = np.array([r["tri"]["b"] for r in train])
    raw_val = np.array([r["tri"]["b"] for r in val])
    bounds = np.quantile(raw_train, [.01, .99])
    fitted = Ridge(alpha=10).fit(x, np.clip(raw_train, *bounds)).predict(v)
    residual = fitted - raw_val
    alt = {
        "multiclass": metrics(truth, LinearSVC(random_state=42).fit(x, y).predict(v), val),
        "ordinal": metrics(truth, ordinal_predict(x, y, v), val),
        "ridge": {**metrics(truth, np.searchsorted(cuts, fitted, side="left"), val),
                  "mae_raw_b": float(np.abs(residual).mean()), "rmse_raw_b": float(np.mean(residual**2)**.5),
                  "residual_quantiles": np.quantile(residual, [.05, .5, .95]).tolist(),
                  "clipping_bounds": bounds.tolist(),
                  "clipped_train": int(((raw_train < bounds[0]) | (raw_train > bounds[1])).sum())},
    }
    hybrid = {}
    if all_runs[best]["macro_f1"] >= baseline["macro_f1"] + .02:
        for mode in ("embedding", "area", "structure", "both"):
            a, b = features(x, train, mode), features(v, val, mode)
            if mode != "embedding":
                scaler = StandardScaler().fit(a[:, x.shape[1]:])
                a[:, x.shape[1]:] = scaler.transform(a[:, x.shape[1]:])
                b[:, x.shape[1]:] = scaler.transform(b[:, x.shape[1]:])
            hybrid[mode] = metrics(truth, LinearSVC(random_state=42).fit(a, y).predict(b), val)
    inference = [predictor.predict("Qual é o dobro de 5?", ["1", "2", "5", "10", "20"]) for _ in range(6)]
    result = {"runs": all_runs, "best_observed": best, "alternative_heads": alt,
              "hybrid": hybrid, "alternative_embedding_seconds": elapsed,
              "inference_warm_median_seconds": float(np.median([p["seconds"] for p in inference[1:]])),
              "test_2024_evaluated": False}
    groups = {}
    for name, run in all_runs.items():
        key = f"{run['model']}/{run['limit']}"
        groups.setdefault(key, []).append({"seed": run["seed"], "batch": run["batch"], "macro_f1": run["macro_f1"]})
    result["seed_comparisons"] = groups
    Path("results/ft_comparacao.json").write_text(json.dumps(result, indent=2), encoding="utf8")
    print(best, {name: round(r["macro_f1"], 4) for name, r in all_runs.items()})
    print("heads", {name: round(r["macro_f1"], 4) for name, r in alt.items()}, "hybrid", list(hybrid))


if __name__ == "__main__":
    main()
