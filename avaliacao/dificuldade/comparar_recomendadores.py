"""Compara os três recomendadores de dificuldade do Gabaritei com respostas reais do ENEM 2024.

Métodos:
  italo    TRI 3PL da main (backend/tri.py + backend/config/dificuldade_v1.json), usado sem alteração.
  joao     TRI 3PL com EAP e estratégias automáticas, reproduzido de
           origin/joao/recomendador-dificulade (f99bd07): recomendador/gabaritei_rec/psicometria.py,
           estrategia.py, recomendacao.py e config/politica.json.
  gabriel  Módulo BKT no modo que roda no ENEM (média de acertos suavizada por área), reproduzido de
           origin/recomendador-dificuldade-v2 (e7db348): dificuldade-adaptativa/modulo-bkt-H/bkt04/motor.py,
           bkt04/politica.py e models/politica_selecionada.json.

Dados: backend/testdata/microdados_2024_amostra.json (660 alunos, 44 ou 45 respostas cada, com a nota oficial).

Teste 1 (prever): as respostas de cada aluno são embaralhadas; antes de cada resposta o método dá a chance de
acerto e depois aprende com o resultado. Medidas: log-loss, AUC e diferença pareada por aluno (bootstrap).
Teste 2 (escolher): cada método escolhe 20 questões, uma por vez, entre as da prova do aluno; conta-se o acerto
real nelas, por faixa de nota oficial.

Uso (na raiz do projeto, com o ambiente do backend ativo):
    python avaliacao/dificuldade/comparar_recomendadores.py
    python avaliacao/dificuldade/comparar_recomendadores.py --sementes-previsao 1 --sementes-escolha 2   # rápido
"""
from __future__ import annotations

import argparse
import bisect
import json
import math
import random
import sys
import time
from pathlib import Path

import numpy as np

RAIZ = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(RAIZ))
from backend import tri  # noqa: E402

CFG = json.loads((RAIZ / "backend/config/dificuldade_v1.json").read_text(encoding="utf-8"))
AMOSTRA = RAIZ / "backend/testdata/microdados_2024_amostra.json"
SAIDA = Path(__file__).resolve().parent / "resultados.json"
FAIXAS_NOTA = (("abaixo de 500", 0, 500), ("500 a 650", 500, 650), ("acima de 650", 650, 10_000))
PASSOS = 20


# ------------------------------------------------------------------ dados
def triado(item):
    """Triagem do Ítalo, aplicada igualmente aos três para comparar nas mesmas questões."""
    t = CFG["triagem"]
    return item["a"] >= t["a_min"] and t["b_min"] <= item["b"] <= t["b_max"] and 0 <= item["c"] <= t["c_max"]


def carregar_alunos():
    provas = json.loads(AMOSTRA.read_text(encoding="utf-8"))["provas"]
    alunos = []
    for area, lista in provas.items():
        for prova in lista:
            itens = [dict(a=a, b=b, c=c) for a, b, c in zip(prova["a"], prova["b"], prova["c"])]
            for caso in prova["casos"]:
                alunos.append(dict(area=area, itens=itens, y=[int(ch) for ch in caso["y"]], nota=caso["nota"]))
    return alunos


# ------------------------------------------------------------------ Ítalo (código da main, sem alteração)
class Italo:
    def __init__(self, area):
        self.perfil = tri.perfil_inicial(area, CFG)

    def chance(self, item):
        return tri.chance(self.perfil, item, CFG)

    def aprender(self, item, acertou):
        self.perfil = tri.atualizar(self.perfil, item, acertou, CFG, agora_ms=None)

    def escolher(self, itens, restantes, rng):
        """Questão com chance mais próxima da meta alcançável (75%, desafio padrão)."""
        chances = {i: self.chance(itens[i]) for i in restantes}
        alvo = tri.meta_alcancavel(tri.meta_de(None, CFG), list(chances.values()), CFG)
        return max(restantes, key=lambda i: tri.adequacao(chances[i], alvo, CFG) + rng.random() * 1e-6)


