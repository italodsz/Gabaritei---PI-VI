import argparse
from copy import deepcopy
import hashlib
import json
from pathlib import Path
from time import perf_counter

import numpy as np
import pandas as pd
from scipy.optimize import minimize, minimize_scalar
from sklearn.linear_model import SGDClassifier
from sklearn.metrics import log_loss

from experimento import replay, score


def eligible_events(path):
    columns = ["order_id", "user_id", "skill_id", "correct", "original", "answer_type"]
    raw = pd.read_csv(path, usecols=columns, encoding="latin1", low_memory=False)
    rows = raw.dropna(subset=columns)
    rows = rows[(rows.original == 1) & rows.correct.isin([0, 1])
                & (rows.answer_type != "open_response")
                & rows.skill_id.astype(str).str.fullmatch(r"\d+(?:\.0)?")]
    keys = ["user_id", "order_id"]
    conflicts = rows.groupby(keys)[["skill_id", "correct"]].transform("nunique").gt(1).any(axis=1)
    return rows.loc[~conflicts].sort_values("order_id", kind="stable").drop_duplicates(keys)


def partitions(rows):
    boundaries = np.quantile(rows.order_id.unique(), [.40, .52, .62, .74, .84], method="nearest")
    names = ["train", "update1", "gate1", "update2", "gate2", "test"]
    students = np.random.default_rng(42).permutation(sorted(rows.user_id.unique()))
    cohorts = np.array_split(students, len(names))
    block = np.searchsorted(boundaries, rows.order_id.to_numpy(), side="right")
    return {name: rows[(block == i) & rows.user_id.isin(cohorts[i])]
            for i, name in enumerate(names)}


def policy(candidate, incumbent):
    return (candidate["log_loss"] < incumbent["log_loss"]
            and candidate["brier"] <= incumbent["brier"]
            and candidate["auc"] >= incumbent["auc"] - .005)


def update_model(model, x, y, eta):
    candidate = deepcopy(model)
    candidate.set_params(eta0=eta)
    candidate.partial_fit(x, y)
    return candidate


def calibrate_intercept(model, x, y):
    logits = model.decision_function(x)
    fitted = minimize_scalar(lambda offset: np.mean(np.logaddexp(0, logits+offset)-y*(logits+offset)),
                             bounds=(-2, 2), method="bounded")
    model.intercept_ += fitted.x
    return model


def parameters(model):
    return np.r_[model.coef_.ravel(), model.intercept_]


def change(base, candidate, x):
    a, b = [model.predict_proba(x)[:, 1] for model in (base, candidate)]
    return {"before": parameters(base).tolist(), "after": parameters(candidate).tolist(),
            "l2": float(np.linalg.norm(parameters(base) - parameters(candidate))),
            "probability_mae": float(np.abs(a-b).mean()),
            "decisions_changed": int(((a >= .5) != (b >= .5)).sum()),
            "mean_probability_shift": float((b-a).mean())}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("csv", type=Path)
    parser.add_argument("dataset", type=Path)
    args = parser.parse_args()
    start = perf_counter()
    digest = hashlib.sha256(args.csv.read_bytes()).hexdigest()
    if digest != "162ef8d2d28bcbfea6591a282994062bd8d5eaa00636544292a0d268dca6e5da":
        raise ValueError("CSV divergente do auditado.")
    groups = partitions(eligible_events(args.csv))
    events = {k: list(v[["user_id", "skill_id", "correct"]].itertuples(index=False, name=None))
              for k, v in groups.items()}
    def objective(params):
        _, y, p = replay(events["train"], params)
        return log_loss(y, p)
    fit = minimize(objective, [.3,.1,.2,.1], bounds=[(.01,.99),(.001,.8),(.01,.49),(.01,.49)],
                   method="L-BFGS-B")
    if not fit.success:
        raise RuntimeError(fit.message)
    data = {k: replay(v, fit.x) for k, v in events.items()}
    x, y, _ = data["train"]
    models = {}
    for name, columns in {"sgd": [1, 2], "bkt_sgd": [0, 1, 2]}.items():
        baseline = SGDClassifier(loss="log_loss", alpha=.001, random_state=42,
                                 learning_rate="constant", eta0=.001, max_iter=30).fit(x[:, columns], y)
        incumbent = baseline
        incumbent_version = "baseline"
        records, evaluated = [], {}
        for i in (1, 2):
            xu, yu, _ = data[f"update{i}"]
            xg, yg, _ = data[f"gate{i}"]
            reference = score(yg, incumbent.predict_proba(xg[:, columns])[:, 1])
            candidates = []
            for eta in (.0002, .002, .02):
                candidate = update_model(incumbent, xu[:, columns], yu, eta)
                gate = score(yg, candidate.predict_proba(xg[:, columns])[:, 1])
                key = f"batch{i}_eta{eta}"
                candidates.append((key, candidate, gate))
                evaluated[key] = candidate
                records.append({"version": key, "parent": incumbent_version, "gate": gate,
                                "incumbent_gate": reference, "passes_gate": policy(gate, reference),
                                "parameter_change": change(incumbent, candidate, xg[:, columns])})
            order = groups[f"update{i}"].order_id.to_numpy()
            cutoff = np.searchsorted(order, order[int(.8*len(order))])
            candidate = update_model(incumbent, xu[:cutoff, columns], yu[:cutoff], .002)
            candidate = calibrate_intercept(candidate, xu[cutoff:, columns], yu[cutoff:])
            gate = score(yg, candidate.predict_proba(xg[:, columns])[:, 1])
            key = f"batch{i}_calibrated"
            candidates.append((key, candidate, gate))
            evaluated[key] = candidate
            records.append({"version": key, "parent": incumbent_version, "gate": gate,
                            "incumbent_gate": reference, "passes_gate": policy(gate, reference),
                            "parameter_change": change(incumbent, candidate, xg[:, columns])})
            accepted = [c for c in candidates if policy(c[2], reference)]
            if accepted:
                incumbent_version, incumbent, _ = min(accepted, key=lambda c: c[2]["log_loss"])
            for record in records[-len(candidates):]:
                record["promoted"] = bool(accepted and record["version"] == incumbent_version)
        xt, yt, _ = data["test"]
        models[name] = {"gate_records": records, "selected": incumbent_version,
                        "test": {k: score(yt, m.predict_proba(xt[:, columns])[:, 1])
                                 for k, m in {"baseline":baseline, "selected":incumbent, **evaluated}.items()},
                        "selected_test_change": change(baseline, incumbent, xt[:, columns])}
        if name == "bkt_sgd":
            hybrid = baseline
    xt, yt, pb = data["test"]
    result = {"source_sha256": digest, "params_bkt": fit.x.tolist(), "models": models,
              "groups": {k: {"events":len(v), "students":int(v.user_id.nunique()),
                             "first_order":int(v.order_id.min()),"last_order":int(v.order_id.max()),
                             "positive_rate":float(v.correct.mean())} for k,v in groups.items()},
              "constant": score(yt, np.full(len(yt),y.mean())), "bkt": score(yt,pb)}
    from integracao import demonstrate
    result["integration_synthetic"] = demonstrate(args.dataset, hybrid, fit.x)
    result["seconds_total"] = perf_counter()-start
    Path(__file__).with_name("fechamento.json").write_text(json.dumps(result,indent=2),encoding="utf8")
    print(json.dumps(result,indent=2))


if __name__ == "__main__":
    main()
