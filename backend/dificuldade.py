"""Perfis TRI, registro de respostas e recomendação adaptativa."""
import hashlib
import json
import random
from datetime import datetime, timezone
from functools import lru_cache
from time import time
from uuid import uuid4

from fastapi import APIRouter, Request

from . import tri
from .common import ApiError, ROOT, body, finite, js_number, js_round, reply
from .contas import exigir_dev, usuario_atual
from .db import transacao

_CONFIG_BYTES = (ROOT / "backend/config/dificuldade_v1.json").read_bytes()
CONFIG = json.loads(_CONFIG_BYTES)
SHA256 = hashlib.sha256(_CONFIG_BYTES).hexdigest()
MODOS = ("semelhante", "conjunto", "aleatorio")
router = APIRouter()


def _iso(ms):
    return datetime.fromtimestamp(ms / 1000, timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def _obj(valor):
    return valor if isinstance(valor, dict) else {}


def _area(q):
    return q["sourceArea"] or {"matematica": "MT", "natureza": "CN", "humanas": "CH", "linguagens": "LC"}.get(q["areaId"])


def _inteiro(valor):
    return finite(valor) and valor == int(valor)


def _alternativa(valor):
    return isinstance(valor, str) and valor in ("A", "B", "C", "D", "E")


class Dificuldade:
    def __init__(self, banco, acervo):
        self.banco, self.acervo = banco, acervo
        with banco.begin() as cx:
            cx.exec_driver_sql(
                "INSERT OR IGNORE INTO config_dificuldade VALUES (?,?,?,?)",
                (CONFIG["versao"], SHA256, json.dumps(CONFIG, ensure_ascii=False), _iso(time() * 1000)),
            )
        self._ajuste = None
        self._novas = 0

    def _perfis(self, cx, uid):
        perfis = {area: tri.perfil_inicial(area, CONFIG) for area in tri.AREAS}
        for r in cx.exec_driver_sql("SELECT * FROM perfil_tri WHERE usuario_id=?", (uid,)).mappings():
            perfis[r["area"]] = dict(area=r["area"], lw=json.loads(r["lw"]), n=r["n"],
                                    atualizadoEm=r["atualizado_em"], pstar=r["pstar"],
                                    respostas=json.loads(r["respostas"]))
        return perfis

    def _salvar(self, cx, uid, p):
        cx.exec_driver_sql(
            """INSERT INTO perfil_tri VALUES (?,?,?,?,?,?,?,?)
               ON CONFLICT(usuario_id,area) DO UPDATE SET lw=excluded.lw,n=excluded.n,
                 atualizado_em=excluded.atualizado_em,pstar=excluded.pstar,
                 respostas=excluded.respostas,versao_config=excluded.versao_config""",
            (uid, p["area"], json.dumps(p["lw"]), p["n"], p["atualizadoEm"], p["pstar"],
             json.dumps(p["respostas"]), CONFIG["versao"]),
        )
        r = tri.resumo_nota(p, CONFIG)
        if r["status"] != "calibrando":
            cx.exec_driver_sql(
                """INSERT INTO perfil_tri_historico VALUES (?,?,?,?,?,?,?)
                   ON CONFLICT(usuario_id,area,dia) DO UPDATE SET nota=excluded.nota,
                   nota_min=excluded.nota_min,nota_max=excluded.nota_max,n=excluded.n""",
                (uid, p["area"], _iso(p["atualizadoEm"] or time() * 1000)[:10], r["nota"], r["min"], r["max"], p["n"]),
            )

    def _perfil_cliente(self, area, bruto):
        bruto = _obj(bruto)
        lw = bruto.get("lw")
        if not isinstance(lw, list) or len(lw) != len(tri.grade(CONFIG)) or not all(map(finite, lw)):
            return tri.perfil_inicial(area, CONFIG)
        n, at, p = (bruto.get(k) for k in ("n", "atualizadoEm", "pstar"))
        return dict(area=area, lw=lw, n=int(n) if _inteiro(n) and 0 <= n <= 2**53 - 1 else 0,
                    atualizadoEm=int(at) if finite(at) and 0 <= at <= 253402300799000 else None,
                    pstar=p if finite(p) else None, respostas=[])

    def importar(self, uid, perfis):
        with transacao(self.banco) as cx:
            gravadas = set(cx.exec_driver_sql("SELECT area FROM perfil_tri WHERE usuario_id=?", (uid,)).scalars())
            for area in tri.AREAS:
                if area not in gravadas:
                    perfil = self._perfil_cliente(area, _obj(perfis).get(area))
                    if perfil["n"] > 0:
                        self._salvar(cx, uid, perfil)

    def visao(self, uid):
        with transacao(self.banco) as cx:
            perfis = self._perfis(cx, uid)
            historico = [dict(r) for r in cx.exec_driver_sql(
                "SELECT area,dia,nota,nota_min,nota_max,n FROM perfil_tri_historico WHERE usuario_id=? ORDER BY dia",
                (uid,),
            ).mappings()]
        resumos = [tri.resumo_nota(perfis[a], CONFIG) for a in tri.AREAS]
        return dict(versao=CONFIG["versao"], perfis=perfis, resumos=resumos,
                    agregados=tri.agregados(resumos), historico=historico)

    def ajustes(self, cx):
        if self._ajuste is None or self._novas >= 10:
            resultados = {a: [] for a in tri.AREAS}
            for r in cx.exec_driver_sql(
                "SELECT area,chance_prevista p,correta y FROM resposta_evento "
                "WHERE chance_prevista IS NOT NULL AND apoio=0 AND conta=1"
            ).mappings():
                resultados[r["area"]].append(r)
            self._ajuste = dict(atualizadoEm=_iso(time()*1000),
                                porArea={a: tri.estimar_ajuste(eventos, CONFIG) for a, eventos in resultados.items()})
            self._novas = 0
        return self._ajuste

    def registrar(self, uid, questao, alternativa, *, tempo=None, origem="pratica", primeira=True, desafio=None):
        area = _area(questao)
        if area not in tri.AREAS:
            return None
        correta, item = alternativa == questao["correct"], questao.get("tri")
        agora = int(time() * 1000)
        with transacao(self.banco) as cx:
            atual = self._perfis(cx, uid)[area]
            primeira = primeira and not cx.exec_driver_sql(
                "SELECT 1 FROM resposta_evento WHERE usuario_id=? AND questao_id=? LIMIT 1", (uid, questao["id"]),
            ).first()
            regra = tri.conta_para_theta(item, primeira, tempo, origem, CONFIG)
            media, dp = tri.momentos(atual, CONFIG)
            prevista = tri.chance(tri.alargar(atual, agora, CONFIG), item, CONFIG) if item else None
            novo = atual
            if regra["conta"]:
                novo = tri.atualizar(atual, item, correta, CONFIG, agora_ms=agora, peso=regra["peso"])
            if origem == "pratica":
                novo = tri.registrar_acerto(novo, correta, CONFIG, tri.meta_de(desafio, CONFIG))
            motivo = regra.get("motivo")
            cx.exec_driver_sql(
                "INSERT INTO resposta_evento VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                (str(uuid4()), uid, questao["id"], area, alternativa, int(correta),
                 js_round(tempo) if finite(tempo) and 0 <= tempo <= 2**53 - 1 else None,
                 int(primeira), 0, origem, prevista, media, dp, atual["pstar"],
                 int(regra["conta"]), motivo, CONFIG["versao"], _iso(agora)),
            )
            if novo is not atual:
                self._salvar(cx, uid, novo)
        self._novas += 1
        return dict(area=area, perfil=novo, conta=regra["conta"], motivo=motivo,
                    chancePrevista=prevista, resumo=tri.resumo_nota(novo, CONFIG))

    def recomendar(self, uid, dados):
        modo, limite = dados.get("modo"), dados.get("limite")
        if modo not in MODOS:
            raise ApiError(400, f"modo deve ser um de: {', '.join(MODOS)}.")
        limite = min(50, max(1, int(limite))) if _inteiro(limite) else 10
        usar = dados.get("usarDificuldade") is not False
        exclusoes = dados.get("exclude")
        fora = [i for i in exclusoes if isinstance(i, str)][:5000] if isinstance(exclusoes, list) else []
        meta = tri.meta_de(dados.get("desafio"), CONFIG)
        with transacao(self.banco) as cx:
            perfis = self._perfis(cx, uid) if uid else {
                a: self._perfil_cliente(a, _obj(dados.get("perfis")).get(a)) for a in tri.AREAS
            }
            ajuste = self.ajustes(cx)["porArea"]

        @lru_cache(maxsize=None)
        def chance_de(id_):
            q = self.acervo.by_id[id_]
            area = _area(q)
            return tri.ajustar_chance(tri.chance(perfis[area], q["tri"], CONFIG), ajuste[area]["delta"]) if q.get("tri") else None

        historico = dados.get("historico")
        historico = {h["id"]: h for h in historico if isinstance(_obj(h).get("id"), str)} if isinstance(historico, list) else {}

        def estado(id_):
            h = historico.get(id_)
            if h is None:
                return "inedita"
            if h.get("correta"):
                return "acertou"
            em = h.get("em")
            try:
                dias = (time() - datetime.fromisoformat(em).timestamp()) / 86400 if em else float("inf")
            except (TypeError, ValueError, OverflowError):
                dias = 0
            return "revisao" if dias >= CONFIG["lista"]["revisao_dias"] else "errou"

        if modo == "semelhante":
            referencia = dados.get("questaoRef")
            if not isinstance(referencia, str) or referencia not in self.acervo.catalogo["questoes"]:
                raise ApiError(404, "Questão de referência não encontrada.")
            ids = self.acervo.recommendations(referencia, fora, 50)
            if usar:
                ids = tri.ordenar_semelhantes(ids, chance_de, meta, CONFIG)
        else:
            if modo == "conjunto":
                candidatos = dados.get("ids")
                if not isinstance(candidatos, list) or len(candidatos) > 3000:
                    raise ApiError(400, "Envie ids (até 3000).")
                ids = list(dict.fromkeys(i for i in candidatos if isinstance(i, str) and i in self.acervo.by_id))
            else:
                area, materia = dados.get("area"), dados.get("materia")
                ids = [q["id"] for q in self.acervo.questions if (not area or area in (_area(q), q["areaId"]))
                       and (not materia or materia == q["subjectId"])]
            excluidos = set(fora)
            ids = [i for i in ids if i not in excluidos]
            if usar:
                ids = tri.montar_lista([dict(id=i, p=chance_de(i), estado=estado(i),
                                             alerta=bool(self.acervo.by_id[i].get("warning"))) for i in ids],
                                      limite, meta, CONFIG)
            else:
                random.shuffle(ids)
        ids = ids[:limite]
        itens = [dict(id=i, chance=p)
                 for i in ids for p in [chance_de(i)]]
        return dict(modo=modo, usarDificuldade=usar, meta=meta, versao=CONFIG["versao"], itens=itens, ids=ids)

    def painel(self):
        faixas = [dict(faixa=f"{i*10}–{i*10+10}%", n=0, prevista=0, observada=0) for i in range(10)]
        with transacao(self.banco) as cx:
            for p, y in cx.exec_driver_sql(
                "SELECT chance_prevista,correta FROM resposta_evento WHERE chance_prevista IS NOT NULL AND apoio=0"
            ):
                faixa = faixas[min(9, int(p * 10))]
                faixa["n"] += 1
                faixa["prevista"] += p
                faixa["observada"] += y
            eventos, contam, usuarios = cx.exec_driver_sql(
                "SELECT COUNT(*),SUM(conta),COUNT(DISTINCT usuario_id) FROM resposta_evento"
            ).one()
            motivos = [dict(r) for r in cx.exec_driver_sql(
                "SELECT motivo,COUNT(*) n FROM resposta_evento WHERE conta=0 GROUP BY motivo"
            ).mappings()]
            recentes = [dict(r) for r in cx.exec_driver_sql(
                """SELECT criada_em em,area,questao_id questao,correta,conta,motivo,
                          chance_prevista p,theta_media theta,pstar,origem
                   FROM resposta_evento ORDER BY criada_em DESC LIMIT 25"""
            ).mappings()]
            ajustes = self.ajustes(cx)
            por_area = []
            for area in tri.AREAS:
                n, validas, acerto, p = cx.exec_driver_sql(
                    """SELECT COUNT(*),SUM(conta),AVG(CASE WHEN conta=1 AND apoio=0 THEN correta END),
                              AVG(CASE WHEN conta=1 AND apoio=0 THEN chance_prevista END)
                       FROM resposta_evento WHERE area=?""", (area,),
                ).one()
                por_area.append(dict(area=area, respostas=n, contam=validas or 0, acertoObservado=acerto,
                                     chanceMediaPrevista=p, ajuste=ajustes["porArea"][area]))
        calibracao = []
        for f in faixas:
            if f["n"]:
                calibracao.append({**f, "prevista": round(f["prevista"] / f["n"], 3),
                                   "observada": round(f["observada"] / f["n"], 3)})
        return dict(versao=CONFIG["versao"], sha256=SHA256, eventos=eventos, contamParaTheta=contam or 0,
                    usuarios=usuarios, motivosNaoConta=motivos, calibracao=calibracao,
                    aprendizadoSistema={**ajustes, "config": CONFIG["aprendizado_sistema"], "porArea": por_area},
                    recentes=recentes)


