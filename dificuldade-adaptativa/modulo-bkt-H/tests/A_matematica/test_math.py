import math
import unittest
from bkt04.inferencia import step,trace
from bkt04.politica import suggest

P={"L0":.25,"T":.1,"G":.2,"S":.1}
CFG={"minimum_observations":5,"cooldown":5,"thresholds":[.4,.8],"margin":.05}
STOCK={"facil":3,"media":3,"dificil":3}


class Math(unittest.TestCase):
    def test_prediction_before_response(self):
        self.assertEqual(step(.25,0,P)["predicted_correct"],.375)
        self.assertEqual(step(.25,1,P)["predicted_correct"],.375)

    def test_bayes_correct(self):
        r=step(.25,1,P)
        self.assertAlmostEqual(r["mastery_posterior"],.6,14)
        self.assertAlmostEqual(r["mastery_updated"],.64,14)

    def test_bayes_error(self):
        r=step(.25,0,P)
        self.assertAlmostEqual(r["mastery_posterior"],.04,14)
        self.assertAlmostEqual(r["mastery_updated"],.136,14)

    def test_future_does_not_change_prediction(self):
        a=trace([0,1,1],P)
        b=trace([0,0,0],P)
        self.assertEqual(a[1]["predicted_correct"],b[1]["predicted_correct"])
        self.assertNotEqual(a[2]["predicted_correct"],b[2]["predicted_correct"])

    def test_determinism_and_reset(self):
        self.assertEqual(trace([1,0],P),trace([1,0],P))
        self.assertEqual(trace([1],P)[0],trace([1,0],P)[0])

    def test_limits_and_invalid(self):
        p={"L0":.9999,"T":.0001,"G":.3,"S":.0001}
        self.assertEqual(step(1.,0,p)["mastery_updated"],1.)
        self.assertTrue(all(0<=r["mastery_updated"]<=1 for r in trace([0,1]*1000,p)))
        for y in (True,2,-1,.0,None):
            with self.assertRaises(ValueError):
                step(.5,y,P)
        for m in (True,float("nan"),float("inf"),-.1,1.1):
            with self.assertRaises(ValueError):
                step(m,1,P)

    def test_insufficient_data_abstains(self):
        self.assertIsNone(suggest(.99,4,"media",STOCK,CFG)["suggested"])

    def test_stock_and_choice(self):
        r=suggest(.1,5,"media",{"facil":0,"media":3,"dificil":3},CFG)
        self.assertEqual(r["reason"],"faixa_sem_estoque")
        self.assertEqual(r["choice"],"media")
        self.assertEqual(suggest(.99,5,"media",STOCK,CFG)["suggested"],"dificil")

    def test_cooldown(self):
        self.assertEqual(suggest(.99,8,"media",STOCK,CFG,5,8)["reason"],"aguardar_intervalo")
