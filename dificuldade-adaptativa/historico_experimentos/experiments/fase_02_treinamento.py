import argparse
import hashlib
import json
import platform
import statistics
from datetime import datetime, timezone
from pathlib import Path

import sklearn
import joblib
from sklearn.dummy import DummyClassifier
from sklearn.base import clone
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_recall_fscore_support
from sklearn.pipeline import make_pipeline
from sklearn.svm import LinearSVC

LABELS = ["facil", "media", "dificil"]


def load_split(base, split, eligible):
    rows = [json.loads(line) for line in (base / f"splits/{split}.jsonl").read_bytes().splitlines()]
    selected = [row for row in rows if row["id"] in eligible]
    if len(selected) != len(eligible) or {r["id"] for r in selected} != eligible:
        raise ValueError(f"IDs inconsistentes em {split}")
    return selected


def target(row, cuts):
    value = row["tri"]["b"]
    return LABELS[sum(value > cut for cut in cuts)]


def score(truth, predicted):
    precision, recall, f1, support = precision_recall_fscore_support(
        truth, predicted, labels=LABELS, zero_division=0
    )
    return {
        "n": len(truth),
        "support": {label: truth.count(label) for label in LABELS},
        "macro_f1": f1_score(truth, predicted, labels=LABELS, average="macro", zero_division=0),
        "accuracy": accuracy_score(truth, predicted),
        "confusion": confusion_matrix(truth, predicted, labels=LABELS).tolist(),
        "by_class": {label: {"precision": p, "recall": r, "f1": f, "n": int(n)}
                     for label, p, r, f, n in zip(LABELS, precision, recall, f1, support)},
    }


def evaluate(model, rows, cuts, include_errors=False):
    truth = [target(r, cuts) for r in rows]
    predicted = model.predict([r["question"] for r in rows]).tolist()
    result = score(truth, predicted)
    result["by_area"] = {}
    for area in sorted({r["area"] for r in rows}):
        indices = [i for i, r in enumerate(rows) if r["area"] == area]
        result["by_area"][area] = score([truth[i] for i in indices], [predicted[i] for i in indices])
    if include_errors:
        result["errors"] = [
            {"id": r["id"], "area": r["area"], "actual": actual, "predicted": prediction,
             "excerpt": r["question"][:240]}
            for r, actual, prediction in zip(rows, truth, predicted) if actual != prediction
        ]
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("dataset", type=Path)
    parser.add_argument("--output", type=Path, default=Path("results/fase_02.json"))
    parser.add_argument("--artifact", type=Path, default=Path("models/fase_02.joblib"))
    parser.add_argument("--minilm", action="store_true")
    args = parser.parse_args()
    audit = json.loads((Path(__file__).resolve().parents[1] / "results/fase_01.json").read_bytes())
    for name, expected in audit["hashes"].items():
        if hashlib.sha256((args.dataset / name).read_bytes()).hexdigest() != expected:
            raise ValueError(f"Hash divergente: {name}")
    eligible = json.loads((args.dataset / "ids_elegiveis.json").read_bytes())
    cuts = audit["difficulty_cutoffs"]
    train, validation = [load_split(args.dataset, s, set(eligible[s])) for s in ("train", "validation")]
    cuts_from_train = statistics.quantiles(
        [r["tri"]["b"] for r in train], n=3, method="inclusive"
    )
    if cuts != cuts_from_train:
        raise ValueError("Cortes divergentes do treino auditado.")
    models = {
        "majoritaria": DummyClassifier(strategy="most_frequent"),
        "tfidf_palavras": make_pipeline(TfidfVectorizer(ngram_range=(1, 2), min_df=2), LinearSVC(random_state=42)),
        "tfidf_caracteres": make_pipeline(
            TfidfVectorizer(analyzer="char", ngram_range=(3, 5), min_df=2), LinearSVC(random_state=42)
        ),
    }
    if args.minilm:
        from src.minilm import MiniLMEncoder

        models["minilm"] = make_pipeline(
            MiniLMEncoder("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
                          "e8f8c211226b894fcb81acc59f3b34ba3efd5f42"),
            LinearSVC(random_state=42),
        )
    x = [r["question"] for r in train]
    y = [target(r, cuts) for r in train]
    for model in models.values():
        model.fit(x, y)
    validation_scores = {name: evaluate(model, validation, cuts) for name, model in models.items()}
    selected = max(models, key=lambda name: validation_scores[name]["macro_f1"])
    # Sensitivity check only. It does not change model selection or the final test.
    robust_train = [r for r in train if r["tri"]["a"] >= 0.25]
    robust_model = clone(models[selected]).fit(
        [r["question"] for r in robust_train], [target(r, cuts) for r in robust_train]
    )
    config = {name: {key: str(value) for key, value in model.get_params().items()
                     if isinstance(value, (str, int, float, bool, tuple)) or value is None}
              for name, model in models.items()}
    fingerprint = hashlib.sha256(json.dumps(
        [selected, config[selected], cuts, audit["hashes"], sklearn.__version__], sort_keys=True
    ).encode()).hexdigest()[:12]
    args.artifact.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"pipeline": models[selected], "model_version": f"fase02-{fingerprint}",
                 "dataset_revision": audit["dataset_revision"], "sklearn": sklearn.__version__},
                args.artifact, compress=3)
    test = load_split(args.dataset, "test", set(eligible["test"]))
    report = {
        "run_utc": datetime.now(timezone.utc).isoformat(),
        "dataset_revision": audit["dataset_revision"],
        "sklearn": sklearn.__version__,
        "seed": 42,
        "environment": {"python": platform.python_version(), "platform": platform.platform(),
                        "cpu": platform.processor()},
        "config": config,
        "model_version": f"fase02-{fingerprint}",
        "train_support": {label: y.count(label) for label in LABELS},
        "label_order": LABELS,
        "cutoffs": cuts,
        "validation": validation_scores,
        "selected_by_validation_macro_f1": selected,
        "sensitivity_validation": {
            "minimum_train_tri_a": 0.25,
            "removed_train_rows": len(train) - len(robust_train),
            "removed_items": [{"id": r["id"], "class": target(r, cuts)} for r in train if r["tri"]["a"] < 0.25],
            "metrics": evaluate(robust_model, validation, cuts),
        },
        "test": {name: evaluate(models[name], test, cuts, include_errors=name == selected)
                 for name in dict.fromkeys((selected, "majoritaria"))},
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf8")
    for split in ("validation", "test"):
        for name, metrics in report[split].items():
            print(f"{split} {name}: macro-F1={metrics['macro_f1']:.4f}, accuracy={metrics['accuracy']:.4f}")


if __name__ == "__main__":
    main()
