import os
from pathlib import Path
import unittest

from bkt04.common import ROOT,load,sha,rows
from bkt04.canonico import fingerprint

AVAILABLE=bool(os.environ.get("BKT04_SOURCE") and os.environ.get("BKT04_WORK"))


@unittest.skipUnless(AVAILABLE,"BLOQUEADO: definir BKT04_SOURCE e BKT04_WORK com dados reais.")
class Data(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source=Path(os.environ["BKT04_SOURCE"])
        cls.work=Path(os.environ["BKT04_WORK"])
        cls.private=cls.work/"deterministic_alternative/private"

    def test_verified_source(self):
        cfg=load(ROOT/"references/preprocessing.json")
        self.assertEqual(self.source.stat().st_size,64412812)
        self.assertEqual(sha(self.source),cfg["source_sha256"])

    def test_keyless_event_and_sequence_equivalence(self):
        self.assertEqual(fingerprint(self.private),load(ROOT/"references/identidade_logica.json"))

    def test_train_only_skill_selection(self):
        expected=load(ROOT/"references/manifesto_dados_fase01.json")
        actual=load(self.work/"deterministic_alternative/public/manifesto_dados.json")
        self.assertEqual(expected,actual)
        self.assertEqual(len(actual["habilidades_elegiveis"]["principal"]),56)
        self.assertEqual(sum(actual["exclusoes"].values())+actual["eventos_validos"]["eventos"],346860)

    def test_student_isolation(self):
        group=list(rows(self.private/"estudantes.jsonl"))
        ids={s:{r["student_id"] for r in group if r["split"]==s} for s in ("treino","validacao","teste")}
        self.assertEqual([len(ids[s]) for s in ("treino","validacao","teste")],[2802,601,600])
        self.assertEqual(sum(map(len,ids.values())),len(set.union(*ids.values())))
