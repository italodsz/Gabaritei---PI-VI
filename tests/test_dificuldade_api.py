from fastapi.testclient import TestClient

from backend.app import criar_app


def test_recomendacao_gabarito_e_perfil(tmp_path):
    banco = tmp_path / "dificuldade.db"
    with TestClient(criar_app(banco)) as cliente:
        acervo = cliente.app.state.acervo
        itens = [q for q in acervo.questions if q.get("tri")]
        primeira, segunda = itens[:2]
        ids = [q["id"] for q in itens[:6]]
        resposta = cliente.post("/api/recomendar", json={"modo": "conjunto", "ids": ids, "exclude": ids[2:], "limite": 5})
        assert resposta.status_code == 200
        assert set(resposta.json()["ids"]) == set(ids[:2])
        assert all(0 < i["chance"] < 1 for i in resposta.json()["itens"])
        caminho = f'/api/questoes/{primeira["id"]}/responder'
        selecao = {"selected": primeira["correct"], "tempoMs": 120_000}
        assert cliente.post(caminho, json=selecao).json()["persisted"] is False
        assert cliente.put("/api/eu/perfil-tri", json={}).status_code == 401
        cadastro = {"nome": "Conta de teste", "email": "teste@example.org", "senha": "senha-de-teste"}
        assert cliente.post("/api/auth/registrar", json=cadastro).status_code == 201
        assert cliente.get("/api/eu").json()["usuario"]["email"] == cadastro["email"]
        resultado = cliente.post(caminho, json=selecao).json()
        assert resultado["correct"] and resultado["persisted"] and resultado["tri"]["conta"]
        area = resultado["tri"]["area"]
        assert cliente.post(caminho, json=selecao).json()["tri"]["motivo"] == "repeticao"
        assert cliente.get("/api/eu/perfil-tri").json()["perfis"][area]["n"] == 1
        simulado = [{"questaoId": segunda["id"], "alternativa": segunda["correct"], "tempoMs": 120_000}]
        assert cliente.post("/api/eu/perfil-tri/respostas", json={"respostas": simulado}).json()["registradas"] == 1
        config = cliente.get("/api/dificuldade/config").json()
        assert len(config["sha256"]) == 64
        painel = cliente.get("/api/dev/dificuldade").json()
        assert painel["eventos"] == 3
        assert painel["contamParaTheta"] == 2
        assert painel["motivosNaoConta"] == [{"motivo": "repeticao", "n": 1}]
        assert cliente.post("/api/auth/sair").status_code == 200
    with TestClient(criar_app(banco)) as cliente:
        assert cliente.post("/api/auth/entrar", json=cadastro).status_code == 200
        assert cliente.get("/api/eu/perfil-tri").json()["perfis"][area]["n"] >= 1
