"""Conexões e migrações SQLite compatíveis com o backend Node."""
import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone

from sqlalchemy import create_engine, event
from sqlalchemy.engine import URL
from sqlalchemy.pool import QueuePool

from .common import ROOT

PADRAO = ROOT / "backend/dados/gabaritei.db"
MIGRACOES = ("0001_inicial", "0002_dificuldade")


def _conexao_sqlite(conexao, _):
    conexao.execute("PRAGMA foreign_keys = ON")
    conexao.execute("PRAGMA busy_timeout = 5000")


def _instrucoes(sql):
    acumulado = ""
    for linha in sql.splitlines(keepends=True):
        acumulado += linha
        if sqlite3.complete_statement(acumulado):
            yield acumulado.strip()
            acumulado = ""
    if acumulado.strip():
        raise ValueError("Migração SQL incompleta")


@contextmanager
def transacao(engine):
    with engine.connect() as conexao:
        conexao.exec_driver_sql("BEGIN IMMEDIATE")
        try:
            yield conexao
            conexao.commit()
        except BaseException:
            conexao.rollback()
            raise


def migrar(engine):
    with transacao(engine) as conexao:
        conexao.exec_driver_sql(
            "CREATE TABLE IF NOT EXISTS migracao (versao TEXT PRIMARY KEY, aplicada_em TEXT NOT NULL)"
        )
        feitas = set(conexao.exec_driver_sql("SELECT versao FROM migracao").scalars())
        aplicadas = []
        for versao in MIGRACOES:
            if versao in feitas:
                continue
            sql = (ROOT / "backend/migracoes" / f"{versao}.sql").read_text(encoding="utf-8")
            for instrucao in _instrucoes(sql):
                conexao.exec_driver_sql(instrucao)
            agora = datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")
            conexao.exec_driver_sql("INSERT INTO migracao VALUES (?, ?)", (versao, agora))
            aplicadas.append(versao)
    return aplicadas


def abrir_banco(caminho=None):
    from pathlib import Path

    caminho = caminho or os.getenv("GABARITEI_DB") or str(PADRAO)
    memoria = str(caminho) == ":memory:"
    if not memoria:
        caminho = Path(caminho).resolve()
        caminho.parent.mkdir(parents=True, exist_ok=True)
    # A conexão que contém o banco em memória deve ser compartilhada sem uso simultâneo.
    opcoes = {
        "poolclass": QueuePool, "pool_size": 1, "max_overflow": 0,
        "connect_args": {"check_same_thread": False},
    } if memoria else {}
    url = URL.create("sqlite+pysqlite", database=str(caminho))
    engine = create_engine(url, **opcoes)
    event.listen(engine, "connect", _conexao_sqlite)
    try:
        if not memoria:
            with engine.connect() as conexao:
                conexao.exec_driver_sql("PRAGMA journal_mode = WAL").close()
                conexao.exec_driver_sql("PRAGMA synchronous = NORMAL").close()
        migrar(engine)
    except BaseException:
        engine.dispose()
        raise
    return engine
