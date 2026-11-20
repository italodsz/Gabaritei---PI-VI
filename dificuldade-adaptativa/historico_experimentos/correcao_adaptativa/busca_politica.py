import json

import numpy as np

from busca_autonoma import ROOT, metrics, simulate

TUNE = (401, 409, 419, 421)
TEST = (431, 433, 439, 443, 449, 457)


def main():
    candidates = {f"bkt_politica_{c}_{m}_{s}":(c,m,s)
                  for c in (2,4,6) for m in (6,8,10) for s in (1,2)}
    baselines = {"bkt_atual":None,"taxa":None}
    development = {(g,closed):simulate(TUNE,g,candidates,closed)
                   for g in ("logistic","3pl") for closed in (False,True)}
    # Protect both modes instead of selecting for the closed loop alone.
    def objective(name):
        m = [metrics(v[name]) for v in development.values()]
        return min(m[0]["accuracy"],m[2]["accuracy"]),np.mean([x["accuracy"] for x in m])
    best = max(candidates,key=objective)
    variants={**baselines,best:candidates[best]}
    test={}
    for g in ("logistic","3pl"):
        for closed in (False,True):
            rows=simulate(TEST,g,variants,closed)
            result={name:metrics(values) for name,values in rows.items()}
            for base in baselines:
                d=(rows[best][:,0]-rows[base][:,0])/36
                ci=np.quantile(np.random.default_rng(42).choice(d,(2000,len(d))).mean(1),[.025,.975])
                result[f"vs_{base}"]={"gain":float(d.mean()),"ci95":ci.tolist()}
            test[f"{g}/{'closed' if closed else 'fixed'}"]=result
    result={"tune_seeds":TUNE,"test_seeds":TEST,"variants":candidates,"selected":best,
            "validation":{f"{g}/{closed}":{k:metrics(v) for k,v in values.items()}
                          for (g,closed),values in development.items()},"test":test}
    (ROOT/"busca_politica.json").write_text(json.dumps(result,indent=2),encoding="utf8")
    print(best)
    print(json.dumps(test,indent=2))


if __name__=="__main__":
    main()
