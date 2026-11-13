"""Pipeline reproduzivel de importacao e auditoria do dataset.

Uso:  python -m gabaritei_rec.importacao [--dataset CAMINHO]

Gera em artefatos/:
  catalogo.json            itens normalizados + versoes + disponibilidade (inclui gabarito: uso interno)
  cortes.json              cortes de dificuldade congelados (versao + hash)
  manifesto.json           versoes/hashes de dataset, cortes, triagem, politica
  qualidade/relatorio_qualidade.json|.md
Nada e corrigido ou excluido silenciosamente: toda indisponibilidade tem motivo registrado.
"""
from __future__ import annotations

import argparse
import json
import math
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .config import (ARTEFATOS_DIR, BACKEND_DIR, carregar_config, dataset_dir, sha256_arquivo, sha256_lf, sha256_obj,
                     versao_politica)
from .psicometria import AREAS, FAIXAS, calcular_cortes, faixa_de_b, triar_parametros

RE_ID = re.compile(r"^gq_[0-9a-f]{24}$")
LETRAS = ["A", "B", "C", "D", "E"]
LINGUAS = {"pt", "en", "es"}


def _ler_jsonl(caminho: Path) -> list[dict[str, Any]]:
    with open(caminho, encoding="utf-8") as f:
        return [json.loads(l) for l in f if l.strip()]


def normalizar_texto(t: str) -> str:
    t = unicodedata.normalize("NFKD", t or "")
    t = "".join(ch for ch in t if not unicodedata.combining(ch)).lower()
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ", t)).strip()


# ---------------------------------------------------------------- validacao de schema
def validar_item(r: dict[str, Any]) -> list[str]:
    erros = []
    if not isinstance(r.get("id"), str) or not RE_ID.match(r["id"]):
        erros.append("id_invalido")
    if r.get("area") not in AREAS:
        erros.append("area_invalida")
    lang = r.get("language")
    if lang not in LINGUAS:
        erros.append("lingua_invalida")
    elif lang != "pt" and r.get("area") != "LC":
        erros.append("lingua_estrangeira_fora_de_LC")
    if not isinstance(r.get("question"), str) or not r["question"].strip():
        erros.append("enunciado_vazio")
    opts = r.get("options")
    if not isinstance(opts, list):
        erros.append("alternativas_ausentes")
    else:
        labels = [o.get("label") for o in opts if isinstance(o, dict)]
        if labels != LETRAS:
            erros.append("alternativas_rotulos_invalidos")
        if any(not isinstance(o.get("text"), str) or not o["text"].strip() for o in opts if isinstance(o, dict)):
            erros.append("alternativa_texto_vazio")
        # comparacao literal (so espacos/caixa): normalizar pontuacao confundiria "+" e "-" em formulas
        textos = [re.sub(r"\s+", " ", (o.get("text") or "")).strip().lower() for o in opts if isinstance(o, dict)]
        if len(set(textos)) != len(textos):
            erros.append("alternativas_duplicadas")
    if r.get("answer") not in LETRAS:
        erros.append("gabarito_invalido")
    tri = r.get("tri") or {}
    for p in ("a", "b", "c"):
        v = tri.get(p)
        if not (isinstance(v, (int, float)) and not isinstance(v, bool) and math.isfinite(v)):
            erros.append(f"tri_{p}_nao_finito")
    if not isinstance(r.get("year"), int):
        erros.append("ano_invalido")
    if r.get("split") not in ("train", "validation", "test"):
        erros.append("split_invalido")
    return erros


def esperado_split(ano: int) -> str:
    return "train" if ano <= 2022 else ("validation" if ano == 2023 else "test")


def midia_necessaria(r: dict[str, Any]) -> list[str]:
    caminhos = []
    for a in r.get("assets") or []:
        if isinstance(a, dict) and a.get("path"):
            caminhos.append(a["path"])
    for a in r.get("external_assets") or []:
        if isinstance(a, dict) and a.get("path"):
            caminhos.append(a["path"])
    if r.get("display_image"):
        caminhos.append(r["display_image"])
    return caminhos


