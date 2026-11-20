import unittest

from rodada import Estimator, Policy


class Tests(unittest.TestCase):
    def test_hard_error_is_weaker_evidence(self):
        easy, hard = Estimator(), Estimator()
        easy.record("e","f","a",-1.6,0)
        hard.record("h","f","a",.8,0)
        for method in ("bkt_item","elo_item","rasch","hibrido_item"):
            self.assertLess(easy.predict("a",method,0),hard.predict("a",method,0))
            self.assertEqual(easy.predict("b",method,0),hard.predict("b",method,0))

    def test_family_repetition_and_same_answer_different_item(self):
        m=Estimator()
        m.record("1","f","a",.8,1)
        before=m.predict("a","rasch",0)
        self.assertFalse(m.record("2","f","a",-1.6,0))
        self.assertEqual(m.predict("a","rasch",0),before)
        self.assertTrue(m.record("2","g","a",-1.6,0))
        self.assertLess(m.predict("a","rasch",0),before)

    def test_abstention_and_autonomy(self):
        p=Policy(2,"persistencia")
        self.assertIsNone(p.offer("a",7,0))
        self.assertIsNone(p.offer("a",7,0))
        offer=p.offer("a",8,0)
        self.assertEqual(offer,1)
        p.respond(offer,False)
        self.assertEqual(p.selected,2)
        p.respond(offer,True)
        self.assertEqual(p.selected,1)
        self.assertIsNone(p.offer("a",9,0))
        self.assertIsNone(p.offer("a",15,1))

    def test_pre_answer_predictions_and_sequence(self):
        a,b=Estimator(),Estimator()
        self.assertEqual(a.predict("a","bkt_item",.8),b.predict("a","bkt_item",.8))
        for i,y in enumerate([1,0,1,0]):
            a.record(i,i,"a",.8,y)
            b.record(i,i,"a",.8,1-y)
        self.assertNotEqual(a.predict("a","bkt_item",.8),b.predict("a","bkt_item",.8))
