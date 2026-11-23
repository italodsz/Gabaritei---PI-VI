"""Laboratório do catálogo e diagnóstico direto nos índices Python."""
from collections import Counter
from functools import cached_property
import json
import logging
from pathlib import Path
import sys
from threading import Lock

from fastapi import APIRouter, Depends, Request
from starlette.concurrency import run_in_threadpool

from .acervo import sem_acentos
from .common import ApiError, ROOT, body, exclusions, integer, reply
from .contas import exigir_dev

router = APIRouter(prefix="/api/dev", dependencies=[Depends(exigir_dev)])
REC = ROOT / "recomendador/rrf-tfidf-minilm-J"
log = logging.getLogger(__name__)


def _ler(nome):
    return json.loads((REC / nome).read_bytes())


def _contagem(valores):
    contagem = Counter("Não informado" if v is None else str(v) for v in valores)
    return [dict(label=k, value=v) for k, v in sorted(contagem.items(), key=lambda par: (-par[1], sem_acentos(par[0]).lower()))]


def _descricoes(q):
    return [d["text"] for d in q.get("descriptions", []) if d.get("use_for_recommender") is True]


class Dev:
    def __init__(self, acervo):
        self.acervo = acervo
        self.elegiveis = set(acervo.ids)
        self.registros = {id_: self._registro(q) for id_, q in acervo.rows.items()}
        self.busca = {id_: self._busca(q, self.registros[id_]) for id_, q in acervo.rows.items()}
        self.lab = None
        self.estado = "aguardando"
        self.erro = None
        self.lock = Lock()

    def _registro(self, q):
        id_ = q["id"]
        meta = self.acervo.catalogo["questoes"].get(id_, {})
        ids = self.acervo.catalogo["recomendacoes"].get(id_)
        status = "fora"
        if id_ in self.elegiveis:
            status = "defeito" if meta.get("defeito") else "duplicata" if meta.get("duplicata") else "liberada"
        return dict(id=id_, area=q["area"], year=q["year"], split=q["split"],
                    position=(q.get("official_reference") or {}).get("position"),
                    materia=meta.get("materia") or None, titulo=meta.get("titulo") or None,
                    assunto=meta.get("assunto") or None, status=status,
                    recommendations=len(ids) if ids is not None else None,
                    preview=(q.get("question") or "").replace("\\n", " ")[:180])

    @staticmethod
    def _busca(q, r):
        campos = [r["id"], q.get("question"), *_descricoes(q), r["materia"], r["titulo"], r["assunto"], r["position"]]
        return sem_acentos(" ".join(str(v) if v is not None else "" for v in campos)).lower()

    @cached_property
    def rotulos(self):
        arquivo = REC / "classificador/dados/classificacao_manual.jsonl"
        return {r["id"]: r for r in map(json.loads, arquivo.read_bytes().strip().splitlines())}

    @cached_property
    def resumo(self):
        prefixo = "resultados/base_final/"
        antes, depois, auditoria, ambiente, base = (
            _ler(prefixo + f + ".json") for f in ("avaliacao_antes", "avaliacao_depois", "auditoria_entrega",
                                                    "ambiente_indices", "auditoria_base")
        )
        recs = self.acervo.catalogo["recomendacoes"]
        tamanhos = sorted(map(len, recs.values()))
        top = [id_ for ids in recs.values() for id_ in ids[:5]]
        novos = set(base["sem_rotulo_ids"])
        histograma = [dict(label=nome, value=sum(min_ <= n <= max_ for n in tamanhos))
                      for nome, min_, max_ in (("Vazias", 0, 0), ("1–9", 1, 9), ("10–24", 10, 24), ("25–49", 25, 49), ("50", 50, 50))]
        distribuicoes = {k: _contagem(r[k] for r in self.registros.values()) for k in ("area", "year", "status", "split")}
        distribuicoes["subject"] = _contagem(r["materia"] for r in self.registros.values() if r["status"] == "liberada")
        catalogo = dict(lists=len(tamanhos), empty=tamanhos.count(0), median=tamanhos[len(tamanhos)//2],
                        minNonEmpty=next(n for n in tamanhos if n), max=tamanhos[-1],
                        underFive=sum(1 <= n <= 4 for n in tamanhos), histogram=histograma,
                        topFive=len(top), newLabelsTopFive=sum(i in novos for i in top),
                        newLabelsDefinition="IDs das 681 questões que receberam classificação na migração (auditoria_base.sem_rotulo_ids).")
        return dict(info=self.acervo.info, recipe=_ler("busca_por_area_v1.json"), workerRequiredForScores=True,
                    catalog=catalogo, distributions=distribuicoes,
                    validation=[dict(method=k, before=antes[k], after=v) for k, v in depois.items()],
                    audit=dict(source="Auditoria registrada na migração; não é uma nova execução de avaliação.",
                               tfidfTrainOnly=auditoria["tfidf_fit_so_treino_verificado"],
                               aligned=auditoria["ids_vetores_alinhados"], vectorNorms=auditoria["normas_vetores"]),
                    environment=dict(python=ambiente["python"], packages=ambiente["pacotes"], hashes=ambiente["sha256"]),
                    subjects=[{k: m[k] for k in ("id", "name", "areaId")} for m in self.acervo.bootstrap["subjects"]],
                    partitions=[dict(split=k, total=len(ids), years=_contagem(self.acervo.rows[i]["year"] for i in ids))
                                for k, ids in self.acervo.splits.items()],
                    defaultQuestionId="gq_29ef25a472475b50d03207ab")

    def listar(self, query):
        status = query.get("status", "liberada")
        termo = sem_acentos(query.get("busca", "")).lower()
        inicio = integer(query.get("inicio"), 0, len(self.registros))
        limite = integer(query.get("limite"), 20, 100)
        filtros = [(k, query[p]) for k, p in (("area", "area"), ("materia", "materia"), ("split", "split")) if query.get(p)]
        encontrados = [r for r in self.registros.values() if all(r[k] == v for k, v in filtros)
                       and (not query.get("ano") or str(r["year"]) == query["ano"])
                       and (not status or status in ("todas", r["status"])) and termo in self.busca[r["id"]]]
        return dict(total=len(encontrados), records=encontrados[inicio:inicio+limite])

    def detalhe(self, id_):
        if not isinstance(id_, str) or id_ not in self.registros:
            raise ApiError(404, "Questão não encontrada.")
        q, registro = self.acervo.rows[id_], self.registros[id_]
        liberada = registro["status"] == "liberada"
        bloqueio = None
        if q["split"] == "test":
            bloqueio = "Teste de 2024 reservado: consulta somente para leitura; sem diagnóstico ou avaliação de melhoria."
        elif not liberada:
            bloqueio = "Questão fora da prática: confira o motivo antes de corrigir a base."
        descricoes = _descricoes(q)
        questao = self.acervo.by_id.get(id_) or dict(
            id=id_, prompt=(q.get("question") or "").replace("\\n", "\n"), descriptions=descricoes,
            alternatives=[dict(letter=o["label"], text=o["text"]) for o in sorted(q["options"], key=lambda o: o["label"])],
            correct=q["answer"],
        )
        return dict(**registro, question=questao, meta=self.acervo.catalogo["questoes"].get(id_), label=self.rotulos.get(id_),
                    familyId=q["content_family_id"], language=q["language"], tri=q.get("tri"), skill=q.get("skill"),
                    eligible=id_ in self.elegiveis, canAnalyze=bloqueio is None, analysisRestriction=bloqueio,
                    descriptionCount=len(descricoes), catalog=dict(method="titulo_area", gallery="todos os elegíveis",
                    ids=self.acervo.catalogo["recomendacoes"].get(id_, [])))

    def diagnosticar(self, id_, limite, excluir):
        # O objeto de índice captura dados temporários do ranking de cada consulta.
        with self.lock:
            if self.lab is None:
                self.estado = "carregando"
                self.erro = None
                try:
                    from .recomendador_debug import Laboratorio
                    self.lab = Laboratorio()
                except Exception:
                    log.exception("Falha ao carregar os índices do laboratório.")
                    self.estado, self.erro = "indisponivel", "Não foi possível carregar os índices do laboratório."
                    raise ApiError(503, self.erro) from None
                self.estado = "pronto"
            try:
                return self.lab.diagnostico(id_, limite, excluir)
            except ValueError as erro:
                raise ApiError(422, str(erro)) from None


@router.get("/resumo")
def resumo(request: Request):
    dev = request.app.state.dev
    return reply({**dev.resumo, "worker": dict(state=dev.estado, error=dev.erro,
                    python=Path(sys.executable).name, gpuRequired=False)})


@router.get("/questoes")
def questoes(request: Request):
    return reply(request.app.state.dev.listar(request.query_params))


@router.get("/questoes/{questao_id}")
def detalhe(questao_id: str, request: Request):
    return reply(request.app.state.dev.detalhe(questao_id))


@router.post("/diagnostico")
async def diagnostico(request: Request):
    dev = request.app.state.dev
    dados = await body(request)
    q = dev.detalhe(dados.get("questionId") if isinstance(dados, dict) else None)
    if not q["canAnalyze"]:
        raise ApiError(422, q["analysisRestriction"])
    limite = integer(dados.get("limit"), 20, 50)
    excluir = exclusions(dados.get("exclude"))
    return reply(await run_in_threadpool(dev.diagnosticar, q["id"], limite, excluir))
