"""Pre-test mathematical, data, baseline and calibration checks."""
from itertools import product
import math
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import numpy as np

from src.common import ROOT,PHASE2,PARAMS,load,model,rows,sha,sequences,save
from src.matematica import infer,exact_likelihood
from src.metricas import Scores,paired_bootstrap
from src.predicoes import predict
from src.calibracao import apply
from src import protocolo


class PreTeste(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.private=Path(os.environ["BKT_PRIVATE"])
        cls.p={"L0":.25,"T":.1,"G":.2,"S":.1}
        cls.gate=load(ROOT/"reports/gate_entrada.json")

    def test_01_hashes(self):
        self.assertEqual(sha(ROOT/"models/parametros_por_habilidade.json"),self.gate["model_sha256"])
        for n,h in self.gate["private_sha256"].items():
            self.assertEqual(sha(self.private/n),h)

    def test_02_student_isolation(self):
        students=list(rows(self.private/"estudantes.jsonl"))
        splits={s:{r["student_id"] for r in students if r["split"]==s} for s in ("treino","validacao","teste")}
        self.assertEqual(sum(map(len,splits.values())),len(set.union(*splits.values())))
        self.assertEqual([len(x) for x in splits.values()],[2802,601,600])

    def test_03_skills(self):
        self.assertEqual(len(model()["skills"]),56)
        self.assertEqual(sorted(model()["skills"],key=int),self.gate["selected_skills"])
        self.assertEqual(len(sequences(self.private,"treino")),19370)

    def test_04_constraints(self):
        for e in model()["skills"].values():
            _,history=infer([0,1],e["parameters"])
            self.assertTrue(all(0<=r["next"]<=1 for r in history))
        with self.assertRaises(ValueError):
            infer([1],{**self.p,"G":.99})

    def test_05_initial_emission(self):
        _,r=infer([1],self.p)
        self.assertAlmostEqual(r[0]["predicted"],.375,14)

    def test_06_correct_update(self):
        _,r=infer([1],self.p)
        self.assertAlmostEqual(r[0]["posterior"],.6,14)
        self.assertAlmostEqual(r[0]["next"],.64,14)

    def test_07_error_update(self):
        _,r=infer([0],self.p)
        self.assertAlmostEqual(r[0]["posterior"],.04,14)
        self.assertAlmostEqual(r[0]["next"],.136,14)

    def test_08_learning_no_forgetting(self):
        _,r=infer([0,1,0,1],self.p)
        self.assertTrue(all(x["next"]>=x["posterior"] for x in r))

    def test_09_reset(self):
        self.assertEqual(infer([0,1],self.p),infer([0,1],self.p))
        self.assertEqual(infer([0],self.p)[1][0],infer([0,1],self.p)[1][0])

    def test_10_future_leakage(self):
        a=infer([0,1,1],self.p)[1]
        b=infer([0,0,0],self.p)[1]
        self.assertEqual(a[0]["predicted"],b[0]["predicted"])
        self.assertEqual(a[1]["predicted"],b[1]["predicted"])
        self.assertNotEqual(a[2]["predicted"],b[2]["predicted"])

    def test_11_exact_enumeration(self):
        for n in range(1,5):
            for obs in product((0,1),repeat=n):
                ll,_=infer(obs,self.p)
                self.assertAlmostEqual(math.exp(ll),float(exact_likelihood(obs,self.p)),13)
        self.assertAlmostEqual(math.exp(infer([0,1],self.p)[0]),.1845,14)

    def test_12_numeric_limits(self):
        p={"L0":.9999,"T":.0001,"G":.3,"S":.0001}
        ll,h=infer([0]*5000,p)
        self.assertTrue(math.isfinite(ll))
        self.assertTrue(all(0<=r["next"]<=1 for r in h))
        with self.assertRaises(ValueError):
            infer([True],self.p)

    def test_13_training_reproduction(self):
        r=load(ROOT/"reports/reproducibilidade.json")
        self.assertEqual(len(r["rows"]),56)
        self.assertEqual(r["starts"],1120)
        self.assertTrue(all(x["classification"] in ("reproducao_exata","dentro_tolerancia") for x in r["rows"]))

    def test_14_validation(self):
        v=load(ROOT/"reports/validacao_reproduzida.json")
        self.assertEqual(v["events"],29780)
        self.assertEqual(v["students"],596)
        for name in ("bkt","taxa_habilidade"):
            self.assertLess(v["differences_to_phase02"][name]["log_loss"],1e-11)
            self.assertLess(v["differences_to_phase02"][name]["brier"],1e-11)
        self.assertLess(v["max_prediction_difference"],1e-10)

    def test_15_baselines(self):
        r=sequences(self.private,"validacao")[0]
        data=predict([r])
        e=model()["skills"][r["skill_id"]]
        q=(e["correct_count"]+1)/(e["training_events"]+2)
        self.assertEqual(data["taxa_habilidade"][0],q)
        self.assertEqual(data["historico_suavizado"][0],q)
        if r["length"]>=2:
            self.assertAlmostEqual(data["historico_suavizado"][1],(2*q+r["correct_first"][0])/3,14)

    def test_16_bootstrap_clusters(self):
        y=[1,1,0,0]
        p={"bkt":np.array([.8,.8,.8,.8]),"taxa_habilidade":np.full(4,.5)}
        r=paired_bootstrap(y,p,np.array(["a","a","b","b"]),200,42)
        ci=r["paired_difference"]["bkt"]["log_loss"]
        self.assertAlmostEqual(ci["low"],-math.log(.8)+math.log(.5),12)
        self.assertAlmostEqual(ci["high"],-math.log(.2)+math.log(.5),12)
        self.assertEqual(ci["valid_replicates"],200)

    def test_17_undefined(self):
        m=Scores([1,1],[.2,.9]).compute()
        self.assertIsNone(m["auc_roc"])
        self.assertAlmostEqual(Scores([0,1],[.5,.5]).compute()["auc_roc"],.5,14)

    def test_18_auc_numerical_ties(self):
        a=Scores([0,1],[.7,.7+1e-14]).compute()
        self.assertEqual(a["auc_roc"],.5)
        self.assertEqual(Scores([0,1],[.6,.8]).compute()["auc_roc"],1.)

    def test_19_calibration_validation_only(self):
        c=load(ROOT/"models/calibracao.json")
        self.assertEqual(c["source_split"],"validacao")
        self.assertEqual(len(c["folds"]),5)
        self.assertEqual(sum(f["heldout_events"] for f in c["folds"]),29780)
        for f in c["folds"]:
            self.assertEqual(f["training_events"]+f["heldout_events"],29780)
        np.testing.assert_allclose(apply([.2,.8],{"a":1.,"b":0.}),[.2,.8],atol=1e-15)

    def test_20_pretest_denies_test(self):
        with self.assertRaises(ValueError):
            sequences(self.private,"teste")

    def test_21_protocol_tamper(self):
        with tempfile.TemporaryDirectory() as t:
            base=Path(t)
            (base/"reports").mkdir()
            (base/"evidence/hashes").mkdir(parents=True)
            locked=base/"code.py"
            locked.write_text("fixed")
            doc=base/"reports/protocolo_pre_teste.json"
            save(doc,{"locked_sha256":{"code.py":sha(locked)}})
            save(base/"evidence/hashes/protocolo.json",{"sha256":sha(doc)})
            with patch.object(protocolo,"ROOT",base):
                protocolo.verify()
                locked.write_text("changed")
                with self.assertRaisesRegex(ValueError,"alterado"):
                    protocolo.verify()

    def test_22_model_export(self):
        with tempfile.TemporaryDirectory() as t:
            p=Path(t)/"model.json"
            save(p,model())
            self.assertEqual(load(p),model())

    def test_23_critical_math_audit(self):
        a=load(ROOT/"reports/auditoria_matematica.json")
        self.assertEqual(a["exact_sequences"],126)
        self.assertTrue(all(r["nll_error"]<1e-9 for r in a["skills"]))

    def test_24_profiles_and_predictions(self):
        s=load(ROOT/"reports/estabilidade_parametros.json")
        p=load(ROOT/"reports/habilidades_fronteira.json")
        self.assertEqual(sum(r["parameter_wide"] for r in s.values()),28)
        self.assertEqual(len(p),7)
        self.assertTrue(all(r["predictions_replicated"]==100 for r in s.values()))
        self.assertTrue(all(len(r)>0 for r in p.values()))
