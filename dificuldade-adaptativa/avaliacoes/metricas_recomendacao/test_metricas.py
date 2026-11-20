import unittest, math
from calcular_metricas import metrics, interval
class MetricTests(unittest.TestCase):
    def test_perfeito(self):
        m=metrics(['a','b'],{'a':2,'b':1,'c':0},2,2)
        self.assertEqual(m['precision'],.5);self.assertEqual(m['recall_pool'],1);self.assertAlmostEqual(m['ndcg_pool_linear'],1)
    def test_invertido(self):
        m=metrics(['b','a'],{'a':2,'b':1},2,2)
        self.assertAlmostEqual(m['ndcg_pool_linear'],(1+2/math.log2(3))/(2+1/math.log2(3)))
    def test_pool(self):
        self.assertEqual(metrics(['a'],{'a':2,'b':2,'c':2},1,2)['recall_pool'],1/3)
    def test_sem_relevante(self):
        m=metrics(['a'],{'a':0},1,1)
        self.assertIsNone(m['recall_pool']);self.assertIsNone(m['ndcg_pool_linear'])
    def test_nao_julgado(self):
        with self.assertRaises(ValueError):metrics(['a'],{},1,1)
    def test_curto(self):
        with self.assertRaises(ValueError):metrics(['a'],{'a':1},3,1)
    def test_duplicata(self):
        with self.assertRaises(ValueError):metrics(['a','a'],{'a':1},1,1)
    def test_intervalo_reproduzivel(self):
        self.assertEqual(interval([0,1]),interval([0,1]))
    def test_nota_invalida(self):
        with self.assertRaises(ValueError):metrics(['a'],{'a':float('nan')},1,1)
    def test_referencia_sklearn(self):
        try:from sklearn.metrics import ndcg_score
        except ImportError:self.skipTest('scikit-learn opcional não instalado')
        judgments={'a':9,'b':3,'c':7,'d':0}
        ranking=['b','c','a','d']
        expected=ndcg_score([[9,3,7,0]],[[2,4,3,1]],k=3)
        self.assertAlmostEqual(metrics(ranking,judgments,3,7)['ndcg_pool_linear'],expected)
if __name__=='__main__':unittest.main(verbosity=2)
