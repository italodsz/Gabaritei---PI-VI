"""Run tests and emit observed execution evidence for every test."""
from datetime import datetime,timezone
import json
import platform
import sys
import time
import unittest

from bkt.common import ROOT,save,sha


class EvidenceResult(unittest.TextTestResult):
    def startTest(self,test):
        self.start_time=time.perf_counter()
        self.start_utc=datetime.now(timezone.utc).isoformat()
        super().startTest(test)

    def record(self,test,status,detail=None):
        source=ROOT/"tests/test_bkt.py"
        result={"test":test.id(),"status":status,"started_utc":self.start_utc,
                "seconds":time.perf_counter()-self.start_time,"source":"tests/test_bkt.py",
                "source_sha256":sha(source),"version":"2.0.0","command":"python -B testar.py",
                "python":platform.python_version(),"details":detail}
        self.records.append(result)

    def addSuccess(self,test):
        self.record(test,"aprovado")
        super().addSuccess(test)

    def addFailure(self,test,error):
        self.record(test,"falhou",self._exc_info_to_string(error,test))
        super().addFailure(test,error)

    def addError(self,test,error):
        self.record(test,"erro",self._exc_info_to_string(error,test))
        super().addError(test,error)


def main():
    suite=unittest.defaultTestLoader.discover(str(ROOT/"tests"),pattern="test_*.py")
    result=unittest.TextTestRunner(verbosity=2,resultclass=EvidenceResult)
    # TextTestRunner creates its result lazily.
    EvidenceResult.records=[]
    observed=result.run(suite)
    code=0 if observed.wasSuccessful() else 1
    save(ROOT/"evidence/testes/resultados.json",{"records":observed.records,
         "tests_run":observed.testsRun,"failures":len(observed.failures),"errors":len(observed.errors),
         "exit_code":code,"skips":len(observed.skipped)})
    return code


if __name__=="__main__":
    sys.exit(main())
