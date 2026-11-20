"""Materializa escores existentes; não treina, não gera embeddings e não altera o catálogo."""
import json,sys,hashlib,time,contextlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];REC=ROOT/'recomendador/rrf-tfidf-minilm-J'
sys.path.insert(0,str(REC))
from threadpoolctl import threadpool_limits
threadpool_limits(2)
import recomendador as rc
ix=rc.Indice();catpath=REC/'catalogo/recomendacoes_titulo_area.json'
cat=json.loads(catpath.read_text(encoding='utf-8'));start=time.perf_counter();out={}
for n,(qid,ids) in enumerate(cat['recomendacoes'].items(),1):
 ranking=ix.ranking(qid,'titulo_area',galeria='todas');rankids=[i for i,_ in ranking[:len(ids)]]
 if rankids!=ids:raise RuntimeError('Ordem oficial diferente do catálogo em '+qid)
 out[qid]=[[i,s] for i,s in ranking[:len(ids)]]
 if n%500==0:print(n,flush=True)
paths=['indice/config.json','indice/documentos.json','indice/tfidf.npz','indice/minilm.npy','indice/qwen/'+rc.QWEN_ARQUIVO,'busca_por_area_v1.json','recomendador.py','sinais.py']
hashes={p:hashlib.sha256((REC/p).read_bytes()).hexdigest() for p in paths}
result={'version':'titulo-area-escores-4b-v1','datasetSha256':ix.conf['base_sha256'],'catalogSha256':hashlib.sha256(catpath.read_bytes()).hexdigest(),'method':'titulo_area','gallery':'todas','provenance':hashes,'scores':out}
dest=Path(sys.argv[1]) if len(sys.argv)>1 else ROOT/'backend/artefatos/escores_titulo_area.json';dest.parent.mkdir(parents=True,exist_ok=True)
dest.write_text(json.dumps(result,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print(json.dumps({'references':len(out),'pairs':sum(map(len,out.values())),'seconds':time.perf_counter()-start,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()},indent=2))
