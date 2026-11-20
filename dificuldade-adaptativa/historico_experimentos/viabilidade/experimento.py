import argparse
from collections import defaultdict
import hashlib
import json
from pathlib import Path
import time

import numpy as np
import pandas as pd
from scipy.optimize import minimize
from sklearn.linear_model import SGDClassifier
from sklearn.metrics import accuracy_score, brier_score_loss, f1_score, log_loss, roc_auc_score


def step(state, correct, params):
    _, learn, guess, slip = params
    p = state * (1-slip) + (1-state) * guess
    posterior = state * ((1-slip) if correct else slip) / (p if correct else 1-p)
    return p, posterior + (1-posterior)*learn


def replay(events, params):
    state = defaultdict(lambda: params[0])
    counts = defaultdict(lambda: [0, 0])
    x, y, p = [], [], []
    for student, skill, correct in events:
        key = student, skill
        total, hits = counts[key]
        prior, state[key] = step(state[key], correct, params)
        x.append([prior, np.log1p(total), (hits+1)/(total+2)])
        y.append(correct)
        p.append(prior)
        counts[key] = [total+1, hits+correct]
    return np.asarray(x), np.asarray(y), np.asarray(p)


def score(y, p):
    bins = np.minimum((p*10).astype(int), 9)
    calibration = [{"n": int(mask.sum()), "predicted": float(p[mask].mean()), "observed": float(y[mask].mean())}
                   for b in range(10) if (mask := bins == b).any()]
    return {"auc": roc_auc_score(y,p), "accuracy": accuracy_score(y,p >= .5),
            "f1": f1_score(y,p >= .5), "log_loss": log_loss(y,p), "brier": brier_score_loss(y,p),
            "ece": sum(b["n"]*abs(b["predicted"]-b["observed"]) for b in calibration)/len(y),
            "calibration": calibration}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("csv", type=Path)
    args = parser.parse_args()
    cols = ["order_id","user_id","skill_id","correct","original","answer_type"]
    raw = pd.read_csv(args.csv, usecols=cols, encoding="latin1", low_memory=False)
    eligible = raw.dropna(subset=cols)
    eligible = eligible[(eligible.original == 1) & eligible.correct.isin([0,1])
                        & (eligible.answer_type != "open_response")
                        & eligible.skill_id.astype(str).str.fullmatch(r"\d+(?:\.0)?")]
    eligible = eligible.sort_values("order_id", kind="stable").drop_duplicates(["user_id","order_id"])
    rng = np.random.default_rng(42)
    students = rng.permutation(sorted(eligible.user_id.unique()))
    groups = [students[:500], students[500:650], students[650:850]]
    frames = [eligible[eligible.user_id.isin(g)] for g in groups]
    events = [list(f[["user_id","skill_id","correct"]].itertuples(index=False,name=None)) for f in frames]
    start = time.perf_counter()
    def objective(params):
        _, y, p = replay(events[0], params)
        return log_loss(y,p,labels=[0,1])
    fit = minimize(objective, [.3,.1,.2,.1], bounds=[(.01,.99),(.001,.8),(.01,.49),(.01,.49)],
                   method="L-BFGS-B", options={"maxiter":60})
    if not fit.success:
        raise RuntimeError(fit.message)
    bkt_seconds = time.perf_counter()-start
    x, y, _ = replay(events[0], fit.x)
    xa, ya, _ = replay(events[1], fit.x)
    xt, yt, pb = replay(events[2], fit.x)
    start = time.perf_counter()
    model = SGDClassifier(loss="log_loss", alpha=.001, random_state=42, max_iter=30, tol=1e-4)
    model.fit(x,y)
    fit_seconds = time.perf_counter()-start
    start = time.perf_counter()
    frozen = model.predict_proba(xt)[:,1]
    frozen_seconds = time.perf_counter()-start
    before = np.r_[model.coef_.ravel(),model.intercept_].copy()
    start = time.perf_counter()
    model.partial_fit(xa,ya)
    update_seconds = time.perf_counter()-start
    updated = model.predict_proba(xt)[:,1]
    after = np.r_[model.coef_.ravel(),model.intercept_]
    result = {"sha256": hashlib.sha256(args.csv.read_bytes()).hexdigest(),
              "raw_rows": len(raw), "raw_students": int(raw.user_id.nunique()),
              "eligible_rows": len(eligible),
              "groups": [{"students": len(g),"events": len(e),"positive_rate": float(f.correct.mean())}
                         for g,e,f in zip(groups,events,frames)],
              "bkt_parameters": dict(zip(("initial","learn","guess","slip"),fit.x)),
              "seconds": {"bkt_fit": bkt_seconds,"sgd_fit": fit_seconds,"sgd_update": update_seconds,
                          "sgd_frozen_inference_all": frozen_seconds},
              "update": {"before": before.tolist(),"after":after.tolist(),
                         "parameter_l2": float(np.linalg.norm(after-before)),
                         "mean_abs_prediction_change":float(np.abs(updated-frozen).mean()),
                         "threshold_changes": int(((updated>=.5)!=(frozen>=.5)).sum())},
              "metrics": {name: score(yt,p) for name,p in
                          {"constant":np.full(len(yt),y.mean()),"bkt":pb,"sgd_frozen":frozen,
                           "sgd_updated":updated}.items()}}
    assert result["update"]["parameter_l2"] > 0
    Path(__file__).with_name("resultados.json").write_text(json.dumps(result,indent=2),encoding="utf8")
    print(json.dumps(result,indent=2))


if __name__ == "__main__":
    main()
