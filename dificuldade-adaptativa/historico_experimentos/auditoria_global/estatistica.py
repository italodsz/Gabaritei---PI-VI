import csv
import json
from pathlib import Path

import numpy as np

ROOT=Path(__file__).resolve().parent
with (ROOT/"validacao_pareada.csv").open(encoding="utf-8-sig",newline="") as f:
    rows=list(csv.DictReader(f,delimiter=";"))
classes={"facil":0,"media":1,"dificil":2}
y=np.array([classes[r["dificuldade"]] for r in rows])
pred={k:np.array([classes[r[f"{k}_pred"]] for r in rows]) for k in ("bert","deberta")}

def macro(y,p):
    cm=np.bincount(y*3+p,minlength=9).reshape(3,3)
    total=cm.sum(0)+cm.sum(1)
    return np.divide(2*cm.diagonal(),total,out=np.zeros(3),where=total>0).mean()

rng=np.random.default_rng(42)
strata=[np.flatnonzero(y==c) for c in range(3)]
diff=[]
for _ in range(2000):
    idx=np.concatenate([rng.choice(s,len(s)) for s in strata])
    diff.append(macro(y[idx],pred["bert"][idx])-macro(y[idx],pred["deberta"][idx]))
result={"paired_f1_bert_minus_deberta":float(macro(y,pred["bert"])-macro(y,pred["deberta"])),
        "paired_ci95":np.quantile(diff,[.025,.975]).tolist(),"bootstrap_replicates":2000,"seed":42,"slices":{}}
for name,p in pred.items():
    mask=np.array([float(r["distancia_corte"])<=.10 for r in rows])
    long=np.array([int(r["comprimento"])>=np.median([int(r["comprimento"]) for r in rows]) for r in rows])
    result["slices"][name]={k:{"n":int(s.sum()),"correct":int((p[s]==y[s]).sum())}
                             for k,s in (("near_cut",mask),("far_cut",~mask),("long",long),("short",~long))}
(ROOT/"estatistica.json").write_text(json.dumps(result,indent=2),encoding="utf8")
print(json.dumps(result))
