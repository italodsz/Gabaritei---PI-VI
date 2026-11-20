"""Prospective BKT inference using fixed trained parameters."""
import json
import math
from numbers import Real

from .common import PARAMETERS


def probability(value,name):
    if isinstance(value,bool) or not isinstance(value,Real) or not math.isfinite(value) or not 0<=value<=1:
        raise ValueError(f"{name} exige probabilidade finita no intervalo [0,1].")
    return float(value)


def validate_parameters(parameters):
    try:
        p={name:probability(parameters[name],name) for name in PARAMETERS}
    except (KeyError,TypeError) as error:
        raise ValueError("Parâmetros incompletos.") from error
    if any(not 1e-4<=v<=1-1e-4 for v in p.values()) or p["G"]+p["S"]>0.99+1e-10:
        raise ValueError("Parâmetros fora das restrições do modelo.")
    return p


def predict_correctness(current_mastery,trained_parameters):
    m=probability(current_mastery,"domínio")
    p=validate_parameters(trained_parameters)
    return m*(1-p["S"])+(1-m)*p["G"]


def update_mastery(current_mastery,observed_correctness,trained_parameters):
    m=probability(current_mastery,"domínio")
    if type(observed_correctness) is not int or observed_correctness not in (0,1):
        raise ValueError("A observação deve ser o inteiro 0 ou 1.")
    p=validate_parameters(trained_parameters)
    emission=1-p["S"] if observed_correctness else p["S"]
    other=p["G"] if observed_correctness else 1-p["G"]
    mastered=m*emission
    likelihood=mastered+(1-m)*other
    posterior=mastered/likelihood
    return posterior+(1-posterior)*p["T"]


def trace(observations,trained_parameters):
    p=validate_parameters(trained_parameters)
    mastery=p["L0"]
    rows=[]
    for i,y in enumerate(observations):
        predicted=predict_correctness(mastery,p)
        after=update_mastery(mastery,y,p)
        rows.append({"position":i+1,"mastery_before":mastery,"predicted_correct":predicted,
                     "observed_correct":y,"mastery_next":after})
        mastery=after
    return rows


def load_model(path):
    data=json.loads(path.read_bytes())
    if data["model_version"]!="2.0.0" or data["states"]!=["nao_dominada","dominada"] or data["observations"]!=[0,1]:
        raise ValueError("Versão ou convenção de modelo inválida.")
    for key,entry in data["skills"].items():
        if key!=entry["skill_id"]:
            raise ValueError("ID de habilidade inconsistente.")
        validate_parameters(entry["parameters"])
    return data
