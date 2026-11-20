import argparse
from collections import Counter, defaultdict
import csv
import hashlib
import json
import math
from pathlib import Path
import re
import sys
import unicodedata

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
CATALOG_HASH = "22d83ac5d269976b647d34cb8aa66ccbebec6c21b0773487926eb294ee69fbd5"
MATRIX_HASH = "6b56d523ccb85f74f7ed33e0cd679f3dd178ed6f13a5b0948bcfdfe8964ce6a1"
REV = "7e720fa876beb7249adab2f05d3ecf33ae5a2c51"
PASS, FAIL, WAIT = "APROVADO", "REPROVADO", "PENDENTE"
FLAGS = ("apto_texto_semantico", "apto_treino_supervisionado", "apto_recomendacao", "apto_demo")
HOLD = {"hold_for_source_review", "image_required_text_disabled", "presentation_hold_concrete_poem",
        "corrected_secondary_source_hold", "additional_math_notation_hold",
        "normalized_from_indexed_primary_pending_visual"}
VISUAL = re.compile(r"\b(?:figura|gráfico|gráficos|quadro|tabela|mapa|imagem|diagrama|esquema|tirinha|charge)\b", re.I)
LINK = re.compile(r"\b(?:abaixo|acima|a seguir|seguinte|apresentad\w+|mostrad\w+|ilustrad\w+|representad\w+)\b", re.I)
SHORT_REF = re.compile(r"\b(?:esse fragmento|nessa letra|segundo esse pesquisador|texto acima|dados fornecidos|"
                       r"elevação de temperatura descrita|estimativa for alcançada|com base no texto|"
                       r"(?:no|do|pelo|a partir do) texto|texto [i1]+)\b", re.I)
PLACEHOLDER = re.compile(r"\ufffd|!\[[^\]]*\]\(|<\s*img\b|\[(?:imagem|figura|gráfico|tabela)\]", re.I)
TASK = "classificacao_exploratoria_area_oficial_4_classes"


def read_csv(path, encoding="utf-8-sig"):
    with path.open(encoding=encoding, newline="") as f:
        return list(csv.DictReader(f, delimiter=";"))


def read_json(path):
    return json.loads(path.read_bytes())


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_csv(out, name, rows, fields=None):
    with (out / name).open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields or list(rows[0]), delimiter=";")
        writer.writeheader()
        for row in rows:
            writer.writerow({k: "'" + v if isinstance(v, str) and v.lstrip().startswith(("=", "+", "-", "@"))
                             else v for k, v in row.items()})


def write_jsonl(out, name, rows):
    with (out / name).open("w", encoding="utf8", newline="\n") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")


def clean(text):
    return "\n".join(" ".join(line.split()) for line in
                      unicodedata.normalize("NFC", text or "").splitlines()).strip()


def option_text(option):
    text = clean(option.get("text"))
    return re.sub(rf"^{re.escape(option.get('label', ''))}\s+(?=[a-záéíóúàâêôãõç])", "", text, count=1)


def tokens(text):
    return re.findall(r"\w+", (text or "").casefold())


def group_items(rows):
    """Agrupa a união de chaves de origem, famílias e semelhança textual."""
    parent = {r["id"]: r["id"] for r in rows}
    keys = defaultdict(list)
    inverted = defaultdict(list)
    seen_shingles = {}
    near = []

    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    def union(a, b):
        a, b = sorted((find(a), find(b)))
        parent[b] = a

    for r in sorted(rows, key=lambda r: r["id"]):
        i = r["id"]
        words = tokens(r["question"])
        for name, key in (("item", r["co_item"]), ("familia", r["family_id"]),
                          ("familia_conteudo", r["content_family_id"]),
                          ("exato", tuple(words) if len(words) >= 8 else None)):
            if key:
                members = keys[name, key]
                if members:
                    union(i, members[0])
                members.append(i)
        if len(words) < 25:
            continue
        shingles = {tuple(words[n:n+5]) for n in range(len(words)-4)}
        overlaps = Counter(j for s in shingles for j in inverted[s])
        for j, shared in sorted(overlaps.items()):
            similarity = shared / (len(shingles) + seen_shingles[j] - shared)
            if similarity >= .85:
                union(i, j)
                near.append({"id_1": j, "id_2": i, "jaccard_5_tokens": round(similarity, 6)})
        for s in shingles:
            inverted[s].append(i)
        seen_shingles[i] = len(shingles)
    groups = {i: find(i) for i in parent}
    duplicate_counts = {name: sum(len(ids) for (kind, _), ids in keys.items() if kind == name and len(ids)>1)
                        for name in ("item", "familia", "familia_conteudo", "exato")}
    return groups, near, duplicate_counts


