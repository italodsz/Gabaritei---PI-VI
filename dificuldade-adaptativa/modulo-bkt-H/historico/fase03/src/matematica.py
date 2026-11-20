"""Independent two-state scaled filtering, without importing Phase 02 equations."""
from fractions import Fraction
from itertools import product
import math


def check(params):
    required = ("L0","T","G","S")
    if set(params)!=set(required):
        raise ValueError("Quatro parâmetros são obrigatórios.")
    values = [params[k] for k in required]
    if any(isinstance(x,bool) or not math.isfinite(x) or not 1e-4<=x<=1-1e-4 for x in values):
        raise ValueError("Probabilidade fora do contrato.")
    if params["G"]+params["S"]>.99+1e-10:
        raise ValueError("Restrição de emissão violada.")


def infer(outcomes,params):
    check(params)
    emissions = ((1-params["G"],params["G"]),(params["S"],1-params["S"]))
    state = [1-params["L0"],params["L0"]]
    result = []
    total_ll = 0.
    for y in outcomes:
        if type(y) is not int or y not in (0,1):
            raise ValueError("Observação binária inválida.")
        prediction = math.fsum(state[i]*emissions[i][1] for i in (0,1))
        weighted = [state[i]*emissions[i][y] for i in (0,1)]
        likelihood = math.fsum(weighted)
        normalized = [v/likelihood for v in weighted]
        posterior = normalized[1]
        result.append({"predicted":prediction,"prior":state[1],"posterior":posterior,
                       "next":posterior+normalized[0]*params["T"]})
        total_ll += math.log(likelihood)
        state = [normalized[0]*(1-params["T"]), posterior+normalized[0]*params["T"]]
    return total_ll,result


def exact_likelihood(outcomes,params):
    l,t,g,s = (Fraction(str(params[k])) for k in ("L0","T","G","S"))
    pi = [1-l,l]
    transition = [[1-t,t],[0,1]]
    emission = [[1-g,g],[s,1-s]]
    likelihood = Fraction(0)
    for states in product((0,1),repeat=len(outcomes)):
        mass = pi[states[0]]
        for i,y in enumerate(outcomes):
            mass *= emission[states[i]][y]
            if i+1<len(outcomes):
                mass *= transition[states[i]][states[i+1]]
        likelihood += mass
    return likelihood
