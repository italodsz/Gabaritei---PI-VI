"""Fit all eligible skills using deterministic constrained MLE."""
import argparse
from concurrent.futures import ProcessPoolExecutor
from collections import Counter
from datetime import datetime,timezone
import platform
from statistics import median
from time import perf_counter

import numpy as np
import scipy

from bkt.common import ROOT,PARAMETERS,save,jsonl,settings,sha
from bkt.dados import groups
from bkt.treinamento import fit


def task(args):
    skill,rows,cfg=args
    sequences=[r["correct_first"] for r in rows]
    start=perf_counter()
    best,runs=fit(skill,sequences,cfg)
    support={"training_students":len({r["student_id"] for r in rows}),"training_sequences":len(rows),
             "training_events":sum(map(len,sequences)),
             "length_mean":float(np.mean(list(map(len,sequences)))),
             "length_median":median(list(map(len,sequences))),
             "correct_count":sum(map(sum,sequences))}
    support["training_correct_rate"]=support["correct_count"]/support["training_events"]
    if best:
        best.update(support)
        best["method"]="SLSQP_maximum_likelihood"
        best["source_sequence_sha256"]=__import__("json").loads((ROOT/"reports/gate_entrada.json").read_bytes())["arquivos_locais_sha256"]["sequencias_treino.jsonl"]
    return skill,best,runs,support,perf_counter()-start


def main(private,workers):
    cfg=settings()
    data=groups(private,"treino")
    tasks=[(skill,rows,cfg) for skill,rows in data.items()]
    models,all_runs,failures,timing={},{},[],{}
    started=datetime.now(timezone.utc).isoformat()
    start=perf_counter()
    with ProcessPoolExecutor(max_workers=workers) as pool:
        for skill,best,runs,support,elapsed in pool.map(task,tasks):
            all_runs[skill]=runs
            timing[skill]=elapsed
            jsonl(ROOT/f"evidence/initializations/skill_{skill}.jsonl",runs)
            if best:
                models[skill]=best
                print(skill,"events",support["training_events"],"NLL",round(best["mean_nll"],8),
                      "runs",best["diagnostics"]["converged_runs"],"seconds",round(elapsed,3),flush=True)
            else:
                failures.append({"skill_id":skill,"support":support,"reason":"nenhuma_inicializacao_convergente_viavel"})
    gate=ROOT/"reports/gate_entrada.json"
    bundle={"model_version":cfg["version"],"dataset":"assistments",
            "release":"skill-builder-2009-2010-corrected-collapsed",
            "states":["nao_dominada","dominada"],"observations":[0,1],
            "forgetting":0,"skills":models,"failures":failures}
    save(ROOT/"models/parametros_por_habilidade.json",bundle)
    save(ROOT/"models/metadados_modelo.json",{"model_version":cfg["version"],"config":cfg,
         "gate_sha256":sha(gate),"training_sequence_sha256":
         __import__("json").loads(gate.read_bytes())["arquivos_locais_sha256"]["sequencias_treino.jsonl"],
         "code_sha256":{p.relative_to(ROOT).as_posix():sha(p) for p in sorted((ROOT/"bkt").glob("*.py"))},
         "python":platform.python_version(),"numpy":np.__version__,"scipy":scipy.__version__,
         "trained_skills":len(models),"failed_skills":failures,
         "training_sequences":sum(m["training_sequences"] for m in models.values()),
         "training_events":sum(m["training_events"] for m in models.values()),
         "starts":sum(len(r) for r in all_runs.values()),"started_utc":started,
         "elapsed_seconds":perf_counter()-start,"skill_seconds":timing,"workers":workers,
         "selection":"best_feasible_converged_training_likelihood","test_outcomes_used":False})
    if failures:
        raise RuntimeError(f"{len(failures)} habilidades sem solução. Consulte o modelo.")


if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("private",type=__import__("pathlib").Path)
    p.add_argument("--workers",type=int,default=4)
    a=p.parse_args()
    main(a.private,a.workers)
