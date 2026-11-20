"""Cluster bootstrap by student within skill, preserving each complete history."""
import argparse
from concurrent.futures import ProcessPoolExecutor
from time import perf_counter

import numpy as np

from bkt.common import ROOT,PARAMETERS,jsonl,save,settings
from bkt.dados import groups
from bkt.inferencia import load_model
from bkt.treinamento import fit


def task(args):
    skill,rows,entry,cfg=args
    users=[r["student_id"] for r in rows]
    if len(users)!=len(set(users)):
        raise ValueError("O bootstrap espera uma sequência completa por aluno e habilidade.")
    seq=[r["correct_first"] for r in rows]
    seed=cfg["seed"]+100000
    rng=np.random.default_rng(np.random.SeedSequence([seed,int(skill)]))
    reps=[]
    for replicate in range(cfg["bootstrap_replicates"]):
        indices=rng.integers(0,len(seq),size=len(seq))
        sample=[seq[i] for i in indices]
        refit_seed=seed+replicate*1009
        best,runs=fit(skill,sample,cfg,seed=refit_seed,count=cfg["bootstrap_starts"],
                      warm=[entry["parameters"][k] for k in PARAMETERS])
        reps.append({"replicate":replicate,"sample_seed":seed,"fit_seed":refit_seed,
                     "students_drawn":len(sample),"distinct_students_drawn":int(len(set(indices.tolist()))),
                     "events":sum(map(len,sample)),
                     "converged":best is not None,"parameters":best["parameters"] if best else None,
                     "mean_nll":best["mean_nll"] if best else None,
                     "initializations":[{k:v for k,v in r.items() if k not in ("objective_history","gradient")}
                                        for r in runs]})
    valid=[r for r in reps if r["converged"]]
    if len(valid)<10:
        return skill,reps,{"replicates":len(reps),"converged":len(valid),"status":"insuficiente"}
    values=np.array([[r["parameters"][k] for k in PARAMETERS] for r in valid])
    bounds=np.quantile(values,[.025,.5,.975],axis=0,method="linear")
    std=np.std(values,axis=0,ddof=1)
    correlation=[]
    for i in range(4):
        row=[]
        for j in range(4):
            row.append(float(np.corrcoef(values[:,i],values[:,j])[0,1])
                       if std[i]>1e-12 and std[j]>1e-12 else None)
        correlation.append(row)
    return skill,reps,{"replicates":len(reps),"converged":len(valid),"status":"estimado",
          "unit":"estudante_com_sequencia_completa_na_habilidade","seed":seed,
          "parameters":{k:{"q025":float(bounds[0,i]),"median":float(bounds[1,i]),
                           "q975":float(bounds[2,i]),"std":float(std[i]),
                           "width":float(bounds[2,i]-bounds[0,i])} for i,k in enumerate(PARAMETERS)},
          "correlation_order":list(PARAMETERS),"correlation":correlation,
          "wide_interval":bool(np.max(bounds[2]-bounds[0])>.3)}


def main(private,workers):
    cfg=settings()
    model=load_model(ROOT/"models/parametros_por_habilidade.json")
    data=groups(private,"treino")
    tasks=[(s,rows,model["skills"][s],cfg) for s,rows in data.items()]
    results={}
    start=perf_counter()
    with ProcessPoolExecutor(max_workers=workers) as pool:
        for s,reps,summary in pool.map(task,tasks):
            results[s]=summary
            jsonl(ROOT/f"evidence/bootstrap/skill_{s}.jsonl",reps)
            print("bootstrap",s,summary["converged"],"/",summary["replicates"],flush=True)
    save(ROOT/"reports/bootstrap.json",{"config":cfg,"skills":results,
         "elapsed_seconds":perf_counter()-start,
         "warning":"percentis empíricos exploratórios, sem garantia de cobertura nominal ou identificabilidade"})
    print("Tempo total",perf_counter()-start,flush=True)


if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("private",type=__import__("pathlib").Path)
    p.add_argument("--workers",type=int,default=4)
    a=p.parse_args()
    main(a.private,a.workers)
