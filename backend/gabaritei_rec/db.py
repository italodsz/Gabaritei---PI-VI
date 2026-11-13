"""Modelo relacional (SQLAlchemy 2). Alvo de producao: PostgreSQL; testes usam SQLite.

Migracao SQL para PostgreSQL: migrations/0001_inicial.sql (gerada por `python -m gabaritei_rec.db sql`) e
migrations/0002_usuario.sql (username local do aluno). Bancos existentes (SQLite ou PostgreSQL) sao migrados sem
recriar tabelas por `migrar(engine)`, chamado em `criar_fabrica`: idempotente, so ADICIONA coluna/indice/tabela.
"""
from __future__ import annotations

import os
import sys
import uuid
from datetime import datetime, timezone

from sqlalchemy import (JSON, Boolean, DateTime, Float, ForeignKey, Index, Integer, String, Text, UniqueConstraint,
                        create_engine, event, inspect, text)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker


def agora() -> datetime:
    return datetime.now(timezone.utc)


def novo_id() -> str:
    return str(uuid.uuid4())


class Base(DeclarativeBase):
    pass


class VersaoDataset(Base):
    __tablename__ = "versao_dataset"
    sha256: Mapped[str] = mapped_column(String(64), primary_key=True)
    release: Mapped[str] = mapped_column(String(40))
    cortes_versao: Mapped[str] = mapped_column(String(40))
    triagem_versao: Mapped[str] = mapped_column(String(40))
    catalogo_sha256: Mapped[str | None] = mapped_column(String(64))
    registrado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora)


class VersaoPolitica(Base):
    __tablename__ = "versao_politica"
    versao: Mapped[str] = mapped_column(String(80), primary_key=True)
    config: Mapped[dict] = mapped_column(JSON)
    registrado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora)


class VersaoItem(Base):
    """Versao imutavel de questao+gabarito+parametros efetivamente apresentavel."""
    __tablename__ = "versao_item"
    versao_id: Mapped[str] = mapped_column(String(80), primary_key=True)
    questao_id: Mapped[str] = mapped_column(String(40), index=True)
    dataset_sha256: Mapped[str] = mapped_column(ForeignKey("versao_dataset.sha256"))
    questao_hash: Mapped[str] = mapped_column(String(64))
    gabarito_hash: Mapped[str] = mapped_column(String(64))
    gabarito: Mapped[str] = mapped_column(String(1))
    parametros_hash: Mapped[str] = mapped_column(String(64))
    tri_a: Mapped[float] = mapped_column(Float)
    tri_b: Mapped[float] = mapped_column(Float)
    tri_c: Mapped[float] = mapped_column(Float)
    area: Mapped[str] = mapped_column(String(2))
    faixa: Mapped[str | None] = mapped_column(String(10))
    cortes_versao: Mapped[str] = mapped_column(String(40))
    grupo_conteudo: Mapped[str] = mapped_column(String(40), index=True)
    habilidade_chave: Mapped[str | None] = mapped_column(String(20))
    formato: Mapped[str] = mapped_column(String(30))
    tipo_aplicacao: Mapped[str] = mapped_column(String(30))


class Aluno(Base):
    """`id` (UUID) continua sendo o identificador interno estavel. `username` e opcional (alunos antigos e
    sessoes anonimas ficam com NULL) e unico quando presente; e guardado ja normalizado (ver servico)."""
    __tablename__ = "aluno"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=novo_id)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora)
    username: Mapped[str | None] = mapped_column(String(80), nullable=True)
    __table_args__ = (Index("ux_aluno_username", "username", unique=True),)


class MigracaoAplicada(Base):
    __tablename__ = "migracao_aplicada"
    versao: Mapped[str] = mapped_column(String(40), primary_key=True)
    aplicada_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora)


class SessaoEstudo(Base):
    __tablename__ = "sessao_estudo"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=novo_id)
    aluno_id: Mapped[str] = mapped_column(ForeignKey("aluno.id"), index=True)
    modo: Mapped[str] = mapped_column(String(20))
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora)


class Recomendacao(Base):
    __tablename__ = "recomendacao"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=novo_id)
    sessao_id: Mapped[str] = mapped_column(ForeignKey("sessao_estudo.id"), index=True)
    aluno_id: Mapped[str] = mapped_column(ForeignKey("aluno.id"), index=True)
    politica_versao: Mapped[str] = mapped_column(ForeignKey("versao_politica.versao"))
    dataset_sha256: Mapped[str] = mapped_column(ForeignKey("versao_dataset.sha256"))
    cortes_versao: Mapped[str] = mapped_column(String(40))
    modo: Mapped[str] = mapped_column(String(20))
    pedido: Mapped[dict] = mapped_column(JSON)
    status: Mapped[str] = mapped_column(String(30))
    limitacao: Mapped[dict | None] = mapped_column(JSON)
    funil: Mapped[dict | None] = mapped_column(JSON)
    perfil_snapshot: Mapped[dict | None] = mapped_column(JSON)
    semente: Mapped[int] = mapped_column(Integer)
    experimental: Mapped[bool] = mapped_column(Boolean, default=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora)


