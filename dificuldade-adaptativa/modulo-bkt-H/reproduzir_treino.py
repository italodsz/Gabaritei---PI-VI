"""Replay the original estimator on reconstructed identifiers, without changing its objective."""
import argparse
import os
from pathlib import Path
import shutil
import subprocess
import sys

from bkt04.common import ROOT,load,save,sha,utc
from bkt04.canonico import fingerprint


def train(work):
    private=work/"deterministic_alternative/private"
    if fingerprint(private)!=load(ROOT/"references/identidade_logica.json"):
        raise ValueError("Os históricos lógicos não correspondem à referência.")
    job=work/"fit_original"
    shutil.copytree(ROOT/"vendor/fase02",job,dirs_exist_ok=True)
    shutil.copytree(ROOT/"vendor/fase01",job/"fase01",dirs_exist_ok=True)
    config=load(job/"config/treinamento.json")
    assert config["starts"]==20 and config["max_iterations"]==500 and config["ftol"]==1e-9
    manifest=load(private/"manifesto_local.json")
    save(job/"reports/gate_entrada.json",{"status":"aprovado","arquivos_locais_sha256":manifest["sha256_arquivos"],
                  "canonical_sha256":load(ROOT/"references/identidade_logica.json"),
                  "pseudonym_mode":"deterministic_alternative"})
    log=ROOT/"evidence/logs/treinamento_reproduzido.log"
    with log.open("w",encoding="utf-8") as f:
        p=subprocess.run([sys.executable,"-B","treinar.py",str(private),"--workers","4"],cwd=job,stdout=f,stderr=subprocess.STDOUT,
                         env={**os.environ,"PYTHONUTF8":"1","OPENBLAS_NUM_THREADS":"1","OMP_NUM_THREADS":"1"})
        f.write(f"\nExit code: {p.returncode}\n")
    p.check_returncode()
    observed=load(job/"models/parametros_por_habilidade.json")
    original=load(ROOT/"models/parametros_originais.json")
    rows=[]
    for skill,a in original["skills"].items():
        b=observed["skills"][skill]
        errors={k:abs(a["parameters"][k]-b["parameters"][k]) for k in ("L0","T","G","S")}
        loss=abs(a["mean_nll"]-b["mean_nll"])
        good=max(errors.values())<=1e-4 and loss<=1e-8 and b["converged"]
        if not good:
            raise ValueError("Divergência fora dos limiares prévios: "+skill)
        rows.append({"skill_id":skill,"original":a["parameters"],"reproduced":b["parameters"],
                     "absolute_difference":errors,"original_nll":a["mean_nll"],"reproduced_nll":b["mean_nll"],
                     "original_log_likelihood":a["log_likelihood"],"reproduced_log_likelihood":b["log_likelihood"],
                     "converged":b["converged"],"best_initialization":b["best_initialization"],
                     "attempted_runs":b["diagnostics"]["attempted_runs"],"status":"exato" if max(errors.values())==0 and loss==0 else "dentro_tolerancia"})
    save(ROOT/"reports/reproducao_treinamento.json",{"utc":utc(),"rows":rows,"skills":len(rows),
          "parameter_tolerance":1e-4,"nll_tolerance":1e-8,"pseudonym_mode":"deterministic_alternative",
          "test_used_for_fit":False,"original_estimator_sha256":sha(ROOT/"vendor/fase02/treinar.py")})
    models=ROOT/"models"
    models.mkdir(exist_ok=True)
    shutil.copy2(job/"models/parametros_por_habilidade.json",models/"parametros_reproduzidos.json")
    for p in (job/"evidence/initializations").glob("*.jsonl"):
        target=ROOT/"evidence/initializations"/p.name
        target.parent.mkdir(exist_ok=True)
        shutil.copy2(p,target)
    print("56 modelos reproduzidos:",sum(r["status"]=="exato" for r in rows),"exatos;",len(rows)*20,"inicializações.")


if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("work",type=Path)
    train(p.parse_args().work.resolve())
