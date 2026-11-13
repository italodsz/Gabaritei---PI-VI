"""Catalogo de itens carregado dos artefatos gerados por `importacao`.

O gabarito fica guardado aqui para correcao no servidor; `visao_publica` nunca o inclui.
"""
from __future__ import annotations

import json
import hashlib
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

from .config import ARTEFATOS_DIR, sha256_arquivo

CAMPOS_PROIBIDOS_PUBLICO = {"gabarito", "gabarito_hash", "answer"}


@dataclass(frozen=True)
class Item:
    id: str
    versao_id: str
    questao_hash: str
    gabarito_hash: str
    parametros_hash: str
    area: str
    lingua: str
    formato: str
    tipo_aplicacao: str
    ano: int
    split: str
    habilidade: str | None
    habilidade_chave: str | None
    topico_regra: str | None
    a: float
    b: float
    c: float
    triagem_excluir: bool
    faixa: str | None
    grupo_conteudo: str
    disponivel: bool
    motivos_indisponivel: tuple[str, ...]
    enunciado: str
    alternativas: tuple[tuple[str, str], ...]
    gabarito: str
    descricoes_recomendador: tuple[str, ...] = ()
    midias: tuple[tuple[str, str], ...] = ()

    def texto_para_busca(self) -> str:
        """Representacao para busca/deduplicacao; a descricao nao e incorporada ao enunciado do aluno."""
        return '\n'.join((self.enunciado, *self.descricoes_recomendador,
                         *(texto for _, texto in self.alternativas)))

    @property
    def ofertavel(self) -> bool:
        return self.disponivel and not self.triagem_excluir and self.faixa is not None

    def visao_publica(self) -> dict[str, Any]:
        return {
            "questao_id": self.id,
            "versao_id": self.versao_id,
            "area": self.area,
            "lingua": self.lingua,
            "formato": self.formato,
            "ano": self.ano,
            "habilidade": self.habilidade_chave,
            "faixa": self.faixa,
            "enunciado": self.enunciado,
            "alternativas": [{"letra": l, "texto": t} for l, t in self.alternativas],
        }


class Catalogo:
    def __init__(self, itens: Iterable[Item], manifesto: dict[str, Any], cortes: dict[str, Any],
                 grupos_alias: dict[str, str] | None = None, diretorio: Path | None = None):
        self.itens = {it.id: it for it in itens}
        self.por_versao = {it.versao_id: it for it in self.itens.values()}
        self.manifesto = manifesto
        self.cortes = cortes
        self.grupos_alias = grupos_alias or {}
        self.diretorio = Path(diretorio or ARTEFATOS_DIR).resolve()

    def normalizar_grupo(self, grupo: str) -> str:
        vistos = set()
        while grupo in self.grupos_alias and grupo not in vistos:
            vistos.add(grupo)
            grupo = self.grupos_alias[grupo]
        return grupo

    def grupos_equivalentes(self, grupo: str) -> set[str]:
        canonico = self.normalizar_grupo(grupo)
        return {grupo, canonico} | {g for g in self.grupos_alias if self.normalizar_grupo(g) == canonico}

    def arquivos_midia(self, item: Item) -> list[Path]:
        arquivos = []
        for nome, esperado in item.midias:
            path = (self.diretorio / nome).resolve()
            if not path.is_relative_to(self.diretorio) or path.suffix.lower() not in ('.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'):
                raise RuntimeError('Caminho de imagem invalido no catalogo.')
            if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != esperado:
                raise RuntimeError('Imagem ausente ou diferente da versao apresentada.')
            arquivos.append(path)
        return arquivos

    @classmethod
    def carregar(cls, diretorio: Path | None = None) -> "Catalogo":
        d = Path(diretorio or ARTEFATOS_DIR)
        cam = d / "catalogo.json"
        if not cam.exists():
            raise FileNotFoundError(f"{cam} nao existe; baixe ou extraia o pacote completo com a pasta artefatos.")
        manifesto = json.load(open(d / "manifesto.json", encoding="utf-8"))
        if manifesto.get("catalogo_sha256") and sha256_arquivo(cam) != manifesto["catalogo_sha256"]:
            raise RuntimeError("catalogo.json nao corresponde ao manifesto (artefato alterado fora do pipeline).")
        bruto = json.load(open(cam, encoding="utf-8"))
        cortes = json.load(open(d / "cortes.json", encoding="utf-8"))
        if cortes["versao"] != manifesto["cortes_versao"] or cortes["dataset_sha256"] != manifesto["dataset_sha256"]:
            raise RuntimeError("cortes.json incompativel com o manifesto")
        catalogo = cls((item_de_dict(x) for x in bruto["itens"]), manifesto, cortes,
                       bruto.get('grupos_alias'), d)
        for item in catalogo.ofertaveis():
            catalogo.arquivos_midia(item)
        return catalogo

    def ofertaveis(self) -> list[Item]:
        return [it for it in self.itens.values() if it.ofertavel]


def item_de_dict(x: dict[str, Any]) -> Item:
    return Item(
        id=x["id"], versao_id=x["versao_id"], questao_hash=x["questao_hash"], gabarito_hash=x["gabarito_hash"],
        parametros_hash=x["parametros_hash"], area=x["area"], lingua=x["lingua"], formato=x["formato"],
        tipo_aplicacao=x["tipo_aplicacao"], ano=x["ano"], split=x["split"], habilidade=x["habilidade"],
        habilidade_chave=x["habilidade_chave"], topico_regra=x["topico_regra"],
        a=float(x["tri"]["a"]), b=float(x["tri"]["b"]), c=float(x["tri"]["c"]),
        triagem_excluir=bool(x["triagem"]["excluir"]), faixa=x["faixa"], grupo_conteudo=x["grupo_conteudo"],
        disponivel=bool(x["disponivel"]), motivos_indisponivel=tuple(x["motivos_indisponivel"]),
        enunciado=x["enunciado"] or "",
        alternativas=tuple((o["label"], o["text"]) for o in (x["alternativas"] or [])),
        gabarito=x["gabarito"],
        descricoes_recomendador=tuple(x.get('descricoes_recomendador', [])),
        midias=tuple((m['path'], m['sha256']) for m in x.get('midias', [])),
    )
