"""Read only the columns needed and verify the official revision."""
import argparse
import csv
import shutil
from pathlib import Path
from tempfile import NamedTemporaryFile
from urllib.request import Request, urlopen

from .common import config, digest

FIELDS = ("user_id", "order_id", "problem_id", "skill_id", "original", "correct",
          "answer_type", "first_action", "opportunity_original")


def verify(path, cfg):
    if path.stat().st_size != cfg["source_bytes"] or digest(path) != cfg["source_sha256"]:
        raise ValueError("Tamanho ou SHA-256 diverge da edição oficial congelada.")
    with path.open(encoding=cfg["source_encoding"], newline="") as f:
        columns = next(csv.reader(f))
    if not set(FIELDS).issubset(columns) or len(columns) != len(set(columns)):
        raise ValueError("Esquema oficial não reconhecido.")
    return columns


def records(path, encoding):
    with path.open(encoding=encoding, newline="") as f:
        reader = csv.DictReader(f, strict=True)
        if not set(FIELDS).issubset(reader.fieldnames or ()):
            raise ValueError("Campos obrigatórios ausentes.")
        for row_num, row in enumerate(reader, 1):
            if None in row or any(row[k] is None for k in FIELDS):
                raise ValueError(f"Registro CSV malformado: {row_num}")
            yield row_num, tuple(row[k].strip() for k in FIELDS)


def download(out, cfg):
    if out.exists():
        verify(out, cfg)
        return
    out.parent.mkdir(parents=True, exist_ok=True)
    req = Request(cfg["download"], headers={"User-Agent": "Mozilla/5.0"})
    with NamedTemporaryFile(dir=out.parent, delete=False) as temp:
        tmp = Path(temp.name)
    try:
        with urlopen(req, timeout=60) as response, tmp.open("wb") as dest:
            if not response.geturl().startswith("https://drive.usercontent.google.com/"):
                raise ValueError("O download saiu do host oficial registrado.")
            remaining = cfg["source_bytes"] + 1
            while remaining:
                data = response.read(min(1024 * 1024, remaining))
                if not data:
                    break
                dest.write(data)
                remaining -= len(data)
        verify(tmp, cfg)
        tmp.replace(out)
    finally:
        tmp.unlink(missing_ok=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("out", type=Path)
    args = parser.parse_args()
    cfg = config()
    download(args.out, cfg)
    print(cfg["official_filename"], cfg["source_bytes"], digest(args.out))
