from bench import *
import re
P=[json.loads(l) for l in open(E+'avaliacoes/pares_desenvolvimento_compativeis.jsonl')]
lab=collections.defaultdict(dict)
for p in P: lab[p['query_id']][p['candidate_id']]=p['human_grade']
CRIT='critério declarado antes: >= 37/44 pares, nota-2 no top10 >= base, nota-0 no top5 <= base'
def ped(q,k): return (q.get('pedagogy') or {}).get(k)
def comando(q):
    paras=[x for x in re.split(r'\n\s*\n',q['question'] or '') if x.strip()]
    return b.clean(paras[-1]) if paras else ''
cv=TfidfVectorizer(**cfg).fit([comando(q) for q in TR]); CMD={q['id']:cv.transform([comando(q)]) for q in TR+VA}
def obj(name,q,c):
    if name=='habilidade': return float(q.get('skill') is not None and c.get('skill')==q['skill'])
    if name=='subtopico': return float(ped(q,'subtopic_predicted') is not None and ped(c,'subtopic_predicted')==ped(q,'subtopic_predicted'))
    if name=='operacao_modo': return float(ped(c,'cognitive_operation_predicted')==ped(q,'cognitive_operation_predicted'))+float(ped(c,'content_mode')==ped(q,'content_mode'))
    if name=='comando': return float((CMD[c['id']]@CMD[q['id']].T).toarray()[0,0])
    if name=='objetivo_completo': return sum(obj(n,q,c) for n in ('habilidade','subtopico','operacao_modo'))
CC={q['id']:comps(q) for q in VA}
def ranking(q,variant,top=20):
    el,tf,lex,sem,sk=CC[q['id']]; o=dedup(el,rrf(tf,sem)); ids=[G[el[j]]['id'] for j in o]
    if variant=='base': return ids
    head=ids[:top]; s=np.array([obj(variant,q,ALL[i]) for i in head])
    rr=1/(60+np.arange(1,len(head)+1)); ro=np.zeros(len(head)); oo=np.argsort(-s,kind='stable'); ro[oo]=1/(60+np.arange(1,len(head)+1))
    new=[head[j] for j in np.argsort(-(rr+ro),kind='stable')]
    return new+ids[top:]
out={}
for v in ('base','habilidade','subtopico','operacao_modo','comando','objetivo_completo'):
    conc=tot=0; p2=[]; z5=0
    for q in VA:
        if q['id'] not in lab: continue
        ids=ranking(q,v); pos={i:k for k,i in enumerate(ids,1)}; L=lab[q['id']]
        for a in L:
            for c in L:
                if L[a]>L[c]: tot+=1; conc+=pos[a]<pos[c]
        p2+=[pos[a] for a,g in L.items() if g==2]; z5+=sum(pos[a]<=5 for a,g in L.items() if g==0)
    out[v]=dict(pares=f'{conc}/{tot}',nota2_posicoes=sorted(p2),nota2_top10=sum(x<=10 for x in p2),nota0_top5=z5,conc=conc)
    print(v,out[v])
base=out['base']
for v,r in out.items():
    if v=='base': continue
    r['aprovada']= r['conc']>=base['conc']+3 and r['nota2_top10']>=base['nota2_top10'] and r['nota0_top5']<=base['nota0_top5']
print({v:r.get('aprovada') for v,r in out.items()})
json.dump({'criterio':CRIT,'reordena':'top 20 do RRF, fusão RRF entre ordem original e ordem pelo sinal','resultados':out},open('reord_result.json','w'),ensure_ascii=False,indent=1)
