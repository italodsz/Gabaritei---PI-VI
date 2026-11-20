import hashlib
import json
from pathlib import Path

import numpy as np
from scipy.special import expit, logit

from experimento import replay


def tri_feature(value):
    return float(np.tanh(value / 2))


def rank(items, history, preference, model, params):
    output = []
    for item in items:
        if item["difficulty"] != preference:
            continue
        skill = item["skill_key"]
        # The placeholder is used solely to obtain features before an answer.
        x, _, _ = replay([*history, ("demo", skill, 0)], params)
        base = float(model.predict_proba(x[-1:])[0, 1])
        adjustment = tri_feature(item["tri_b"]) if item["tri_b"] is not None else 0
        p = float(expit(logit(np.clip(base, 1e-6, 1-1e-6)) - adjustment))
        output.append({**item, "probability_demo": p, "adequacy": 1-abs(p-.70)})
    return sorted(output, key=lambda row: (-row["adequacy"], row["question_id"]))


def demonstrate(base, model, params):
    catalog = base / "data/questions.jsonl"
    digest = hashlib.sha256(catalog.read_bytes()).hexdigest()
    if digest != "22d83ac5d269976b647d34cb8aa66ccbebec6c21b0773487926eb294ee69fbd5":
        raise ValueError("Catálogo ENEM divergente.")
    eligible = json.loads((base / "ids_elegiveis.json").read_bytes())["train"]
    ids = set(eligible)
    rows = [r for line in catalog.read_bytes().splitlines()
            if (r := json.loads(line))["id"] in ids]
    difficulty = lambda b: "facil" if b <= .80054 else "media" if b <= 1.56301 else "dificil"
    items = []
    for level in ("facil","media","dificil"):
        candidates = [r for r in rows if r["area"] == "MT" and r["tri"]["a"] >= .25
                      and difficulty(r["tri"]["b"]) == level]
        for r in candidates[:2]:
            items.append({"question_id":r["id"], "area":"MT", "skill_key":"area:MT",
                          "catalog_skill":r.get("skill"), "difficulty":level, "tri_b":r["tri"]["b"]})
    output = {}
    for label, responses in {"perfil_a":[1,1,1,1], "perfil_b":[0,0,0,0]}.items():
        history = [("demo","area:MT",y) for y in responses]
        output[label] = {
            "synthetic_history": responses,
            "by_preference": {level:rank(items,history,level,model,params) for level in ("facil","media","dificil")},
            "medium_after_new_correct":rank(items,[*history,("demo","area:MT",1)],"media",model,params),
        }
    return {"synthetic_only":True, "catalog_sha256":digest, "profiles":output,
            "tri_adjustment":"Illustrative fixed logit offset, not trained or validated for ENEM"}
