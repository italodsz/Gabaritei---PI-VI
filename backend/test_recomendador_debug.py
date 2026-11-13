"""Compara diagnósticos aos rankings reais e cobre as receitas oficiais."""
import unittest
import numpy as np
from recomendador_debug import Laboratorio


class TestDiagnostico(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.lab = Laboratorio()

    def test_receitas_e_prioridade_reproduzem_o_metodo(self):
        ix = self.lab.ix
        for materia in ['Matemática', 'Literatura', 'Filosofia', 'Tecnologias da informação e comunicação', 'Física']:
            with self.subTest(materia=materia):
                qid = next(d['id'] for d in ix.docs if d['split'] == 'validation' and ix.rot[d['id']]['materia'] == materia and (materia != 'Física' or ix.rot[d['id']]['titulo'] == 'Mecânica'))
                result = self.lab.diagnostico(qid, 50)
                expected = ix.ranking(qid, 'titulo_area', 'treino')[:50]
                self.assertEqual([r['id'] for r in result['results']], [i for i, _ in expected])
                np.testing.assert_allclose([r['score'] for r in result['results']], [s for _, s in expected], atol=1e-12, rtol=0)
                for r in result['results']:
                    self.assertAlmostEqual(sum(c['contribution'] for c in r['components'].values()), r['score'], places=12)
                    self.assertEqual(r['components']['minilm']['contribution'], 0)
                self.assertTrue(all(a['after'] == b['before'] for a, b in zip(result['stages'], result['stages'][1:])))
                self.assertEqual(result['stages'][-1]['after'], len(ix.ranking(qid, 'titulo_area', 'treino')))
                if materia == 'Física': self.assertTrue(result['subjectPriority'])

    def test_exclusoes_e_lista_vazia(self):
        qid = 'gq_29ef25a472475b50d03207ab'
        initial = self.lab.diagnostico(qid, 5)
        first = initial['results'][0]['id']
        result = self.lab.diagnostico(qid, 5, [first])
        self.assertNotIn(first, [r['id'] for r in result['results']])
        self.assertGreater(result['stages'][-1]['removed'], 0)
        empty = self.lab.diagnostico('gq_1a3a6d4a138f7ba1fba29cef', 5)
        self.assertEqual(empty['results'], [])
        self.assertEqual(empty['totalRanked'], 0)

    def test_teste_reservado_recusado(self):
        qid = next(d['id'] for d in self.lab.ix.docs if d['split'] == 'test')
        with self.assertRaisesRegex(ValueError, '2024'):
            self.lab.diagnostico(qid)


if __name__ == '__main__': unittest.main(verbosity=2)
