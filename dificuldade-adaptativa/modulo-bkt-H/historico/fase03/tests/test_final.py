"""Checks of observed final artifacts against the frozen protocol."""
import os
from pathlib import Path
import unittest

import numpy as np

from src.common import ROOT,load,sha,rows,model
from src.protocolo import verify
from src.avaliacao import classify


class Final(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.result=load(ROOT/"reports/avaliacao_final.json")
        cls.protocol=verify()

    def test_25_freeze_before_open(self):
        ledger=list(rows(ROOT/"evidence/acesso_teste.jsonl"))
        frozen=next(i for i,r in enumerate(ledger) if r["action"]=="protocol_frozen")
        opens=[i for i,r in enumerate(ledger) if r["action"]=="test_outcomes_open"]
        self.assertTrue(opens and min(opens)>frozen)
        self.assertTrue(all(ledger[i]["protocol_sha256"]==sha(ROOT/"reports/protocolo_pre_teste.json") for i in opens))

    def test_26_final_counts(self):
        r=self.result
        self.assertEqual(r["evaluated_skills"],56)
        self.assertEqual(r["events"],29948)
        self.assertEqual(r["students"],585)
        self.assertEqual(r["sequences"],3892)
        self.assertEqual(sum(s["events"] for s in r["skills"].values()),r["events"])

    def test_27_frozen_model(self):
        self.assertEqual(sha(ROOT/"models/parametros_por_habilidade.json"),self.protocol["model_sha256"])
        self.assertEqual(self.result["model_sha256"],self.protocol["model_sha256"])
        self.assertEqual(self.result["protocol_sha256"],sha(ROOT/"reports/protocolo_pre_teste.json"))

    def test_28_same_observations(self):
        counts={r["n"] for r in self.result["micro"].values()}
        self.assertEqual(counts,{29948})
        for r in self.result["skills"].values():
            self.assertEqual({v["n"] for v in r["metrics"].values()},{r["events"]})

    def test_29_intervals(self):
        c=self.result["confidence"]
        self.assertEqual(c["replicates"],2000)
        self.assertEqual(c["unit"],"estudante")
        for r in c["metrics"].values():
            for metric,bounds in r.items():
                self.assertGreater(bounds["valid_replicates"],0)
                self.assertLessEqual(bounds["low"],bounds["high"])
        self.assertTrue(all(s["confidence"]["replicates"]==1000 for s in self.result["skills"].values()))

    def test_30_classification_categories(self):
        counts=self.result["classification_counts"]
        self.assertEqual(sum(counts.values()),56)
        self.assertTrue(set(counts).issubset({"A","B","C","D"}))
        c=self.protocol["definitions"]
        support={"students":100,"events":500}
        metrics={"bkt":{"brier":.1,"ece":.02},"taxa_habilidade":{"brier":.2}}
        ci={"paired_difference":{"bkt":{"log_loss":{"low":-.2,"high":-.1},"brier":{"low":-.2,"high":-.1}}}}
        stability={"predictive_width_median":.05,"parameter_wide":False,"initialization":{"boundary_parameters":[]}}
        self.assertEqual(classify(support,metrics,ci,stability,c)[0],"A")
        self.assertEqual(classify(support,metrics,ci,{**stability,"parameter_wide":True},c)[0],"B")
        self.assertEqual(classify({"students":10,"events":50},metrics,ci,stability,c)[0],"C")
        worse={"paired_difference":{"bkt":{"log_loss":{"low":.1,"high":.2},"brier":{"low":.1,"high":.2}}}}
        self.assertEqual(classify(support,metrics,worse,stability,c)[0],"D")

    def test_31_independent_results(self):
        a=load(ROOT/"reports/auditoria_resultados.json")
        self.assertEqual(a["status"],"aprovado")
        self.assertEqual(a["events_read_back"],29948)
        self.assertTrue(a["protocol_before_first_test_open"])
        self.assertTrue(all(v<1e-10 for method in a["metric_absolute_errors"].values() for v in method.values()))

    def test_32_macro_and_subgroups(self):
        self.assertEqual(set(self.result["subgroups"]),set(self.protocol["definitions"]["subgroups"]))
        for method in self.result["methods"]:
            for metric,value in self.result["macro"][method].items():
                observed=[r["metrics"][method][metric] for r in self.result["skills"].values()
                          if r["metrics"][method][metric] is not None]
                self.assertAlmostEqual(value,float(np.mean(observed)),13)
