"""API HTTP (FastAPI).  Executar:  uvicorn gabaritei_rec.api:app --reload

Variaveis: DATABASE_URL (padrao sqlite:///./gabaritei_dev.db; producao: postgresql+psycopg://...),
GABARITEI_ARTEFATOS (padrao backend/artefatos), GABARITEI_CONFIG.
"""
from __future__ import annotations

from typing import Literal

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field

from .catalogo import Catalogo
from .config import carregar_config
from .db import criar_engine, criar_fabrica
from .recomendacao import Pedido
from .servico import ErroServico, Servico


class _Estrito(BaseModel):
    model_config = ConfigDict(extra="forbid")  # rejeita campos como is_correct/correta enviados pelo cliente


class NovaSessao(_Estrito):
    aluno_id: str | None = None
    modo: Literal["nivel", "adaptativo", "diagnostico", "automatico"] = "nivel"


class PedidoRecomendacao(_Estrito):
    area: Literal["CH", "CN", "LC", "MT"]
    quantidade: int = Field(ge=1, le=20)
    lingua: Literal["pt", "en", "es"] = "pt"
    dificuldade: Literal["facil", "media", "dificil"] | None = None
    modo: Literal["nivel", "adaptativo", "diagnostico", "automatico"] | None = Field(
        default=None, description="automatico: estrategia decidida no servidor (diagnostico inicial/direcionado, "
                                  "reforco ou adaptativo), com alternativa explicita fora da faixa-alvo")
    formatos: list[Literal["standard", "adapted_accessible"]] | None = None
    habilidade: str | None = Field(default=None, description="Chave (area, skill), ex.: MT:H21")
    objetivo: Literal["pratica", "revisao"] = "pratica"
    aceitar_experimental: bool = False
    semente: int | None = None


class NovaApresentacao(_Estrito):
    recomendacao_item_id: str | None = None
    sessao_id: str | None = Field(default=None, description="Com questao_id: revisao manual de uma questao")
    questao_id: str | None = None


class EnvioResposta(_Estrito):
    alternativa: Literal["A", "B", "C", "D", "E"]
    chave_idempotencia: str | None = Field(default=None, max_length=100)
    usou_dica: bool = False
    tempo_resposta_ms: int | None = Field(default=None, ge=0, description="Auxiliar; nao usado como sinal de dificuldade")


def criar_app(servico: Servico | None = None) -> FastAPI:
    app = FastAPI(title="Gabaritei — recomendador por dificuldade", version="1.1.0")
    estado: dict[str, Servico] = {}

    def svc() -> Servico:
        if "s" not in estado:
            if servico is not None:
                estado["s"] = servico
            else:
                cfg = carregar_config()
                estado["s"] = Servico(Catalogo.carregar(), cfg, criar_fabrica(criar_engine()))
        return estado["s"]

    @app.exception_handler(ErroServico)
    async def _erro(_: Request, e: ErroServico):
        return JSONResponse(status_code=e.codigo, content={"detail": e.mensagem})

    @app.get("/saude")
    def saude(s: Servico = Depends(svc)):
        return {"status": "ok", "dataset_sha256": s.dataset_sha, "politica_versao": s.politica,
                "cortes_versao": s.cat.cortes["versao"], "cortes": s.cat.cortes["cortes"],
                "itens_ofertaveis": len(s.cat.ofertaveis()),
                "adaptativo": {"status": "experimental", "D_confirmado": s.cfg["irt"]["D_confirmado"],
                               "D_experimental": s.cfg["irt"]["D_experimental"],
                               "escala_comparavel_verificada": s.cfg["irt"]["escala_comparavel_verificada"]},
                "automatico": {"status": "experimental", "estrategias": ["diagnostico_inicial", "diagnostico_direcionado",
                                                                         "reforco", "adaptativo"]}}

    @app.post("/alunos", status_code=201)
    def novo_aluno(s: Servico = Depends(svc)):
        return s.criar_aluno()

    @app.post("/sessoes", status_code=201)
    def nova_sessao(body: NovaSessao, s: Servico = Depends(svc)):
        return s.criar_sessao(body.aluno_id, body.modo)

    @app.post("/sessoes/{sessao_id}/recomendacoes")
    def pedir(sessao_id: str, body: PedidoRecomendacao, s: Servico = Depends(svc)):
        modo = body.modo or ("nivel" if body.dificuldade else "adaptativo")
        p = Pedido(modo=modo, area=body.area, quantidade=body.quantidade, lingua=body.lingua,
                   dificuldade=body.dificuldade, formatos=body.formatos, habilidade=body.habilidade,
                   objetivo=body.objetivo, aceitar_experimental=body.aceitar_experimental)
        r = s.recomendar(sessao_id, p, semente=body.semente)
        if r["status"] == "pedido_invalido":
            raise HTTPException(422, r["limitacao"]["motivo"])
        return r

    @app.post("/apresentacoes", status_code=201)
    def apresentar(body: NovaApresentacao, s: Servico = Depends(svc)):
        if body.recomendacao_item_id:
            return s.apresentar(body.recomendacao_item_id)
        if body.sessao_id and body.questao_id:
            return s.apresentar_questao(body.sessao_id, body.questao_id)
        raise HTTPException(422, "informe recomendacao_item_id ou (sessao_id, questao_id)")

    @app.post("/apresentacoes/{apresentacao_id}/resposta")
    def responder(apresentacao_id: str, body: EnvioResposta, s: Servico = Depends(svc)):
        return s.responder(apresentacao_id, body.alternativa, body.chave_idempotencia, body.usou_dica,
                           body.tempo_resposta_ms)

    @app.post("/apresentacoes/{apresentacao_id}/pular")
    def pular(apresentacao_id: str, s: Servico = Depends(svc)):
        return s.pular(apresentacao_id)

    @app.post("/apresentacoes/{apresentacao_id}/dica")
    def dica(apresentacao_id: str, s: Servico = Depends(svc)):
        return s.registrar_dica(apresentacao_id)

    @app.post("/apresentacoes/{apresentacao_id}/revelar-gabarito")
    def revelar(apresentacao_id: str, s: Servico = Depends(svc)):
        return s.revelar_gabarito(apresentacao_id)

    @app.get("/alunos/{aluno_id}/progresso")
    def progresso(aluno_id: str, s: Servico = Depends(svc)):
        return s.progresso(aluno_id)

    return app


app = criar_app()
