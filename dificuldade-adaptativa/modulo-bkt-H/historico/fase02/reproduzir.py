"""Refit all 56 skills in an isolated copy and compare mathematical outputs."""
import argparse
from pathlib import Path
import json
import os
import shutil
import subprocess
import sys
import tempfile

import numpy as np
from bkt.common import ROOT,PARAMETERS,save


def main(private,python):
    with tempfile.TemporaryDirectory(prefix="bkt02-repro-") as temp:
        stage=Path(temp)/"pacote"
        shutil.copytree(ROOT,stage,ignore=shutil.ignore_patterns("__pycache__","*.zip","*.tmp"))
        env={**os.environ,"PYTHONUTF8":"1","OPENBLAS_NUM_THREADS":"1","OMP_NUM_THREADS":"1"}
        result=subprocess.run([str(python),"-B","treinar.py",str(private),"--workers","4"],
                              cwd=stage,env=env,check=True,capture_output=True,text=True,encoding="utf8")
        print(result.stdout,flush=True)
        original=json.loads((ROOT/"models/parametros_por_habilidade.json").read_bytes())
        replica=json.loads((stage/"models/parametros_por_habilidade.json").read_bytes())
        max_parameter,max_objective=0.,0.
        for skill,entry in original["skills"].items():
            fitted=replica["skills"][skill]
            a=np.array([entry["parameters"][k] for k in PARAMETERS])
            b=np.array([fitted["parameters"][k] for k in PARAMETERS])
            max_parameter=max(max_parameter,float(np.max(np.abs(a-b))))
            max_objective=max(max_objective,abs(entry["mean_nll"]-fitted["mean_nll"]))
            if np.max(np.abs(a-b))>1e-4 or abs(entry["mean_nll"]-fitted["mean_nll"])>1e-8:
                raise ValueError(f"A reprodução excedeu a tolerância declarada na habilidade {skill}")
        report={"skills_retrained":len(original["skills"]),"initializations_reexecuted":1120,
                "max_parameter_difference":max_parameter,"max_mean_nll_difference":max_objective,
                "parameter_absolute_tolerance":1e-4,"mean_nll_absolute_tolerance":1e-8,
                "isolated_copy":True,"status":"aprovado"}
        save(ROOT/"reports/reproducibilidade.json",report)
        print(report)


if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("private",type=Path)
    parser.add_argument("--python",type=Path,default=Path(sys.executable))
    args=parser.parse_args()
    main(args.private.resolve(),args.python)
