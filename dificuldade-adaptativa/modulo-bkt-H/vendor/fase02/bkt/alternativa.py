"""Independent scaled two-state matrix forward pass, for scientific auditing."""
import itertools
import math
from fractions import Fraction


def matrices(params):
    l0,t,g,s=(params[k] for k in ("L0","T","G","S"))
    return [1-l0,l0], [[1-t,t],[0.,1.]], [[1-g,g],[s,1-s]]


def forward(observations,params):
    state,A,B=matrices(params)
    total=0.
    rows=[]
    for i,y in enumerate(observations):
        prediction=sum(state[z]*B[z][1] for z in (0,1))
        observed=[state[z]*B[z][y] for z in (0,1)]
        likelihood=sum(observed)
        posterior=[a/likelihood for a in observed]
        total+=math.log(likelihood)
        rows.append({"predicted_correct":prediction,"posterior_mastery":posterior[1]})
        if i<len(observations)-1:
            state=[sum(posterior[z]*A[z][j] for z in (0,1)) for j in (0,1)]
    return total,rows


def enumerate_exact(observations,params):
    l0,t,g,s=(Fraction(str(params[k])) for k in ("L0","T","G","S"))
    pi=[1-l0,l0]
    A=[[1-t,t],[0,1]]
    B=[[1-g,g],[s,1-s]]
    total=Fraction(0)
    for states in itertools.product((0,1),repeat=len(observations)):
        weight=pi[states[0]]
        for i,y in enumerate(observations):
            weight*=B[states[i]][y]
            if i+1<len(observations):
                weight*=A[states[i]][states[i+1]]
        total+=weight
    return total
