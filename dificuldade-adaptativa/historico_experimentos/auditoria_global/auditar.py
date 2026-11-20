import argparse
from collections import Counter, defaultdict
import csv
import hashlib
import json
from pathlib import Path
import re
import statistics
import zipfile

import numpy as np
from sklearn.metrics import classification_report, confusion_matrix
from transformers import AutoTokenizer

OUT=Path(__file__).resolve().parent
MODULE=OUT.parent
RESULTS=MODULE/"results"
LABELS=["facil","media","dificil"]
ENCODERS={"minilm":"minilm","qwen06":"qwen06_cuda","bge":"bge_cuda"}


def read(path):
    return json.loads(path.read_bytes())


def sha(path):
    with path.open("rb") as file:
        return hashlib.file_digest(file,"sha256").hexdigest()


def metrics(actual,predicted):
    result=classification_report(actual,predicted,labels=LABELS,output_dict=True,zero_division=0)
    matrix=confusion_matrix(actual,predicted,labels=LABELS)
    result["confusion"]=matrix.tolist()
    result["ordinal_mae"]=float(np.mean([abs(LABELS.index(a)-LABELS.index(b)) for a,b in zip(actual,predicted)]))
    return result


def loss_flags(tok,text,limit,commands,options):
    full=tok(text,truncation=False,verbose=False)["input_ids"]
    kept=tok(text,truncation=True,max_length=limit,return_offsets_mapping=True)["offset_mapping"]
    end=max((b for _,b in kept),default=0)
    return {"tokens":len(full),"truncated":len(full)>limit,
            "alternatives_not_fully_kept":sum(pos>end for pos in options),
            "command_proxy_lost":bool(commands and commands>end),
            "math_proxy_lost":bool(re.search(r"[=√±×÷]|\\frac",text[end:]))}


def write_csv(name,rows):
    cols=list(dict.fromkeys(k for r in rows for k in r))
    with (OUT/name).open("w",encoding="utf-8-sig",newline="") as f:
        writer=csv.DictWriter(f,fieldnames=cols,delimiter=";")
        writer.writeheader()
        for row in rows:
            writer.writerow({k:"'"+v if isinstance(v,str) and v.lstrip().startswith(("=","+","-","@")) else v
                             for k,v in row.items()})


