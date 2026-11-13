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


def carregar_config(caminho: Path | None = None) -> dict[str, Any]:
    with open(caminho or CONFIG_PATH, encoding="utf-8") as f:
        return json.load(f)




def sha256_arquivo(caminho: Path) -> str:
    """Verifica o conteudo sem depender da conversao LF/CRLF feita pelo Git no Windows."""
    return hashlib.sha256(caminho.read_bytes().replace(b"\r\n", b"\n")).hexdigest()




def json_canonico(obj: Any) -> str:
    return json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def sha256_obj(obj: Any) -> str:
    return hashlib.sha256(json_canonico(obj).encode("utf-8")).hexdigest()


def versao_politica(cfg: dict[str, Any]) -> str:
    """Versao legivel + hash da configuracao completa (qualquer mudanca gera nova versao)."""
    return f"{cfg['politica_versao']}+{sha256_obj(cfg)[:10]}"
