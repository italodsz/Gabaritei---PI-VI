"""One source-only preparation, replay and auditing entry point."""
import argparse
import os
from pathlib import Path
import subprocess
import sys
from time import perf_counter

from bkt04.common import ROOT,save,sha,utc


def command(argv,name):
    path=ROOT/"evidence/logs"/name
    path.parent.mkdir(exist_ok=True,parents=True)
    started=perf_counter()
    with path.open("w",encoding="utf-8") as log:
        p=subprocess.run([sys.executable,"-B",*map(str,argv)],cwd=ROOT,stdout=log,stderr=subprocess.STDOUT,
                         env={**os.environ,"PYTHONUTF8":"1","OPENBLAS_NUM_THREADS":"1","OMP_NUM_THREADS":"1"})
        log.write(f"\nExit code: {p.returncode}\n")
    if p.returncode:
        raise RuntimeError(f"Falha em {name}, código {p.returncode}")
    return {"command":[str(v) for v in argv],"log":path.relative_to(ROOT).as_posix(),
            "exit_code":p.returncode,"seconds":perf_counter()-started}


def main(source,work):
    source,work=source.resolve(),work.resolve()
    steps=[]
    steps.append(command(["reproduzir_dados.py",source,work],"pipeline_dados.log"))
    steps.append(command(["reproduzir_treino.py",work],"pipeline_treino.log"))
    steps.append(command(["-m","bkt04.elegibilidade"],"pipeline_elegibilidade.log"))
    steps.append(command(["comparar.py",work],"pipeline_estatistica.log"))
    steps.append(command(["comparar_politicas.py",work],"pipeline_politicas.log"))
    os.environ["BKT04_SOURCE"]=str(source)
    os.environ["BKT04_WORK"]=str(work)
    steps.append(command(["testar.py"],"pipeline_testes.log"))
    save(ROOT/"reports/execucao_source_only.json",{"utc":utc(),"source_sha256":sha(source),
         "requires_original_pseudonym_key":False,"steps":steps,"status":"aprovado"})
    print("Reprodução integral a partir apenas do CSV conferido concluída.")


if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("source",type=Path)
    p.add_argument("work",type=Path)
    a=p.parse_args()
    main(a.source,a.work)
