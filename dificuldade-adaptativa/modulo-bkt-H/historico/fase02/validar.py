"""Prospective preliminary validation, with model selection already frozen by training likelihood."""
import argparse
from collections import defaultdict
from time import perf_counter

import numpy as np

from bkt.common import ROOT,save,sha
from bkt.dados import groups
from bkt.inferencia import load_model,trace
from bkt.metricas import metrics


def main(private):
    model_path=ROOT/"models/parametros_por_habilidade.json"
    model=load_model(model_path)
    data=groups(private,"validacao")
    by_skill={}
    students=defaultdict(lambda:np.zeros(4))
    all_y,all_p,all_b=[],[],[]
    start=perf_counter()
    for skill,rows in data.items():
        entry=model["skills"][skill]
        base=(entry["correct_count"]+1)/(entry["training_events"]+2)
        y,p=[],[]
        for row in rows:
            outcomes=row["correct_first"]
            predictions=[r["predicted_correct"] for r in trace(outcomes,entry["parameters"])]
            y.extend(outcomes)
            p.extend(predictions)
            a=np.array(outcomes)
            q=np.array(predictions)
            ll=-a*np.log(q)-(1-a)*np.log1p(-q)
            lb=-a*np.log(base)-(1-a)*np.log1p(-base)
            students[row["student_id"]]+=np.array([ll.sum(),lb.sum(),len(a),((q-a)**2).sum()])
        by_skill[skill]={"bkt":metrics(y,p),"baseline":metrics(y,[base]*len(y)),
                         "baseline_probability":base}
        all_y.extend(y)
        all_p.extend(p)
        all_b.extend([base]*len(y))
    rng=np.random.default_rng(20261110+200000)
    a=np.array([students[k] for k in sorted(students)])
    paired=[]
    for _ in range(2000):
        sampled=a[rng.integers(0,len(a),size=len(a))]
        paired.append(float((sampled[:,0].sum()-sampled[:,1].sum())/sampled[:,2].sum()))
    macro={}
    for method in ("bkt","baseline"):
        macro[method]={metric:float(np.mean([r[method][metric] for r in by_skill.values() if r[method][metric] is not None]))
                       for metric in ("log_loss","brier","auc_roc","accuracy_threshold_0_5","ece_10_bins")}
    result={"split":"validacao","model_sha256":sha(model_path),"model_selection":"treino_somente",
            "skills":by_skill,"micro":{"bkt":metrics(all_y,all_p),"baseline":metrics(all_y,all_b)},
            "macro":macro,"students_evaluated":len(students),
            "paired_validation_bootstrap":{"unit":"estudante","replicates":2000,"seed":20261110+200000,
                     "difference":"BKT_menos_baseline_em_log_loss","q025":float(np.quantile(paired,.025)),
                     "q975":float(np.quantile(paired,.975))},
            "elapsed_seconds":perf_counter()-start,"test_evaluated":False}
    save(ROOT/"reports/validacao.json",result)
    print("Validação, estudantes:",len(students),"eventos:",len(all_y),"habilidades:",len(by_skill))
    for method,m in result["micro"].items():
        print(method,{k:v for k,v in m.items() if k!="calibration"})
    print(result["paired_validation_bootstrap"])


if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("private",type=__import__("pathlib").Path)
    main(p.parse_args().private)
