from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import sqlite3
from contextlib import closing
import tempfile
import unittest
from unittest.mock import patch

from bkt04.common import ROOT,load
from bkt04.motor import Motor
from bkt04.adaptador import register_correction

NS="assistments_2009_2010"
STOCK={"facil":5,"media":5,"dificil":5}


class Engine(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.db=Path(self.tmp.name)/"state.sqlite"
        self.motor=Motor(self.db)
        gate=load(ROOT/"models/elegibilidade_integracao.json")["skills"]
        self.skill=next(k for k,v in gate.items() if v["eligible_for_experimental_difficulty"])

    def tearDown(self):
        self.tmp.cleanup()

    def respond(self,order=1,attempt="a1",correct=1,student="s1",skill=None,namespace=NS,stock=None):
        return self.motor.respond(student,namespace,skill or self.skill,attempt,correct,order,stock or STOCK)

    def test_state_persists_restart(self):
        first=self.respond()
        other=Motor(self.db)
        self.assertEqual(other.inspect("s1",NS,self.skill)["mastery"],first["mastery_updated"])
        self.assertEqual(other.respond("s1",NS,self.skill,"a2",0,2,STOCK)["mastery_before"],first["mastery_updated"])

    def test_idempotency(self):
        a=self.respond()
        b=self.respond()
        self.assertEqual(a,b)
        self.assertEqual(self.motor.inspect("s1",NS,self.skill)["total"],1)

    def test_idempotency_conflict(self):
        self.respond()
        with self.assertRaises(ValueError):
            self.respond(correct=0)
        self.assertEqual(self.motor.inspect("s1",NS,self.skill)["correct"],1)

    def test_cross_student_collision_rejected(self):
        self.respond()
        with self.assertRaises(ValueError):
            self.respond(student="s2")
        self.assertIsNone(self.motor.inspect("s2",NS,self.skill))

    def test_order_guard(self):
        self.respond(order=5)
        before=self.motor.inspect("s1",NS,self.skill)
        with self.assertRaises(ValueError):
            self.respond(order=4,attempt="late")
        self.assertEqual(before,self.motor.inspect("s1",NS,self.skill))

    def test_isolation_namespace(self):
        a=self.respond()
        b=self.respond(student="s2",attempt="b1")
        self.assertEqual(a["mastery_before"],b["mastery_before"])
        e=self.respond(namespace="enem:MT",skill=self.skill,attempt="enem1")
        self.assertEqual(e["strategy"],"historico_suavizado")
        self.assertIsNone(e["mastery_updated"])
        self.assertEqual(self.motor.inspect("s1",NS,self.skill)["total"],1)

    def test_blocked_skills_use_fallback(self):
        for i,k in enumerate(("51","84","50","58","308","16","91","307","322","323")):
            r=self.respond(skill=k,attempt="blocked"+str(i))
            self.assertEqual(r["strategy"],"historico_suavizado")
            self.assertIsNone(r["mastery_updated"])

    def test_unknown_skill_uses_fallback(self):
        r=self.respond(skill="999999",attempt="unknown")
        self.assertEqual(r["strategy"],"historico_suavizado")
        self.assertEqual(r["predicted_correct"],.5)

    def test_transaction_rolls_back(self):
        with patch.object(self.motor,"write_receipt",side_effect=RuntimeError("injected failure")):
            with self.assertRaises(RuntimeError):
                self.respond()
        self.assertIsNone(self.motor.inspect("s1",NS,self.skill))
        r=self.respond()
        self.assertEqual(r["evidence_count"],1)

    def test_concurrency_same_attempt(self):
        with ThreadPoolExecutor(max_workers=8) as pool:
            results=list(pool.map(lambda _:self.respond(),range(16)))
        self.assertTrue(all(r==results[0] for r in results))
        self.assertEqual(self.motor.inspect("s1",NS,self.skill)["total"],1)
        with closing(sqlite3.connect(self.db)) as conn:
            self.assertEqual(conn.execute("SELECT count(*) FROM receipts").fetchone()[0],1)

    def test_invalid_inputs_leave_no_state(self):
        for value in (True,2,-1,.0,None):
            with self.assertRaises(ValueError):
                self.respond(correct=value)
        self.assertIsNone(self.motor.inspect("s1",NS,self.skill))
        with self.assertRaises(ValueError):
            self.respond(stock={"facil":-1,"media":2,"dificil":2})

    def test_model_version_isolates_state(self):
        self.respond()
        changed=dict(self.motor.policy,version="new")
        next_version=Motor(self.db,policy=changed)
        self.assertNotEqual(next_version.version,self.motor.version)
        self.assertIsNone(next_version.inspect("s1",NS,self.skill))
        r=next_version.respond("s1",NS,self.skill,"new-v1",1,1,STOCK)
        self.assertEqual(r["evidence_count"],1)

    def test_manual_choice_is_preserved(self):
        self.motor.choose_level("s1",NS,self.skill,"facil","manual1")
        for i in range(1,12):
            r=self.respond(order=i,attempt=f"r{i}")
            self.assertEqual(r["recommendation"]["choice"],"facil")
        self.assertEqual(self.motor.inspect("s1",NS,self.skill)["choice"],"facil")

    def offered(self):
        for i in range(1,25):
            r=self.respond(order=i,attempt=f"offer{i}")
            if r["recommendation"]["offer_id"]:
                return r
        self.fail("Fixture não produziu oferta.")

    def test_explicit_acceptance_and_replay(self):
        r=self.offered()
        offer=r["recommendation"]["offer_id"]
        self.assertEqual(self.motor.inspect("s1",NS,self.skill)["choice"],"media")
        accepted=self.motor.resolve_offer("s1",offer,True)
        self.assertEqual(accepted,self.motor.resolve_offer("s1",offer,True))
        self.assertEqual(self.motor.inspect("s1",NS,self.skill)["choice"],r["recommendation"]["suggested"])

    def test_cross_user_accept_rejected(self):
        r=self.offered()
        with self.assertRaises(ValueError):
            self.motor.resolve_offer("s2",r["recommendation"]["offer_id"],True)
        self.assertEqual(self.motor.inspect("s1",NS,self.skill)["choice"],"media")

    def test_stale_offer_rejected(self):
        r=self.offered()
        self.respond(order=100,attempt="newer")
        with self.assertRaises(ValueError):
            self.motor.resolve_offer("s1",r["recommendation"]["offer_id"],True)

    def test_decline_preserves_choice(self):
        r=self.offered()
        resolved=self.motor.resolve_offer("s1",r["recommendation"]["offer_id"],False)
        self.assertFalse(resolved["accepted"])
        self.assertEqual(self.motor.inspect("s1",NS,self.skill)["choice"],"media")

    def test_confirmed_frontend_contract_adapter(self):
        submission={"questaoId":"demo-question","letra":"A","modo":"livre","sessaoId":None,
                    "recomendacaoId":None,"chaveIdempotencia":"frontend1"}
        question={"id":"demo-question","skill_namespace":NS,"skill_id":self.skill}
        correction={"tentativaId":"frontend1","correta":True}
        r=register_correction(self.motor,"demo-student",submission,question,correction,1,STOCK)
        self.assertEqual(r["strategy"],"bkt")
        self.assertEqual(r["attempt_id"],"frontend1")
        self.assertEqual(self.motor.inspect("demo-student",NS,self.skill)["correct"],1)
        with self.assertRaises(ValueError):
            register_correction(self.motor,"demo-student",submission,{"id":"wrong"},correction,2,STOCK)

    def test_server_attempt_id_independent_from_client_key(self):
        submission={"questaoId":"demo-question","letra":"B","modo":"livre","sessaoId":None,
                    "recomendacaoId":None,"chaveIdempotencia":"client-key"}
        question={"id":"demo-question","skill_namespace":NS,"skill_id":self.skill}
        correction={"tentativaId":"server-attempt","correta":True}
        r=register_correction(self.motor,"demo-student",submission,question,correction,1,STOCK)
        self.assertEqual(r["attempt_id"],"server-attempt")

    def test_invalid_model_rejected_before_state(self):
        models=load(ROOT/"models/parametros_originais.json")["skills"]
        models[self.skill]["parameters"]["S"]=float("nan")
        with self.assertRaises(ValueError):
            Motor(Path(self.tmp.name)/"invalid.sqlite",models=models)

    def test_cooldown_counts_responses_not_order_id_distance(self):
        first=self.offered()
        for offset in range(1,5):
            r=self.respond(order=first["event_order"]+1000*offset,attempt=f"gap-{offset}")
            self.assertIsNone(r["recommendation"]["offer_id"])
            self.assertEqual(r["recommendation"]["reason"],"aguardar_intervalo")

    def test_legacy_state_migration_retains_offer_count(self):
        first=self.offered()
        before=self.motor.inspect("s1",NS,self.skill)
        with closing(sqlite3.connect(self.db)) as conn:
            conn.execute("ALTER TABLE states DROP COLUMN last_offer_count")
            conn.commit()
        restarted=Motor(self.db)
        after=restarted.inspect("s1",NS,self.skill)
        self.assertEqual(after["mastery"],before["mastery"])
        self.assertEqual(after["total"],before["total"])
        self.assertEqual(after["last_offer_count"],before["total"])
        r=restarted.respond("s1",NS,self.skill,"after-migration",1,10000,STOCK)
        self.assertEqual(r["recommendation"]["reason"],"aguardar_intervalo")
