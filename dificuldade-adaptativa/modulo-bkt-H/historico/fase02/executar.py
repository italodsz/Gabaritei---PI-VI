"""Reproduce Phase 02 in sequence with explicit raw and private-data locations."""
import argparse
import os
from pathlib import Path
import subprocess
import sys

from bkt.common import ROOT


def command(argv,cwd=ROOT):
    result=subprocess.run([sys.executable,"-B",*map(str,argv)],cwd=cwd,
                          env={**os.environ,"PYTHONUTF8":"1","OPENBLAS_NUM_THREADS":"1","OMP_NUM_THREADS":"1"},
                          check=True,capture_output=True,text=True,encoding="utf8")
    print(result.stdout.strip(),flush=True)


def main(source,private,workers,rerun_gate=True):
    source,private=source.resolve(),private.resolve()
    source.parent.mkdir(parents=True,exist_ok=True)
    if not source.exists():
        command(["-m","src.ingestao",source],cwd=ROOT/"fase01")
    if not (private/"manifesto_local.json").exists():
        public=private.parent/"agregados_fase01"
        command(["-m","src.preparar","--source",source,"--private",private,"--public",public],cwd=ROOT/"fase01")
    if rerun_gate:
        command(["gate.py",ROOT/"inputs/Gabaritei_BKT_Fase01_Preparacao_Auditada.zip",source,private])
    command(["treinar.py",private,"--workers",workers])
    command(["validar.py",private])
    command(["bootstrap.py",private,"--workers",workers])
    command(["auditar.py",private])
    command(["graficos.py"])


if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--source",type=Path,required=True)
    parser.add_argument("--private",type=Path,required=True)
    parser.add_argument("--workers",type=int,default=4)
    args=parser.parse_args()
    main(args.source,args.private,args.workers)
