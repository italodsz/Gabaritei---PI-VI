import sqlite3

from fastapi.testclient import TestClient

from backend.app import criar_app
from backend.common import ROOT
from backend.db import abrir_banco


def test_estudos_do_node_sincronizam_no_fastapi(tmp_path):
    caminho = tmp_path / "compat.db"
    abrir_banco(caminho).dispose()
    with sqlite3.connect(caminho) as cx:
        cx.executescript((ROOT / "backend/testdata/conta_legada.sql").read_text(encoding="utf-8"))
    with TestClient(criar_app(caminho)) as cliente:
        cliente.cookies.set("gabaritei_sessao", "sessao-original-node")
        inicial = cliente.get("/api/eu/estudos").json()
        assert inicial["revisao"] == 1
        dados = inicial["data"]
        assert dados["profile"]["name"] == "Aluno legado"
        assert dados["practiceSessions"][0]["answers"]["gq_aaa"]["extra"] == 9
        assert dados["simulations"][0]["answers"]["gq_aaa"]["selected"] == "A"
        assert dados["goals"] == [{"kind": "weekly_questions", "target": 30, "enabled": True}]
        assert dados["extra"] == "mantido"
        cliente.cookies.clear()
        login = cliente.post("/api/auth/entrar", json={"email": "aluno@example.org", "senha": "senha-legada"})
        assert login.status_code == 200
        dados["profile"]["name"] = "Nome atualizado"
        assert cliente.put("/api/eu/estudos", json={"data": dados, "baseRevisao": 1}).json() == {"revisao": 2}
        r = cliente.put("/api/eu/estudos", json={"data": dados, "baseRevisao": 1})
        assert r.status_code == 409 and r.json()["revisao"] == 2
        dados["practiceSessions"][0]["answers"]["gq_aaa"]["selected"] = "X"
        assert cliente.put("/api/eu/estudos", json={"data": dados}).status_code == 400
        dados["practiceSessions"][0]["answers"]["gq_aaa"]["selected"] = "A"
        assert cliente.get("/api/eu/estudos").json() == {"revisao": 2, "data": dados}

        pratica = dados["practiceSessions"][0]
        modelo = pratica["answers"]["gq_aaa"]
        ids = [f"gq_{i:04x}" for i in range(800)]
        pratica["questionIds"] = ids
        pratica["answers"] = {id_: {**modelo, "questionId": id_} for id_ in ids}
        assert cliente.put("/api/eu/estudos", json={"data": dados, "baseRevisao": 2}).json() == {"revisao": 3}
        salvo = cliente.get("/api/eu/estudos").json()
        assert len(salvo["data"]["practiceSessions"][0]["answers"]) == 800


def test_conta_plano_notas_e_revogacao(tmp_path):
    caminho = tmp_path / "conta.db"
    with TestClient(criar_app(caminho)) as cliente:
        cadastro = {"nome": "Aluno", "email": "aluno@example.org", "senha": "senha-de-teste"}
        assert cliente.get("/api/eu/plano").status_code == 401
        registro = cliente.post("/api/auth/registrar", json=cadastro)
        assert registro.status_code == 201
        sessao_original = cliente.cookies.get("gabaritei_sessao")
        plano = {"activities": [{"id": "a", "title": "Revisão", "area": "MT", "done": True}]}
        assert cliente.put("/api/eu/plano", json={"data": plano}).json() == {"revisao": 1}
        notas = {"blocks": [{"id": "n", "type": "text", "html": '<b title="todos">Olá</b><span style="color: #123">!</span>'}]}
        assert cliente.put("/api/eu/notas", json={"data": notas}).status_code == 200
        exportado = cliente.get("/api/eu/exportar").json()
        assert exportado["plano"] == plano
        assert exportado["notas"]["blocks"][0]["html"] == '<b>Olá</b><span style="color: #123">!</span>'
        troca = cliente.post("/api/eu/senha", json={"atual": cadastro["senha"], "nova": "nova-senha"})
        assert troca.status_code == 200
        assert cliente.get("/api/eu").json()["usuario"]["id"] == registro.json()["usuario"]["id"]
        assert cliente.get("/api/eu", headers={"Cookie": f"gabaritei_sessao={sessao_original}"}).json() == {"usuario": None}
        assert cliente.request("DELETE", "/api/eu", json={"senha": "nova-senha"}).status_code == 200
        assert cliente.get("/api/eu").json()["usuario"] is None
        with cliente.app.state.contas.banco.connect() as cx:
            assert cx.exec_driver_sql("SELECT COUNT(*) FROM atividade_plano").scalar() == 0
            assert cx.exec_driver_sql("SELECT COUNT(*) FROM nota_bloco").scalar() == 0
