"""Configuracao, caminhos e utilitarios de versionamento/hash."""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
from typing import Any

BACKEND_DIR = Path(__file__).resolve().parent.parent
CONFIG_PATH = Path(os.environ.get("GABARITEI_CONFIG", BACKEND_DIR / "config" / "politica.json"))
ARTEFATOS_DIR = Path(os.environ.get("GABARITEI_ARTEFATOS", BACKEND_DIR / "artefatos"))
RESULTADOS_DIR = BACKEND_DIR / "resultados"


def carregar_config(caminho: Path | None = None) -> dict[str, Any]:
    with open(caminho or CONFIG_PATH, encoding="utf-8") as f:
        return json.load(f)


def dataset_dir(cfg: dict[str, Any]) -> Path:
    env = os.environ.get("GABARITEI_DATASET")
    if env:
        return Path(env)
    return (BACKEND_DIR / cfg["dataset"]["caminho_relativo"]).resolve()


def sha256_arquivo(caminho: Path) -> str:
    h = hashlib.sha256()
    with open(caminho, "rb") as f:
        for bloco in iter(lambda: f.read(1 << 20), b""):
            h.update(bloco)
    return h.hexdigest()


def sha256_lf(caminho: Path) -> str:
    """SHA-256 do conteudo com CRLF -> LF (checkouts Windows com core.autocrlf alteram os bytes).
    Seguro para JSON/JSONL: CR dentro de strings JSON aparece escapado, nunca cru."""
    with open(caminho, "rb") as f:
        return hashlib.sha256(f.read().replace(bytes([13, 10]), bytes([10]))).hexdigest()


def json_canonico(obj: Any) -> str:
    return json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def sha256_obj(obj: Any) -> str:
    return hashlib.sha256(json_canonico(obj).encode("utf-8")).hexdigest()


def versao_politica(cfg: dict[str, Any]) -> str:
    """Versao legivel + hash da configuracao completa (qualquer mudanca gera nova versao)."""
    return f"{cfg['politica_versao']}+{sha256_obj(cfg)[:10]}"