def intended_split(year):
    return "train" if year <= 2022 else "validation" if year == 2023 else "test"


def criterion(status, reason, evidence, method):
    return status, reason, evidence, method


def official_tables(root):
    expected = read_json(root / "dificuldade-adaptativa/validacao_tri/auditoria.json")["tabelas_sha256"]
    index = defaultdict(list)
    hashes = {}
    for name, fingerprint in sorted(expected.items()):
        path = root / "inep_tabelas" / Path(name).name
        hashes[path.name] = sha(path)
        assert hashes[path.name] == fingerprint, path
        for r in read_csv(path, "latin1"):
            key = (path.name.upper(), r["CO_ITEM"], r["CO_PROVA"], r["CO_POSICAO"], r["SG_AREA"])
            index[key].append(r)
    assert len(hashes) == 16
    return index, hashes


def official_row(index, r):
    ref = r["official_reference"]
    key = tuple(str(v) for v in (ref["source_file"].upper(), r["co_item"], ref["co_prova"], ref["position"], r["area"]))
    rows = index.get(key, [])
    return rows[0] if len(rows) == 1 and ref["year"] == r["year"] else {}


def reviewed_sources(out, directed):
    """Valida os documentos usados e gera o recorte necessário à versão derivada."""
    import fitz

    expected = read_json(out / "fontes/hashes_documentais.json")
    for name, fingerprint in expected.items():
        assert sha(out / "fontes" / name) == fingerprint, name
    for r in directed.values():
        with fitz.open(out / "fontes" / r["caderno"]) as doc:
            page = doc[r["pagina"]-1]
            if "recorte" in r:
                path = out / r["midia"]
                path.parent.mkdir(exist_ok=True)
                page.get_pixmap(matrix=fitz.Matrix(2, 2), clip=fitz.Rect(*r["recorte"]), alpha=False).save(path)
        with fitz.open(out / "fontes" / r["gabarito"]) as doc:
            r["resposta_pdf"] = next((m[1] for p in doc for m in re.finditer(
                rf"(?m)^\s*{r['questao']}\s+([A-E])\s*$", p.get_text())), "")
        r["fonte"] = f"{r['caderno']} p.{r['pagina']} item {r['questao']} + {r['gabarito']}"


