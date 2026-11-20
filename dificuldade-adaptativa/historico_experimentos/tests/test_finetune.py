import json
from pathlib import Path
import unittest

import numpy as np
import torch

from experiments.fase_02_finetune import load_data, question_text
from experiments.fase_02_comparar import metrics
from experiments.fase_02_treinamento import LABELS
from src.inferencia_finetune import Predictor


class FineTuneTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.audit, cls.train, cls.val = load_data(Path("../base-oficial/Dataset/base_trabalho"))
        cls.directory = Path("results/ft_bert_256_42")
        cls.predictor = Predictor(cls.directory)

    def test_official_data_and_inputs(self):
        self.assertEqual((len(self.train), len(self.val)), (1801, 136))
        row = self.train[0]
        text = question_text(row)
        self.assertEqual(text, question_text({**row, "tri": {"b": 999}, "answer": "changed"}))
        for option in row["options"]:
            self.assertIn(option["text"], text)
        self.assertEqual(len(self.predictor.tokenizer(
            text * 20, max_length=256, truncation=True)["input_ids"]), 256)

    def test_saved_predictions_reproduce_metrics(self):
        saved = json.loads((self.directory / "metricas.json").read_bytes())
        predictions = saved["predictions"]
        self.assertEqual([r["id"] for r in self.val], [r["id"] for r in predictions])
        actual, predicted = (np.array([LABELS.index(r[key]) for r in predictions])
                             for key in ("actual", "predicted"))
        computed = metrics(actual, predicted, self.val)
        self.assertEqual(computed["confusion"], saved["confusion"])
        self.assertEqual(computed["macro_f1"], saved["macro_f1"])
        self.assertGreater(saved["changed_encoder_parameters"], 0)
        batch = self.predictor.tokenizer(
            [question_text(row) for row in self.val[:4]], truncation=True, max_length=saved["limit"],
            padding=True, return_tensors="pt"
        ).to("cuda")
        batch.pop("token_type_ids", None)
        with torch.inference_mode(), torch.autocast("cuda", dtype=torch.float16):
            restored = self.predictor.model(batch).argmax(1).tolist()
        self.assertEqual([LABELS[i] for i in restored], [r["predicted"] for r in predictions[:4]])

    def test_inference_validation_and_small_training(self):
        question, options = "Qual é o dobro de 5?", ["1", "2", "5", "10", "20"]
        prediction = self.predictor.predict(question, options)
        self.assertIn(prediction["class"], LABELS)
        self.assertEqual(prediction["class"], self.predictor.predict(question, options)["class"])
        with self.assertRaises(ValueError):
            self.predictor.predict("", options)
        with self.assertRaises(ValueError):
            self.predictor.predict(question, [])
        model = self.predictor.model
        inputs = self.predictor.tokenizer([question, "Qual é o triplo de 2?"], padding=True,
                                          return_tensors="pt").to("cuda")
        before = model.head[-1].weight.detach().clone()
        optimizer = torch.optim.SGD(model.head.parameters(), lr=.01)
        torch.nn.functional.cross_entropy(model(inputs), torch.tensor([0, 1], device="cuda")).backward()
        optimizer.step()
        self.assertFalse(torch.equal(before, model.head[-1].weight))
