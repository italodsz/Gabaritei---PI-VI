import argparse
from collections import Counter, defaultdict
import csv
import hashlib
import json
import math
from pathlib import Path
import statistics
import sys

OUT=Path(__file__).resolve().parent
MODULE=OUT.parent
sys.path.insert(0,str(MODULE))
from auditoria_rotulos.auditar import signals
MATRIX_ENDS={"CH":(5,10,15,20,25,30),"LC":(4,8,11,14,17,20,24,27,30),
             "MT":(5,9,14,18,23,26,30),"CN":(4,7,12,16,19,23,27,30)}


def write(name, rows):
    with (OUT/name).open("w",encoding="utf-8-sig",newline="") as f:
        w=csv.DictWriter(f,fieldnames=list(rows[0]),delimiter=";")
        w.writeheader()
        w.writerows(rows)


def official_index(paths):
    indexed=defaultdict(list)
    for path in paths:
        with path.open(encoding="latin1",newline="") as f:
            reader=csv.DictReader(f,delimiter=";")
            required={"CO_ITEM","CO_PROVA","CO_POSICAO","SG_AREA","NU_PARAM_A","NU_PARAM_B","NU_PARAM_C"}
            if not required.issubset(reader.fieldnames or []):
                raise ValueError(f"Layout não reconhecido em {path}")
            for r in reader:
                key=(path.name.upper(),r["CO_ITEM"],r["CO_PROVA"],r["CO_POSICAO"],r["SG_AREA"])
                indexed[key].append(r)
    return indexed


def compare(index,r):
    ref=r.get("official_reference") or {}
    key=tuple(str(v) for v in (str(ref.get("source_file","")).upper(),r.get("co_item"),
                               ref.get("co_prova"),ref.get("position"),r["area"]))
    matches=index.get(key,[])
    if len(matches)!=1:
        return "sem_juncao_conclusiva",None
    row=matches[0]
    if not row.get("TX_GABARITO") or row["TX_GABARITO"]!=r.get("answer"):
        return "gabarito_divergente_ou_ausente",None
    try:
        equal=all(math.isclose(float(row[f"NU_PARAM_{k.upper()}"].replace(",",".")),r["tri"][k],
                               rel_tol=0,abs_tol=5e-6) for k in "abc")
    except (TypeError,ValueError):
        return "tri_oficial_ausente_ou_invalida",None
    return ("conferida_tabela" if equal else "valores_divergentes"),row.get("CO_HABILIDADE")


