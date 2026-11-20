import math,tempfile,unittest
from pathlib import Path
from bkt04.enem import item_level,register_area_response
from bkt04.motor import Motor

class Delivery(unittest.TestCase):
    def label(self,b,**changes):
        args=dict(area="MT",cutoffs=[.8,1.5],version="fixture",scale_id="MT-2020",expected_scale_id="MT-2020");args.update(changes)
        return item_level(b,**args)
    def test_tri_boundaries(self):
        for b,expected in [(.79,"facil"),(.8,"facil"),(.800001,"media"),(1.5,"media"),(1.500001,"dificil")]:
            self.assertEqual(self.label(b)["level"],expected)
    def test_tri_scale_conflict(self):
        with self.assertRaises(ValueError):self.label(.5,scale_id="CN-2024")
    def test_tri_missing_invalid(self):
        for b in (None,True,"0.5",math.nan,math.inf):
            with self.assertRaises(ValueError):self.label(b)
    def test_tri_invalid_config(self):
        for delta in ({"cutoffs":[.8,.8]},{"cutoffs":[.8,math.nan]},{"version":""},{"area":"Fisica"}):
            with self.assertRaises(ValueError):self.label(.4,**delta)
    def test_area_isolation_and_enem_fallback(self):
        with tempfile.TemporaryDirectory() as d:
            m=Motor(Path(d)/"state.sqlite")
            r=register_area_response(m,student_id="aluno",area="MT",attempt_id="t1",correct=1,event_order=1,inventory={"facil":1,"media":1,"dificil":1})
            self.assertIsNone(r["mastery_updated"])
            self.assertEqual(r["strategy"],"historico_suavizado")
            self.assertIsNone(m.inspect("aluno","enem:CN","area"))
            self.assertEqual(Motor(Path(d)/"state.sqlite").inspect("aluno","enem:MT","area")["total"],1)
    def test_area_does_not_alias_external_skill(self):
        with tempfile.TemporaryDirectory() as d:
            m=Motor(Path(d)/"state.sqlite")
            for a in ("MT","CN","CH","LC"):
                r=register_area_response(m,student_id="a",area=a,attempt_id="t-"+a,correct=0,event_order=1,inventory={"facil":0,"media":0,"dificil":0})
                self.assertEqual(r["eligibility"],"fallback_required")
                self.assertIn("mapeamento_ENEM_nao_validado",r["eligibility_reasons"])
    def test_area_invalid(self):
        with self.assertRaises(ValueError):register_area_response(None,student_id="a",area="H1",attempt_id="t",correct=1,event_order=1,inventory={})
