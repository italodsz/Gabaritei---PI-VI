"""Explicit area scope and versioned item labels. No ASSISTments/ENEM skill mapping."""
import math
from .motor import identity

AREAS=("MT","LC","CH","CN")

def item_level(b, *, area, cutoffs, version, scale_id, expected_scale_id):
    """Caller supplies approved cutoffs for this area/scale; never estimate from test data."""
    if area not in AREAS or not isinstance(version,str) or not version.strip():
        raise ValueError("Área ou versão dos cortes inválida.")
    if not isinstance(scale_id,str) or not scale_id or scale_id!=expected_scale_id:
        raise ValueError("Escala TRI ausente ou incompatível.")
    if not isinstance(cutoffs,(tuple,list)) or len(cutoffs)!=2 or any(type(x) not in (int,float) or not math.isfinite(x) for x in cutoffs) or cutoffs[0]>=cutoffs[1]:
        raise ValueError("Dois cortes finitos e crescentes são obrigatórios.")
    if type(b) not in (int,float) or not math.isfinite(b):
        raise ValueError("Parâmetro b ausente ou não finito.")
    level="facil" if b<=cutoffs[0] else "media" if b<=cutoffs[1] else "dificil"
    return {"level":level,"area":area,"tri_b":b,"scale_id":scale_id,"cutoffs_version":version,
            "intervals":"b<=low; low<b<=high; b>high","is_student_mastery":False}

def register_area_response(motor, *, student_id, area, attempt_id, correct, event_order, inventory):
    """Area aggregate is a fallback score, never certified knowledge of each constituent skill."""
    if area not in AREAS:
        raise ValueError("Área ENEM inválida.")
    identity(student_id,"Estudante")
    return motor.respond(student_id,"enem:"+area,"area",attempt_id,correct,event_order,inventory)
