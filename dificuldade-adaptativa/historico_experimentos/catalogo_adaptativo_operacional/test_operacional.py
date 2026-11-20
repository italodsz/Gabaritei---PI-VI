from collections import Counter, defaultdict
import json
import unittest

import fitz

from gerar import A, F, HERE, ROOT, add_difficulty, official_row, official_tables, read_csv, read_json


class OperationalTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows = read_csv(HERE/"auditoria_por_questao.csv")
        cls.audit = {r["id"]:r for r in cls.rows}
        cls.ready = [json.loads(l) for l in (HERE/"catalogo_adaptativo_pronto.jsonl").read_bytes().splitlines()]
        cls.source = {r["id"]:r for r in map(json.loads,(
            ROOT/"base-oficial/Dataset/base_trabalho/data/questions.jsonl").read_bytes().splitlines())}
        cls.metrics = read_json(HERE/"metricas.json")

    def test_partition_exhaustive(self):
        self.assertEqual(2971,len(self.rows))
        self.assertEqual(set(self.source),set(self.audit))
        groups = [self.ready,read_csv(HERE/"catalogo_adaptativo_condicional.csv"),
                  read_csv(HERE/"catalogo_bloqueado.csv")]
        self.assertCountEqual([r["id"] for group in groups for r in group],self.source.keys())
        self.assertEqual(Counter(r["status_final"] for r in self.rows),self.metrics["classes"])
        self.assertTrue(all(r["pode_exibir"]=="False" for group in groups[1:] for r in group))

    def test_rubric_and_gates(self):
        for r in self.rows:
            status = [r[f"c{i}_status"] for i in range(1,7)]
            self.assertEqual(status.count(A),int(r["nota_0_6"]))
            self.assertEqual(all(x==A for x in status[:4]),r["apta_exibicao_correcao"]=="True")
            self.assertEqual(any(x==F for x in status[:4]),r["status_final"]=="BLOQUEADA")
            if status[4]!=A:
                self.assertFalse(r["habilidade_usavel"] or r["assunto_usavel"])
        notes = Counter(r["nota_0_6"] for r in self.rows)
        self.assertEqual(self.metrics["notas"],{str(n):notes[str(n)] for n in range(7)})

    def test_presentation_has_content_official_answer_and_files(self):
        tables,_ = official_tables(ROOT)
        self.assertEqual(len(self.ready),len(read_csv(HERE/"catalogo_adaptativo_pronto.csv")))
        for r in self.ready:
            self.assertTrue(r["enunciado"].strip())
            self.assertEqual("ABCDE","".join(o["label"] for o in r["alternativas"]))
            self.assertTrue(all(o["text"].strip() for o in r["alternativas"]))
            official = official_row(tables,self.source[r["id"]])
            self.assertEqual(official["TX_GABARITO"],r["gabarito"])
            for p in r["recursos"]:
                image = fitz.Pixmap(HERE/p)
                self.assertGreater(image.width,200)
                self.assertGreater(image.height,100)

    def test_canonical_and_difficulty_scope(self):
        self.assertEqual(len(self.ready),len({r["grupo_variantes"] for r in self.ready}))
        cohorts = defaultdict(list)
        for r in self.ready:
            if not r["apta_selecao_adaptativa"]:
                self.assertFalse(r["nivel_dificuldade"])
                continue
            self.assertEqual(f'{r["ano"]}/{r["co_prova"]}/{r["area"]}',r["escala_operacional"])
            a = self.audit[r["id"]]
            self.assertEqual(A,a["c6_status"])
            self.assertFalse(a["tri_alerta"])
            cohorts[r["escala_operacional"]].append(r)
        for group in cohorts.values():
            self.assertGreaterEqual(len(group),9)
            self.assertEqual(3,len({r["nivel_dificuldade"] for r in group}))
        self.assertEqual(sum(map(len,cohorts.values())),self.metrics["prontas_adaptativo"])

    def test_difficulty_keeps_small_or_tied_cohort_out(self):
        records = [{"id":str(i),"ano":2024,"area":"CN","co_prova":1,"c6_status":A,
                    "tri_alerta":"","tri_b":0.1,"apta_exibicao_correcao":True,
                    "apta_selecao_adaptativa":False} for i in range(9)]
        add_difficulty(records)
        self.assertTrue(all(not r["apta_selecao_adaptativa"] for r in records))

    def test_visual_repairs_and_existing_recoveries(self):
        rows = {r["id"]:r for r in self.ready}
        self.assertIn("10⁻³",rows["gq_23f08c13463322047535c93a"]["enunciado"])
        self.assertIn("2/3",rows["gq_e08a615b6d728e7dbfaf1b64"]["enunciado"])
        self.assertTrue(rows["gq_29b02702604175cb29267886"]["recursos"])
        self.assertTrue(rows["gq_d729403b0e500b7ef02bef0a"]["recursos"])
        self.assertNotIn("gq_1bf495a5eda4568d0ea676d2",rows)
