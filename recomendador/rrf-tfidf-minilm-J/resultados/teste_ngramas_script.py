import json, sys, collections, time, numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
sys.path.insert(0,'.'); import recomendador as R, pipeline_baseline as bl
ix=R.Indice(); docs=ix.docs; rows=ix.rows
cfg=json.load(open('base/config_baseline.json'))['tfidf']
tr=[d for d in docs if d['split']=='train']
TXT={d['id']:bl.question_text(rows[d['id']]) for d in docs}
lab=collections.defaultdict(dict)
for p in map(json.loads,open('base/pares_desenvolvimento_compativeis.jsonl')): lab[p['query_id']][p['candidate_id']]=p['human_grade']
val=[d['id'] for d in docs if d['split']=='validation']
def build(ng,mf):
    p=dict(cfg); p['ngram_range']=ng; p['max_features']=mf
    v=TfidfVectorizer(**p,norm='l2',dtype=np.float32).fit([TXT[d['id']] for d in tr])
    return v, v.transform([TXT[d['id']] for d in docs])
def rank(X,qid,sem=None):
    qi=ix.pos[qid]; q=docs[qi]
    pool=np.array([k for k,d in enumerate(docs) if d['split']=='train' and d['area']==q['area'] and d['family']!=q['family']])
    tf=(X[pool]@X[qi].T).toarray().ravel()
    if sem is None: s=tf
    else:
        s=np.zeros(len(pool))
        for v in (tf,sem[pool]@sem[qi]):
            o=np.argsort(-v,kind='stable'); s[o]+=1/(60+np.arange(1,len(v)+1))
    seen=set(); out=[]
    for j in np.argsort(-s,kind='stable'):
        d=docs[pool[j]]
        if d['family'] not in seen: seen.add(d['family']); out.append(d['id'])
    return out
def medir(X,sem):
    ok=tot=0; h=n=0; n2=[]
    for qid in val:
        r=rank(X,qid,sem); pos={i:k for k,i in enumerate(r,1)}
        sk=rows[qid].get('skill')
        if sk is not None:
            for i in r[:5]: n+=1; h+=rows[i].get('skill')==sk
        L=lab.get(qid,{})
        for a in L:
            for b in L:
                if L[a]>L[b]: tot+=1; ok+=pos[a]<pos[b]
        n2+=[pos[a] for a,g in L.items() if g==2]
    return ok,tot,h/n,sorted(n2)
print(f"{'TF-IDF':28s} {'vocab':>7s} | {'sozinho':>12s} {'hab@5':>6s} | {'RRF+MiniLM':>11s} | {'RRF+Qwen':>10s} {'hab@5':>6s}  notas 2 (RRF+Qwen)")
for ng,mf,nome in [((1,1),50000,'só palavras (1)'),((1,2),50000,'palavras+pares (1-2) ATUAL'),((1,3),50000,'1-3, 50 mil termos'),((1,3),150000,'1-3, 150 mil termos'),((1,3),None,'1-3, sem limite')]:
    t=time.time(); v,X=build(ng,mf)
    a=medir(X,None); b=medir(X,ix.M); c=medir(X,ix.Q)
    print(f"{nome:28s} {len(v.vocabulary_):7d} | {a[0]:3d}/44 ({a[0]/44:.0%}) {a[2]:6.1%} | {b[0]:3d}/44 ({b[0]/44:.0%}) | {c[0]:3d}/44 ({c[0]/44:.0%}) {c[2]:6.1%}  {c[3]}  [{time.time()-t:.0f}s]")
