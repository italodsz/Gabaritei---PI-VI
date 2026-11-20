import argparse
import json
from pathlib import Path

import joblib
import sklearn


class DifficultyPredictor:
    def __init__(self, artifact):
        self.artifact = joblib.load(artifact)
        if self.artifact["sklearn"] != sklearn.__version__:
            raise ValueError("Use a versão do scikit-learn registrada no artefato.")

    def predict_difficulty(self, question_text, area=None):
        if not isinstance(question_text, str) or not question_text.strip():
            raise ValueError("Informe um enunciado não vazio.")
        if area is not None and area not in ("CH", "CN", "LC", "MT"):
            raise ValueError("Área inválida.")
        return {
            "class": str(self.artifact["pipeline"].predict([question_text])[0]),
            "model_version": self.artifact["model_version"],
            "dataset_revision": self.artifact["dataset_revision"],
            "confidence": None,
        }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("artifact", type=Path)
    parser.add_argument("question")
    parser.add_argument("--area")
    args = parser.parse_args()
    print(json.dumps(DifficultyPredictor(args.artifact).predict_difficulty(args.question, args.area)))
