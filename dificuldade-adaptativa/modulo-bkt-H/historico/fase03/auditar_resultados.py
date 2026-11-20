"""Post-evaluation independent readback using ranks and direct metric formulas."""
import argparse
from pathlib import Path
import json
import numpy as np
from scipy.stats import rankdata

from src.common import ROOT,load,save,sha,rows,log_access
from src.protocolo import verify


def main(private,local):
    protocol = verify()
    report = load(ROOT/"reports/avaliacao_final.json")
    data = dict(np.load(local/"predicoes_teste.npz",allow_pickle=False))
    assert sha(local/"predicoes_teste.npz")==report["private_predictions_sha256"]
    log_access("post_test_independent_readback","eventos_teste.jsonl",protocol_sha256=report["protocol_sha256"])
    expected = {r["event_id"]:r for r in rows(private/"eventos_teste.jsonl")}
    for eid,user,skill,y in zip(data["event_id"],data["student"],data["skill"],data["y"],strict=True):
        r = expected[eid]
        assert r["student_id"]==user and r["skill_id"]==skill and r["correct_first"]==y
    y = data["y"].astype(float)
    comparison = {}
    for method in report["methods"]:
        p = data[method].astype(float)
        ll = float(np.mean(-y*np.log(p)-(1-y)*np.log1p(-p)))
        brier = float(np.mean((y-p)**2))
        ranks = rankdata(np.round(p,10),method="average")
        n1,n0 = y.sum(),len(y)-y.sum()
        auc = float((ranks[y==1].sum()-n1*(n1+1)/2)/(n1*n0)) if n1 and n0 else None
        accuracy = float(np.mean((p>=.5)==y))
        ece = 0.
        for i in range(10):
            select = (p>=i/10)&((p<(i+1)/10) if i<9 else (p<=1))
            if select.any():
                ece += float(select.mean()*abs(p[select].mean()-y[select].mean()))
        reference = report["micro"][method]
        observed = {"log_loss":ll,"brier":brier,"auc_roc":auc,"accuracy":accuracy,"ece":ece}
        comparison[method] = {}
        for metric,value in observed.items():
            error = abs(value-reference[metric])
            assert error<1e-10,(method,metric,error)
            comparison[method][metric] = error
    assert report["events"]==len(y)
    assert report["students"]==len(set(data["student"]))
    assert sum(r["events"] for r in report["skills"].values())==len(y)
    assert sum(report["classification_counts"].values())==56
    for r in report["skills"].values():
        assert r["confidence"]["replicates"]==1000
    ledger = list(rows(ROOT/"evidence/acesso_teste.jsonl"))
    frozen = next(i for i,r in enumerate(ledger) if r["action"]=="protocol_frozen")
    opens = [i for i,r in enumerate(ledger) if r["action"]=="test_outcomes_open"]
    assert opens and min(opens)>frozen
    assert report["protocol_sha256"]==sha(ROOT/"reports/protocolo_pre_teste.json")
    save(ROOT/"reports/auditoria_resultados.json",{
        "status":"aprovado","events_read_back":len(y),"students":report["students"],
        "metric_absolute_errors":comparison,"protocol_before_first_test_open":True,
        "model_hash_preserved":sha(ROOT/"models/parametros_por_habilidade.json")==protocol["model_sha256"],
        "human_external_review":"pendente"})
    print("Conferência independente dos resultados aprovada.",len(y),"eventos.")


if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("private",type=Path)
    p.add_argument("local",type=Path)
    a=p.parse_args()
    main(a.private,a.local)
