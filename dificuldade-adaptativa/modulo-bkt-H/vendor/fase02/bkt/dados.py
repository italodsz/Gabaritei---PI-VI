"""Access verified Phase 1 sequences for training or validation."""
from collections import defaultdict
import json
from pathlib import Path

from fase01.src.carregar import load_sequences
from .common import ROOT,sha


def groups(private,split):
    if split not in ("treino","validacao"):
        raise ValueError("Esta fase permite carregar apenas treino e validação.")
    gate=json.loads((ROOT/"reports/gate_entrada.json").read_bytes())
    filename=f"sequencias_{split}.jsonl"
    expected=gate["arquivos_locais_sha256"][filename]
    if gate["status"]!="aprovado" or sha(private/filename)!=expected:
        raise ValueError("Dados diferem do gate de entrada.")
    out=defaultdict(list)
    for r in load_sequences(private,split=split):
        out[r["skill_id"]].append(r)
    for seq in out.values():
        seq.sort(key=lambda r:r["event_order"][0])
    if split=="treino":
        if len(out)!=56 or sum(len(s) for s in out.values())!=19370 or sum(r["length"] for g in out.values() for r in g)!=143092:
            raise ValueError("Suporte de treino inesperado.")
    return dict(sorted(out.items(),key=lambda kv:int(kv[0])))