def evaluate(r, old, pedagogical, index, matrix, reviewed, inherited, blocked, base, duplicate):
    i = r["id"]
    ref = r["official_reference"]
    source = f"{ref['source_file']} CO_ITEM={r['co_item']} CO_PROVA={ref['co_prova']} posição={ref['position']}"
    original = r["question"]
    q = clean(reviewed.get("enunciado_derivado", original))
    options = [{"label": o["label"], "text": option_text(o)} for o in r["options"] or []]
    answer = r.get("answer")
    labels = {o["label"] for o in options}
    quality = r["quality_review"]["status"]
    row = official_row(index, r)
    answer_match = bool(row) and row.get("TX_GABARITO") == answer
    source_pdf = reviewed.get("fonte", "")
    verified_pdf = bool(reviewed) and not reviewed.get("conflito")
    if verified_pdf:
        assert answer_match and reviewed["resposta_pdf"] == answer and reviewed["questao"] == ref["position"], (i, reviewed)
        assert " ".join(tokens(reviewed["trecho"])) in " ".join(tokens(" ".join(o["text"] for o in options))), i
    approved_inherited = bool(inherited) and inherited[0] == "A" and inherited[1].casefold() in original.casefold()
    strong = verified_pdf or approved_inherited
    allowed_format = r["application_format"] in {"standard", "adapted_accessible"}
    structural = bool(q) and len(options) == 5 and labels == set("ABCDE") and all(o["text"] for o in options)
    structural = structural and answer in labels and not PLACEHOLDER.search(q)
    assert allowed_format, r["application_format"]
    abandoned = r.get("is_abandoned_official") is True
    prior_confirmed = inherited and inherited[0] in {"C", "D"} and i in {
        "gq_1bf495a5eda4568d0ea676d2", "gq_5c7299002e00448c6c2648fd", "gq_1e4dd7b7469c9b787dcac8ad",
        "gq_45d61e89cfd14d7ed685d8b4", "gq_d729403b0e500b7ef02bef0a"}
    paths = [a["path"] for a in r.get("assets", [])]
    absent = [p for p in paths if not (base / p).is_file() and not (base / "data" / p).is_file()]
    pointer = next((m[0] for m in VISUAL.finditer(q) if LINK.search(q[max(0,m.start()-38):m.end()+42])), "")
    qlen = len(tokens(q))
    short_ref = SHORT_REF.search(q) if qlen < 32 else None
    needs_context = bool(pointer or short_ref or pedagogical["ponteiro_visual_sem_asset"] == "True")
    hold = quality in HOLD or i in blocked
    critical = []
    if not structural or abandoned or (row and not answer_match):
        critical.append("estrutura_gabarito_ou_anulacao")
    if prior_confirmed and not verified_pdf:
        critical.append("material_ou_enunciado_incompleto_confirmado")
    if absent and not verified_pdf:
        critical.append("arquivo_referenciado_indisponivel_para_exibicao")
    if hold and not verified_pdf:
        critical.append("bloqueio_editorial_da_origem")
    text_ok = (structural and answer_match and not abandoned and not duplicate and
               (strong or (not critical and not paths and not needs_context and qlen >= 8)))
    # Este perfil semântico recebe apenas texto. Um gráfico separado não entra como texto.
    text_ok = bool(text_ok and not reviewed.get("midia"))
    recommendation = bool(structural and answer_match and strong and not critical and not duplicate)
    demo = recommendation and not reviewed.get("midia") and not reviewed.get("tabela_embutida")
    c1 = (criterion(FAIL, "estrutura_gabarito_ou_anulacao", source, "automática/documental")
          if "estrutura_gabarito_ou_anulacao" in critical else
          criterion(FAIL, "enunciado_truncado_confirmado", inherited[1], "leitura dirigida")
          if prior_confirmed and not verified_pdf else
          criterion(PASS, "enunciado_opcoes_gabarito_conferidos", source_pdf or inherited[1], "leitura dirigida")
          if strong else
          criterion(WAIT, "completude_ou_gabarito_sem_conferencia_integral", source, "automática/documental"))
    c2 = criterion(PASS if row else WAIT, "vinculo_tabular_unico" if row else "vinculo_nao_confirmado",
                   source, "documental")
    topic, sub = pedagogical["assunto_original"], pedagogical["subassunto_original"]
    code = f"H{r['skill']}" if r["skill"] else ""
    descriptor = matrix[r["area"]].get(code, {})
    skill_official = bool(descriptor) and row.get("CO_HABILIDADE") == str(r["skill"])
    skill_status = ("ausente" if not code else "contraditorio" if not descriptor or (row.get("CO_HABILIDADE")
                    and not skill_official) else "confirmado_tabela" if skill_official else "formal_sem_vinculo")
    explicit_topic_conflict = i == "gq_e898766ae6adc513f38c0641"
    topic_status = ("ausente" if not topic else "contraditorio" if explicit_topic_conflict else
                    "plausivel_leitura" if approved_inherited else pedagogical["assunto_status"])
    semantic_evidence = " | ".join(filter(None, [f"{r['area']}:{code}", descriptor.get("descritor_extraido"),
                                                 reviewed.get("parecer") or (inherited[2] if inherited else ""),
                                                 f"assunto: {topic_status}"]))
    c3 = (criterion(FAIL, "conflito_pedagogico_documentado", semantic_evidence, "documental/leitura dirigida")
          if explicit_topic_conflict or skill_status == "contraditorio" else
          criterion(PASS, "habilidade_e_assunto_plausiveis_com_evidencia", semantic_evidence, "leitura dirigida/documental")
          if skill_official and approved_inherited and topic and sub else
          criterion(WAIT, "rotulo_ausente" if not topic or not code else "coerencia_pedagogica_a_conferir",
                    semantic_evidence, "documental/triagem"))
    c4 = (criterion(FAIL, "variante_duplicada_reservada", duplicate, "automática")
          if duplicate else criterion(FAIL, "defeito_estrutural", source, "automática")
          if not structural else criterion(FAIL, "enunciado_incompleto_documentado", inherited[1], "leitura dirigida")
          if prior_confirmed and not verified_pdf else
          criterion(WAIT, "alerta_editorial_em_aberto", quality, "documental")
          if hold and not verified_pdf else
          criterion(PASS, "sem_colisao_ou_defeito_estrutural_detectado", f"{i} | {r['content_family_id']}", "automática"))
    tri = r["tri"]
    valid_tri = all(math.isfinite(tri[k]) for k in "abc") and tri["a"] > 0 and 0 <= tri["c"] <= 1
    try:
        same_tri = bool(row) and all(math.isclose(tri[k], float(row[f"NU_PARAM_{k.upper()}"].replace(",", ".")),
                                                  rel_tol=0, abs_tol=5e-6) for k in "abc")
    except (ValueError, KeyError):
        same_tri = False
    c5 = criterion(PASS if valid_tri and same_tri else FAIL if not valid_tri else WAIT,
                   "tri_conferida_sem_equivalencia_entre_edicoes" if valid_tri and same_tri else
                   "tri_fora_do_dominio" if not valid_tri else "tri_sem_conferencia_tabular", source, "documental")
    support = reviewed.get("midia") or ("tabela no enunciado" if reviewed.get("tabela_embutida") else "")
    c6 = (criterion(PASS, "material_indispensavel_conferido" if support else
                    "não aplicável: enunciado autossuficiente", source_pdf or inherited[1], "leitura dirigida")
          if strong else criterion(FAIL, "arquivo_referenciado_ausente", " | ".join(absent), "automática")
          if absent else criterion(FAIL, "material_indispensavel_ausente_ou_incompativel",
                                     inherited[1], "leitura dirigida") if prior_confirmed else
          criterion(WAIT, "dependencia_de_material_a_verificar" if needs_context or paths else
                    "autossuficiencia_sem_leitura_integral", pointer or (short_ref[0] if short_ref else quality), "triagem"))
    assert not recommendation or c6[0] == PASS
    if duplicate:
        critical.append("variante_duplicada_reservada")
    right = "revisao_de_direitos_pendente" if r["license"]["public_review_required"] else "verificar_escopo_da_licenca"
    flags = dict(zip(FLAGS, (text_ok, bool(text_ok and row), recommendation, bool(demo))))
    reasons = [key for key, val in flags.items() if val]
    text_reason = ("texto_para_busca_sem_gabarito_na_entrada" if text_ok else "grafico_necessario"
                   if reviewed.get("midia") else "|".join(critical) if critical else
                   "referencia_a_contexto_sem_verificacao" if needs_context or paths else
                   "texto_insuficiente" if qlen < 8 else "gabarito_ou_vinculo_sem_conferencia")
    result = {"id": i, "ano": r["year"], "area": r["area"], "formato": r["application_format"],
              "aplicacao": r["application_type"], "co_item": r["co_item"], "co_prova": ref["co_prova"],
              "family_id":r["family_id"], "content_family_id":r["content_family_id"],
              "posicao": ref["position"], "fonte": source, "origem_conteudo": r["evidence_id"],
              "fonte_revisao": source_pdf, "grupo_anterior": old["grupo"], "criterio_anterior": old["criterio"],
              "piloto_anterior": old["piloto_anterior"], "split_original": r["split"],
              "status_origem": quality, "assunto": topic, "subassunto": sub, "assunto_status": topic_status,
              "habilidade": code, "habilidade_status": skill_status, "descritor_oficial": descriptor.get("descritor_extraido"),
              "tri_a": tri["a"], "tri_b": tri["b"], "tri_c": tri["c"],
              "tri_alerta": "|".join(k for k, v in (("a_baixo", tri["a"]<.25), ("b_extremo", abs(tri["b"])>5),
                                                  ("c_alto", tri["c"]>.35)) if v),
              "imagens_cadastradas": len(paths), "recursos_ausentes": "|".join(absent),
              "recurso_derivado": support, "classe_supervisionada": r["area"] if flags[FLAGS[1]] else "",
              "gabarito": answer, "gabarito_tabela": row.get("TX_GABARITO"), "restricao_direitos": right,
              "licenca_origem": r["license_status"], "origem_recuperacao": reviewed.get("parecer", ""),
              "confianca": "leitura_dirigida_e_documental" if strong else "triagem_documental_automatizada",
              "falhas_criticas": "|".join(critical), "bloqueado": bool(critical), "motivo_texto":text_reason,
              "motivo_decisao_final": ("|".join(reasons) if reasons else "sem_uso_aprovado") +
                                       ("; " + "|".join(critical) if critical else ""),
              **flags}
    for number, entry in enumerate((c1,c2,c3,c4,c5,c6), 1):
        for col, value in zip(("status", "motivo", "evidencia", "metodo"), entry):
            result[f"c{number}_{col}"] = value
    counts = Counter(result[f"c{n}_status"] for n in range(1,7))
    result.update(nota_0a6=counts[PASS], n_pendentes=counts[WAIT], n_reprovados=counts[FAIL],
                  pendente=bool(counts[WAIT]))
    # O texto de entrada contém as alternativas na ordem original e nunca o gabarito.
    embedding = q + "\n\n" + "\n".join(o["text"] for o in options)
    return result, q, options, embedding


