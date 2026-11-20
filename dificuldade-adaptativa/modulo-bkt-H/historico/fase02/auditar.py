"""Audit all trained likelihoods with a separate scaled matrix implementation."""
import argparse
import json
import math
from itertools import product

import numpy as np
from scipy.optimize._numdiff import approx_derivative

from bkt.alternativa import enumerate_exact,forward,matrices
from bkt.common import ROOT,PARAMETERS,save,settings,sha
from bkt.dados import groups
from bkt.inferencia import load_model,trace
from bkt.likelihood import PackedSequences
from bkt.metricas import metrics
from bkt.treinamento import feasible


def main(private):
    cfg=settings()
    bundle=load_model(ROOT/"models/parametros_por_habilidade.json")
    data=groups(private,"treino")
    rows=[]
    for skill,seqs in data.items():
        p=bundle["skills"][skill]["parameters"]
        estimates=[p[k] for k in PARAMETERS]
        packed=PackedSequences([r["correct_first"] for r in seqs])
        loss,grad=packed.objective(estimates)
        independent=-math.fsum(forward(s["correct_first"],p)[0] for s in seqs)/packed.events
        assert abs(loss-independent)<1e-9
        entry=bundle["skills"][skill]
        assert abs(loss-entry["mean_nll"])<1e-12 and abs(entry["log_likelihood"]+loss*packed.events)<1e-8
        assert feasible(estimates,cfg)
        pi,A,B=matrices(p)
        assert abs(sum(pi)-1)<1e-14
        assert all(abs(sum(r)-1)<1e-14 for r in A+B) and A[1][0]==0
        max_trace=0.
        for seq in seqs[:3]:
            alternative=forward(seq["correct_first"],p)[1]
            primary=trace(seq["correct_first"],p)
            max_trace=max(max_trace,max(abs(a["predicted_correct"]-b["predicted_correct"]) for a,b in zip(alternative,primary)))
        assert max_trace<1e-11
        runs=[json.loads(line) for line in (ROOT/f"evidence/initializations/skill_{skill}.jsonl").read_text(encoding="utf8").splitlines()]
        assert len(runs)==20 and all(feasible([r["parameters"][k] for k in PARAMETERS],cfg) for r in runs)
        valid=[r for r in runs if r["converged"]]
        best=min(valid,key=lambda r:(r["mean_nll"],r["initialization"]))
        assert p==best["parameters"] and entry["best_initialization"]==best["initialization"]
        assert all(abs(packed.objective([r["parameters"][k] for k in PARAMETERS])[0]-r["mean_nll"])<1e-12 for r in runs)
        # This checks the analytic derivative without assuming the maximum is interior.
        numeric=approx_derivative(lambda x:packed.objective(x)[0],estimates,method="3-point",
                                 rel_step=1e-5,bounds=(np.full(4,1e-8),np.full(4,1-1e-8))).ravel()
        error=float(np.max(np.abs(grad-numeric)))
        assert error<1e-4
        rows.append({"skill_id":skill,"events":packed.events,"sequences":len(seqs),
                     "mean_nll_vectorized":loss,"mean_nll_independent_matrix":independent,
                     "nll_absolute_error":abs(loss-independent),"max_gradient_error":error,
                     "max_prospective_trace_error":max_trace,"starts_checked":len(runs),"status":"aprovado"})
    p={"L0":.25,"T":.1,"G":.2,"S":.1}
    for n in range(1,6):
        for outcome in product((0,1),repeat=n):
            p_exact=float(enumerate_exact(outcome,p))
            assert abs(p_exact-math.exp(forward(outcome,p)[0]))<1e-12
    # Independent validation readback, no fitting and no use of the held-out test.
    val=groups(private,"validacao")
    ys,ps,bs=[],[],[]
    for skill,seqs in val.items():
        e=bundle["skills"][skill]
        baseline=(e["correct_count"]+1)/(e["training_events"]+2)
        for seq in seqs:
            ys.extend(seq["correct_first"])
            ps.extend(x["predicted_correct"] for x in forward(seq["correct_first"],e["parameters"])[1])
            bs.extend([baseline]*seq["length"])
    validation=json.loads((ROOT/"reports/validacao.json").read_bytes())
    metric_errors={}
    for label,probabilities in (("bkt",ps),("baseline",bs)):
        metric_errors[label]={}
        replay=metrics(ys,probabilities)
        for metric in ("log_loss","brier","auc_roc","accuracy_threshold_0_5","ece_10_bins"):
            difference=abs(replay[metric]-validation["micro"][label][metric])
            metric_errors[label][metric]=difference
            tolerance=1e-7 if metric=="auc_roc" else 1e-11
            assert difference<tolerance
    boot=json.loads((ROOT/"reports/bootstrap.json").read_bytes())
    assert len(boot["skills"])==56
    for skill,summary in boot["skills"].items():
        records=[json.loads(l) for l in (ROOT/f"evidence/bootstrap/skill_{skill}.jsonl").read_text(encoding="utf8").splitlines()]
        assert len(records)==cfg["bootstrap_replicates"]
        for r in records:
            assert r["students_drawn"]==bundle["skills"][skill]["training_students"]
            assert len(r["initializations"])==cfg["bootstrap_starts"]
            if r["converged"]:
                assert feasible([r["parameters"][k] for k in PARAMETERS],cfg)
        assert summary["converged"]==sum(r["converged"] for r in records)
    gate=json.loads((ROOT/"reports/gate_entrada.json").read_bytes())
    for name in ("eventos_teste.jsonl","sequencias_teste.jsonl"):
        assert sha(private/name)==gate["arquivos_locais_sha256"][name]
    result={"status":"aprovado","method":"forward matricial escalado e enumeração exata por frações",
            "authorship":"mesma autoria; implementação alternativa; revisão externa pendente",
            "skills":rows,"training_events_checked":sum(r["events"] for r in rows),
            "initializations_checked":sum(r["starts_checked"] for r in rows),
            "validation_events_checked":len(ys),"validation_metric_absolute_errors":metric_errors,"exact_sequences_checked":sum(2**n for n in range(1,6)),
            "test_frozen_hashes_checked":True,"test_evaluated":False}
    save(ROOT/"reports/auditoria_matematica.json",result)
    print({k:v for k,v in result.items() if k!="skills"})


if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("private",type=__import__("pathlib").Path)
    main(p.parse_args().private)