class RecomendacaoItem(Base):
    __tablename__ = "recomendacao_item"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=novo_id)
    recomendacao_id: Mapped[str] = mapped_column(ForeignKey("recomendacao.id"), index=True)
    posicao: Mapped[int] = mapped_column(Integer)
    versao_item_id: Mapped[str] = mapped_column(ForeignKey("versao_item.versao_id"))
    prob_prevista: Mapped[float | None] = mapped_column(Float)
    razao: Mapped[dict] = mapped_column(JSON)


class Apresentacao(Base):
    __tablename__ = "apresentacao"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=novo_id)
    sessao_id: Mapped[str] = mapped_column(ForeignKey("sessao_estudo.id"), index=True)
    aluno_id: Mapped[str] = mapped_column(ForeignKey("aluno.id"), index=True)
    recomendacao_item_id: Mapped[str | None] = mapped_column(ForeignKey("recomendacao_item.id"))
    versao_item_id: Mapped[str] = mapped_column(ForeignKey("versao_item.versao_id"))
    questao_id: Mapped[str] = mapped_column(String(40), index=True)
    grupo_conteudo: Mapped[str] = mapped_column(String(40))
    politica_versao: Mapped[str] = mapped_column(String(80))
    apresentado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora)
    prob_prevista: Mapped[float | None] = mapped_column(Float)
    theta_no_momento: Mapped[float | None] = mapped_column(Float)
    perfil_versao_no_momento: Mapped[int | None] = mapped_column(Integer)
    usou_dica: Mapped[bool] = mapped_column(Boolean, default=False)
    gabarito_exposto: Mapped[bool] = mapped_column(Boolean, default=False)
    razao: Mapped[dict | None] = mapped_column(JSON)


class Tentativa(Base):
    """Uma acao terminal por apresentacao (resposta ou pulo). UNIQUE(apresentacao_id) garante idempotencia."""
    __tablename__ = "tentativa"
    __table_args__ = (UniqueConstraint("apresentacao_id", name="uq_tentativa_apresentacao"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=novo_id)
    apresentacao_id: Mapped[str] = mapped_column(ForeignKey("apresentacao.id"))
    chave_idempotencia: Mapped[str | None] = mapped_column(String(100))
    aluno_id: Mapped[str] = mapped_column(ForeignKey("aluno.id"), index=True)
    sessao_id: Mapped[str] = mapped_column(ForeignKey("sessao_estudo.id"))
    versao_item_id: Mapped[str] = mapped_column(ForeignKey("versao_item.versao_id"))
    questao_id: Mapped[str] = mapped_column(String(40), index=True)
    area: Mapped[str] = mapped_column(String(2))
    pulada: Mapped[bool] = mapped_column(Boolean, default=False)
    alternativa: Mapped[str | None] = mapped_column(String(1))
    correta: Mapped[bool | None] = mapped_column(Boolean)
    tipo: Mapped[str] = mapped_column(String(30))  # primeira_sem_ajuda | primeira_com_dica | repeticao | apos_exposicao_gabarito | pulada
    primeira_tentativa: Mapped[bool] = mapped_column(Boolean)
    usou_dica: Mapped[bool] = mapped_column(Boolean, default=False)
    gabarito_exposto_antes: Mapped[bool] = mapped_column(Boolean, default=False)
    peso_perfil: Mapped[float] = mapped_column(Float, default=0.0)
    conta_para_perfil: Mapped[bool] = mapped_column(Boolean, default=False)
    motivo_nao_conta: Mapped[str | None] = mapped_column(String(60))
    prob_prevista: Mapped[float | None] = mapped_column(Float)
    tempo_resposta_ms: Mapped[int | None] = mapped_column(Integer)  # auxiliar; nao usado como sinal de dificuldade
    enviado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora)
    politica_versao: Mapped[str] = mapped_column(String(80))


class ExposicaoGabarito(Base):
    __tablename__ = "exposicao_gabarito"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=novo_id)
    aluno_id: Mapped[str] = mapped_column(ForeignKey("aluno.id"), index=True)
    questao_id: Mapped[str] = mapped_column(String(40))
    grupo_conteudo: Mapped[str] = mapped_column(String(40), index=True)
    origem: Mapped[str] = mapped_column(String(30))  # correcao | revelacao
    apresentacao_id: Mapped[str | None] = mapped_column(ForeignKey("apresentacao.id"))
    exposto_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora)


