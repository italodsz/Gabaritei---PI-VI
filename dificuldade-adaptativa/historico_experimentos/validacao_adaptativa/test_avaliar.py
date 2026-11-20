import csv
from pathlib import Path
import unittest

from avaliar import METHODS, Session, oracle, trajectory


class AdaptiveTests(unittest.TestCase):
    def test_sparse_and_manual_choice(self):
        for method in METHODS:
            for level in range(3):
                session = Session(level)
                for n, answer in enumerate([1,0,1,0,1,0,1]):
                    with self.subTest(method=method, level=level, n=n):
                        advice = session.advise("MT:a",method)
                        self.assertIsNone(advice["estimated"])
                        self.assertIsNone(advice["recommended"])
                        self.assertEqual(advice["effective"],level)
                    session.record(n,"MT:a",level,answer)

    def test_repetition_is_not_learning(self):
        for method in METHODS:
            session = Session(2)
            session.record("x","MT:a",2,0)
            before = session.estimate("MT:a",method)
            for _ in range(30):
                self.assertFalse(session.record("x","MT:a",0,1))
            self.assertFalse(session.record("y",None,0,1))
            self.assertFalse(session.record("z","MT:a",0,None))
            self.assertEqual(session.estimate("MT:a",method),before)
            self.assertEqual(len(session.history),1)

    def test_autonomy_accept_decline_and_reselect(self):
        for initial, answer, expected in [(0,1,1),(2,0,1)]:
            session = Session(initial)
            for i in range(12):
                session.record(i,"MT:a",initial,answer)
            advice = session.advise("MT:a","taxa")
            self.assertEqual(advice["recommended"],expected)
            self.assertEqual(advice["effective"],initial)
            session.respond(advice,False)
            self.assertEqual(session.selected,initial)
            self.assertIsNone(session.advise("MT:a","taxa")["recommended"])
            session.respond(advice,True)
            self.assertEqual(session.selected,expected)
            for level in (0,2,1):
                session.choose(level)
                self.assertEqual(session.selected,level)
            self.assertEqual(len(session.history),12)

    def test_difficulty_skill_and_order_are_distinct(self):
        a,b = Session(1),Session(1)
        for i, y in enumerate([1,1,0,0]):
            a.record(i,"MT:a",2,y)
            b.record(i,"MT:a",0,1-y)
        self.assertNotEqual(a.estimate("MT:a","elo"),b.estimate("MT:a","elo"))
        self.assertNotEqual(a.estimate("MT:a","bkt"),b.estimate("MT:a","bkt"))
        self.assertEqual(a.estimate("MT:b","hibrido")[1],0)
        before = a.estimate("MT:a","hibrido")
        a.record(9,"LC:a",1,1)
        self.assertEqual(a.estimate("MT:a","hibrido"),before)
        self.assertLess(oracle(-2),oracle(2))

    def test_no_candidates_does_not_change_preference(self):
        s = Session(2)
        for i in range(8):
            s.record(i,"MT:a",2,0)
        advice=s.advise("MT:a","taxa",(0,))
        self.assertIsNone(advice["recommended"])
        self.assertEqual(advice["candidate_levels"],[])
        self.assertEqual(advice["effective"],2)

    def test_long_history_and_replay(self):
        a,b = Session(1),Session(1)
        for i in range(200):
            a.record(i,"MT:a",i%3,i%2)
        for i,event in a.history.items():
            b.record(i,*event)
        self.assertEqual(a.estimate("MT:a","hibrido"),b.estimate("MT:a","hibrido"))

    def test_synthetic_oracle_covers_maintain_progress_and_decline(self):
        for profile, direction in [("progressivo",1),("rapido",1),("queda",-1),("queda_gradual",-1),
                                   ("estavel_facil",0),("estavel_medio",0),("estavel_dificil",0)]:
            with self.subTest(profile=profile):
                first,last = [oracle(trajectory(profile,t,"MT:algebra")) for t in (0,35)]
                self.assertEqual((last>first)-(last<first),direction)


if __name__ == "__main__":
    unittest.main()
