"""Validation replay of suggestion behaviour with two policies and identical outcomes."""
import argparse
from collections import Counter
import itertools
from pathlib import Path
import numpy as np

from bkt04.common import ROOT,load,save,rows
from bkt04.inferencia import step
from bkt04.politica import suggest


def replay(sequences,models,cfg,kind):
    result=Counter()
    reasons=Counter()
    details=[]
    for seq in sequences:
        p=models[seq["skill_id"]]["parameters"]
        m=p["L0"]
        hits=0
        last=None
        previous=None
        previous_direction=0
        n_changes=0
        n_reversals=0
        offered=[]
        for i,y in enumerate(seq["correct_first"],1):
            m=step(m,y,p)["mastery_updated"]
            hits+=y
            value=m if kind=="bkt" else (hits+1)/(i+2)
            decision=suggest(value,i,"media",{"facil":1,"media":1,"dificil":1},cfg,last,i)
            result["events"]+=1
            result["response_opportunities"]+=i>=cfg["minimum_observations"]
            reasons[decision["reason"]]+=1
            target=decision["suggested"]
            if target:
                result["offers"]+=1
                last=i
                direction=-1 if target=="facil" else 1
                if previous is not None and target!=previous:
                    n_changes+=1
                if previous_direction and previous_direction!=direction:
                    n_reversals+=1
                previous_direction=direction
                previous=target
                offered.append({"position":i,"suggested":target,"reason":decision["reason"]})
            if decision["choice"]!="media":
                raise AssertionError("Preferência alterada sem aceite.")
        result["suggestion_changes"]+=n_changes
        result["reversals"]+=n_reversals
        details.append({"first_event_id":seq["event_ids"][0],"skill":seq["skill_id"],
                        "length":seq["length"],"policy":kind,"decisions":offered})
    n=max(1,result["events"])
    return {**dict(result),"coverage":result["response_opportunities"]/n,
            "change_rate":result["suggestion_changes"]/n,"reversal_rate":result["reversals"]/n,
            "offer_rate":result["offers"]/n,"reason_counts":dict(reasons),
            "unauthorized_choice_changes":0},details


def main(work):
    cfg=load(ROOT/"config/experimento.json")["policies"]
    eligibility=load(ROOT/"models/elegibilidade_integracao.json")["skills"]
    models=load(ROOT/"models/parametros_originais.json")["skills"]
    sequences=sorted((r for r in rows(work/"deterministic_alternative/private/sequencias_validacao.jsonl")
                     if eligibility.get(r["skill_id"],{}).get("eligible_for_experimental_difficulty")),
                     key=lambda r:(int(r["skill_id"]),r["event_order"][0]))
    trials=[]
    details={}
    for thresholds,minimum,cooldown in itertools.product(cfg["threshold_pairs"],cfg["minimum_observations"],cfg["cooldowns"]):
        choice={"thresholds":thresholds,"minimum_observations":minimum,"cooldown":cooldown,"margin":cfg["margin"]}
        metrics={}
        for method in ("historico_suavizado","bkt"):
            metrics[method],trace=replay(sequences,models,choice,method)
            details[str((thresholds,minimum,cooldown,method))]=trace
        coverage=min(r["coverage"] for r in metrics.values())
        trials.append({"config":choice,"metrics":metrics,"selectable":coverage>=.5,
                       "rank":[sum(r["reversal_rate"] for r in metrics.values()),
                               sum(r["change_rate"] for r in metrics.values()),minimum,cooldown,thresholds]})
    feasible=[r for r in trials if r["selectable"]]
    if not feasible:
        selected=None
    else:
        selected=min(feasible,key=lambda r:r["rank"])
    save(ROOT/"reports/politicas_validacao.json",{"source_split":"validacao","sequences":len(sequences),
         "skills":len({r["skill_id"] for r in sequences}),"trials":trials,"selected":selected,
         "observed_responses_to_recommended_levels":False,"inventory":"três faixas assumidas disponíveis no replay",
         "interpretation":"frequência e estabilidade de sugestões; qualidade pedagógica indeterminada"})
    save(work/"trilhas_politicas_validacao.json",details)
    if selected:
        save(ROOT/"models/politica_selecionada.json",{"selection_split":"validacao",**selected["config"],
              "version":"m4_policy_1","auto_accept":False})
        print("Política selecionada na validação:",selected["config"])
        print(selected["metrics"])
    else:
        save(ROOT/"models/politica_selecionada.json",{"selection_split":"validacao","enabled":False,"reason":"nenhuma_configuracao_com_cobertura_minima"})
        print("Seleção inconclusiva: cobertura insuficiente.")


if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("work",type=Path)
    main(p.parse_args().work.resolve())
