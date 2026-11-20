import argparse
from collections import Counter, defaultdict
import hashlib
import json
from pathlib import Path
import sys

import fitz

from conferir_pdf import extract, norm, pdf_answers, sha

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE.parent / "recuperacao_catalogo"))
from auditar import (CATALOG_HASH, MATRIX_HASH, REV, official_row, official_tables,
                     option_text, read_csv, read_json, write_csv, write_jsonl)

A, P, F = "PASSOU", "PENDENTE", "FALHOU"
ASSET_TABLE = "gq_29b02702604175cb29267886"
ASSET_CHART = "gq_d729403b0e500b7ef02bef0a"
CONFLICT = "gq_1bf495a5eda4568d0ea676d2"


def load_cadernos():
    manifest = read_json(HERE/"fontes/manifesto.json")
    refs = {(r["ano"],r["dia"],r["tipo"]):r for r in manifest if "sha256" in r}
    books = {}
    for (y, day, kind), r in refs.items():
        assert sha(HERE/"fontes"/r["arquivo"]) == r["sha256"]
        if kind == "prova" and (y,day,"gabarito") in refs:
            g = refs[y,day,"gabarito"]
            books[y,day] = (r,g,extract(HERE/"fontes"/r["arquivo"]),pdf_answers(HERE/"fontes"/g["arquivo"]))
    return books, refs


def exact_proof(item, ref_rows, books, statement, options):
    if item["application_type"] != "regular" or item["is_abandoned_official"]:
        return None, "buscar caderno da aplicação específica"
    targets = [norm(statement), *(norm(o["text"]) for o in options)]
    if len(targets)!=6 or not all(targets):
        return None, "representação textual não contém enunciado e cinco opções"
    attempts = set()
    matches = []
    for r in ref_rows:
        if r["TX_COR"].casefold() != "azul" or r.get("IN_ITEM_ADAPTADO") == "1" or r["TX_GABARITO"] != item["answer"]:
            continue
        n = int(r["CO_POSICAO"])
        day = 1 if n <=90 else 2
        book = books.get((item["year"],day))
        if not book or n<=5:
            continue
        doc,key,sections,answers = book
        if answers.get(n)!=item["answer"]:
            attempts.add("posição sem gabarito coincidente no PDF Azul")
            continue
        for section in sections.get(n,[]):
            parts = section["partes"]
            if [norm(p) for p in parts] != targets:
                attempts.add("texto integral ou opções não coincidiram exatamente")
                continue
            matches.append({**section,"caderno":doc["arquivo"],"url":doc["url"],"hash_pdf":doc["sha256"],
                            "gabarito_url":key["url"],"hash_gabarito":key["sha256"],"co_prova":r["CO_PROVA"],
                            "posicao":n,"metodo":"coincidência integral + microdados + gabarito Azul",
                            "id":item["id"]})
        if not sections.get(n):
            attempts.add("bloco não extraído de forma confiável")
    unique = {(m["pagina"],m["caderno"],m["posicao"]) for m in matches}
    if len(unique)==1:
        result = matches[0]
        codes = sorted({m["co_prova"] for m in matches})
        original_code = str(item["official_reference"]["co_prova"])
        result["co_prova_compativeis"] = codes
        result["co_prova"] = original_code if original_code in codes else codes[0] if len(codes)==1 else None
        return result, ""
    return None, " | ".join(sorted(attempts)) or "caderno Azul sem cruzamento seguro"


def stage_media(prev, out):
    res = out/"recursos"
    res.mkdir(exist_ok=True)
    graph = prev/"recursos"/f"{ASSET_CHART}_grafico.png"
    graph_target = res/graph.name
    graph_target.write_bytes(graph.read_bytes())
    sources = read_json(prev/"fontes/hashes_documentais.json")
    source = prev/"fontes/caderno2022_laranja.pdf"
    assert sha(source)==sources[source.name]
    table = res/f"{ASSET_TABLE}_tabela.png"
    with fitz.open(source) as book:
        book[6].get_pixmap(matrix=fitz.Matrix(2,2),clip=fitz.Rect(104,225,468,356),alpha=False).save(table)
    return {ASSET_CHART:[f"recursos/{graph.name}"],ASSET_TABLE:[f"recursos/{table.name}"]}


