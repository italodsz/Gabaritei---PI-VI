import argparse
from collections import Counter
import json
from pathlib import Path

from transformers import AutoTokenizer

from experiments.fase_02_treinamento import load_split, target


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("dataset", type=Path)
    args = parser.parse_args()
    protocol = json.loads(Path("experiments/protocolo_fase_02_revisada.json").read_bytes())
    checkpoint, revision, limit, *_ = protocol["encoders"]["minilm"]
    tokenizer = AutoTokenizer.from_pretrained(checkpoint, revision=revision)
    eligible = json.loads((args.dataset / "ids_elegiveis.json").read_bytes())
    cuts = json.loads(Path("results/fase_01.json").read_bytes())["difficulty_cutoffs"]
    report = {}
    for split in ("train", "validation"):
        rows = load_split(args.dataset, split, set(eligible[split]))
        texts = [r["question"] for r in rows]
        offsets = tokenizer(texts, truncation=True, max_length=limit,
                            return_offsets_mapping=True)["offset_mapping"]
        ends = [max(end for _, end in mapping) for mapping in offsets]
        report[split] = {
            "n": len(rows),
            "with_assets": sum(bool(row.get("assets")) for row in rows),
            "with_descriptions": sum(bool(row.get("descriptions")) for row in rows),
            "with_question_mark": sum("?" in text for text in texts),
            "last_question_mark_outside_input": sum(text.rfind("?") >= end for text, end in zip(texts, ends)),
            "class_by_area": {area: dict(Counter(target(row, cuts) for row in rows if row["area"] == area))
                              for area in sorted({r["area"] for r in rows})},
        }
    Path("results/fase02r_diagnostico.json").write_text(json.dumps(report, indent=2), encoding="utf8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
