import argparse
import hashlib
import json
import os
import platform
from pathlib import Path
from time import perf_counter

import numpy as np
import psutil
import torch
from transformers import AutoModel, AutoTokenizer

from experiments.fase_02_treinamento import load_split


def encode_batch(model, tokenizer, texts, limit, pooling):
    batch = tokenizer(texts, max_length=limit, truncation=True, padding=True,
                      return_tensors="pt").to(model.device)
    hidden = model(**batch).last_hidden_state
    mask = batch["attention_mask"]
    if pooling == "mean":
        vectors = (hidden * mask.unsqueeze(-1)).sum(1) / mask.sum(1).unsqueeze(1)
    elif pooling == "last":
        last = torch.where(mask.bool(), torch.arange(mask.shape[1], device=mask.device), -1).max(1).values
        vectors = hidden[torch.arange(hidden.shape[0], device=mask.device), last]
    else:
        vectors = hidden[:, 0]
    if pooling != "mean":
        vectors = torch.nn.functional.normalize(vectors, dim=1)
    return vectors.float().cpu().numpy()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("dataset", type=Path)
    parser.add_argument("encoder")
    parser.add_argument("--probe", action="store_true")
    parser.add_argument("--device", choices=("cpu", "cuda"), default="cpu")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    protocol = Path("experiments/protocolo_fase_02_revisada.json")
    checkpoint, revision, limit, pooling, context = json.loads(protocol.read_bytes())["encoders"][args.encoder]
    audit = json.loads(Path("results/fase_01.json").read_bytes())
    for name, digest in audit["hashes"].items():
        if hashlib.sha256((args.dataset / name).read_bytes()).hexdigest() != digest:
            raise ValueError(f"Hash divergente: {name}")
    eligible = json.loads((args.dataset / "ids_elegiveis.json").read_bytes())
    torch.set_num_threads(min(4, os.cpu_count() or 1))
    started = perf_counter()
    tokenizer = AutoTokenizer.from_pretrained(checkpoint, revision=revision)
    if args.device == "cuda" and not torch.cuda.is_available():
        raise RuntimeError("CUDA indisponível nesta instalação do PyTorch.")
    dtype = torch.float16 if args.device == "cuda" else "auto"
    model = AutoModel.from_pretrained(checkpoint, revision=revision, dtype=dtype).to(args.device).eval()
    if args.probe:
        text = ["Uma caixa contém 24 lápis. Quantos lápis representam um quarto do total?"]
        timings = []
        with torch.inference_mode():
            encode_batch(model, tokenizer, text, limit, pooling)
            for _ in range(5):
                mark = perf_counter()
                encode_batch(model, tokenizer, text, limit, pooling)
                timings.append(perf_counter() - mark)
        evidence = {"encoder": args.encoder, "text": text[0], "seconds": timings, "device": args.device,
                    "median_seconds": float(np.median(timings))}
        suffix = "_cuda" if args.device == "cuda" else ""
        Path(f"results/fase02r_{args.encoder}{suffix}_latencia.json").write_text(
            json.dumps(evidence, ensure_ascii=False, indent=2), encoding="utf8")
        print(json.dumps(evidence, ensure_ascii=False))
        return
    process = psutil.Process()
    memory = process.memory_info().rss
    arrays, metadata = {}, {}
    for split in ("train", "validation"):
        rows = load_split(args.dataset, split, set(eligible[split]))
        texts = [r["question"] for r in rows]
        sizes = [len(ids) for ids in tokenizer(texts, truncation=False, verbose=False)["input_ids"]]
        features = []
        mark = perf_counter()
        with torch.inference_mode():
            for start in range(0, len(texts), 8):
                vectors = encode_batch(model, tokenizer, texts[start:start+8], limit, pooling)
                features.append(vectors)
                memory = max(memory, process.memory_info().rss)
                if start % 320 == 0:
                    print(args.encoder, split, start + len(vectors), "/", len(rows), flush=True)
        arrays[split] = np.concatenate(features)
        arrays[f"{split}_lengths"] = np.asarray(sizes)
        arrays[f"{split}_ids"] = np.asarray([r["id"] for r in rows])
        metadata[split] = {"seconds": perf_counter()-mark, "truncated": sum(n > limit for n in sizes),
                           "n": len(rows), "dimension": arrays[split].shape[1]}
    out = args.output or Path(f"results/fase02r_{args.encoder}.npz")
    np.savez_compressed(out, **arrays)
    metadata.update(checkpoint=checkpoint, revision=revision, input_limit=limit, native_context=context,
                    pooling=pooling, peak_sampled_rss_bytes=memory, total_seconds=perf_counter()-started,
                    embedding_sha256=hashlib.sha256(out.read_bytes()).hexdigest(),
                    protocol_sha256=hashlib.sha256(protocol.read_bytes()).hexdigest(),
                    dataset_revision=audit["dataset_revision"], device=args.device,
                    dtype=str(model.dtype),
                    gpu_peak_allocated_bytes=torch.cuda.max_memory_allocated() if args.device == "cuda" else None,
                    python=platform.python_version(), torch=torch.__version__)
    out.with_suffix(".json").write_text(json.dumps(metadata, indent=2), encoding="utf8")


if __name__ == "__main__":
    main()
