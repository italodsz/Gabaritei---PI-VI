"""Avaliacao B: previsao do acerto em respostas FUTURAS (protocolo cronologico).

Entrada: JSONL no formato de docs/FORMATO_INTERACOES.md.
Uso:     python -m gabaritei_rec.avaliacao.previsao --interacoes ARQ.jsonl [--saida DIR]

Protocolo:
  * registros de teste controlado/assistido (ex.: terminal com gabarito visivel antes da resposta) sao excluidos
    explicitamente, inclusive no formato antigo (gabarito_visivel_ao_operador / inadequado_para_validacao_real),
    mesmo quando origem="real" (pessoa real respondendo de forma intencional);
  * so primeiras tentativas sem ajuda, nao puladas (repeticoes/variantes do mesmo grupo sao descartadas);
  * a probabilidade registrada na apresentacao (antes da resposta) e avaliada a parte quando presente;
  * ordem cronologica global; cortes de tempo por quantis (ajuste/validacao/teste) definidos na config da funcao;
  * cada previsao usa apenas respostas ANTERIORES do mesmo aluno na mesma area;
  * limiar: 0,5 declarado previamente E limiar escolhido na validacao (balanced accuracy); nunca no teste;
  * referencias: classe majoritaria (do periodo de ajuste) e acuracia previa do aluno (suavizada);
  * alunos novos (primeira resposta no periodo de teste) reportados a parte;
  * IC 95% por bootstrap reamostrando alunos.
O alvo e o acerto observado, nao a faixa de dificuldade derivada de b.
"""
from __future__ import annotations

import argparse
import json
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any

import numpy as np

from ..catalogo import Catalogo
from ..config import RESULTADOS_DIR, carregar_config, sha256_arquivo
from ..psicometria import Evidencia, estimar_eap
from .metricas import bootstrap_por_aluno, escolher_limiar_balanced, metricas_binarias

CAMPOS_OBRIGATORIOS = ("origem", "aluno_id", "questao_id", "area", "enviado_em", "correta", "pulada", "tipo")


def ler_interacoes(caminho: Path) -> list[dict[str, Any]]:
    regs = []
    with open(caminho, encoding="utf-8") as f:
        for n, linha in enumerate(f, 1):
            if not linha.strip():
                continue
            r = json.loads(linha)
            faltam = [c for c in CAMPOS_OBRIGATORIOS if c not in r]
            if faltam:
                raise ValueError(f"linha {n}: campos ausentes {faltam}")
            if r["origem"] not in ("real", "sintetico"):
                raise ValueError(f"linha {n}: origem deve ser 'real' ou 'sintetico'")
            regs.append(r)
    return regs


def registro_controlado(r: dict[str, Any]) -> str | None:
    """Motivo para excluir o registro da avaliacao independente, ou None. Compativel com registros antigos."""
    if r.get("teste_controlado"):
        return "teste_controlado"
    if r.get("gabarito_visivel_ao_operador") or r.get("gabarito_visivel_antes_da_resposta"):
        return "gabarito_visivel_antes_da_resposta"
    if r.get("inadequado_para_validacao_real") or r.get("elegivel_avaliacao_independente") is False:
        return "marcado_inelegivel_para_validacao"
    if r.get("cenario") == "terminal_controlado":
        return "cenario_terminal_controlado"
    if r.get("condicao_resposta") not in (None, "independente"):
        return f"condicao_{r.get('condicao_resposta')}"
    return None


