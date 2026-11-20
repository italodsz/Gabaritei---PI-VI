import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import re
from time import perf_counter

import numpy as np
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.metrics import mean_absolute_error
from sklearn.preprocessing import StandardScaler
from sklearn.svm import LinearSVC

from experiments.fase_02_treinamento import LABELS, load_split, score, target


def structural(text):
    return [len(text), len(text.split()), text.count("\n"), sum(c.isdigit() for c in text),
            len(re.findall(r"[=±×÷√∑^]|\\[a-zA-Z]+", text)),
            len(re.findall(r"\b(?:figura|tabela|gráfico)\b", text, re.I))]


def features(embedding, rows, mode):
    columns = [embedding]
    if mode in ("area", "both"):
        columns.append([[int(r["area"] == area) for area in ("CH", "CN", "LC", "MT")] for r in rows])
    if mode in ("structure", "both"):
        columns.append([structural(r["question"]) for r in rows])
    return np.column_stack(columns)


def ordinal_classes(models, validation):
    probabilities = [model.predict_proba(validation)[:, 1] for model in models]
    low, high = probabilities
    crossed = low < high
    middle = (low + high) / 2
    low, high = np.where(crossed, middle, low), np.where(crossed, middle, high)
    return (low >= 0.5).astype(int) + (high >= 0.5).astype(int)


def ordinal_predict(x, y, validation):
    models = [LogisticRegression(max_iter=1000).fit(x, y > k) for k in (0, 1)]
    return ordinal_classes(models, validation)


def metrics(truth, predicted, rows):
    result = score([LABELS[i] for i in truth], [LABELS[i] for i in predicted])
    result["ordinal_mae"] = float(np.abs(truth - predicted).mean())
    result["easy_hard_errors"] = int((np.abs(truth - predicted) == 2).sum())
    result["easy_hard_rate"] = result["easy_hard_errors"] / len(truth)
    result["by_area"] = {}
    for area in sorted({r["area"] for r in rows}):
        mask = [r["area"] == area for r in rows]
        result["by_area"][area] = score([LABELS[i] for i in truth[mask]],
                                         [LABELS[i] for i in predicted[mask]])
    return result


