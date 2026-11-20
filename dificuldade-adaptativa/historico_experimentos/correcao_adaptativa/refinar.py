import hashlib
import json
import platform
from time import perf_counter
import zipfile

import numpy as np

from busca_autonoma import ROOT, metrics, simulate

TUNE=(521,523,541)
TEST=(547,557,563,569,571,577)
BASE={"bkt_atual":None,"bkt_politica_margem":(1,4,2,.09)}
CANDIDATES={
    "bkt_politica_conservadora":(2,8,2,.09),
    "bkt_politica_incerteza":(1,4,2,.09,.65),
    "bkt_politica_incerteza_forte":(1,4,2,.09,.75),
    "bkt_politica_histerese":(1,4,2,.09,0,True),
    "bkt_politica_hibrida":(1,4,2,.09,.65,True),
    "bkt_politica_hibrida_2":(2,4,2,.09,.65,True),
}


def audit():
    root=ROOT.parents[1]
    records={}
    for name in ("Gabaritei_PI_VI_viabilidade_arquitetura.zip","Gabaritei_PI_VI_busca_margem.zip"):
        path=root/name
        if path.exists():
            with zipfile.ZipFile(path) as z:
                assert z.testzip() is None
                for line in z.read("SHA256SUMS.txt").decode().splitlines():
                    h,n=line.split("  ",1)
                    assert hashlib.sha256(z.read(n)).hexdigest()==h
            records[name]="verified"
        else:
            records[name]="missing archive; local working artifacts inspected"
    source=json.loads((ROOT.parent/"viabilidade/resultados.json").read_bytes())
    margin=json.loads((ROOT/"busca_margem.json").read_bytes())
    assert source["groups"][2]["events"]==12363
    assert [round(source["metrics"][k]["auc"],3) for k in ("constant","bkt","sgd_frozen","sgd_updated")]==[.5,.678,.692,.693]
    assert [round(v[margin["selected"]]["accuracy"],4) for v in margin["test"].values()]==[.5112,.5053,.4751,.489]
    return records


def main():
    started=perf_counter()
    archives=audit()
    variants={**BASE,**CANDIDATES}
    regimes=[(g,c) for g in ("logistic","3pl") for c in (False,True)]
    development={}
    for g,c in regimes:
        data=simulate(TUNE,g,variants,c)
        development[g,c]={k:metrics(v) for k,v in data.items()}
    qualified=[]
    for k in CANDIDATES:
        if all(m[k]["false_change"]<=m["bkt_politica_margem"]["false_change"]
               and m[k]["offer_count"]>=.75*m["bkt_politica_margem"]["offer_count"]
               for m in development.values()):
            qualified.append(k)
    selected=max(qualified,key=lambda k:min(m[k]["accuracy"] for m in development.values()),default=None)
    results={}
    for g,c in regimes:
        rows=simulate(TEST,g,variants,c)
        out={k:metrics(v) for k,v in rows.items()}
        base=rows["bkt_politica_margem"]
        for k,v in rows.items():
            d=(v[:,0]-base[:,0])/36
            out[k]["gain_ci95"]=np.quantile(np.random.default_rng(42).choice(
                d,(2000,len(d))).mean(1),[.025,.975]).tolist()
        results[f"{g}/{c}"]=out
    report={"archives":archives,"development_seeds":TUNE,"test_seeds":TEST,"variants":variants,
            "criterion":"no higher false change and at least 75% of incumbent offers in every development scenario",
            "selected":selected,"development":{f"{g}/{c}":v for (g,c),v in development.items()},
            "test":results,"elapsed_seconds":perf_counter()-started,
            "environment":{"python":platform.python_version(),"numpy":np.__version__,"platform":platform.platform()}}
    (ROOT/"refinamento.json").write_text(json.dumps(report,indent=2),encoding="utf8")
    print("selected",selected)
    for g,ms in results.items():
        print(g,[(k,*(round(v[m]*100,2) for m in ("accuracy","false_change","student_coverage","offer_precision")))
                 for k,v in ms.items()])


if __name__=="__main__":
    main()
