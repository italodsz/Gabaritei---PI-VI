"""Fixtures. Os testes usam o dataset real (somente leitura) e um banco SQLite descartavel.
Dados de alunos usados nos testes sao SINTETICOS (criados pelos proprios testes)."""
from __future__ import annotations

import json
from pathlib import Path

import pytest

from gabaritei_rec import importacao
from gabaritei_rec.catalogo import Catalogo
from gabaritei_rec.config import carregar_config, dataset_dir
from gabaritei_rec.db import criar_engine, criar_fabrica
from gabaritei_rec.servico import Servico


@pytest.fixture(scope="session")
def cfg():
    return carregar_config()


@pytest.fixture(scope="session")
def artefatos(tmp_path_factory, cfg):
    d = tmp_path_factory.mktemp("artefatos")
    rel = importacao.executar(dataset_dir(cfg), d, cfg)
    return d, rel


@pytest.fixture(scope="session")
def cat(artefatos):
    return Catalogo.carregar(artefatos[0])


@pytest.fixture(scope="session")
def dataset_bruto(cfg):
    ds = dataset_dir(cfg)
    rows = [json.loads(l) for l in open(ds / "data" / "questions.jsonl", encoding="utf-8")]
    eleg = json.load(open(ds / "ids_elegiveis.json", encoding="utf-8"))
    bloq = json.load(open(ds / "qualidade" / "bloqueios.json", encoding="utf-8"))
    return {"dir": ds, "rows": rows, "elegiveis": eleg, "bloqueios": bloq}


@pytest.fixture()
def svc(cat, cfg):
    return Servico(cat, cfg, criar_fabrica(criar_engine("sqlite://")))


@pytest.fixture()
def client(svc):
    from fastapi.testclient import TestClient
    from gabaritei_rec.api import criar_app
    return TestClient(criar_app(svc))


def item_escala(cat, area="MT", faixa=None):
    """Um item ofertavel do grupo de escala do adaptativo (standard/regular)."""
    for it in sorted(cat.ofertaveis(), key=lambda x: x.id):
        if it.area == area and it.formato == "standard" and it.tipo_aplicacao == "regular" and (faixa is None or it.faixa == faixa):
            return it
    raise AssertionError("sem item")
