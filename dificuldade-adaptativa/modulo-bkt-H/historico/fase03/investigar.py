"""Parameter uncertainty, predictive uncertainty and constrained likelihood profiles, before test."""
import argparse
from collections import defaultdict
from pathlib import Path
import sys

import numpy as np
from scipy.optimize import minimize

from src.common import ROOT,PHASE2,PARAMS,load,save,model,sequences,rows
from src.matematica import infer
sys.path.insert(0,str(PHASE2))
from bkt.likelihood import PackedSequences


def main(private):
    models = model()["skills"]
    boot = load(PHASE2/"reports/bootstrap.json")["skills"]
    val = defaultdict(list)
    train = defaultdict(list)
    for r in sequences(private,"validacao"):
        val[r["skill_id"]].append(r)
    for r in sequences(private,"treino"):
        train[r["skill_id"]].append(r)
    output = {}
    profiles = {}
    for skill,entry in models.items():
        values = list(rows(PHASE2/f"evidence/bootstrap/skill_{skill}.jsonl"))
        base = np.array([x["predicted"] for r in val[skill] for x in infer(r["correct_first"],entry["parameters"])[1]])
        predictions = []
        for rep in values:
            if rep["converged"]:
                predictions.append([x["predicted"] for r in val[skill]
                                    for x in infer(r["correct_first"],rep["parameters"])[1]])
        a = np.array(predictions)
        widths = np.quantile(a,.975,axis=0)-np.quantile(a,.025,axis=0)
        rmse = np.sqrt(np.mean((a-base)**2,axis=1))
        output[skill] = {
            "skill_id":skill,"training_students":entry["training_students"],
            "training_events":entry["training_events"],"training_sequences":entry["training_sequences"],
            "mean_length":entry["length_mean"],"median_length":entry["length_median"],
            "training_correct_rate":entry["training_correct_rate"],
            "bootstrap":boot[skill],"parameter_wide":boot[skill]["wide_interval"],
            "initialization":entry["diagnostics"],
            "predictive_width_median":float(np.median(widths)),
            "predictive_width_p95":float(np.quantile(widths,.95)),
            "predictive_rmse_median":float(np.median(rmse)),
            "predictive_rmse_p95":float(np.quantile(rmse,.95)),
            "validation_events":len(base),"predictions_replicated":len(predictions)}
        boundaries = entry["diagnostics"]["boundary_parameters"]
        if boundaries:
            packed = PackedSequences([r["correct_first"] for r in train[skill]])
            original = np.array([entry["parameters"][k] for k in PARAMS])
            result = []
            for label in boundaries:
                if label not in PARAMS:
                    continue
                index = PARAMS.index(label)
                remaining = [i for i in range(4) if i!=index]
                grid = sorted(set([.0001,.001,.005,.01,.025,.05,.1,.25,.5,.75,.95,.9999,
                                   float(original[index])]))
                for fixed in grid:
                    def full(x):
                        p = original.copy()
                        p[index] = fixed
                        p[remaining] = x
                        return p
                    def objective(x):
                        loss,g = packed.objective(full(x))
                        return loss,g[remaining]
                    constraint = {"type":"ineq","fun":lambda x:.99-full(x)[2]-full(x)[3]}
                    feasible = []
                    for j in range(3):
                        initial = original[remaining].copy()
                        if j:
                            rng = np.random.default_rng(20261111+int(skill)+j)
                            initial = rng.uniform(.01,.6,size=3)
                        p0 = full(initial)
                        if p0[2]+p0[3]>=.99:
                            free_emission = 3 if index==2 else 2
                            if free_emission in remaining:
                                initial[remaining.index(free_emission)] = max(.0001,.9899-fixed)
                        if fixed>.9899 and index in (2,3):
                            continue
                        fit = minimize(objective,initial,jac=True,method="SLSQP",
                                       bounds=[(.0001,.9999)]*3,constraints=[constraint],
                                       options={"maxiter":500,"ftol":1e-9})
                        p = full(fit.x)
                        if fit.success and p[2]+p[3]<=.99+1e-8:
                            feasible.append((float(fit.fun),p.tolist()))
                    if feasible:
                        loss,p = min(feasible,key=lambda x:x[0])
                        d = dict(zip(PARAMS,p))
                        alt = np.array([x["predicted"] for r in val[skill] for x in infer(r["correct_first"],d)[1]])
                        result.append({"fixed_parameter":label,"fixed_value":fixed,"parameters":d,
                           "mean_nll":loss,"delta_log_likelihood":(loss-entry["mean_nll"])*packed.events,
                           "validation_prediction_rmse":float(np.sqrt(np.mean((alt-base)**2))),
                           "distance_to_lower":float(original[index]-.0001),
                           "distance_to_upper":float(.9999-original[index])})
            profiles[skill] = result
        print("Diagnóstico",skill,"largura preditiva mediana",round(output[skill]["predictive_width_median"],5),flush=True)
    save(ROOT/"reports/estabilidade_parametros.json",output)
    save(ROOT/"reports/habilidades_fronteira.json",profiles)
    print("Perfis de verossimilhança concluídos:",len(profiles))


if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("private",type=Path)
    main(p.parse_args().private)
