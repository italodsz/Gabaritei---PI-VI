"""Registra hashes e ambiente após a geração completa dos índices."""
import hashlib
import importlib.metadata
import json
import sys
from pathlib import Path

R=Path(__file__).resolve().parent

def main():
    qdir=R/'indice/qwen'; qpath=qdir/'Qwen3-Embedding-8B-4bit__conceito.npy'
    sha=hashlib.sha256(qpath.read_bytes()).hexdigest()
    import re
    p=R/'recomendador.py'; s=p.read_text(encoding='utf-8')
    p.write_text(re.sub(r"QWEN_SHA256 = '[0-9a-f]+'",f"QWEN_SHA256 = '{sha}'",s),encoding='utf-8',newline='\n')
    cp=R/'indice/config.json'; cfg=json.loads(cp.read_text(encoding='utf-8'))
    import recomendador as rc
    cfg['versao']=rc.VERSAO
    cfg.update({'dataset_commit':'e6712a8','recomendador_origem':'a7b5b8c','indices_refeitos_em':'2026-11-13','qwen_sha256':sha,'qwen_vetores_desatualizados':[],'texto':'enunciado + descriptions com use_for_recommender true + alternativas'})
    cp.write_text(json.dumps(cfg,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
    packages=['numpy','scipy','scikit-learn','torch','sentence-transformers','transformers','bitsandbytes']
    files=['indice/config.json','indice/documentos.json','indice/tfidf.joblib','indice/tfidf.npz','indice/minilm.npy','indice/qwen/ids.json','indice/qwen/Qwen3-Embedding-8B-4bit__conceito.npy','indice/qwen/Qwen3-Embedding-8B-4bit__config.json']
    data={'python':sys.version,'pacotes':{p:importlib.metadata.version(p) for p in packages},'qwen_lote':2,'sha256':{f:hashlib.sha256((R/f).read_bytes()).hexdigest() for f in files}}
    (R/'resultados/base_final/ambiente_indices.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('QWEN_SHA256:',sha)

if __name__=='__main__':main()
