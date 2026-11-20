from pathlib import Path
import sys,json,contextlib,copy,hashlib
R=Path(__file__).resolve().parents[1];REC=R/'base4b/projeto/recomendador/rrf-tfidf-minilm-J';sys.path.insert(0,str(REC))
from threadpoolctl import threadpool_limits
threadpool_limits(2)
import recomendador as rc
import pipeline_baseline as bl
u=json.loads((R/'protocolo_humano/universo_congelado.json').read_text(encoding='utf-8'));ix=rc.Indice()
before={qid:ix.ranking(qid,'titulo_area',galeria='todas') for qid in u['queries']}
texts={qid:bl.question_text(ix.rows[qid]) for qid in u['queries']}
for row in ix.rows.values():row['skill']='CODIGO_ARTIFICIAL_APENAS_SONDA'
after={qid:ix.ranking(qid,'titulo_area',galeria='todas') for qid in u['queries']}
checks=[{'query':qid,'rankingIdentical':before[qid]==after[qid],'encoderTextIdentical':texts[qid]==bl.question_text(ix.rows[qid])} for qid in u['queries']]
assert all(c['rankingIdentical'] and c['encoderTextIdentical'] for c in checks)
out={'scope':'teste técnico em memória; nenhuma escrita no dataset ou modelo','queries':len(checks),'checks':checks,'conclusion':'Campo skill não influencia a inferência atual nem o texto do encoder nas consultas testadas. Não prova ausência de uso em decisões históricas de desenvolvimento.'}
(R/'resultados/independencia_skill.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps({'queries':len(checks),'allUnchanged':True},indent=2))
