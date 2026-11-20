"""Recheck all training likelihoods and traces with a new independent implementation."""
import argparse
from itertools import product
import math
from pathlib import Path
import sys

from src.common import ROOT,PHASE2,PARAMS,save,model,sequences
from src.matematica import infer,exact_likelihood

sys.path.insert(0,str(PHASE2))
from bkt.likelihood import PackedSequences
from bkt.inferencia import trace as old_trace


def main(private):
    m = model()["skills"]
    grouped = {s:[] for s in m}
    for r in sequences(private,"treino"):
        grouped[r["skill_id"]].append(r)
    report = []
    for s,rows in grouped.items():
        p = m[s]["parameters"]
        independent = -math.fsum(infer(r["correct_first"],p)[0] for r in rows)/m[s]["training_events"]
        packed = PackedSequences([r["correct_first"] for r in rows])
        primary = packed.objective([p[k] for k in PARAMS])[0]
        error = abs(independent-primary)
        assert error<1e-9
        prediction_error = 0.
        state_error = 0.
        for r in rows[:4]:
            _,a = infer(r["correct_first"],p)
            b = old_trace(r["correct_first"],p)
            prediction_error = max(prediction_error,max(abs(x["predicted"]-y["predicted_correct"]) for x,y in zip(a,b)))
            state_error = max(state_error,max(abs(x["next"]-y["mastery_next"]) for x,y in zip(a,b)))
        assert prediction_error<1e-10 and state_error<1e-10
        report.append({"skill_id":s,"primary_nll":primary,"independent_nll":independent,
                       "nll_error":error,"prediction_error":prediction_error,"state_error":state_error})
    p = {"L0":.25,"T":.1,"G":.2,"S":.1}
    exact_count = 0
    for size in range(1,7):
        for obs in product((0,1),repeat=size):
            ll,_ = infer(obs,p)
            assert abs(math.exp(ll)-float(exact_likelihood(obs,p)))<1e-12
            exact_count += 1
    for observations in ([0]*5000,[1]*5000,[0,1]*2500):
        ll,states = infer(observations,{"L0":.9999,"T":.0001,"G":.3,"S":.0001})
        assert math.isfinite(ll) and all(0<=r["next"]<=1 for r in states)
    save(ROOT/"reports/auditoria_matematica.json",{
        "status":"aprovado","skills":report,"exact_sequences":exact_count,
        "training_events":sum(e["training_events"] for e in m.values()),
        "authorship":"mesmo agente, código matemático separado; revisão humana externa pendente"})
    print("Auditoria matemática:",len(report),"habilidades e",exact_count,"sequências exatas.")


if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("private",type=Path)
    main(p.parse_args().private)