# ---------------------------------------------------------------- duplicacao / familias
class _UF:
    def __init__(self):
        self.p: dict[str, str] = {}

    def find(self, x):
        self.p.setdefault(x, x)
        while self.p[x] != x:
            self.p[x] = self.p[self.p[x]]
            x = self.p[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.p[max(ra, rb)] = min(ra, rb)


def _shingles(texto: str, n: int = 3) -> set[str]:
    w = normalizar_texto(texto).split()
    return {" ".join(w[i:i + n]) for i in range(max(len(w) - n + 1, 1))} if w else set()


def agrupar_duplicacoes(rows: list[dict[str, Any]], limite: float, df_max: int) -> tuple[dict[str, str], dict[str, Any]]:
    """Grupo de conteudo = uniao de family_id, content_family_id, texto normalizado identico
    e Jaccard de trigramas de palavras >= limite. Retorna {id: grupo} e estatisticas."""
    uf = _UF()
    por_chave: dict[tuple[str, str], list[str]] = defaultdict(list)
    for r in rows:
        uf.find(r["id"])
        por_chave[("family", r.get("family_id") or r["id"])].append(r["id"])
        por_chave[("content_family", r.get("content_family_id") or r["id"])].append(r["id"])
        opts = " ".join(o.get("text", "") for o in (r.get("options") or []))
        por_chave[("texto", sha256_obj(normalizar_texto(r.get("question", "")) + "|" + normalizar_texto(opts)))].append(r["id"])
    motivos = Counter()
    for (tipo, _), ids in por_chave.items():
        for x in ids[1:]:
            if uf.find(x) != uf.find(ids[0]):
                motivos[tipo] += 1
            uf.union(ids[0], x)
    sh = {r["id"]: _shingles(r.get("question", "")) for r in rows}
    inv: dict[str, list[str]] = defaultdict(list)
    for i, s in sh.items():
        for g in s:
            inv[g].append(i)
    candidatos: Counter = Counter()
    for g, ids in inv.items():
        if len(ids) > df_max:
            continue
        for i in range(len(ids)):
            for j in range(i + 1, len(ids)):
                candidatos[(ids[i], ids[j])] += 1
    pares_jaccard = []
    for (x, y), inter in candidatos.items():
        uni = len(sh[x] | sh[y])
        if uni and len(sh[x] & sh[y]) / uni >= limite:
            jac = len(sh[x] & sh[y]) / uni
            pares_jaccard.append((x, y, round(jac, 4)))
            if uf.find(x) != uf.find(y):
                motivos["jaccard"] += 1
            uf.union(x, y)
    grupos = {r["id"]: "grp_" + uf.find(r["id"])[3:15] for r in rows}
    tam = Counter(grupos.values())
    return grupos, {
        "unioes_por_criterio": dict(motivos),
        "pares_jaccard_acima_limite": len(pares_jaccard),
        "exemplos_pares_jaccard": pares_jaccard[:20],
        "grupos_multiplos": sum(1 for v in tam.values() if v > 1),
        "itens_em_grupos_multiplos": sum(v for v in tam.values() if v > 1),
        "limitacao": "Triagem lexical: nao detecta parafrases, equivalencias matematicas nem conteudo visual.",
    }


# ---------------------------------------------------------------- pipeline
def executar(ds_dir: Path | None = None, saida: Path | None = None, cfg: dict[str, Any] | None = None,
             estrito: bool = True) -> dict[str, Any]:
    cfg = cfg or carregar_config()
    ds = Path(ds_dir) if ds_dir else dataset_dir(cfg)
    out = Path(saida) if saida else ARTEFATOS_DIR
    (out / "qualidade").mkdir(parents=True, exist_ok=True)
    checagens: list[dict[str, Any]] = []

    def chk(nome, ok, detalhe=None, severidade="erro"):
        checagens.append({"checagem": nome, "status": "ok" if ok else ("falha" if severidade == "erro" else "aviso"),
                          "detalhe": detalhe})
        return ok

    arquivos = {
        "questions": ds / "data" / "questions.jsonl",
        "elegiveis": ds / "ids_elegiveis.json",
        "train": ds / "splits" / "train.jsonl",
        "validation": ds / "splits" / "validation.jsonl",
        "test": ds / "splits" / "test.jsonl",
        "bloqueios": ds / "qualidade" / "bloqueios.json",
        "aviso_indices": ds / "AVISO_INDICES.json",
    }
    faltando = [k for k, p in arquivos.items() if not p.exists()]
    if faltando:
        raise FileNotFoundError(f"arquivos ausentes no dataset: {faltando}")
    hashes_brutos = {k: sha256_arquivo(p) for k, p in arquivos.items()}
    hashes = {k: sha256_lf(p) for k, p in arquivos.items()}
    ds_sha = hashes["questions"]
    chk("sha256_questions_confere", ds_sha == cfg["dataset"]["sha256_esperado"],
        {"obtido_lf": ds_sha, "obtido_bytes_locais": hashes_brutos["questions"], "esperado": cfg["dataset"]["sha256_esperado"],
         "nota": ("Hash calculado sobre o conteudo com finais de linha LF. O checkout local pode ter CRLF "
                  "(git core.autocrlf=true); o arquivo nao e alterado.")
                 if hashes_brutos["questions"] != ds_sha else "bytes locais identicos ao publicado"})

    rows = _ler_jsonl(arquivos["questions"])
    elegiveis_por_split = json.load(open(arquivos["elegiveis"], encoding="utf-8"))
    elegiveis = {i: s for s, ids in elegiveis_por_split.items() for i in ids}
    bloqueios = json.load(open(arquivos["bloqueios"], encoding="utf-8"))
    bloqueados = {b["id"]: b for b in bloqueios}
    aviso = json.load(open(arquivos["aviso_indices"], encoding="utf-8"))
    splits = {s: _ler_jsonl(arquivos[s]) for s in ("train", "validation", "test")}

    ids = [r.get("id") for r in rows]
    chk("ids_unicos", len(ids) == len(set(ids)), {"duplicados": [i for i, n in Counter(ids).items() if n > 1]})
    releases = Counter(r.get("release") for r in rows)
    chk("release_unico_esperado", set(releases) == {cfg["dataset"]["release_esperado"]}, dict(releases))
    por_id = {r["id"]: r for r in rows}
    # splits
    for s, lst in splits.items():
        ids_s = [x["id"] for x in lst]
        chk(f"split_{s}_registros_iguais_ao_catalogo",
            all(x["id"] in por_id and x == por_id[x["id"]] for x in lst), {"n": len(lst)})
        chk(f"split_{s}_campo_split_consistente", all(por_id[i]["split"] == s for i in ids_s if i in por_id))
    sets = {s: {x["id"] for x in l} for s, l in splits.items()}
    chk("splits_disjuntos_por_id", not (sets["train"] & sets["validation"] or sets["train"] & sets["test"]
                                         or sets["validation"] & sets["test"]))
    chk("splits_cobrem_catalogo", set().union(*sets.values()) == set(por_id), {"n_catalogo": len(por_id)})
    chk("split_temporal_por_ano", all(esperado_split(r["year"]) == r["split"] for r in rows if isinstance(r.get("year"), int)),
        {"regra": "treino<=2022, validacao=2023, teste=2024"})
    chk("elegiveis_existem_no_catalogo", all(i in por_id for i in elegiveis))
    chk("elegiveis_no_split_declarado", all(por_id[i]["split"] == s for i, s in elegiveis.items() if i in por_id))
    chk("elegiveis_tem_ready_text", all(por_id[i]["ready_text"] for i in elegiveis if i in por_id))
    chk("bloqueados_fora_dos_elegiveis", not (set(bloqueados) & set(elegiveis)), {"bloqueados": list(bloqueados)})
    chk("ready_text_sem_estar_elegivel", not [r["id"] for r in rows if r.get("ready_text") and r["id"] not in elegiveis],
        severidade="aviso")
    chk("aviso_indices_hash_derivado_confere", aviso.get("derivative_dataset_sha256") == ds_sha,
        {"vectors_included": aviso.get("vectors_included"), "refit_before_comparing": aviso.get("refit_before_comparing")})

    # schema por item
    erros_schema = {r.get("id", f"linha_{k}"): validar_item(r) for k, r in enumerate(rows)}
    erros_schema = {k: v for k, v in erros_schema.items() if v}
    erros_eleg = {k: v for k, v in erros_schema.items() if k in elegiveis}
    chk("schema_valido_nos_elegiveis", not erros_eleg, erros_eleg)
    chk("schema_valido_no_catalogo_total", not erros_schema,
        {"itens_com_erro": len(erros_schema), "tipos": dict(Counter(e for v in erros_schema.values() for e in v))},
        severidade="aviso")

    # midia
    midia_status = {}
    for r in rows:
        nec = midia_necessaria(r)
        faltam = [p for p in nec if not (ds / p).exists()]
        midia_status[r["id"]] = {"necessaria": nec, "ausentes": faltam}
    multimodal_sem_midia = sum(1 for r in rows if r.get("ready_multimodal") and midia_status[r["id"]]["ausentes"])
    chk("midia_disponivel_nos_elegiveis", not [i for i in elegiveis if midia_status[i]["ausentes"]])
    chk("ready_multimodal_com_midia_ausente", multimodal_sem_midia == 0,
        {"itens_ready_multimodal_sem_arquivo": multimodal_sem_midia,
         "nota": "ready_multimodal nao garante arquivos; esses itens nao sao oferecidos."}, severidade="aviso")

    # catalogo de conteudo (outro branch)
    alerta_grave: set[str] = set()
    cat_cont_info: dict[str, Any] = {"usado": False}
    cq = cfg["qualidade"]
    cam_cc = BACKEND_DIR / cq["catalogo_conteudo"]
    if cq.get("usar_alerta_grave_catalogo_conteudo") and cam_cc.exists():
        sha_cc = sha256_lf(cam_cc)
        cc = json.load(open(cam_cc, encoding="utf-8"))
        ok_hash = cc.get("base_sha256") == ds_sha
        chk("catalogo_conteudo_mesmo_corpus", ok_hash, {"base_sha256": cc.get("base_sha256")})
        chk("catalogo_conteudo_sha_procedencia", sha_cc == cq["catalogo_conteudo_procedencia"]["sha256"], {"sha256": sha_cc})
        if ok_hash:
            alerta_grave = {i for i, v in cc["questoes"].items() if v.get("alerta_grave")}
            cat_cont_info = {"usado": True, "sha256": sha_cc, "metodo": cc.get("metodo"),
                             "procedencia": cq["catalogo_conteudo_procedencia"], "itens_alerta_grave": len(alerta_grave)}

    # triagem + cortes
    validos_tri = [r for r in rows if r["id"] not in erros_schema or not any(e.startswith("tri_") for e in erros_schema[r["id"]])]
    tri_cfg = cfg["triagem_tri"]
    triagem = triar_parametros([r for r in validos_tri if r["id"] in elegiveis], tri_cfg)
    grupos, dup_stats = agrupar_duplicacoes(rows, cq["jaccard_trigramas_limite"], cq["jaccard_df_max_shingle"])

    def motivos_indisp(r) -> list[str]:
        m = []
        if r["id"] not in elegiveis:
            m.append("fora_da_lista_elegivel")
        if not r.get("ready_text"):
            m.append("ready_text_falso")
        if r["id"] in bloqueados:
            m.append("bloqueado")
        if r["id"] in erros_schema:
            m.append("schema_invalido")
        if midia_status[r["id"]]["ausentes"]:
            m.append("midia_ausente")
        if r["id"] in alerta_grave:
            m.append("alerta_grave_texto")
        return m

    aprovados_treino = [por_id[i] for i, s in elegiveis.items()
                        if s == "train" and not motivos_indisp(por_id[i]) and not triagem[i]["excluir"]]
    cortes = calcular_cortes(aprovados_treino, cfg["dificuldade"], ds_sha, tri_cfg["versao"])

    itens = []
    for r in rows:
        m = motivos_indisp(r)
        t = triagem.get(r["id"], {"excluir": False, "motivos": [], "sinais": []})
        faixa = None
        if not m and not t["excluir"]:
            faixa = faixa_de_b(r["tri"]["b"], cortes["cortes"][r["area"]])
        q_hash = sha256_obj({"question": r.get("question"), "options": r.get("options")})
        g_hash = sha256_obj({"id": r["id"], "answer": r.get("answer")})
        p_hash = sha256_obj({"tri": r.get("tri"), "cortes": cortes["versao"], "triagem": tri_cfg["versao"]})
        ped = r.get("pedagogy") or {}
        itens.append({
            "id": r["id"],
            "versao_id": f"{r['id']}:{q_hash[:12]}:{g_hash[:8]}",
            "questao_hash": q_hash,
            "gabarito_hash": g_hash,
            "parametros_hash": p_hash,
            "area": r.get("area"),
            "lingua": r.get("language"),
            "formato": r.get("application_format"),
            "tipo_aplicacao": r.get("application_type"),
            "ano": r.get("year"),
            "split": r.get("split"),
            "co_item": r.get("co_item"),
            "habilidade": None if r.get("skill") is None else str(r["skill"]),
            "habilidade_chave": None if r.get("skill") is None else f"{r['area']}:H{r['skill']}",
            "topico_regra": ped.get("topic_predicted"),
            "topico_status": ped.get("review_status"),
            "tri": r.get("tri"),
            "triagem": t,
            "faixa": faixa,
            "grupo_conteudo": grupos[r["id"]],
            "family_id": r.get("family_id"),
            "content_family_id": r.get("content_family_id"),
            "disponivel": not m,
            "motivos_indisponivel": m,
            "enunciado": r.get("question"),
            "alternativas": r.get("options"),
            "gabarito": r.get("answer"),
            "release": r.get("release"),
            "procedencia": {"evidence_id": r.get("evidence_id"), "source_ids": r.get("source_ids"),
                            "official_reference": r.get("official_reference"), "tier": r.get("tier")},
        })

    # vazamento entre splits por grupo de conteudo
    split_por_grupo = defaultdict(set)
    for it in itens:
        if it["id"] in elegiveis:
            split_por_grupo[it["grupo_conteudo"]].add(it["split"])
    grupos_cruzando = [g for g, s in split_por_grupo.items() if len(s) > 1]
    chk("grupos_de_conteudo_nao_cruzam_splits_elegiveis", not grupos_cruzando, {"grupos": grupos_cruzando[:20]},
        severidade="aviso")

    # resumo / distribuicoes
    disp = [it for it in itens if it["disponivel"]]
    com_faixa = [it for it in disp if it["faixa"]]
    dist = defaultdict(Counter)
    for it in com_faixa:
        dist[f"{it['split']}"][f"{it['area']}:{it['faixa']}"] += 1
    excl_tri = [{"id": i, "area": por_id[i]["area"], "split": por_id[i]["split"], "tri": por_id[i]["tri"],
                 "motivos": v["motivos"]} for i, v in triagem.items() if v["excluir"]]
    sinal_tri = Counter(s for v in triagem.values() for s in v["sinais"])
    medianas_formato = {}
    for area in AREAS:
        for fmt in ("standard", "adapted_accessible"):
            for tipo in ("regular", "second_application"):
                bs = sorted(it["tri"]["b"] for it in disp if it["area"] == area and it["formato"] == fmt and it["tipo_aplicacao"] == tipo)
                if bs:
                    medianas_formato[f"{area}|{fmt}|{tipo}"] = {"n": len(bs), "mediana_b": round(bs[len(bs) // 2], 4)}
    pares_cf = []
    by_cf = defaultdict(list)
    for it in itens:
        if it["id"] in elegiveis:
            by_cf[it["content_family_id"]].append(it)
    for v in by_cf.values():
        if len(v) > 1:
            pares_cf.append([{"id": x["id"], "formato": x["formato"], "b": x["tri"]["b"], "split": x["split"]} for x in v])

    relatorio = {
        "gerado_em": datetime.now(timezone.utc).isoformat(),
        "dataset": {"caminho": str(ds), "release": cfg["dataset"]["release_esperado"], "sha256_arquivos": hashes,
                    "sha256_bytes_locais": hashes_brutos},
        "contagens": {
            "catalogo": len(rows),
            "por_split": {s: len(l) for s, l in splits.items()},
            "elegiveis": {s: len(v) for s, v in elegiveis_por_split.items()},
            "bloqueados": len(bloqueados),
            "por_area_lingua": dict(Counter(f"{r['area']}:{r['language']}" for r in rows)),
            "disponiveis_para_oferta": len(disp),
            "disponiveis_com_faixa": len(com_faixa),
            "motivos_indisponivel": dict(Counter(m for it in itens for m in it["motivos_indisponivel"])),
            "elegiveis_indisponiveis": dict(Counter(m for it in itens if it["id"] in elegiveis for m in it["motivos_indisponivel"])),
            "habilidade_ausente_disponiveis": sum(1 for it in disp if it["habilidade"] is None),
            "habilidades_distintas_area_skill": len({it["habilidade_chave"] for it in disp if it["habilidade_chave"]}),
        },
        "checagens": checagens,
        "triagem_tri": {"regras": tri_cfg, "excluidos": excl_tri, "n_excluidos": len(excl_tri),
                        "sinais_informativos": dict(sinal_tri),
                        "nota": "Valores originais preservados; excluidos ficam sem faixa e fora dos modos nivel/adaptativo."},
        "cortes": cortes,
        "distribuicao_faixas_por_split": {k: dict(v) for k, v in dist.items()},
        "duplicacoes": dup_stats,
        "pares_familia_conteudo_elegiveis": pares_cf,
        "escala": {"medianas_b_por_area_formato_tipo": medianas_formato,
                   "D_confirmado": cfg["irt"]["D_confirmado"],
                   "escala_comparavel_verificada": cfg["irt"]["escala_comparavel_verificada"],
                   "nota": ("Origem declarada dos parametros: tabela de itens do Inep (evidence_id). A documentacao local nao "
                            "informa D nem comprova equalizacao entre anos/formatos; pares da mesma familia de conteudo em "
                            "formato padrao x adaptado tem b diferentes. Adaptativo restrito a grupos de escala configurados "
                            "e marcado como experimental.")},
        "midia": {"ready_multimodal_sem_arquivo": multimodal_sem_midia,
                  "itens_com_midia_necessaria": sum(1 for v in midia_status.values() if v["necessaria"])},
        "catalogo_conteudo": cat_cont_info,
        "aviso_indices": aviso,
        "pedagogia": {"nota": "Topicos de pedagogy gerados por regras sem revisao humana; usados apenas como sinal fraco de diversidade.",
                      "status": dict(Counter((r.get("pedagogy") or {}).get("review_status") for r in rows))},
        "interacoes_reais": {"encontradas": False,
                             "nota": "Nenhum historico de respostas de alunos no dataset nem nos branches do repositorio."},
    }
    falhas = [c for c in checagens if c["status"] == "falha"]
    relatorio["resultado"] = "aprovado" if not falhas else "reprovado"

    manifesto = {
        "dataset_sha256": ds_sha,
        "release": cfg["dataset"]["release_esperado"],
        "cortes_versao": cortes["versao"],
        "triagem_versao": tri_cfg["versao"],
        "politica_versao": versao_politica(cfg),
        "catalogo_sha256": None,
        "gerado_em": relatorio["gerado_em"],
    }
    cat_obj = {"manifesto": manifesto, "itens": itens}
    cat_path = out / "catalogo.json"
    with open(cat_path, "w", encoding="utf-8") as f:
        json.dump(cat_obj, f, ensure_ascii=False)
    manifesto["catalogo_sha256"] = sha256_arquivo(cat_path)
    _dump(out / "cortes.json", cortes)
    _dump(out / "manifesto.json", manifesto)
    _dump(out / "qualidade" / "relatorio_qualidade.json", relatorio)
    (out / "qualidade" / "relatorio_qualidade.md").write_text(_md_qualidade(relatorio), encoding="utf-8")
    if estrito and falhas:
        raise RuntimeError(f"auditoria reprovada: {[c['checagem'] for c in falhas]}")
    return relatorio


def _dump(p: Path, obj):
    with open(p, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)


def _md_qualidade(r: dict[str, Any]) -> str:
    c = r["contagens"]
    L = ["# Relatório de qualidade dos dados — Gabaritei", "",
         f"Gerado em {r['gerado_em']}. Resultado da auditoria: **{r['resultado']}**.", "",
         f"SHA-256 de `questions.jsonl`: `{r['dataset']['sha256_arquivos']['questions']}` (release {r['dataset']['release']}).", "",
         "## Contagens", "", "| Item | Valor |", "|---|---:|",
         f"| Questões no catálogo | {c['catalogo']} |"]
    for s, n in c["por_split"].items():
        L.append(f"| Split {s} (linhas) | {n} |")
    for s, n in c["elegiveis"].items():
        L.append(f"| Elegíveis {s} | {n} |")
    L += [f"| Bloqueados | {c['bloqueados']} |",
          f"| Disponíveis para oferta | {c['disponiveis_para_oferta']} |",
          f"| Disponíveis com faixa (após triagem TRI) | {c['disponiveis_com_faixa']} |",
          f"| Habilidades distintas (area, skill) | {c['habilidades_distintas_area_skill']} |",
          f"| Disponíveis sem habilidade | {c['habilidade_ausente_disponiveis']} |", "",
          "Motivos de indisponibilidade entre os elegíveis: " + (", ".join(f"{k}={v}" for k, v in c["elegiveis_indisponiveis"].items()) or "nenhum") + ".", "",
          "## Checagens", "", "| Checagem | Status |", "|---|---|"]
    for ch in r["checagens"]:
        L.append(f"| {ch['checagem']} | {ch['status']} |")
    t = r["triagem_tri"]
    L += ["", "## Triagem de parâmetros TRI", "",
          f"Regras (fixadas antes dos cortes): a < {t['regras']['a_minimo']}; ou b > {t['regras']['b_alto']} com a < {t['regras']['a_minimo_quando_b_alto']}. "
          f"Itens excluídos: **{t['n_excluidos']}** (valores originais preservados; ficam sem faixa).", "",
          "| id | área | split | a | b | c | motivos |", "|---|---|---|---:|---:|---:|---|"]
    for e in t["excluidos"]:
        L.append(f"| {e['id']} | {e['area']} | {e['split']} | {e['tri']['a']} | {e['tri']['b']} | {e['tri']['c']} | {', '.join(e['motivos'])} |")
    L += ["", f"Sinais informativos (sem exclusão): {t['sinais_informativos']}.", "",
          "## Cortes de dificuldade (congelados)", "",
          f"Versão `{r['cortes']['versao']}`, tercis de tri.b por área no treino aprovado. {r['cortes']['aviso']}", "",
          "| Área | c1 (fácil ≤) | c2 (média ≤) | n treino |", "|---|---:|---:|---:|"]
    for a, v in r["cortes"]["cortes"].items():
        L.append(f"| {a} | {v['c1']} | {v['c2']} | {v['n']} |")
    L += ["", "## Distribuição de faixas (disponíveis)", ""]
    for s, d in r["distribuicao_faixas_por_split"].items():
        L.append(f"- **{s}**: " + ", ".join(f"{k}={v}" for k, v in sorted(d.items())))
    d = r["duplicacoes"]
    L += ["", "## Duplicações e famílias de conteúdo", "",
          f"Grupos com mais de um item: {d['grupos_multiplos']} ({d['itens_em_grupos_multiplos']} itens). "
          f"Uniões por critério: {d['unioes_por_criterio']}. Pares Jaccard ≥ limite: {d['pares_jaccard_acima_limite']}. {d['limitacao']}", "",
          f"Pares de família de conteúdo entre elegíveis (padrão × adaptado): {len(r['pares_familia_conteudo_elegiveis'])}; "
          "os valores de b diferem dentro do par, o que reforça a cautela sobre comparabilidade de escala.", "",
          "## Escala e parâmetro D", "", r["escala"]["nota"], "",
          "## Mídia", "", f"Itens marcados `ready_multimodal` sem arquivo local: {r['midia']['ready_multimodal_sem_arquivo']} (não oferecidos).", "",
          "## Pedagogia e interações", "", r["pedagogia"]["nota"], "", r["interacoes_reais"]["nota"], ""]
    return "\n".join(L)


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--dataset", type=Path)
    ap.add_argument("--saida", type=Path)
    a = ap.parse_args(argv)
    rel = executar(a.dataset, a.saida)
    print(json.dumps({"resultado": rel["resultado"], "contagens": rel["contagens"], "cortes": rel["cortes"]["cortes"],
                      "cortes_versao": rel["cortes"]["versao"], "triagem_excluidos": rel["triagem_tri"]["n_excluidos"]},
                     ensure_ascii=False, indent=2))


if __name__ == "__main__":
    sys.exit(main())