def audit(base,official):
    audit_reference=json.loads((MODULE/"results/fase_01.json").read_bytes())
    assert all(hashlib.sha256((base/k).read_bytes()).hexdigest()==v for k,v in audit_reference["hashes"].items())
    rows=[json.loads(l) for l in (base/"data/questions.jsonl").read_bytes().splitlines()]
    assert len(rows)==len({r["id"] for r in rows})==2971
    ids=json.loads((base/"ids_elegiveis.json").read_bytes())
    assert [len(ids[k]) for k in ("train","validation","test")]==[1801,136,126]
    train=set(ids["train"])
    index=official_index(official)
    records=[]
    groups=defaultdict(list)
    for r in rows:
        tri=r["tri"]
        a,b,c=(tri[k] for k in "abc")
        valid=all(math.isfinite(v) for v in (a,b,c)) and a>0 and 0<=c<=1
        flags=[name for name,value in (("a_baixo",a<.25),("b_extremo",abs(b)>5),("c_alto",c>.35)) if value]
        official_status,official_skill=compare(index,r)
        text=r.get("question") or ""
        p=r["pedagogy"]
        topic=p.get("topic_predicted")
        cues=signals(text)
        subject_status=("ausente" if not topic else "sinal_concorrente" if cues and topic not in cues
                        else "preenchido_sem_revisao")
        skill=r.get("skill")
        formal=str(skill).lstrip("H") in {str(i) for i in range(1,31)}
        skill_status=("ausente" if skill is None else "codigo_invalido" if not formal else
                      "confirmado_tabela" if official_skill==str(skill).lstrip("H") else
                      "diverge_da_tabela" if official_skill else "formal_sem_confirmacao")
        ref=r.get("official_reference") or {}
        record={"id":r["id"],"ano":r["year"],"area":r["area"],"co_item":r.get("co_item"),
                "arquivo_referenciado":ref.get("source_file"),"co_prova":ref.get("co_prova"),"posicao":ref.get("position"),
                "evidencia_catalogo":r.get("evidence_id"),"enunciado_presente":bool(text.strip()),
                "a":a,"b":b,"c":c,"tri_estrutura_valida":valid,"tri_status_oficial":official_status,
                "tri_alertas":"|".join(flags),"assunto":topic,"subassunto":p.get("subtopic_predicted"),
                "assunto_status":subject_status,"sugestao_nao_validada":cues[0] if not topic and len(cues)==1 else "",
                "habilidade_catalogo":skill,"habilidade_status":skill_status,"habilidade_tabela":official_skill,
                "competencia_matriz":next((i for i,end in enumerate(MATRIX_ENDS[r["area"]],1)
                                          if int(official_skill)<=end),None) if skill_status=="confirmado_tabela" else None,
                "revisao_humana":True}
        records.append(record)
        for field,key in (("area",r["area"]),("ano",r["year"]),("assunto",(r["area"],topic)),
                          ("habilidade",(r["area"],skill))):
            groups[f"{field}/{key}"].append(tri)
    # Structural screen for a prototype, separate from the certified intersection.
    provisional=[r for r in records if r["id"] in train and r["tri_estrutura_valida"]
                 and not r["tri_alertas"] and r["enunciado_presente"] and r["assunto"]
                 and r["habilidade_status"] in ("formal_sem_confirmacao","confirmado_tabela")
                 and r["assunto_status"]=="preenchido_sem_revisao"]
    write("auditoria_itens.csv",records)
    write("alertas_tri.csv",[r for r in records if r["tri_alertas"]])
    write("sugestoes_assunto.csv",[r for r in records if r["sugestao_nao_validada"]])
    write("subconjunto_provisorio.csv",provisional)
    confirmed=[r for r in provisional if r["tri_status_oficial"]=="conferida_tabela"
               and r["habilidade_status"]=="confirmado_tabela"]
    if confirmed:
        write("subconjunto_tri_habilidade_conferidas.csv",confirmed)
    write("pendencias.csv",[r for r in records if r["revisao_humana"]])
    summary={"catalogo":len(records),"tri_preenchida":sum(all(r[k] is not None for k in "abc") for r in records),
             "tri_valida_estrutura":sum(r["tri_estrutura_valida"] for r in records),
             "tri_alertas_unicos":sum(bool(r["tri_alertas"]) for r in records),
             "tri_oficial":Counter(r["tri_status_oficial"] for r in records),
             "assunto":Counter(r["assunto_status"] for r in records),
             "habilidade":Counter(r["habilidade_status"] for r in records),
             "sugestoes":sum(bool(r["sugestao_nao_validada"]) for r in records),"provisorio":len(provisional),
             "provisorio_tri_habilidade_conferidas":len(confirmed),
             "tabelas_sha256":{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in official},
             "tri_oficial_por_ano":{y:Counter(r["tri_status_oficial"] for r in records if r["ano"]==y)
                                    for y in sorted({r["ano"] for r in records})},
             "intersecao_certificada":0,"catalogo_sha256":audit_reference["hashes"]["data/questions.jsonl"],
             "elegiveis":{k:len(v) for k,v in ids.items()},
             "tri_por_grupo":{k:{"n":len(v),**{p:[min(x[p] for x in v),statistics.median(x[p] for x in v),max(x[p] for x in v)]
                                              for p in "abc"}} for k,v in groups.items()}}
    (OUT/"auditoria.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding="utf8")
    print({k:v for k,v in summary.items() if k!="tri_por_grupo"})


if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("dataset",type=Path)
    parser.add_argument("--tabela",action="append",type=Path,default=[])
    args=parser.parse_args()
    audit(args.dataset,args.tabela)
