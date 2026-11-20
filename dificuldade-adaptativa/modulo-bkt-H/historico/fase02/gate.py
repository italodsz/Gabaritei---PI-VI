"""Verify the complete Phase 1 package and rerun its preparation checks before training."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parent


def digest(path):
    with path.open("rb") as f:
        return hashlib.file_digest(f,"sha256").hexdigest()


def verify_zip(path):
    with zipfile.ZipFile(path) as z:
        if z.testzip() is not None:
            raise ValueError("CRC inválido.")
        manifest = dict((n,h) for h,n in
                        (line.split("  ",1) for line in z.read("SHA256SUMS.txt").decode().splitlines()))
        if set(z.namelist()) != set(manifest) | {"SHA256SUMS.txt"}:
            raise ValueError("Manifesto incompleto.")
        for name,h in manifest.items():
            if hashlib.sha256(z.read(name)).hexdigest() != h:
                raise ValueError(name)
        target = ROOT/"fase01"
        target.mkdir(exist_ok=True)
        for name,h in manifest.items():
            p=target/name
            if p.exists() and digest(p)!=h:
                raise ValueError("Cópia histórica local alterada: "+name)
            p.parent.mkdir(parents=True,exist_ok=True)
            if not p.exists():
                p.write_bytes(z.read(name))
        return manifest


def main(archive,source,private):
    logs=ROOT/"evidence/logs"
    logs.mkdir(parents=True,exist_ok=True)
    package=verify_zip(archive)
    manifest=json.loads((private/"manifesto_local.json").read_bytes())
    declared=json.loads((ROOT/"fase01/data/manifests/manifesto_dados.json").read_bytes())
    local_hashes={}
    for name,h in manifest["sha256_arquivos"].items():
        if digest(private/name)!=h:
            raise ValueError("Histórico individual alterado: "+name)
        local_hashes[name]=h
    env={**os.environ,"PYTHONUTF8":"1","BKT_SOURCE":str(source),"BKT_PRIVATE":str(private),
         "BKT_PUBLIC":str(ROOT/"fase01/data/manifests")}
    with tempfile.TemporaryDirectory(prefix="bkt02-gate-") as t:
        base=Path(t)
        env["BKT_REPRO_PUBLIC"]=str(base/"public")
        commands=[
          [sys.executable,"-B","-m","src.preparar","--source",str(source),
           "--private",str(base/"private"),"--public",env["BKT_REPRO_PUBLIC"]],
          [sys.executable,"-B","-m","unittest","discover","-s","tests","-v"],
          [sys.executable,"-B","-m","src.carregar",str(private)]]
        for n,cmd in enumerate(commands,1):
            with (logs/f"gate_{n}.log").open("w",encoding="utf8") as f:
                p=subprocess.run(cmd,cwd=ROOT/"fase01",env=env,stdout=f,stderr=subprocess.STDOUT)
                f.write(f"\nExit code: {p.returncode}\n")
            if p.returncode:
                raise RuntimeError(f"Gate falhou, consulte gate_{n}.log")
    sys.path.insert(0,str(ROOT))
    from fase01.src.carregar import load_sequences
    from fase01.src.common import json_rows
    from fase01.src.estatisticas import eligibility
    train=list(load_sequences(private))
    ev=list(json_rows(private/"eventos_treino.jsonl"))
    sq=list(json_rows(private/"sequencias_treino.jsonl"))
    cfg=json.loads((ROOT/"fase01/config/preprocessing.json").read_bytes())
    skills=eligibility(ev,sq,cfg["thresholds"])
    selected=[s["skill_id"] for s in skills if s["principal"]]
    membership={}
    event_sets={}
    for name in ("treino","validacao","teste"):
        membership[name]=set()
        event_sets[name]=set()
        # Structural identifiers only. No outcome-based choice is made from holdouts.
        for r in json_rows(private/f"eventos_{name}.jsonl"):
            membership[name].add(r["student_id"])
            event_sets[name].add(r["event_id"])
    assert selected==manifest["habilidades_principais"]==declared["habilidades_elegiveis"]["principal"]
    assert len(train)==19370 and sum(s["length"] for s in train)==143092 and len(selected)==56
    for a,b in (("treino","validacao"),("treino","teste"),("validacao","teste")):
        assert not membership[a]&membership[b] and not event_sets[a]&event_sets[b]
    result={"status":"aprovado","data_utc":datetime.now(timezone.utc).isoformat(),
            "fase01_zip_sha256":digest(archive),"membros_verificados":len(package)+1,
            "fonte_sha256":digest(source),"arquivos_locais_sha256":local_hashes,
            "schema_version":manifest["schema_version"],"semente":manifest["seed"],
            "estudantes":{s:len(g) for s,g in membership.items()},
            "eventos":{s:len(g) for s,g in event_sets.items()},
            "sequencias_treino_principais":len(train),"eventos_treino_principais":sum(s["length"] for s in train),
            "habilidades_principais":selected,"testes_fase01_aprovados":15,
            "intersecao_estudantes":0,"intersecao_eventos":0,
            "politica_teste":"somente integridade e contrato na entrada; excluído de ajuste e validação"}
    (ROOT/"reports").mkdir(exist_ok=True)
    (ROOT/"reports/gate_entrada.json").write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    print(json.dumps(result,ensure_ascii=False))


if __name__=="__main__":
    p=argparse.ArgumentParser()
    for name in ("archive","source","private"):
        p.add_argument(name,type=Path)
    a=p.parse_args()
    main(a.archive.resolve(),a.source.resolve(),a.private.resolve())
