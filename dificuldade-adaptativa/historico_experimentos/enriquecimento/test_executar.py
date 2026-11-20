import json
from pathlib import Path
import unittest

from executar import AREAS, audit, competence


class EnrichmentTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.base=Path("base-oficial/Dataset/base_trabalho")
        cls.catalog,cls.ids,cls.sidecar,cls.report,cls.taxonomy=audit(cls.base)

    def test_matrix_area_scoped(self):
        for area,limits in AREAS.items():
            self.assertEqual(competence(area,"H30"),len(limits))
            self.assertIsNone(competence(area,"H31"))
            self.assertIsNone(competence(area,None))
        self.assertNotEqual(competence("CH","H5"),competence("LC","H5"))

    def test_sidecar_and_original_integrity(self):
        self.assertEqual({r["id"] for r in self.sidecar},set(self.catalog))
        self.assertEqual(len(self.sidecar),2971)
        _,_,second,report,_=audit(self.base)
        self.assertEqual(second,self.sidecar)
        self.assertEqual(report["hashes"],self.report["hashes"])

    def test_unknowns_not_invented(self):
        for row in self.sidecar:
            self.assertIsNone(row["discipline"])
            if row["catalog_skill"] is None:
                self.assertIsNone(row["competence_from_catalog_skill"])
            self.assertTrue(0<=row["tri"]["c"]<=1)
        self.assertTrue(all(t["subtopics_inferred"] for t in self.taxonomy))

    def test_frozen_splits_and_labels(self):
        self.assertEqual([len(self.ids[s]) for s in ("train","validation","test")],[1801,136,126])
        self.assertEqual(len(set().union(*map(set,self.ids.values()))),2063)
        self.assertTrue(all(r["difficulty"] in (0,1,2) for r in self.sidecar))
