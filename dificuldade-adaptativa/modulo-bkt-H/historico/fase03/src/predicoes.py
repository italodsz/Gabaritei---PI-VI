"""Shared prospective predictions for frozen models and predefined baselines."""
from collections import Counter
import numpy as np

from .common import model
from .matematica import infer


def predict(records):
    models = model()["skills"]
    total_correct = sum(e["correct_count"] for e in models.values())
    total_events = sum(e["training_events"] for e in models.values())
    global_mean = (total_correct+1)/(total_events+2)
    output = {name:[] for name in ("y","bkt","taxa_habilidade","taxa_global","historico_suavizado",
                                  "student","skill","position","length","event_id")}
    for row in records:
        skill = row["skill_id"]
        entry = models[skill]
        prior = (entry["correct_count"]+1)/(entry["training_events"]+2)
        _,trace = infer(row["correct_first"],entry["parameters"])
        hits = 0
        for i,(y,step) in enumerate(zip(row["correct_first"],trace,strict=True)):
            output["y"].append(y)
            output["bkt"].append(step["predicted"])
            output["taxa_habilidade"].append(prior)
            output["taxa_global"].append(global_mean)
            output["historico_suavizado"].append((hits+2*prior)/(i+2))
            output["student"].append(row["student_id"])
            output["skill"].append(skill)
            output["position"].append(i+1)
            output["length"].append(row["length"])
            output["event_id"].append(row["event_ids"][i])
            hits += y
    return {k:np.array(v) for k,v in output.items()}
