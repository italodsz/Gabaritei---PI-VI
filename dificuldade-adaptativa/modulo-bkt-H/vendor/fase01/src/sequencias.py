"""Canonical events, deterministic student split and ordered observation sequences."""
from collections import defaultdict
import hashlib
import hmac
import secrets
from pathlib import Path

from .limpeza import AID

SPLITS = ("treino", "validacao", "teste")
EVENT_FIELDS = ("dataset", "release", "student_id", "event_id", "item_id", "skill_id",
                "event_order", "timestamp_utc_nullable", "correct_first", "aid_on_first_nullable",
                "source_row", "split")


def private_key(path):
    try:
        with path.open("xb") as f:
            f.write(secrets.token_bytes(32))
    except FileExistsError:
        pass
    key = path.read_bytes()
    if len(key) != 32:
        raise ValueError("A chave local deve ter 32 bytes.")
    return key


def pseudonym(user, key, release):
    return "s_" + hmac.new(key, f"{release}/{user}".encode("ascii"), "sha256").hexdigest()


def split_students(users, seed):
    def rank(user):
        return hashlib.sha256(f"{seed}:{user}".encode("ascii")).digest(), user

    students = sorted(set(users), key=rank)
    n = len(students)
    quotas = [n * k for k in (70, 15, 15)]
    sizes = [q // 100 for q in quotas]
    by_remainder = sorted(range(3), key=lambda i: (-(quotas[i] % 100), i))
    for i in by_remainder[:n - sum(sizes)]:
        sizes[i] += 1
    return dict(zip(students, (name for name, size in zip(SPLITS, sizes) for _ in range(size))))


def build(rows, cfg, key):
    assignment = split_students((row[0] for _, row in rows), cfg["seed"])
    ids = {u: pseudonym(u, key, cfg["release"]) for u in assignment}
    if len(set(ids.values())) != len(ids):
        raise ValueError("Colisão de pseudônimo.")
    events = []
    for source_row, (user, order, item, skill, _, correct, _, action, _) in rows:
        events.append(dict(zip(EVENT_FIELDS, (cfg["dataset"], cfg["release"], ids[user],
                    f"o_{order}", item, skill, int(order), None, int(correct), AID.get(action),
                    source_row, assignment[user]))))
    return sorted(events, key=lambda e: (e["student_id"], e["event_order"]))


def sequences(events):
    groups = defaultdict(list)
    for e in events:
        groups[e["split"], e["student_id"], e["skill_id"]].append(e)
    for (split, user, skill), events in sorted(groups.items()):
        ordered = sorted(events, key=lambda e: (e["event_order"], e["source_row"]))
        order = [e["event_order"] for e in ordered]
        if any(a >= b for a, b in zip(order, order[1:])):
            raise ValueError("Ordem empatada em sequência canônica.")
        yield {"split": split, "student_id": user, "skill_id": skill, "length": len(ordered),
               "event_ids": [e["event_id"] for e in ordered], "event_order": order,
               "correct_first": [e["correct_first"] for e in ordered]}
