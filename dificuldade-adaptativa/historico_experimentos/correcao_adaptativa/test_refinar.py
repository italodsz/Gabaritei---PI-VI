import unittest

import numpy as np

from busca_autonoma import metrics, simulate
from refinar import BASE, CANDIDATES, TEST, TUNE, audit


class RefinementTests(unittest.TestCase):
    def test_history_and_archives(self):
        self.assertTrue(set(TUNE).isdisjoint(TEST))
        self.assertEqual(len(audit()), 2)

    def test_metrics_denominators(self):
        row = np.array([[12,4,6,2,10,18,9,3,0,4,1,1]])
        result = metrics(row)
        self.assertAlmostEqual(result["offer_precision"], 4/6)
        self.assertAlmostEqual(result["false_change"], 2/10)
        self.assertAlmostEqual(result["no_offer_rate"], 30/36)
        self.assertEqual(result["student_coverage"], 1)

    def test_reproducibility_and_consent(self):
        variants={**BASE,"bkt_politica_hibrida":CANDIDATES["bkt_politica_hibrida"]}
        a=simulate([101],"3pl",variants,True)
        b=simulate([101],"3pl",variants,True)
        for k in variants:
            np.testing.assert_array_equal(a[k],b[k])
            self.assertEqual(metrics(a[k])["violations"],0)
