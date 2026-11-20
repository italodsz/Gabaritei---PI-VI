"""Rebuild from the verified public CSV, including a key-independent replay mode."""
import argparse
import hashlib
import os
from pathlib import Path
import shutil
import subprocess
import sys

from bkt04.common import ROOT,load,save,sha,utc
from bkt04.canonico import fingerprint


def command(argv,cwd,log):
    log.parent.mkdir(parents=True,exist_ok=True)
    with log.open("w",encoding="utf-8") as stream:
        p=subprocess.run([sys.executable,"-B",*map(str,argv)],cwd=cwd,stdout=stream,stderr=subprocess.STDOUT,
                         env={**os.environ,"PYTHONUTF8":"1"})
        stream.write(f"\nExit code: {p.returncode}\n")
    p.check_returncode()


def rebuild(source,work,legacy_private=None):
    cfg=load(ROOT/"references/preprocessing.json")
    if sha(source)!=cfg["source_sha256"] or source.stat().st_size!=64412812:
        raise ValueError("O CSV não corresponde à revisão oficial congelada.")
    modes=["deterministic_alternative"]+(["original_key"] if legacy_private is not None else [])
    summaries={}
    for mode in modes:
        private=work/mode/"private"
        public=work/mode/"public"
        private.mkdir(parents=True,exist_ok=True)
        if mode=="original_key":
            key=(legacy_private/".chave_local").read_bytes()
        else:
            key=hashlib.sha256(("gabaritei-missao04-replay-only/"+cfg["source_sha256"]).encode()).digest()
        keyfile=private/".chave_local"
        if keyfile.exists() and keyfile.read_bytes()!=key:
            raise ValueError("Diretório já possui outra chave.")
        keyfile.write_bytes(key)
        command(["-m","src.preparar","--source",source,"--private",private,"--public",public],
                ROOT/"vendor/fase01",ROOT/f"evidence/logs/dados_{mode}.log")
        observed=load(public/"manifesto_dados.json")
        expected=load(ROOT/"references/manifesto_dados_fase01.json")
        if observed!=expected:
            raise ValueError("Agregados diferem do processamento original.")
        logical=fingerprint(private)
        baseline=load(ROOT/"references/identidade_logica.json")
        if logical!=baseline:
            raise ValueError("Eventos ou sequências diferem após normalização dos pseudônimos.")
        local=load(private/"manifesto_local.json")
        old=load(ROOT/"references/gate_entrada.json")["private_sha256"]
        equal={n:h==old[n] for n,h in local["sha256_arquivos"].items()}
        if mode=="original_key" and not all(equal.values()):
            raise ValueError("Modo da chave original não reproduziu os hashes.")
        summaries[mode]={"source_sha256":sha(source),"canonical":logical,
                         "aggregates_equal":True,"individual_hash_equal":equal,
                         "events":observed["eventos_validos"]["eventos"],
                         "students":observed["eventos_validos"]["estudantes"],
                         "skills":len(observed["habilidades_elegiveis"]["principal"]),
                         "split_students":{s:r["estudantes"] for s,r in observed["split"].items()},
                         "private_hashes":local["sha256_arquivos"]}
        print(mode,"agregados e identidades lógicas reproduzidos; hashes individuais iguais",sum(equal.values()),"/ 8",flush=True)
    save(ROOT/"reports/reconstrucao.json",{"utc":utc(),"modes":summaries,
            "alternative_ids_warning":"identificadores determinísticos para reprodução, sem garantia de anonimização",
            "legacy_key_needed":False})
    return summaries


if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("source",type=Path)
    p.add_argument("work",type=Path)
    p.add_argument("--legacy-private",type=Path)
    a=p.parse_args()
    rebuild(a.source.resolve(),a.work.resolve(),a.legacy_private.resolve() if a.legacy_private else None)
