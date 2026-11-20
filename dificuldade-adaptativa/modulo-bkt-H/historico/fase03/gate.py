"""Verify prior publications and rerun critical checks without evaluating test outcomes."""
import argparse
import csv
from datetime import datetime, timezone
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import zipfile

from src.common import ROOT, PHASE2, load, save, sha, rows, log_access


def main(archive, private, source):
    logs = ROOT / "evidence/logs"
    logs.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(archive) as z:
        assert z.testzip() is None
        manifest = dict((n,h) for h,n in (l.split("  ",1) for l in z.read("SHA256SUMS.txt").decode().splitlines()))
        assert set(z.namelist()) == set(manifest) | {"SHA256SUMS.txt"}
        for name,h in manifest.items():
            import hashlib
            data = z.read(name)
            assert hashlib.sha256(data).hexdigest() == h
            path = PHASE2/name
            path.parent.mkdir(parents=True, exist_ok=True)
            if path.exists():
                assert sha(path) == h
            else:
                path.write_bytes(data)
    settings = load(PHASE2/"fase01/config/preprocessing.json")
    local = load(private/"manifesto_local.json")
    original_gate = load(PHASE2/"reports/gate_entrada.json")
    assert sha(source) == settings["source_sha256"] == original_gate["fonte_sha256"]
    checks = []
    for filename,h in local["sha256_arquivos"].items():
        assert sha(private/filename) == h == original_gate["arquivos_locais_sha256"][filename]
        if "teste" in filename:
            log_access("integrity_only_sha256", filename, sha256=h)
    checks.append("hashes_fonte_e_oito_arquivos")
    students = list(rows(private/"estudantes.jsonl"))
    memberships = {s: {r["student_id"] for r in students if r["split"]==s}
                   for s in ("treino","validacao","teste")}
    assert [len(v) for v in memberships.values()] == [2802,601,600]
    assert sum(map(len,memberships.values())) == len(set.union(*memberships.values()))
    checks.append("estudantes_disjuntos")
    sys.path.insert(0,str(PHASE2))
    from fase01.src.ingestao import verify
    from fase01.src.estatisticas import eligibility
    from bkt.inferencia import load_model
    verify(source,settings)
    entry = load_model(PHASE2/"models/parametros_por_habilidade.json")
    train = list(rows(private/"eventos_treino.jsonl"))
    seq = list(rows(private/"sequencias_treino.jsonl"))
    decisions = eligibility(train,seq,settings["thresholds"])
    skills = [r["skill_id"] for r in decisions if r["principal"]]
    assert skills == original_gate["habilidades_principais"] == sorted(entry["skills"],key=int)
    assert len(skills)==56
    checks.append("elegibilidade_somente_treino")
    assert len(seq)==22591 and len(train)==151015
    assert sum(r["length"] for r in seq if r["skill_id"] in skills)==143092
    checks.append("reconciliacao_contagens")
    with tempfile.TemporaryDirectory(prefix="bkt03-gate-check-") as t:
        env={**os.environ,"BKT_PRIVATE":str(private),"PYTHONUTF8":"1",
             "OPENBLAS_NUM_THREADS":"1","OMP_NUM_THREADS":"1"}
        with (logs/"testes_fase02_reexecutados.log").open("w",encoding="utf-8") as log:
            p=subprocess.run([sys.executable,"-B","-m","unittest","discover","-s","tests","-v"],cwd=PHASE2,env=env,
                             stdout=log,stderr=subprocess.STDOUT)
            log.write(f"\nExit code: {p.returncode}\n")
        p.check_returncode()
    checks.append("25_testes_fase02")
    output = ROOT/"models"
    output.mkdir(exist_ok=True)
    for name in ("parametros_por_habilidade.json","metadados_modelo.json"):
        (output/name).write_bytes((PHASE2/"models"/name).read_bytes())
    save(ROOT/"reports/gate_entrada.json",{
        "status":"aprovado","utc":datetime.now(timezone.utc).isoformat(),
        "phase2_archive_sha256":sha(archive),"archive_members":len(manifest)+1,
        "source_sha256":sha(source),"private_sha256":local["sha256_arquivos"],
        "model_sha256":sha(output/"parametros_por_habilidade.json"),
        "students":{s:len(v) for s,v in memberships.items()},"selected_skills":skills,
        "training_sequences":19370,"training_events":143092,
        "critical_checks":checks,"phase2_tests":25,
        "phase1_checks":"schema/hash, contract, counts, train-only eligibility, student isolation",
        "test_outcomes_evaluated":False})
    print("Gate aprovado. Fonte, modelos, habilidades, hashes e 25 testes anteriores conferidos.")


if __name__=="__main__":
    p=argparse.ArgumentParser()
    for k in ("archive","private","source"):
        p.add_argument(k,type=Path)
    a=p.parse_args()
    main(a.archive.resolve(),a.private.resolve(),a.source.resolve())
