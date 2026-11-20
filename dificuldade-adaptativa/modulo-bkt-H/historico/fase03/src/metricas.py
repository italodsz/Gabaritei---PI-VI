"""Weighted binary metrics supporting clustered bootstrap without refitting."""
import numpy as np


class Scores:
    def __init__(self,y,p):
        self.y = np.asarray(y,dtype=float)
        self.p = np.asarray(p,dtype=float)
        if self.y.ndim!=1 or self.y.shape!=self.p.shape or not len(self.y):
            raise ValueError("Vetores vazios ou desalinhados.")
        if not np.all(np.isin(self.y,[0,1])) or not np.all(np.isfinite(self.p)) or np.any((self.p<0)|(self.p>1)):
            raise ValueError("Rótulo ou probabilidade inválida.")
        clipped = np.clip(self.p,1e-15,1-1e-15)
        self.loss = -self.y*np.log(clipped)-(1-self.y)*np.log1p(-clipped)
        self.brier = (self.p-self.y)**2
        self.correct = ((self.p>=.5)==self.y).astype(float)
        self.bins = np.minimum((self.p*10).astype(int),9)
        auc_scores = np.round(self.p,10)
        self.order = np.argsort(auc_scores,kind="stable")
        self.ties = np.r_[0,np.flatnonzero(np.diff(auc_scores[self.order]))+1]

    def compute(self,weights=None):
        w = np.ones(len(self.y)) if weights is None else np.asarray(weights,dtype=float)
        if w.shape!=self.y.shape or np.any(w<0) or not np.all(np.isfinite(w)) or w.sum()<=0:
            raise ValueError("Pesos inválidos.")
        n = float(w.sum())
        positives = float(w@self.y)
        negatives = n-positives
        pos_ties = np.add.reduceat((w*self.y)[self.order],self.ties)
        neg_ties = np.add.reduceat((w*(1-self.y))[self.order],self.ties)
        auc = float(pos_ties@(np.cumsum(neg_ties)-.5*neg_ties)/(positives*negatives)) if positives and negatives else None
        counts = np.bincount(self.bins,weights=w,minlength=10)
        predicted = np.bincount(self.bins,weights=w*self.p,minlength=10)
        observed = np.bincount(self.bins,weights=w*self.y,minlength=10)
        calibration = [{"bin":i,"n":float(counts[i]),
                        "predicted":float(predicted[i]/counts[i]) if counts[i] else None,
                        "observed":float(observed[i]/counts[i]) if counts[i] else None}
                       for i in range(10)]
        return {"n":int(n),"positives":int(positives),"negatives":int(negatives),
                "log_loss":float(w@self.loss/n),"brier":float(w@self.brier/n),"auc_roc":auc,
                "accuracy":float(w@self.correct/n),"ece":float(np.abs(predicted-observed).sum()/n),
                "calibration":calibration}


def factorize(values):
    lookup = {}
    return np.array([lookup.setdefault(x,len(lookup)) for x in values],dtype=np.int64)


def paired_bootstrap(y,predictions,student,replicates,seed):
    groups = factorize(student)
    nstudents = int(groups.max()+1)
    engines = {name:Scores(y,p) for name,p in predictions.items()}
    metrics = ("log_loss","brier","auc_roc","accuracy","ece")
    samples = {name:{k:[] for k in metrics} for name in engines}
    diffs = {name:{k:[] for k in ("log_loss","brier")} for name in engines if name!="taxa_habilidade"}
    rng = np.random.default_rng(seed)
    for _ in range(replicates):
        draws = rng.integers(0,nstudents,size=nstudents)
        counts = np.bincount(draws,minlength=nstudents)
        weights = counts[groups]
        values = {name:engine.compute(weights) for name,engine in engines.items()}
        for name,r in values.items():
            for k in metrics:
                if r[k] is not None:
                    samples[name][k].append(r[k])
        for name in diffs:
            for k in diffs[name]:
                diffs[name][k].append(values[name][k]-values["taxa_habilidade"][k])
    def intervals(sample):
        return {k:{"low":float(np.quantile(v,.025)) if v else None,
                   "high":float(np.quantile(v,.975)) if v else None,"valid_replicates":len(v)}
                for k,v in sample.items()}
    return {"unit":"estudante","replicates":replicates,"seed":seed,
            "interval_method":"percentile_2.5_97.5_numpy_linear",
            "metrics":{name:intervals(r) for name,r in samples.items()},
            "paired_difference":{name:intervals(r) for name,r in diffs.items()}}
