import argparse
from collections import Counter, defaultdict
import hashlib
import json
from pathlib import Path
import re
import statistics

from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.svm import LinearSVC
import pandas as pd

ROOT=Path(__file__).resolve().parent
AREAS={"CH":(5,10,15,20,25,30),"LC":(4,8,11,14,17,20,24,27,30),
       "MT":(5,9,14,18,23,26,30),"CN":(4,7,12,16,19,23,27,30)}
HASH="22d83ac5d269976b647d34cb8aa66ccbebec6c21b0773487926eb294ee69fbd5"


def competence(area, skill):
    if not re.fullmatch(r"(?:H)?(?:[1-9]|[12][0-9]|30)",str(skill)):
        return None
    n=int(str(skill).lstrip("H"))
    return next(i for i,end in enumerate(AREAS[area],1) if n<=end)


def read_rows(path):
    return [json.loads(line) for line in path.read_bytes().splitlines()]


def audit(base):
    reference=json.loads((ROOT.parent/"results/fase_01.json").read_bytes())
    hashes={k:hashlib.sha256((base/k).read_bytes()).hexdigest() for k in reference["hashes"]}
    assert hashes==reference["hashes"] and hashes["data/questions.jsonl"]==HASH
    rows=read_rows(base/"data/questions.jsonl")
    catalog={r["id"]:r for r in rows}
    ids=json.loads((base/"ids_elegiveis.json").read_bytes())
    assert len(rows)==len(catalog)==2971
    assert sum(map(len,ids.values()))==len(set().union(*map(set,ids.values())))
    assert [len(ids[s]) for s in ("train","validation","test")]==[1801,136,126]
    for split,values in ids.items():
        part=read_rows(base/f"splits/{split}.jsonl")
        assert set(values)<={r["id"] for r in part}
        assert all(catalog[r["id"]]==r and r["split"]==split for r in part)
    for key in ("family_id","content_family_id","co_item"):
        sets=[{catalog[i][key] for i in values if catalog[i].get(key)} for values in ids.values()]
        assert not any(sets[i]&sets[j] for i in range(3) for j in range(i+1,3))
    cuts=statistics.quantiles([catalog[i]["tri"]["b"] for i in ids["train"]],n=3,method="inclusive")
    assert cuts==reference["difficulty_cutoffs"]
    taxonomy=defaultdict(set)
    sidecar=[]
    counts=Counter()
    years=defaultdict(Counter)
    normalized=Counter()
    for r in rows:
        assert r["area"] in AREAS
        p=r.get("pedagogy") or {}
        topic,subtopic=p.get("topic_predicted"),p.get("subtopic_predicted")
        if topic and subtopic:
            taxonomy[r["area"],topic].add(subtopic)
        skill=r.get("skill")
        comp=competence(r["area"],skill)
        tri=r.get("tri") or {}
        assert tri["a"]>0 and 0<=tri["c"]<=1
        text=r.get("question") or ""
        options=r.get("options") or []
        ref=r.get("official_reference") or {}
        valid_ref=bool(r.get("co_item") and ref.get("source_file") and ref.get("year")==r["year"])
        flags={"topic_missing":not topic,"subtopic_missing":not subtopic,"skill_missing":skill is None,
               "skill_invalid":skill is not None and comp is None,"tri_complete":len(tri)==3,
               "reference_with_item_and_year":valid_ref,"empty_question":not text.strip(),
               "invalid_answer":r.get("answer") not in {o.get("label") for o in options},
               "options_not_five":len(options)!=5,"replacement_char":"\ufffd" in json.dumps(r,ensure_ascii=False),
               "assets":bool(r.get("assets")),"visual_flag":p.get("content_mode")=="visual_or_multimodal",
               "visual_lexical_proxy":bool(re.search(r"\b(figura|gráfico|tabela|imagem)\b",text,re.I)),
               "a_below_025":tri["a"]<.25,"not_human_reviewed":p.get("review_status")=="rule_generated_unreviewed"}
        counts.update(k for k,v in flags.items() if v)
        years[r["year"]].update(["items",*(k for k,v in flags.items() if v)])
        normalized[" ".join(re.findall(r"\w+",text.casefold()))]+=1
        sidecar.append({"id":r["id"],"year":r["year"],"area":r["area"],"co_item":r.get("co_item"),
                        "official_reference":ref,"evidence_id":r.get("evidence_id"),"discipline":None,
                        "topics_inferred":[topic] if topic else [],"subtopics_inferred":[subtopic] if subtopic else [],
                        "topic_method":p.get("method"),"topic_confidence_uncalibrated":p.get("topic_confidence"),
                        "topic_review_status":p.get("review_status"),"catalog_skill":skill,
                        "competence_from_catalog_skill":comp,"tri":tri,"difficulty":sum(tri["b"]>c for c in cuts),
                        "flags":flags})
    report={"count":len(rows),"hashes":hashes,"cuts":cuts,"flags":dict(counts),"years":years,
            "areas":Counter(r["area"] for r in rows),
            "evidence":Counter(r.get("evidence_id") for r in rows),
            "duplicate_normalized_groups":sum(v>1 for k,v in normalized.items() if k),
            "eligibility":{s:len(v) for s,v in ids.items()}}
    return catalog,ids,sidecar,report,[
        {"area":a,"topic_inferred":t,"subtopics_inferred":sorted(v)}
        for (a,t),v in sorted(taxonomy.items())]


def experiment(catalog, ids, sidecar):
    lookup={r["id"]:r for r in sidecar}
    def frame(split):
        return pd.DataFrame([{"text":catalog[i]["question"],
                              "topic":str(lookup[i]["topics_inferred"] or None),
                              "skill":f"{lookup[i]['area']}:{lookup[i]['catalog_skill']}" if lookup[i]["catalog_skill"] else "missing",
                              "target":lookup[i]["difficulty"],"area":lookup[i]["area"]} for i in ids[split]])
    train,val=frame("train"),frame("validation")
    report={}
    for name,columns in (("texto",[]),("texto_assunto",["topic"]),("texto_assunto_habilidade",["topic","skill"])):
        transforms=[("text",TfidfVectorizer(analyzer="char",ngram_range=(3,5),min_df=2),"text")]
        if columns:
            transforms.append(("metadata",OneHotEncoder(handle_unknown="ignore"),columns))
        model=make_pipeline(ColumnTransformer(transforms),LinearSVC(random_state=42))
        model.fit(train,train["target"])
        pred=model.predict(val)
        report[name]={"validation":classification_report(val.target,pred,labels=[0,1,2],output_dict=True,zero_division=0),
                      "confusion":confusion_matrix(val.target,pred,labels=[0,1,2]).tolist(),
                      "by_area":{area:classification_report(val.target[val.area==area],pred[val.area==area],
                                labels=[0,1,2],output_dict=True,zero_division=0) for area in AREAS}}
    return report


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("dataset",type=Path)
    args=parser.parse_args()
    catalog,ids,sidecar,report,taxonomy=audit(args.dataset)
    outputs={"auditoria.json":report,"taxonomia.json":taxonomy,"matriz_codigos.json":AREAS,
             "ablacao.json":experiment(catalog,ids,sidecar)}
    for name,data in outputs.items():
        (ROOT/name).write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding="utf8")
    (ROOT/"catalogo_lateral.jsonl").write_text("".join(json.dumps(r,ensure_ascii=False)+"\n" for r in sidecar),encoding="utf8")
    print(report)
    print({k:v["validation"]["macro avg"]["f1-score"] for k,v in outputs["ablacao.json"].items()})


if __name__=="__main__":
    main()
