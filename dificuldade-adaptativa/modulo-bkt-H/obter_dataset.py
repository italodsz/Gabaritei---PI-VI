"""Obtain the exact public release or validate an already acquired file."""
import argparse
from pathlib import Path
import subprocess
import sys

from bkt04.common import ROOT,load,sha,save,utc


def main(out):
    out=out.resolve()
    log=ROOT/"evidence/logs/obtencao_dataset.log"
    log.parent.mkdir(exist_ok=True,parents=True)
    with log.open("w",encoding="utf-8") as stream:
        p=subprocess.run([sys.executable,"-B","-m","src.ingestao",str(out)],cwd=ROOT/"vendor/fase01",
                         stdout=stream,stderr=subprocess.STDOUT)
        stream.write(f"\nExit code: {p.returncode}\n")
    cfg=load(ROOT/"references/preprocessing.json")
    result={"utc":utc(),"publisher":cfg["publisher"],"download_url":cfg["download"],"exit_code":p.returncode,
            "expected_bytes":cfg["source_bytes"],"expected_sha256":cfg["source_sha256"]}
    if p.returncode:
        result["status"]="falha_obtencao_ou_integridade"
        save(ROOT/"reports/obtencao_dataset.json",result)
        raise RuntimeError("Consulte o log. Obtenha o CSV corrected collapsed pela página oficial e execute novamente.")
    result.update(status="verificado",observed_bytes=out.stat().st_size,observed_sha256=sha(out))
    save(ROOT/"reports/obtencao_dataset.json",result)
    print("Revisão oficial verificada por tamanho e SHA-256.")


if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("out",type=Path)
    main(p.parse_args().out)
