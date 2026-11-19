from fastapi.testclient import TestClient

from backend.app import criar_app


def test_laboratorio_com_os_indices_reais(tmp_path):
    with TestClient(criar_app(tmp_path / "dev.db")) as cliente:
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
