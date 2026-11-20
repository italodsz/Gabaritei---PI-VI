"""Suggest difficulty without changing a student's explicit choice."""
LEVELS=("facil","media","dificil")


def suggest(value,count,current,inventory,cfg,last_offer_order=None,current_order=None):
    if current not in LEVELS or not isinstance(inventory,dict):
        raise ValueError("Preferência ou inventário inválidos.")
    if not 0<=value<=1 or count<0:
        raise ValueError("Evidência inválida.")
    if count<cfg["minimum_observations"]:
        return {"suggested":None,"reason":"dados_insuficientes","choice":current}
    if last_offer_order is not None and current_order-last_offer_order<cfg["cooldown"]:
        return {"suggested":None,"reason":"aguardar_intervalo","choice":current}
    low,high=cfg["thresholds"]
    target="facil" if value<low else "dificil" if value>high else "media"
    here=LEVELS.index(current)
    there=LEVELS.index(target)
    there=max(here-1,min(here+1,there))
    target=LEVELS[there]
    if target==current:
        return {"suggested":None,"reason":"manter_preferencia","choice":current}
    if abs(value-(low if target=="facil" else high if target=="dificil" else (low+high)/2))<cfg["margin"]:
        return {"suggested":None,"reason":"margem_insuficiente","choice":current}
    if inventory.get(target,0)<=0:
        return {"suggested":None,"reason":"faixa_sem_estoque","choice":current}
    return {"suggested":target,"reason":"sugestao_exige_aceite","choice":current}
