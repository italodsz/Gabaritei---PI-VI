"""Decisao central da estrategia automatica (funcao pura; usada por servico, API, terminal e simulador).

O modo `automatico` escolhe, a cada pedido, UMA estrategia explicita a partir do perfil e do historico da area:

  diagnostico_inicial      aluno sem historico (ou com poucas respostas validas): cobertura das faixas
                           facil/media/dificil; dentro de cada faixa, maior ganho de informacao esperado.
  diagnostico_direcionado  ha historico, mas o perfil ainda e insuficiente: perguntas que mais informam sobre
                           o nivel ATUAL (informacao mutua no posterior), com preferencia por itens acessiveis.
  reforco                  ha historico e evidencia CONSISTENTE de desempenho abaixo do previsto (ou, se
                           `ativar_se_ja_foi_suficiente` estiver ligado, o perfil voltou a ficar insuficiente).
                           Por padrao, perfil que volta a ficar incerto usa diagnostico_direcionado.
                           Continua com questoes compativeis com o nivel estimado (faixa-alvo), sem voltar a
                           distribuicao geral de faceis/medias/dificeis.
  adaptativo               perfil suficiente: faixa-alvo de probabilidade.

Erros sao eventos esperados: com chance prevista de 70%, cerca de 3 em cada 10 respostas sao erros. Por isso
o reforco NAO e acionado pela contagem de erros recentes. A regra compara o observado com o previsto nas
ultimas respostas (probabilidades registradas ANTES de cada resposta):

    z = (acertos_observados - soma(p)) / sqrt(soma(p * (1 - p)))

So |z| >= z_limite, com um minimo de respostas, conta como evidencia consistente de mudanca. Nesse caso o
centro do desafio dentro da faixa-alvo se desloca GRADUALMENTE (passo pequeno, limitado), para baixo se o
aluno rende acima do previsto e para cima (mais acessivel) se rende abaixo. O desafio nunca sai da faixa-alvo
por esse ajuste; o theta continua sendo atualizado apenas pelo EAP.

Quando reforco/adaptativo nao encontra candidato na faixa-alvo, o recomendador usa a alternativa explicita
`mais_proximo_da_faixa` (registrada; a probabilidade real e informada e o item NAO e marcado como dentro da faixa).
Nada aqui altera o posterior, o desvio padrao, os limites de perfil ou o historico.
"""
from __future__ import annotations

import math
from collections import Counter
from dataclasses import dataclass, field
from typing import Any

from .perfil import EstadoPerfil

ESTRATEGIAS = ("diagnostico_inicial", "diagnostico_direcionado", "reforco", "adaptativo")

EXPLICACOES = {
    "diagnostico_inicial": "Ainda ha poucas respostas nesta area. As primeiras questoes cobrem as faixas facil, media "
                           "e dificil para conhecer seu ponto de partida.",
    "diagnostico_direcionado": "O perfil ainda tem incerteza alta. Escolho questoes que mais informam sobre o seu nivel "
                               "estimado agora, evitando questoes muito distantes dele.",
    "reforco": "Seu desempenho recente ficou consistentemente abaixo do previsto, ou o perfil voltou a ficar incerto. "
               "Em vez de recomecar o diagnostico geral, sigo com questoes compativeis com o seu nivel estimado, "
               "usando todo o historico.",
    "adaptativo": "O perfil esta suficiente. Escolho questoes com chance prevista de acerto na faixa-alvo.",
}


@dataclass
class HistoricoArea:
    """Informacao anterior ao pedido, por area (somente leitura)."""
    respostas_validas: list[bool] = field(default_factory=list)  # acertos que contam para o perfil, em ordem
    probs_previstas: list[float | None] = field(default_factory=list)  # registradas na apresentacao, mesma ordem
    ja_foi_suficiente: bool = False
    faixas_apresentadas: Counter = field(default_factory=Counter)
    habilidades_recentes: list[str] = field(default_factory=list)  # mais recente por ultimo
    perfil_versao: int = 0
    sondagens_consecutivas: int = 0  # respostas validas consecutivas de sondagem, por area
    sondagens_pendentes: int = 0  # reservas ainda compativeis com a versao atual do perfil


@dataclass
class Decisao:
    estrategia: str
    motivo: str
    explicacao: str
    sinais: dict[str, Any]
    ajuste_centro: float = 0.0  # deslocamento gradual do centro do desafio dentro da faixa-alvo

    def como_dict(self) -> dict[str, Any]:
        return {"nome": self.estrategia, "motivo": self.motivo, "explicacao": self.explicacao, "sinais": self.sinais,
                "ajuste_centro_desafio": self.ajuste_centro}


def desempenho_vs_previsto(hist: HistoricoArea, janela: int) -> dict[str, Any]:
    """Compara acertos observados com a soma das probabilidades previstas antes de cada resposta."""
    pares = [(y, p) for y, p in zip(hist.respostas_validas, hist.probs_previstas) if p is not None][-janela:]
    n = len(pares)
    obs = sum(1 for y, _ in pares if y)
    esp = sum(p for _, p in pares)
    var = sum(p * (1 - p) for _, p in pares)
    z = (obs - esp) / math.sqrt(var) if var > 0 else 0.0
    return {"n": n, "acertos_observados": obs, "acertos_esperados": round(esp, 3), "erros_observados": n - obs,
            "erros_esperados": round(n - esp, 3), "z": round(z, 3)}