def preparar_eventos(regs: list[dict[str, Any]], cat: Catalogo) -> tuple[list[dict[str, Any]], dict[str, int]]:
    descartes = defaultdict(int)
    regs = sorted(regs, key=lambda r: (r["enviado_em"], r["aluno_id"], r["questao_id"]))
    vistos: set[tuple[str, str]] = set()
    evs = []
    for r in regs:
        it = cat.itens.get(r["questao_id"])
        if it is None:
            descartes["questao_desconhecida"] += 1
            continue
        if registro_controlado(r):
            descartes["registro_controlado_ou_assistido"] += 1
            continue
        if r.get("apresentado_em") and datetime.fromisoformat(r["apresentado_em"]) > datetime.fromisoformat(r["enviado_em"]):
            descartes["apresentado_depois_do_envio"] += 1
            continue
        chave = (r["aluno_id"], it.grupo_conteudo)
        if r.get("pulada") or r.get("correta") is None:
            descartes["pulada_ou_sem_resposta"] += 1
            continue
        if chave in vistos:
            descartes["repeticao_ou_variante_mesmo_grupo"] += 1
            continue
        vistos.add(chave)
        if r.get("tipo") != "primeira_sem_ajuda" or r.get("usou_dica") or r.get("gabarito_exposto_antes"):
            descartes["nao_primeira_sem_ajuda"] += 1
            continue
        if it.triagem_excluir:
            descartes["item_triado"] += 1
            continue
        evs.append({**r, "a": it.a, "b": it.b, "c": it.c, "t": datetime.fromisoformat(r["enviado_em"]),
                    "y": int(bool(r["correta"]))})
    return evs, dict(descartes)


def prever(evs: list[dict[str, Any]], cfg: dict[str, Any], base_rate: float, D: float) -> None:
    """Preenche p_irt e p_previa usando apenas eventos anteriores (estritamente) do mesmo aluno/area."""
    hist: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    for e in evs:  # ja ordenados no tempo
        h = hist[(e["aluno_id"], e["area"])]
        anteriores = [x for x in h if x["t"] < e["t"]]
        est = estimar_eap([Evidencia(x["a"], x["b"], x["c"], bool(x["y"])) for x in anteriores], cfg["irt"], D)
        e["p_irt"] = est.prob_esperada(e["a"], e["b"], e["c"], D)
        n, ac = len(anteriores), sum(x["y"] for x in anteriores)
        e["p_previa"] = (ac + 2 * base_rate) / (n + 2)
        e["n_anteriores"] = n
        h.append(e)


