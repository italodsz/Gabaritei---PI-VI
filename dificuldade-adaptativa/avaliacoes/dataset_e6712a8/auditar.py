from pathlib import Path
import collections, hashlib, json, math, urllib.request, csv
ROOT=Path(__file__).resolve().parent
REV='e6712a8a6b4bffffadbe75bd4e8d520ec7628e4d'
BASE=f'https://raw.githubusercontent.com/italodsz/Gabaritei---PI-VI/{REV}/Dataset/base_trabalho/'
FILES=['README.md','data/questions.jsonl','ids_elegiveis.json','AVISO_INDICES.json','splits/train.jsonl','splits/validation.jsonl','splits/test.jsonl','qualidade/bloqueios.json']
def rows(p):return [json.loads(line) for line in p.read_text(encoding='utf-8').splitlines() if line.strip()]
def finite(v):return isinstance(v,(int,float)) and math.isfinite(v)
def main():
    sources=[]
    for name in FILES:
        p=ROOT/'source'/name;p.parent.mkdir(parents=True,exist_ok=True)
        if not p.exists():p.write_bytes(urllib.request.urlopen(BASE+name,timeout=45).read())
        sources.append({'path':name,'url':BASE+name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
    data=rows(ROOT/'source/data/questions.jsonl');new={r['id']:r for r in data}
    oldrows=rows(ROOT/'baselines/anterior_questions.jsonl');old={r['id']:r for r in oldrows}
    initialrows=rows(ROOT/'baselines/recomendador_questions.jsonl');initial={r['id']:r for r in initialrows}
    eligible=json.loads((ROOT/'source/ids_elegiveis.json').read_text());oldel=json.loads((ROOT/'baselines/anterior_ids_elegiveis.json').read_text())
    es=set(sum(eligible.values(),[]));oes=set(sum(oldel.values(),[]))
    changes=[]
    for id in sorted(new.keys()|old.keys()):
        a=old.get(id);b=new.get(id)
        fields=sorted(k for k in a.keys()|b.keys() if a.get(k)!=b.get(k)) if a and b else []
        if a!=b:changes.append({'id':id,'tipo':'adicionada' if not a else 'removida' if not b else 'alterada','ano':(b or a).get('year'),'area':(b or a).get('area'),'campos':fields})
    descriptions=[(r,d) for r in data for d in r.get('descriptions',[])]
    enabled=[(r,d) for r,d in descriptions if d.get('use_for_recommender') is True and str(d.get('text') or '').strip()]
    split_checks={}
    for split,ids in eligible.items():
        splitrows=rows(ROOT/'source/splits'/f'{split}.jsonl')
        selected={r['id']:r for r in splitrows}
        split_checks[split]={'arquivo_total':len(splitrows),'elegiveis':len(ids),'elegiveis_ausentes_arquivo':len(set(ids)-selected.keys()),'divergencias_com_base':sum(r!=new.get(r['id']) for r in splitrows),'split_incorreto':sum(r.get('split')!=split for r in splitrows)}
    invalid_options=[r['id'] for r in data if len(r.get('options',[]))!=5 or r.get('answer') not in {o.get('label') for o in r.get('options',[])}]
    complete=[r for r in data if all(finite(r.get('tri',{}).get(k)) for k in ('a','b','c'))]
    invalid_tri=[r['id'] for r in complete if r['tri']['a']<=0 or not 0<=r['tri']['c']<1]
    checks={'ids_unicos':len(data)==len(new),'sha256_igual_aviso':sources[1]['sha256']==json.loads((ROOT/'source/AVISO_INDICES.json').read_text())['derivative_dataset_sha256'],'elegiveis_existem':es<=new.keys(),'elegiveis_sem_repeticao':len(es)==sum(map(len,eligible.values())),'opcoes_e_gabaritos':not invalid_options,'tri_completa_todos':len(complete)==len(data),'dominio_tri_a_c':not invalid_tri,'splits_coerentes':all(not r['divergencias_com_base'] and not r['elegiveis_ausentes_arquivo'] and not r['split_incorreto'] for r in split_checks.values())}
    result={'revision':REV,'sha256':sources[1]['sha256'],'total':len(data),'por_ano':dict(sorted(collections.Counter(r['year'] for r in data).items())),'por_area':dict(collections.Counter(r['area'] for r in data)),'elegiveis':{k:len(v) for k,v in eligible.items()},'elegiveis_total':len(es),'fora_elegiveis':len(data)-len(es),'tri_completa':len(complete),'tri_b_finito':sum(finite(r.get('tri',{}).get('b')) for r in data),'sem_habilidade':sum(not r.get('skill') for r in data),'sem_assunto_predito':sum(not r.get('pedagogy',{}).get('topic_predicted') for r in data),'revisao_pedagogica':dict(collections.Counter(str(r.get('pedagogy',{}).get('review_status')) for r in data)),'descricoes':len(descriptions),'questoes_com_descricoes':len(set(r['id'] for r,d in descriptions)),'descricoes_habilitadas':len(enabled),'questoes_descricoes_habilitadas':len(set(r['id'] for r,d in enabled)),'fontes_descricoes':dict(collections.Counter(str(d.get('source')) for r,d in descriptions)),'exemplo_descricao':descriptions[0][1] if descriptions else None,'comparacao_anterior':{'total_anterior':len(old),'adicionadas':len(new.keys()-old.keys()),'removidas':len(old.keys()-new.keys()),'alteradas':sum(new[k]!=old[k] for k in new.keys()&old.keys()),'campos_alterados':dict(collections.Counter(f for r in changes for f in r['campos'])),'elegiveis_antes':len(oes),'elegiveis_adicionadas':len(es-oes),'elegiveis_removidas':len(oes-es),'tri_alterada':sum(new[k].get('tri')!=old[k].get('tri') for k in new.keys()&old.keys())},'comparacao_base_recomendador_antiga':{'total':len(initial),'novos_ids':len(new.keys()-initial.keys()),'ids_removidos':len(initial.keys()-new.keys())},'splits':split_checks,'checks':checks,'ids_opcoes_invalidas':invalid_options,'ids_tri_invalidos':invalid_tri}
    output=ROOT/'results';output.mkdir(exist_ok=True)
    for n,obj in [('resumo.json',result),('alteracoes_individuais.json',changes),('fontes.json',sources)]:
        (output/n).write_text(json.dumps(obj,ensure_ascii=False,indent=2),encoding='utf-8')
    with (output/'alteracoes_individuais.csv').open('w',newline='',encoding='utf-8-sig') as f:
        w=csv.DictWriter(f,fieldnames=list(changes[0]),delimiter=';');w.writeheader();w.writerows(changes)
    print(json.dumps({k:v for k,v in result.items() if k not in ('exemplo_descricao','por_ano')},ensure_ascii=True,indent=2))
if __name__=='__main__':main()
