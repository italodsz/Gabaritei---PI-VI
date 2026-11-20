import argparse
from collections import Counter, defaultdict
import csv
import hashlib
import json
from pathlib import Path
import random
import re
import statistics

OUT=Path(__file__).resolve().parent
MODULE=OUT.parent
RULES=[
    ("MT","Probabilidade e estatística","Variância e desvio padrão",r"\b(?:variância|desvio[- ]padrão)\b"),
    ("MT","Probabilidade e estatística","Probabilidade de eventos",r"\b(?:probabilidade de|qual a probabilidade)\b"),
    ("MT","Álgebra","Função quadrática",r"\b(?:função quadrática|equação do segundo grau)\b"),
    ("MT","Álgebra","Progressões",r"\bprogressão (?:aritmética|geométrica)\b"),
    ("MT","Geometria","Volume de sólidos",r"\bvolume d[eo] (?:um |uma )?(?:cilindro|cone|esfera|prisma|pirâmide)\b"),
    ("CN","Física","Óptica e refração",r"\b(?:índice de refração|lente convergente|lente divergente|fenômeno ó[p]?tico)\b"),
    ("CN","Física","Circuitos elétricos",r"\b(?:corrente elétrica|diferença de potencial|resistência elétrica)\b"),
    ("CN","Química","Termoquímica",r"\b(?:entalpia|calor de combustão|energia de ativação)\b"),
    ("CN","Química","Estequiometria",r"\b(?:estequiometria|mol de co₂|mol de co2)\b"),
    ("CN","Biologia","Divisão celular",r"\b(?:mitose|meiose|cromossomos homólogos)\b"),
    ("CN","Biologia","Ecologia trófica",r"\b(?:nível trófico|cadeia alimentar|teia alimentar)\b"),
    ("CN","Biologia","Fotossíntese",r"\bfotossíntese\b"),
    ("CH","História","Escravidão e abolição",r"\b(?:abolição da escravidão|tráfico de escravizados|lei áurea)\b"),
    ("CH","Geografia","Migração e deslocamento populacional",r"\b(?:fluxos migratórios|êxodo rural|migração internacional)\b"),
    ("LC","Leitura","Efeitos de sentido",r"\b(?:efeito de sentido|efeitos de sentido|formas verbais)\b"),
]
POINTER=re.compile(r"\b(?:figura|gráfico|tabela|imagem|diagrama|esquema)s+(?:a seguir|acima|abaixo|seguinte|apresentad[oa])\b",re.I)


def read_csv(path):
    with path.open(encoding="utf-8-sig",newline="") as f:
        return list(csv.DictReader(f,delimiter=";"))


def csv_write(name,rows):
    with (OUT/name).open("w",encoding="utf-8-sig",newline="") as f:
        writer=csv.DictWriter(f,fieldnames=list(rows[0]),delimiter=";")
        writer.writeheader()
        for r in rows:
            writer.writerow({k:("'"+v if isinstance(v,str) and v.lstrip().startswith(("=","+","-","@")) else v)
                             for k,v in r.items()})


def signals(area,text):
    command="\n\n".join(text.strip().split("\n\n")[-2:])[-650:]
    return [(topic,sub,m.group(0)) for a,topic,sub,pattern in RULES if a==area
            and (m:=re.search(pattern,command,re.I))]


