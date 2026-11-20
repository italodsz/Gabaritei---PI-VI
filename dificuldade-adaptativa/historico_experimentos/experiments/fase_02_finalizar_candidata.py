import argparse
import hashlib
import json
from pathlib import Path
from time import perf_counter

import joblib
import numpy as np
import torch
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.svm import LinearSVC
from transformers import AutoModel, AutoTokenizer

from experiments.fase_02_comparar import features, metrics, ordinal_classes
from experiments.fase_02_encoders import encode_batch
from experiments.fase_02_treinamento import LABELS, load_split, target


def model_output(bundle, embeddings, rows):
    x = features(embeddings, rows, bundle["mode"])
    if bundle["scaler"] is not None:
        x = bundle["scaler"].transform(x)
    head = bundle["head"]
    if bundle["formulation"] == "ordinal":
        return ordinal_classes(head, x)
    return head.predict(x)


def predict_encoded(bundle, embeddings, rows):
    prediction = model_output(bundle, embeddings, rows)
    if bundle["formulation"] == "ridge_b":
        return np.searchsorted(bundle["cuts"], prediction, side="left")
    return prediction


def load_encoder(bundle):
    checkpoint, revision, *_ = bundle["encoder"]
    torch.set_num_threads(4)
    device = bundle["device"]
    if device == "cuda" and not torch.cuda.is_available():
        raise RuntimeError("Esta candidata requer uma instalação de PyTorch com CUDA.")
    dtype = torch.float16 if device == "cuda" else "auto"
    return (AutoModel.from_pretrained(checkpoint, revision=revision, dtype=dtype).to(device).eval(),
            AutoTokenizer.from_pretrained(checkpoint, revision=revision))


def embed(bundle, encoder, rows):
    _, _, limit, pooling, _ = bundle["encoder"]
    texts = [r["question"] for r in rows]
    with torch.inference_mode():
        return np.concatenate([encode_batch(*encoder, texts[i:i+8], limit, pooling)
                               for i in range(0, len(rows), 8)])


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("dataset", type=Path)
    args = parser.parse_args()
    comparison = Path("results/fase02r_comparacao.json").read_bytes()
    report = json.loads(comparison)
    if report["missing_encoders"]:
        raise ValueError(f"Comparação incompleta: {report['missing_encoders']}")
    if not report["qualified"]:
        print("Nenhuma candidata qualificada. Avaliação de 2024 preservada.")
        return
    selected = report["qualified"][0]
    encoder_name, mode, formulation = selected.split("/")
    protocol_bytes = Path("experiments/protocolo_fase_02_revisada.json").read_bytes()
    if hashlib.sha256(protocol_bytes).hexdigest() != report["protocol_sha256"]:
        raise ValueError("Protocolo divergente da comparação.")
    protocol = json.loads(protocol_bytes)
    audit = json.loads(Path("results/fase_01.json").read_bytes())
    if audit["dataset_revision"] != report["dataset_revision"]:
        raise ValueError("Revisão divergente da comparação.")
    for name, digest in audit["hashes"].items():
        if hashlib.sha256((args.dataset / name).read_bytes()).hexdigest() != digest:
            raise ValueError(f"Hash divergente: {name}")
    ids = json.loads((args.dataset / "ids_elegiveis.json").read_bytes())
    train = load_split(args.dataset, "train", set(ids["train"]))
    cuts = audit["difficulty_cutoffs"]
    y = np.array([LABELS.index(target(r, cuts)) for r in train])
    source = report["sources"][encoder_name]
    embedding_file = Path(source["path"])
    meta = json.loads(embedding_file.with_suffix(".json").read_bytes())
    if (meta["embedding_sha256"] != source["sha256"]
        or meta["embedding_sha256"] != hashlib.sha256(embedding_file.read_bytes()).hexdigest()
        or meta["protocol_sha256"] != report["protocol_sha256"]
        or meta["dataset_revision"] != report["dataset_revision"]):
        raise ValueError("Embeddings incompatíveis com a comparação.")
    with np.load(embedding_file) as arrays:
        if arrays["train_ids"].tolist() != [row["id"] for row in train]:
            raise ValueError("IDs de treino divergentes.")
        x = features(arrays["train"], train, mode)
    scaler = None
    if mode != "embedding":
        scaler = StandardScaler().fit(x)
        x = scaler.transform(x)
    if formulation == "ordinal":
        head = [LogisticRegression(max_iter=1000).fit(x, y > k) for k in (0, 1)]
    elif formulation == "ridge_b":
        b = np.array([r["tri"]["b"] for r in train])
        head = Ridge(alpha=10).fit(x, np.clip(b, *report["train_clipping_bounds"]))
    else:
        head = LinearSVC(random_state=42).fit(x, y)
    version = "fase02r-" + hashlib.sha256(comparison).hexdigest()[:12]
    bundle = {"encoder": protocol["encoders"][encoder_name], "device": source["device"],
              "mode": mode, "formulation": formulation,
              "scaler": scaler, "head": head, "cuts": cuts, "model_version": version,
              "dataset_revision": audit["dataset_revision"]}
    artifact = Path("models/fase02r_candidata.joblib")
    artifact.parent.mkdir(exist_ok=True)
    joblib.dump(bundle, artifact, compress=3)
    bundle = joblib.load(artifact)
    test = load_split(args.dataset, "test", set(ids["test"]))
    truth = np.array([LABELS.index(target(r, cuts)) for r in test])
    encoder = load_encoder(bundle)
    start = perf_counter()
    embeddings = embed(bundle, encoder, test)
    prediction = predict_encoded(bundle, embeddings, test)
    result = {"selected": selected, "model_version": version,
              "comparison_sha256": hashlib.sha256(comparison).hexdigest(),
              "artifact_sha256": hashlib.sha256(artifact.read_bytes()).hexdigest(),
              "test_seconds": perf_counter()-start, "test": metrics(truth, prediction, test)}
    if formulation == "ridge_b":
        raw_estimates = model_output(bundle, embeddings, test)
        result["test"]["mae_raw_b"] = float(np.abs(raw_estimates - [row["tri"]["b"] for row in test]).mean())
    Path("results/fase02r_teste_final.json").write_text(json.dumps(result, indent=2), encoding="utf8")
    print(selected, result["test"]["macro_f1"], result["test"]["accuracy"])


if __name__ == "__main__":
    main()
