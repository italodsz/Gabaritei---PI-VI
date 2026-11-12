import json, hashlib, random, sys, collections, csv, re
sys.path.insert(0,'/home/claude/org/recomendador/rrf-tfidf-minilm-J'); import recomendador as R
ix=R.Indice(); rows=ix.rows
SEED='gabaritei-avaliacao-escala-validacao-2026-11-06'
dev={json.loads(l)['query_id'] for l in open('/home/claude/org/recomendador/rrf-tfidf-minilm-J/base/pares_desenvolvimento_compativeis.jsonl')}
val=[d for d in ix.docs if d['split']=='validation' and d['id'] not in dev]
COTA={'CN':12,'CH':12,'LC':6,'MT':6}; refs=[]
for a,n in COTA.items():
    c=sorted([d for d in val if d['area']==a],key=lambda d:hashlib.sha256((SEED+d['id']).encode()).hexdigest()); refs+=[d['id'] for d in c[:n]]
def fmt(i):
    r=rows[i]; t=(r['question'] or '').strip()
    return t+'\n\n'+'\n'.join(f"{o['label']}) {(o.get('text') or '').strip()}" for o in sorted(r['options'],key=lambda o:o['label']))+f"\n\nGabarito: {r['answer']}"
rng=random.Random(SEED); pares=[]; chave=[]
for bi,q in enumerate(refs,1):
    a=[i for i,_ in ix.ranking(q,'rrf')[:5]]; b=[i for i,_ in ix.ranking(q,'rrf_qwen')[:5]]
    pool=list(dict.fromkeys(a+b)); rng.shuffle(pool)
    for k,c in enumerate(pool,1):
        pid=f'R{bi:02d}-S{k}'
        pares.append({'par_id':pid,'bloco':bi,'area':rows[q]['area'],'referencia_id':q,'referencia':fmt(q),'sugestao_id':c,'sugestao':fmt(c)})
        chave.append({'par_id':pid,'referencia':q,'candidata':c,'A_oficial_rrf_minilm':a.index(c)+1 if c in a else None,'B_rrf_qwen':b.index(c)+1 if c in b else None})
cal=sorted(rng.sample(range(len(pares)),50))
json.dump({'semente':SEED,'referencias':refs,'pares':len(pares),'calibracao_par_ids':[pares[i]['par_id'] for i in cal]},open('protocolo.json','w'),ensure_ascii=False,indent=1)
json.dump(chave,open('chave_NAO_ABRIR.json','w'),ensure_ascii=False,indent=1)
cols=['par_id','bloco','area','referencia','sugestao','nota','pendente','texto_com_problema','comentario']
def dump(path,lst):
    with open(path,'w',newline='',encoding='utf-8-sig') as f:
        w=csv.DictWriter(f,fieldnames=cols,delimiter=';',quoting=csv.QUOTE_ALL); w.writeheader()
        for p in lst: w.writerow({**{k:p[k] for k in cols[:5]},'nota':'','pendente':'','texto_com_problema':'','comentario':''})
    with open(path.replace('.csv','.jsonl'),'w',encoding='utf-8') as f:
        for p in lst: f.write(json.dumps({k:p[k] for k in cols[:5]}|{'nota':None,'pendente':False,'texto_com_problema':False,'comentario':''},ensure_ascii=False)+'\n')
dump('pares_para_o_agente.csv',pares)
dump('calibracao_50_pares_ITALO.csv',[pares[i] for i in cal])
c=collections.Counter(p['area'] for p in pares)
print(len(refs),'referências |',len(pares),'pares |',dict(c),'| máx por bloco',max(collections.Counter(p['bloco'] for p in pares).values()))
amb=sum(1 for x in chave if x['A_oficial_rrf_minilm'] and x['B_rrf_qwen']); print('em comum A e B:',amb)
