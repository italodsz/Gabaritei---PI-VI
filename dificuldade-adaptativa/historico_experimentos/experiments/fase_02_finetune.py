import argparse
import hashlib
import json
import random
import statistics
from pathlib import Path
from time import perf_counter

import numpy as np
import torch
from transformers import AutoModel, AutoTokenizer

from experiments.fase_02_comparar import metrics
from experiments.fase_02_treinamento import LABELS, load_split, target

MODELS = {"bert": "neuralmind/bert-base-portuguese-cased", "deberta": "microsoft/mdeberta-v3-base"}


def question_text(row):
    return row["question"].strip() + "\nAlternativas:\n" + "\n".join(
        f"{option['label']}. {option['text']}" for option in row["options"]
    )


def load_data(base):
    audit = json.loads(Path("results/fase_01.json").read_bytes())
    for path, digest in audit["hashes"].items():
        if hashlib.sha256((base / path).read_bytes()).hexdigest() != digest:
            raise ValueError(path)
    ids = json.loads((base / "ids_elegiveis.json").read_bytes())
    assert [len(ids[s]) for s in ("train", "validation", "test")] == [1801, 136, 126]
    assert sum(map(len, ids.values())) == len(set().union(*map(set, ids.values())))
    train, val = [load_split(base, s, set(ids[s])) for s in ("train", "validation")]
    assert max(r["year"] for r in train) == 2022 and {r["year"] for r in val} == {2023}
    for key in ("family_id", "content_family_id", "co_item"):
        assert not ({r[key] for r in train if r.get(key)} & {r[key] for r in val if r.get(key)})
    return audit, train, val


class Classifier(torch.nn.Module):
    def __init__(self, model, revision):
        super().__init__()
        self.encoder = AutoModel.from_pretrained(model, revision=revision, dtype=torch.float32)
        self.encoder.requires_grad_(False)
        self.encoder.encoder.layer[-2:].requires_grad_(True)
        self.head = torch.nn.Sequential(torch.nn.Dropout(0.1),
                                        torch.nn.Linear(self.encoder.config.hidden_size, 3))

    def forward(self, batch):
        return self.head(self.encoder(**batch).last_hidden_state[:, 0])

    def delta(self):
        return {name: p.detach().cpu().clone() for name, p in self.named_parameters() if p.requires_grad}


