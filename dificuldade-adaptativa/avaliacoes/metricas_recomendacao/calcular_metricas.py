"""Avalia listas históricas julgadas. Python >=3.10, apenas biblioteca padrão."""
import collections, csv, hashlib, json, math, random, statistics
from pathlib import Path
ROOT = Path(__file__).resolve().parent
def read(name):
    return json.loads((ROOT/'fontes'/name).read_text(encoding='utf-8'))
def metrics(ranking, judgments, k, threshold):
    if len(ranking) < k or len(set(ranking)) != len(ranking):
        raise ValueError('Ranking curto ou com duplicatas')
    if any(i not in judgments for i in ranking[:k]):
        raise ValueError('Item não julgado: não pode ser convertido em irrelevante')
    if any(not math.isfinite(float(g)) or g < 0 for g in judgments.values()):
        raise ValueError('Nota inválida')
    hits = sum(judgments[i] >= threshold for i in ranking[:k])
    total = sum(g >= threshold for g in judgments.values())
    dcg = sum(judgments[i]/math.log2(j+2) for j,i in enumerate(ranking[:k]))
    ideal = sum(g/math.log2(j+2) for j,g in enumerate(sorted(judgments.values(),reverse=True)[:k]))
    return {'precision':hits/k, 'recall_pool':hits/total if total else None,
            'ndcg_pool_linear':dcg/ideal if ideal else None,'hits':hits,'relevantes_pool':total,'tamanho_pool':len(judgments)}
def interval(values, seed=20261113, n=4000):
    values=[v for v in values if v is not None]
    if not values:return None
    rng=random.Random(seed)
    means=sorted(statistics.mean(rng.choices(values,k=len(values))) for _ in range(n))
    return [means[int(.025*n)], means[int(.975*n)-1]]
