from fastapi.testclient import TestClient

from backend.app import criar_app


DEV = {"nome": "Dev", "email": "dev@example.org", "senha": "senha-de-teste"}


def test_laboratorio_so_para_a_conta_dev(tmp_path, monkeypatch):
    monkeypatch.setenv("GABARITEI_DEVS", DEV["email"])
    with TestClient(criar_app(tmp_path / "dev.db")) as cliente:
        assert cliente.get("/api/dev/resumo").status_code == 401
        outra = {"nome": "Aluna", "email": "aluna@example.org", "senha": "senha-de-teste"}
        assert cliente.post("/api/auth/registrar", json=outra).json()["usuario"]["dev"] is False
        assert cliente.get("/api/dev/resumo").status_code == 403
        assert cliente.get("/api/dev/dificuldade").status_code == 403
        assert cliente.post("/api/auth/sair").status_code == 200
        assert cliente.post("/api/auth/registrar", json=DEV).json()["usuario"]["dev"] is True
        assert cliente.get("/api/eu").json()["usuario"]["dev"] is True
        assert cliente.get("/api/dev/dificuldade").status_code == 200


def test_laboratorio_com_os_indices_reais(tmp_path, monkeypatch):
    monkeypatch.setenv("GABARITEI_DEVS", DEV["email"])
    with TestClient(criar_app(tmp_path / "dev.db")) as cliente:
        assert cliente.post("/api/auth/registrar", json=DEV).status_code == 201
        resumo = cliente.get("/api/dev/resumo").json()
        assert resumo["info"]["available"] == 2657
        assert resumo["worker"]["state"] == "aguardando"
        listagem = cliente.get("/api/dev/questoes?status=liberada&area=CN&limite=3").json()
        assert len(listagem["records"]) == 3
        assert all(r["area"] == "CN" and r["status"] == "liberada" for r in listagem["records"])
        acervo = cliente.app.state.acervo
        teste = next(id_ for id_ in acervo.splits["test"] if id_ in acervo.by_id)
        assert cliente.post("/api/dev/diagnostico", json={"questionId": teste}).status_code == 422
        id_ = resumo["defaultQuestionId"]
        assert cliente.get(f"/api/dev/questoes/{id_}").json()["canAnalyze"]
        resultado = cliente.post("/api/dev/diagnostico", json={"questionId": id_, "limit": 4})
        assert resultado.status_code == 200
        diagnostico = resultado.json()
        assert diagnostico["gallery"] == "train" and len(diagnostico["results"]) == 4
        assert all(abs(r["score"] - sum(c["contribution"] for c in r["components"].values())) < 1e-12
                   for r in diagnostico["results"])
        assert cliente.get("/api/dev/resumo").json()["worker"]["state"] == "pronto"
