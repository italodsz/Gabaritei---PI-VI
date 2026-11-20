"""Constrained multi-start MLE on training sequences only."""
from collections import Counter
import warnings
import numpy as np
from scipy.optimize import minimize

from .common import PARAMETERS
from .likelihood import PackedSequences


def initializations(skill,seed,count):
    rng=np.random.default_rng(np.random.SeedSequence([seed,int(skill)]))
    starts=[np.array([.25,.1,.2,.1])]
    for _ in range(count-1):
        g,s=.98*rng.dirichlet([2,2,2])[:2]
        starts.append(np.array([rng.uniform(.01,.99),rng.uniform(.001,.8),g,s]))
    return starts


def feasible(p,cfg,tolerance=1e-8):
    x=np.asarray(p,dtype=float)
    return bool(x.shape==(4,) and np.all(np.isfinite(x)) and
                np.all(x>=cfg["lower_bound"]-tolerance) and np.all(x<=cfg["upper_bound"]+tolerance)
                and x[2]+x[3]<=cfg["max_guess_plus_slip"]+tolerance)


def fit(skill,sequences,cfg,seed=None,count=None,warm=None):
    packed=PackedSequences(sequences)
    seed=cfg["seed"] if seed is None else seed
    count=cfg["starts"] if count is None else count
    starts=initializations(skill,seed,count)
    if warm is not None:
        starts[0]=np.asarray(warm,dtype=float)
    runs=[]
    for i,start in enumerate(starts):
        history=[]
        def callback(x):
            history.append(packed.objective(x)[0])
        constraint={"type":"ineq","fun":lambda x:cfg["max_guess_plus_slip"]-x[2]-x[3],
                    "jac":lambda x:np.array([0.,0.,-1.,-1.])}
        with warnings.catch_warnings(record=True) as recorded:
            warnings.simplefilter("always")
            result=minimize(packed.objective,start,method="SLSQP",jac=True,
                    bounds=[(cfg["lower_bound"],cfg["upper_bound"])]*4,
                    constraints=[constraint],callback=callback,
                    options={"maxiter":cfg["max_iterations"],"ftol":cfg["ftol"]})
        loss,gradient=packed.objective(result.x)
        ok=bool(result.success and feasible(result.x,cfg) and np.isfinite(loss))
        runs.append({"initialization":i,"seed":seed,"start":start.tolist(),
                     "parameters":dict(zip(PARAMETERS,result.x.tolist())),
                     "mean_nll":loss,"log_likelihood":-loss*packed.events,
                     "iterations":int(result.nit),"evaluations":int(result.nfev),
                     "converged":ok,"scipy_success":bool(result.success),"status":int(result.status),
                     "message":str(result.message),"warnings":[str(w.message) for w in recorded],
                     "objective_history":history,"gradient":gradient.tolist()})
    valid=[r for r in runs if r["converged"]]
    if not valid:
        return None,runs
    best=min(valid,key=lambda r:(r["mean_nll"],r["initialization"]))
    near=[r for r in valid if r["mean_nll"]-best["mean_nll"]<=cfg["near_optimal_mean_nll"]]
    values=np.array([[r["parameters"][k] for k in PARAMETERS] for r in near])
    spread=np.ptp(values,axis=0)
    x=np.array([best["parameters"][k] for k in PARAMETERS])
    boundaries=[k for k,v in zip(PARAMETERS,x) if min(v-cfg["lower_bound"],cfg["upper_bound"]-v)<.005]
    if cfg["max_guess_plus_slip"]-x[2]-x[3]<.005:
        boundaries.append("G+S")
    diagnostic={"near_optimal_runs":len(near),"near_optimal_parameter_range":dict(zip(PARAMETERS,spread.tolist())),
                "initialization_sensitive":bool(np.any(spread>cfg["parameter_spread_warning"])),
                "boundary_parameters":boundaries,"converged_runs":len(valid),"attempted_runs":len(runs)}
    return {"skill_id":skill,"parameters":dict(best["parameters"]),"best_initialization":best["initialization"],
            "mean_nll":best["mean_nll"],"log_likelihood":best["log_likelihood"],
            "iterations":best["iterations"],"seed":seed,"converged":True,"diagnostics":diagnostic},runs