def main(base):
    reference=read(RESULTS/"fase_01.json")
    assert all(sha(base/name)==expected for name,expected in reference["hashes"].items())
    ids=read(base/"ids_elegiveis.json")
    membership={i:s for s,values in ids.items() for i in values}
    rows=[json.loads(l) for l in (base/"data/questions.jsonl").read_bytes().splitlines()]
    by_id={r["id"]:r for r in rows}
    assert len(rows)==len(by_id)==2971 and len(membership)==sum(map(len,ids.values()))==2063
    assert [len(ids[s]) for s in ("train","validation","test")]==[1801,136,126]
    for s in ids:
        split=[json.loads(l) for l in (base/f"splits/{s}.jsonl").read_bytes().splitlines()]
        assert all(by_id[r["id"]]==r and r["split"]==s for r in split)
        assert set(ids[s])<={r["id"] for r in split}
    cuts=statistics.quantiles([by_id[i]["tri"]["b"] for i in ids["train"]],n=3,method="inclusive")
    assert cuts==reference["difficulty_cutoffs"]
    area_cuts={a:statistics.quantiles([by_id[i]["tri"]["b"] for i in ids["train"] if by_id[i]["area"]==a],
                                     n=3,method="inclusive") for a in ("CH","CN","LC","MT")}
    norm=lambda s:" ".join(re.findall(r"\w+",s.casefold()))
    duplicates=Counter(norm(r["question"] or "") for r in rows)
    completeness=[]
    by_group=defaultdict(Counter)
    meta={}
    for r in rows:
        p=r.get("pedagogy") or {}
        b=r["tri"]["b"]
        text=r["question"] or ""
        difficulty=LABELS[sum(b>c for c in cuts)]
        options=r.get("options") or []
        valid_skill=bool(re.fullmatch(r"H?(?:[1-9]|[12][0-9]|30)",str(r.get("skill"))))
        status=lambda v:"presente_nao_verificado" if v else "ausente"
        checks={"id":"verificado","ano":"verificado" if 2009<=r["year"]<=2024 else "inconsistente",
                "area":"verificado" if r["area"] in area_cuts else "inconsistente","disciplina":"ausente",
                "texto":status(text.strip()),"alternativas":status(options) if len(options) in (0,5) else "inconsistente",
                "gabarito":"presente_nao_verificado" if r.get("answer") in {o["label"] for o in options} else "inconsistente",
                "assunto":status(p.get("topic_predicted")),"subassunto":status(p.get("subtopic_predicted")),
                "habilidade":status(r.get("skill")) if not r.get("skill") or valid_skill else "inconsistente",
                "competencia":status(valid_skill),
                **{f"tri_{k}":status(r["tri"].get(k) is not None) for k in "abc"},
                "recursos":status(r.get("assets")),
                "grafico":status(re.search(r"\bgráfico\b",text,re.I)),
                "tabela":status(re.search(r"\btabela\b",text,re.I)),
                "formula":status(re.search(r"[=√±×÷]|\\frac",text)),
                "referencia_visual":status(re.search(r"\b(figura|gráfico|imagem|tabela)\b",text,re.I)),
                "qualidade_extracao":"inconsistente" if not text.strip() or "\ufffd" in text else "presente_nao_verificado",
                "duplicacao":"inconsistente" if text and duplicates[norm(text)]>1 else "verificado",
                "elegivel_texto":"verificado" if r["id"] in membership else "nao_aplicavel",
                "historico_individual":"ausente"}
        aux={"id":r["id"],"ano":r["year"],"area":r["area"],"particao":membership.get(r["id"],"fora"),
             "dificuldade":difficulty,"tri_b":b,"distancia_corte":min(abs(b-c) for c in cuts),
             "assunto_catalogo":p.get("topic_predicted"),"habilidade_catalogo":r.get("skill"),
             "comprimento":len(text),"assets":bool(r.get("assets")),"formula_proxy":checks["formula"]!="ausente",
             "tabela_proxy":checks["tabela"]!="ausente","visual_proxy":checks["referencia_visual"]!="ausente",
             "sem_assunto":checks["assunto"]=="ausente","sem_habilidade":checks["habilidade"]=="ausente",
             "tipo":p.get("content_mode") or "desconhecido"}
        meta[r["id"]]=aux
        completeness.append({**aux,**{f"status_{k}":v for k,v in checks.items()}})
        for axis in ("ano","area","particao","dificuldade","tipo"):
            group=by_group[f"{axis}/{aux[axis]}"]
            group["n"]+=1
            group.update(f"{k}/{v}" for k,v in checks.items())
    write_csv("completude.csv",completeness)
    models={}
    joined={i:dict(meta[i]) for i in ids["validation"]}
    trunc={}
    for name,stem in ENCODERS.items():
        path=RESULTS/f"fase02r_{stem}.npz"
        details=read(path.with_suffix(".json"))
        assert sha(path)==details["embedding_sha256"]
        with np.load(path) as cache:
            assert cache["validation_ids"].tolist()==ids["validation"]
            historical=cache["validation_lengths"].tolist()
        tok=AutoTokenizer.from_pretrained(details["checkpoint"],revision=details["revision"],local_files_only=True)
        flags=[]
        for i,count in zip(ids["validation"],historical):
            text=by_id[i]["question"]
            f=loss_flags(tok,text,details["input_limit"],text.rfind("?")+1,[])
            assert f["tokens"]==count
            joined[i].update({f"{name}_{k}":v for k,v in f.items()})
            flags.append(f)
        trunc[name]={"config":details,"truncated":sum(f["truncated"] for f in flags),
                     "command_proxy_lost":sum(f["command_proxy_lost"] for f in flags),
                     "math_proxy_lost":sum(f["math_proxy_lost"] for f in flags)}
    runs={"bert":"ft_bert_512_7","deberta":"ft_deberta_256_7"}
    for name,folder in runs.items():
        root=RESULTS/folder
        data=read(root/"metricas.json")
        run=read(root/"execucao.json")
        assert sha(root/"delta.pt")==run["checkpoint_sha256"]
        pairs=data["predictions"]
        assert [r["id"] for r in pairs]==ids["validation"]
        assert all(p["actual"]==meta[p["id"]]["dificuldade"] for p in pairs)
        scores=metrics([p["actual"] for p in pairs],[p["predicted"] for p in pairs])
        assert abs(scores["macro avg"]["f1-score"]-data["macro_f1"])<1e-12
        models[name]={"recomputed":scores,"config":{k:v for k,v in data.items() if k!="predictions"},"run":run}
        tok=AutoTokenizer.from_pretrained(root/"tokenizer",local_files_only=True)
        flags=[]
        for p in pairs:
            i=p["id"]
            row=by_id[i]
            stem=row["question"].strip()
            text=stem+"\nAlternativas:\n"
            ends=[]
            for index,opt in enumerate(row["options"]):
                text+=("\n" if index else "")+f"{opt['label']}. {opt['text']}"
                ends.append(len(text))
            f=loss_flags(tok,text,data["limit"],stem.rfind("?")+1,ends)
            joined[i].update({f"{name}_{k}":v for k,v in f.items()})
            joined[i][f"{name}_pred"]=p["predicted"]
            joined[i][f"{name}_correct"]=p["actual"]==p["predicted"]
            flags.append(f)
        trunc[name]={k:sum(f[k] for f in flags) for k in flags[0] if k!="tokens"}
    paired=list(joined.values())
    write_csv("validacao_pareada.csv",paired)
    middle=[r for r in paired if r["dificuldade"]=="media"]
    severe=[]
    for r in paired:
        if abs(LABELS.index(r["dificuldade"])-LABELS.index(r["bert_pred"]))==2:
            severe.append({**r,"enunciado":by_id[r["id"]]["question"],
                           "hipotese":"inconclusivo; truncamento ausente" if not r["bert_truncated"] else "possivel perda de contexto"})
    write_csv("classe_media.csv",middle)
    write_csv("erros_graves.csv",severe)
    groups={}
    for name in runs:
        for key in ("area","ano","assunto_catalogo","habilidade_catalogo","dificuldade","assets","formula_proxy","tabela_proxy","visual_proxy",
                    "sem_assunto","sem_habilidade",f"{name}_truncated"):
            counts=defaultdict(Counter)
            for r in paired:
                counts[str(r[key])].update(["n","acerto" if r[f"{name}_correct"] else "erro"])
            groups[f"{name}/{key}"]=counts
    def summary(key):
        return {k:{"min":float(np.min(v)),"q1":float(np.quantile(v,.25)),"median":float(np.median(v)),
                   "q3":float(np.quantile(v,.75)),"max":float(np.max(v))} for k,v in key.items()}
    tri={}
    for axis in ("area","year"):
        tri[axis]={str(g):summary({k:[r["tri"][k] for r in rows if r[axis]==g] for k in "abc"})
                   for g in sorted({r[axis] for r in rows})}
    archives={}
    for p in sorted(OUT.parents[1].glob("Gabaritei*.zip")):
        with zipfile.ZipFile(p) as z:
            archives[p.name]={"sha256":sha(p),"files":len(z.namelist()),"corrupt_entry":z.testzip()}
    archive={"completude":by_group,"modelos_recalculados":models,"truncamento":trunc,"erros_por_fatia":groups,
             "tri":tri,"cortes_globais":cuts,"cortes_area_treino":area_cuts,
             "reclassificacao_area_validacao":sum(sum(r["tri_b"]>c for c in area_cuts[r["area"]])!=LABELS.index(r["dificuldade"]) for r in paired),
             "perto_cortes_validacao_010":sum(r["distancia_corte"]<=.10 for r in paired),
             "ambos_erram":[r["id"] for r in paired if not r["bert_correct"] and not r["deberta_correct"]],
             "ambos_acertam":[r["id"] for r in paired if r["bert_correct"] and r["deberta_correct"]],
             "so_um_acerta":[r["id"] for r in paired if r["bert_correct"]!=r["deberta_correct"]],
             "catalogo_sha256":sha(base/"data/questions.jsonl"),"archives":archives}
    (OUT/"resultados.json").write_text(json.dumps(archive,ensure_ascii=False,indent=2),encoding="utf8")
    print("catalog",len(rows),"validation",len(paired),"middle",len(middle),"severe",len(severe))
    print("truncation", {k:v.get("truncated") for k,v in trunc.items()})
    print("paired",*(len(archive[k]) for k in ("ambos_acertam","ambos_erram","so_um_acerta")))


if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("base",type=Path)
    main(p.parse_args().base)
