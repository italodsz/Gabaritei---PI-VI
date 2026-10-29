from bench import *
import re, unicodedata
from nltk.stem import RSLPStemmer
st=RSLPStemmer(); cache={}
def strip(t): return ''.join(c for c in unicodedata.normalize('NFD',t.lower()) if unicodedata.category(c)!='Mn')
def stem_text(t):
    out=[]
    for w in re.findall(r'\w+',t.lower()):
        if w not in cache: cache[w]=strip(st.stem(w)) if w.isalpha() and len(w)>3 else strip(w)
        out.append(cache[w])
    return ' '.join(out)
def pref_text(t): return ' '.join(w[:5] for w in re.findall(r'\w+',strip(t)))
P=[json.loads(l) for l in open(E+'avaliacoes/pares_desenvolvimento_compativeis.jsonl')]
lab=collections.defaultdict(dict)
for p in P: lab[p['query_id']][p['candidate_id']]=p['human_grade']
def lexvec(prep,**kw):
    v=TfidfVectorizer(**{**cfg,**kw}).fit([prep(TXT[q['id']]) for q in TR]); X=v.transform([prep(TXT[q['id']]) for q in G])
    return lambda q,el:(X[el]@v.transform([prep(TXT[q['id']])]).T).toarray().ravel()
ident=lambda t:t
VAR={'base: TF-IDF palavras':lexvec(ident),
     'TF-IDF com radical (RSLP)':lexvec(stem_text,strip_accents=None),
     'TF-IDF com prefixo de 5 letras':lexvec(pref_text,strip_accents=None)}
cv=TfidfVectorizer(strip_accents='unicode',analyzer='char_wb',ngram_range=(3,5),min_df=3,max_df=0.9,sublinear_tf=True,max_features=120000).fit([TXT[q['id']] for q in TR]); CX=cv.transform([TXT[q['id']] for q in G])
VAR['TF-IDF palavras + caracteres']=lambda q,el:0.7*VAR['base: TF-IDF palavras'](q,el)+0.3*(CX[el]@cv.transform([TXT[q['id']]]).T).toarray().ravel()
CC={q['id']:comps(q) for q in VA}
def evaluate(fn):
    ns=sk=conc=tot=0; ranks={0:[],1:[],2:[]}
    for q in VA:
        el,tf,lex,sem,s=CC[q['id']]; lx=fn(q,el); o=dedup(el,rrf(lx,sem)); ids=[G[el[j]]['id'] for j in o]
        if q.get('skill'):
            for i in ids[:3]: ns+=1; sk+=ALL[i].get('skill')==q['skill']
        L=lab.get(q['id'],{}); pos={i:k for k,i in enumerate(ids,1)}
        for a,g in L.items(): ranks[g].append(pos[a])
        for a in L:
            for b_ in L:
                if L[a]>L[b_]: tot+=1; conc+=pos[a]<pos[b_]
    return sk/ns,conc,tot,ranks
for name,fn in VAR.items():
    h,c,t,r=evaluate(fn)
    r2=sorted(r[2])
    print(f"RRF[{name}] hab@3={h:.1%} pares={c}/{t} posições das nota 2={r2} | nota0 no top5={sum(x<=5 for x in r[0])}/{len(r[0])} top10={sum(x<=10 for x in r[0])}")
