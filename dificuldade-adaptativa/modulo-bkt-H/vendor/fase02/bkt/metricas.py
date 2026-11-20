"""Binary probability metrics and fixed-bin calibration."""
import numpy as np
from scipy.stats import rankdata


def metrics(y,p):
    y=np.asarray(y,dtype=float)
    p=np.asarray(p,dtype=float)
    if y.ndim!=1 or y.shape!=p.shape or len(y)==0 or not np.all(np.isin(y,[0,1])) or not np.all(np.isfinite(p)) or np.any((p<0)|(p>1)):
        raise ValueError("Observações ou probabilidades inválidas.")
    q=np.clip(p,1e-15,1-1e-15)
    positive=int(y.sum())
    negative=len(y)-positive
    auc=(float((rankdata(p)[y==1].sum()-positive*(positive+1)/2)/(positive*negative))
         if positive and negative else None)
    bins=np.minimum((p*10).astype(int),9)
    calibration=[]
    for b in range(10):
        select=bins==b
        count=int(select.sum())
        calibration.append({"bin":b,"lower":b/10,"upper":(b+1)/10,"n":count,
                  "predicted":float(p[select].mean()) if count else None,
                  "observed":float(y[select].mean()) if count else None})
    return {"n":len(y),"positive":positive,"negative":negative,
            "log_loss":float(-np.mean(y*np.log(q)+(1-y)*np.log1p(-q))),
            "brier":float(np.mean((p-y)**2)),"auc_roc":auc,
            "accuracy_threshold_0_5":float(np.mean((p>=.5)==y)),
            "ece_10_bins":sum(r["n"]*abs(r["predicted"]-r["observed"]) for r in calibration if r["n"])/len(y),
            "calibration":calibration}
