"""Fifteen required checks against official and controlled inputs."""
import csv
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

from src.carregar import load_sequences
from src.common import ROOT, config, digest, json_rows
from src.estatisticas import eligibility
from src.ingestao import FIELDS, records, verify
from src.limpeza import clean
from src.sequencias import build, pseudonym, sequences, split_students

CFG = config()


def sample(user="1", order="1", item="4", skill="9", original="1", correct="0",
           kind="algebra", action="0", opportunity="1"):
    return user, order, item, skill, original, correct, kind, action, opportunity


class Fase01(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = Path(os.environ["BKT_SOURCE"])
        cls.private = Path(os.environ["BKT_PRIVATE"])
        cls.public = Path(os.environ["BKT_PUBLIC"])
        cls.manifest = json.loads((cls.public / "manifesto_dados.json").read_bytes())
        cls.events = {s: list(json_rows(cls.private / f"eventos_{s}.jsonl"))
                      for s in ("treino", "validacao", "teste")}
        cls.seqs = {s: list(json_rows(cls.private / f"sequencias_{s}.jsonl")) for s in cls.events}

    def test_01_integridade(self):
        self.assertTrue(set(FIELDS).issubset(verify(self.source, CFG)))
        self.assertEqual(digest(self.source), CFG["source_sha256"])
        self.assertEqual(sum(1 for _ in records(self.source, CFG["source_encoding"])), 346860)
        with tempfile.TemporaryDirectory() as t:
            wrong = Path(t) / "wrong.csv"
            wrong.write_bytes(b"not the CSV")
            with self.assertRaises(ValueError):
                verify(wrong, CFG)

    def test_02_identificadores(self):
        for rows in self.events.values():
            self.assertTrue(all(e["student_id"].startswith("s_") and len(e["student_id"]) == 66 and
                e["item_id"].isascii() and e["item_id"].isdigit() and
                e["event_id"] == f"o_{e['event_order']}" and e["source_row"] > 0 for e in rows))
        self.assertEqual(clean([(1,sample(user="0")),(2,sample(order="x")),(3,sample(item=""))])[1],
                         [(1,"id_estudante_invalido"),(2,"ordem_invalida"),(3,"id_item_invalido")])

    def test_03_resultados(self):
        self.assertTrue(all(type(e["correct_first"]) is int and e["correct_first"] in (0,1)
                            for rows in self.events.values() for e in rows))
        self.assertEqual(clean([(1,sample(correct="2"))])[1], [(1,"rotulo_invalido")])

    def test_04_ordenacao(self):
        for rows in self.seqs.values():
            self.assertTrue(all(q["event_order"] == sorted(set(q["event_order"])) for q in rows))
        a = [(1,sample(order="10")), (2,sample(order="2"))]
        self.assertEqual(build(a,CFG,b"a"*32), build(a[::-1],CFG,b"a"*32))
        self.assertEqual(list(sequences(build(a,CFG,b"a"*32)))[0]["event_order"], [2,10])

    def test_05_duplicacoes(self):
        a = sample()
        k, rejected, _, _ = clean([(5,a),(2,a),(3,sample(order="2")),(4,sample(order="2",correct="1"))])
        self.assertEqual(k, [(2,a)])
        self.assertEqual(rejected, [(3,"evento_conflitante"),(4,"evento_conflitante"),(5,"duplicata_projetada")])
        all_ids = [e["event_id"] for rows in self.events.values() for e in rows]
        self.assertEqual(len(all_ids), len(set(all_ids)))

    def test_06_habilidades(self):
        _, rejected, _, _ = clean([(1,sample(skill="NA")),(2,sample(order="2",skill="9_10")),
                                   (3,sample(order="3",skill="-1"))])
        self.assertEqual(rejected,[(1,"habilidade_ausente"),(2,"habilidade_multipla"),(3,"habilidade_invalida")])
        self.assertEqual(len({e["skill_id"] for rows in self.events.values() for e in rows}),101)
        self.assertTrue(all(e["skill_id"].isascii() and e["skill_id"].isdigit()
                            for rows in self.events.values() for e in rows))

    def test_07_isolamento(self):
        memberships = {s: {e["student_id"] for e in rows} for s,rows in self.events.items()}
        self.assertEqual([len(g) for g in memberships.values()],[2802,601,600])
        self.assertEqual(sum(map(len,memberships.values())),len(set.union(*memberships.values())))
        ids = [str(i) for i in range(1,101)]
        split = split_students(ids,CFG["seed"])
        self.assertEqual(split_students(ids[::-1],CFG["seed"]),split)
        self.assertEqual(list(split.values()).count("treino"),70)

    def test_08_reprodutibilidade(self):
        other = Path(os.environ["BKT_REPRO_PUBLIC"])
        for n in ("manifesto_dados.json","habilidades.json"):
            self.assertEqual(digest(self.public/n),digest(other/n),n)

    def test_09_reconciliacao(self):
        excluded = self.manifest["exclusoes"]
        kept = sum(map(len,self.events.values()))
        self.assertEqual(sum(excluded.values()) + kept,self.manifest["brutos"]["registros"])
        self.assertEqual(kept,sum(q["length"] for r in self.seqs.values() for q in r))
        self.assertEqual(excluded["resposta_aberta_autocorrigida"],8)
        self.assertEqual(kept,214417)

    def test_10_sequencias(self):
        raw = [(1,sample(order="2",correct="1")), (2,sample(order="1")),
               (3,sample(order="3",user="2")), (4,sample(order="4",skill="10"))]
        by_pair = {(r["student_id"],r["skill_id"]): r for r in sequences(build(raw,CFG,b"a"*32))}
        self.assertEqual(len(by_pair),3)
        self.assertEqual(by_pair[pseudonym("1",b"a"*32,CFG["release"]),"9"]["correct_first"],[0,1])
        self.assertEqual(sum(q["length"] for q in by_pair.values()),4)

    def test_11_vazamento(self):
        baseline = eligibility(self.events["treino"], self.seqs["treino"], CFG["thresholds"])
        self.assertEqual([q["skill_id"] for q in baseline if q["principal"]],
                         self.manifest["habilidades_elegiveis"]["principal"])
        fake = dict(self.events["teste"][0],correct_first=1-self.events["teste"][0]["correct_first"])
        with self.assertRaisesRegex(ValueError,"exclusivamente o treino"):
            eligibility(self.events["treino"]+[fake],self.seqs["treino"],CFG["thresholds"])
        self.assertNotIn("rotulos",self.manifest["split"]["teste"])
        self.assertNotIn("rotulos",self.manifest["split"]["validacao"])

    def test_12_extremos(self):
        rows = [(1,sample()),(2,sample(user="2")),(3,sample(order="4",original="0")),
                (4,sample(order="5",kind="open_response")),(5,sample(order="7",action="?"))]
        kept,rejected,_,_ = clean(rows)
        self.assertEqual(rejected,[(1,"ordem_conflitante"),(2,"ordem_conflitante"),(3,"andaime"),
                                   (4,"resposta_aberta_autocorrigida")])
        e = build(kept,CFG,b"a"*32)[0]
        self.assertIsNone(e["aid_on_first_nullable"])
        self.assertIsNone(e["timestamp_utc_nullable"])
        self.assertEqual(list(sequences([e]))[0]["length"],1)
        with self.assertRaisesRegex(ValueError,"empatada"):
            list(sequences([e,e]))

    def test_13_compatibilidade(self):
        primary = set(self.manifest["habilidades_elegiveis"]["principal"])
        got = list(load_sequences(self.private))
        self.assertEqual({s["skill_id"] for s in got},primary)
        self.assertEqual(len(got),self.manifest["split"]["treino"]["sequencias_habilidades_principais"])
        self.assertTrue(all(s["split"]=="treino" for s in got))
        self.assertEqual(len(list(load_sequences(self.private,"validacao",False))),len(self.seqs["validacao"]))
        with self.assertRaises(ValueError):
            list(load_sequences(self.private,"externo"))
        with tempfile.TemporaryDirectory() as t:
            f = Path(t)
            (f/"manifesto_local.json").write_bytes((self.private/"manifesto_local.json").read_bytes())
            (f/"sequencias_treino.jsonl").write_text("{}\n")
            with self.assertRaisesRegex(ValueError,"alterado"):
                list(load_sequences(f))

    def test_14_rastreabilidade(self):
        picked = {}
        for rows in self.events.values():
            for e in rows[::max(1,len(rows)//15)]:
                picked[e["source_row"]]=e
        with self.source.open(encoding="latin-1",newline="") as f:
            for n,r in enumerate(csv.DictReader(f),1):
                if n in picked:
                    e = picked.pop(n)
                    self.assertEqual(e["student_id"],pseudonym(r["user_id"],(self.private/".chave_local").read_bytes(),CFG["release"]))
                    self.assertEqual((e["item_id"],e["skill_id"],e["event_order"],e["correct_first"]),
                        (r["problem_id"],r["skill_id"],int(r["order_id"]),int(r["correct"])))
        self.assertFalse(picked)

    def test_15_idempotencia(self):
        with tempfile.TemporaryDirectory(prefix="bkt-idempotencia-") as t:
            temp = Path(t)
            private,public = temp/"priv",temp/"pub"
            private.mkdir()
            (private/".chave_local").write_bytes((self.private/".chave_local").read_bytes())
            cmd = [sys.executable,"-B","-m","src.preparar","--source",str(self.source),
                   "--private",str(private),"--public",str(public)]
            for _ in range(2):
                process = subprocess.run(cmd,cwd=ROOT,check=True,capture_output=True,text=True,encoding="utf-8")
                print(process.stdout,flush=True)
                self.assertEqual({p.name:digest(p) for p in private.iterdir() if p.is_file()},
                                 {p.name:digest(p) for p in self.private.iterdir() if p.is_file()})
                for n in ("manifesto_dados.json","habilidades.json"):
                    self.assertEqual(digest(public/n),digest(self.public/n))