def run():
    for f in json.loads((ROOT/'manifesto_fontes.json').read_text(encoding='utf-8'))['arquivos']:
        assert hashlib.sha256((ROOT/'fontes'/f['arquivo']).read_bytes()).hexdigest()==f['sha256'],f['arquivo']
    configs=[('humana_1','resultados/avaliacao_cega_v1.json','notas','nota',{'RRF_MiniLM':'posicao_rrf'},[2,1]),
             ('humana_4','resultados/avaliacao_cega_4/resultado.json','notas','nota',{'RRF_MiniLM':'A_oficial_rrf_minilm','RRF_Qwen':'B_rrf_qwen','RRF_Qwen_reranker':'C_rrf_qwen_reranker'},[2,1]),
             ('humana_6','resultados/avaliacao_cega_6/resultado.json','notas','nota_italo',{'titulo_semelhanca':'A_semelhanca','titulo_assunto_primeiro':'B_assunto_primeiro'},[7,8,9]),
             ('IA_50','resultados/avaliacao_ia_50/chave_com_notas.json','itens','nota_IA',{'anterior':'anterior','novo':'novo'},[7,8,6])]
    detail=[]; provenance=[]
    for cohort,path,key,grade,methods,thresholds in configs:
        data=read(path); rows=data[key]; groups=collections.defaultdict(list)
        provenance.append({'coorte':cohort,'fonte':path,'avaliador_registrado':data.get('avaliador','IA, conforme nome do campo nota_IA; não avaliação humana'),'pares':len(rows),'consultas':len(set(r['referencia'] for r in rows))})
        for r in rows:groups[r['referencia']].append(r)
        for query,rs in groups.items():
            judged={r['candidata']:float(r[grade]) for r in rs if isinstance(r.get(grade),(int,float))}
            assert len(judged)==len(rs),'Julgamentos ausentes/duplicados'
            for method,pos in methods.items():
                selected=sorted((r for r in rs if r.get(pos) is not None),key=lambda r:r[pos])
                assert [r[pos] for r in selected]==list(range(1,len(selected)+1))
                for threshold in thresholds:
                    for k in (1,3):
                        if len(selected)<k:continue
                        out=metrics([r['candidata'] for r in selected],judged,k,threshold)
                        detail.append({'coorte':cohort,'metodo':method,'referencia':query,'k':k,'limiar':threshold,**out})
    grouped=collections.defaultdict(list)
    for r in detail:grouped[(r['coorte'],r['metodo'],r['k'],r['limiar'])].append(r)
    summary=[]
    for (c,m,k,t),rows in grouped.items():
        d={'coorte':c,'metodo':m,'k':k,'limiar':t,'consultas':len(rows)}
        for metric in ('precision','recall_pool','ndcg_pool_linear'):
            vals=[r[metric] for r in rows if r[metric] is not None]
            d[metric]=statistics.mean(vals) if vals else None
            d[metric+'_n']=len(vals);d[metric+'_ic95_bootstrap']=interval(vals)
        summary.append(d)
    # A avaliação 7 tem notas humanas, mas não posições explícitas no CSV.
    # Conferir o catálogo publicado evita inventar posições a partir da ordem sorteada Sx.y.
    proto=read('resultados/avaliacao_cega_7/protocolo.json')
    contents=read('resultados/avaliacao_cega_7/conteudo.json')
    with (ROOT/'fontes/resultados/avaliacao_cega_7/notas_humanas.csv').open(encoding='utf-8-sig',newline='') as f:human=list(csv.DictReader(f,delimiter=';'))
    grade_by_pair={r['par_id']:float(r['nota_0a10'].replace(',','.')) for r in human}
    coverage=[]
    for method in ('titulo_area','rrf_qwen'):
        cat=read('catalogo/recomendacoes_'+method+'.json')
        for block in contents:
            judged={r['id']:grade_by_pair[f"S{block['bloco']}.{j}"] for j,r in enumerate(block['sug'],1)}
            ranking=cat['recomendacoes'].get(block['ref']['id'],[])[:3]
            coverage.append({'metodo':method,'referencia':block['ref']['id'],'julgados_top3':sum(i in judged for i in ranking),'total_top3':len(ranking),'ids_top3':ranking,'base_sha256_catalogo':cat['base_sha256']})
    complete={r['referencia'] for r in coverage if r['metodo']=='titulo_area' and r['julgados_top3']==3 and r['total_top3']==3}
    paired=[]
    for block in contents:
        query=block['ref']['id']
        if query not in complete:continue
        judged={r['id']:grade_by_pair[f"S{block['bloco']}.{j}"] for j,r in enumerate(block['sug'],1)}
        for method in ('titulo_area','rrf_qwen'):
            ranking=read('catalogo/recomendacoes_'+method+'.json')['recomendacoes'][query]
            for threshold in (7,8,9):
                for k in (1,3):
                    paired.append({'coorte':'humana_7_catalogos_11_comuns','metodo':method,'referencia':query,'k':k,'limiar':threshold,**metrics(ranking,judged,k,threshold)})
    detail.extend(paired)
    pg=collections.defaultdict(list)
    for r in paired:pg[(r['metodo'],r['k'],r['limiar'])].append(r)
    for (m,k,t),rows in pg.items():
        d={'coorte':'humana_7_catalogos_11_comuns','metodo':m,'k':k,'limiar':t,'consultas':len(rows)}
        for metric in ('precision','recall_pool','ndcg_pool_linear'):
            vals=[r[metric] for r in rows if r[metric] is not None]
            d[metric]=statistics.mean(vals) if vals else None
            d[metric+'_n']=len(vals);d[metric+'_ic95_bootstrap']=interval(vals)
        summary.append(d)
    differences={}
    for metric in ('precision','recall_pool','ndcg_pool_linear'):
        byquery=collections.defaultdict(dict)
        for r in paired:
            if r['k']==3 and r['limiar']==7:byquery[r['referencia']][r['metodo']]=r[metric]
        diffs=[x['titulo_area']-x['rrf_qwen'] for x in byquery.values() if all(v is not None for v in x.values())]
        differences[metric]={'ganho_medio':statistics.mean(diffs),'ic95_bootstrap_pareado':interval(diffs),'n':len(diffs)}
    current={'pares_humanos':len(human),'consultas':len(contents),'consultas_comuns_totalmente_julgadas':len(complete),'media_nota':statistics.mean(grade_by_pair.values()),'proporcao_nota_ge7':sum(g>=7 for g in grade_by_pair.values())/len(human),'diferencas_pareadas':differences,'cobertura_catalogos':coverage,'observacao':'Resultados calculados somente nas 11 consultas com top3 dos dois catálogos completamente julgados. Uma referência excluída por falta de uma nota no catálogo titulo_area atualizado. A ordem Sx.y é sorteada, não ranking. Chaves cegas não abertas. Catálogos têm hashes de base diferentes; comparação das listas publicadas, não experimento controlado apenas de algoritmo.'}
    output=ROOT/'resultados'; output.mkdir(exist_ok=True)
    for name,obj in [('resumo.json',summary),('por_consulta.json',detail),('proveniencia.json',provenance),('avaliacao7_cobertura.json',current)]:
        (output/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2),encoding='utf-8')
    for name,rows in [('resumo.csv',summary),('por_consulta.csv',detail)]:
        with (output/name).open('w',encoding='utf-8-sig',newline='') as f:
            w=csv.DictWriter(f,fieldnames=list(rows[0]),delimiter=';');w.writeheader();w.writerows(rows)
    print('Integridade das fontes: OK. Linhas por consulta:',len(detail))
    for r in summary:
        if r['k']==3 and r['limiar'] in ([2] if r['coorte'] in ('humana_1','humana_4') else [7]):
            print(r['coorte'],r['metodo'],'n=',r['consultas'],'P@3=',round(r['precision'],4),'Recall-pool@3=',round(r['recall_pool'],4),'nDCG-linear-pool@3=',round(r['ndcg_pool_linear'],4))
    print('Avaliação7: cobertura dos top3 dos catálogos',collections.Counter((r['metodo'],r['julgados_top3']) for r in coverage))
if __name__=='__main__':run()
