"""Frozen final evaluation. Training and model selection are unavailable in this module."""
from collections import Counter
import json
from pathlib import Path

import numpy as np

from .common import ROOT,load,save,sha,rows,log_access,model
from .protocolo import verify
from .predicoes import predict
from .metricas import Scores,paired_bootstrap
from .calibracao import apply


def aggregate(data,methods,mask=None):
    if mask is None:
        mask = np.ones(len(data["y"]),dtype=bool)
    if not mask.any():
        return {"events":0,"students":0,"metrics":None}
    return {"events":int(mask.sum()),"students":len(set(data["student"][mask])),
            "metrics":{name:Scores(data["y"][mask],data[name][mask]).compute() for name in methods}}


def classify(support,metrics,ci,stability,cfg):
    diff = ci["paired_difference"]["bkt"]
    dl = diff["log_loss"]
    db = diff["brier"]
    flags = []
    if dl["low"]>0 and db["low"]>0:
        return "D",["inferioridade_nos_dois_intervalos"]
    if support["students"]<cfg["skill_min_students"] or support["events"]<cfg["skill_min_events"]:
        flags.append("suporte_teste_limitado")
    if dl["high"]>=0:
        flags.append("ganho_logloss_inconclusivo")
    if metrics["bkt"]["brier"]>metrics["taxa_habilidade"]["brier"]:
        flags.append("brier_pontualmente_pior")
    if stability["predictive_width_median"]>cfg["probability_width_severe"]:
        flags.append("incerteza_preditiva_alta")
    if flags:
        return "C",flags
    if stability["parameter_wide"]:
        flags.append("intervalo_parametro_amplo")
    if stability["initialization"]["boundary_parameters"]:
        flags.append("parametro_fronteira")
    if stability["predictive_width_median"]>cfg["probability_width_moderate"]:
        flags.append("incerteza_preditiva_moderada")
    if metrics["bkt"]["ece"]>cfg["skill_ece_warning"]:
        flags.append("ece_habilidade_alta")
    return ("B" if flags else "A"),flags