# ------------------------------------------------------------------ João (reprodução)
class Joao:
    """EAP 3PL, prior N(0, 1), grade -6..6 passo 0,05, D = 1 (config/politica.json)."""
    GRADE = np.linspace(-6, 6, 241)
    CFG = dict(cobertura_inicial=3, min_validas=10, dp_max=0.6, prob_min=0.35, sondagem_prob=0.30,
               sondagem_info=0.01, sondagem_max=3, acess=(0.35, 0.85), peso_acess=0.5,
               faixa=(0.65, 0.80), peso_info=0.2, jitter=0.15)

    def __init__(self, itens):
        a = np.array([i["a"] for i in itens])[:, None]
        b = np.array([i["b"] for i in itens])[:, None]
        c = np.array([i["c"] for i in itens])[:, None]
        self.P = np.clip(c + (1 - c) / (1 + np.exp(-a * (self.GRADE - b))), 1e-9, 1 - 1e-9)  # itens × grade
        self.lp = -0.5 * self.GRADE ** 2
        self.n = 0
        self.sondagens = 0
        self.estrategias = {}

    def _post(self):
        w = np.exp(self.lp - self.lp.max())
        return w / w.sum()

    def chance(self, i):
        return float(self.P[i] @ self._post())

    def aprender(self, i, acertou):
        self.lp = self.lp + (np.log(self.P[i]) if acertou else np.log1p(-self.P[i]))
        self.n += 1

    @staticmethod
    def _h(p):
        p = np.clip(p, 1e-12, 1 - 1e-12)
        return -(p * np.log(p) + (1 - p) * np.log1p(-p))

    def escolher(self, faixa_item, restantes, rng):
        k = self.CFG
        w = self._post()
        idx = np.array(restantes)
        P = self.P[idx]
        pr = P @ w
        info = self._h(pr) - self._h(P) @ w  # informação mútua resposta × theta
        media = float(w @ self.GRADE)
        dp = math.sqrt(float(w @ (self.GRADE - media) ** 2))
        mx = float(info.max()) or 1.0
        if self.n < k["cobertura_inicial"]:
            estrategia = "diagnostico_inicial"
            alvo = ("facil", "media", "dificil")[self.n]
            cand = [j for j, i in enumerate(idx) if faixa_item(i) == alvo] or list(range(len(idx)))
            nota = {j: info[j] / mx for j in cand}
        else:
            insuficiente = self.n < k["min_validas"] or dp > k["dp_max"]
            cand = [j for j in range(len(idx)) if pr[j] >= k["prob_min"]]
            if not cand and insuficiente and self.sondagens < k["sondagem_max"]:
                cand = [j for j in range(len(idx)) if pr[j] >= k["sondagem_prob"] and info[j] >= k["sondagem_info"]]
                self.sondagens += bool(cand)
            if not cand:  # no app ele avisaria falta de questões adequadas; aqui segue com a mais próxima
                cand = list(range(len(idx)))
            if insuficiente:
                estrategia = "diagnostico_direcionado"
                lo, hi = k["acess"]
                nota = {j: info[j] / mx - k["peso_acess"] * max(0.0, lo - pr[j], pr[j] - hi) / 0.1 for j in cand}
            else:
                estrategia = "adaptativo"
                lo, hi = k["faixa"]
                centro, meia = (lo + hi) / 2, (hi - lo) / 2

                def adequacao(j):
                    p = pr[j]
                    s = 1 - abs(p - centro) / meia if lo <= p <= hi else -1 - max(0.0, abs(p - centro) - meia) / 0.02
                    return s + k["peso_info"] * info[j] / mx
                nota = {j: adequacao(j) for j in cand}
        self.estrategias[estrategia] = self.estrategias.get(estrategia, 0) + 1
        j = max(nota, key=lambda j: nota[j] + k["jitter"] * rng.random())
        return int(idx[j])


# ------------------------------------------------------------------ Gabriel (reprodução)
class Gabriel:
    """Fallback ENEM: (acertos + 1) / (respostas + 2); política m4_policy_1, aceitando toda sugestão."""
    NIVEIS = ("facil", "media", "dificil")
    POL = dict(minimo=5, intervalo=5, margem=0.05, cortes=(0.4, 0.8))

    def __init__(self):
        self.acertos = self.total = 0
        self.nivel = "media"
        self.ultima_oferta = None
        self.trocas = 0

    def chance(self, _item=None):
        return (self.acertos + 1) / (self.total + 2)

    def aprender(self, _item, acertou):
        self.acertos += acertou
        self.total += 1
        escore = (self.acertos + 1) / (self.total + 2)
        sugestao = self._sugerir(escore)
        if sugestao:
            self.nivel, self.ultima_oferta = sugestao, self.total
            self.trocas += 1

    def _sugerir(self, valor):
        p = self.POL
        if self.total < p["minimo"]:
            return None
        if self.ultima_oferta is not None and self.total - self.ultima_oferta < p["intervalo"]:
            return None
        lo, hi = p["cortes"]
        alvo = "facil" if valor < lo else "dificil" if valor > hi else "media"
        aqui = self.NIVEIS.index(self.nivel)
        alvo = self.NIVEIS[max(aqui - 1, min(aqui + 1, self.NIVEIS.index(alvo)))]
        if alvo == self.nivel:
            return None
        ref = lo if alvo == "facil" else hi if alvo == "dificil" else (lo + hi) / 2
        return None if abs(valor - ref) < p["margem"] else alvo

    def escolher(self, faixa_item, restantes, rng):
        na_faixa = [i for i in restantes if faixa_item(i) == self.nivel]
        return rng.choice(na_faixa or restantes)


