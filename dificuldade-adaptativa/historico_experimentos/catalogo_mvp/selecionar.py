import argparse
from collections import Counter, defaultdict
import csv
import hashlib
import json
from pathlib import Path
import re

OUT=Path(__file__).resolve().parent
MODULE=OUT.parent
HASH="22d83ac5d269976b647d34cb8aa66ccbebec6c21b0773487926eb294ee69fbd5"
FILENAMES={"A":"catalogo_A_mvp.csv","B":"catalogo_B_condicional.csv",
           "C":"questoes_C_revisao.csv","D":"questoes_D_bloqueadas.csv"}
HOLD={"hold_for_source_review","image_required_text_disabled","presentation_hold_concrete_poem",
      "corrected_secondary_source_hold","additional_math_notation_hold",
      "normalized_from_indexed_primary_pending_visual"}
DEICTIC=re.compile(r"\b(?:esse fragmento|nessa letra|segundo esse pesquisador|a figura|o gráfico|"
                   r"a tabela|texto acima|dados fornecidos|estimativa for alcançada|elevação de temperatura descrita)\b",re.I)


def read_csv(path):
    with path.open(encoding="utf-8-sig",newline="") as f:
        return list(csv.DictReader(f,delimiter=";"))


def write(name, rows, fields=None):
    with (OUT/name).open("w",encoding="utf-8-sig",newline="") as f:
        writer=csv.DictWriter(f,fieldnames=fields or list(rows[0]),delimiter=";")
        writer.writeheader()
        for row in rows:
            writer.writerow({k:"'"+v if isinstance(v,str) and v.lstrip().startswith(("=","+","-","@")) else v
                             for k,v in row.items()})


def choose(block, alerts, manual, in_pilot):
    if block or manual=="D":
        return "D"
    if alerts or manual=="C":
        return "C"
    if manual=="A" and in_pilot:
        return "A"
    return "B" if in_pilot else "C"


