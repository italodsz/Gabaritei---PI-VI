"""Verified BKT input for the next phase, with training-only default."""
import argparse
import json
from pathlib import Path

from .common import config, digest, json_rows
from .sequencias import SPLITS


def load_sequences(directory, split="treino", eligible_only=True):
    if split not in SPLITS:
        raise ValueError(f"Conjunto inválido: {split}")
    manifest = json.loads((directory / "manifesto_local.json").read_bytes())
    cfg = config()
    if (manifest["schema_version"], manifest["source_sha256"], manifest["pipeline_version"], manifest["seed"]) != (
        cfg["schema_version"], cfg["source_sha256"], cfg["pipeline_version"], cfg["seed"]
    ):
        raise ValueError("Contrato incompatível.")
    path = directory / f"sequencias_{split}.jsonl"
    if digest(path) != manifest["sha256_arquivos"][path.name]:
        raise ValueError(f"Arquivo de sequências alterado: {split}")
    skills = set(manifest["habilidades_principais"])
    for row in json_rows(path):
        if row["split"] != split or not row["length"] or len(row["correct_first"]) != row["length"]:
            raise ValueError("Registro de sequência inválido.")
        if any(type(label) is not int or label not in (0, 1) for label in row["correct_first"]):
            raise ValueError("Rótulo inválido na sequência.")
        if not eligible_only or row["skill_id"] in skills:
            yield row


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("directory", type=Path)
    args = parser.parse_args()
    print("Sequências de treino elegíveis", sum(1 for _ in load_sequences(args.directory)))
