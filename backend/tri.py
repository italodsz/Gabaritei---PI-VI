"""Motor TRI 3PL. O contrato numérico é compartilhado com frontend/dificuldade.js."""
from bisect import bisect_left
from math import ceil, exp, log, log2, sqrt
from random import random

import numpy as np

from .common import finite, js_round

AREAS = ("CN", "CH", "LC", "MT")
DIA_MS = 86_400_000


def grade(cfg):
    limites = cfg["grade"]
    inicio, fim, passo = (limites[k] for k in ("min", "max", "passo"))
    return inicio + np.arange(js_round((fim - inicio) / passo) + 1) * passo


def p3pl(theta, item, D=1):
    a, b, c = (item[k] for k in ("a", "b", "c"))
    with np.errstate(over="ignore"):
        return c + (1 - c) / (1 + np.exp(-D * a * (theta - b)))


def _arredondar(lw):
    relativos = (lw - max(lw)) * 1000
    return np.maximum(-40, np.floor(relativos + 0.5) / 1000).tolist()


def _pesos(lw):
    pesos = np.exp(np.asarray(lw) - max(lw))
    return pesos / pesos.sum()


def perfil_inicial(area, cfg, *, nota=None):
    prior = cfg["prior"][area]
    media = prior["media"] if nota is None else theta_de_nota(area, nota, cfg)
    dp = prior["dp"] if nota is None else 0.5
    lw = _arredondar(-0.5 * ((grade(cfg) - media) / dp) ** 2)
    return dict(area=area, lw=lw, n=0, atualizadoEm=None, pstar=None, respostas=[])


def momentos(perfil, cfg):
    g = grade(cfg)
    w = _pesos(perfil["lw"])
    media = float(np.dot(w, g))
    return dict(media=media, dp=sqrt(float(np.dot(w, (g - media) ** 2))))


def alargar(perfil, agora_ms, cfg):
    anterior = perfil.get("atualizadoEm")
    if not anterior or not agora_ms or agora_ms <= anterior:
        return perfil
    dias = (agora_ms - anterior) / DIA_MS
    variancia = min(cfg["variancia_max_deriva"], cfg["deriva_tau_por_dia"] ** 2 * dias)
    if variancia < 1e-5:
        return perfil
    pesos = _pesos(perfil["lw"])
    saida = np.zeros_like(pesos)
    passo = cfg["grade"]["passo"]
    dp = sqrt(variancia)
    alcance = ceil(4 * dp / passo)
    for i, peso in enumerate(pesos):
        if peso < 1e-12:
            continue
        inicio, fim = max(0, i - alcance), min(len(pesos), i + alcance + 1)
        kernel = np.exp(-0.5 * ((np.arange(inicio, fim) - i) * passo / dp) ** 2)
        saida[inicio:fim] += peso * kernel / kernel.sum()
    return {**perfil, "lw": _arredondar(np.log(np.maximum(saida, 1e-300)))}


def atualizar(perfil, item, acertou, cfg, *, agora_ms, peso=1):
    base = alargar(perfil, agora_ms, cfg)
    p = np.clip(p3pl(grade(cfg), item, cfg["D"]), 1e-9, 1 - 1e-9)
    lw = np.asarray(base["lw"]) + peso * np.log(p if acertou else 1 - p)
    return {**base, "lw": _arredondar(lw), "n": base["n"] + 1, "atualizadoEm": agora_ms}


def registrar_acerto(perfil, acertou, cfg, alvo):
    controle = cfg["controlador"]
    janela = controle["janela"]
    respostas = [*(perfil.get("respostas") or []), bool(acertou)][-janela:]
    pstar = perfil.get("pstar")
    if pstar is None:
        pstar = alvo
    if len(respostas) >= janela:
        pstar += controle["ganho"] * (alvo - sum(respostas) / len(respostas))
        amplitude = controle["amplitude"]
        pstar = min(alvo + amplitude, max(alvo - amplitude, pstar))
    return {**perfil, "respostas": respostas, "pstar": js_round(pstar * 10000) / 10000}


def chance(perfil, item, cfg):
    return float(np.dot(_pesos(perfil["lw"]), p3pl(grade(cfg), item, cfg["D"])))


def informacao(perfil, item, cfg):
    p = float(p3pl(momentos(perfil, cfg)["media"], item, cfg["D"]))
    return (cfg["D"] * item["a"]) ** 2 * ((p - item["c"]) / (1 - item["c"])) ** 2 * (1 - p) / p


def nota_de_theta(area, theta, cfg):
    tabela = cfg["tabela_nota"][area]
    x, y = tabela["theta"], tabela["nota"]
    i = min(len(x) - 1, max(1, bisect_left(x, theta)))
    return y[i - 1] + (theta - x[i - 1]) * (y[i] - y[i - 1]) / (x[i] - x[i - 1])


def theta_de_nota(area, nota, cfg):
    minimo, maximo = -6, 6
    for _ in range(60):
        meio = (minimo + maximo) / 2
        if nota_de_theta(area, meio, cfg) < nota:
            minimo = meio
        else:
            maximo = meio
    return (minimo + maximo) / 2


