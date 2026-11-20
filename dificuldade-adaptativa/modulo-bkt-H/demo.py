"""Executed synthetic integration fixture. No educational-performance claim is produced."""
import argparse
from pathlib import Path

from bkt04.common import ROOT,load,save
from bkt04.motor import Motor
from bkt04.adaptador import register_correction


def main(work):
    gate=load(ROOT/"models/elegibilidade_integracao.json")["skills"]
    skill=next(k for k,v in gate.items() if v["eligible_for_experimental_difficulty"])
    db=work/"demo.sqlite"
    if db.exists():
        raise ValueError("Use outro diretório de demo para preservar a execução anterior.")
    motor=Motor(db)
    motor.choose_level("demo-student","assistments_2009_2010",skill,"media","demo-choice")
    trace=[]
    for i,y in enumerate([0,0,0,0,0,1,1,1,1,1],1):
        submission={"questaoId":f"demo-{i}","letra":"A","modo":"livre","sessaoId":"demo-session",
                    "recomendacaoId":None,"chaveIdempotencia":f"demo-attempt-{i}"}
        question={"id":f"demo-{i}","skill_id":skill,"skill_namespace":"assistments_2009_2010"}
        correction={"tentativaId":submission["chaveIdempotencia"],"correta":bool(y)}
        r=register_correction(motor,"demo-student",submission,question,correction,i,{"facil":3,"media":3,"dificil":3})
        assert r==register_correction(motor,"demo-student",submission,question,correction,i,{"facil":3,"media":3,"dificil":3})
        trace.append(r)
    blocked=motor.respond("demo-enem","enem:MT","H1","enem-attempt",1,1,{"facil":2,"media":2,"dificil":2})
    assert blocked["strategy"]=="historico_suavizado" and blocked["mastery_updated"] is None
    restarted=Motor(db)
    assert restarted.inspect("demo-student","assistments_2009_2010",skill)["total"]==10
    assert restarted.inspect("demo-student","assistments_2009_2010",skill)["choice"]=="media"
    save(work/"resultado_bkt_externo.json",{"fixture":"respostas e IDs sintéticos, parâmetros reais do ASSISTments",
            "frontend_contract":"EnvioResposta/Correcao, integração por interface Python",
            "actual_app_connection":False,"trace":trace,"enem_fallback":blocked,"persistence_restart":"aprovado",
            "replayed_attempts_double_count":0,"unauthorized_preference_changes":0})
    print("Demo sintética da interface: persistência, dez eventos idempotentes e fallback ENEM verificados.")


if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("work",type=Path)
    a=p.parse_args()
    a.work.mkdir(parents=True,exist_ok=True)
    main(a.work.resolve())
