"""Verify source, prepare private histories, and export publishable aggregates."""
import argparse
from collections import Counter
from pathlib import Path
from tempfile import TemporaryDirectory

from .common import config, csv_write, digest, json_write, jsonl_write
from .estatisticas import eligibility, profile
from .ingestao import records, verify
from .limpeza import FILTERS, clean
from .sequencias import SPLITS, build, private_key, sequences


def release(path, cfg, private, public):
    if private.resolve() == public.resolve():
        raise ValueError("Use pastas diferentes para eventos locais e relatórios públicos.")
    columns = verify(path, cfg)
    rows, rejected, raw, missing = clean(records(path, cfg["source_encoding"]))
    private.mkdir(parents=True, exist_ok=True)
    public.mkdir(parents=True, exist_ok=True)
    events = build(rows, cfg, private_key(private / ".chave_local"))
    seq = list(sequences(events))
    training_events = [e for e in events if e["split"] == "treino"]
    training_seq = [s for s in seq if s["split"] == "treino"]
    observed = eligibility(training_events, training_seq, cfg["thresholds"])
    selected = {s["skill_id"] for s in observed if s["principal"]}
    absent = sorted({e["skill_id"] for e in events} - {s["skill_id"] for s in observed}, key=int)
    stats = profile(events, seq, False)
    supports = {}
    exclusions = Counter(reason for _, reason in rejected)
    if len(events) + len(rejected) != raw["registros"] or sum(s["length"] for s in seq) != len(events):
        raise ValueError("Reconciliação incompleta.")
    o = {}
    for n, row in rows:
        user, order, _, skill, _, _, _, _, opportunity = row
        o.setdefault((user, skill), []).append((int(order), opportunity))
    opportunities = Counter()
    for seq_o in o.values():
        last = None
        for _, opportunity in sorted(seq_o):
            if not opportunity.isascii() or not opportunity.isdigit():
                opportunities["ausente_ou_nao_numerica"] += 1
                continue
            step = int(opportunity)
            if last is not None:
                opportunities["cresce" if step > last else "empata" if step == last else "decresce"] += 1
                if step > last + 1:
                    opportunities["cresce_com_salto"] += 1
            last = step
    with TemporaryDirectory(prefix=".bkt-stage-", dir=private) as folder:
        stage = Path(folder)
        for name in SPLITS:
            ev = [e for e in events if e["split"] == name]
            sq = [s for s in seq if s["split"] == name]
            supports[name] = profile(ev, sq, name == "treino")
            supports[name]["eventos_habilidades_principais"] = sum(e["skill_id"] in selected for e in ev)
            supports[name]["sequencias_habilidades_principais"] = sum(s["skill_id"] in selected for s in sq)
            supports[name]["estudantes_com_habilidades_principais"] = len({e["student_id"] for e in ev if e["skill_id"] in selected})
            supports[name]["itens_habilidades_principais"] = len({e["item_id"] for e in ev if e["skill_id"] in selected})
            supports[name]["habilidades_principais_presentes"] = len({e["skill_id"] for e in ev if e["skill_id"] in selected})
            supports[name]["fracao_estudantes"] = round(supports[name]["estudantes"] / stats["estudantes"], 8)
            jsonl_write(stage / f"eventos_{name}.jsonl", ev)
            jsonl_write(stage / f"sequencias_{name}.jsonl", sq)
        students = sorted({(e["student_id"], e["split"]) for e in events})
        jsonl_write(stage / "estudantes.jsonl", ({"student_id": u, "split": s} for u, s in students))
        csv_write(stage / "exclusoes.csv", ("source_row", "motivo"),
                  ({"source_row": row, "motivo": reason} for row, reason in rejected))
        private_files = {f.name: digest(f) for f in stage.iterdir()}
        json_write(stage / "manifesto_local.json", {"schema_version": cfg["schema_version"], "source_sha256": cfg["source_sha256"],
                   "habilidades_principais": sorted(selected, key=int), "sha256_arquivos": private_files,
                   "seed": cfg["seed"], "pipeline_version": cfg["pipeline_version"]})
        for filename in private_files:
            (stage / filename).replace(private / filename)
        (stage / "manifesto_local.json").replace(private / "manifesto_local.json")
    result = {"schema_version": cfg["schema_version"], "pipeline_version": cfg["pipeline_version"],
              "fonte": {"sha256": cfg["source_sha256"], "bytes": cfg["source_bytes"], "colunas": columns,
                        "codec": cfg["source_encoding"], "edicao": cfg["release"], "url": cfg["publisher"]},
              "brutos": raw, "ausencias": missing, "exclusoes": {f: exclusions[f] for f in FILTERS},
              "eventos_validos": stats, "split": supports, "semente": cfg["seed"],
              "criterios": cfg["thresholds"], "oportunidades_diagnostico": dict(opportunities),
              "habilidades_elegiveis": {m: [r["skill_id"] for r in observed if r[m]] for m in cfg["thresholds"]},
              "habilidades_sem_treino": absent}
    json_write(public / "manifesto_dados.json", result)
    json_write(public / "habilidades.json", observed)
    print(f"Brutos={raw['registros']} Excluídos={len(rejected)} Válidos={len(events)} Estudantes={stats['estudantes']} "
          f"Sequências={len(seq)} Habilidades principais={len(selected)}")
    for split, metrics in supports.items():
        print(split, {k: metrics[k] for k in ("estudantes", "eventos", "sequencias", "eventos_habilidades_principais")})
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--private", type=Path, required=True)
    parser.add_argument("--public", type=Path, required=True)
    args = parser.parse_args()
    release(args.source, config(), args.private, args.public)


if __name__ == "__main__":
    main()