def resumo_nota(perfil, cfg):
    regras = cfg["nota"]
    area, n = (perfil["area"], perfil["n"]) if perfil else (None, 0)
    if n < regras["min_respostas"]:
        return dict(area=area, n=n, status="calibrando", faltam=regras["min_respostas"] - n)
    m = momentos(perfil, cfg)
    z = regras.get("faixa_z", 1)
    passo = regras["arredondar"]
    theta = m["media"]
    dp = m["dp"]
    notas = [js_round(nota_de_theta(area, t, cfg) / passo) * passo
             for t in (theta, theta - z * dp, theta + z * dp)]
    nota, minimo, maximo = notas
    status = "estreita" if dp <= regras["dp_faixa_estreita"] else "larga"
    return dict(area=area, n=n, status="abaixo-500" if maximo < 500 else status,
                nota=nota, min=minimo, max=maximo, dp=dp)


def agregados(resumos):
    notas = {r["area"]: r["nota"] for r in resumos if r["status"] != "calibrando"}

    def media(areas):
        if all(area in notas for area in areas):
            return js_round(sum(notas[area] for area in areas) / len(areas))
        return None

    return dict(geral=media(AREAS), exatas=media(("MT", "CN")), humanas=media(("CH", "LC")))


def _logit(p):
    q = min(1 - 1e-4, max(1e-4, p))
    return log(q / (1 - q))


def meta_de(desafio, cfg):
    metas = cfg["metas"]
    return metas.get(desafio if isinstance(desafio, str) else None, metas[cfg["desafio_padrao"]])


def adequacao(p, alvo, cfg):
    distancia = _logit(p) - _logit(alvo)
    return exp(-(distancia * distancia) / (2 * cfg["largura_logit"] ** 2))


def meta_alcancavel(meta, chances, cfg):
    validas = sorted((p for p in chances if finite(p)), reverse=True)
    posicao = min(cfg["meta_alcancavel_posicao"], len(validas))
    return min(meta, validas[posicao - 1]) if posicao else meta


def ordenar_semelhantes(ids, chance_de, alvo, cfg):
    regra = cfg["semelhante"]
    n = regra["candidatas"]
    chances = [chance_de(i) for i in ids[:n]]
    alvo = meta_alcancavel(alvo, chances, cfg)

    def escore(k):
        ajuste = adequacao(chances[k], alvo, cfg) if finite(chances[k]) else 0.5
        return (1 / log2(k + 2)) * (regra["base"] + regra["peso"] * ajuste)

    ordem = sorted(range(len(chances)), key=escore, reverse=True)
    return [ids[k] for k in ordem] + list(ids[n:])


def montar_lista(candidatos, n, alvo, cfg, rng=random):
    alvo = meta_alcancavel(alvo, (c["p"] for c in candidatos if c["estado"] == "inedita"), cfg)
    regra = cfg["lista"]

    def nota(candidato):
        p = candidato["p"]
        base = adequacao(p, alvo, cfg) if finite(p) else 0.5
        penalidade = cfg["penalidade_alerta"] if candidato.get("alerta") else 1
        return base * penalidade + rng() * regra["jitter"]

    grupos = {s: [] for s in ("inedita", "revisao", "errou", "acertou")}
    for candidato in candidatos:
        grupos.get(candidato["estado"], grupos["acertou"]).append(candidato)
    vagas = min(len(grupos["revisao"]), int(n * regra["revisao_fracao"]))
    escolhidas = sorted(grupos["revisao"], key=nota, reverse=True)[:vagas]
    usadas = {id(c) for c in escolhidas}
    for grupo in grupos.values():
        for candidato in sorted(grupo, key=nota, reverse=True):
            if len(escolhidas) >= n:
                break
            if id(candidato) not in usadas:
                escolhidas.append(candidato)
                usadas.add(id(candidato))
    com_chance = [i for i, c in enumerate(escolhidas) if finite(c["p"])]
    if com_chance:
        mais_facil = max(com_chance, key=lambda i: escolhidas[i]["p"])
        escolhidas.insert(0, escolhidas.pop(mais_facil))
    return [c["id"] for c in escolhidas]


def apoio_disponivel(p, cfg):
    return finite(p) and p < cfg["apoio"]["abaixo_de"]


def conta_para_theta(item, primeira, apoio, tempo_ms, origem, cfg):
    if item is None:
        motivo = "parametros_fora_da_triagem"
    elif not primeira:
        motivo = "repeticao"
    elif apoio:
        motivo = "com_apoio"
    elif finite(tempo_ms) and tempo_ms < cfg["tempo_minimo_ms"]:
        motivo = "resposta_muito_rapida"
    else:
        return dict(conta=True, peso=cfg["peso"]["simulado" if origem == "simulado" else "pratica"])
    return dict(conta=False, motivo=motivo)


def _sigmoid(x):
    return 1 / (1 + exp(-x))


def ajustar_chance(p, delta):
    return _sigmoid(_logit(p) + delta) if finite(p) and delta else p


def estimar_ajuste(eventos, cfg):
    regra = cfg["aprendizado_sistema"]
    n = len(eventos)
    if n < regra["min_eventos"]:
        return dict(delta=0, n=n, ativo=False)
    logits = [_logit(e["p"]) for e in eventos]
    precisao = 1 / regra["dp_prior"] ** 2
    delta = 0
    for _ in range(30):
        g, h = -delta * precisao, -precisao
        for evento, l in zip(eventos, logits):
            p = _sigmoid(l + delta)
            g += evento["y"] - p
            h -= p * (1 - p)
        passo = g / h
        delta -= passo
        if abs(passo) < 1e-6:
            break
    delta = max(-regra["limite"], min(regra["limite"], delta))
    return dict(delta=js_round(delta * 1000) / 1000, n=n, ativo=True)