def run(base):
    raw=(base/"data/questions.jsonl").read_bytes().replace(b"\r\n",b"\n")
    assert hashlib.sha256(raw).hexdigest()==HASH
    catalog=[json.loads(l) for l in raw.splitlines()]
    ids=json.loads((base/"ids_elegiveis.json").read_bytes())
    membership={i:s for s,v in ids.items() for i in v}
    assert len(membership)==2063==sum(map(len,ids.values()))
    derived={r["id"]:r for r in read_csv(MODULE/"revisao_pedagogica/catalogo_derivado.csv")}
    previous={r["id"] for r in read_csv(MODULE/"revisao_pedagogica/piloto_provisorio.csv")}
    original=json.loads((OUT/"matriz_codigos.json").read_bytes())
    assert hashlib.sha256((OUT/"matriz_1.pdf").read_bytes()).hexdigest()==original["sha256"]
    matrix=original["areas"]
    manual=json.loads((OUT/"evidencias.json").read_bytes())
    blocked={r["id"] for r in json.loads((base/"qualidade/bloqueios.json").read_bytes())}
    assert len(catalog)==len({r["id"] for r in catalog})==len(derived)==2971 and len(previous)==1329
    assert {r["id"] for r in catalog}==derived.keys()
    assert previous <= derived.keys() and membership.keys() <= derived.keys()
    normal=lambda text:" ".join(re.findall(r"\w+",text.casefold()))
    repeated=Counter(normal(r["question"] or "") for r in catalog)
    audit=[]
    for r in catalog:
        i=r["id"]
        d=derived[i]
        a=r["area"]
        text=r["question"] or ""
        options=r.get("options") or []
        code=f"H{r['skill']}" if r["skill"] else ""
        skill=matrix.get(a,{}).get(code)
        quality=(r.get("quality_review") or {}).get("status")
        ref=r.get("official_reference") or {}
        failures=[]
        alerts=[]
        if not text.strip() or len(options)!=5 or any(not (o.get("text") or "").strip() for o in options):
            failures.append("texto_ou_opcoes_essenciais_invalidos")
        if {o.get("label") for o in options}!=set("ABCDE") or r.get("answer") not in set("ABCDE"):
            failures.append("gabarito_ou_rotulos_invalidos")
        if i in blocked or r.get("is_abandoned_official") is True:
            failures.append("bloqueio_catalogo_ou_anulacao")
        if not skill or d["habilidade_status"]!="confirmado_tabela":
            alerts.append("habilidade_ausente_ou_sem_vinculo")
        if not r.get("co_item") or not ref.get("co_prova") or not ref.get("position") or not ref.get("source_file") or ref.get("year")!=r["year"]:
            alerts.append("vinculo_incompleto")
        if quality in HOLD:
            alerts.append("pendencia_qualidade_origem")
        if r.get("assets") or i not in membership:
            alerts.append("recurso_nao_inspecionado_ou_fora_recorte")
        if len(text)<220 and DEICTIC.search(text):
            alerts.append("referencia_a_contexto_em_texto_curto")
        if text and repeated[normal(text)]>1:
            alerts.append("enunciado_repetido")
        if d["assunto_status"] in ("suspeito","ausente","inconclusivo_conteudo"):
            alerts.append("assunto_ou_conteudo_pendente")
        tri=r["tri"]
        if d["tri_status"]!="conferida_tabela" or tri["a"]<.25 or abs(tri["b"])>5 or not 0 <= tri["c"] <= .35:
            alerts.append("tri_requer_cautela")
        verdict,snippet,reason=manual.get(i,("","",""))
        if snippet:
            assert snippet.casefold() in text.casefold(), i
        group=choose(failures,alerts,verdict,i in previous)
        if not snippet:
            snippet=" ".join(text.split())[-180:]
        restriction={"A":"demo_interna_supervisionada;revisar_direitos_antes_de_publicar",
                     "B":"reserva_interna_por_area;conferir_texto_antes_de_exibir;nao_filtrar_por_assunto_ou_habilidade",
                     "C":"revisar_antes_de_exibir","D":"nao_exibir"}[group]
        audit.append({"id":i,"grupo":group,"ano":r["year"],"area":a,"particao":membership.get(i,"fora"),
                      "co_item":r.get("co_item"),"co_prova":ref.get("co_prova"),"posicao":ref.get("position"),
                      "fonte_item":ref.get("source_file"),"origem_evidencia":r.get("evidence_id"),
                      "gabarito_catalogo":r.get("answer"),"habilidade":code,
                      "status_vinculo_habilidade":d["habilidade_status"],"status_assunto":d["assunto_status"],
                      "assets_cadastrados":len(r.get("assets") or []),"familia_conteudo":r.get("content_family_id"),
                      "competencia":skill["competencia"]["numero"] if skill else None,
                      "descritor":skill["descritor_extraido"] if skill else "",
                      "assunto_original":d["assunto_original"],"subassunto_original":d["subassunto_original"],
                      "tri_status":d["tri_status"],"tri_a":tri["a"],"tri_b":tri["b"],"tri_c":tri["c"],
                      "licenca_catalogo":r.get("license_status"),
                      "publicacao_requer_revisao":(r.get("license") or {}).get("public_review_required"),
                      "evidencia_textual":snippet,"parecer_tecnico":reason,
                      "criterio":"|".join(failures+alerts+([f"parecer_direto_{verdict}"] if verdict else [])) or (
                                 "triagem_sem_revisao_individual" if group=="B" else "evidencia_insuficiente_para_recuperar"),
                      "confianca":"plausibilidade_tecnica" if group=="A" else "sem_certificacao",
                      "restricao":restriction,"piloto_anterior":i in previous})
    write("auditoria_todas_questoes.csv",audit)
    for g,name in FILENAMES.items():
        write(name,[r for r in audit if r["grupo"]==g],list(audit[0]))
    recovered=[r for r in audit if r["grupo"] in ("A","B") and not r["piloto_anterior"]]
    assert not recovered,"Recuperações exigem motivo antigo e evidência nova."
    write("questoes_recuperadas.csv",[],["id","grupo","motivo_exclusao_anterior","evidencia_nova","motivo_reclassificacao"])
    coverage=Counter((r["grupo"],r["area"],axis,str(r[axis] or "<ausente>")) for r in audit
                     if r["grupo"] in ("A","B") for axis in ("assunto_original","habilidade","ano","particao"))
    write("cobertura_para_recomendador.csv",[{"grupo":g,"area":a,"dimensao":k,"valor":v,"n":n}
                                             for (g,a,k,v),n in sorted(coverage.items())])
    metrics={"sha256":HASH,"matriz_sha256":original["sha256"],"total":len(audit),"grupos":Counter(r["grupo"] for r in audit),
             "por_area":{g:Counter(r["area"] for r in audit if r["grupo"]==g) for g in FILENAMES},
             "recuperadas":len(recovered),"piloto_anterior":len(previous),
             "piloto_mantido":sum(r["piloto_anterior"] and r["grupo"] in ("A","B") for r in audit),
             "sem_assunto":sum(not r["assunto_original"] for r in audit),
             "sem_habilidade":sum(not r["habilidade"] for r in audit),
             "revisao_licenca":sum(r["publicacao_requer_revisao"] is True for r in audit),
             "historico_triagem":{"alertas":sum(r["assunto_status"]=="suspeito" for r in derived.values()),
                                 "sugestoes":len(read_csv(MODULE/"revisao_pedagogica/sugestoes.csv"))}}
    (OUT/"metricas.json").write_text(json.dumps(metrics,ensure_ascii=False,indent=2),encoding="utf8")
    print(json.dumps(metrics,ensure_ascii=False))


if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("base",type=Path)
    run(p.parse_args().base)