# ------------------------------------------------------------------ métricas
def logloss(p, y):
    p = min(1 - 1e-6, max(1e-6, p))
    return -(y * math.log(p) + (1 - y) * math.log(1 - p))


def auc(ps, ys):
    neg = sorted(p for p, y in zip(ps, ys) if not y)
    pos = [p for p, y in zip(ps, ys) if y]
    soma = sum(bisect.bisect_left(neg, p) + 0.5 * (bisect.bisect_right(neg, p) - bisect.bisect_left(neg, p)) for p in pos)
    return soma / (len(pos) * len(neg))


def bootstrap(valores, n=2000):
    v = np.asarray(valores)
    medias = [np.random.default_rng(k).choice(v, len(v)).mean() for k in range(n)]
    return [round(float(x), 4) for x in np.percentile(medias, [2.5, 97.5])]


# ------------------------------------------------------------------ teste 1
def teste_prever(alunos, sementes):
    nomes = ("italo", "joao", "gabriel")
    reg = {m: dict(ll=[], p=[], y=[], k=[]) for m in nomes}
    por_aluno = {m: [] for m in nomes}  # log-loss médio por aluno, na 1ª semente
    for semente in range(sementes):
        rng = random.Random(semente)
        for al in alunos:
            ordem = list(range(len(al["itens"])))
            rng.shuffle(ordem)
            modelos = dict(italo=Italo(al["area"]), joao=Joao(al["itens"]), gabriel=Gabriel())
            soma = dict.fromkeys(nomes, 0.0)
            vistos = 0
            for i in ordem:
                item, y = al["itens"][i], al["y"][i]
                if not triado(item):
                    continue
                for m in nomes:
                    p = modelos[m].chance(i if m == "joao" else item)
                    r = reg[m]
                    r["ll"].append(logloss(p, y)); r["p"].append(p); r["y"].append(y); r["k"].append(vistos)
                    soma[m] += r["ll"][-1]
                    modelos[m].aprender(i if m == "joao" else item, y)
                vistos += 1
            if semente == 0:
                for m in nomes:
                    por_aluno[m].append(soma[m] / vistos)
    tabela = {}
    for m, r in reg.items():
        linha = dict(previsoes=len(r["ll"]), logloss=round(float(np.mean(r["ll"])), 4), auc=round(auc(r["p"], r["y"]), 4))
        for a, b in ((0, 5), (5, 15), (15, 45)):
            idx = [j for j, k in enumerate(r["k"]) if a <= k < b]
            linha[f"auc_respostas_{a}_a_{b - 1}"] = round(auc([r["p"][j] for j in idx], [r["y"][j] for j in idx]), 4)
        tabela[m] = linha
    pares = {}
    for x, z in (("italo", "joao"), ("italo", "gabriel"), ("joao", "gabriel")):
        d = np.array(por_aluno[x]) - np.array(por_aluno[z])
        pares[f"{x}_menos_{z}"] = dict(diferenca_logloss=round(float(d.mean()), 4), ic95=bootstrap(d),
                                       primeiro_melhor_em=round(float((d < 0).mean()), 3))
    return dict(metodos=tabela, diferencas_pareadas_por_aluno=pares)