@router.get("/api/dev/dificuldade")
def painel(request: Request):
    exigir_dev(request)
    return reply(request.app.state.dificuldade.painel())


@router.get("/api/dificuldade/config")
def config(request: Request):
    servico = request.app.state.dificuldade
    with transacao(servico.banco) as cx:
        return reply({**CONFIG, "sha256": SHA256, "ajuste": servico.ajustes(cx)})


@router.post("/api/recomendar")
async def recomendar(request: Request):
    dados = _obj(await body(request, 600_000))
    usuario = usuario_atual(request)
    return reply(request.app.state.dificuldade.recomendar(usuario["id"] if usuario else None, dados))


@router.get("/api/eu/perfil-tri")
def perfil(request: Request):
    usuario = usuario_atual(request)
    return reply(request.app.state.dificuldade.visao(usuario["id"]) if usuario else {"usuario": None})


@router.put("/api/eu/perfil-tri")
async def importar(request: Request):
    uid = usuario_atual(request, exigir=True)["id"]
    servico = request.app.state.dificuldade
    servico.importar(uid, _obj(await body(request)).get("perfis"))
    return reply(servico.visao(uid))


@router.post("/api/eu/perfil-tri/respostas")
async def simulado(request: Request):
    uid = usuario_atual(request, exigir=True)["id"]
    dados = _obj(await body(request)).get("respostas")
    if not isinstance(dados, list):
        raise ApiError(400, "Envie { respostas: [...] }.")
    servico = request.app.state.dificuldade
    registradas = 0
    for bruto in dados[:200]:
        r = _obj(bruto)
        id_, alternativa = r.get("questaoId"), r.get("alternativa")
        if isinstance(id_, str) and id_ in servico.acervo.by_id and _alternativa(alternativa):
            servico.registrar(uid, servico.acervo.by_id[id_], alternativa, tempo=r.get("tempoMs"), origem="simulado")
            registradas += 1
    return reply({"registradas": registradas, **servico.visao(uid)})


async def responder(request, questao):
    dados = _obj(await body(request))
    if questao is None:
        raise ApiError(422, "Questão bloqueada para prática.")
    selected = dados.get("selected")
    if not _alternativa(selected):
        raise ApiError(400, "Escolha uma alternativa de A a E.")
    usuario = usuario_atual(request)
    tempo = js_number(dados.get("tempoMs"))
    if "tempoMs" in dados and dados["tempoMs"] in (None, ""):
        tempo = 0
    resultado = request.app.state.dificuldade.registrar(
        usuario["id"], questao, selected, tempo=tempo,
        primeira=dados.get("primeira") is not False, desafio=dados.get("desafio"),
    ) if usuario else None
    return reply(dict(questionId=questao["id"], selected=selected, correct=selected == questao["correct"],
                      answer=questao["correct"], explanation=questao["explanation"],
                      persisted=resultado is not None, tri=resultado))