def run(args):
    audit, train, val = load_data(args.dataset)
    cuts = audit["difficulty_cutoffs"]
    if args.inner_2022:
        val = [row for row in train if row["year"] == 2022]
        train = [row for row in train if row["year"] < 2022]
        cuts = statistics.quantiles([row["tri"]["b"] for row in train], n=3, method="inclusive")
    random.seed(args.seed)
    np.random.seed(args.seed)
    torch.manual_seed(args.seed)
    device = torch.device("cuda")
    tokenizer = AutoTokenizer.from_pretrained(MODELS[args.model], revision=args.revision)
    prefix = "interno_ft" if args.inner_2022 else "ft"
    out = Path("results") / f"{prefix}_{args.model}_{args.limit}_{args.seed}"
    out.mkdir(parents=True, exist_ok=True)
    encoded, labels, diagnosis = [], [], {}
    for name, rows in (("train", train), ("validation", val)):
        texts = [r["question"] if getattr(args, "stem_only", False) else question_text(r) for r in rows]
        lengths = list(map(len, tokenizer(texts, verbose=False)["input_ids"]))
        diagnosis[name] = {
            "n": len(rows), "truncated": {limit: sum(n > limit for n in lengths) for limit in (128, 256, 512)},
            "classes": {label: sum(target(r, cuts) == label for r in rows) for label in LABELS},
            "assets": sum(bool(r.get("assets")) for r in rows),
            "formula_or_table_proxy": sum(any(x in r["question"].lower() for x in ("=", "tabela", "√")) for r in rows),
            "missing_text_or_options": sum(not r["question"].strip() or not r["options"] for r in rows),
        }
        encoded.append(tokenizer(texts, truncation=True, max_length=args.limit)["input_ids"])
        labels.append([LABELS.index(target(r, cuts)) for r in rows])
    (out / "auditoria.json").write_text(json.dumps(diagnosis, indent=2), encoding="utf8")
    print(diagnosis, flush=True)
    if args.audit_only:
        return
    model = Classifier(MODELS[args.model], args.revision).to(device)
    initial = model.delta()
    optimizer = torch.optim.AdamW([p for p in model.parameters() if p.requires_grad], lr=args.lr, weight_decay=.01)
    scaler = torch.amp.GradScaler("cuda")
    start = perf_counter()
    history, best = [], -1

    def logits(split, indices):
        batch = tokenizer.pad({"input_ids": [encoded[split][i] for i in indices]},
                              return_attention_mask=True, return_tensors="pt").to(device)
        with torch.autocast("cuda", dtype=torch.float16):
            return model(batch)

    for epoch in range(args.epochs):
        model.train()
        order = np.random.permutation(len(train)).tolist()
        for pos in range(0, len(order), 16):
            window = order[pos:pos+16]
            optimizer.zero_grad(set_to_none=True)
            for offset in range(0, len(window), args.batch):
                indices = window[offset:offset+args.batch]
                y = torch.tensor([labels[0][i] for i in indices], device=device)
                output = logits(0, indices)
                loss = torch.nn.functional.cross_entropy(output.float(), y, reduction="sum") / len(window)
                scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()
        model.eval()
        mark = perf_counter()
        with torch.inference_mode():
            pred = np.concatenate([logits(1, list(range(i, min(i+args.batch, len(val))))).argmax(1).cpu().numpy()
                                   for i in range(0, len(val), args.batch)])
        result = metrics(np.array(labels[1]), pred, val)
        result["validation_seconds"] = perf_counter()-mark
        history.append(result["macro_f1"])
        print(epoch+1, result["macro_f1"], flush=True)
        if result["macro_f1"] <= best:
            break
        best = result["macro_f1"]
        delta = model.delta()
        torch.save(delta, out / "delta.pt")
        tokenizer.save_pretrained(out / "tokenizer")
        result.update(epoch=epoch+1, model=MODELS[args.model], revision=args.revision,
                      dataset_revision=audit["dataset_revision"], seed=args.seed, limit=args.limit,
                      cuts=cuts, validation_year=2022 if args.inner_2022 else 2023,
                      batch=args.batch, effective_batch=16, lr=args.lr,
                      changed_encoder_parameters=sum(not torch.equal(v, initial[k]) for k, v in delta.items()
                                                     if k.startswith("encoder.")),
                      predictions=[{"id": r["id"], "area": r["area"], "actual": LABELS[y], "predicted": LABELS[p]}
                                   for r, y, p in zip(val, labels[1], pred)])
        (out / "metricas.json").write_text(json.dumps(result, indent=2), encoding="utf8")
    (out / "execucao.json").write_text(json.dumps({
        "epochs": history, "seconds": perf_counter()-start, "torch": torch.__version__,
        "gpu": torch.cuda.get_device_name(), "peak_allocated_bytes": torch.cuda.max_memory_allocated(),
        "checkpoint_sha256": hashlib.sha256((out/"delta.pt").read_bytes()).hexdigest(),
    }, indent=2), encoding="utf8")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("dataset", type=Path)
    parser.add_argument("model", choices=MODELS)
    parser.add_argument("revision")
    parser.add_argument("--limit", type=int, choices=(256, 512), default=256)
    parser.add_argument("--batch", type=int, default=4)
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--lr", type=float, default=3e-5)
    parser.add_argument("--audit-only", action="store_true")
    parser.add_argument("--inner-2022", action="store_true")
    run(parser.parse_args())