def run(root, out):
    base = root / "base-oficial/Dataset/base_trabalho"
    previous = root / "dificuldade-adaptativa/catalogo_mvp"
    catalog = base / "data/questions.jsonl"
    data = catalog.read_bytes().replace(b"\r\n", b"\n")
    assert hashlib.sha256(data).hexdigest() == CATALOG_HASH
    items = [json.loads(line) for line in data.splitlines()]
    item_map = {r["id"]: r for r in items}
    assert len(items) == len(item_map) == 2971
    old = {r["id"]: r for r in read_csv(previous / "auditoria_todas_questoes.csv")}
    pedagogy_path = root / "dificuldade-adaptativa/revisao_pedagogica/catalogo_derivado.csv"
    pedagogy = {r["id"]: r for r in read_csv(pedagogy_path)}
    assert item_map.keys() == old.keys() == pedagogy.keys()
    inherited = read_json(previous / "evidencias.json")
    directed = read_json(out / "revisao_dirigida.json")
    reviewed_sources(out, directed)
    from pypdf import PdfReader
    sys.path.insert(0, str(previous))
    from matriz import extract
    matrix_pdf = out / "fontes/matriz_inep.pdf"
    assert sha(matrix_pdf) == MATRIX_HASH and len(PdfReader(matrix_pdf).pages) == 24
    matrix = extract(matrix_pdf)
    index, table_hashes = official_tables(root)
    blocked = {r["id"] for r in read_json(base / "qualidade/bloqueios.json")}
    lookup = {k: {**r, "question": directed.get(k, {}).get("enunciado_derivado", r["question"])}
              for k,r in item_map.items()}
    groups, near, dup = group_items(lookup.values())
    members = defaultdict(list)
    for r in items:
        members[groups[r["id"]]].append(r)
    representatives = {g: min(v, key=lambda r: (
        not (r["id"] in directed and not directed[r["id"]].get("conflito")),
        r["id"] in blocked, bool(r["assets"]), not r["ready_text"], r["id"]))["id"]
        for g,v in members.items()}
    cross = {g for g,v in members.items() if len({intended_split(r["year"]) for r in v}) > 1}
    historical_cross = {g for g,v in members.items() if len({r["split"] for r in v}) > 1}
    audit, semantic, recs, pend = [], [], [], []
    for r in items:
        i = r["id"]
        g = groups[i]
        other = representatives[g] if representatives[g] != i else ""
        review = directed.get(i,{})
        d, q, options, embedding = evaluate(r, old[i], pedagogy[i], index, matrix, review,
                                             inherited.get(i), blocked, base, other)
        split = ("quarentena_entre_edicoes" if g in cross else intended_split(r["year"])) if d[FLAGS[0]] else "fora"
        d.update(grupo_duplicatas=g, n_no_grupo=len(members[g]), representante=representatives[g],
                 split_proposto=split, cruzava_particao_anterior=g in historical_cross)
        d["pendente"] = d["pendente"] or split == "quarentena_entre_edicoes"
        audit.append(d)
        shared = {k: d[k] for k in ("id","ano","area","formato","co_item","co_prova","posicao","fonte","grupo_duplicatas",
                                    "family_id","content_family_id",
                                    "restricao_direitos","habilidade","assunto")}
        shared["revisao_base"] = REV
        if d[FLAGS[0]]:
            semantic.append({**shared, "split":split, "texto_entrada":embedding,
                             "classe_alvo_separada":d["classe_supervisionada"], "tarefa_alvo":TASK if d[FLAGS[1]] else ""})
        if d[FLAGS[2]]:
            recs.append({**shared, "enunciado":q, "alternativas":options, "gabarito":d["gabarito"],
                         "recursos":[review["midia"]] if review.get("midia") else [],
                         "requer_renderizacao_tabela":bool(review.get("tabela_embutida")),
                         "fonte_revisao":d["fonte_revisao"] or "catalogo_mvp/evidencias.json",
                         "variante":"derivada_inep" if review.get("enunciado_derivado") else "catalogo_original",
                         "apto_demo":d["apto_demo"]})
        for k in range(1, 7):
            state = d[f"c{k}_status"]
            if state == PASS:
                continue
            action = ("Conferir caderno, alternativas e gabarito", "Resolver vínculo com tabela oficial",
                      "Revisar habilidade e assunto com especialista", "Conferir colisão ou alerta de edição",
                      "Reconciliar TRI com tabela da edição", "Localizar/inspecionar material no caderno oficial")[k-1]
            pend.append({"id":i,"criterio":f"C{k}","falha":d[f"c{k}_motivo"],"acao":action,
                         "prioridade":"alta" if k in (1,6) and d["bloqueado"] else "media",
                         "origem":d[f"c{k}_evidencia"],"status":state})
        if split == "quarentena_entre_edicoes":
            pend.append({"id":i,"criterio":"split","falha":"familia_em_mais_de_uma_edicao_de_avaliacao",
                         "acao":"Revisar família antes de usar em treino ou avaliação","prioridade":"alta",
                         "origem":g,"status":WAIT})
    summarize(root, out, audit, semantic, recs, pend, near, dup, cross, historical_cross, table_hashes)


