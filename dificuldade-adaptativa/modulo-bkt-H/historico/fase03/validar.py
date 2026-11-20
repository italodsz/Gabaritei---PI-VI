"""Reproduce validation and audit floating-point ties before selecting calibration."""
import argparse
from pathlib import Path
import sys
import numpy as np

from src.common import ROOT,PHASE2,save,load,sequences
from src.predicoes import predict
from src.metricas import Scores
from src.calibracao import calibrate
sys.path.insert(0,str(PHASE2))
from bkt.inferencia import trace as original_trace


def main(private,local):
    records = sequences(private,"validacao")
    data = predict(records)
    prior = load(PHASE2/"reports/validacao.json")
    models = load(ROOT/"models/parametros_por_habilidade.json")["skills"]
    old_predictions = np.array([x["predicted_correct"] for r in records
                               for x in original_trace(r["correct_first"],models[r["skill_id"]]["parameters"])])
    assert np.max(np.abs(old_predictions-data["bkt"]))<1e-10
    methods = ("bkt","taxa_habilidade","taxa_global","historico_suavizado")
    result = {"split":"validacao","students":len(set(data["student"])),"events":len(data["y"]),
              "sequences":len(records),"micro":{},"skills":{},"differences_to_phase02":{},
              "auc_ties":"scores arredondados a dez casas apenas para ranks AUC",
              "max_prediction_difference":float(np.max(np.abs(old_predictions-data["bkt"])))}
    mapping = {"log_loss":"log_loss","brier":"brier","auc_roc":"auc_roc","accuracy":"accuracy_threshold_0_5","ece":"ece_10_bins"}
    for name in methods:
        result["micro"][name] = Scores(data["y"],data[name]).compute()
    for new,old in (("bkt","bkt"),("taxa_habilidade","baseline")):
        result["differences_to_phase02"][new] = {}
        for metric,field in mapping.items():
            delta = abs(result["micro"][new][metric]-prior["micro"][old][field])
            if metric!="auc_roc":
                assert delta<1e-11
            result["differences_to_phase02"][new][metric] = delta
    for s in sorted(set(data["skill"]),key=int):
        mask = data["skill"]==s
        result["skills"][s] = {name:Scores(data["y"][mask],data[name][mask]).compute() for name in methods}
        canonical = Scores(data["y"][mask],old_predictions[mask]).compute()
        assert abs(canonical["auc_roc"]-result["skills"][s]["bkt"]["auc_roc"])<1e-12
        result["skills"][s]["historic_raw_auc"] = prior["skills"][s]["bkt"]["auc_roc"]
        result["skills"][s]["auc_difference_to_historic"] = result["skills"][s]["bkt"]["auc_roc"]-prior["skills"][s]["bkt"]["auc_roc"]
        for name,old in (("bkt","bkt"),("taxa_habilidade","baseline")):
            for metric,field in mapping.items():
                delta = abs(result["skills"][s][name][metric]-prior["skills"][s][old][field])
                if metric!="auc_roc":
                    assert delta<1e-11
    cfg = load(ROOT/"config/decisoes.json")
    calibration = calibrate(data,records,cfg)
    save(ROOT/"reports/validacao_reproduzida.json",result)
    save(ROOT/"models/calibracao.json",calibration)
    local.mkdir(parents=True,exist_ok=True)
    np.savez_compressed(local/"predicoes_validacao.npz",**data)
    print("Validação reproduzida.",result["events"],"eventos,",result["students"],"estudantes.")
    print("Diferença máxima das probabilidades:",result["max_prediction_difference"])
    print("Calibração:",calibration["choice"],"log-loss crossfit:",calibration["crossfit_metrics"]["log_loss"])
    print("AUC com empates numéricos explícitos:",result["micro"]["bkt"]["auc_roc"])


if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("private",type=Path)
    p.add_argument("local",type=Path)
    a=p.parse_args()
    main(a.private,a.local)
