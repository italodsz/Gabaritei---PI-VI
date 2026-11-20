"""Post hoc paired comparison with student-history baseline, on aligned real events."""
import argparse
from collections import defaultdict
from pathlib import Path
import numpy as np

from bkt04.common import ROOT,load,save,rows,utc
from bkt04.canonico import fingerprint
from bkt04.inferencia import trace


def aligned(private):
    models=load(ROOT/"models/parametros_originais.json")["skills"]
    sequences=sorted((r for r in rows(private/"sequencias_teste.jsonl") if r["skill_id"] in models),
                     key=lambda r:(int(r["skill_id"]),r["event_order"][0]))
    out={k:[] for k in ("student","event_id","skill","y","bkt","historico_suavizado")}
    for seq in sequences:
        entry=models[seq["skill_id"]]
        prior=(entry["correct_count"]+1)/(entry["training_events"]+2)
        predictions=trace(seq["correct_first"],entry["parameters"])
        hits=0
        for i,(y,r) in enumerate(zip(seq["correct_first"],predictions,strict=True)):
            out["student"].append(seq["student_id"])
            out["event_id"].append(seq["event_ids"][i])
            out["skill"].append(seq["skill_id"])
            out["y"].append(y)
            out["bkt"].append(r["predicted_correct"])
            out["historico_suavizado"].append((hits+2*prior)/(i+2))
            hits+=y
    result={k:np.array(v) for k,v in out.items()}
    if len(set(result["event_id"]))!=len(result["event_id"]):
        raise ValueError("Eventos não são únicos.")
    return result


def paired(data,replicates,seed):
    grouped={}
    y=data["y"]
    p=data["bkt"]
    q=data["historico_suavizado"]
    lp=-y*np.log(p)-(1-y)*np.log1p(-p)
    lq=-y*np.log(q)-(1-y)*np.log1p(-q)
    for i,student in enumerate(data["student"]):
        grouped.setdefault(student,np.zeros(5))
        grouped[student]+=np.array([lp[i],lq[i],1.,(p[i]-y[i])**2,(q[i]-y[i])**2])
    matrix=np.array(list(grouped.values()))
    if not len(matrix):
        return {"status":"sem_observacoes","students":0,"events":0}
    rng=np.random.default_rng(seed)
    differences=[]
    brier=[]
    for _ in range(replicates):
        sample=matrix[rng.integers(0,len(matrix),size=len(matrix))].sum(axis=0)
        differences.append(float((sample[0]-sample[1])/sample[2]))
        brier.append(float((sample[3]-sample[4])/sample[2]))
    low,high=np.quantile(differences,[.025,.975])
    status="vantagem_BKT" if high<0 else "vantagem_historico" if low>0 else "inconclusivo"
    return {"status":status,"students":len(grouped),"events":len(y),"seed":seed,"replicates":replicates,
            "bkt_log_loss":float(lp.mean()),"history_log_loss":float(lq.mean()),
            "delta_log_loss":float((lp-lq).mean()),"ci95":[float(low),float(high)],
            "delta_brier":float(np.mean((p-y)**2-(q-y)**2)),
            "brier_ci95":[float(x) for x in np.quantile(brier,[.025,.975])],
            "unit":"student_with_all_events","bootstrap_logloss_differences":differences}


def main(work):
    private=work/"deterministic_alternative/private"
    if fingerprint(private)!=load(ROOT/"references/identidade_logica.json"):
        raise ValueError("Dados lógicos divergem.")
    cfg=load(ROOT/"config/experimento.json")["statistics"]
    data=aligned(private)
    original=load(ROOT/"references/avaliacao_final.json")
    for name,field in (("bkt","bkt"),("historico_suavizado","historico_suavizado")):
        y,p=data["y"],data[name]
        loss=float(np.mean(-y*np.log(p)-(1-y)*np.log1p(-p)))
        if abs(loss-original["micro"][field]["log_loss"])>1e-10:
            raise ValueError("Predições não reproduzem a avaliação original.")
    main_result=paired(data,cfg["replicates"],cfg["seed"])
    student_rate={}
    for student in dict.fromkeys(data["student"]):
        student_rate[student]=float(data["y"][data["student"]==student].mean())
    groups={}
    for name,predicate,offset in (("accuracy_le_0.1",lambda v:v<=.1,1),("accuracy_ge_0.9",lambda v:v>=.9,2)):
        mask=np.array([predicate(student_rate[u]) for u in data["student"]])
        groups[name]=paired({k:v[mask] for k,v in data.items()},cfg["replicates"],cfg["seed"]+offset)
    save(ROOT/"reports/comparacao_estatistica.json",{"utc":utc(),"analysis":"post_hoc_after_original_test",
         "protocol":"protocolo_missao04.json","overall":main_result,"extreme_groups":groups,
         "events_aligned_by":"event_id; same current response and past history",
         "new_model_selection_from_test":False})
    np.savez_compressed(work/"predicoes_comparacao.npz",**data)
    print("Pós-teste",main_result["events"],"eventos,",main_result["students"],"estudantes.")
    print("Delta",main_result["delta_log_loss"],"IC95",main_result["ci95"],main_result["status"])


if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("work",type=Path)
    main(p.parse_args().work.resolve())
