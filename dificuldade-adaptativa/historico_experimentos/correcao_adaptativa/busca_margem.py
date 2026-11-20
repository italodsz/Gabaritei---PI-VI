import json
import numpy as np
from busca_autonoma import ROOT, metrics, simulate

TUNE=(461,463,467)
TEST=(479,487,491,499,503,509)
CURRENT={"bkt_atual":None,"bkt_politica_anterior":(2,6,2)}

def main():
    candidates={f"bkt_politica_{c}_{m}_{b}":(c,m,2,b)
                for c in (1,2) for m in (4,6) for b in (.04,.09,.14,.19)}
    dev={g:simulate(TUNE,g,candidates,True) for g in ("logistic","3pl")}
    scores={k:[metrics(v[k]) for v in dev.values()] for k in candidates}
    eligible=[k for k,v in scores.items() if max(m["false_change"] for m in v)<=.10]
    selected=max(eligible,key=lambda k:min(v["accuracy"] for v in scores[k]))
    report={"tune":TUNE,"test_seeds":TEST,"selection_false_change_max":.10,
            "selected":selected,"configs":candidates,"development_closed":scores,"test":{}}
    for g in dev:
        for closed in (False,True):
            rows=simulate(TEST,g,{**CURRENT,selected:candidates[selected]},closed)
            result={k:metrics(v) for k,v in rows.items()}
            for baseline in CURRENT:
                d=(rows[selected][:,0]-rows[baseline][:,0])/36
                result[f"vs_{baseline}"]={"gain":float(d.mean()),"ci95":np.quantile(
                    np.random.default_rng(42).choice(d,(2000,len(d))).mean(1),[.025,.975]).tolist()}
            report["test"][f"{g}/{closed}"]=result
    (ROOT/"busca_margem.json").write_text(json.dumps(report,indent=2),encoding="utf8")
    print(selected)
    for k,v in report["test"].items():
        print(k,[(m,round(x["accuracy"],4),round(x["false_change"],4),x["violations"])
                 for m,x in v.items() if "accuracy" in x])

if __name__=="__main__":
    main()
