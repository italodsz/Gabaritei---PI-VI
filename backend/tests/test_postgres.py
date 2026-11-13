"""Integracao com PostgreSQL (opcional). Rode com:
    $env:GABARITEI_TEST_PG_URL = "postgresql+psycopg://usuario:senha@localhost:5432/gabaritei_teste"
O banco deve estar vazio; as tabelas sao criadas e removidas pelo teste."""
from __future__ import annotations

import os
import threading

import pytest
from sqlalchemy import func, select

from gabaritei_rec.db import Base, Perfil, Tentativa, criar_engine, criar_fabrica
from gabaritei_rec.servico import Servico

from .conftest import item_escala

URL = os.environ.get("GABARITEI_TEST_PG_URL")
pytestmark = pytest.mark.skipif(not URL, reason="GABARITEI_TEST_PG_URL nao definido (sem credenciais do PostgreSQL)")


@pytest.fixture()
def svc_pg(cat, cfg):
    eng = criar_engine(URL)
    Base.metadata.drop_all(eng)
    svc = Servico(cat, cfg, criar_fabrica(eng))
    yield svc
    Base.metadata.drop_all(eng)


def test_postgres_idempotencia_concorrente(svc_pg, cat):
    s = svc_pg.criar_sessao(None, "nivel")
    it = item_escala(cat)
    ap = svc_pg.apresentar_questao(s["sessao_id"], it.id)["apresentacao_id"]
    res = []
    th = [threading.Thread(target=lambda: res.append(svc_pg.responder(ap, it.gabarito))) for _ in range(10)]
    [t.start() for t in th]
    [t.join() for t in th]
    assert sum(1 for r in res if not r["replay_idempotente"]) == 1
    with svc_pg.fabrica() as db:
        assert db.scalar(select(func.count()).select_from(Tentativa)) == 1
        assert db.get(Perfil, (s["aluno_id"], it.area)).n_evidencias == 1