class Perfil(Base):
    """Proficiencia por (aluno, area). `versao` implementa controle otimista de concorrencia."""
    __tablename__ = "perfil"
    aluno_id: Mapped[str] = mapped_column(ForeignKey("aluno.id"), primary_key=True)
    area: Mapped[str] = mapped_column(String(2), primary_key=True)
    theta: Mapped[float] = mapped_column(Float)
    dp: Mapped[float] = mapped_column(Float)
    n_evidencias: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(20))
    D_usado: Mapped[float] = mapped_column(Float)
    experimental: Mapped[bool] = mapped_column(Boolean, default=True)
    ultima_tentativa_id: Mapped[str | None] = mapped_column(String(36))
    versao: Mapped[int] = mapped_column(Integer, default=0)
    atualizado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora)
    __mapper_args__ = {"version_id_col": versao}


def criar_engine(url: str | None = None):
    url = url or os.environ.get("DATABASE_URL", "sqlite:///./gabaritei_dev.db")
    kw: dict = {}
    if url.startswith("sqlite"):
        kw["connect_args"] = {"check_same_thread": False, "timeout": 30}
        if url in ("sqlite://", "sqlite:///:memory:"):
            from sqlalchemy.pool import StaticPool
            kw["poolclass"] = StaticPool
    eng = create_engine(url, future=True, **kw)
    if url.startswith("sqlite"):
        @event.listens_for(eng, "connect")
        def _fk(dbapi_conn, _):
            dbapi_conn.execute("PRAGMA foreign_keys=ON")
    return eng


MIGRACOES = ("0001_inicial", "0002_usuario")


def migrar(engine) -> list[str]:
    """Leva um banco existente ao schema atual SEM apagar dados (sem drop_all/recriacao).

    create_all cria tabelas novas, mas nao adiciona colunas a tabelas existentes; por isso a coluna
    aluno.username e o indice unico sao adicionados aqui. Repetir e seguro. Devolve as acoes executadas."""
    acoes = []
    cols = {c["name"] for c in inspect(engine).get_columns("aluno")}
    with engine.begin() as con:
        if "username" not in cols:
            con.execute(text("ALTER TABLE aluno ADD COLUMN username VARCHAR(80)"))
            acoes.append("aluno.username adicionada")
        idx = {i["name"] for i in inspect(con).get_indexes("aluno")}
        if "ux_aluno_username" not in idx:
            con.execute(text("CREATE UNIQUE INDEX ux_aluno_username ON aluno (username)"))
            acoes.append("ux_aluno_username criado")
        feitas = {r[0] for r in con.execute(text("SELECT versao FROM migracao_aplicada"))}
        for v in MIGRACOES:
            if v not in feitas:
                con.execute(text("INSERT INTO migracao_aplicada (versao, aplicada_em) VALUES (:v, :t)"),
                            {"v": v, "t": agora()})
                acoes.append(f"registrada {v}")
    return acoes


def criar_fabrica(engine):
    Base.metadata.create_all(engine)  # so cria o que nao existe; tabelas antigas sao completadas por migrar()
    migrar(engine)
    return sessionmaker(bind=engine, expire_on_commit=False, future=True)


def gerar_sql_postgres() -> str:
    from sqlalchemy.dialects import postgresql
    from sqlalchemy.schema import CreateIndex, CreateTable
    partes = ["-- Gerado por `python -m gabaritei_rec.db sql`. Migracao inicial do recomendador (PostgreSQL).",
              "BEGIN;"]
    for t in Base.metadata.sorted_tables:
        partes.append(str(CreateTable(t).compile(dialect=postgresql.dialect())).strip() + ";")
        for ix in t.indexes:
            partes.append(str(CreateIndex(ix).compile(dialect=postgresql.dialect())).strip() + ";")
    partes.append("COMMIT;")
    return "\n\n".join(partes) + "\n"


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "sql":
        sys.stdout.write(gerar_sql_postgres())
    elif len(sys.argv) > 1 and sys.argv[1] == "migrar":
        eng = criar_engine()
        Base.metadata.create_all(eng)
        print(migrar(eng) or "banco ja estava no schema atual")
    elif len(sys.argv) > 1 and sys.argv[1] == "init":
        criar_fabrica(criar_engine())
        print("tabelas criadas em", os.environ.get("DATABASE_URL", "sqlite:///./gabaritei_dev.db"))
