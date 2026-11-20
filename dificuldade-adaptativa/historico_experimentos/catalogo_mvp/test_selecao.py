from collections import Counter
import json
import unittest

from selecionar import FILENAMES, OUT, choose, read_csv


class CatalogTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows = read_csv(OUT / "auditoria_todas_questoes.csv")
        cls.metrics = json.loads((OUT / "metricas.json").read_bytes())
        cls.matrix = json.loads((OUT / "matriz_codigos.json").read_bytes())["areas"]
        cls.evidence = json.loads((OUT / "evidencias.json").read_bytes())

    def test_every_item_in_exactly_one_group(self):
        total = [row for filename in FILENAMES.values() for row in read_csv(OUT / filename)]
        self.assertEqual(2971, len({r["id"] for r in self.rows}))
        self.assertEqual(2971, len(self.rows))
        self.assertCountEqual(total, self.rows)
        self.assertEqual(Counter(r["grupo"] for r in self.rows), self.metrics["grupos"])
        self.assertEqual(set(range(2009, 2025)), {int(r["ano"]) for r in self.rows})
        for group, filename in FILENAMES.items():
            self.assertEqual({group}, {r["grupo"] for r in read_csv(OUT / filename)})

    def test_priority_has_individual_evidence_and_valid_area_code(self):
        self.assertEqual({"CH", "CN", "LC", "MT"}, set(self.matrix))
        self.assertTrue(all(len(skills) == 30 for skills in self.matrix.values()))
        for row in read_csv(OUT / FILENAMES["A"]):
            skill = self.matrix[row["area"]][row["habilidade"]]
            self.assertEqual(skill["descritor_extraido"], row["descritor"])
            self.assertEqual(str(skill["competencia"]["numero"]), row["competencia"])
            self.assertEqual("confirmado_tabela", row["status_vinculo_habilidade"])
            self.assertEqual("parecer_direto_A", row["criterio"])
            self.assertEqual("0", row["assets_cadastrados"])
            self.assertEqual(["A", row["evidencia_textual"], row["parecer_tecnico"]], self.evidence[row["id"]])

    def test_restrictions_and_recoveries(self):
        admitted = [r for r in self.rows if r["grupo"] in {"A", "B"}]
        self.assertTrue(all(r["piloto_anterior"] == "True" for r in admitted))
        self.assertEqual(len(admitted), self.metrics["piloto_mantido"])
        self.assertEqual(1329, sum(r["piloto_anterior"] == "True" for r in self.rows))
        self.assertEqual([], read_csv(OUT / "questoes_recuperadas.csv"))
        self.assertEqual(0, self.metrics["recuperadas"])
        self.assertTrue(all(r["publicacao_requer_revisao"] == "True" for r in self.rows))
        for row in read_csv(OUT / FILENAMES["B"]):
            self.assertIn("conferir_texto_antes_de_exibir", row["restricao"])
            self.assertIn("nao_filtrar_por_assunto_ou_habilidade", row["restricao"])

    def test_coverage_and_missing_counts(self):
        expected = Counter((r["grupo"], r["area"], axis, r[axis] or "<ausente>")
                           for r in self.rows if r["grupo"] in {"A", "B"}
                           for axis in ("assunto_original", "habilidade", "ano", "particao"))
        actual = {(r["grupo"], r["area"], r["dimensao"], r["valor"]): int(r["n"])
                  for r in read_csv(OUT / "cobertura_para_recomendador.csv")}
        self.assertEqual(expected, actual)
        self.assertEqual(self.metrics["sem_assunto"], sum(not r["assunto_original"] for r in self.rows))
        self.assertEqual(self.metrics["sem_habilidade"], sum(not r["habilidade"] for r in self.rows))

    def test_precedence(self):
        self.assertEqual("D", choose(["essencial"], ["alerta"], "A", True))
        self.assertEqual("C", choose([], ["alerta"], "A", True))
        self.assertEqual("A", choose([], [], "A", True))
        self.assertEqual("B", choose([], [], "", True))
        self.assertEqual("C", choose([], [], "", False))
