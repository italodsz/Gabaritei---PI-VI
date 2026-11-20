"""Statistics and training-only support rules for BKT."""
from collections import Counter, defaultdict
from statistics import mean, median


def profile(events, sequences, include_labels):
    users = Counter(e["student_id"] for e in events)
    items = Counter(e["item_id"] for e in events)
    sk = Counter(e["skill_id"] for e in events)
    lengths = [s["length"] for s in sequences]
    distinct_exposures = {(e["student_id"], e["skill_id"], e["item_id"]) for e in events}
    out = {"eventos": len(events), "estudantes": len(users), "itens": len(items),
           "habilidades": len(sk), "sequencias": len(lengths), "sequencias_5_mais": sum(n >= 5 for n in lengths),
           "comprimento_medio": round(mean(lengths), 5) if lengths else None,
           "comprimento_mediano": median(lengths) if lengths else None,
           "histograma_comprimentos": dict(Counter(lengths)), "histograma_eventos_aluno": dict(Counter(users.values())),
           "repeticoes_item_aluno_habilidade": len(events) - len(distinct_exposures),
           "repeticoes_item_aluno": len(events) - len({(u, item) for u, _, item in distinct_exposures}),
           "eventos_por_habilidade": dict(sk)}
    if include_labels:
        y = Counter(e["correct_first"] for e in events)
        out["rotulos"] = {"acertos": y[1], "erros_ou_ajuda": y[0],
                         "taxa": round(y[1] / len(events), 6) if events else None}
        out["ajuda_inicial"] = dict(Counter(str(e["aid_on_first_nullable"]) for e in events))
        out["acertos_com_ajuda_inicial"] = sum(e["aid_on_first_nullable"] is True and e["correct_first"] == 1
                                              for e in events)
        out["transicoes_observadas"] = dict(Counter(f"{a}{b}" for s in sequences
             for a, b in zip(s["correct_first"], s["correct_first"][1:])))
    return out


def eligibility(training_events, training_sequences, thresholds):
    if any(x["split"] != "treino" for x in training_events + training_sequences):
        raise ValueError("Elegibilidade aceita exclusivamente o treino.")
    events_by_skill, seq_by_skill = defaultdict(list), defaultdict(list)
    for e in training_events:
        events_by_skill[e["skill_id"]].append(e)
    for s in training_sequences:
        seq_by_skill[s["skill_id"]].append(s)
    rows = []
    names = ("estudantes", "sequencias_5_mais", "acertos", "erros_ou_ajuda")
    for skill in sorted(events_by_skill, key=int):
        p = profile(events_by_skill[skill], seq_by_skill[skill], True)
        support = {**p, **p["rotulos"]}
        flags = {mode: all(support[n] >= target for n, target in zip(names, t))
                 for mode, t in thresholds.items()}
        miss = [n for n, target in zip(names, thresholds["principal"]) if support[n] < target]
        rows.append({"skill_id": skill, **{n: support[n] for n in names},
                     **{n: p[n] for n in ("eventos","itens","sequencias","comprimento_medio",
                        "comprimento_mediano","histograma_comprimentos","repeticoes_item_aluno_habilidade",
                        "transicoes_observadas","acertos_com_ajuda_inicial")},
                     "taxa_acertos": p["rotulos"]["taxa"], **flags, "criterios_nao_atendidos": miss,
                     "sequencias_unitarias": p["histograma_comprimentos"].get(1, 0)})
    return rows