def ajuste_gradual(cmp: dict[str, Any], cr: dict[str, Any]) -> float:
    """Deslocamento do centro do desafio: zero sem evidencia consistente; depois cresce em passos limitados."""
    if cmp["n"] < cr["min_respostas_com_previsao"] or abs(cmp["z"]) < cr["z_limite"]:
        return 0.0
    passos = 1 + int(abs(cmp["z"]) - cr["z_limite"])  # cada unidade extra de z = mais um passo
    a = min(cr["ajuste_max"], passos * cr["passo_ajuste"])
    return round(a if cmp["z"] < 0 else -a, 4)  # abaixo do previsto -> mais acessivel (p maior)


def decidir_estrategia(estado: EstadoPerfil | None, hist: HistoricoArea | None, cfg: dict[str, Any],
                       modo: str = "automatico") -> Decisao:
    """Decide a estrategia. `modo='diagnostico'` (pedido explicito) so escolhe entre as duas de diagnostico."""
    ca = cfg["automatico"]
    cr = ca["reforco"]
    hist = hist or HistoricoArea()
    n = estado.n_evidencias if estado else 0
    status = estado.status if estado else "sem_historico"
    cmp = desempenho_vs_previsto(hist, cr["janela_recente"])
    ajuste = ajuste_gradual(cmp, cr)
    abaixo_consistente = ajuste > 0
    sinais = {"status_perfil": status, "n_evidencias": n, "dp": estado.dp if estado else None,
              "theta": estado.theta if estado else None, "desempenho_vs_previsto": cmp,
              "z_limite": cr["z_limite"], "ja_foi_suficiente": hist.ja_foi_suficiente,
              "perfil_versao": hist.perfil_versao}

    def d(nome, motivo, aj=0.0):
        return Decisao(nome, motivo, EXPLICACOES[nome], sinais, aj)

    if n < ca["cobertura_inicial_ate_n"]:
        return d("diagnostico_inicial", "sem_historico" if n == 0 else f"menos_de_{ca['cobertura_inicial_ate_n']}_respostas_validas")
    if modo == "diagnostico":
        return d("diagnostico_direcionado", "pedido_de_diagnostico_com_historico")
    if status == "suficiente":
        if abaixo_consistente:
            return d("reforco", "desempenho_consistentemente_abaixo_do_previsto", ajuste)
        return d("adaptativo", "perfil_suficiente" + ("_acima_do_previsto" if ajuste < 0 else ""), ajuste)
    if hist.ja_foi_suficiente and cr["ativar_se_ja_foi_suficiente"]:
        return d("reforco", "perfil_voltou_a_insuficiente", ajuste)
    if abaixo_consistente:
        return d("reforco", "desempenho_consistentemente_abaixo_do_previsto", ajuste)
    # incerteza alta com historico: diagnostico DIRECIONADO ao perfil atual (nunca recomeca o diagnostico geral)
    return d("diagnostico_direcionado",
             "perfil_voltou_a_insuficiente" if hist.ja_foi_suficiente else "perfil_insuficiente_com_historico")


def habilidades_com_dificuldade(stats: dict[str, tuple[int, int]], area: str, hist: HistoricoArea | None,
                                cfg_rev: dict[str, Any]) -> dict[str, dict[str, Any]]:
    """Habilidades da area com evidencia suficiente de dificuldade (nunca por um unico erro).

    `stats` usa somente primeiras tentativas sem ajuda (ver Servico._contexto). Habilidades priorizadas nas
    ultimas `nao_priorizar_se_nas_ultimas` apresentacoes da area ficam de fora nesta vez (diversidade)."""
    hist = hist or HistoricoArea()
    k = cfg_rev["nao_priorizar_se_nas_ultimas"]
    recentes = set(hist.habilidades_recentes[-k:]) if k > 0 else set()
    out = {}
    for chave, v in stats.items():
        if not chave or not chave.startswith(area + ":"):
            continue  # areas nunca se misturam
        n, ac = v[0], v[1]
        n_p, soma_p = (v[2], v[3]) if len(v) >= 4 else (0, 0.0)
        erros = n - ac
        if n < cfg_rev["min_respostas"] or erros < cfg_rev["min_erros"] or ac / n > cfg_rev["acuracia_max"]:
            continue
        # erros sao esperados: com previsao registrada, so prioriza se os acertos ficaram abaixo do previsto
        esperado = None
        if n_p >= cfg_rev["min_respostas"]:
            ac_p = v[4] if len(v) >= 5 else ac
            esperado = round(soma_p, 3)
            if ac_p > soma_p - cfg_rev["margem_acertos_abaixo_do_previsto"]:
                continue
        if chave in recentes:
            continue
        out[chave] = {"habilidade": chave, "respostas": n, "acertos": ac, "erros": erros,
                      "acuracia": round(ac / n, 4), "acertos_esperados_com_previsao": esperado}
    return out
