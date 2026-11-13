"""Politica de recomendacao (funcoes puras; sem acesso a banco).

Fluxo: 1) candidatos validos  2) area/lingua/formato/nivel  3) exposicao recente e familia
4) compatibilidade de desafio  5) habilidade/revisao/objetivo com evidencia  6) diversificacao  7) razao.

Contratos:
  * `nivel`       nunca troca o nivel pedido nem relaxa bloqueios: falta de candidatos vira limitacao explicita.
  * `adaptativo`  contrato ESTRITO: exige perfil suficiente e so entrega itens na faixa-alvo de probabilidade.
  * `diagnostico` cobertura de faixas para aluno novo; com historico, diagnostico direcionado ao posterior.
  * `automatico`  politica com alternativas explicitas (ver estrategia.py): diagnostico inicial/direcionado,
                  reforco ou adaptativo; sem candidatos na faixa-alvo, entrega os mais proximos dela com a
                  probabilidade real e `na_faixa_alvo=false`. Filtros de qualidade, bloqueios, area, lingua,
                  formato, grupo de escala, exposicao recente e unicidade de grupo nunca sao relaxados.
"""
from __future__ import annotations

import random
from collections import Counter
from dataclasses import dataclass, field
from typing import Any

from .catalogo import Catalogo, Item
from .estrategia import Decisao, HistoricoArea, decidir_estrategia, habilidades_com_dificuldade
from .perfil import EstadoPerfil, estimar_perfil_area, item_na_escala_adaptativa
from .psicometria import FAIXAS, EstimativaTheta, ganho_informacao_esperado

MODOS = ("nivel", "adaptativo", "diagnostico", "aleatorio", "automatico")


@dataclass
class Pedido:
    modo: str
    area: str
    quantidade: int
    lingua: str = "pt"
    dificuldade: str | None = None
    formatos: list[str] | None = None
    habilidade: str | None = None
    objetivo: str = "pratica"  # pratica | revisao
    aceitar_experimental: bool = False

    def como_dict(self) -> dict[str, Any]:
        return dict(self.__dict__)


@dataclass
class Contexto:
    """Estado do aluno usado pela politica (somente informacao anterior ao pedido)."""
    recentes_ids: set[str] = field(default_factory=set)
    recentes_grupos: set[str] = field(default_factory=set)
    perfil: dict[str, EstadoPerfil] = field(default_factory=dict)
    estimativas: dict[str, EstimativaTheta] = field(default_factory=dict)
    stats_habilidade: dict[str, tuple] = field(default_factory=dict)  # chave -> (n, acertos[, n_p, soma_p, acertos_p])
    exposicao_global: Counter = field(default_factory=Counter)
    historico: dict[str, HistoricoArea] = field(default_factory=dict)


@dataclass
class Selecionado:
    item: Item
    prob_prevista: float | None
    razao: dict[str, Any]


@dataclass
class Resultado:
    status: str
    itens: list[Selecionado]
    funil: dict[str, int]
    limitacao: dict[str, Any] | None
    experimental: bool
    perfil_snapshot: dict[str, Any] | None
    avisos: list[str]
    estrategia: dict[str, Any] | None = None


def _erro(status: str, msg: str, funil=None, **extra) -> Resultado:
    return Resultado(status=status, itens=[], funil=funil or {}, limitacao={"motivo": msg, **extra},
                     experimental=False, perfil_snapshot=None, avisos=[])


def validar_pedido(p: Pedido, cfg: dict[str, Any]) -> str | None:
    if p.modo not in MODOS:
        return f"modo invalido: {p.modo}"
    if p.area not in ("CH", "CN", "LC", "MT"):
        return f"area invalida: {p.area} (as quatro areas nao sao misturadas)"
    if p.lingua not in ("pt", "en", "es"):
        return f"lingua invalida: {p.lingua}"
    if not (1 <= p.quantidade <= cfg["recomendacao"]["quantidade_max"]):
        return f"quantidade deve estar entre 1 e {cfg['recomendacao']['quantidade_max']}"
    if p.modo == "nivel" and p.dificuldade not in FAIXAS:
        return "modo nivel exige dificuldade em {facil, media, dificil}"
    if p.modo == "automatico" and p.dificuldade is not None:
        return "dificuldade so pode ser usada no modo nivel (o automatico nao altera nem reinterpreta o nivel manual)"
    if p.objetivo not in ("pratica", "revisao"):
        return "objetivo deve ser pratica ou revisao"
    return None


