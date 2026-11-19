"""Contrato HTTP legado: erros, números, JSON e limites de corpo."""
import json
import math
from pathlib import Path
from typing import Any

from fastapi import Request
from fastapi.responses import JSONResponse

ROOT = Path(__file__).resolve().parents[1]


class ApiError(Exception):
    def __init__(self, status: int, message: str, **extra):
        super().__init__(message)
        self.status, self.extra = status, extra


def reply(value: Any, status=200):
    return JSONResponse(value, status_code=status, headers={"Cache-Control": "no-store"})


def finite(value):
    if not isinstance(value, (int, float)) or isinstance(value, bool):
        return False
    try:
        return math.isfinite(value)
    except OverflowError:
        return False


def integer(value, fallback, maximum):
    if value is None:
        return fallback
    try:
        n = float(value or 0)
    except (ValueError, TypeError, OverflowError):
        raise ApiError(400, "Parâmetro numérico inválido.") from None
    if not math.isfinite(n) or n != int(n) or n < 0 or n > maximum:
        raise ApiError(400, "Parâmetro numérico inválido.")
    return int(n)


def exclusions(value=None):
    value = [] if value is None else value
    if not isinstance(value, list) or len(value) > 5000 or any(not isinstance(i, str) for i in value):
        raise ApiError(400, "Lista de exclusão inválida.")
    return value


async def body(request: Request, maximum=256_000):
    data = bytearray()
    async for chunk in request.stream():
        data.extend(chunk)
        if len(data) > maximum:
            raise ApiError(413, "Solicitação muito grande.")
    try:
        return json.loads(data, parse_constant=lambda _: (_ for _ in ()).throw(ValueError()))
    except (ValueError, UnicodeError):
        raise ApiError(400, "JSON inválido.") from None


def js_round(value):
    # Math.round: empates vão para +infinito, inclusive para valores negativos.
    return math.floor(value + 0.5)


def js_number(value):
    if value is None:
        return math.nan
    try:
        return float(value)
    except (ValueError, TypeError, OverflowError):
        return math.nan
