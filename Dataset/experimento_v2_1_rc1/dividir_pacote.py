#!/usr/bin/env python3
"""Divide o pacote do experimento e gera um manifesto SHA-256."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path


TAMANHO_PARTE_PADRAO = 40 * 1024 * 1024


def sha256(caminho: Path) -> str:
    digest = hashlib.sha256()
    with caminho.open("rb") as arquivo:
        for bloco in iter(lambda: arquivo.read(1024 * 1024), b""):
            digest.update(bloco)
    return digest.hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("pacote", type=Path)
    parser.add_argument("--destino", type=Path, default=Path(__file__).resolve().parent)
    parser.add_argument("--tamanho-parte", type=int, default=TAMANHO_PARTE_PADRAO)
    args = parser.parse_args()

    pacote = args.pacote.resolve()
    destino = args.destino.resolve()
    destino.mkdir(parents=True, exist_ok=True)

    if not pacote.is_file():
        raise SystemExit(f"Pacote não encontrado: {pacote}")
    if args.tamanho_parte <= 0:
        raise SystemExit("O tamanho da parte deve ser positivo.")

    partes = []
    with pacote.open("rb") as origem:
        indice = 1
        while bloco := origem.read(args.tamanho_parte):
            nome = f"{pacote.name}.part{indice:02d}"
            caminho = destino / nome
            caminho.write_bytes(bloco)
            partes.append(
                {
                    "arquivo": nome,
                    "bytes": len(bloco),
                    "sha256": hashlib.sha256(bloco).hexdigest(),
                }
            )
            indice += 1

    manifesto = {
        "formato": 1,
        "arquivo_original": pacote.name,
        "bytes_original": pacote.stat().st_size,
        "sha256_original": sha256(pacote),
        "tamanho_parte_bytes": args.tamanho_parte,
        "partes": partes,
    }
    (destino / "partes.json").write_text(
        json.dumps(manifesto, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"{len(partes)} partes geradas em {destino}")
    print(f"SHA-256 do pacote: {manifesto['sha256_original']}")


if __name__ == "__main__":
    main()
