import argparse
from collections import Counter, defaultdict
import csv
import hashlib
import json
from pathlib import Path
import random
import re

OUT=Path(__file__).resolve().parent
HASH="22d83ac5d269976b647d34cb8aa66ccbebec6c21b0773487926eb294ee69fbd5"
RULES={
    "Geometria":r"\b(?:triângulo|círculo|circunferência|polígono|perímetro|ângulo)s?\b",
    "Funções":r"\bfunç(?:ão|ões)\s+(?:quadrática|afim|exponencial|logarítmica)\b",
    "Probabilidade e estatística":r"\b(?:probabilidade|mediana|desvio padrão|variância)\b",
    "Física":r"\b(?:velocidade angular|energia cinética|corrente elétrica|diferença de potencial)\b",
    "Química":r"\b(?:estequiometria|reação química|ligação covalente|mol de)\b",
    "Biologia":r"\b(?:fotossíntese|mitose|meiose|seleção natural|cadeia alimentar)\b",
}


def signals(text):
    return [name for name,pattern in RULES.items() if re.search(pattern,text,re.I)]


def csv_write(name,rows):
    with (OUT/name).open("w",encoding="utf-8-sig",newline="") as f:
        writer=csv.DictWriter(f,fieldnames=list(rows[0]),delimiter=";")
        writer.writeheader()
        writer.writerows(rows)


def safe(value):
    value=str(value or "")
    return "'"+value if value.lstrip().startswith(("=","+","-","@")) else value


def run(base):
    raw=(base/"data/questions.jsonl").read_bytes()
    assert hashlib.sha256(raw).hexdigest()==HASH
    rows=[json.loads(line) for line in raw.splitlines()]
    assert len(rows)==len({r["id"] for r in rows})==2971
    rng=random.Random(42)
    grouped=defaultdict(list)
    for r in rows:
        p=r["pedagogy"]
        confidence=p.get("topic_confidence")
        bucket="ausente" if not p.get("topic_predicted") else ("baixa" if (confidence or 0)<.7 else "alta")
        level=sum(r["tri"]["b"]>cut for cut in (.80054,1.56301))
        grouped[r["area"],r["year"],level,bucket].append(r)
    sample=[]
    for area in ("CH","CN","LC","MT"):
        strata=sorted(k for k in grouped if k[0]==area)
        rng.shuffle(strata)
        for key in strata:
            rng.shuffle(grouped[key])
        for i in range(75):
            while not grouped[strata[0]]:
                strata.pop(0)
            key=strata.pop(0)
            sample.append((key,grouped[key].pop()))
            strata.append(key)
    blind,audit=[],[]
    for key,r in sample:
        area,year,level,bucket=key
        p=r["pedagogy"]
        text=r.get("question") or ""
        options=" | ".join(f"{o.get('label')}. {o.get('text')}" for o in (r.get("options") or []))
        cues=signals(text+" "+options)
        assets=r.get("assets") or []
        ref=r.get("official_reference") or {}
        review={"id":r["id"],"area":area,"ano":year,"enunciado":safe(text),"alternativas":safe(options),
                "recursos_catalogados":safe(json.dumps(assets,ensure_ascii=False)),
                "assunto_revisor":"","subassunto_revisor":"","multirrotulo_revisor":"","habilidade_revisor":"",
                "evidencia_revisor":"","notas_revisor":""}
        blind.append(review)
        skill=r.get("skill")
        topic=p.get("topic_predicted")
        sub=p.get("subtopic_predicted")
        match=bool(topic in cues)
        risk="sinal_concorrente" if cues and not match and topic else (
            "sinal_compativel" if match else "sem_sinal_controlado")
        audit.append({"id":r["id"],"area":area,"ano":year,"dificuldade":level,"estrato_score":bucket,
                      "assunto_atual":safe(topic),"subassunto_atual":safe(sub),"habilidade_catalogo":safe(skill),
                      "codigo_formal_valido":bool(skill and re.fullmatch(r"H?(?:[1-9]|[12][0-9]|30)",str(skill))),
                      "assunto_status":"ausente" if not topic else "inconclusivo",
                      "subassunto_status":"ausente" if not sub else "inconclusivo",
                      "habilidade_status":"ausente" if skill is None else "inconclusivo",
                      "sinais_lexicais_independentes":" | ".join(cues),"triagem":risk,
                      "multiplos_sinais":len(cues)>1,"sem_enunciado":not text.strip(),
                      "tem_recursos":bool(assets),"co_item":r.get("co_item"),"co_prova":ref.get("co_prova"),
                      "posicao":ref.get("position"),"arquivo_referenciado":safe(ref.get("source_file")),
                      "evidencia_ligacao_catalogo":r.get("evidence_id"),
                      "resultado_adjudicado":"","revisao_humana_pendente":True})
    csv_write("auditoria_por_questao.csv",audit)
    csv_write("ficha_cega.csv",blind)
    keys=("assunto_status","subassunto_status","habilidade_status","triagem","area","ano",
          "dificuldade","estrato_score","tem_recursos","multiplos_sinais","sem_enunciado")
    stats={"sha256":HASH,"catalogo":len(rows),"sem_assunto":sum(not r["pedagogy"].get("topic_predicted") for r in rows),
           "sem_habilidade":sum(r.get("skill") is None for r in rows),"amostra":len(audit),
           "confirmadas_oficialmente":0,"pendentes":len(audit),"distribuicoes":{k:Counter(r[k] for r in audit) for k in keys},
           "por_area":{a:{k:Counter(r[k] for r in audit if r["area"]==a) for k in keys[:4]} for a in ("CH","CN","LC","MT")},
           "por_ano":{y:{k:Counter(r[k] for r in audit if r["ano"]==y) for k in keys[:4]} for y in sorted({r["ano"] for r in audit})}}
    (OUT/"metricas.json").write_text(json.dumps(stats,ensure_ascii=False,indent=2),encoding="utf8")
    print(json.dumps({k:v for k,v in stats.items() if k not in ("por_ano","por_area")},ensure_ascii=False))


if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("dataset",type=Path)
    run(p.parse_args().dataset)