def add_difficulty(rows):
    cohorts = defaultdict(list)
    for r in rows:
        if r["apta_exibicao_correcao"] and r["c6_status"]==A and not r["tri_alerta"]:
            key = f'{r["ano"]}/{r["co_prova"]}/{r["area"]}'
            cohorts[key].append(r)
    for key, group in cohorts.items():
        group.sort(key=lambda r:(r["tri_b"],r["id"]))
        k, j = len(group)//3, 2*len(group)//3
        if len(group)<9 or group[k-1]["tri_b"]==group[k]["tri_b"] or group[j-1]["tri_b"]==group[j]["tri_b"]:
            continue
        for i,r in enumerate(group):
            r.update(apta_selecao_adaptativa=True,status_final="EXIBICAO_E_ADAPTATIVO",
                     metodo_dificuldade="tercis_b_somente_ano_prova_area",escala_operacional=key,
                     nivel_dificuldade="b_relativo_baixo" if i<k else "b_relativo_medio" if i<j else "b_relativo_alto")


def audit(root, out):
    previous = root/"dificuldade-adaptativa/recuperacao_catalogo"
    rawpath = root/"base-oficial/Dataset/base_trabalho/data/questions.jsonl"
    raw = rawpath.read_bytes().replace(b"\r\n",b"\n")
    assert hashlib.sha256(raw).hexdigest()==CATALOG_HASH
    items = [json.loads(l) for l in raw.splitlines()]
    old = {r["id"]:r for r in read_csv(previous/"catalogo_elegibilidade.csv")}
    mvp = {r["id"]:r for r in read_csv(root/"dificuldade-adaptativa/catalogo_mvp/auditoria_todas_questoes.csv")}
    pedagogy = {r["id"]:r for r in read_csv(root/"dificuldade-adaptativa/revisao_pedagogica/catalogo_derivado.csv")}
    tri_audit = {r["id"]:r for r in read_csv(root/"dificuldade-adaptativa/validacao_tri/auditoria_itens.csv")}
    prior = {r["id"]:r for r in map(json.loads,(previous/"conjunto_recomendacao.jsonl").read_bytes().splitlines())}
    assert len(items)==len(old)==len(mvp)==len(pedagogy)==len(tri_audit)==2971 and len(prior)==14
    directed = read_json(previous/"revisao_dirigida.json")
    visual = read_json(HERE/"revisao_visual.json")
    assert sha(previous/"fontes/matriz_inep.pdf")==MATRIX_HASH
    matrix = read_json(root/"dificuldade-adaptativa/catalogo_mvp/matriz_codigos.json")
    assert matrix["sha256"]==MATRIX_HASH and all(len(a)==30 for a in matrix["areas"].values())
    index, table_hashes = official_tables(root)
    variants = defaultdict(list)
    for (file,co_item,_,_,area), rs in index.items():
        variants[file,co_item,area].extend(rs)
    books, refs = load_cadernos()
    media = stage_media(previous, out)
    documented = read_json(previous/"fontes/hashes_documentais.json")
    manual_sources = {
        "caderno2018.pdf": refs[2018,1,"prova"]["url"],
        "caderno2022_laranja.pdf":"https://download.inep.gov.br/enem/provas_e_gabaritos/2022_PV_impresso_D2_CD11.pdf",
    }
    rows, content, proofs = [], {}, []
    for item in sorted(items,key=lambda r:(old[r["id"]]["apto_texto_semantico"]!="True",r["year"],r["id"])):
        i = item["id"]
        previous_row = old[i]
        official = official_row(index,item)
        ref = item["official_reference"]
        origin = previous_row["fonte"]
        stored = item.get("question") or ""
        options = item.get("options") or []
        if i in prior:
            stored = prior[i]["enunciado"]
            options = prior[i]["alternativas"]
        else:
            options = [{"label":o["label"],"text":option_text(o)} for o in options]
        key = ref["source_file"].upper(),str(item["co_item"]),item["area"]
        proof, why = exact_proof(item,variants[key],books,stored,options)
        if proof:
            proofs.append(proof)
        review = visual.get(i,{})
        if review:
            assert proof and review["fonte"]==f'{proof["caderno"]} p.{proof["pagina"]} item {proof["posicao"]}',i
            if "antes" in review:
                assert stored.count(review["antes"])==1,i
                stored = stored.replace(review["antes"],review["depois"],1)
        labels = [o["label"] for o in options]
        complete_structure = bool(stored.strip()) and labels==list("ABCDE") and all(o["text"].strip() for o in options)
        grounded = bool(official) and official.get("TX_GABARITO")==item["answer"] and item["answer"] in set("ABCDE")
        prior_ok = i in prior and grounded
        asset_needed = bool(previous_row["recursos_ausentes"]) and (
            not complete_structure or previous_row["status_origem"]=="image_required_text_disabled"
            or bool(proof and proof["apoio"] in ("imagem_no_pdf","desenho_no_pdf")))
        missing_known = previous_row["c6_motivo"]=="material_indispensavel_ausente_ou_incompativel"
        strong = prior_ok or bool(proof)
        manual = directed.get(i,{}) if prior_ok else {}
        source_pdf = (proof["url"] + f'#page={proof["pagina"]}') if proof else (
            manual_sources[manual["caderno"]] + f'#page={manual["pagina"]}' if manual else "")
        c1 = (A,"integral conforme leitura dirigida anterior ou confronto integral ao caderno",source_pdf or prior.get(i,{}).get("fonte_revisao",""))
        if not complete_structure or (missing_known and not prior_ok):
            c1 = F,"enunciado ou alternativas essenciais ausentes ou truncados",origin
        elif not strong:
            c1 = P,"completude sem confronto conclusivo",why
        c2 = (A,"item, posição e resposta conciliados na tabela oficial",origin) if grounded else (
            F if official and official.get("TX_GABARITO")!=item["answer"] else P,"resposta ou vínculo não conciliado",origin)
        if i==CONFLICT:
            c2 = F,"conflito entre posição/gabarito do registro e o texto localizado no caderno",
            c2 = (*c2,"caderno Azul 2018 p.14 e gabarito; revisão dirigida anterior")
        c3 = P,"apoio não verificado","recurso referenciado" if item.get("assets") else why
        if prior_ok:
            c3 = A,"apoio conferido ou item autossuficiente por leitura dirigida", "|".join(media.get(i,[])) or prior[i]["fonte_revisao"]
        elif review and not item.get("assets"):
            c3 = A,"apoio verificado por leitura visual",review["decisao"]
        elif asset_needed or missing_known:
            c3 = F,"material indispensável ausente ou incompatível",previous_row["recursos_ausentes"] or previous_row["c6_evidencia"]
        elif proof and not proof["apoio"] and not item.get("assets"):
            c3 = A,"bloco oficial integral sem imagens, vetores relevantes ou marcas de apoio",source_pdf
        elif proof:
            c3 = P,"apoio ou notação a conferir visualmente",proof["apoio"] or "arquivo associado na base"
        duplicate = previous_row["representante"]!=i
        c4 = (F,"variante reservada para evitar duplicação",previous_row["representante"]) if duplicate else (
            F,"anulação oficial",origin) if item["is_abandoned_official"] else (
            P,"alerta editorial ainda em aberto",previous_row["status_origem"]) if (
                not prior_ok and "bloqueio_editorial" in previous_row["falhas_criticas"]) else (
            A,"estrutura sem mistura ou colisão detectada",previous_row["grupo_duplicatas"])
        if not complete_structure and c4[0]==A:
            c4 = P,"representação textual incompleta para conferir consistência",origin
        desc = matrix["areas"][item["area"]].get(previous_row["habilidade"],{}).get("descritor_extraido","")
        assert desc == previous_row["descritor_oficial"]
        c5 = {"APROVADO":A,"PENDENTE":P,"REPROVADO":F}[previous_row["c3_status"]],previous_row["c3_motivo"],previous_row["c3_evidencia"]
        c6 = {"APROVADO":A,"PENDENTE":P,"REPROVADO":F}[previous_row["c5_status"]],previous_row["c5_motivo"],origin
        if c6[0]==A:
            assert tri_audit[i]["tri_status_oficial"]=="conferida_tabela"
        gates = (c1,c2,c3,c4)
        ready = all(c[0]==A for c in gates)
        blocked = any(c[0]==F for c in gates)
        state = "SO_EXIBICAO" if ready else "BLOQUEADA" if blocked else "CONDICIONAL"
        row = {"id":i,"ano":item["year"],"area":item["area"],"co_item":item["co_item"],"co_prova":ref["co_prova"],
               "posicao":ref["position"],"cor_origem":official.get("TX_COR"),"aplicacao":item["application_type"],
               "gabarito":item["answer"],"gabarito_inep":official.get("TX_GABARITO"),"fonte_oficial":origin,
               "leitura_visual":review.get("decisao",""),
               "alteracao_derivada":f'{review["antes"]} → {review["depois"]}' if "antes" in review else
                  manual.get("parecer","") if i in media else "",
               "fonte_pdf":source_pdf or prior.get(i,{}).get("fonte_revisao",""),
               "hash_pdf":proof["hash_pdf"] if proof else documented.get(manual.get("caderno",""),""),
               "co_prova_caderno":proof["co_prova"] if proof else None,"posicao_caderno":proof["posicao"] if proof else None,
               "pagina":proof["pagina"] if proof else manual.get("pagina"),"era_pronta":i in prior,"texto_triagem_anterior":previous_row["apto_texto_semantico"],
               "grupo_mvp_anterior":mvp[i]["grupo"],"grupo_variantes":previous_row["grupo_duplicatas"],
               "representante":previous_row["representante"],"midias_ausentes_origem":previous_row["recursos_ausentes"],
               "recursos":"|".join(media.get(i,[])),"restricao_direitos":"revisão de direitos pendente",
               "habilidade_original":previous_row["habilidade"],"assunto_original":pedagogy[i]["assunto_original"],
               "habilidade_usavel":previous_row["habilidade"] if c5[0]==A else "",
               "assunto_usavel":pedagogy[i]["assunto_original"] if c5[0]==A else "",
               "tri_a":item["tri"]["a"],"tri_b":item["tri"]["b"],"tri_c":item["tri"]["c"],"tri_alerta":previous_row["tri_alerta"],
               "bloqueio_critico":blocked,"apta_exibicao_correcao":ready,"apta_selecao_adaptativa":False,
               "metodo_dificuldade":"sem ranking operacional","escala_operacional":"","nivel_dificuldade":"",
               "status_final":state,"justificativa":" | ".join(f"C{k}:{x[1]}" for k,x in enumerate(gates,1) if x[0]!=A) or
                  "quatro portas confirmadas; restrições pedagógicas e de direitos separadas",
               "proxima_acao":"Verificar direitos antes da exibição" if ready else
                 "Conferir caderno/versão, página, opções e recursos sem reaproveitar material ambíguo",
               "nota_0_6":sum(c[0]==A for c in (*gates,c5,c6))}
        for k,(s,reason,evidence) in enumerate((*gates,c5,c6),1):
            row.update({f"c{k}_status":s,f"c{k}_motivo":reason,f"c{k}_evidencia":evidence or origin,
                        f"c{k}_fonte":(source_pdf or origin) if k in (1,2,3) else origin if k!=5 else
                        "https://download.inep.gov.br/download/enem/matriz_referencia.pdf"})
        rows.append(row)
        if ready:
            content[i] = {"enunciado":stored,"alternativas":options,"recursos":media.get(i,[]),
                          "revisao_catalogo_base":REV,
                          "nota_exibicao":"renderizar o gráfico/tabela junto da questão" if i in media else "texto"}
    add_difficulty(rows)
    outputs(out,rows,content,proofs,table_hashes,refs,len(visual),len(media))


