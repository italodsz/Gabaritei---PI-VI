"""Compare logical events and student histories independently of pseudonym keys."""
import hashlib
import json
from .common import rows,sha


def digest_records(records):
    h=hashlib.sha256()
    for r in records:
        h.update((json.dumps(r,sort_keys=True,separators=(",",":"),ensure_ascii=True)+"\n").encode("ascii"))
    return h.hexdigest()


def fingerprint(private):
    splits=("treino","validacao","teste")
    events={s:list(rows(private/f"eventos_{s}.jsonl")) for s in splits}
    first={}
    for seq in events.values():
        for event in seq:
            u=event["student_id"]
            first[u]=min(first.get(u,event["event_order"]),event["event_order"])
    if len(set(first.values()))!=len(first):
        raise ValueError("Ordem mínima do estudante não é única.")
    label={u:f"repro_student_{n}" for u,n in first.items()}
    results={}
    for split in splits:
        ordered=sorted(events[split],key=lambda r:r["source_row"])
        results[f"eventos_{split}.jsonl"]=digest_records(
            {**r,"student_id":label[r["student_id"]]} for r in ordered)
        histories=[{**r,"student_id":label[r["student_id"]]}
                   for r in rows(private/f"sequencias_{split}.jsonl")]
        histories.sort(key=lambda r:(int(r["skill_id"]),r["event_order"][0]))
        results[f"sequencias_{split}.jsonl"]=digest_records(histories)
    members=[{**r,"student_id":label[r["student_id"]]} for r in rows(private/"estudantes.jsonl")]
    members.sort(key=lambda r:r["student_id"])
    results["estudantes.jsonl"]=digest_records(members)
    results["exclusoes.csv"]=sha(private/"exclusoes.csv")
    return {"version":"canonical_1.0","identity":"minimum_retained_global_order_per_student",
            "events_sort":"source_row","sequences_sort":"numeric_skill_id, first_event_order",
            "file_sha256":results,"students":len(first)}
