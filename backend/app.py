"""Aplicação FastAPI do Gabaritei."""
from contextlib import asynccontextmanager
import os
import re
from urllib.parse import urlsplit

from fastapi import FastAPI, Request
from starlette.exceptions import HTTPException
from starlette.staticfiles import StaticFiles

from .acervo import Acervo
from .common import ApiError, ROOT, body, exclusions, integer, reply
from .contas import Contas, router as rotas_conta
from .db import abrir_banco
from .dev import Dev, router as rotas_dev
from .dificuldade import Dificuldade, responder, router as rotas_dificuldade
from .media import router as rotas_media

ID_QUESTAO = re.compile(r"gq_[a-f0-9]+")


def acervo_de(questao_id, request):
    acervo = request.app.state.acervo
    if not ID_QUESTAO.fullmatch(questao_id):
        raise ApiError(404, "Rota não encontrada.")
    if questao_id not in acervo.catalogo["questoes"]:
        raise ApiError(404, "Questão não encontrada.")
    return acervo


class Frontend(StaticFiles):
    async def get_response(self, path, scope):
        path = {".": "index.html"}.get(path, path)
        partes = path.split("/")
        if any(p.startswith(".") or p in {"node_modules", "legacy"} for p in partes):
            raise HTTPException(404)
        if not path.endswith((".html", ".css", ".js", ".svg", ".woff2", ".png", ".ico")):
            raise HTTPException(404)
        response = await super().get_response(path, scope)
        response.headers["Cache-Control"] = "no-cache"
        response.headers["X-Content-Type-Options"] = "nosniff"
        return response


def criar_app(caminho_banco=None):
    @asynccontextmanager
    async def lifespan(app):
        acervo = Acervo()
        app.state.acervo = acervo
        app.state.bootstrap = reply(acervo.bootstrap)
        banco = abrir_banco(caminho_banco)
        try:
            app.state.contas = Contas(banco, seguro=os.getenv("GABARITEI_COOKIE_SEGURO") == "1")
            app.state.dificuldade = Dificuldade(banco, acervo)
            app.state.dev = Dev(acervo)
            yield
        finally:
            banco.dispose()

    app = FastAPI(title="Gabaritei", lifespan=lifespan)
    app.include_router(rotas_conta)
    app.include_router(rotas_dificuldade)
    app.include_router(rotas_dev)
    app.include_router(rotas_media)

    @app.middleware("http")
    async def conferir_origem(request, call_next):
        origem = request.headers.get("origin")
        if origem and request.url.path.startswith("/api/") and request.method not in {"GET", "HEAD"}:
            try:
                autorizada = urlsplit(origem).netloc == request.headers.get("host")
            except ValueError:
                autorizada = False
            if not autorizada:
                return reply({"error": "Origem não permitida."}, 403)
        return await call_next(request)

    @app.exception_handler(ApiError)
    async def erro_api(request, exc):
        return reply(dict(error=str(exc), **exc.extra), exc.status)

    @app.exception_handler(HTTPException)
    async def erro_http(request, exc):
        if exc.status_code == 404:
            mensagem = "Rota não encontrada." if request.url.path.startswith("/api/") else "Arquivo não encontrado."
            return reply({"error": mensagem}, 404)
        return reply({"error": "Método não permitido." if exc.status_code == 405 else exc.detail}, exc.status_code)

    @app.get("/api/health")
    def health(request: Request):
        info = request.app.state.acervo.info
        return reply({"status": "ok", **info, "database": "sqlite"})

    @app.get("/api/bootstrap")
    def bootstrap(request: Request):
        return request.app.state.bootstrap

    @app.get("/api/questoes")
    def listar(request: Request):
        questoes = request.app.state.acervo.questions
        query = request.query_params
        area, materia = query.get("area"), query.get("materia")
        ano = integer(query.get("ano"), None, 2100)
        inicio = integer(query.get("inicio"), 0, len(questoes))
        limite = integer(query.get("limite"), 30, 100)
        busca = query.get("busca", "").lower()
        resultados = [
            q for q in questoes
            if (not area or area in (q["areaId"], q["sourceArea"]))
            and (not materia or q["subjectId"] == materia)
            and (not ano or q["year"] == ano)
            and (not busca or busca in (q["prompt"] + " " + " ".join(q["descriptions"])).lower())
        ]
        return reply(dict(total=len(resultados), questions=resultados[inicio:inicio + limite]))

    @app.get("/api/questoes/{questao_id}")
    def detalhe(questao_id: str, request: Request):
        acervo = acervo_de(questao_id, request)
        if questao_id not in acervo.by_id:
            raise ApiError(422, "Questão bloqueada para prática.")
        return reply({"question": acervo.by_id[questao_id]})

    @app.get("/api/questoes/{questao_id}/recomendacoes")
    @app.post("/api/questoes/{questao_id}/recomendacoes")
    async def recomendacoes(questao_id: str, request: Request):
        acervo = acervo_de(questao_id, request)
        dados = await body(request) if request.method == "POST" else {}
        if not isinstance(dados, dict):
            dados = {}
        limite = dados.get("limit")
        if limite is None:
            limite = request.query_params.get("limite")
        ids = acervo.recommendations(questao_id, exclusions(dados.get("exclude")), integer(limite, 5, 50))
        motivo = None if ids else "Não há sugestões compatíveis disponíveis para esta questão."
        return reply(dict(method="titulo_area", questionId=questao_id, ids=ids,
                          questions=[acervo.by_id[i] for i in ids], reason=motivo))

    @app.post("/api/questoes/{questao_id}/responder")
    async def responder_questao(questao_id: str, request: Request):
        acervo = acervo_de(questao_id, request)
        return await responder(request, acervo.by_id.get(questao_id))

    app.mount("/", Frontend(directory=ROOT / "frontend", follow_symlink=False))
    return app


app = criar_app()
