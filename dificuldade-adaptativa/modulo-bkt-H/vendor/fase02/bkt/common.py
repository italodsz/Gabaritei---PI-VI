"""Versioned paths, serialisation and raw-file integrity."""
from pathlib import Path
import hashlib
import json

ROOT=Path(__file__).resolve().parents[1]
PARAMETERS=("L0","T","G","S")


def settings():
    return json.loads((ROOT/"config/treinamento.json").read_bytes())


def sha(path):
    with path.open("rb") as f:
        return hashlib.file_digest(f,"sha256").hexdigest()


def save(path,value):
    path.parent.mkdir(parents=True,exist_ok=True)
    temp=path.with_suffix(path.suffix+".tmp")
    temp.write_text(json.dumps(value,ensure_ascii=False,indent=2,sort_keys=True,allow_nan=False)+"\n",
                    encoding="utf8",newline="\n")
    temp.replace(path)


def jsonl(path,rows):
    path.parent.mkdir(parents=True,exist_ok=True)
    with path.open("w",encoding="utf8",newline="\n") as f:
        for row in rows:
            f.write(json.dumps(row,ensure_ascii=False,separators=(",",":"),allow_nan=False)+"\n")
