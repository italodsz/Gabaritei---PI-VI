import argparse
from copy import deepcopy
import hashlib
import json
from pathlib import Path
import sys
from time import perf_counter

import numpy as np
from sklearn.linear_model import SGDClassifier

OUT=Path(__file__).resolve().parent
sys.path.insert(0,str(OUT.parent/"viabilidade"))
from fechamento import eligible_events, partitions
from experimento import replay, score


def main(path):
    start=perf_counter()
    source=hashlib.sha256(path.read_bytes()).hexdigest()
    old=json.loads((OUT.parent/"viabilidade/fechamento.json").read_bytes())
    assert source==old["source_sha256"]
    groups=partitions(eligible_events(path))
    train,test=groups["train"],groups["test"]
    assert train.order_id.max()<test.order_id.min()
    assert set(train.user_id).isdisjoint(test.user_id)
    def features(frame):
        return replay(list(frame[["user_id","skill_id","correct"]].itertuples(index=False,name=None)),old["params_bkt"])
    x,y,_=features(train)
    v,t,bkt=features(test)
    summary=train.groupby("skill_id").correct.agg(["sum","count"])
    prior=dict(zip(summary.index,(summary["sum"]+2*y.mean())/(summary["count"]+2)))
    simple=np.array([prior.get(skill,y.mean()) for skill in test.skill_id])
    model=SGDClassifier(loss="log_loss",alpha=.001,learning_rate="constant",
                        eta0=.001,max_iter=30,random_state=42).fit(x,y)
    predictions={"constante":np.full(len(t),y.mean()),"sem_personalizacao":simple,
                 "bkt":bkt,"congelado":model.predict_proba(v)[:,1]}
    updates={}
    order=test.order_id.to_numpy()
    splits=[0,*np.searchsorted(order,order[np.arange(500,len(order),500)]).tolist(),len(t)]
    for eta in (.0002,.002):
        candidate=deepcopy(model)
        candidate.set_params(eta0=eta)
        batches,preds=[],[]
        for first,last in zip(splits,splits[1:]):
            before=np.r_[candidate.coef_.ravel(),candidate.intercept_].copy()
            p=candidate.predict_proba(v[first:last])[:,1]
            preds.extend(p)
            frozen=predictions["congelado"][first:last]
            candidate.partial_fit(v[first:last],t[first:last])
            after=np.r_[candidate.coef_.ravel(),candidate.intercept_]
            batches.append({"first_order":int(order[first]),"last_order":int(order[last-1]),
                            "n":last-first,"before":before.tolist(),"after":after.tolist(),
                            "l2":float(np.linalg.norm(before-after)),
                            "log_loss_pre_update":score(t[first:last],p)["log_loss"],
                            "frozen_log_loss":score(t[first:last],frozen)["log_loss"]})
        key=f"incremental_{eta}"
        predictions[key]=np.asarray(preds)
        updates[key]=batches
    def subgroup(labels):
        out={}
        for n,key in enumerate(sorted(set(labels))):
            mask=np.asarray(labels)==key
            if len(set(t[mask]))==2:
                out[str(n+1)]={"n":int(mask.sum()),"metrics":{k:score(t[mask],p[mask])
                                             for k,p in predictions.items()}}
        return out
    result={"sha256":source,"seed":42,"train_events":len(y),"test_events":len(t),
            "train_students":int(train.user_id.nunique()),"test_students":int(test.user_id.nunique()),
            "metrics":{k:score(t,p) for k,p in predictions.items()},"updates":updates,
            "per_student_anonymous":subgroup(test.user_id.tolist()),
            "per_skill_anonymous":subgroup(test.skill_id.tolist()),
            "logged_item_bands":{
                k:{f"{lo}-{hi}":{"n":int(mask.sum()),
                                "observed_correct":float(t[mask].mean()) if mask.any() else None}
                   for lo,hi in ((.65,.80),(.60,.85)) if (mask:=(p>=lo)&(p<=hi)) is not None}
                for k,p in predictions.items()},
            "seconds":perf_counter()-start}
    (OUT/"incremental.json").write_text(json.dumps(result,indent=2),encoding="utf8")
    print({k:[round(v[m],5) for m in ("auc","log_loss","brier","ece","accuracy")] for k,v in result["metrics"].items()})
    print({k:[len(b),sum(x["l2"]>0 for x in b)] for k,b in updates.items()})


if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("csv",type=Path)
    main(p.parse_args().csv)
