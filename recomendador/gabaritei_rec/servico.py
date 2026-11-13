"""Camada de servico: sessoes, recomendacoes, apresentacoes, respostas (correcao no servidor), pulos e progresso.

Garantias:
  * gabarito nunca sai antes do envio da resposta (ou de revelacao explicita, registrada como exposicao);
  * correcao usa o gabarito da VERSAO apresentada (tabela versao_item), nunca um campo do cliente;
  * UNIQUE(tentativa.apresentacao_id) + replay => reenvio nao altera o perfil duas vezes;
  * perfil recalculado a partir das tentativas que contam, com controle otimista de versao (retry).
"""
from __future__ import annotations

import random
import re
import unicodedata
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any, Callable

from sqlalchemy import func, select
import time

from sqlalchemy.exc import IntegrityError, OperationalError
from sqlalchemy.orm import Session
from sqlalchemy.orm.exc import StaleDataError

from .catalogo import Catalogo
from .config import versao_politica
from .db import (Aluno, Apresentacao, ExposicaoGabarito, Perfil, Recomendacao, RecomendacaoItem, SessaoEstudo,
                 Tentativa, VersaoDataset, VersaoItem, VersaoPolitica, agora)
from .estrategia import HistoricoArea, decidir_estrategia
from .perfil import classificar_tentativa, estimar_perfil_area, item_na_escala_adaptativa, peso_e_motivo
from .psicometria import AREAS, Evidencia, prob_3pl, trajetoria_status
from .recomendacao import MODOS, Contexto, Pedido, recomendar


USERNAME_MAX = 40
_USERNAME_OK = re.compile(r"^[\w.\- ]+$")


def normalizar_username(bruto: str | None) -> str:
    """Regra documentada: Unicode NFC, espacos das extremidades removidos, espacos internos repetidos viram um,
    letras em minusculas (casefold). Aceita letras, digitos, espaco, ponto, hifen e sublinhado; 1-40 caracteres.
    Ex.: " JoAo " -> "joao". O username nunca e usado para montar SQL (parametros) nem caminhos de arquivo."""
    u = re.sub(r"\s+", " ", unicodedata.normalize("NFC", bruto or "").strip()).casefold()
    if not u or len(u) > USERNAME_MAX or not _USERNAME_OK.match(u):
        raise ErroServico(422, f"usuario invalido: use 1-{USERNAME_MAX} letras, numeros, espaco, ponto, hifen ou sublinhado")
    return u


class ErroServico(Exception):
    def __init__(self, codigo: int, mensagem: str):
        super().__init__(mensagem)
        self.codigo, self.mensagem = codigo, mensagem


def _utc(dt: datetime) -> datetime:
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


