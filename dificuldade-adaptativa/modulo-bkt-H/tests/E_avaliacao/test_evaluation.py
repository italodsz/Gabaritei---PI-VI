import os
from pathlib import Path
import unittest
import numpy as np

from bkt04.common import ROOT,load


@unittest.skipUnless(bool(os.environ.get("BKT04_WORK")),"BLOQUEADO: previsões e respostas reais necessárias.")
class Evaluation(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.work=Path(os.environ["BKT04_WORK"])
        cls.pred=dict(np.load(cls.work/"predicoes_comparacao.npz",allow_pickle=False))
        cls.report=load(ROOT/"reports/comparacao_estatistica.json")

    def test_aligned_observations(self):
        self.assertEqual(len(self.pred["y"]),29948)
        self.assertEqual(len(set(self.pred["student"])),585)
        self.assertEqual(len(set(self.pred["event_id"])),29948)
        self.assertEqual(len(self.pred["bkt"]),len(self.pred["historico_suavizado"]))

    def test_independent_loss_readback(self):
        y=self.pred["y"]
        p=self.pred["bkt"]
        q=self.pred["historico_suavizado"]
        a=-y*np.log(p)-(1-y)*np.log1p(-p)
        b=-y*np.log(q)-(1-y)*np.log1p(-q)
        self.assertAlmostEqual(float((a-b).mean()),self.report["overall"]["delta_log_loss"],13)

    def test_student_bootstrap_replay(self):
        from comparar import paired
        r=paired(self.pred,2000,20261111)
        self.assertEqual(r["bootstrap_logloss_differences"],self.report["overall"]["bootstrap_logloss_differences"])
        self.assertEqual(r["ci95"],self.report["overall"]["ci95"])

    def test_extreme_groups(self):
        y=self.pred["y"]
        rate={u:y[self.pred["student"]==u].mean() for u in set(self.pred["student"])}
        masks={"accuracy_le_0.1":np.array([rate[u]<=.1 for u in self.pred["student"]]),
               "accuracy_ge_0.9":np.array([rate[u]>=.9 for u in self.pred["student"]])}
        for name,mask in masks.items():
            r=self.report["extreme_groups"][name]
            self.assertEqual(r["events"],int(mask.sum()))
            self.assertEqual(r["students"],len(set(self.pred["student"][mask])))

    def test_validation_policy_does_not_claim_learning(self):
        r=load(ROOT/"reports/politicas_validacao.json")
        self.assertEqual(r["source_split"],"validacao")
        self.assertFalse(r["observed_responses_to_recommended_levels"])
        for t in r["trials"]:
            for metric in t["metrics"].values():
                self.assertEqual(metric["unauthorized_choice_changes"],0)
