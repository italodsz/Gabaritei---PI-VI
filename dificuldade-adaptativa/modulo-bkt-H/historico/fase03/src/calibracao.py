"""Global logistic calibration fitted on validation, selected by student cross-fitting."""
from hashlib import sha256
import numpy as np
from scipy.optimize import minimize
from scipy.special import expit

from .metricas import Scores


def fit_logistic(y,probabilities):
    y = np.asarray(y,dtype=float)
    p = np.clip(probabilities,1e-12,1-1e-12)
    x = np.log(p)-np.log1p(-p)
    def fun(ab):
        z = ab[0]*x+ab[1]
        prob = expit(z)
        return float(np.mean(np.logaddexp(0,z)-y*z)),np.array([np.mean((prob-y)*x),np.mean(prob-y)])
    fit = minimize(fun,[1.,0.],jac=True,method="L-BFGS-B",bounds=[(.05,5.),(-5.,5.)],
                   options={"maxiter":500,"ftol":1e-12,"gtol":1e-8})
    if not fit.success:
        raise RuntimeError("Falha no calibrador logístico.")
    return {"a":float(fit.x[0]),"b":float(fit.x[1]),"converged":True,"loss":float(fit.fun)}


def apply(probabilities,params):
    p = np.clip(probabilities,1e-12,1-1e-12)
    return expit(params["a"]*(np.log(p)-np.log1p(-p))+params["b"])


def calibrate(data,records,cfg):
    # Student folds derive from first event order, independently of pseudonym and response labels.
    first = {}
    for r in records:
        first[r["student_id"]] = min(first.get(r["student_id"],r["event_order"][0]),r["event_order"][0])
    fold = {u:int.from_bytes(sha256(f"{cfg['seed']}:{n}".encode()).digest()[:8],"big")%cfg["calibration_folds"]
            for u,n in first.items()}
    codes = np.array([fold[u] for u in data["student"]])
    cross = np.empty(len(data["y"]))
    fits = []
    for k in range(cfg["calibration_folds"]):
        train,hold = codes!=k,codes==k
        fitted = fit_logistic(data["y"][train],data["bkt"][train])
        cross[hold] = apply(data["bkt"][hold],fitted)
        fits.append({"fold":k,"training_events":int(train.sum()),"heldout_events":int(hold.sum()),**fitted})
    raw = Scores(data["y"],data["bkt"]).compute()
    cv = Scores(data["y"],cross).compute()
    chosen = (raw["log_loss"]-cv["log_loss"]>=cfg["calibration_min_crossfit_logloss_gain"] and
              cv["brier"]<=raw["brier"]+cfg["calibration_max_brier_increase"] and
              (not cfg["calibration_require_ece_improvement"] or cv["ece"]<=raw["ece"]))
    final = fit_logistic(data["y"],data["bkt"])
    return {"source_split":"validacao","selection":"crossfit_cinco_folds_por_estudante",
            "folds":fits,"original_metrics":raw,"crossfit_metrics":cv,"full_validation_parameters":final,
            "selected":bool(chosen),"choice":"logistica" if chosen else "identidade",
            "warning":"desempenho do calibrador completo na validação é ajuste; crossfit é o critério de seleção",
            "thresholds":{k:v for k,v in cfg.items() if k.startswith("calibration_")}}