class Servico:
    def __init__(self, cat: Catalogo, cfg: dict[str, Any], fabrica, relogio: Callable[[], datetime] = agora):
        self.cat, self.cfg, self.fabrica, self.relogio = cat, cfg, fabrica, relogio
        self.politica = versao_politica(cfg)
        self.dataset_sha = cat.manifesto["dataset_sha256"]
        # Exclusoes fornecidas pelo terminal (ex.: gabaritos vistos no laboratorio), sem virar evidencia de habilidade.
        self.exposicoes_externas: dict[str, tuple[set[str], set[str]]] = {}
        self._registrar_versoes()

    # ------------------------------------------------------------ versoes
    def _registrar_versoes(self):
        with self.fabrica.begin() as s:
            if not s.get(VersaoDataset, self.dataset_sha):
                m = self.cat.manifesto
                s.add(VersaoDataset(sha256=self.dataset_sha, release=m["release"], cortes_versao=m["cortes_versao"],
                                    triagem_versao=m["triagem_versao"], catalogo_sha256=m.get("catalogo_sha256")))
            if not s.get(VersaoPolitica, self.politica):
                s.add(VersaoPolitica(versao=self.politica, config=self.cfg))
            existentes = set(s.scalars(select(VersaoItem.versao_id)))
            cv = self.cat.cortes["versao"]
            for it in self.cat.ofertaveis():
                if it.versao_id not in existentes:
                    s.add(VersaoItem(versao_id=it.versao_id, questao_id=it.id, dataset_sha256=self.dataset_sha,
                                     questao_hash=it.questao_hash, gabarito_hash=it.gabarito_hash, gabarito=it.gabarito,
                                     parametros_hash=it.parametros_hash, tri_a=it.a, tri_b=it.b, tri_c=it.c,
                                     area=it.area, faixa=it.faixa, cortes_versao=cv, grupo_conteudo=it.grupo_conteudo,
                                     habilidade_chave=it.habilidade_chave, formato=it.formato,
                                     tipo_aplicacao=it.tipo_aplicacao))

    # ------------------------------------------------------------ alunos e sessoes
    def criar_aluno(self) -> dict[str, Any]:
        with self.fabrica.begin() as s:
            a = Aluno(criado_em=self.relogio())
            s.add(a)
            s.flush()
            return {"aluno_id": a.id}

    # ------------------------------------------------------------ usuarios locais (username)
    def buscar_usuario(self, username: str) -> dict[str, Any] | None:
        u = normalizar_username(username)
        with self.fabrica() as s:
            a = s.scalars(select(Aluno).where(Aluno.username == u)).first()
            return None if a is None else {"aluno_id": a.id, "username": a.username,
                                           "criado_em": _utc(a.criado_em).isoformat()}

    def obter_ou_criar_usuario(self, username: str) -> dict[str, Any]:
        """Retoma o MESMO aluno_id se o username (normalizado) existir; senao cadastra. Nao vincula alunos
        anonimos antigos a nenhum username."""
        u = normalizar_username(username)
        for _ in range(3):
            achado = self.buscar_usuario(u)
            if achado:
                return {**achado, "criado": False}
            try:
                with self.fabrica.begin() as s:
                    a = Aluno(criado_em=self.relogio(), username=u)
                    s.add(a)
                    s.flush()
                    return {"aluno_id": a.id, "username": u, "criado_em": _utc(a.criado_em).isoformat(), "criado": True}
            except IntegrityError:
                continue  # outro processo criou o mesmo username ao mesmo tempo: busca de novo
        raise ErroServico(503, "conflito ao cadastrar usuario; tente novamente")

    def etapa_atual(self, aluno_id: str, area: str) -> dict[str, Any]:
        """Estrategia que o modo automatico usaria agora (mesma funcao da recomendacao; nada e gravado)."""
        with self.fabrica() as s:
            estados, _ = self._perfil_atual(s, aluno_id)
            hist = self._historico(s, aluno_id)
        return decidir_estrategia(estados[area], hist[area], self.cfg).como_dict()

    def resumo_usuario(self, aluno_id: str) -> dict[str, Any]:
        with self.fabrica() as s:
            a = s.get(Aluno, aluno_id)
            if not a:
                raise ErroServico(404, "aluno nao encontrado")
            sess = list(s.scalars(select(SessaoEstudo).where(SessaoEstudo.aluno_id == aluno_id)))
            ult = s.scalars(select(Tentativa.enviado_em).where(Tentativa.aluno_id == aluno_id)
                            .order_by(Tentativa.enviado_em.desc())).first()
        return {"aluno_id": aluno_id, "username": a.username, "sessoes": len(sess),
                "ultima_resposta_em": _utc(ult).isoformat() if ult else None,
                "por_area": self.progresso(aluno_id)["por_area"]}

    def criar_sessao(self, aluno_id: str | None, modo: str) -> dict[str, Any]:
        if modo not in MODOS:
            raise ErroServico(422, "modo invalido")
        with self.fabrica.begin() as s:
            if aluno_id is None:
                a = Aluno(criado_em=self.relogio())
                s.add(a)
                s.flush()
                aluno_id = a.id
            elif not s.get(Aluno, aluno_id):
                raise ErroServico(404, "aluno nao encontrado")
            ss = SessaoEstudo(aluno_id=aluno_id, modo=modo, criado_em=self.relogio())
            s.add(ss)
            s.flush()
            return {"sessao_id": ss.id, "aluno_id": aluno_id, "modo": modo, "politica_versao": self.politica}

    # ------------------------------------------------------------ perfil
    def _evidencias_area(self, s: Session, aluno_id: str, area: str, ate: datetime | None = None) -> list[Evidencia]:
        q = (select(Tentativa, VersaoItem).join(VersaoItem, Tentativa.versao_item_id == VersaoItem.versao_id)
             .where(Tentativa.aluno_id == aluno_id, Tentativa.area == area, Tentativa.conta_para_perfil.is_(True))
             .order_by(Tentativa.enviado_em, Tentativa.id))
        ev = []
        for t, vi in s.execute(q):
            if ate is not None and _utc(t.enviado_em) > ate:
                continue
            ev.append(Evidencia(a=vi.tri_a, b=vi.tri_b, c=vi.tri_c, acerto=bool(t.correta), peso=t.peso_perfil))
        return ev

    def _perfil_atual(self, s: Session, aluno_id: str):
        estados, ests = {}, {}
        for area in AREAS:
            estados[area], ests[area] = estimar_perfil_area(area, self._evidencias_area(s, aluno_id, area), self.cfg)
        return estados, ests

    def _atualizar_perfil(self, s: Session, aluno_id: str, area: str, tentativa_id: str):
        estado, _ = estimar_perfil_area(area, self._evidencias_area(s, aluno_id, area), self.cfg)
        p = s.get(Perfil, (aluno_id, area))
        if p is None:
            p = Perfil(aluno_id=aluno_id, area=area)
            s.add(p)
        p.theta, p.dp, p.n_evidencias = estado.theta, estado.dp, estado.n_evidencias
        p.status, p.D_usado, p.experimental = estado.status, estado.D_usado, estado.experimental
        p.ultima_tentativa_id, p.atualizado_em = tentativa_id, self.relogio()
        s.flush()
        return p

    # ------------------------------------------------------------ recomendacao
    def pendencia_terminal(self, aluno_id: str, pedido: Pedido) -> dict[str, Any] | None:
        """Retoma uma reserva sem resposta, sem criar nova recomendacao nem consumir outra sondagem.

        O pedido deve coincidir e o perfil nao pode ter mudado. A apresentacao original continua idempotente.
        """
        with self.fabrica() as s:
            perfil = s.get(Perfil, (aluno_id, pedido.area))
            versao = perfil.versao if perfil else 0
            ofertaveis_ids = {it.id for it in self.cat.ofertaveis()}
            terminada = (select(Tentativa.id).join(Apresentacao, Tentativa.apresentacao_id == Apresentacao.id)
                         .where(Apresentacao.recomendacao_item_id == RecomendacaoItem.id).exists())
            grupos_respondidos = (select(VersaoItem.grupo_conteudo)
                                  .join(Tentativa, Tentativa.versao_item_id == VersaoItem.versao_id)
                                  .where(Tentativa.aluno_id == aluno_id, Tentativa.correta.is_not(None)))
            q = (select(RecomendacaoItem, Recomendacao, VersaoItem).select_from(RecomendacaoItem)
                 .join(Recomendacao, Recomendacao.id == RecomendacaoItem.recomendacao_id)
                 .join(VersaoItem, VersaoItem.versao_id == RecomendacaoItem.versao_item_id)
                 .where(Recomendacao.aluno_id == aluno_id, VersaoItem.area == pedido.area,
                        ~terminada, VersaoItem.grupo_conteudo.not_in(grupos_respondidos))
                 .order_by(Recomendacao.criado_em.desc(), Recomendacao.id.desc(), RecomendacaoItem.posicao))
            externos = self.exposicoes_externas.get(aluno_id, (set(), set()))
            for ri, rec, vi in s.execute(q):
                if rec.pedido != pedido.como_dict() or (rec.perfil_snapshot or {}).get("versao", 0) != versao:
                    continue
                item = self.cat.por_versao.get(vi.versao_id)
                if item is None or item.id not in ofertaveis_ids or item.id in externos[0] or item.grupo_conteudo in externos[1]:
                    continue
                return {"sessao_id": rec.sessao_id, "aluno_id": aluno_id,
                        "item": {"recomendacao_item_id": ri.id, "questao_id": item.id,
                                 "prob_prevista": ri.prob_prevista, "razao": ri.razao},
                        "estrategia": (rec.perfil_snapshot or {}).get("estrategia_decidida"),
                        "politica_original": rec.politica_versao}
        return None

    def _contexto(self, s: Session, aluno_id: str, sessao_id: str) -> Contexto:
        limite = self.relogio() - timedelta(days=self.cfg["recomendacao"]["janela_recente_dias"])
        externos = self.exposicoes_externas.get(aluno_id, (set(), set()))
        ids, grupos = set(externos[0]), set(externos[1])
        for ap in s.scalars(select(Apresentacao).where(Apresentacao.aluno_id == aluno_id)):
            if _utc(ap.apresentado_em) >= limite or ap.sessao_id == sessao_id:
                ids.add(ap.questao_id)
                grupos.add(ap.grupo_conteudo)
        # itens recomendados nesta sessao (mesmo se ainda nao apresentados) tambem nao se repetem
        q = (select(VersaoItem.questao_id, VersaoItem.grupo_conteudo)
             .join(RecomendacaoItem, RecomendacaoItem.versao_item_id == VersaoItem.versao_id)
             .join(Recomendacao, Recomendacao.id == RecomendacaoItem.recomendacao_id)
             .where(Recomendacao.sessao_id == sessao_id))
        for qid, g in s.execute(q):
            ids.add(qid)
            grupos.add(g)
        estados, ests = self._perfil_atual(s, aluno_id)
        # estatisticas por habilidade: so primeiras tentativas sem ajuda, nao puladas; a chave inclui a area (MT:H21)
        stats = defaultdict(lambda: [0, 0, 0, 0.0, 0])  # n, acertos, n_com_previsao, soma_p, acertos_com_previsao
        q = (select(Tentativa.correta, VersaoItem.habilidade_chave, VersaoItem.area, Tentativa.prob_prevista)
             .join(VersaoItem, Tentativa.versao_item_id == VersaoItem.versao_id)
             .where(Tentativa.aluno_id == aluno_id, Tentativa.tipo == "primeira_sem_ajuda",
                    Tentativa.pulada.is_(False)))
        for correta, hk, area, pp in s.execute(q):
            if hk and hk.startswith(area + ":"):
                stats[hk][0] += 1
                stats[hk][1] += int(bool(correta))
                if pp is not None:
                    stats[hk][2] += 1
                    stats[hk][3] += float(pp)
                    stats[hk][4] += int(bool(correta))
        expo = Counter(dict(s.execute(select(Apresentacao.questao_id, func.count()).group_by(Apresentacao.questao_id)).all()))
        return Contexto(recentes_ids=ids, recentes_grupos=grupos, perfil=estados, estimativas=ests,
                        stats_habilidade={k: tuple(v) for k, v in stats.items()}, exposicao_global=expo,
                        historico=self._historico(s, aluno_id))

    def _historico(self, s: Session, aluno_id: str) -> dict[str, HistoricoArea]:
        """Historico por area usado pela estrategia automatica (somente leitura; nada e apagado ou reescrito)."""
        D, pc = self.cfg["irt"]["D_experimental"], self.cfg["perfil"]
        out: dict[str, HistoricoArea] = {}
        aps = defaultdict(list)
        q = (select(Apresentacao.apresentado_em, VersaoItem.area, VersaoItem.faixa, VersaoItem.habilidade_chave)
             .join(VersaoItem, Apresentacao.versao_item_id == VersaoItem.versao_id)
             .where(Apresentacao.aluno_id == aluno_id).order_by(Apresentacao.apresentado_em, Apresentacao.id))
        for _, area, faixa, hk in s.execute(q):
            aps[area].append((faixa, hk))
        pendentes = defaultdict(list)
        terminada = (select(Tentativa.id).join(Apresentacao, Tentativa.apresentacao_id == Apresentacao.id)
                     .where(Apresentacao.recomendacao_item_id == RecomendacaoItem.id).exists())
        rq = (select(VersaoItem.area, RecomendacaoItem.razao, Recomendacao.perfil_snapshot)
              .join(RecomendacaoItem, RecomendacaoItem.versao_item_id == VersaoItem.versao_id)
              .join(Recomendacao, Recomendacao.id == RecomendacaoItem.recomendacao_id)
              .where(Recomendacao.aluno_id == aluno_id, Recomendacao.modo == "automatico", ~terminada)
              .order_by(Recomendacao.criado_em.desc(), Recomendacao.id.desc(), RecomendacaoItem.posicao.desc()))
        for area, razao, snapshot in s.execute(rq):
            pendentes[area].append((razao or {}, snapshot or {}))
        for area in AREAS:
            ev = self._evidencias_area(s, aluno_id, area)
            traj = trajetoria_status(ev, self.cfg, D)
            p = s.get(Perfil, (aluno_id, area))
            # mesmas tentativas e ordem de _evidencias_area; prob_prevista foi gravada ANTES da resposta
            tq = (select(Tentativa.correta, Tentativa.prob_prevista, Apresentacao.razao)
                  .join(Apresentacao, Apresentacao.id == Tentativa.apresentacao_id)
                  .where(Tentativa.aluno_id == aluno_id, Tentativa.area == area, Tentativa.conta_para_perfil.is_(True))
                  .order_by(Tentativa.enviado_em, Tentativa.id))
            tent = list(s.execute(tq))
            sondagens = 0
            for _, _, razao in reversed(tent):
                if not (razao or {}).get("sondagem_diagnostica"):
                    break
                sondagens += 1
            out[area] = HistoricoArea(
                respostas_validas=[bool(c) for c, _, _ in tent],
                probs_previstas=[None if pp is None else float(pp) for _, pp, _ in tent],
                ja_foi_suficiente=any(n >= pc["min_respostas_validas"] and dp <= pc["dp_max_suficiente"]
                                      for _, dp, n in traj),
                faixas_apresentadas=Counter(f for f, _ in aps[area] if f),
                habilidades_recentes=[h for _, h in aps[area] if h],
                perfil_versao=p.versao if p else 0, sondagens_consecutivas=sondagens,
                sondagens_pendentes=sum(bool(razao.get("sondagem_diagnostica"))
                    for razao, snap in pendentes[area] if snap.get("versao", 0) == (p.versao if p else 0)))
        return out

    def recomendar(self, sessao_id: str, pedido: Pedido, semente: int | None = None) -> dict[str, Any]:
        with self.fabrica.begin() as s:
            ss = s.get(SessaoEstudo, sessao_id)
            if not ss:
                raise ErroServico(404, "sessao nao encontrada")
            ctx = self._contexto(s, ss.aluno_id, sessao_id)
            semente = semente if semente is not None else random.SystemRandom().randrange(2**31)
            res = recomendar(self.cat, pedido, ctx, self.cfg, semente)
            snap = res.perfil_snapshot
            if res.estrategia is not None:  # estrategia decidida fica gravada junto ao snapshot (sem mudar o schema)
                snap = {**(snap or {}), "estrategia_decidida": res.estrategia}
            rec = Recomendacao(sessao_id=sessao_id, aluno_id=ss.aluno_id, politica_versao=self.politica,
                               dataset_sha256=self.dataset_sha, cortes_versao=self.cat.cortes["versao"],
                               modo=pedido.modo, pedido=pedido.como_dict(), status=res.status, limitacao=res.limitacao,
                               funil=res.funil, perfil_snapshot=snap, semente=semente,
                               experimental=res.experimental, criado_em=self.relogio())
            s.add(rec)
            s.flush()
            saida = []
            for pos, sel in enumerate(res.itens):
                ri = RecomendacaoItem(recomendacao_id=rec.id, posicao=pos, versao_item_id=sel.item.versao_id,
                                      prob_prevista=sel.prob_prevista, razao=sel.razao)
                s.add(ri)
                s.flush()
                saida.append({"recomendacao_item_id": ri.id, "posicao": pos, "questao_id": sel.item.id,
                              "versao_id": sel.item.versao_id, "area": sel.item.area, "faixa": sel.item.faixa,
                              "habilidade": sel.item.habilidade_chave, "ano": sel.item.ano,
                              "prob_prevista": None if sel.prob_prevista is None else round(sel.prob_prevista, 4),
                              "razao": sel.razao})
            return {"recomendacao_id": rec.id, "status": res.status, "modo": pedido.modo, "itens": saida,
                    "limitacao": res.limitacao, "funil": res.funil, "experimental": res.experimental,
                    "perfil": res.perfil_snapshot, "estrategia": res.estrategia,
                    "avisos": res.avisos, "politica_versao": self.politica,
                    "cortes_versao": self.cat.cortes["versao"], "dataset_sha256": self.dataset_sha, "semente": semente}

    # ------------------------------------------------------------ apresentacao
    def apresentar(self, recomendacao_item_id: str) -> dict[str, Any]:
        with self.fabrica.begin() as s:
            ri = s.get(RecomendacaoItem, recomendacao_item_id)
            if not ri:
                raise ErroServico(404, "item de recomendacao nao encontrado")
            rec = s.get(Recomendacao, ri.recomendacao_id)
            vi = s.get(VersaoItem, ri.versao_item_id)
            existente = s.scalars(select(Apresentacao).where(Apresentacao.recomendacao_item_id == ri.id)
                                  .order_by(Apresentacao.apresentado_em.desc())).first()
            if existente and not s.scalars(select(Tentativa).where(Tentativa.apresentacao_id == existente.id)).first():
                ap = existente  # reapresentacao idempotente enquanto nao respondida
            else:
                estados, ests = self._perfil_atual(s, rec.aluno_id)
                p_prev = theta = None
                if item_na_escala_adaptativa(vi.formato, vi.tipo_aplicacao, False, self.cfg["irt"]):
                    p_prev = ests[vi.area].prob_esperada(vi.tri_a, vi.tri_b, vi.tri_c, self.cfg["irt"]["D_experimental"])
                    theta = estados[vi.area].theta
                perfil = s.get(Perfil, (rec.aluno_id, vi.area))
                ap = Apresentacao(sessao_id=rec.sessao_id, aluno_id=rec.aluno_id, recomendacao_item_id=ri.id,
                                  versao_item_id=vi.versao_id, questao_id=vi.questao_id, grupo_conteudo=vi.grupo_conteudo,
                                  politica_versao=rec.politica_versao, apresentado_em=self.relogio(),
                                  prob_prevista=p_prev, theta_no_momento=theta,
                                  perfil_versao_no_momento=perfil.versao if perfil else 0, razao=ri.razao)
                s.add(ap)
                s.flush()
            item = self.cat.por_versao.get(vi.versao_id)
            if item is None:
                raise ErroServico(410, "versao do item nao esta mais no catalogo carregado")
            out = {"apresentacao_id": ap.id, "apresentado_em": _utc(ap.apresentado_em).isoformat(),
                   "questao": item.visao_publica(), "politica_versao": ap.politica_versao}
            # lote pendente: o perfil mudou desde o pedido -> o item foi escolhido com informacao antiga
            snap = rec.perfil_snapshot or {}
            if rec.modo in ("automatico", "diagnostico") and "versao" in snap:
                perfil_agora = s.get(Perfil, (rec.aluno_id, vi.area))
                v_agora = perfil_agora.versao if perfil_agora else 0
                out["lote_desatualizado"] = v_agora != snap["versao"]
                if out["lote_desatualizado"]:
                    out["aviso"] = ("O perfil mudou depois deste pedido; peca nova recomendacao para que a estrategia "
                                    "considere as respostas mais recentes.")
            return out

    def apresentar_questao(self, sessao_id: str, questao_id: str) -> dict[str, Any]:
        """Revisao manual de uma questao especifica (ex.: rever um erro). Fica registrada como apresentacao
        sem recomendacao; a resposta sera classificada (repeticao/exposicao) pelo servidor."""
        it = self.cat.itens.get(questao_id)
        if it is None or not it.ofertavel:
            raise ErroServico(404, "questao inexistente ou indisponivel (bloqueada, inelegivel ou triada)")
        with self.fabrica.begin() as s:
            ss = s.get(SessaoEstudo, sessao_id)
            if not ss:
                raise ErroServico(404, "sessao nao encontrada")
            estados, ests = self._perfil_atual(s, ss.aluno_id)
            p_prev = theta = None
            if item_na_escala_adaptativa(it.formato, it.tipo_aplicacao, it.triagem_excluir, self.cfg["irt"]):
                p_prev = ests[it.area].prob_esperada(it.a, it.b, it.c, self.cfg["irt"]["D_experimental"])
                theta = estados[it.area].theta
            perfil = s.get(Perfil, (ss.aluno_id, it.area))
            ap = Apresentacao(sessao_id=sessao_id, aluno_id=ss.aluno_id, recomendacao_item_id=None,
                              versao_item_id=it.versao_id, questao_id=it.id, grupo_conteudo=it.grupo_conteudo,
                              politica_versao=self.politica, apresentado_em=self.relogio(), prob_prevista=p_prev,
                              theta_no_momento=theta, perfil_versao_no_momento=perfil.versao if perfil else 0,
                              razao={"modo": "revisao_manual"})
            s.add(ap)
            s.flush()
            return {"apresentacao_id": ap.id, "apresentado_em": _utc(ap.apresentado_em).isoformat(),
                    "questao": it.visao_publica(), "politica_versao": ap.politica_versao}

    def _ap(self, s: Session, apresentacao_id: str) -> Apresentacao:
        ap = s.get(Apresentacao, apresentacao_id)
        if not ap:
            raise ErroServico(404, "apresentacao nao encontrada")
        return ap

    def registrar_dica(self, apresentacao_id: str) -> dict[str, Any]:
        with self.fabrica.begin() as s:
            ap = self._ap(s, apresentacao_id)
            if s.scalars(select(Tentativa).where(Tentativa.apresentacao_id == ap.id)).first():
                raise ErroServico(409, "apresentacao ja encerrada")
            ap.usou_dica = True
            return {"apresentacao_id": ap.id, "usou_dica": True,
                    "dica": None, "nota": "O catalogo nao possui dicas revisadas; o uso foi apenas registrado."}

    def revelar_gabarito(self, apresentacao_id: str) -> dict[str, Any]:
        with self.fabrica.begin() as s:
            ap = self._ap(s, apresentacao_id)
            vi = s.get(VersaoItem, ap.versao_item_id)
            ap.gabarito_exposto = True
            s.add(ExposicaoGabarito(aluno_id=ap.aluno_id, questao_id=ap.questao_id, grupo_conteudo=ap.grupo_conteudo,
                                    origem="revelacao", apresentacao_id=ap.id, exposto_em=self.relogio()))
            return {"apresentacao_id": ap.id, "gabarito": vi.gabarito,
                    "nota": "Exposicao registrada: respostas futuras a esta questao/variante nao contam para a proficiencia."}

    # ------------------------------------------------------------ resposta
    def responder(self, apresentacao_id: str, alternativa: str, chave_idempotencia: str | None = None,
                  usou_dica: bool = False, tempo_resposta_ms: int | None = None) -> dict[str, Any]:
        alternativa = (alternativa or "").strip().upper()
        if alternativa not in ("A", "B", "C", "D", "E"):
            raise ErroServico(422, "alternativa deve ser A-E")
        for tentativa_n in range(5):
            try:
                return self._responder_tx(apresentacao_id, alternativa, chave_idempotencia, usou_dica, tempo_resposta_ms)
            except (StaleDataError, IntegrityError, OperationalError):
                time.sleep(0.02 * (tentativa_n + 1))
                continue  # concorrencia: refaz a transacao; replay cobre reenvio simultaneo
        raise ErroServico(503, "conflito de concorrencia persistente; tente novamente")

    def _replay(self, t: Tentativa, vi: VersaoItem, alternativa: str | None) -> dict[str, Any]:
        if t.pulada:
            raise ErroServico(409, "apresentacao ja registrada como pulada")
        if alternativa is not None and t.alternativa != alternativa:
            raise ErroServico(409, "resposta diferente ja registrada para esta apresentacao")
        return self._saida_tentativa(t, vi, replay=True, perfil=None)

    def _responder_tx(self, apresentacao_id, alternativa, chave, usou_dica, tempo_ms):
        with self.fabrica.begin() as s:
            ap = self._ap(s, apresentacao_id)
            vi = s.get(VersaoItem, ap.versao_item_id)
            existente = s.scalars(select(Tentativa).where(Tentativa.apresentacao_id == ap.id)).first()
            if existente:
                return self._replay(existente, vi, alternativa)
            if chave:
                outra = s.scalars(select(Tentativa).where(Tentativa.chave_idempotencia == chave,
                                                          Tentativa.aluno_id == ap.aluno_id)).first()
                if outra:
                    raise ErroServico(409, "chave de idempotencia ja usada em outra apresentacao")
            agora_ = self.relogio()
            ja_respondeu = s.scalars(
                select(Tentativa.id).join(Apresentacao, Apresentacao.id == Tentativa.apresentacao_id)
                .where(Tentativa.aluno_id == ap.aluno_id, Tentativa.pulada.is_(False),
                       Apresentacao.grupo_conteudo == ap.grupo_conteudo)).first() is not None
            exposto = ap.gabarito_exposto or s.scalars(
                select(ExposicaoGabarito.id).where(ExposicaoGabarito.aluno_id == ap.aluno_id,
                                                   ExposicaoGabarito.grupo_conteudo == ap.grupo_conteudo)).first() is not None
            dica = bool(usou_dica or ap.usou_dica)
            tipo = classificar_tentativa(ja_respondeu, exposto, dica)
            na_escala = item_na_escala_adaptativa(vi.formato, vi.tipo_aplicacao, False, self.cfg["irt"])
            peso, motivo = peso_e_motivo(tipo, na_escala, self.cfg["perfil"])
            correta = alternativa == vi.gabarito  # correcao no servidor, com o gabarito da versao apresentada
            t = Tentativa(apresentacao_id=ap.id, chave_idempotencia=chave, aluno_id=ap.aluno_id, sessao_id=ap.sessao_id,
                          versao_item_id=vi.versao_id, questao_id=vi.questao_id, area=vi.area, pulada=False,
                          alternativa=alternativa, correta=correta, tipo=tipo,
                          primeira_tentativa=tipo in ("primeira_sem_ajuda", "primeira_com_dica"),
                          usou_dica=dica, gabarito_exposto_antes=exposto, peso_perfil=peso, conta_para_perfil=peso > 0,
                          motivo_nao_conta=motivo, prob_prevista=ap.prob_prevista,
                          tempo_resposta_ms=tempo_ms, enviado_em=agora_, politica_versao=ap.politica_versao)
            s.add(t)
            s.flush()  # UNIQUE(apresentacao_id) dispara aqui em envio concorrente
            s.add(ExposicaoGabarito(aluno_id=ap.aluno_id, questao_id=ap.questao_id, grupo_conteudo=ap.grupo_conteudo,
                                    origem="correcao", apresentacao_id=ap.id, exposto_em=agora_))
            perfil = self._atualizar_perfil(s, ap.aluno_id, vi.area, t.id) if t.conta_para_perfil else s.get(Perfil, (ap.aluno_id, vi.area))
            return self._saida_tentativa(t, vi, replay=False, perfil=perfil)

    def _saida_tentativa(self, t: Tentativa, vi: VersaoItem, replay: bool, perfil: Perfil | None) -> dict[str, Any]:
        out = {"tentativa_id": t.id, "apresentacao_id": t.apresentacao_id, "versao_id": t.versao_item_id,
               "replay_idempotente": replay, "pulada": t.pulada, "tipo": t.tipo,
               "primeira_tentativa": t.primeira_tentativa, "usou_dica": t.usou_dica,
               "gabarito_exposto_antes": t.gabarito_exposto_antes,
               "conta_para_perfil": t.conta_para_perfil, "motivo_nao_conta": t.motivo_nao_conta,
               "prob_prevista_antes": t.prob_prevista, "politica_versao": t.politica_versao,
               "enviado_em": _utc(t.enviado_em).isoformat()}
        if not t.pulada:
            out.update({"alternativa": t.alternativa, "correta": t.correta, "gabarito": vi.gabarito})
        if perfil is not None:
            out["perfil_area"] = {"area": perfil.area, "theta": perfil.theta, "dp": perfil.dp,
                                  "n_evidencias": perfil.n_evidencias, "status": perfil.status,
                                  "versao": perfil.versao, "experimental": perfil.experimental}
        return out

    def pular(self, apresentacao_id: str) -> dict[str, Any]:
        for _ in range(3):
            try:
                with self.fabrica.begin() as s:
                    ap = self._ap(s, apresentacao_id)
                    vi = s.get(VersaoItem, ap.versao_item_id)
                    existente = s.scalars(select(Tentativa).where(Tentativa.apresentacao_id == ap.id)).first()
                    if existente:
                        if not existente.pulada:
                            raise ErroServico(409, "apresentacao ja respondida")
                        return self._saida_tentativa(existente, vi, replay=True, perfil=None)
                    t = Tentativa(apresentacao_id=ap.id, aluno_id=ap.aluno_id, sessao_id=ap.sessao_id,
                                  versao_item_id=vi.versao_id, questao_id=vi.questao_id, area=vi.area, pulada=True,
                                  alternativa=None, correta=None, tipo="pulada", primeira_tentativa=False,
                                  usou_dica=ap.usou_dica, gabarito_exposto_antes=ap.gabarito_exposto, peso_perfil=0.0,
                                  conta_para_perfil=False, motivo_nao_conta="pulada_nao_e_erro",
                                  prob_prevista=ap.prob_prevista, enviado_em=self.relogio(),
                                  politica_versao=ap.politica_versao)
                    s.add(t)
                    s.flush()
                    return self._saida_tentativa(t, vi, replay=False, perfil=None)
            except (IntegrityError, OperationalError):
                time.sleep(0.02)
                continue
        raise ErroServico(503, "conflito de concorrencia persistente")

    # ------------------------------------------------------------ progresso
    def progresso(self, aluno_id: str) -> dict[str, Any]:
        with self.fabrica() as s:
            if not s.get(Aluno, aluno_id):
                raise ErroServico(404, "aluno nao encontrado")
            estados, _ = self._perfil_atual(s, aluno_id)
            por_area = {}
            for area in AREAS:
                ts = list(s.scalars(select(Tentativa).where(Tentativa.aluno_id == aluno_id, Tentativa.area == area)))
                tipos = Counter(t.tipo for t in ts)
                prim = [t for t in ts if t.tipo == "primeira_sem_ajuda"]
                p = s.get(Perfil, (aluno_id, area))
                por_area[area] = {
                    "perfil": {**estados[area].como_dict(), "versao": p.versao if p else 0,
                               "nota": "Estimativa experimental (D nao confirmado; escala nao verificada)."},
                    "tentativas_por_tipo": dict(tipos),
                    "primeira_sem_ajuda": {"n": len(prim), "acertos": sum(1 for t in prim if t.correta)},
                    "puladas": tipos.get("pulada", 0),
                }
            return {"aluno_id": aluno_id, "por_area": por_area, "politica_versao": self.politica,
                    "nota": "Proficiencias sao separadas por area; nao ha proficiencia unica agregada."}

    # ------------------------------------------------------------ exportacao
    def exportar_interacoes(self, origem: str = "real", metadados: dict[str, Any] | None = None,
                            aluno_id: str | None = None) -> list[dict[str, Any]]:
        """Exporta tentativas no formato documentado em docs/FORMATO_INTERACOES.md.

        `metadados` (ex.: participante, coleta, condicao_resposta, teste_controlado) e copiado para cada linha;
        separa a identidade/origem da coleta da condicao em que a resposta foi dada."""
        with self.fabrica() as s:
            q = (select(Tentativa, Apresentacao).join(Apresentacao, Apresentacao.id == Tentativa.apresentacao_id)
                 .order_by(Tentativa.enviado_em, Tentativa.id))
            if aluno_id is not None:
                q = q.where(Tentativa.aluno_id == aluno_id)
            out = []
            for t, ap in s.execute(q):
                out.append({"origem": origem, "aluno_id": t.aluno_id, "sessao_id": t.sessao_id,
                            "apresentacao_id": t.apresentacao_id, "questao_id": t.questao_id,
                            "versao_id": t.versao_item_id, "area": t.area, "apresentado_em": _utc(ap.apresentado_em).isoformat(),
                            "enviado_em": _utc(t.enviado_em).isoformat(), "alternativa": t.alternativa, "correta": t.correta,
                            "pulada": t.pulada, "tipo": t.tipo, "usou_dica": t.usou_dica,
                            "gabarito_exposto_antes": t.gabarito_exposto_antes, "prob_prevista": t.prob_prevista,
                            "politica_versao": t.politica_versao, "tempo_resposta_ms": t.tempo_resposta_ms,
                            "estrategia": (ap.razao or {}).get("estrategia") or (ap.razao or {}).get("modo"),
                            **(metadados or {})})
            return out