# ------------------------------------------------------------------ teste 2
def teste_escolher(alunos, sementes):
    metodos = ("sorteio", "gabriel", "joao", "italo")
    acertos = {m: {f[0]: [] for f in FAIXAS_NOTA} for m in metodos}
    trocas_gabriel, estrategias_joao = [], {}
    for semente in range(sementes):
        rngs = {m: random.Random(f"{semente}-{m}") for m in metodos}
        for al in alunos:
            itens, y = al["itens"], al["y"]
            pool = [i for i in range(len(itens)) if triado(itens[i])]
            bs = sorted(itens[i]["b"] for i in pool)
            c1, c2 = bs[len(bs) // 3], bs[2 * len(bs) // 3]  # tercis do b na prova do aluno

            def faixa_item(i):
                return "facil" if itens[i]["b"] <= c1 else "media" if itens[i]["b"] <= c2 else "dificil"
            grupo = next(n for n, lo, hi in FAIXAS_NOTA if lo <= al["nota"] < hi)
            for m in metodos:
                rng = rngs[m]
                if m == "sorteio":
                    escolhidas = rng.sample(pool, PASSOS)
                else:
                    modelo = Italo(al["area"]) if m == "italo" else Joao(itens) if m == "joao" else Gabriel()
                    restantes, escolhidas = pool[:], []
                    for _ in range(PASSOS):
                        i = modelo.escolher(itens if m == "italo" else faixa_item, restantes, rng)
                        restantes.remove(i)
                        escolhidas.append(i)
                        modelo.aprender(i if m == "joao" else itens[i], y[i])
                    if m == "gabriel":
                        trocas_gabriel.append(modelo.trocas)
                    if m == "joao":
                        for k, v in modelo.estrategias.items():
                            estrategias_joao[k] = estrategias_joao.get(k, 0) + v
                acertos[m][grupo].append(float(np.mean([y[i] for i in escolhidas])))
    total = sum(estrategias_joao.values())
    return dict(
        passos=PASSOS,
        acerto_medio=({m: {g: round(float(np.mean(v)), 3) for g, v in d.items()} for m, d in acertos.items()}),
        alunos_por_faixa={g: len(v) // sementes for g, v in acertos["italo"].items()},
        trocas_de_faixa_gabriel_por_aluno=round(float(np.mean(trocas_gabriel)), 2),
        estrategias_joao={k: round(v / total, 3) for k, v in estrategias_joao.items()},
    )


# ------------------------------------------------------------------ principal
def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--sementes-previsao", type=int, default=5)
    ap.add_argument("--sementes-escolha", type=int, default=10)
    args = ap.parse_args()
    alunos = carregar_alunos()
    inicio = time.time()
    print(f"{len(alunos)} alunos. Teste 1 (prever), {args.sementes_previsao} sementes...")
    t1 = teste_prever(alunos, args.sementes_previsao)
    print(f"Teste 2 (escolher), {args.sementes_escolha} sementes...")
    t2 = teste_escolher(alunos, args.sementes_escolha)
    saida = dict(dados=str(AMOSTRA.relative_to(RAIZ)), alunos=len(alunos), config=CFG["versao"],
                 sementes=dict(previsao=args.sementes_previsao, escolha=args.sementes_escolha),
                 prever=t1, escolher=t2, segundos=round(time.time() - inicio))
    SAIDA.write_text(json.dumps(saida, ensure_ascii=False, indent=2), encoding="utf-8")

    print("\nTeste 1: prever o acerto")
    print("| Método | Log-loss | AUC | AUC nas 5 primeiras |")
    print("| --- | --- | --- | --- |")
    for m, r in t1["metodos"].items():
        print(f"| {m} | {r['logloss']:.3f} | {r['auc']:.3f} | {r['auc_respostas_0_a_4']:.3f} |")
    for par, d in t1["diferencas_pareadas_por_aluno"].items():
        print(f"{par}: {d['diferenca_logloss']} (IC95% {d['ic95']}), primeiro melhor em {d['primeiro_melhor_em']:.0%} dos alunos")
    print(f"\nTeste 2: acerto real nas {PASSOS} questões escolhidas")
    grupos = [f[0] for f in FAIXAS_NOTA]
    print("| Método | " + " | ".join(f"{g} ({t2['alunos_por_faixa'][g]})" for g in grupos) + " |")
    print("| --- |" + " --- |" * len(grupos))
    for m, d in t2["acerto_medio"].items():
        print(f"| {m} | " + " | ".join(f"{d[g]:.1%}" for g in grupos) + " |")
    print(f"\nResultados em {SAIDA.relative_to(RAIZ)} ({saida['segundos']} s).")


if __name__ == "__main__":
    main()
