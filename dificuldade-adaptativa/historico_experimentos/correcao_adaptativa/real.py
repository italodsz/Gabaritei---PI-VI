import hashlib
import json
from pathlib import Path
import sys

import numpy as np
import pandas as pd
from scipy.special import logit
from sklearn.linear_model import SGDClassifier

from rodada import Estimator, ROOT

sys.path.insert(0,str(ROOT.parent/"viabilidade"))
from fechamento import eligible_events, partitions, policy, update_model, change
from experimento import score


def main(path):
    digest=hashlib.sha256(path.read_bytes()).hexdigest()
    expected=json.loads((ROOT.parent/"viabilidade/fechamento.json").read_bytes())["source_sha256"]
    if digest!=expected:
        raise ValueError("CSV divergente.")
    groups=partitions(eligible_events(path))
    raw=pd.read_csv(path,usecols=["user_id","order_id","problem_id"],encoding="latin1")
    lookup=raw.drop_duplicates(["user_id","order_id"]).set_index(["user_id","order_id"]).problem_id
    for key,frame in groups.items():
        groups[key]=frame.join(lookup,on=["user_id","order_id"],validate="many_to_one").dropna(subset=["problem_id"])
    item=groups["train"].groupby("problem_id").correct.agg(["sum","count"])
    difficulty=(-logit((item["sum"]+2)/(item["count"]+4))).to_dict()
    leave_out=groups["train"].groupby(["user_id","problem_id"]).correct.agg(["sum","count"])
    datasets={}
    evidence={}
    methods=("bkt_item","elo_item","rasch","hibrido_item")
    for key,frame in groups.items():
        students={}
        xs,ys,ps=[],[],[]
        for r in frame.itertuples():
            model=students.setdefault(r.user_id,Estimator())
            d=difficulty.get(r.problem_id,0.)
            if key=="train":
                total=item.loc[r.problem_id]
                own=leave_out.loc[(r.user_id,r.problem_id)]
                d=float(-logit((total["sum"]-own["sum"]+2)/(total["count"]-own["count"]+4)))
            if r.problem_id in model.items:
                continue
            p=[model.predict(r.skill_id,m,d) for m in methods]
            xs.append([p[0],p[2],d,np.log1p(len(model.history[r.skill_id]))])
            ps.append(p)
            ys.append(r.correct)
            model.record(r.problem_id,r.problem_id,r.skill_id,d,r.correct)
        datasets[key]=(np.asarray(xs),np.asarray(ys),np.asarray(ps))
        evidence[key]={"events":len(ys),"students":len(students),"items_with_train_proxy_rows":int(frame.problem_id.isin(difficulty).sum()),
                       "rows_before_repeat_filter":len(frame)}
    x,y,_=datasets["train"]
    frozen=SGDClassifier(loss="log_loss",learning_rate="constant",eta0=.001,alpha=.001,random_state=42).fit(x,y)
    active=frozen
    updates=[]
    for i in (1,2):
        xu,yu,_=datasets[f"update{i}"]
        xg,yg,_=datasets[f"gate{i}"]
        candidate=update_model(active,xu,yu,.002)
        a,b=[score(yg,m.predict_proba(xg)[:,1]) for m in (active,candidate)]
        promote=policy(b,a)
        updates.append({"batch":i,"promoted":bool(promote),"incumbent_gate":a,"candidate_gate":b,
                        "parameter_change":change(active,candidate,xg)})
        if promote:
            active=candidate
    xt,yt,pt=datasets["test"]
    results={m:score(yt,pt[:,i]) for i,m in enumerate(methods)}
    results.update(constante=score(yt,np.full(len(yt),y.mean())),sgd_congelado=score(yt,frozen.predict_proba(xt)[:,1]),
                   sgd_selecionado=score(yt,active.predict_proba(xt)[:,1]))
    report={"dataset_sha256":digest,"groups":evidence,"train_calibrated_item_count":len(difficulty),
            "results":results,"updates":updates}
    (ROOT/"reais.json").write_text(json.dumps(report,indent=2),encoding="utf8")
    print(evidence)
    print({k:[round(v[m],4) for m in ("auc","log_loss","brier","ece")] for k,v in results.items()})
    print([(u["batch"],u["promoted"],u["parameter_change"]["l2"]) for u in updates])


if __name__=="__main__":
    main(Path(sys.argv[1]))
