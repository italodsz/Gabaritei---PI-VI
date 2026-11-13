"""Exemplos reais e verificações do contrato de texto, sem consultar respostas."""
import json
from pathlib import Path
import pipeline_baseline as bl

R = Path(__file__).resolve().parent

def main():
    rows = [json.loads(l) for l in (R/'base/questions.jsonl').read_text(encoding='utf-8').splitlines()]
    grupos = {
        'Tardelli': lambda q: bool(q['assets']) and any('tardelli' in str(d).lower() and d.get('use_for_recommender') is True for d in q.get('descriptions', [])),
        'Maritaca': lambda q: bool(q['assets']) and any('maritaca' in str(d).lower() and d.get('use_for_recommender') is True for d in q.get('descriptions', [])),
        'Ledor': lambda q: bool(q['assets']) and any(d.get('text_scope') and d.get('use_for_recommender') is True for d in q.get('descriptions', [])),
        'Sem imagem': lambda q: not q['assets'] and not q.get('descriptions'),
    }
    textos = []
    for nome, regra in grupos.items():
        q = next(q for q in rows if regra(q))
        # Uma cópia só com os três campos autorizados deve produzir o mesmo resultado.
        texto = bl.question_text(q)
        assert texto == bl.question_text({k:q[k] for k in ('question','options','descriptions')})
        partes = [bl.clean(q['question'])] + [bl.clean(d.get('text','')) for d in q['descriptions'] if d.get('use_for_recommender') is True] + [bl.clean(o.get('text','')) for o in sorted(q['options'], key=lambda o:o['label'])]
        assert texto == '\n'.join(partes).strip()
        textos.append(f'## {nome}: {q["id"]}\n\n{texto}\n')
    # Flag deve ser o booleano true, não uma string nem um valor apenas truthy.
    assert bl.question_text({'question':'Enunciado','options':[{'label':'A','text':'Alternativa'}], 'descriptions':[{'text':'ignorar','use_for_recommender':False}, {'text':'ignorar','use_for_recommender':'true'}, {'text':'incluir','use_for_recommender':True}]}) == 'Enunciado\nincluir\nAlternativa'
    out = '\n'.join(textos)
    (R/'resultados/base_final/exemplos_texto.md').write_text(out, encoding='utf-8')
    print(out)
    print('PASS: ordem, limpeza, seleção explícita e independência dos demais campos.')

if __name__ == '__main__': main()
