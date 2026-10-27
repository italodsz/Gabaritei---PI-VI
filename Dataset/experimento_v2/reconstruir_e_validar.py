#!/usr/bin/env python3
"""Reconstrói o ZIP do experimento v2 e valida sua integridade."""

from __future__ import annotations

import argparse
import hashlib
import json
import zipfile
from pathlib import Path


def sha256(caminho: Path) -> str:
    digest = hashlib.sha256()
    with caminho.open("rb") as arquivo:
        for bloco in iter(lambda: arquivo.read(1024 * 1024), b""):
            digest.update(bloco)
    return digest.hexdigest()


def validar_arquivo(caminho: Path, tamanho: int, hash_esperado: str) -> None:
    if not caminho.is_file():
        raise SystemExit(f"Arquivo ausente: {caminho}")
    if caminho.stat().st_size != tamanho:
        raise SystemExit(
            f"Tamanho inválido em {caminho.name}: "
            f"{caminho.stat().st_size} != {tamanho}"
        )
    hash_atual = sha256(caminho)
    if hash_atual.lower() != hash_esperado.lower():
        raise SystemExit(
            f"SHA-256 inválido em {caminho.name}: {hash_atual} != {hash_esperado}"
        )


def main() -> None:
    base = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifesto", type=Path, default=base / "partes.json")
    parser.add_argument("--saida", type=Path)
    args = parser.parse_args()

    manifesto_path = args.manifesto.resolve()
    manifesto = json.loads(manifesto_path.read_text(encoding="utf-8"))
    diretorio = manifesto_path.parent
    saida = (args.saida or diretorio / manifesto["arquivo_original"]).resolve()

    for parte in manifesto["partes"]:
        validar_arquivo(
            diretorio / parte["arquivo"],
            parte["bytes"],
            parte["sha256"],
        )

    saida.parent.mkdir(parents=True, exist_ok=True)
    with saida.open("wb") as destino:
        for parte in manifesto["partes"]:
            with (diretorio / parte["arquivo"]).open("rb") as origem:
                for bloco in iter(lambda: origem.read(1024 * 1024), b""):
                    destino.write(bloco)

    validar_arquivo(
        saida,
        manifesto["bytes_original"],
        manifesto["sha256_original"],
    )

    with zipfile.ZipFile(saida) as pacote:
        arquivo_corrompido = pacote.testzip()
        if arquivo_corrompido is not None:
            raise SystemExit(f"Falha de CRC no conteúdo do ZIP: {arquivo_corrompido}")
        quantidade = len(pacote.infolist())

    print(f"OK: {saida}")
    print(f"SHA-256: {manifesto['sha256_original']}")
    print(f"Entradas no ZIP: {quantidade}")


if __name__ == "__main__":
    main()