def avaliar(regs: list[dict[str, Any]], cat: Catalogo, cfg: dict[str, Any], quantis=(0.6, 0.8),
            semente: int = 20261111, n_boot: int = 500, D: float | None = None) -> dict[str, Any]:
    D = cfg["irt"]["D_experimental"] if D is None else D
    origens = sorted({r["origem"] for r in regs})
    evs, descartes = preparar_eventos(regs, cat)
    if len(evs) < 20:
        return {"status": "nao_avaliado", "motivo": "eventos insuficientes", "n_eventos": len(evs), "descartes": descartes}
    ts = np.array([e["t"].timestamp() for e in evs])
    c1, c2 = np.quantile(ts, quantis)
    for e in evs:
        x = e["t"].timestamp()
        e["periodo"] = "ajuste" if x <= c1 else ("validacao" if x <= c2 else "teste")
    ajuste = [e for e in evs if e["periodo"] == "ajuste"]
    base = float(np.mean([e["y"] for e in ajuste])) if ajuste else 0.5
    prever(evs, cfg, base, D)
    primeira_vez = {}
    for e in evs:
        primeira_vez.setdefault(e["aluno_id"], e["periodo"])
    maj = 1 if base >= 0.5 else 0

    def bloco(es: list[dict[str, Any]], limiar_val: float) -> dict[str, Any]:
        if not es:
            return {"n": 0}
        y = [e["y"] for e in es]
        out = {"n": len(es), "n_alunos": len({e["aluno_id"] for e in es}),
               "acertos": int(sum(y)), "erros": int(len(y) - sum(y)), "modelos": {}}
        modelos = {"irt_eap_3pl": [e["p_irt"] for e in es], "ref_acuracia_previa": [e["p_previa"] for e in es],
                   "ref_majoritaria": [float(maj) * (1 - 1e-6) + (1 - maj) * 1e-6 for _ in es],
                   "ref_taxa_base_ajuste": [base for _ in es]}
        if all(e.get("prob_prevista") is not None for e in es):
            # probabilidade gravada pelo servidor na apresentacao, antes da resposta (nao recalculada)
            modelos["prob_registrada_antes_da_resposta"] = [float(e["prob_prevista"]) for e in es]
        for nome, p in modelos.items():
            m = {"limiar_0_5_declarado": metricas_binarias(y, p, 0.5)}
            if nome == "irt_eap_3pl":
                m["limiar_validacao"] = metricas_binarias(y, p, limiar_val)
            out["modelos"][nome] = m
        return out

    val = [e for e in evs if e["periodo"] == "validacao"]
    teste = [e for e in evs if e["periodo"] == "teste"]
    limiar_val = escolher_limiar_balanced([e["y"] for e in val], [e["p_irt"] for e in val]) if val else 0.5
    res: dict[str, Any] = {
        "status": "avaliado", "origens": origens,
        "aviso": None if origens == ["real"] else "DADOS SINTETICOS: verificam o pipeline, nao a eficacia com alunos reais.",
        "protocolo": {"quantis_tempo": list(quantis), "D_usado": D, "D_confirmado": cfg["irt"]["D_confirmado"],
                      "limiar_validacao_balanced_accuracy": limiar_val, "semente_bootstrap": semente,
                      "taxa_base_ajuste": base, "classe_majoritaria_ajuste": maj},
        "descartes": descartes,
        "tamanho": {"eventos": len(evs), "alunos": len({e["aluno_id"] for e in evs}),
                    "por_periodo": {p: sum(1 for e in evs if e["periodo"] == p) for p in ("ajuste", "validacao", "teste")}},
        "teste": bloco(teste, limiar_val),
        "validacao": bloco(val, limiar_val),
        "teste_por_area": {a: bloco([e for e in teste if e["area"] == a], limiar_val) for a in ("CH", "CN", "LC", "MT")},
        "teste_alunos_novos": bloco([e for e in teste if primeira_vez[e["aluno_id"]] == "teste"], limiar_val),
    }
    for nome, chave in (("irt_eap_3pl", "p_irt"), ("ref_acuracia_previa", "p_previa")):
        def f_auc(amostra, chave=chave):
            from .metricas import roc_auc
            return roc_auc([e["y"] for e in amostra], [e[chave] for e in amostra])

        def f_brier(amostra, chave=chave):
            return float(np.mean([(e[chave] - e["y"]) ** 2 for e in amostra]))

        def f_bacc(amostra, chave=chave):
            return metricas_binarias([e["y"] for e in amostra], [e[chave] for e in amostra], 0.5)["balanced_accuracy"]
        res["teste"]["modelos"][nome]["ic95_bootstrap_aluno"] = {
            "roc_auc": bootstrap_por_aluno(teste, f_auc, n_boot, semente),
            "brier": bootstrap_por_aluno(teste, f_brier, n_boot, semente),
            "balanced_accuracy_0_5": bootstrap_por_aluno(teste, f_bacc, n_boot, semente)}
    return res


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--interacoes", type=Path, required=True)
    ap.add_argument("--saida", type=Path, default=RESULTADOS_DIR / "previsao")
    a = ap.parse_args(argv)
    cfg = carregar_config()
    regs = ler_interacoes(a.interacoes)
    res = avaliar(regs, Catalogo.carregar(), cfg)
    res["entrada"] = {"arquivo": str(a.interacoes), "sha256": sha256_arquivo(a.interacoes)}
    a.saida.mkdir(parents=True, exist_ok=True)
    with open(a.saida / "metricas_previsao.json", "w", encoding="utf-8") as f:
        json.dump(res, f, ensure_ascii=False, indent=2, default=str)
    print(json.dumps({k: res[k] for k in ("status", "tamanho")} if res["status"] == "avaliado" else res, indent=2, default=str))


if __name__ == "__main__":
    main()
