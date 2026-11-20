import json
from pathlib import Path
import unittest

from auditar import compare

ROOT=Path(__file__).resolve().parent


class EvidenceTests(unittest.TestCase):
    def test_join_requires_identity_answer_and_parameters(self):
        item={"co_item":"1","area":"MT","answer":"A","tri":{"a":1.,"b":2.,"c":.2},
              "official_reference":{"source_file":"ITENS.csv","co_prova":2,"position":3}}
        row={"TX_GABARITO":"A","NU_PARAM_A":"1","NU_PARAM_B":"2","NU_PARAM_C":"0.2","CO_HABILIDADE":"2"}
        key=("ITENS.CSV","1","2","3","MT")
        self.assertEqual(compare({key:[row]},item),("conferida_tabela","2"))
        self.assertEqual(compare({key:[row,row]},item)[0],"sem_juncao_conclusiva")
        self.assertEqual(compare({key:[{**row,"TX_GABARITO":"B"}]},item)[0],"gabarito_divergente_ou_ausente")
        self.assertEqual(compare({key:[{**row,"NU_PARAM_B":"2.1"}]},item)[0],"valores_divergentes")

    def test_actual_catalog_evidence(self):
        d=json.loads((ROOT/"auditoria.json").read_bytes())
        self.assertEqual(d["tri_oficial"],{"conferida_tabela":2971})
        self.assertEqual(d["habilidade"]["ausente"],192)
        self.assertEqual(d["assunto"]["ausente"],560)
        self.assertEqual(d["intersecao_certificada"],0)

    def test_prequential_blocks_and_weight_changes(self):
        d=json.loads((ROOT/"incremental.json").read_bytes())
        for records in d["updates"].values():
            self.assertEqual(sum(r["n"] for r in records),d["test_events"])
            self.assertTrue(all(a["last_order"]<b["first_order"] for a,b in zip(records,records[1:])))
            self.assertTrue(all(r["l2"]>0 for r in records))
            self.assertTrue(all(a["after"]==b["before"] for a,b in zip(records,records[1:])))
