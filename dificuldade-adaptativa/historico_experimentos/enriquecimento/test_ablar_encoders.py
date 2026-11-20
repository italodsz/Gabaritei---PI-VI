import json
from pathlib import Path
import unittest


class EncoderEvidenceTests(unittest.TestCase):
    def test_confusion_counts_and_reconstruction(self):
        path=Path(__file__).with_name("ablacao_encoders.json")
        report=json.loads(path.read_bytes())
        entries=[report["bert_checkpoint"]]
        for name in ("bert_ajustado","bert_congelado","minilm_congelado","minilm_ajustado"):
            self.assertEqual(set(report[name]),{"A_texto","B_assunto","C_habilidade"})
            entries.extend(report[name].values())
        for entry in entries:
            matrix=entry["confusion"]
            self.assertEqual([sum(row) for row in matrix],[54,42,40])
            self.assertAlmostEqual(sum(matrix[i][i] for i in range(3))/136,entry["accuracy"])
        self.assertAlmostEqual(report["minilm_congelado"]["A_texto"]["macro_f1"],.4709829215853312)
