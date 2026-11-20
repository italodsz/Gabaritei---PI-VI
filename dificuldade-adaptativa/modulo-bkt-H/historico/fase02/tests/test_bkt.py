"""Executable mathematical, data, optimization and isolation tests."""
import builtins
from fractions import Fraction
from itertools import product
import json
import math
import os
from pathlib import Path
import platform
import tempfile
import unittest
from unittest.mock import patch

import numpy as np
from scipy.optimize._numdiff import approx_derivative

from bkt.alternativa import enumerate_exact,forward,matrices
from bkt.common import ROOT,PARAMETERS,save,settings,sha
from bkt.dados import groups
from bkt.inferencia import load_model,predict_correctness,trace,update_mastery,validate_parameters
from bkt.likelihood import PackedSequences
from bkt.metricas import metrics
from bkt.treinamento import feasible,fit,initializations


class BKT(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.private=Path(os.environ["BKT_PRIVATE"])
        cls.cfg=settings()
        cls.model=load_model(ROOT/"models/parametros_por_habilidade.json")
        cls.train=groups(cls.private,"treino")
        cls.p={"L0":.25,"T":.1,"G":.2,"S":.1}
        cls.short=[[0,1,1],[0,0],[1],[1,0,1]]

    def test_01_hashes_entrada(self):
        g=json.loads((ROOT/"reports/gate_entrada.json").read_bytes())
        for name,h in g["arquivos_locais_sha256"].items():
            self.assertEqual(sha(self.private/name),h)
        self.assertEqual(g["status"],"aprovado")

    def test_02_contrato_fase01(self):
        self.assertEqual(len(self.train),56)
        self.assertEqual(sum(len(v) for v in self.train.values()),19370)
        self.assertEqual(sum(r["length"] for g in self.train.values() for r in g),143092)
        for skill,rows in self.train.items():
            self.assertTrue(all(r["split"]=="treino" and r["skill_id"]==skill and
                r["event_order"]==sorted(set(r["event_order"])) for r in rows))

    def test_03_separacao_estudantes(self):
        with (self.private/"estudantes.jsonl").open(encoding="utf8") as f:
            rows=[json.loads(l) for l in f]
        groups_ids={k:{r["student_id"] for r in rows if r["split"]==k} for k in ("treino","validacao","teste")}
        self.assertEqual(sum(map(len,groups_ids.values())),len(set.union(*groups_ids.values())))
        self.assertEqual([len(v) for v in groups_ids.values()],[2802,601,600])

    def test_04_parametros(self):
        for skill,e in self.model["skills"].items():
            validate_parameters(e["parameters"])
            self.assertTrue(feasible([e["parameters"][k] for k in PARAMETERS],self.cfg))
        with self.assertRaises(ValueError):
            validate_parameters({**self.p,"G":.9})

    def test_05_matriz_transicao(self):
        pi,A,B=matrices(self.p)
        np.testing.assert_array_equal(A,[[.9,.1],[0,1]])
        self.assertEqual(sum(pi),1)
        self.assertTrue(all(abs(sum(row)-1)<1e-14 for row in A))

    def test_06_matriz_emissao(self):
        _,_,B=matrices(self.p)
        np.testing.assert_array_equal(B,[[.8,.2],[.1,.9]])
        self.assertTrue(all(abs(sum(row)-1)<1e-14 for row in B))

    def test_07_bayes_independente(self):
        self.assertAlmostEqual(update_mastery(.25,1,self.p),.64,14)
        self.assertAlmostEqual(update_mastery(.25,0,self.p),.136,14)
        posterior=Fraction(1,4)*Fraction(9,10)/Fraction(3,8)
        next_state=posterior+(1-posterior)*Fraction(1,10)
        self.assertAlmostEqual(update_mastery(.25,1,self.p),float(next_state),14)

    def test_08_previsao_independente(self):
        self.assertEqual(predict_correctness(.25,self.p),.375)
        self.assertEqual(predict_correctness(0,self.p),.2)
        self.assertEqual(predict_correctness(1,self.p),.9)
        pred=sum(a*b for a,b in zip([.75,.25],[.2,.9]))
        self.assertEqual(predict_correctness(.25,self.p),pred)

    def test_09_sem_vazamento_temporal(self):
        a=trace([0,1,1],self.p)
        b=trace([0,0,0],self.p)
        self.assertEqual(a[0]["predicted_correct"],b[0]["predicted_correct"])
        self.assertEqual(a[1]["predicted_correct"],b[1]["predicted_correct"])
        self.assertNotEqual(a[2]["predicted_correct"],b[2]["predicted_correct"])
        self.assertEqual(trace([0],self.p),a[:1])

    def test_10_log_verossimilhanca(self):
        packed=PackedSequences([[0,1]])
        loss,_=packed.objective([self.p[k] for k in PARAMETERS])
        self.assertAlmostEqual(math.exp(-2*loss),.1845,14)
        one=PackedSequences([[1]])
        self.assertAlmostEqual(one.objective([.25,.1,.2,.1])[0],-math.log(.375),14)
        self.assertEqual(one.objective([.25,.1,.2,.1])[0],one.objective([.25,.9,.2,.1])[0])

    def test_11_convergencia(self):
        for s,e in self.model["skills"].items():
            self.assertTrue(e["converged"])
            runs=[json.loads(l) for l in (ROOT/f"evidence/initializations/skill_{s}.jsonl").read_text(encoding="utf8").splitlines()]
            best=runs[e["best_initialization"]]
            self.assertEqual(best["status"],0)
            self.assertTrue(best["scipy_success"] and best["converged"])
            self.assertLessEqual(best["iterations"],500)
            self.assertLessEqual(best["mean_nll"],min(r["mean_nll"] for r in runs if r["converged"])+1e-12)

    def test_12_multiplas_inicializacoes(self):
        starts=initializations("4",self.cfg["seed"],20)
        self.assertEqual(len({tuple(x) for x in starts}),20)
        self.assertTrue(all(feasible(x,self.cfg) for x in starts))
        meta=json.loads((ROOT/"models/metadados_modelo.json").read_bytes())
        self.assertEqual(meta["starts"],1120)

    def test_13_reprodutibilidade(self):
        seq=[r["correct_first"] for r in self.train["4"]]
        a,runs_a=fit("4",seq,self.cfg)
        b,runs_b=fit("4",seq,self.cfg)
        self.assertEqual(a,b)
        self.assertEqual(runs_a,runs_b)
        np.testing.assert_allclose([a["parameters"][k] for k in PARAMETERS],
             [self.model["skills"]["4"]["parameters"][k] for k in PARAMETERS],rtol=0,atol=1e-10)

    def test_14_serializacao(self):
        with tempfile.TemporaryDirectory() as t:
            path=Path(t)/"model.json"
            save(path,self.model)
            self.assertEqual(load_model(path),self.model)
            bad={**self.model,"model_version":"wrong"}
            save(path,bad)
            with self.assertRaises(ValueError):
                load_model(path)

    def test_15_aluno_inedito(self):
        p=self.model["skills"]["4"]["parameters"]
        a=trace([1,0,1],p)
        self.assertEqual(a[0]["mastery_before"],p["L0"])
        self.assertEqual(a,trace([1,0,1],p))
        self.assertEqual(trace([1],p)[0]["predicted_correct"],predict_correctness(p["L0"],p))

    def test_16_extremos(self):
        for m in (-1,1.1,float("nan"),float("inf"),True):
            with self.assertRaises(ValueError):
                predict_correctness(m,self.p)
        for y in (-1,2,True,.0,None):
            with self.assertRaises(ValueError):
                update_mastery(.5,y,self.p)
        with self.assertRaises(ValueError):
            PackedSequences([[]])
        with self.assertRaises(ValueError):
            PackedSequences([[True]])

    def test_17_estabilidade_numerica(self):
        p={"L0":.9999,"T":.0001,"G":.3,"S":.0001}
        self.assertEqual(update_mastery(1.,0,p),1.)
        for seq in ([0]*5000,[1]*5000,[0,1]*2500):
            packed=PackedSequences([seq])
            loss,grad=packed.objective([p[k] for k in PARAMETERS])
            self.assertTrue(math.isfinite(loss) and np.all(np.isfinite(grad)))
            history=trace(seq,p)
            self.assertTrue(all(0<=r["mastery_next"]<=1 for r in history))
            alt,_=forward(seq,p)
            self.assertAlmostEqual(loss,-alt/len(seq),8)

    def test_18_ambiente_compativel(self):
        import scipy,matplotlib
        env=json.loads((ROOT/"reports/ambiente_limpo.json").read_bytes())
        self.assertTrue(env["isolated_virtual_environment"])
        self.assertEqual(env["numpy"],np.__version__)
        self.assertEqual(env["scipy"],scipy.__version__)
        self.assertEqual(env["matplotlib"],matplotlib.__version__)
        self.assertFalse(env["google_colab_service_executed"])

    def test_19_rastreabilidade(self):
        gate=json.loads((ROOT/"reports/gate_entrada.json").read_bytes())
        for s,e in self.model["skills"].items():
            self.assertEqual(e["source_sequence_sha256"],gate["arquivos_locais_sha256"]["sequencias_treino.jsonl"])
            self.assertEqual(e["training_events"],sum(r["length"] for r in self.train[s]))
            self.assertEqual(e["training_sequences"],len(self.train[s]))

    def test_20_independencia_habilidades(self):
        seq=[r["correct_first"] for r in self.train["4"]]
        first,_=fit("4",seq,self.cfg,count=5)
        other=[r["correct_first"] for r in self.train["8"]]
        fit("8",[[1-y for y in s] for s in other],self.cfg,count=5)
        final,_=fit("4",seq,self.cfg,count=5)
        self.assertEqual(first,final)

    def test_21_auditoria_matematica(self):
        for length in range(1,5):
            for ys in product((0,1),repeat=length):
                exact=float(enumerate_exact(ys,self.p))
                ll,_=forward(ys,self.p)
                objective,_=PackedSequences([list(ys)]).objective([self.p[k] for k in PARAMETERS])
                self.assertAlmostEqual(math.exp(ll),exact,13)
                self.assertAlmostEqual(objective,-ll/length,12)

    def test_22_isolamento_teste(self):
        with self.assertRaisesRegex(ValueError,"apenas treino e validação"):
            groups(self.private,"teste")
        def guarded_open(path,*args,**kwargs):
            if "teste" in path.name:
                raise AssertionError("Tentativa de leitura do teste durante ajuste.")
            return original_open(path,*args,**kwargs)
        original_open=Path.open
        with patch.object(Path,"open",guarded_open):
            rows=groups(self.private,"treino")["4"]
            fit("4",[r["correct_first"] for r in rows],self.cfg,count=5)
        validation=json.loads((ROOT/"reports/validacao.json").read_bytes())
        self.assertEqual(validation["split"],"validacao")
        self.assertFalse(validation["test_evaluated"])

    def test_23_gradiente_analitico(self):
        packed=PackedSequences(self.short)
        params=[self.p[k] for k in PARAMETERS]
        _,g=packed.objective(params)
        numeric=approx_derivative(lambda x:packed.objective(x)[0],params,method="3-point").ravel()
        np.testing.assert_allclose(g,numeric,rtol=1e-6,atol=1e-7)

    def test_24_bootstrap_por_estudante(self):
        b=json.loads((ROOT/"reports/bootstrap.json").read_bytes())
        self.assertEqual(len(b["skills"]),56)
        for s,summary in b["skills"].items():
            self.assertEqual(summary["replicates"],100)
            records=[json.loads(l) for l in (ROOT/f"evidence/bootstrap/skill_{s}.jsonl").read_text(encoding="utf8").splitlines()]
            self.assertEqual(len(records),100)
            self.assertTrue(all(r["students_drawn"]==len(self.train[s]) for r in records))
            self.assertTrue(all(len(r["initializations"])==5 for r in records))
            for r in records:
                self.assertLessEqual(r["distinct_students_drawn"],r["students_drawn"])

    def test_25_metricas(self):
        m=metrics([0,1],[.1,.9])
        self.assertAlmostEqual(m["brier"],.01,14)
        self.assertAlmostEqual(m["log_loss"],-math.log(.9),14)
        self.assertEqual(m["auc_roc"],1.)
        self.assertEqual(m["accuracy_threshold_0_5"],1.)
        self.assertIsNone(metrics([1,1],[.6,.8])["auc_roc"])
        self.assertEqual(metrics([0,1],[.5,.5])["auc_roc"],.5)
        self.assertEqual(sum(r["n"] for r in m["calibration"]),2)