def outputs(out, rows, content, proofs, tables, refs, n_visual, n_recortes):
    write_csv(out,"auditoria_por_questao.csv",rows)
    fields = ("id","ano","area","co_item","co_prova","posicao","gabarito","fonte_oficial","fonte_pdf","hash_pdf",
              "grupo_variantes","status_final","apta_selecao_adaptativa","metodo_dificuldade","escala_operacional",
              "nivel_dificuldade","habilidade_usavel","assunto_usavel","restricao_direitos")
    ready = [{**{k:r[k] for k in fields},**content[r["id"]]} for r in rows if r["apta_exibicao_correcao"]]
    write_jsonl(out,"catalogo_adaptativo_pronto.jsonl",ready)
    write_csv(out,"catalogo_adaptativo_pronto.csv",[{k:json.dumps(v,ensure_ascii=False) if isinstance(v,list) else v
                                                   for k,v in r.items()} for r in ready])
    for status,name in (("CONDICIONAL","catalogo_adaptativo_condicional.csv"),("BLOQUEADA","catalogo_bloqueado.csv")):
        write_csv(out,name,[{**r,"pode_exibir":False} for r in rows if r["status_final"]==status])
    difficulty = ("id","area","ano","co_prova","posicao","tri_a","tri_b","tri_c","tri_alerta","c6_status","fonte_oficial",
                  "apta_exibicao_correcao","apta_selecao_adaptativa","metodo_dificuldade","escala_operacional","nivel_dificuldade")
    write_csv(out,"catalogo_dificuldade.csv",[{**{k:r[k] for k in difficulty},
              "limite":"ordenação local apenas na mesma edição/prova/área; sem cortes universais"} for r in rows])
    queue = []
    for r in rows:
        if r["apta_exibicao_correcao"]:
            continue
        short = r["status_final"]=="CONDICIONAL" and bool(r["hash_pdf"]) and r["c1_status"]==A and r["c4_status"]==A
        priority = "1" if short else "2" if r["texto_triagem_anterior"]=="True" else "3"
        queue.append({"id":r["id"],"prioridade":priority,"area":r["area"],"ano":r["ano"],"status":r["status_final"],
                      "candidata_conferencia_curta":short,"motivo":r["justificativa"],"fonte":r["fonte_pdf"] or r["fonte_oficial"],
                      "acao":r["proxima_acao"],"esforco_estimado":"5–12 min/item" if short else
                      "10–25 min/item após localizar o caderno" if priority=="2" else "variável; obter versão e material",
                      "beneficio_estimado":"alto, conteúdo já cruzado" if short else "depende de completar e validar o item"})
    write_csv(out,"fila_recuperacao_priorizada.csv",sorted(queue,key=lambda r:(r["prioridade"],r["area"],r["ano"],r["id"])))
    cover = Counter((r["status_final"],r["area"],k,str(r[k] or "sem_rótulo_utilizável"))
                    for r in rows for k in ("ano","assunto_usavel","habilidade_usavel","nivel_dificuldade","escala_operacional"))
    write_csv(out,"cobertura.csv",[dict(status=s,area=a,dimensao=k,valor=v,n=n) for (s,a,k,v),n in sorted(cover.items())])
    write_jsonl(out,"evidencia_cadernos.jsonl",proofs)
    previous_only = {r["id"] for r in rows if r["era_pronta"]}
    first = Counter(r["status_final"] for r in rows)
    metrics = {"total":len(rows),"revisao":REV,"sha256_catalogo_lf":CATALOG_HASH,"sha256_matriz":MATRIX_HASH,
               "sha256_tabelas_inep":tables,"documentos_oficiais":len(refs),"pares_caderno_gabarito":len(refs)//2,
               "coincidencias_textuais_com_caderno":len(proofs),"classes":first,
               "prontas_exibicao":len(ready),"prontas_adaptativo":first["EXIBICAO_E_ADAPTATIVO"],
               "novas_prontas_vs_14":sum(r["id"] not in previous_only for r in ready),
               "anteriores_mantidas":sum(r["id"] in previous_only for r in ready),
               "itens_revistos_visualmente_nesta_rodada":n_visual,
               "recortes_de_apoio_reabertos":n_recortes,
               "midia_referenciada_ausente":sum(bool(r["midias_ausentes_origem"]) for r in rows),
               "pendencias_curtas_prioridade_1":sum(x["candidata_conferencia_curta"] for x in queue),
               "notas":{n:sum(r["nota_0_6"]==n for r in rows) for n in range(7)},
               "nota_x_decisao":{n:dict(Counter(r["status_final"] for r in rows if r["nota_0_6"]==n)) for n in range(7)},
               "criterios":{f"C{k}":{state:sum(r[f"c{k}_status"]==state for r in rows) for state in (A,P,F)} for k in range(1,7)},
               "prontas_por_area":Counter(r["area"] for r in ready),
               "adaptativo_por_area":Counter(r["area"] for r in ready if r["apta_selecao_adaptativa"]),
               "escalas_locais":dict(Counter(r["escala_operacional"] for r in ready if r["escala_operacional"])),
               "causas_impeditivas":{f"C{k}":dict(Counter(r[f"c{k}_motivo"] for r in rows if r[f"c{k}_status"]==F)) for k in range(1,5)}}
    (out/"metricas.json").write_text(json.dumps(metrics,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print(json.dumps(metrics,ensure_ascii=False))


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--raiz", type=Path, default=ROOT)
    p.add_argument("--saida", type=Path, default=HERE)
    args = p.parse_args()
    args.saida.mkdir(parents=True,exist_ok=True)
    audit(args.raiz.resolve(),args.saida.resolve())
