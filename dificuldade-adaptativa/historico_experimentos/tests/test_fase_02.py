import json
import os
from pathlib import Path
import tempfile
import unittest

import joblib
import sklearn
from sklearn.base import clone
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import make_pipeline
from sklearn.svm import LinearSVC

from experiments.fase_02_treinamento import LABELS, load_split, target
from src.inferencia import DifficultyPredictor

ROOT = Path(__file__).resolve().parents[1]


class PhaseTwoTests(unittest.TestCase):
    def test_official_splits_and_targets(self):
        base = Path(os.environ.get("GABARITEI_DATASET", ROOT.parent / "base-oficial/Dataset/base_trabalho"))
        ids = json.loads((base / "ids_elegiveis.json").read_bytes())
        seen = set()
        for split, count, minimum, maximum in [
            ("train", 1801, 2009, 2022), ("validation", 136, 2023, 2023), ("test", 126, 2024, 2024)
        ]:
            rows = load_split(base, split, set(ids[split]))
            self.assertEqual(len(rows), count)
            self.assertTrue(seen.isdisjoint(ids[split]))
            seen.update(ids[split])
            for row in rows:
                self.assertEqual(row["split"], split)
                self.assertLessEqual(minimum, row["year"])
                self.assertLessEqual(row["year"], maximum)
                self.assertIsInstance(row["question"], str)
                self.assertNotIn(target(row, [0.80054, 1.56301]), ("", None))
        self.assertEqual([target({"tri": {"b": b}}, [0.80054, 1.56301])
                          for b in [0.80054, 1.56301, 2.0]], LABELS)

    def test_fit_and_roundtrip_on_text_without_student_or_tri_fields(self):
        texts = ["soma simples", "fracao equivalente", "equacao diferencial"] * 2
        pipeline = make_pipeline(TfidfVectorizer(), LinearSVC(random_state=42))
        pipeline.fit(texts, LABELS * 2)
        expected = pipeline.predict(texts).tolist()
        self.assertEqual(expected, LABELS * 2)
        repeated = clone(pipeline).fit(texts, LABELS * 2)
        self.assertEqual(expected, repeated.predict(texts).tolist())
        with tempfile.TemporaryDirectory(dir=ROOT) as folder:
            path = Path(folder) / "model.joblib"
            joblib.dump({"pipeline": pipeline, "model_version": "test",
                         "dataset_revision": "test", "sklearn": sklearn.__version__}, path)
            predictor = DifficultyPredictor(path)
            self.assertEqual(expected, [predictor.predict_difficulty(text)["class"] for text in texts])
            self.assertEqual(predictor.predict_difficulty(texts[0]),
                             {"class": LABELS[0], "model_version": "test",
                              "dataset_revision": "test", "confidence": None})
            for invalid in ("", "   ", None, 5):
                with self.assertRaises(ValueError):
                    predictor.predict_difficulty(invalid)
            with self.assertRaises(ValueError):
                predictor.predict_difficulty(texts[0], "INVALID")

    def test_delivered_pipeline_is_loadable(self):
        artifact = Path(os.environ.get("GABARITEI_MODEL", ROOT / "models/fase_02.joblib"))
        text = "Um tanque contém 50 litros. Qual volume representa 20% do total?"
        first = DifficultyPredictor(artifact).predict_difficulty(text)
        second = DifficultyPredictor(artifact).predict_difficulty(text)
        self.assertEqual(first, second)
        self.assertIn(first["class"], LABELS)
        self.assertEqual(first["dataset_revision"], "7e720fa876beb7249adab2f05d3ecf33ae5a2c51")
