"""Synthetic functional demonstration; no estimate of real educational performance."""
import argparse,json
from pathlib import Path
from bkt04.motor import Motor
from bkt04.enem import register_area_response,item_level

def main(work):
    work.mkdir(parents=True,exist_ok=True)
    db=work/"enem-demo.sqlite"
    if db.exists():raise ValueError("Use uma pasta de exemplo nova para preservar a execução anterior.")
    motor=Motor(db)
    stock={"facil":10,"media":10,"dificil":10}
    motor.choose_level("demo-enem","enem:MT","area","media","preferencia-demo")
    trace=[]
    for n in range(1,11):
        r=register_area_response(motor,student_id="demo-enem",area="MT",attempt_id=f"resposta-{n}",correct=1,event_order=n,inventory=stock)
        assert r["mastery_updated"] is None and r["strategy"]=="historico_suavizado"
        assert motor.inspect("demo-enem","enem:MT","area")["choice"]=="media"
        trace.append(r)
    offer=trace[-1]["recommendation"].get("offer_id")
    accepted=motor.resolve_offer("demo-enem",offer,True) if offer else None
    assert accepted and accepted["choice"]=="dificil"
    assert Motor(db).inspect("demo-enem","enem:MT","area")["total"]==10
    assert motor.inspect("demo-enem","enem:CN","area") is None
    result={"fixture":"10 respostas sintéticas; não mede aprendizagem","actual_app_connection":False,
      "area_scope":"MT isolada de CN/CH/LC","diagnostic":"dez eventos ilustram diagnóstico; seleção de itens e encerramento do diagnóstico ainda são responsabilidade futura do backend",
      "trace":trace,"explicit_acceptance":accepted,
      "item_example":item_level(1.2,area="MT",cutoffs=[.8005400000000001,1.56301],version="historico_global",scale_id="escala-demo",expected_scale_id="escala-demo")}
    out=work/"resultado_enem.json";out.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding="utf-8")
    print("Exemplo ENEM: fallback identificado, áreas isoladas, persistência e aceite explícito aprovados.")
    print(out)

if __name__=="__main__":
    p=argparse.ArgumentParser();p.add_argument("work",type=Path);main(p.parse_args().work)
