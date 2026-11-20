import json
from pathlib import Path
import unittest

import numpy as np
from sklearn.linear_model import SGDClassifier

from experimento import replay, score
from fechamento import eligible_events, partitions, policy, update_model


class FechamentoTests(unittest.TestCase):
    def test_strict_temporal_and_student_separation(self):
        groups = partitions(eligible_events(Path("assistments.csv")))
        seen = set()
        previous = -1
        for frame in groups.values():
            self.assertTrue(frame.order_id.is_monotonic_increasing)
            self.assertGreater(frame.order_id.min(), previous)
            previous = frame.order_id.max()
            self.assertTrue(seen.isdisjoint(frame.user_id))
            seen.update(frame.user_id)
            self.assertFalse(frame.duplicated(["user_id","order_id"]).any())

    def test_current_answer_and_other_skills_do_not_leak(self):
        params = [.3,.1,.2,.1]
        history = [(1,1,1),(1,2,0),(2,1,0)]
        x1, _, _ = replay([*history,(1,1,1),(1,1,1)], params)
        x0, _, _ = replay([*history,(1,1,0),(1,1,1)], params)
        np.testing.assert_array_equal(x1[:4], x0[:4])
        self.assertNotEqual(x1[4,0],x0[4,0])
        np.testing.assert_array_equal(x1[3],replay([(1,1,1),(1,1,1)],params)[0][-1])

    def test_update_preserves_rollback_snapshot(self):
        x = np.array([[0.], [1.], [2.], [3.]])
        y = [0,0,1,1]
        original = SGDClassifier(loss="log_loss", random_state=42, learning_rate="constant", eta0=.01).fit(x,y)
        frozen = original.coef_.copy()
        updated = update_model(original,x,[1,1,0,0],.02)
        np.testing.assert_array_equal(original.coef_, frozen)
        self.assertFalse(np.array_equal(updated.coef_, frozen))

    def test_metrics_and_gate(self):
        good = score(np.array([0,1]),np.array([.1,.9]))
        poor = score(np.array([0,1]),np.array([.6,.4]))
        self.assertAlmostEqual(good["brier"], .01)
        self.assertAlmostEqual(good["log_loss"], -np.log(.9))
        self.assertEqual(good["auc"],1)
        self.assertFalse(policy(poor,good))
        self.assertTrue(policy(good,poor))

    def test_report_and_demo(self):
        report = json.loads(Path(__file__).with_name("fechamento.json").read_bytes())
        hybrid = report["models"]["bkt_sgd"]
        self.assertTrue(any(r["promoted"] for r in hybrid["gate_records"]))
        self.assertTrue(any(not r["passes_gate"] for r in hybrid["gate_records"]))
        self.assertGreater(hybrid["selected_test_change"]["l2"],0)
        self.assertTrue(report["integration_synthetic"]["synthetic_only"])
        for profile in report["integration_synthetic"]["profiles"].values():
            for difficulty, rows in profile["by_preference"].items():
                self.assertTrue(rows)
                self.assertTrue(all(row["difficulty"]==difficulty and 0<=row["probability_demo"]<=1
                                    for row in rows))
            self.assertNotEqual(profile["by_preference"]["media"],profile["medium_after_new_correct"])


if __name__ == "__main__":
    unittest.main()
