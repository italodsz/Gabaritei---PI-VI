"""Shared serialization and immutable input references."""
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PHASE2 = ROOT / "fase02"
PARAMS = ("L0", "T", "G", "S")


def sha(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def load(path):
    return json.loads(path.read_bytes())


def save(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True, allow_nan=False)+"\n",
                    encoding="utf-8", newline="\n")
    temp.replace(path)


def rows(path):
    with path.open(encoding="utf-8") as stream:
        for line in stream:
            yield json.loads(line)


def log_access(action, filename, **extra):
    path = ROOT / "evidence/acesso_teste.jsonl"
    path.parent.mkdir(parents=True, exist_ok=True)
    record = {"utc": datetime.now(timezone.utc).isoformat(), "action": action, "file": filename, **extra}
    with path.open("a", encoding="utf-8") as stream:
        stream.write(json.dumps(record, ensure_ascii=False)+"\n")


def model():
    return load(ROOT / "models/parametros_por_habilidade.json")


def sequences(private, split):
    if split not in ("treino", "validacao"):
        raise ValueError("O carregador pré-teste aceita somente treino e validação.")
    gate = load(ROOT / "reports/gate_entrada.json")
    file = f"sequencias_{split}.jsonl"
    if sha(private/file) != gate["private_sha256"][file]:
        raise ValueError("Sequências alteradas.")
    skills = set(model()["skills"])
    return sorted((r for r in rows(private/file) if r["skill_id"] in skills),
                  key=lambda r: (int(r["skill_id"]), r["event_order"][0]))
