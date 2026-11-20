import os
from pathlib import Path
import unittest

from bkt04.common import ROOT,load,rows
from bkt04.inferencia import validate_parameters


@unittest.skipUnless(bool(os.environ.get("BKT04_WORK")),"BLOQUEADO: reconstrução e treinamento reais necessários.")
class Training(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.work=Path(os.environ["BKT04_WORK"])
        cls.job=cls.work/"fit_original"
        cls.comparison=load(ROOT/"reports/reproducao_treinamento.json")

    def test_all_skills_really_exported(self):
        output=load(self.job/"models/parametros_por_habilidade.json")
        self.assertEqual(len(output["skills"]),56)
        self.assertEqual(self.comparison["skills"],56)

    def test_convergence_and_initializations(self):
        output=load(self.job/"models/parametros_por_habilidade.json")
        for skill,r in output["skills"].items():
            attempts=list(rows(self.job/f"evidence/initializations/skill_{skill}.jsonl"))
            self.assertEqual(len(attempts),20)
            self.assertTrue(r["converged"])
            selected=attempts[r["best_initialization"]]
            self.assertEqual(r["parameters"],selected["parameters"])
            self.assertEqual(r["mean_nll"],min(a["mean_nll"] for a in attempts if a["converged"]))

    def test_original_tolerances(self):
        for r in self.comparison["rows"]:
            self.assertLessEqual(max(r["absolute_difference"].values()),1e-4)
            self.assertLessEqual(abs(r["original_nll"]-r["reproduced_nll"]),1e-8)

    def test_parameter_constraints(self):
        for r in load(self.job/"models/parametros_por_habilidade.json")["skills"].values():
            validate_parameters(r["parameters"])
