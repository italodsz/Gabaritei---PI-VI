import argparse
import json
from pathlib import Path
from time import perf_counter

import joblib

from experiments.fase_02_finalizar_candidata import embed, load_encoder, predict_encoded
from experiments.fase_02_treinamento import LABELS


class RevisedDifficultyPredictor:
    def __init__(self, artifact):
        self.bundle = joblib.load(artifact)
        self.encoder = load_encoder(self.bundle)

    def predict_difficulty(self, question_text, area=None):
        if not isinstance(question_text, str) or not question_text.strip():
            raise ValueError("Informe um enunciado não vazio.")
        if area not in (None, "CH", "CN", "LC", "MT"):
            raise ValueError("Área inválida.")
        if self.bundle["mode"] in ("area", "both") and area is None:
            raise ValueError("A área é obrigatória para este modelo.")
        rows = [{"question": question_text, "area": area}]
        start = perf_counter()
        label = predict_encoded(self.bundle, embed(self.bundle, self.encoder, rows), rows)[0]
        return {"class": LABELS[label], "model_version": self.bundle["model_version"],
                "dataset_revision": self.bundle["dataset_revision"], "confidence": None,
                "inference_seconds": perf_counter()-start}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("artifact", type=Path)
    parser.add_argument("question")
    parser.add_argument("--area")
    args = parser.parse_args()
    print(json.dumps(RevisedDifficultyPredictor(args.artifact).predict_difficulty(args.question, args.area)))
