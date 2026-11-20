import unittest

import numpy as np

from busca_autonoma import GRID, TEST, TUNE, advise, posterior, simulate
from teto_protocolo import ceiling


class SearchTests(unittest.TestCase):
    def test_distinct_seeds(self):
        self.assertTrue(set(TEST).isdisjoint(TUNE))

    def test_oracle_ceiling_respects_policy_limits(self):
        self.assertEqual(ceiling(0,1,2,"logistic"),1)
        self.assertLess(ceiling(8,4,1,"logistic"),ceiling(0,1,2,"logistic"))

    def test_difficulty_changes_posterior(self):
        easy = posterior([(0, 0)], 5)
        hard = posterior([(2, 0)], 5)
        self.assertLess(easy @ GRID, hard @ GRID)
        self.assertAlmostEqual(hard.sum(), 1)

    def test_recent_evidence_and_abstention(self):
        early = [(1, 0)] * 20
        later = [(1, 1)] * 5
        self.assertGreater(posterior(early+later,5) @ GRID, posterior(early+later,36) @ GRID)
        self.assertIsNone(advise(posterior(later,5),0,3,(5,4,2)))

    def test_closed_loop_needs_consent(self):
        config = {"candidate": (12,4,2)}
        fixed = simulate([307],"logistic",config)["candidate"]
        closed = simulate([307],"logistic",config,closed=True)["candidate"]
        self.assertEqual(fixed[:,7].sum(),0)
        self.assertGreater(closed[:,7].sum(),0)
        self.assertEqual(closed[:,8].sum(),0)
        self.assertEqual(fixed[:,8].sum(),0)


if __name__ == "__main__":
    unittest.main()
