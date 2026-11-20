"""Numerically stable BKT inference, independent of storage and policy."""
import math


def validate_parameters(p):
    if set(p)!={"L0","T","G","S"}:
        raise ValueError("Modelo deve conter L0,T,G,S.")
    if any(isinstance(x,bool) or not isinstance(x,(int,float)) or not math.isfinite(x) or not 1e-4<=x<=.9999 for x in p.values()):
        raise ValueError("Parâmetros inválidos.")
    if p["G"]+p["S"]>.99+1e-10:
        raise ValueError("G+S excede a restrição.")
    return p


def step(m,y,p):
    validate_parameters(p)
    if isinstance(m,bool) or not isinstance(m,(int,float)) or not math.isfinite(m) or not 0<=m<=1:
        raise ValueError("Domínio inválido.")
    if type(y) is not int or y not in (0,1):
        raise ValueError("Resposta inválida.")
    predicted=m*(1-p["S"])+(1-m)*p["G"]
    weighted_master=m*((1-p["S"]) if y else p["S"])
    weighted_other=(1-m)*(p["G"] if y else 1-p["G"])
    posterior=weighted_master/(weighted_master+weighted_other)
    updated=posterior+(1-posterior)*p["T"]
    return {"mastery_before":m,"predicted_correct":predicted,"mastery_posterior":posterior,"mastery_updated":updated}


def trace(outcomes,p):
    m=p["L0"]
    result=[]
    for y in outcomes:
        r=step(m,y,p)
        result.append(r)
        m=r["mastery_updated"]
    return result
