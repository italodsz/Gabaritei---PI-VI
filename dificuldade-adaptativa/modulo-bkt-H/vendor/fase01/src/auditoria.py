"""Independent readback with SQLite and direct comparison against the raw release."""
import argparse
import csv
import hashlib
import hmac
import json
from pathlib import Path
import sqlite3

ROOT = Path(__file__).resolve().parents[1]


def file_hash(path):
    with path.open("rb") as f:
        return hashlib.file_digest(f, "sha256").hexdigest()


def lines(path):
    with path.open(encoding="utf-8") as f:
        for line in f:
            yield json.loads(line)


def audit(source, private, public, out):
    settings = json.loads((ROOT / "config/preprocessing.json").read_bytes())
    data = json.loads((public / "manifesto_dados.json").read_bytes())
    meta = json.loads((private / "manifesto_local.json").read_bytes())
    key = (private / ".chave_local").read_bytes()
    assert file_hash(source) == settings["source_sha256"] == meta["source_sha256"]
    assert data["semente"] == meta["seed"] == settings["seed"]
    assert len(meta["sha256_arquivos"]) == 8
    for filename, expected in meta["sha256_arquivos"].items():
        assert Path(filename).name == filename and file_hash(private / filename) == expected, filename

    with sqlite3.connect(":memory:") as db:
        db.executescript("""
            CREATE TABLE raw(n INTEGER PRIMARY KEY, uid TEXT, o TEXT UNIQUE, item TEXT, skill TEXT,
                             original TEXT, y TEXT, kind TEXT, action TEXT);
            CREATE TABLE events(n INTEGER PRIMARY KEY, uid TEXT, o INTEGER UNIQUE, item TEXT,
                                skill TEXT, y INTEGER, aid INTEGER, split TEXT, eid TEXT UNIQUE);
            CREATE TABLE split_students(uid TEXT PRIMARY KEY, split TEXT);
            CREATE TABLE seq(uid TEXT, skill TEXT, split TEXT, n INTEGER,
                             PRIMARY KEY(uid,skill));
        """)
        names = ("user_id","order_id","problem_id","skill_id","original","correct","answer_type","first_action")
        with source.open(encoding="latin-1", newline="") as f:
            db.executemany("INSERT INTO raw VALUES (?,?,?,?,?,?,?,?,?)",
                           ((i, *(r[n] for n in names)) for i,r in enumerate(csv.DictReader(f),1)))
        db.execute("""CREATE VIEW expected AS SELECT * FROM raw
             WHERE uid<>'' AND uid NOT GLOB '*[^0-9]*' AND substr(uid,1,1)<>'0'
               AND o<>'' AND o NOT GLOB '*[^0-9]*' AND substr(o,1,1)<>'0'
               AND item<>'' AND item NOT GLOB '*[^0-9]*' AND substr(item,1,1)<>'0'
               AND skill<>'' AND skill NOT GLOB '*[^0-9]*' AND substr(skill,1,1)<>'0'
               AND original='1' AND y IN ('0','1') AND kind NOT IN ('','NA','NaN','NULL','open_response')""")
        users = [u for u, in db.execute("SELECT DISTINCT uid FROM expected")]
        users.sort(key=lambda u: hashlib.sha256(f"{settings['seed']}:{u}".encode()).hexdigest())
        n = len(users)
        boundaries = (round(n * .70), round(n * .85))
        # For this frozen release the cumulative rounding yields the same quotas as largest remainder.
        names_split = ("treino", "validacao", "teste")
        expected_ids = {}
        for i, u in enumerate(users):
            pseudonym = "s_" + hmac.digest(key, (settings["release"] + "/" + u).encode(), "sha256").hex()
            expected_ids[u] = pseudonym
            split = names_split[(i >= boundaries[0]) + (i >= boundaries[1])]
            db.execute("INSERT INTO split_students VALUES (?,?)", (pseudonym, split))
        actual_students = {(r["student_id"], r["split"]) for r in lines(private / "estudantes.jsonl")}
        assert actual_students == set(db.execute("SELECT uid, split FROM split_students"))
        for name in names_split:
            def event_rows():
                for e in lines(private / f"eventos_{name}.jsonl"):
                    assert (e["split"] == name and e["timestamp_utc_nullable"] is None
                            and e["release"] == settings["release"] and e["dataset"] == settings["dataset"]
                            and e["event_id"] == "o_" + str(e["event_order"])
                            and type(e["correct_first"]) is int and e["correct_first"] in (0,1)
                            and (e["aid_on_first_nullable"] is None or type(e["aid_on_first_nullable"]) is bool))
                    yield tuple(e[k] for k in ("source_row","student_id","event_order","item_id",
                            "skill_id","correct_first","aid_on_first_nullable","split","event_id"))
            db.executemany("INSERT INTO events VALUES (?,?,?,?,?,?,?,?,?)", event_rows())
        raw_n, = db.execute("SELECT COUNT(*) FROM raw").fetchone()
        valid_n, = db.execute("SELECT COUNT(*) FROM expected").fetchone()
        observed_n, = db.execute("SELECT COUNT(*) FROM events").fetchone()
        assert raw_n == data["brutos"]["registros"] and valid_n == observed_n == data["eventos_validos"]["eventos"]
        db.create_function("pseudo", 1, expected_ids.get)
        mismatch, = db.execute("""SELECT count(*) FROM events e LEFT JOIN expected r ON r.n=e.n
            LEFT JOIN split_students s ON s.uid=e.uid WHERE r.n IS NULL OR s.uid IS NULL
            OR e.uid IS NOT pseudo(r.uid) OR e.split IS NOT s.split
            OR e.o IS NOT CAST(r.o AS INTEGER) OR e.item IS NOT r.item OR e.skill IS NOT r.skill
            OR e.y IS NOT CAST(r.y AS INTEGER)
            OR e.aid IS NOT CASE r.action WHEN '0' THEN 0 WHEN '1' THEN 1 WHEN '2' THEN 1 ELSE NULL END""").fetchone()
        assert mismatch == 0
        with (private / "exclusoes.csv").open(encoding="utf-8", newline="") as f:
            db.execute("CREATE TABLE excluded(n INTEGER PRIMARY KEY, reason TEXT)")
            db.executemany("INSERT INTO excluded VALUES (?,?)",
                           ((int(r["source_row"]),r["motivo"]) for r in csv.DictReader(f)))
        assert not db.execute("SELECT n FROM (SELECT n FROM raw EXCEPT SELECT n FROM events) EXCEPT SELECT n FROM excluded").fetchone()
        assert not db.execute("SELECT n FROM excluded INTERSECT SELECT n FROM events").fetchone()
        assert db.execute("SELECT count(*) FROM excluded").fetchone()[0] == raw_n - valid_n
        expected_reason = dict(db.execute("""SELECT reason, count(*) FROM (
              SELECT CASE WHEN skill='NA' OR skill='' THEN 'habilidade_ausente'
               WHEN skill GLOB '*_*' THEN 'habilidade_multipla'
               WHEN original='0' THEN 'andaime'
               WHEN kind='open_response' THEN 'resposta_aberta_autocorrigida'
               ELSE 'revisar' END AS reason
              FROM raw WHERE n NOT IN (SELECT n FROM expected)) GROUP BY reason"""))
        assert expected_reason == dict(db.execute("SELECT reason,count(*) FROM excluded GROUP BY reason"))
        assert expected_reason == {r:n for r,n in data["exclusoes"].items() if n}
        db.execute("CREATE INDEX events_seq ON events(split,uid,skill,o)")
        sample = []
        for name in names_split:
            buckets = set()
            for s in lines(private / f"sequencias_{name}.jsonl"):
                actual = db.execute("SELECT eid,o,y FROM events WHERE split=? AND uid=? AND skill=? ORDER BY o",
                                    (name,s["student_id"],s["skill_id"])).fetchall()
                assert s["split"] == name and len(actual) == s["length"] > 0
                assert actual == list(zip(s["event_ids"],s["event_order"],s["correct_first"],strict=True))
                db.execute("INSERT INTO seq VALUES (?,?,?,?)",(s["student_id"],s["skill_id"],name,s["length"]))
                bucket = "1" if s["length"]==1 else "2-4" if s["length"]<5 else "5+"
                if bucket not in buckets:
                    sample.append({"conjunto":name,"faixa_comprimento":bucket,
                                   "confronto_csv_e_sequencia":"ok"})
                    buckets.add(bucket)
        assert db.execute("SELECT sum(n) FROM seq").fetchone()[0] == valid_n
        rows = db.execute("""SELECT skill,count(*),sum(n>=5) FROM seq
              WHERE split='treino' GROUP BY skill""").fetchall()
        eligible = {m: [] for m in settings["thresholds"]}
        for skill, students, long_n in rows:
            zeros, ones = db.execute("""SELECT sum(y=0),sum(y=1) FROM events
                                WHERE split='treino' AND skill=?""", (skill,)).fetchone()
            for mode, thresholds in settings["thresholds"].items():
                if all(v >= t for v,t in zip((students,long_n,ones,zeros),thresholds,strict=True)):
                    eligible[mode].append(skill)
        for values in eligible.values():
            values.sort(key=int)
        assert eligible == data["habilidades_elegiveis"] and eligible["principal"] == meta["habilidades_principais"]
        stats = {s: {"estudantes": n, "eventos": e, "sequencias": q}
                 for s,n,e,q in db.execute("""SELECT e.split,count(DISTINCT e.uid),count(*),
                   (SELECT count(*) FROM seq WHERE split=e.split) FROM events e GROUP BY e.split""")}
        for split, row in stats.items():
            assert all(data["split"][split][k] == v for k,v in row.items())
        report = {"metodo": "SQLite e projeção direta do CSV, sem importar o pipeline",
                  "registros_brutos":raw_n,"eventos_verificados_na_fonte":valid_n,
                  "divergencias_eventos":mismatch,"exclusoes":expected_reason,
                  "sequencias_verificadas":sum(x["sequencias"] for x in stats.values()),
                  "intersecao_estudantes":0,"intersecao_eventos":0,
                  "amostra_estratificada":sample,"split":stats,
                  "habilidades_por_criterio":{k:len(v) for k,v in eligible.items()},
                  "status":"aprovado"}
    out.write_text(json.dumps(report, indent=2, ensure_ascii=False, sort_keys=True)+"\n",encoding="utf-8")
    print(json.dumps(report,ensure_ascii=False))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    for name in ("source","private","public","out"):
        parser.add_argument(name,type=Path)
    args = parser.parse_args()
    audit(args.source,args.private,args.public,args.out)
