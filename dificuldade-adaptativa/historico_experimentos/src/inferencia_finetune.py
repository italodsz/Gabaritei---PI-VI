import argparse
import json
from pathlib import Path
from time import perf_counter

import torch
from transformers import AutoTokenizer

from experiments.fase_02_finetune import Classifier
from experiments.fase_02_treinamento import LABELS


class Predictor:
    def __init__(self, directory, device="cuda"):
        self.metadata = json.loads((directory / "metricas.json").read_bytes())
        self.device = device
        self.tokenizer = AutoTokenizer.from_pretrained(directory / "tokenizer")
        self.model = Classifier(self.metadata["model"], self.metadata["revision"])
        delta = torch.load(directory / "delta.pt", map_location="cpu", weights_only=True)
        if set(delta) != set(self.model.delta()):
            raise ValueError("Checkpoint incompleto ou incompatível.")
        self.model.load_state_dict(delta, strict=False)
        self.model.to(device).eval()

    def predict(self, question, options):
        if not isinstance(question, str) or not question.strip():
            raise ValueError("Enunciado vazio ou inválido.")
        if not isinstance(options, list) or len(options) != 5 or any(
            not isinstance(x, str) or not x.strip() for x in options
        ):
            raise ValueError("Informe cinco alternativas não vazias na ordem A–E.")
        from experiments.fase_02_finetune import question_text
        text = question_text({"question": question, "options": [
            {"label": label, "text": value} for label, value in zip("ABCDE", options)
        ]})
        start = perf_counter()
        batch = self.tokenizer(text, truncation=True, max_length=self.metadata["limit"],
                               return_tensors="pt").to(self.device)
        batch.pop("token_type_ids", None)
        with torch.inference_mode(), torch.autocast(self.device, enabled=self.device == "cuda", dtype=torch.float16):
            label = LABELS[self.model(batch).argmax(1).item()]
        return {"class": label, "model_revision": self.metadata["revision"],
                "dataset_revision": self.metadata["dataset_revision"], "seconds": perf_counter()-start}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("checkpoint", type=Path)
    parser.add_argument("question")
    parser.add_argument("options", nargs=5)
    parser.add_argument("--device", choices=("cpu", "cuda"), default="cuda")
    args = parser.parse_args()
    print(json.dumps(Predictor(args.checkpoint, args.device).predict(args.question, args.options)))
