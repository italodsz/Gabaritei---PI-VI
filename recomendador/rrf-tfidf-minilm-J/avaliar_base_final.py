"""Avalia antes/depois sem usar questões de teste na escolha de configuração."""
import argparse
import collections
import json
import sys
from pathlib import Path

R=Path(__file__).resolve().parent
OUT=R/'resultados/base_final'

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('versao',choices=['antes','depois']); a=ap.parse_args()
    root=R if a.versao=='depois' else R.parents[2]/'Gabaritei-base-final-antes/recomendador/rrf-tfidf-minilm-J'
    sys.path.insert(0,str(root))
    import recomendador as rc
    ix=rc.Indice(); lab=collections.defaultdict(dict)
    for p in map(json.loads,(root/'base/pares_desenvolvimento_compativeis.jsonl').read_text(encoding='utf-8').splitlines()):
        assert ix.rows[p['query_id']]['split']=='validation'
        lab[p['query_id']][p['candidate_id']]=p['human_grade']
    results={}
    for method in ['tfidf','minilm','rrf','qwen','rrf_qwen','arvore','titulo','titulo_area']:
        ok=tot=0
        for qid,L in lab.items():
            if qid not in ix.pos: continue
            pos={i:k for k,(i,_) in enumerate(ix.ranking(qid,method))}
            for i in L:
                for j in L:
                    if L[i]>L[j] and i in pos and j in pos:
                        tot+=1; ok+=pos[i]<pos[j]
        results[method]={'certos':int(ok),'comparacoes':tot,'taxa':ok/tot if tot else None}
    (OUT/f'avaliacao_{a.versao}.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(results,ensure_ascii=False,indent=2))

if __name__=='__main__': main()
