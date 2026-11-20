"""Reproduce all 56 fits in a fresh process and compare every exported parameter."""
from datetime import datetime, timezone
import json
from pathlib import Path
import os
import shutil
import subprocess
import tempfile

from .common import ROOT, PHASE2, PARAMS, load, save, model


def reproduce(private, python):
    original = model()["skills"]
    with tempfile.TemporaryDirectory(prefix="bkt03-repro-") as temp:
        stage = Path(temp)/"fase02"
        shutil.copytree(PHASE2,stage,ignore=shutil.ignore_patterns("__pycache__"))
        env = {**os.environ,"PYTHONUTF8":"1","OPENBLAS_NUM_THREADS":"1","OMP_NUM_THREADS":"1"}
        with (ROOT/"evidence/logs/reproducao_treinamento.log").open("w",encoding="utf-8") as log:
            p = subprocess.run([str(python),"-B","treinar.py",str(private),"--workers","4"],cwd=stage,env=env,
                               stdout=log,stderr=subprocess.STDOUT)
            log.write(f"\nExit code: {p.returncode}\n")
        p.check_returncode()
        rebuilt = load(stage/"models/parametros_por_habilidade.json")["skills"]
        meta = load(stage/"models/metadados_modelo.json")
        rows = []
        for skill in sorted(original,key=int):
            a,b = original[skill],rebuilt[skill]
            errors = {k:abs(a["parameters"][k]-b["parameters"][k]) for k in PARAMS}
            dnll = abs(a["mean_nll"]-b["mean_nll"])
            status = "reproducao_exata" if max(errors.values())==0 and dnll==0 else (
                "dentro_tolerancia" if max(errors.values())<=1e-4 and dnll<=1e-8 else "divergencia")
            assert status!="divergencia",skill
            rows.append({"skill_id":skill,"original":a["parameters"],"reproduced":b["parameters"],
                         "absolute_differences":errors,"original_nll":a["mean_nll"],"reproduced_nll":b["mean_nll"],
                         "original_log_likelihood":a["log_likelihood"],"reproduced_log_likelihood":b["log_likelihood"],
                         "converged":b["converged"],"original_initialization":a["best_initialization"],
                         "reproduced_initialization":b["best_initialization"],"classification":status})
        result = {"status":"aprovado","utc":datetime.now(timezone.utc).isoformat(),
                  "parameter_tolerance":1e-4,"mean_nll_tolerance":1e-8,
                  "reason":"mesmas tolerâncias declaradas na reprodução histórica; likelihood também obrigatório",
                  "rows":rows,"environment":{k:meta[k] for k in ("python","numpy","scipy","workers")},
                  "starts":meta["starts"],"training_sequences":meta["training_sequences"],"training_events":meta["training_events"]}
    save(ROOT/"reports/reproducibilidade.json",result)
    print("Reprodução aprovada:",len(rows),"habilidades,",sum(r["classification"]=="reproducao_exata" for r in rows),"exatas.")