def main(base):
    raw=(base/"data/questions.jsonl").read_bytes()
    expected="22d83ac5d269976b647d34cb8aa66ccbebec6c21b0773487926eb294ee69fbd5"
    assert hashlib.sha256(raw).hexdigest()==expected
    rows=[json.loads(line) for line in raw.splitlines()]
    prior={r["id"]:r for r in read_csv(MODULE/"validacao_tri/auditoria_itens.csv")}
    pilot={r["id"] for r in read_csv(MODULE/"validacao_tri/subconjunto_tri_habilidade_conferidas.csv")}
    assert len(rows)==len({r["id"] for r in rows})==len(prior)==2971
    taxonomy=set()
    distributions=defaultdict(list)
    out,suggestions,blind=[],[],[]
    for r in rows:
        p=prior[r["id"]]
        a=r["area"]
        text=r.get("question") or ""
        topic=p["assunto"]
        sub=p["subassunto"]
        assets=r.get("assets") or []
        flags=signals(a,text)
        alternatives=r.get("options") or []
        broken=not text.strip() or len(alternatives)!=5 or "\ufffd" in text
        absent_visual=bool(POINTER.search(text) and not assets)
        competing=bool(topic and flags and topic not in {f[0] for f in flags})
        old_flag=p["assunto_status"]=="sinal_concorrente"
        candidates=[{"assunto":t,"subassunto":s,"marcador":m} for t,s,m in flags]
        status=("inconclusivo_conteudo" if broken or absent_visual else "ausente" if not topic else
                "suspeito" if competing or old_flag else "plausivel_por_sinal" if flags else "preenchido_inconclusivo")
        if topic:
            taxonomy.add((a,topic,sub))
        for field,label in (("assunto",topic),("habilidade",p["habilidade_catalogo"])):
            distributions[(a,field,label or "ausente")].append(float(p["b"]))
        row={"id":r["id"],"ano":r["year"],"area":a,"enunciado":text,
             "alternativas":json.dumps(alternatives,ensure_ascii=False),"gabarito":r.get("answer"),
             "assunto_original":topic,"subassunto_original":sub,"habilidade_original":p["habilidade_catalogo"],
             "competencia_original":r.get("competence"),"competencia_derivada":p["competencia_matriz"],
             "habilidade_status":p["habilidade_status"],"origem_habilidade":p["arquivo_referenciado"],
             "assunto_status":status,"alerta_anterior":old_flag,"sinal_concorrente_novo":competing,
             "multiplos_sinais":len(flags)>1,"recursos":json.dumps(assets,ensure_ascii=False),
             "imagem_proxy":bool(assets) or bool(re.search(r"\b(?:imagem|figura)\b",text,re.I)),
             "grafico_proxy":bool(re.search(r"\bgráfico\b",text,re.I)),
             "tabela_proxy":bool(re.search(r"\btabela\b",text,re.I)),
             "formula_proxy":bool(re.search(r"[=√±×÷]|\\frac",text)),
             "ponteiro_visual_sem_asset":absent_visual,"extracao_incompleta":broken,
             "tri_status":p["tri_status_oficial"],"tri_a":p["a"],"tri_b":p["b"],"tri_c":p["c"],
             "conf_score_origem":(r.get("pedagogy") or {}).get("topic_confidence"),
             "confianca_pedagogica":"nao_medida","revisao_humana":True,"certificada":False,
             "piloto_provisorio":r["id"] in pilot and status in ("plausivel_por_sinal","preenchido_inconclusivo")}
        out.append(row)
        if flags and not (broken or absent_visual) and (not topic or competing):
            suggestions.append({"id":r["id"],"area":a,"assunto_original":topic,"subassunto_original":sub,
                                "alternativas_sugeridas":json.dumps(candidates,ensure_ascii=False),
                                "justificativa":"Marcador específico no trecho final. Conferir comando e possíveis rótulos múltiplos.",
                                "status":"hipotese_sem_adjudicacao"})
        blind.append({k:row[k] for k in ("id","ano","area","enunciado","alternativas","recursos")})
    assert len(pilot)==1331 and sum(r["alerta_anterior"] for r in out)==52
    lookup={r["id"]:r for r in blind}
    rng=random.Random(42)
    strata=defaultdict(list)
    for r in out:
        key=(r["area"],r["ano"]//4,r["assunto_original"],r["habilidade_original"],
             r["assunto_status"],r["imagem_proxy"],str(r["conf_score_origem"]))
        strata[key].append(r["id"])
    sample={r["id"] for r in out if r["alerta_anterior"]}
    for area in ("CH","CN","LC","MT"):
        keys=sorted(k for k in strata if k[0]==area)
        rng.shuffle(keys)
        for k in keys:
            rng.shuffle(strata[k])
        count=sum(i in sample for i in lookup if lookup[i]["area"]==area)
        while count<75:
            for k in keys:
                while strata[k] and strata[k][-1] in sample:
                    strata[k].pop()
                if strata[k] and count<75:
                    sample.add(strata[k].pop())
                    count+=1
    csv_write("catalogo_derivado.csv",out)
    csv_write("sugestoes.csv",suggestions)
    csv_write("pendencias.csv",[{k:r[k] for k in ("id","ano","area","assunto_status","habilidade_status","alerta_anterior",
                                                  "ponteiro_visual_sem_asset","extracao_incompleta")} for r in out])
    csv_write("prioridade_52.csv",[r for r in out if r["alerta_anterior"]])
    csv_write("piloto_provisorio.csv",[r for r in out if r["piloto_provisorio"]])
    csv_write("ficha_cega_300.csv",[{**lookup[i],"assunto_revisor":"","subassunto_revisor":"","habilidades_candidatas":"",
                                   "dependencia_visual":"","evidencia":"","decisao":""} for i in sorted(sample)])
    stats={"sha256":expected,"n":len(out),"sem_assunto":sum(not r["assunto_original"] for r in out),
           "sem_habilidade":sum(not r["habilidade_original"] for r in out),"sugestoes":len(suggestions),
           "sugestoes_em_ausentes":sum(not r["assunto_original"] for r in suggestions),
           "amostra":len(sample),"piloto":sum(r["piloto_provisorio"] for r in out),
           "status":Counter(r["assunto_status"] for r in out),
           "habilidade_status":Counter(r["habilidade_status"] for r in out),
           "visual_sem_asset":sum(r["ponteiro_visual_sem_asset"] for r in out),
           "extracao_incompleta":sum(r["extracao_incompleta"] for r in out),
           "tri_por_grupo":[{"area":a,"campo":f,"rotulo":k,"n":len(b),"min_b":min(b),
                             "mediana_b":statistics.median(b),"max_b":max(b)}
                            for (a,f,k),b in sorted(distributions.items())],
           "por_area_ano":{f"{area}/{year}":Counter(r["assunto_status"] for r in out
                                                    if r["area"]==area and r["ano"]==year)
                          for area in ("CH","CN","LC","MT") for year in range(2009,2025)},
           "taxonomia_original_observada":sorted(taxonomy),"certificadas":0}
    (OUT/"metricas.json").write_text(json.dumps(stats,ensure_ascii=False,indent=2),encoding="utf8")
    (OUT/"taxonomia_proposta.json").write_text(json.dumps(
        [{"area":a,"disciplina":None,"assunto_proposto":t,"subassunto_proposto":s,"origem":"triagem experimental"}
         for a,t,s,_ in RULES],ensure_ascii=False,indent=2),encoding="utf8")
    print({k:v for k,v in stats.items() if k not in ("tri_por_grupo","por_area_ano","taxonomia_original_observada")})


if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("base",type=Path)
    main(p.parse_args().base)