def paired_interval(truth, a, b, samples):
    def f1(y, p):
        cm = np.bincount(y * 3 + p, minlength=9).reshape(3, 3)
        support = cm.sum(0) + cm.sum(1)
        return np.divide(2 * cm.diagonal(), support, out=np.zeros(3), where=support > 0).mean()
    rng = np.random.default_rng(42)
    groups = [np.flatnonzero(truth == i) for i in range(3)]
    delta = []
    for _ in range(samples):
        idx = np.concatenate([rng.choice(group, size=len(group)) for group in groups])
        delta.append(f1(truth[idx], a[idx]) - f1(truth[idx], b[idx]))
    return np.quantile(delta, [0.025, 0.975]).tolist()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("dataset", type=Path)
    parser.add_argument("--qwen-cuda", action="store_true")
    parser.add_argument("--bge-cuda", action="store_true")
    args = parser.parse_args()
    protocol_file = Path("experiments/protocolo_fase_02_revisada.json")
    protocol = json.loads(protocol_file.read_bytes())
    audit = json.loads(Path("results/fase_01.json").read_bytes())
    for name, digest in audit["hashes"].items():
        if hashlib.sha256((args.dataset / name).read_bytes()).hexdigest() != digest:
            raise ValueError(f"Hash divergente: {name}")
    eligible = json.loads((args.dataset / "ids_elegiveis.json").read_bytes())
    splits = ("train", "validation")
    train, val = [load_split(args.dataset, s, set(eligible[s])) for s in splits]
    cuts = audit["difficulty_cutoffs"]
    y, truth = [np.array([LABELS.index(target(r, cuts)) for r in rows]) for rows in (train, val)]
    raw = np.array([r["tri"]["b"] for r in train])
    raw_val = [r["tri"]["b"] for r in val]
    bounds = np.quantile(raw, [0.01, 0.99])
    results, predictions, diagnostics, sources = {}, {}, {}, {}
    for encoder in protocol["encoders"]:
        gpu = {"qwen06": args.qwen_cuda, "bge": args.bge_cuda}
        suffix = "_cuda" if gpu.get(encoder, False) else ""
        path = Path(f"results/fase02r_{encoder}{suffix}.npz")
        if not path.exists():
            continue
        meta = json.loads(path.with_suffix(".json").read_bytes())
        if (meta["embedding_sha256"] != hashlib.sha256(path.read_bytes()).hexdigest()
            or meta["protocol_sha256"] != hashlib.sha256(protocol_file.read_bytes()).hexdigest()
            or meta["dataset_revision"] != audit["dataset_revision"]):
            raise ValueError(f"Artefato incompatível: {encoder}")
        sources[encoder] = {"path": path.as_posix(), "sha256": meta["embedding_sha256"],
                            "device": meta["device"]}
        with np.load(path) as artifact:
            for split, rows in zip(splits, (train, val)):
                if artifact[f"{split}_ids"].tolist() != [r["id"] for r in rows]:
                    raise ValueError(f"IDs fora de ordem em {encoder}/{split}")
            e_train, e_val = artifact["train"], artifact["validation"]
            long = artifact["validation_lengths"] > meta["input_limit"]
        for mode in protocol["features"]:
            x, v = features(e_train, train, mode), features(e_val, val, mode)
            if mode != "embedding":
                scaler = StandardScaler().fit(x)
                x, v = scaler.transform(x), scaler.transform(v)
            for formulation in protocol["formulations"]:
                key = f"{encoder}/{mode}/{formulation}"
                mark = perf_counter()
                extra = {}
                if formulation == "multiclass":
                    p = LinearSVC(random_state=42).fit(x, y).predict(v)
                elif formulation == "ordinal":
                    p = ordinal_predict(x, y, v)
                else:
                    estimate = Ridge(alpha=10).fit(x, np.clip(raw, *bounds)).predict(v)
                    p = np.searchsorted(cuts, estimate, side="left")
                    extra["mae_raw_b"] = float(mean_absolute_error(raw_val, estimate))
                predictions[key] = p
                results[key] = {**metrics(truth, p, val), **extra,
                                "fit_and_validation_seconds": perf_counter()-mark}
        baseline_pred = predictions[f"{encoder}/embedding/multiclass"]
        diagnostics[encoder] = {"truncated": int(long.sum()), "not_truncated": int((~long).sum()),
                                "truncated_errors": int((baseline_pred[long] != truth[long]).sum()),
                                "not_truncated_errors": int((baseline_pred[~long] != truth[~long]).sum())}
    baseline = "minilm/embedding/multiclass"
    if baseline not in results:
        raise ValueError("Embeddings da baseline ausentes.")
    reference = results[baseline]
    ranked = sorted(results, key=lambda name: results[name]["macro_f1"], reverse=True)
    qualified = []
    for key in ranked:
        candidate = results[key]
        delta = candidate["macro_f1"] - reference["macro_f1"]
        ci = paired_interval(truth, predictions[key], predictions[baseline], protocol["bootstrap_samples"])
        area_loss = max(reference["by_area"][area]["macro_f1"] - group["macro_f1"]
                        for area, group in candidate["by_area"].items())
        candidate.update(gain_vs_baseline=delta, paired_bootstrap_95=ci, worst_area_loss=area_loss)
        if (delta >= protocol["minimum_gain_macro_f1"] and ci[0] > 0
            and candidate["easy_hard_errors"] <= reference["easy_hard_errors"] and area_loss <= 0.10):
            qualified.append(key)
    p = predictions[baseline]
    structures = [structural(r["question"]) for r in val]
    slices = {}
    for name, column in (("formula_proxy", 4), ("figure_or_table_reference", 5)):
        mask = np.array([values[column] > 0 for values in structures])
        slices[name] = {"n": int(mask.sum()), "errors": int((p[mask] != truth[mask]).sum()),
                        "other_n": int((~mask).sum()), "other_errors": int((p[~mask] != truth[~mask]).sum())}
    report = {"ranked": ranked, "qualified": qualified, "results": results,
              "missing_encoders": [name for name in protocol["encoders"] if name not in diagnostics],
              "protocol_sha256": hashlib.sha256(protocol_file.read_bytes()).hexdigest(),
              "dataset_revision": audit["dataset_revision"],
              "sources": sources,
              "diagnostics": diagnostics, "structural_slices": slices,
              "train_clipping_bounds": bounds.tolist(),
              "train_clipped": int(((raw < bounds[0]) | (raw > bounds[1])).sum()),
              "skill_missing": [sum(r.get("skill") is None for r in rows) for rows in (train, val)],
              "pedagogy_review": [dict(Counter((r.get("pedagogy") or {}).get("review_status")
                                                for r in rows)) for rows in (train, val)]}
    Path("results/fase02r_comparacao.json").write_text(json.dumps(report, indent=2), encoding="utf8")
    for key in ranked[:10]:
        print(key, round(results[key]["macro_f1"], 4), results[key]["paired_bootstrap_95"])
    print("qualified:", qualified)
    print("missing encoders:", report["missing_encoders"])


if __name__ == "__main__":
    main()
