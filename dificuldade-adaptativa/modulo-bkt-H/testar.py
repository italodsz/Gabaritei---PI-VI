"""Run groups independently and report blocked data-dependent tests explicitly."""
import argparse
from collections import Counter
from datetime import datetime,timezone
import os
from pathlib import Path
import sys
import time
import unittest

from bkt04.common import ROOT,save,sha,utc

GROUPS={"A":"A_matematica","B":"B_dados","C":"C_treinamento","D":"D_integracao","E":"E_avaliacao","F":"F_entrega"}


class Result(unittest.TextTestResult):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,**kwargs)
        self.records=[]
        self.started={}
    def startTest(self,test):
        self.started[test.id()]=(utc(),time.perf_counter())
        super().startTest(test)
    def record(self,test,status,detail=None):
        start,clock=self.started.get(test.id(),(utc(),time.perf_counter()))
        module=test.id().split(".")[0]
        path=next(iter((ROOT/"tests").glob(f"*/{module}.py")),None)
        self.records.append({"test":test.id(),"status":status,"detail":detail,"utc":start,
              "seconds":time.perf_counter()-clock,"source":path.relative_to(ROOT).as_posix() if path else None,
              "source_sha256":sha(path) if path else None})
    def addSuccess(self,test):
        self.record(test,"aprovado");super().addSuccess(test)
    def addSkip(self,test,reason):
        self.record(test,"bloqueado" if reason.startswith("BLOQUEADO") else "ignorado",reason)
        super().addSkip(test,reason)
    def addFailure(self,test,error):
        self.record(test,"reprovado",self._exc_info_to_string(error,test));super().addFailure(test,error)
    def addError(self,test,error):
        self.record(test,"erro",self._exc_info_to_string(error,test));super().addError(test,error)


def main(groupnames,out):
    suite=unittest.TestSuite()
    for name in groupnames:
        if name not in GROUPS: raise ValueError("Grupo inválido.")
        suite.addTests(unittest.TestLoader().discover(str(ROOT/"tests"/GROUPS[name]),pattern="test_*.py"))
    result=unittest.TextTestRunner(verbosity=2,resultclass=Result).run(suite)
    counts=Counter(r["status"] for r in result.records)
    exit_code=1 if not result.wasSuccessful() else 2 if counts["bloqueado"] else 0
    save(out,{"groups":groupnames,"tests_collected":result.testsRun,"counts":dict(counts),
              "failures":len(result.failures),"errors":len(result.errors),"exit_code":exit_code,"tests":result.records})
    print("Resultado por status",dict(counts),"exit code",exit_code)
    return exit_code


if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--groups",default="A,B,C,D,E,F")
    p.add_argument("--out",type=Path,default=ROOT/"evidence/tests/all.json")
    a=p.parse_args()
    sys.exit(main(a.groups.split(","),a.out))
