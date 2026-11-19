"""Imagens oficiais conhecidas, servidas só após conferência dos bytes."""
from dataclasses import dataclass
from hashlib import sha256
import re

from fastapi import APIRouter, Request
from fastapi.responses import FileResponse

from .common import ApiError

router = APIRouter()
TIPOS = {"PNG": "image/png", "JPEG": "image/jpeg", "BMP": "image/bmp"}


@dataclass(frozen=True)
class Imagem:
    nome: str
    tipo: str
    sha256: str
    tamanho: int
    largura: int
    altura: int

    def confere(self, dados):
        return len(dados) == self.tamanho and sha256(dados).hexdigest() == self.sha256

    def publica(self):
        return dict(src=f"/media/{self.nome}", width=self.largura, height=self.altura)


def imagem(asset):
    digest = asset.get("sha256", "")
    tipo = TIPOS.get(asset.get("format"))
    if not tipo or not re.fullmatch(r"[0-9a-f]{64}", digest):
        return None
    caminho = asset["path"]
    if not re.fullmatch(rf"media/{digest}\.(?:png|jpg|bmp)", caminho):
        return None
    nome = caminho.split("/", 1)[1]
    return Imagem(nome, tipo, digest, asset["bytes"], asset["width"], asset["height"])


class Midia:
    def __init__(self, pasta, acervo):
        self.arquivos = {}
        self.por_questao = {}
        for id_ in acervo.by_id:
            imagens = self.por_questao[id_] = []
            for asset in acervo.rows[id_].get("assets", []):
                img = imagem(asset)
                if img is not None:
                    if img.nome not in self.arquivos:
                        caminho = pasta / img.nome
                        if not caminho.is_symlink() and caminho.is_file() and img.confere(caminho.read_bytes()):
                            self.arquivos[img.nome] = (caminho, img.tipo)
                    if img.nome in self.arquivos:
                        imagens.append(img.publica())


@router.get("/media/{nome}", include_in_schema=False)
def servir_media(nome: str, request: Request):
    arquivo = request.app.state.acervo.midia.arquivos.get(nome)
    if not arquivo:
        raise ApiError(404, "Imagem não encontrada.")
    caminho, tipo = arquivo
    if caminho.is_symlink() or not caminho.is_file():
        raise ApiError(404, "Imagem não encontrada.")
    return FileResponse(caminho, media_type=tipo, headers={
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
    })
