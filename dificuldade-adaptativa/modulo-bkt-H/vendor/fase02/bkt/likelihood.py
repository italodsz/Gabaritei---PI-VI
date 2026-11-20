"""Exact vectorised likelihood and analytic gradient for no-forgetting BKT.

The likelihood sums all allowed times of first transition to mastery.
There are n+1 possible latent paths for a length-n sequence.
The final observation has no following transition in its likelihood.
"""
import numpy as np


class PackedSequences:
    def __init__(self,sequences):
        if not sequences:
            raise ValueError("Conjunto vazio.")
        if any(not s or any(type(y) is not int or y not in (0,1) for y in s) for s in sequences):
            raise ValueError("Sequências devem conter inteiros binários.")
        self.lengths=np.array([len(s) for s in sequences],dtype=np.int64)
        self.starts=np.r_[0,np.cumsum(self.lengths)[:-1]]
        self.group=np.repeat(np.arange(len(sequences)),self.lengths)
        self.y=np.array([y for s in sequences for y in s],dtype=np.float64)
        self.index=np.arange(len(self.y))-self.starts[self.group]+1
        self.last=self.index==self.lengths[self.group]
        self.events=int(self.lengths.sum())

    def prefix(self,x):
        cs=np.cumsum(x)
        offset=np.r_[0.,cs[self.starts[1:]-1]]
        return cs-offset[self.group]

    def objective(self,params):
        l0,t,g,s=params
        y=self.y
        log_m=y*np.log1p(-s)+(1-y)*np.log(s)
        log_n=y*np.log(g)+(1-y)*np.log1p(-g)
        diff=self.prefix(log_n-log_m)
        terms=np.log1p(-l0)+diff+(self.index-1)*np.log1p(-t)
        terms=terms+np.where(self.last,0.,np.log(t))
        path_sum=np.logaddexp.reduceat(terms,self.starts)
        log_mix=np.logaddexp(np.log(l0),path_sum)
        logprob=np.add.reduceat(log_m,self.starts)+log_mix
        weight=np.exp(terms-log_mix[self.group])
        g0=np.exp(np.log(l0)-log_mix)/l0-np.add.reduceat(weight,self.starts)/(1-l0)
        gt=np.sum(weight*(np.where(self.last,0.,1/t)-(self.index-1)/(1-t)))
        gg=np.sum(weight*self.prefix(y/g-(1-y)/(1-g)))
        gs=np.sum((1-y)/s-y/(1-s))+np.sum(weight*self.prefix(y/(1-s)-(1-y)/s))
        grad=-np.array([np.sum(g0),gt,gg,gs])/self.events
        loss=-float(np.sum(logprob))/self.events
        if not np.isfinite(loss) or not np.all(np.isfinite(grad)):
            raise FloatingPointError("Objetivo ou gradiente não finito.")
        return loss,grad