def _gap_faixa(p: float, lo: float, hi: float) -> float:
    return max(0.0, lo - p, p - hi)


def _direcao_alternativa(p: float, lo: float, hi: float) -> str:
    return "mais_desafiador" if p < lo else "mais_acessivel" if p > hi else "na_faixa"


def recomendar(cat: Catalogo, p: Pedido, ctx: Contexto, cfg: dict[str, Any], semente: int) -> Resultado:
    msg = validar_pedido(p, cfg)
    if msg:
        return _erro("pedido_invalido", msg)
    rc, irt, ca = cfg["recomendacao"], cfg["irt"], cfg["automatico"]
    rng = random.Random(semente)
    avisos: list[str] = []
    funil: dict[str, int] = {}

    # 1) candidatos validos (elegivel, nao bloqueado, schema/midia ok, sem alerta grave, com faixa pos-triagem)
    cand = cat.ofertaveis()
    funil["validos"] = len(cand)
    # 2) filtros do pedido
    cand = [it for it in cand if it.area == p.area]
    funil["area"] = len(cand)
    cand = [it for it in cand if it.lingua == p.lingua]
    funil["lingua"] = len(cand)
    if p.formatos:
        cand = [it for it in cand if it.formato in p.formatos]
    funil["formato"] = len(cand)
    if p.habilidade:
        cand = [it for it in cand if it.habilidade_chave == p.habilidade]
    funil["habilidade"] = len(cand)

    experimental = False
    perfil_snap = None
    prob: dict[str, float] = {}
    info: dict[str, float] = {}
    decisao: Decisao | None = None
    estado = ctx.perfil.get(p.area)
    hist = ctx.historico.get(p.area)
    D = irt["D_experimental"]
    lo, hi = rc["faixa_prob_alvo"]
    fallback: str | None = None  # direcao da alternativa fora da faixa
    estrategia = None  # estrategia efetiva (diagnostico/automatico)

    if p.modo == "nivel":
        cand = [it for it in cand if it.faixa == p.dificuldade]
        funil["nivel"] = len(cand)
    elif p.modo in ("adaptativo", "diagnostico", "automatico"):
        if p.modo in ("adaptativo", "automatico") and not p.aceitar_experimental:
            return _erro("adaptativo_indisponivel",
                         f"Modo {p.modo} experimental: a constante D e a comparabilidade de escala nao foram confirmadas "
                         "na documentacao local. Envie aceitar_experimental=true para usa-lo ou use o modo nivel.", funil)
        cand = [it for it in cand if item_na_escala_adaptativa(it.formato, it.tipo_aplicacao, it.triagem_excluir, irt)]
        funil["grupo_escala"] = len(cand)
        perfil_snap = estado.como_dict() if estado else None
        if hist is not None and perfil_snap is not None:
            perfil_snap["versao"] = hist.perfil_versao
        est = ctx.estimativas.get(p.area)
        if est is None:  # contexto sem perfil calculado: usa o prior (aluno sem historico)
            estado, est = estimar_perfil_area(p.area, [], cfg)
            perfil_snap = perfil_snap or estado.como_dict()
        if p.modo == "adaptativo":
            experimental = True
            if not estado or estado.status != "suficiente":
                return Resultado(
                    status="perfil_insuficiente", itens=[], funil=funil,
                    limitacao={"motivo": "Historico insuficiente para estimar a proficiencia nesta area.",
                               "perfil": perfil_snap,
                               "minimo_respostas_validas": cfg["perfil"]["min_respostas_validas"],
                               "dp_max": cfg["perfil"]["dp_max_suficiente"],
                               "opcoes": ["automatico (reforco ou diagnostico direcionado)",
                                          "nivel (escolha manual de dificuldade)", "diagnostico"]},
                    experimental=True, perfil_snapshot=perfil_snap, avisos=[])
            for it in cand:
                prob[it.id] = est.prob_esperada(it.a, it.b, it.c, D)
            cand = [it for it in cand if lo <= prob[it.id] <= hi]
            funil["faixa_probabilidade"] = len(cand)
            avisos.append(rc["nota_faixa"])
        else:
            decisao = decidir_estrategia(estado, hist, cfg, modo=p.modo)
            estrategia = decisao.estrategia
            experimental = estrategia != "diagnostico_inicial" or p.modo == "automatico"
            for it in cand:
                prob[it.id] = est.prob_esperada(it.a, it.b, it.c, D)
                info[it.id] = ganho_informacao_esperado(est, it.a, it.b, it.c, D)
    # aleatorio: apenas os filtros 1-2 (linha de base para avaliacao)

    # 3) exposicao recente e familia
    cand = [it for it in cand if it.id not in ctx.recentes_ids and it.grupo_conteudo not in ctx.recentes_grupos]
    funil["sem_exposicao_recente"] = len(cand)

    # Apos conhecer o ponto de partida, nao transforma falta de estoque acessivel em uma sequencia
    # automatica de itens quase impossiveis. O nivel pedido manualmente e o diagnostico explicito continuam livres.
    adequacao = None
    sondagens_ids: set[str] = set()
    limite_sondagens = p.quantidade
    if p.modo == "automatico" and estrategia != "diagnostico_inicial":
        minimo = ca["adequacao"]["prob_minima_apos_cobertura"]
        disponiveis = len(cand)
        melhor_prob = max((prob[it.id] for it in cand), default=None)
        melhor_info = max((info[it.id] for it in cand), default=None)
        disponiveis_antes = cand
        cand = [it for it in cand if prob[it.id] >= minimo]
        funil["adequacao_ao_perfil"] = len(cand)
        adequacao = {"prob_minima": minimo, "candidatos_antes": disponiveis,
                     "candidatos_adequados": len(cand), "maior_prob_disponivel": melhor_prob,
                     "maior_ganho_informacao_nats": melhor_info,
                     "criterio": "acessibilidade_no_perfil_atual", "experimental": True}
        # Um corte de acessibilidade nao deve encerrar um diagnostico incerto por poucos pontos percentuais.
        # A excecao exige informacao util e tem orcamento persistente: nao vira fallback ilimitado.
        cs = ca["adequacao"]["sondagem_diagnostica"]
        respondidas = hist.sondagens_consecutivas if hist else 0
        pendentes = hist.sondagens_pendentes if hist else 0
        usadas = respondidas + pendentes
        restantes = max(0, cs["max_consecutivas"] - usadas)
        sondagens = [it for it in disponiveis_antes if prob[it.id] >= cs["prob_minima"]
                     and info[it.id] >= cs["ganho_informacao_minimo_nats"]]
        adequacao["sondagem"] = {"ativa": False, "respondidas_consecutivas": respondidas,
            "pendentes": pendentes, "orcamento_restante": restantes, "max_consecutivas": cs["max_consecutivas"],
            "candidatos_informativos": len(sondagens)}
        perfil_incerto = estado is not None and estado.status != "suficiente"
        if not cand and perfil_incerto and estrategia in ("diagnostico_direcionado", "reforco") and restantes:
            if sondagens:
                cand = sondagens
                sondagens_ids = {it.id for it in sondagens}
                limite_sondagens = min(p.quantidade, restantes)
                funil["sondagem_diagnostica"] = len(sondagens)
                adequacao["sondagem"].update({"ativa": True, "prob_minima": cs["prob_minima"],
                    "ganho_minimo_nats": cs["ganho_informacao_minimo_nats"],
                    "orcamento_restante": restantes, "max_consecutivas": cs["max_consecutivas"]})
                avisos.append("Sondagem diagnostica limitada: nao ha itens no limite usual de acessibilidade; "
                              "a questao esta proxima dele e pode informar sobre o perfil ainda incerto.")

    # 4b) automatico com faixa-alvo (reforco/adaptativo): faixa estrita; sem candidatos -> alternativa explicita
    if estrategia in ("reforco", "adaptativo"):
        na_faixa = [it for it in cand if lo <= prob[it.id] <= hi]
        funil["faixa_probabilidade"] = len(na_faixa)
        if len(na_faixa) >= p.quantidade or not ca["alternativa_fora_da_faixa"]["ativa"]:
            cand = na_faixa
        else:
            # completa com os mais proximos da faixa (mesmos filtros), sem marcar como cumprindo a faixa
            fora = [it for it in cand if not (lo <= prob[it.id] <= hi)]
            cand = na_faixa + fora
            funil["alternativa_fora_da_faixa"] = len(fora)

    # 5) prioridade por habilidade somente com evidencia minima
    hab_revisao: set[str] = set()
    hab_auto: dict[str, dict[str, Any]] = {}
    if p.objetivo == "revisao":
        for k, v in ctx.stats_habilidade.items():
            n, ac = v[0], v[1]
            if k and k.startswith(p.area + ":") and n >= rc["revisao_min_respostas_habilidade"] \
                    and ac / n <= rc["revisao_acuracia_max"]:
                hab_revisao.add(k)
        if not hab_revisao:
            avisos.append("objetivo revisao sem evidencia confiavel por habilidade; nenhuma prioridade aplicada")
    if p.modo == "automatico" and ca["revisao_automatica"]["ativa"] and not p.habilidade:
        hab_auto = habilidades_com_dificuldade(ctx.stats_habilidade, p.area, hist, ca["revisao_automatica"])
        disponiveis = {it.habilidade_chave for it in cand}
        hab_auto = {k: v for k, v in hab_auto.items() if k in disponiveis}  # nunca inventa habilidade ausente

    # 4) pontuacao base de compatibilidade
    max_info = max((info.get(it.id, 0.0) for it in cand), default=0.0) or 1.0
    base: dict[str, float] = {}
    jitter = ca["jitter"] if estrategia else rc["jitter"]
    for it in cand:
        if p.modo == "adaptativo":
            centro, meia = (lo + hi) / 2, (hi - lo) / 2
            s = 1.0 - abs(prob[it.id] - centro) / meia
        elif estrategia == "diagnostico_inicial":
            s = info[it.id] / max_info  # dentro de cada faixa, o item mais informativo para o posterior atual
        elif estrategia == "diagnostico_direcionado":
            cd = ca["diagnostico_direcionado"]
            gap = _gap_faixa(prob[it.id], cd["prob_min_acessivel"], cd["prob_max_acessivel"])
            s = info[it.id] / max_info - cd["peso_acessibilidade"] * gap / 0.1
        elif estrategia in ("reforco", "adaptativo"):
            centro, meia = (lo + hi) / 2, (hi - lo) / 2
            c_aj = min(hi, max(lo, centro + decisao.ajuste_centro))
            gap = _gap_faixa(prob[it.id], lo, hi)
            if gap == 0:
                # centro compativel com o nivel estimado; deslocado gradualmente (sempre dentro da faixa)
                # apenas quando ha evidencia consistente de desempenho diferente do previsto
                s = 1.0 - abs(prob[it.id] - c_aj) / meia
            else:
                # sempre abaixo de qualquer item dentro da faixa; 1 p.p. de distancia = 0,5 ponto, de modo que
                # bonus de habilidade e jitter so desempatam itens quase igualmente proximos da faixa
                # O mesmo ajuste gradual participa tambem da alternativa: abaixo do centro prefere mais
                # desafio; acima prefere acessibilidade. Com ajuste zero equivale a distancia anterior.
                gap_ajustado = max(0.0, abs(prob[it.id] - c_aj) - meia)
                s = -1.0 - gap_ajustado / 0.02
            s += ca["peso_informacao"] * info[it.id] / max_info
        else:
            s = 0.0
        s -= rc["peso_exposicao_global"] * ctx.exposicao_global.get(it.id, 0)
        if it.habilidade_chave in hab_revisao:
            s += rc["bonus_revisao"]
        if it.habilidade_chave in hab_auto:
            s += ca["revisao_automatica"]["bonus"]
        s += jitter * rng.random()
        base[it.id] = s
    ordem = sorted(cand, key=lambda it: (-base[it.id], it.id))

    # 6) diversificacao gulosa (um item por grupo de conteudo; penaliza habilidade/ano/topico repetidos)
    escolhidos: list[Item] = []
    grupos, hab, anos, top, fx = set(), Counter(), Counter(), Counter(), Counter()
    cobertura = estrategia == "diagnostico_inicial"
    fx_hist = hist.faixas_apresentadas if (hist and cobertura) else Counter()
    na_faixa_ids = {it.id for it in cand if estrategia in ("reforco", "adaptativo") and lo <= prob[it.id] <= hi}
    while len(escolhidos) < limite_sondagens:
        melhor, melhor_s = None, None
        for it in ordem:
            if it.grupo_conteudo in grupos:
                continue
            s = base[it.id]
            if it.habilidade_chave:
                s -= rc["penalidade_mesma_habilidade"] * hab[it.habilidade_chave]
            s -= rc["penalidade_mesmo_ano"] * anos[it.ano]
            if it.topico_regra:
                s -= rc["penalidade_mesmo_topico_regra"] * top[it.topico_regra]
            if cobertura:
                s -= 10.0 * (fx[it.faixa] + fx_hist.get(it.faixa, 0))  # distribui entre as faixas
            if na_faixa_ids and it.id in na_faixa_ids:
                s += 100.0  # diversificar nunca troca um item na faixa-alvo por um fora dela
            if melhor_s is None or s > melhor_s:
                melhor, melhor_s = it, s
        if melhor is None:
            break
        escolhidos.append(melhor)
        grupos.add(melhor.grupo_conteudo)
        hab[melhor.habilidade_chave] += 1
        anos[melhor.ano] += 1
        top[melhor.topico_regra] += 1
        fx[melhor.faixa] += 1
    funil["selecionados"] = len(escolhidos)

    # 7) razao registrada
    sel = []
    for pos, it in enumerate(escolhidos):
        razao: dict[str, Any] = {
            "modo": p.modo, "posicao": pos, "area": it.area, "lingua": it.lingua, "formato": it.formato,
            "faixa": it.faixa, "tri_b": it.b, "cortes_versao": cat.cortes["versao"],
            "criterios": ["valido", "filtros_do_pedido", "sem_exposicao_recente", "grupo_conteudo_unico_no_lote"],
        }
        if p.modo == "nivel":
            razao["criterios"].append(f"faixa_pedida={p.dificuldade}")
        if it.id in sondagens_ids:
            razao["sondagem_diagnostica"] = True
            razao["criterios"].append("excecao_limitada_acessibilidade_com_ganho_de_informacao")
        if p.modo == "adaptativo":
            razao["criterios"].append("prob_prevista_na_faixa_alvo")
            razao["prob_prevista"] = round(prob[it.id], 4)
            razao["faixa_prob_alvo"] = rc["faixa_prob_alvo"]
            razao["na_faixa_alvo"] = True
            razao["theta"] = perfil_snap["theta"] if perfil_snap else None
            razao["experimental"] = True
        if estrategia:
            razao["estrategia"] = estrategia
            razao["prob_prevista"] = round(prob[it.id], 4)
            razao["ganho_informacao_nats"] = round(info[it.id], 5)
            razao["theta"] = perfil_snap["theta"] if perfil_snap else None
            razao["dp"] = perfil_snap["dp"] if perfil_snap else None
            razao["experimental"] = experimental
            if estrategia == "diagnostico_inicial":
                razao["criterios"] += ["diagnostico_distribuido_entre_faixas", "maior_ganho_de_informacao_na_faixa"]
            elif estrategia == "diagnostico_direcionado":
                razao["criterios"] += ["ganho_de_informacao_no_posterior_atual", "preferencia_por_itens_acessiveis"]
            else:
                dentro = lo <= prob[it.id] <= hi
                razao["faixa_prob_alvo"] = rc["faixa_prob_alvo"]
                razao["na_faixa_alvo"] = dentro
                if dentro:
                    razao["criterios"].append("prob_prevista_na_faixa_alvo")
                else:
                    razao["criterios"].append(f"alternativa_fora_da_faixa:{_direcao_alternativa(prob[it.id], lo, hi)}")
                    razao["distancia_da_faixa"] = round(_gap_faixa(prob[it.id], lo, hi), 4)
        if it.habilidade_chave in hab_revisao:
            razao["criterios"].append(f"revisao_habilidade={it.habilidade_chave}")
        if it.habilidade_chave in hab_auto:
            razao["criterios"].append(f"prioridade_habilidade_com_dificuldade={it.habilidade_chave}")
            razao["habilidade_priorizada"] = hab_auto[it.habilidade_chave]
        if p.modo == "aleatorio":
            razao["criterios"].append("sorteio_entre_validos")
        sel.append(Selecionado(item=it, prob_prevista=prob.get(it.id), razao=razao))

    limitacao = None
    if len(sel) == 0:
        status = "sem_candidatos"
    elif len(sel) < p.quantidade:
        status = "parcial"
    else:
        status = "ok"
    if status != "ok":
        ultimo = next((k for k in funil if k not in ("selecionados", "alternativa_fora_da_faixa")
                       and funil[k] < p.quantidade), "diversificacao_por_grupo")
        limitacao = {"motivo": "Candidatos insuficientes para o pedido; nenhum filtro, nivel ou bloqueio foi relaxado.",
                     "solicitado": p.quantidade, "entregue": len(sel), "funil": funil, "etapa_mais_restritiva": ultimo}
        if p.modo == "automatico":
            limitacao["opcoes"] = ["nivel facil/media/dificil (escolha manual)", "outra area"]
    if adequacao is not None and len(sel) < p.quantidade and adequacao["candidatos_adequados"] < p.quantidade:
        estoque = adequacao["candidatos_antes"]
        sondagem = adequacao["sondagem"]
        causa = ("limite_de_sondagens" if sondagem["orcamento_restante"] == 0 and sondagem["candidatos_informativos"]
                 else "fora_dos_criterios_de_adequacao" if estoque else "estoque_esgotado_apos_filtros")
        motivo = (f"Restam {estoque} questoes apos os filtros. Nao ha itens suficientes nos criterios automaticos "
                  f"para seu perfil atual ({causa}). "
                  "Use continuar para explorar questoes fora desses criterios, ou erros para praticar revisao.")
        limitacao = {**(limitacao or {}), "motivo": motivo, "tipo": "catalogo_insuficiente_para_perfil",
                     "causa": causa, "estoque_restante": estoque,
                     "adequacao": adequacao,
                     "opcoes": ["continuar (diagnostico exploratorio explicito, com chances reais visiveis)",
                                "rever questoes anteriores (pratica; repeticoes nao atualizam o nivel)",
                                "outra area", "ampliar o catalogo de questoes calibradas",
                                "nivel facil/media/dificil (escolha manual)"]}

    estr_out = None
    if decisao is not None:
        estr_out = decisao.como_dict()
        estr_out["modo_pedido"] = p.modo
        if adequacao is not None:
            estr_out["adequacao_catalogo"] = adequacao
        fora = [s for s in sel if s.razao.get("na_faixa_alvo") is False]
        if estrategia in ("reforco", "adaptativo"):
            estr_out["faixa_prob_alvo"] = rc["faixa_prob_alvo"]
            estr_out["centro_desafio"] = round(min(hi, max(lo, (lo + hi) / 2 + decisao.ajuste_centro)), 4)
            estr_out["faixa_alvo_cumprida"] = bool(sel) and not fora
            if fora:
                probs = [round(s.prob_prevista, 4) for s in fora]
                direcoes = {_direcao_alternativa(s.prob_prevista, lo, hi) for s in fora}
                fallback = next(iter(direcoes)) if len(direcoes) == 1 else "mista"
                txt = (f"Nao ha questoes disponiveis suficientes com chance prevista entre {lo:.0%} e {hi:.0%}. "
                       f"Entreguei alternativas fora da faixa ({fallback}), "
                       f"com chance estimada de {', '.join(f'{x:.0%}' for x in probs)}. "
                       "A faixa-alvo NAO foi cumprida.")
                estr_out["alternativa"] = {
                    "tipo": "mais_proximo_da_faixa", "direcao": fallback, "motivo": txt,
                    "itens_fora_da_faixa": len(fora), "prob_prevista_dos_itens_fora": probs}
                aviso = {"tipo": "fora_da_faixa_alvo", "motivo_faixa": txt, "faixa_prob_alvo": rc["faixa_prob_alvo"],
                         "prob_prevista_entregue": probs, "funil": funil}
                limitacao = {**limitacao, **aviso} if limitacao else {"motivo": txt, **aviso}
            avisos.append(rc["nota_faixa"])
        else:
            estr_out["faixa_alvo_cumprida"] = None  # diagnostico nao promete faixa de probabilidade
        if hab_auto:
            estr_out["habilidades_priorizadas"] = list(hab_auto.values())
        estr_out["reavaliar_apos_cada_resposta"] = True
        if p.modo == "automatico" and p.quantidade > 1:
            avisos.append("automatico reavalia a estrategia a cada pedido; para seguir a evolucao do perfil, "
                          "peca quantidade=1 ou descarte itens com lote_desatualizado=true na apresentacao")
    return Resultado(status=status, itens=sel, funil=funil, limitacao=limitacao, experimental=experimental,
                     perfil_snapshot=perfil_snap, avisos=avisos, estrategia=estr_out)
