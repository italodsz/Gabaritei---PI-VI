import unittest

import numpy as np

from experiments.fase_02_comparar import features, metrics, ordinal_predict, paired_interval, structural


class RevisedPhaseTwoTests(unittest.TestCase):
    def test_hybrid_features_ignore_tri_and_skill(self):
        rows = [{"question": "Figura 2. Calcule x=5.", "area": "MT", "tri": {"b": 99}, "skill": 3}]
        changed = [{**rows[0], "tri": {"a": 2, "b": -100, "c": 0}, "skill": None}]
        embeddings = np.array([[0.1, 0.2]])
        for mode in ("embedding", "structure", "area", "both"):
            np.testing.assert_array_equal(features(embeddings, rows, mode), features(embeddings, changed, mode))
        self.assertEqual(structural(rows[0]["question"])[4:], [1, 1])

    def test_ordinal_prediction_and_error_metrics(self):
        x = np.array([[-3], [-2], [-1], [0], [1], [2], [3]])
        y = np.array([0, 0, 1, 1, 1, 2, 2])
        self.assertEqual(ordinal_predict(x, y, [[-3], [0], [3]]).tolist(), [0, 1, 2])
        result = metrics(np.array([0, 1, 2]), np.array([2, 1, 1]), [{"area": "CH"}] * 3)
        self.assertEqual(result["easy_hard_errors"], 1)
        self.assertEqual(result["ordinal_mae"], 1)

    def test_paired_interval_same_predictions(self):
        y = np.array([0, 1, 2, 2, 1, 0])
        self.assertEqual(paired_interval(y, y, y, 20), [0, 0])
