import json
from hashlib import sha256

from fastapi.testclient import TestClient

from backend.app import criar_app


def test_bootstrap_igual_ao_node():
    with TestClient(criar_app(":memory:")) as cliente:
        recebido = cliente.get("/api/bootstrap").json()
        imagens = [q.pop("images") for q in recebido["questions"]]
        # Bootstrap anterior à migração, conferido contra o servidor Node.
        canonico = json.dumps(recebido, sort_keys=True, separators=(",", ":")).encode()
        assert sha256(canonico).hexdigest() == "cc32f1a8ca0867796563b19254bafbd3d5e7250731d55e146c35ae830a7df3fe"
        primeira = next(img for lista in imagens for img in lista)
        resposta = cliente.get(primeira["src"])
        assert resposta.status_code == 200
        assert resposta.headers["Content-Type"].startswith("image/")
        assert sha256(resposta.content).hexdigest() in primeira["src"]
        assert cliente.get("/media/arquivo-desconhecido.png").status_code == 404
        assert cliente.get("/api/health").json() == {
            "status": "ok", **recebido["info"], "database": "sqlite",
        }


def test_consulta_e_sugestoes():
    with TestClient(criar_app(":memory:")) as cliente:
        acervo = cliente.app.state.acervo
        filtradas = [q for q in acervo.questions if q["sourceArea"] == "MT" and q["year"] == 2023]
        assert cliente.get("/api/questoes?area=MT&ano=2023&inicio=2&limite=3").json() == {
            "total": len(filtradas), "questions": filtradas[2:5],
        }
        assert cliente.get("/api/questoes?limite=101").status_code == 400
        bloqueada = next(i for i in acervo.ids if i not in acervo.by_id)
        assert cliente.get(f"/api/questoes/{bloqueada}").status_code == 422
        referencia = next(q["id"] for q in filtradas if len(acervo.catalogo["recomendacoes"][q["id"]]) >= 3)
        primeiro, segundo, terceiro, *_ = acervo.catalogo["recomendacoes"][referencia]
        caminho = f"/api/questoes/{referencia}/recomendacoes"
        assert cliente.post(caminho, json={"exclude": [primeiro], "limit": 2}).json()["ids"] == [segundo, terceiro]
        assert cliente.post(caminho, json={}, headers={"Origin": "https://example.org"}).status_code == 403


def test_frontend_e_documentacao_no_mesmo_servidor():
    with TestClient(criar_app(":memory:")) as cliente:
        for caminho in ("/", "/docs", "/assets/learning-engine.js"):
            assert cliente.get(caminho).status_code == 200
        assert cliente.get("/api/inexistente").json() == {"error": "Rota não encontrada."}
        assert cliente.get("/backend/server.mjs").status_code == 404
        assert cliente.get("/dev").status_code == 404