def summarize(root, out, audit, semantic, recs, pend, near, dup, cross, historical_cross, table_hashes):
    notes, panel, cover, historical, transitions = [], Counter(), Counter(), Counter(), Counter()
    for note in range(7):
        batch = [d for d in audit if d["nota_0a6"] == note]
        notes.append({"nota":note,"n":len(batch), **{f:sum(d[f] for d in batch) for f in FLAGS},
                      "n_com_pendencia":sum(d["pendente"] for d in batch),
                      "n_com_falha_critica":sum(d["bloqueado"] for d in batch)})
    for d in audit:
        group = d["grupo_anterior"]
        for reason in d["criterio_anterior"].split("|"):
            historical[group,reason] += 1
        for k in range(1,7):
            panel[d["area"],f"C{k}",d[f"c{k}_status"],d[f"c{k}_motivo"]] += 1
        populations = ["todos", *(f for f in FLAGS if d[f])]
        for f in populations:
            for axis in ("assunto","habilidade","ano","formato","classe_supervisionada","split_proposto",
                         "split_original","imagens_cadastradas","recursos_ausentes","restricao_direitos"):
                value = str(d[axis] or "<ausente>")
                if axis == "recursos_ausentes":
                    value = "sim" if d[axis] else "não"
                cover[f,d["area"],axis,value] += 1
        for f in FLAGS:
            transitions[group,f,str(d[f])] += 1
    reported_statuses = {(area, criterion, state) for area, criterion, state, _ in panel}
    for area in sorted({d["area"] for d in audit}):
        for k in range(1,7):
            for state in (PASS, FAIL, WAIT):
                if (area, f"C{k}", state) not in reported_statuses:
                    panel[area,f"C{k}",state,"sem_ocorrencia"] = 0
    write_csv(out, "catalogo_elegibilidade.csv", audit)
    write_csv(out, "pendencias_recuperacao.csv", pend)
    write_csv(out, "distribuicao_notas.csv", notes)
    write_csv(out, "painel_criterios.csv", [{"area":a,"criterio":k,"status":s,"motivo":m,"n":n}
                                           for (a,k,s,m),n in sorted(panel.items())])
    write_csv(out, "cobertura_e_splits.csv", [{"conjunto":f,"area":a,"dimensao":k,"valor":v,"n":n}
                                             for (f,a,k,v),n in sorted(cover.items())])
    write_csv(out, "causas_triagem_anterior.csv", [{"grupo":g,"causa":c,"n":n} for (g,c),n in sorted(historical.items())])
    write_csv(out, "quase_duplicatas.csv", near, ["id_1","id_2","jaccard_5_tokens"])
    for name, rows in (("conjunto_texto_semantico",semantic),("conjunto_recomendacao",recs)):
        write_jsonl(out, name+".jsonl", rows)
        write_csv(out, name+".csv", [{k:json.dumps(v,ensure_ascii=False) if isinstance(v,list) else v
                                     for k,v in row.items()} for row in rows])
    example = []
    for n in range(7):
        batch = sorted((d for d in audit if d["nota_0a6"]==n),
                       key=lambda d: (not bool(d["origem_recuperacao"]), d["id"]))
        example.extend(batch[:3])
    write_csv(out,"exemplos_rubrica.csv",example)
    changed = [d for d in audit if d["grupo_anterior"] in ("C","D") and any(d[f] for f in FLAGS)]
    write_csv(out,"recuperacoes_por_id.csv",[{k:d[k] for k in
        ("id","ano","area","grupo_anterior","criterio_anterior","piloto_anterior","fonte",
         "fonte_revisao","origem_recuperacao","motivo_texto","motivo_decisao_final",*FLAGS)} for d in changed])
    inputs = ["base-oficial/Dataset/base_trabalho/qualidade/bloqueios.json",
              "dificuldade-adaptativa/catalogo_mvp/auditoria_todas_questoes.csv",
              "dificuldade-adaptativa/catalogo_mvp/evidencias.json",
              "dificuldade-adaptativa/catalogo_mvp/matriz.py",
              "dificuldade-adaptativa/revisao_pedagogica/catalogo_derivado.csv",
              "dificuldade-adaptativa/revisao_pedagogica/taxonomia_proposta.json",
              "dificuldade-adaptativa/validacao_tri/auditoria.json"]
    metrics = {"total":len(audit),"revisao":REV,"sha256_catalogo_lf":CATALOG_HASH,"sha256_matriz":MATRIX_HASH,
               "sha256_entradas":{p:sha(root/p) for p in inputs},"sha256_tabelas_inep":table_hashes,
               "aptidao":{f:sum(d[f] for d in audit) for f in FLAGS},
               "bloqueadas":sum(d["bloqueado"] for d in audit),"pendentes_rubrica":sum(d["pendente"] for d in audit),
               "sem_uso_aprovado":sum(not any(d[f] for f in FLAGS) for d in audit),
               "com_midia_referenciada":sum(bool(d["imagens_cadastradas"]) for d in audit),
               "com_midia_ausente":sum(bool(d["recursos_ausentes"]) for d in audit),
               "por_area":{f:Counter(d["area"] for d in audit if d[f]) for f in FLAGS},
               "splits_textuais":Counter(s["split"] for s in semantic),
               "notas":notes,"quase_duplicatas_pares":len(near),"duplicatas_por_chave_itens":dup,
               "itens_em_grupo_nao_unitario":sum(d["n_no_grupo"]>1 for d in audit),
               "taxa_itens_em_grupo_nao_unitario":round(sum(d["n_no_grupo"]>1 for d in audit)/len(audit),6),
               "grupos_cruzam_particao_historica":len(historical_cross),"grupos_cruzam_particao_nova":len(cross),
               "tarefa_supervisionada":TASK,
               "fora_piloto_por_uso":{f:sum(d[f] and d["piloto_anterior"]=="False" for d in audit) for f in FLAGS},
               "fora_A_B_por_uso":{f:sum(d[f] and d["grupo_anterior"] in ("C","D") for d in audit) for f in FLAGS},
               "transicoes":[{"grupo":g,"uso":f,"apto":a,"n":n} for (g,f,a),n in sorted(transitions.items())]}
    (out/"metricas.json").write_text(json.dumps(metrics,ensure_ascii=False,indent=2)+"\n",encoding="utf8",newline="\n")
    print(json.dumps({k:v for k,v in metrics.items() if k not in ("sha256_entradas","sha256_tabelas_inep","transicoes")},
                     ensure_ascii=False,indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--raiz", type=Path, default=ROOT)
    parser.add_argument("--saida", type=Path, default=HERE)
    args = parser.parse_args()
    run(args.raiz.resolve(), args.saida.resolve())
