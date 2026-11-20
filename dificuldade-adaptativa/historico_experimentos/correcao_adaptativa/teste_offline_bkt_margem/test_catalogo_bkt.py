import json
import unittest

from adaptador import ANCHORS, Catalog, HERE, HISTORY, LEVELS, REV, Session, inventory, old

TRACE = []
USED = {}
CAT = Catalog()
F = json.loads((HISTORY/"revisao_operacional_bkt/fixtures.json").read_bytes())
SCALE = F["escala_principal"]


class Functional(unittest.TestCase):
    def evidence(self, operation, inputs, output, before=None, after=None):
        TRACE.append(dict(teste=self._testMethodName,operacao=operation,entrada=inputs,saida=output,
                          antes=before,depois=after,origem="simulacao"))
        return output

    def record(self,s,i,y=0,revision=REV,family=None):
        r = CAT.items[i]
        inputs = (i,revision,r["escala"],family or r["familia"],y)
        before = s.snapshot()
        result = s.record(*inputs)
        USED.setdefault(result,set()).add(i)
        return self.evidence("resposta",inputs,result,before,s.snapshot())

    def advise(self,s,ids,revision=REV):
        before=s.snapshot()
        return self.evidence("avaliar",{"ids":list(ids),"revisao":revision},s.advise(ids,revision),before,s.snapshot())

    def respond(self,s,offer,accept,ids,version=None):
        inputs=(offer["oferta_id"],version or offer["versao"],accept,ids,REV)
        before=s.snapshot()
        return self.evidence("aceite",inputs,s.respond(*inputs),before,s.snapshot())

    def test_A_elegibilidade(self):
        a = F["A"]
        s = Session(CAT,SCALE,1)
        cases = [("bloqueada","indisponivel_catalogo"),("outra_escala_mesma_area","fora_da_escala"),
                 ("conflito_pedagogico","indisponivel_catalogo"),("so_exibicao","fora_da_area")]
        for field,expected in cases:
            self.assertEqual(expected,self.record(s,a[field]))
        i = a["faixa_sem_rotulo_confirmado"]
        self.assertEqual("revisao_invalida",self.record(s,i,revision="errada"))
        self.assertEqual("metadado_divergente",self.record(s,i,family="divergente"))
        self.assertEqual("atualizou_bkt",self.record(s,i))
        self.assertEqual({},s.general[-1]["rotulos_sustentados"])

    def test_B_diagnostico(self):
        b = F["B"]
        ids = b["diagnostico_misto_CH"]
        candidates = [*ids,*b["reservas_por_faixa"]]
        all_ch,_ = inventory(CAT,SCALE)
        cn,_ = inventory(CAT,b["escala_CN_insuficiente"])
        for seq,scope,mixed,count in ((ids,SCALE,True,10),(all_ch,SCALE,False,7),
                                       (cn,b["escala_CN_insuficiente"],True,9)):
            result = self.evidence("preflight",{"ids":list(seq),"escala":scope,"mistura_autorizada":mixed},
                                   CAT.diagnostic(seq,REV,scope,1,mixed))
            self.assertEqual(count,result["familias_disponiveis"])
            self.assertEqual(count>=10,result["motivo"]=="diagnostico_disponivel")
        s = Session(CAT,SCALE,1,diagnostic=True)
        for n in range(11):
            if n in (0,1,3,4,10):
                self.assertEqual(n,s.snapshot()["evidencia_bkt"])
                advice=self.advise(s,candidates)
                if n<10:
                    self.assertEqual("diagnostico_em_curso",advice["motivo"])
                else:
                    self.assertNotEqual("diagnostico_em_curso",advice["motivo"])
                self.assertEqual(1,s.preference)
            if n<len(ids):
                self.assertEqual("atualizou_bkt",self.record(s,ids[n],b["respostas_sinteticas"][n]))

    def test_C_granularidade_bloqueada(self):
        ids = F["C"]["geometria"]+F["C"]["numeros_aritmetica"]
        rows = [CAT.items[i] for i in ids]
        self.assertTrue(all(r["categoria"]=="C" and not r["escala"] for r in rows))
        self.evidence("documental",ids,{"status":"BLOQUEADO","motivo":"sem faixa local MT"})
        self.skipTest("C bloqueado documentalmente. MT sem faixa e sem par válido por assunto.")

    def test_D_quatro_transicoes(self):
        initial=Session(CAT,SCALE,1)
        self.assertGreater(initial.model.predict(SCALE,"bkt_item",ANCHORS[0]),
                           initial.model.predict(SCALE,"bkt_item",ANCHORS[2]))
        result = {}
        for level,i in F["D"].items():
            for y in (0,1):
                s = Session(CAT,SCALE,1)
                self.assertEqual("atualizou_bkt",self.record(s,i,y))
                result[level,y] = s.snapshot()["dominio"]
        self.assertGreater(result["alto",0],result["baixo",0])
        self.assertGreater(result["alto",1],result["baixo",1])
        self.assertTrue(all(0<=p<=1 for p in result.values()))

    def test_E_ausencias(self):
        e = F["E"]
        s = Session(CAT,SCALE,1)
        self.assertEqual("atualizou_bkt",self.record(s,e["sem_assunto"]))
        self.assertEqual({},s.general[-1]["rotulos_sustentados"])
        cn = Session(CAT,F["B"]["escala_CN_insuficiente"],1)
        self.assertEqual("somente_pratica",self.record(cn,e["sem_habilidade_e_faixa"]))
        self.assertEqual(0,cn.snapshot()["evidencia_bkt"])
        self.assertNotIn("nivel",self.advise(cn,[e["sem_habilidade_e_faixa"]]))
        mt = Session(CAT,"",1)
        contextual = F["C"]["geometria"][0]
        self.assertEqual("historico_contextual",self.record(mt,contextual))
        self.assertIn("habilidade",mt.general[-1]["rotulos_sustentados"])
        self.assertEqual(0,mt.snapshot()["evidencia_bkt"])

    def test_F_repeticao(self):
        f = F["F"]
        s = Session(CAT,SCALE,1)
        self.assertEqual("atualizou_bkt",self.record(s,f["repetir_adaptativo"],0))
        before = s.snapshot()
        self.assertEqual("repeticao",self.record(s,f["repetir_adaptativo"],1))
        self.assertEqual(before,s.snapshot())
        p = Session(CAT,"",1)
        first,alias=f["familia_canonico_apenas_exibicao"],f["familia_variante_bloqueada"]
        self.assertEqual("indisponivel_catalogo",self.record(p,alias))
        self.assertIn(self.record(p,first),("somente_pratica","historico_contextual"))
        self.assertEqual("repeticao",self.record(p,alias))
        self.assertEqual(1,p.snapshot()["historico_geral"])

    def test_G_preferencia_e_aceite(self):
        all_ids,_ = inventory(CAT,SCALE)
        def ready():
            s = Session(CAT,SCALE,2)
            for i in F["B"]["diagnostico_misto_CH"][:4]:
                self.assertEqual("atualizou_bkt",self.record(s,i,0))
            offer=self.advise(s,all_ids)
            self.assertIn("oferta_id",offer)
            self.assertEqual(2,s.preference)
            return s,offer
        s,o = ready()
        self.assertEqual("oferta_invalida",self.respond(s,o,True,all_ids,"errada"))
        self.assertEqual("oferta_invalida",self.respond(s,{**o,"oferta_id":"errado"},True,all_ids))
        self.assertEqual(2,s.preference)
        self.assertEqual("recusada",self.respond(s,o,False,all_ids))
        self.assertEqual(2,s.preference)
        s,o = ready()
        self.assertEqual("aceita",self.respond(s,o,True,all_ids))
        self.assertEqual(o["nivel"],s.preference)
        s,o = ready()
        before=s.snapshot()
        s.manual(1)
        self.evidence("escolha_manual",1,1,before,s.snapshot())
        self.assertEqual("oferta_invalida",self.respond(s,o,True,all_ids))
        self.assertEqual(1,s.preference)
        s,o = ready()
        reduced = [i for i in all_ids if CAT.items[i]["nivel"]!=LEVELS[o["nivel"]]]
        self.assertEqual("faixa_sugerida_indisponivel",self.respond(s,o,True,reduced))
        self.assertEqual(2,s.preference)

    def test_J_contrato_semantico(self):
        all_ids,_=inventory(CAT,SCALE)
        ids=tuple(reversed(all_ids[:8]))
        before=tuple(ids)
        s=Session(CAT,SCALE,1)
        response=self.advise(s,ids)
        self.assertEqual(before,ids)
        self.assertEqual(before,CAT.candidates(ids,SCALE))
        self.assertEqual({"motivo"},set(response))
        self.assertEqual("revisao_invalida",self.advise(s,ids,"errada")["motivo"])
        self.assertEqual("sem_candidatos_elegiveis",self.advise(s,[])["motivo"])
        offered=Session(CAT,SCALE,2)
        for i in F["B"]["diagnostico_misto_CH"][:4]:
            self.record(offered,i)
        reversed_order=tuple(reversed(all_ids))
        before=reversed_order[:]
        response=self.advise(offered,reversed_order)
        self.assertEqual({"nivel","motivo","versao","oferta_id"},set(response))
        self.assertEqual(before,reversed_order)


if __name__=="__main__":
    original_params=tuple(old.R["params_bkt"])
    result=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(Functional))
    assert original_params==tuple(old.R["params_bkt"])
    payload={"total":result.testsRun,"falhas":len(result.failures),"erros":len(result.errors),
             "bloqueados":[{"teste":str(t),"motivo":r} for t,r in result.skipped],
             "params_bkt_antes_depois":list(original_params),"hashes":CAT.hashes,
             "ids_por_resultado":{k:sorted(v) for k,v in USED.items()},"trilha":TRACE}
    (HERE/"funcionais.json").write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    raise SystemExit(not result.wasSuccessful())
