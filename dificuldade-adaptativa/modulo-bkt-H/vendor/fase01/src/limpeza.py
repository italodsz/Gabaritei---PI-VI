"""Audit each raw record and keep only unambiguous original single-skill events."""
import re
from collections import Counter

POSITIVE = re.compile(r"[1-9][0-9]*")
COMPOSITE = re.compile(r"[1-9][0-9]*(?:[_;,][1-9][0-9]*)+")
MISSING = {"", "NA", "NaN", "NULL"}
AID = {"0": False, "1": True, "2": True}
FILTERS = ("id_estudante_invalido", "ordem_invalida", "ordem_conflitante",
           "evento_conflitante", "duplicata_projetada", "id_item_invalido",
           "habilidade_ausente", "habilidade_multipla", "habilidade_invalida",
           "rotulo_invalido", "original_invalido", "andaime", "tipo_ausente",
           "resposta_aberta_autocorrigida")


def reason(row):
    user, order, item, skill, original, correct, answer_type, _, _ = row
    if not POSITIVE.fullmatch(user):
        return "id_estudante_invalido"
    if not POSITIVE.fullmatch(order):
        return "ordem_invalida"
    if not POSITIVE.fullmatch(item):
        return "id_item_invalido"
    if skill in MISSING:
        return "habilidade_ausente"
    if COMPOSITE.fullmatch(skill):
        return "habilidade_multipla"
    if not POSITIVE.fullmatch(skill):
        return "habilidade_invalida"
    if correct not in {"0", "1"}:
        return "rotulo_invalido"
    if original not in {"0", "1"}:
        return "original_invalido"
    if original == "0":
        return "andaime"
    if answer_type in MISSING:
        return "tipo_ausente"
    if answer_type == "open_response":
        return "resposta_aberta_autocorrigida"
    return None


def clean(records):
    groups = {}
    order_owners = {}
    reused_orders = set()
    rejected = []
    raw = Counter()
    raw_users, raw_items, raw_skills = set(), set(), set()
    missing = Counter()
    for number, row in records:
        user, order, item, skill, original, correct, _, action, _ = row
        raw.update(("registros", f"original_{original}", f"rotulo_{correct}", f"acao_{action}"))
        if POSITIVE.fullmatch(user):
            raw_users.add(user)
        if POSITIVE.fullmatch(item):
            raw_items.add(item)
        if POSITIVE.fullmatch(skill) or COMPOSITE.fullmatch(skill):
            raw_skills.update(re.split("[_;,]", skill))
        for col, value in zip(("user_id","order_id","problem_id","skill_id","original","correct",
                               "answer_type","first_action","opportunity_original"), row):
            if value in MISSING:
                missing[col] += 1
        if not POSITIVE.fullmatch(user) or not POSITIVE.fullmatch(order):
            rejected.append((number, reason(row)))
            continue
        if order_owners.setdefault(order, user) != user:
            reused_orders.add(order)
        groups.setdefault((user, order), []).append((number, row))

    kept = []
    for (_, order), group in groups.items():
        if order in reused_orders or len({r for _, r in group}) > 1:
            exclusion = "ordem_conflitante" if order in reused_orders else "evento_conflitante"
            rejected.extend((number, exclusion) for number, _ in group)
            continue
        number, row = min(group)
        rejected.extend((other, "duplicata_projetada") for other, _ in group if other != number)
        exclusion = reason(row)
        if exclusion:
            rejected.append((number, exclusion))
        else:
            kept.append((number, row))
    raw.update({"estudantes": len(raw_users), "itens": len(raw_items), "habilidades_atomicas": len(raw_skills),
                "linhas_com_chave_aluno_ordem_repetida": sum(len(g)-1 for g in groups.values()),
                "ordens_com_varios_estudantes": len(reused_orders)})
    return kept, sorted(rejected), dict(raw), dict(missing)
