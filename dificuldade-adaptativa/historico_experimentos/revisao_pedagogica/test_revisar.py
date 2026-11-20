import json
from pathlib import Path
import unittest

from revisar import OUT, read_csv, signals


class ReviewTests(unittest.TestCase):
    def test_unique_ids_and_preserved_labels(self):
        rows=read_csv(OUT/"catalogo_derivado.csv")
        self.assertEqual(len({r["id"] for r in rows}),2971)
        self.assertEqual(sum(not r["assunto_original"] for r in rows),560)
        self.assertEqual(sum(not r["habilidade_original"] for r in rows),192)
        self.assertTrue(all(r["certificada"]=="False" for r in rows))

    def test_sample_blind_and_priorities(self):
        rows=read_csv(OUT/"ficha_cega_300.csv")
        self.assertEqual(len({r["id"] for r in rows}),300)
        self.assertNotIn("assunto_original",rows[0])
        self.assertNotIn("gabarito",rows[0])
        self.assertLessEqual({r["id"] for r in read_csv(OUT/"prioridade_52.csv")},{r["id"] for r in rows})

    def test_lexical_signal_requires_area_and_preserves_scope(self):
        self.assertEqual(signals("MT","Calcule a variância.")[0][:2],
                         ("Probabilidade e estatística","Variância e desvio padrão"))
        self.assertEqual(signals("LC","Calcule a variância."),[])

    def test_provisional_subset_is_not_certified(self):
        m=json.loads((OUT/"metricas.json").read_bytes())
        rows=read_csv(OUT/"piloto_provisorio.csv")
        self.assertEqual(len(rows),m["piloto"])
        self.assertTrue(all(r["habilidade_status"]=="confirmado_tabela" and r["certificada"]=="False" for r in rows))