def final_evaluation(private,local):
    p = verify()
    gate = load(ROOT/"reports/gate_entrada.json")
    for name,h in p["test_sha256"].items():
        if sha(private/name)!=h:
            raise ValueError("Teste alterado.")
    local.mkdir(parents=True,exist_ok=True)
    log_access("test_outcomes_open","sequencias_teste.jsonl",
               protocol_sha256=sha(ROOT/"reports/protocolo_pre_teste.json"),
               model_sha256=sha(ROOT/"models/parametros_por_habilidade.json"))
    selected = set(model()["skills"])
    records = sorted((r for r in rows(private/"sequencias_teste.jsonl") if r["skill_id"] in selected),
                     key=lambda r:(int(r["skill_id"]),r["event_order"][0]))
    data = predict(records)
    methods = p["methods"]
    if "bkt_calibrado" in methods:
        data["bkt_calibrado"] = apply(data["bkt"],load(ROOT/"models/calibracao.json")["full_validation_parameters"])
    training_items = {r["item_id"] for r in rows(private/"eventos_treino.jsonl")}
    log_access("test_event_metadata_open","eventos_teste.jsonl",
               protocol_sha256=sha(ROOT/"reports/protocolo_pre_teste.json"))
    source_events = {r["event_id"]:r for r in rows(private/"eventos_teste.jsonl") if r["skill_id"] in selected}
    assert len(source_events)==len(data["y"])
    items = np.array([source_events[e]["item_id"] for e in data["event_id"]])
    orders = np.array([source_events[e]["event_order"] for e in data["event_id"]])
    repeats = np.zeros(len(items),dtype=bool)
    seen = set()
    for i in np.argsort(orders,kind="stable"):
        key = data["student"][i],items[i]
        repeats[i] = key in seen
        seen.add(key)
    is_seen = np.array([item in training_items for item in items])
    data["seen_item"] = is_seen
    data["repeat_exposure"] = repeats
    data["item"] = items
    np.savez_compressed(local/"predicoes_teste.npz",**data)
    cfg = p["definitions"]
    micro = aggregate(data,methods)
    confidence = paired_bootstrap(data["y"],{n:data[n] for n in methods},data["student"],cfg["main_bootstrap"],cfg["seed"])
    stability = load(ROOT/"reports/estabilidade_parametros.json")
    by_skill = {}
    for skill in sorted(selected,key=int):
        mask = data["skill"]==skill
        if not mask.any():
            raise ValueError("Habilidade congelada ausente do teste.")
        result = aggregate(data,methods,mask)
        skill_ci = paired_bootstrap(data["y"][mask],{n:data[n][mask] for n in methods},data["student"][mask],
                                   cfg["skill_bootstrap"],cfg["seed"]+int(skill))
        category,flags = classify(result,result["metrics"],skill_ci,stability[skill],cfg)
        by_skill[skill] = {**result,"sequences":sum(r["skill_id"]==skill for r in records),
                          "confidence":skill_ci,"classification":category,"limitations":flags}
        print("Habilidade",skill,"categoria",category,"eventos",result["events"],flush=True)
    macro = {name:{metric:float(np.mean([r["metrics"][name][metric] for r in by_skill.values()
                                       if r["metrics"][name][metric] is not None]))
                   for metric in ("log_loss","brier","auc_roc","accuracy","ece")} for name in methods}
    position,length = data["position"],data["length"]
    counts = Counter(data["student"])
    hits = Counter()
    for u,y in zip(data["student"],data["y"]):
        hits[u] += int(y)
    rate = {u:hits[u]/n for u,n in counts.items()}
    skill_models = model()["skills"]
    subgroup_masks = {
       "position_1":position==1,"position_2_4":(position>=2)&(position<=4),
       "position_5_9":(position>=5)&(position<=9),"position_10_plus":position>=10,
       "length_1":length==1,"length_2_4":(length>=2)&(length<=4),
       "length_5_9":(length>=5)&(length<=9),"length_10_plus":length>=10,
       "training_events_below_1000":np.array([skill_models[s]["training_events"]<cfg["skill_low_training_support"] for s in data["skill"]]),
       "wide_parameters":np.array([stability[s]["parameter_wide"] for s in data["skill"]]),
       "boundary_parameters":np.array([bool(stability[s]["initialization"]["boundary_parameters"]) for s in data["skill"]]),
       "student_accuracy_below_0.1":np.array([rate[u]<=.1 for u in data["student"]]),
       "student_accuracy_above_0.9":np.array([rate[u]>=.9 for u in data["student"]]),
       "unseen_items":~is_seen,"seen_items":is_seen,"repeat_exposure":repeats,"first_exposure":~repeats}
    assert set(subgroup_masks)==set(cfg["subgroups"])
    subgroups = {k:aggregate(data,methods,v) for k,v in subgroup_masks.items()}
    result = {"split":"teste","protocol_sha256":sha(ROOT/"reports/protocolo_pre_teste.json"),
              "model_sha256":sha(ROOT/"models/parametros_por_habilidade.json"),
              "events":len(data["y"]),"students":len(set(data["student"])),"sequences":len(records),
              "evaluated_skills":len(by_skill),"methods":methods,"micro":micro["metrics"],"macro":macro,
              "confidence":confidence,"skills":by_skill,"subgroups":subgroups,
              "classification_counts":dict(Counter(r["classification"] for r in by_skill.values())),
              "item_overlap":{"training_items":len(training_items),"selected_test_items":len(set(items)),
                              "shared_items":len(set(items)&training_items),"unseen_items":len(set(items)-training_items)},
              "private_predictions_sha256":sha(local/"predicoes_teste.npz"),
              "warning":"categorias e ICs por habilidade são descritivos, com comparações marginais"}
    save(ROOT/"reports/avaliacao_final.json",result)
    log_access("test_evaluation_completed","reports/avaliacao_final.json",sha256=sha(ROOT/"reports/avaliacao_final.json"))
    print("Avaliação final",result["events"],result["students"],result["classification_counts"])
    return result
