import csv
import json
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parent


def rows(name):
    with (ROOT/name).open(encoding="utf-8-sig",newline="") as f:
        return list(csv.DictReader(f,delimiter=";"))


class AuditTests(unittest.TestCase):
    def test_catalog_and_validation_scope(self):
        catalog=rows("completude.csv")
        val=rows("validacao_pareada.csv")
        self.assertEqual(len({r["id"] for r in catalog}),2971)
        self.assertEqual(len(val),136)
        self.assertEqual({r["ano"] for r in val},{"2023"})
        self.assertEqual(sum(r["status_assunto"]=="ausente" for r in catalog),560)
        self.assertEqual(sum(r["status_habilidade"]=="ausente" for r in catalog),192)

    def test_error_partitions(self):
        middle=rows("classe_media.csv")
        severe=rows("erros_graves.csv")
        self.assertEqual(len(middle),42)
        self.assertEqual(sum(r["bert_correct"]=="True" for r in middle),8)
        self.assertEqual(len(severe),16)
        self.assertTrue(all(r["bert_truncated"]=="False" for r in severe))

    def test_coverage_not_claimed_as_official_validation(self):
        j=json.loads((ROOT/"resultados.json").read_bytes())
        self.assertEqual(len(j["ambos_erram"])+len(j["ambos_acertam"])+len(j["so_um_acerta"]),136)
        self.assertEqual(j["truncamento"]["minilm"]["truncated"],110)
