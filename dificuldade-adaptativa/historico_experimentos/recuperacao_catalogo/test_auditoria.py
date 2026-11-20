from collections import Counter, defaultdict
import json
import unittest

from auditar import FAIL, FLAGS, HERE, PASS, TASK, WAIT, group_items, read_csv


class AuditTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows = read_csv(HERE / "catalogo_elegibilidade.csv")
        cls.by_id = {r["id"]: r for r in cls.rows}
        cls.metrics = json.loads((HERE / "metricas.json").read_bytes())

    def test_rubric_and_count(self):
        self.assertEqual(2971, len(self.rows))
        self.assertEqual(len(self.rows), len(self.by_id))
        for r in self.rows:
            counts = Counter(r[f"c{k}_status"] for k in range(1, 7))
            self.assertEqual(set(counts) - {PASS, FAIL, WAIT}, set())
            self.assertEqual([counts[PASS], counts[WAIT], counts[FAIL]],
                             [int(r[k]) for k in ("nota_0a6", "n_pendentes", "n_reprovados")])
            self.assertIn(int(r["nota_0a6"]), range(7))
            self.assertTrue(all(r[f"c{k}_evidencia"] and r[f"c{k}_metodo"] for k in range(1, 7)))
        notes = read_csv(HERE / "distribuicao_notas.csv")
        self.assertEqual(Counter(r["nota_0a6"] for r in self.rows),
                         Counter({n["nota"]: int(n["n"]) for n in notes}))
        totals = Counter()
        for r in read_csv(HERE / "painel_criterios.csv"):
            totals[r["criterio"]] += int(r["n"])
        self.assertEqual({f"C{k}": 2971 for k in range(1, 7)}, totals)
        for flag in FLAGS:
            self.assertEqual(sum(int(n[flag]) for n in notes), self.metrics["aptidao"][flag])

    def test_eligibility_is_not_score_and_no_critical_display(self):
        three = {r[FLAGS[0]] for r in self.rows if r["nota_0a6"] == "3"}
        self.assertEqual({"True", "False"}, three)
        for r in self.rows:
            if r["apto_recomendacao"] == "True":
                self.assertEqual((r["c1_status"], r["c6_status"]), (PASS, PASS))
                self.assertFalse(r["falhas_criticas"])
                self.assertEqual(r["gabarito"], r["gabarito_tabela"])
            if r["apto_demo"] == "True":
                self.assertEqual("True", r["apto_recomendacao"])

    def test_exports_have_unique_ids_and_valid_answers_and_targets(self):
        for stem, flag in (("conjunto_texto_semantico", FLAGS[0]), ("conjunto_recomendacao", FLAGS[2])):
            rows = [json.loads(line) for line in (HERE / (stem + ".jsonl")).read_bytes().splitlines()]
            expected = {r["id"] for r in self.rows if r[flag] == "True"}
            self.assertEqual(len(expected), len(rows))
            self.assertEqual(expected, {r["id"] for r in rows})
            self.assertEqual(expected, {r["id"] for r in read_csv(HERE / (stem + ".csv"))})
            for r in rows:
                if flag == FLAGS[0]:
                    self.assertNotIn("gabarito", r)
                    self.assertEqual(r["classe_alvo_separada"], r["area"])
                    self.assertEqual(r["tarefa_alvo"], TASK)
                    self.assertTrue(r["texto_entrada"].strip())
                else:
                    self.assertEqual(set("ABCDE"), {o["label"] for o in r["alternativas"]})
                    self.assertTrue(all(o["text"] for o in r["alternativas"]))
                    self.assertIn(r["gabarito"], set("ABCDE"))
                    for path in r["recursos"]:
                        self.assertTrue((HERE / path).is_file())

    def test_no_detected_duplicate_crosses_new_splits(self):
        groups = defaultdict(set)
        for r in self.rows:
            if r["split_proposto"] not in {"fora", "quarentena_entre_edicoes"}:
                groups[r["grupo_duplicatas"]].add(r["split_proposto"])
                self.assertEqual(r["id"], r["representante"])
                self.assertEqual("test" if r["ano"] == "2024" else
                                 "validation" if r["ano"] == "2023" else "train", r["split_proposto"])
        self.assertTrue(all(len(splits) == 1 for splits in groups.values()))
        self.assertEqual(sum(self.metrics["splits_textuais"].values()), len(groups))

    def test_grouping_catches_cross_year_near_duplicate(self):
        base = " ".join(f"palavra{n}" for n in range(45))
        inputs = [{"id":i,"question":text,"co_item":i,"family_id":i,"content_family_id":i,"year":y}
                  for i,text,y in (("a",base,2018),("b",base+" adicional",2024))]
        groups, near, _ = group_items(inputs)
        self.assertEqual(groups["a"], groups["b"])
        self.assertEqual(len(near), 1)

    def test_source_based_recoveries(self):
        chart = self.by_id["gq_d729403b0e500b7ef02bef0a"]
        table = self.by_id["gq_29b02702604175cb29267886"]
        self.assertEqual(("D", "True", "False"), tuple(chart[k] for k in ("grupo_anterior", FLAGS[2], FLAGS[0])))
        self.assertEqual(("D", "True", "False"), tuple(table[k] for k in ("grupo_anterior", FLAGS[2], FLAGS[3])))
        self.assertEqual("False", self.by_id["gq_1bf495a5eda4568d0ea676d2"][FLAGS[2]])
