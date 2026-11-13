"""Verifica que a construção dos sinais não acessa resposta nem metadados pedagógicos."""
from types import SimpleNamespace
import json
from pathlib import Path
import sinais

class QuestaoProtegida(dict):
    proibidos={'answer','skill','tri','area','pedagogy'}
    def __getitem__(self,key):
        assert key not in self.proibidos,key
        return super().__getitem__(key)
    def get(self,key,default=None):
        assert key not in self.proibidos,key
        return super().get(key,default)

def main():
    root=Path(__file__).resolve().parent
    rows={q['id']:QuestaoProtegida(q) for q in map(json.loads,(root/'base/questions.jsonl').read_text(encoding='utf-8').splitlines())}
    docs=json.loads((root/'indice/documentos.json').read_text(encoding='utf-8'))
    s=sinais.Sinais(SimpleNamespace(rows=rows,docs=docs))
    assert 'resposta' not in s.M
    print('PASS: sinais construídos sem acesso a gabarito, habilidade, TRI, área ou pedagogia.')

if __name__=='__main__':main()
