"""Adapter for the confirmed frontend answer/correction contract, executed after authoritative correction."""
from .motor import identity


def register_correction(motor,student_id,submission,question,correction,event_order,inventory):
    required={"questaoId","letra","modo","sessaoId","recomendacaoId","chaveIdempotencia"}
    if not isinstance(submission,dict) or not required.issubset(submission):
        raise ValueError("EnvioResposta incompleto.")
    if submission["letra"] not in ("A","B","C","D","E"):
        raise ValueError("Letra inválida.")
    if question["id"]!=submission["questaoId"]:
        raise ValueError("Correção e questão não correspondem.")
    if type(correction.get("correta")) is not bool or not correction.get("tentativaId"):
        raise ValueError("Correção autorizada ausente.")
    return motor.respond(student_id,question["skill_namespace"],question["skill_id"],
                         correction["tentativaId"],int(correction["correta"]),event_order,inventory)
