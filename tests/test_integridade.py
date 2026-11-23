"""Migração 0003: regras de integridade explícitas no banco, sem perder dados de bancos antigos.
Usa só o sqlite3 da biblioteca padrão, aplicando os arquivos de migração na ordem."""
import sqlite3
import uuid
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parents[1]
TABELAS = ["perfil_tri", "perfil_tri_historico", "resposta_evento", "resposta_pratica", "meta", "nota_bloco"]


def _instrucoes(sql):
    acc = ""
    for linha in sql.splitlines(keepends=True):
        acc += linha
        if sqlite3.complete_statement(acc):
            yield acc.strip()
            acc = ""


def _aplicar(cx, *nomes):
    for nome in nomes:
        cx.execute("BEGIN IMMEDIATE")
        for s in _instrucoes((RAIZ / "backend/migracoes" / f"{nome}.sql").read_text(encoding="utf-8")):
            cx.execute(s)
        cx.execute("COMMIT")


def _evento(cx, conta=1, motivo=None, versao="dificuldade-v1.2", tempo=9000):
    cx.execute("INSERT INTO resposta_evento VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
               (str(uuid.uuid4()), "legado", "gq_a", "MT", "A", 1, tempo, 1, 0, "pratica", 0.4, 0.1, 0.8, 0.75,
                conta, motivo, versao, "2026-11-01T00:00:00.000Z"))


@pytest.fixture
def banco_antigo():
    cx = sqlite3.connect(":memory:", isolation_level=None)
    cx.execute("PRAGMA foreign_keys = ON")
    _aplicar(cx, "0001_inicial", "0002_dificuldade")
    for s in _instrucoes((RAIZ / "backend/testdata/conta_legada.sql").read_text(encoding="utf-8")):
        cx.execute(s)
    cx.execute("INSERT INTO perfil_tri VALUES ('legado','MT','[0]',3,1700000000000,0.75,'[]','dificuldade-v1')")
    cx.execute("INSERT INTO perfil_tri_historico VALUES ('legado','MT','2026-11-01',500,450,550,15)")
    _evento(cx)
    _evento(cx, conta=0, motivo="resposta_muito_rapida")
    cx.execute("INSERT INTO nota_bloco VALUES ('n1','legado',0,'text','<b>oi</b>',NULL,NULL,'{}')")
    cx.execute("INSERT INTO nota_bloco VALUES ('n2','legado',1,'ref',NULL,'question','','{}')")
    yield cx
    cx.close()


def test_migracao_preserva_dados_e_chaves(banco_antigo):
    cx = banco_antigo
    antes = {t: cx.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0] for t in TABELAS}
    _aplicar(cx, "0003_integridade")
    assert {t: cx.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0] for t in TABELAS} == antes
    assert cx.execute("PRAGMA foreign_key_check").fetchall() == []
    assert cx.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
    # versões já usadas viram configurações conhecidas
    versoes = {r[0] for r in cx.execute("SELECT versao FROM config_dificuldade")}
    assert {"dificuldade-v1", "dificuldade-v1.2"} <= versoes


@pytest.mark.parametrize("acao", [
    lambda cx: _evento(cx, conta=0, motivo=None),                 # não contou sem dizer por quê
    lambda cx: _evento(cx, conta=1, motivo="repeticao"),          # contou e tem motivo
    lambda cx: _evento(cx, versao="versao-inexistente"),           # configuração desconhecida
    lambda cx: _evento(cx, tempo=-5),                              # tempo negativo
    lambda cx: cx.execute("INSERT INTO nota_bloco VALUES ('n3','legado',2,'text',NULL,NULL,NULL,'{}')"),
    lambda cx: cx.execute("INSERT INTO meta VALUES ('legado','x',1,2,0)"),
    lambda cx: cx.execute("INSERT INTO perfil_tri_historico VALUES ('legado','XX','2026-11-02',1,1,1,1)"),
])
def test_regras_novas_recusam_dados_invalidos(banco_antigo, acao):
    _aplicar(banco_antigo, "0003_integridade")
    with pytest.raises(sqlite3.IntegrityError):
        acao(banco_antigo)


def test_excluir_usuario_apaga_tudo_em_cascata(banco_antigo):
    cx = banco_antigo
    _aplicar(cx, "0003_integridade")
    cx.execute("DELETE FROM usuario WHERE id = 'legado'")
    for t in TABELAS + ["sessao_pratica", "simulado", "resposta_simulado", "favorita", "estado_usuario", "sessao_login"]:
        assert cx.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0] == 0, t
