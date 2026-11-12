import json, random, sys, collections, hashlib
sys.path.insert(0,'/home/claude/org/recomendador/rrf-tfidf-minilm-J'); import recomendador as R
ix=R.Indice(); rows=ix.rows
RER=json.load(open('/mnt/user-data/uploads/resultados_reranker_referencias.json',encoding='utf-8'))
old=json.load(open('/home/claude/cega4/protocolo.json')); refs=old['referencias']
SEED='gabaritei-avaliacao-cega-4-v2-tres-metodos-2026-11-06'
rng=random.Random(SEED); blocos=[]; chave=[]
for bi,qid in enumerate(refs,1):
    a=[i for i,_ in ix.ranking(qid,'rrf')[:3]]; b=[i for i,_ in ix.ranking(qid,'rrf_qwen')[:3]]
    c=RER['referencias'][qid]['reranker_pt_rrf_top20'][:3]
    pool=list(dict.fromkeys(a+b+c)); rng.shuffle(pool)
    blocos.append({'bloco':bi,'referencia':qid,'sugestoes':pool})
    for k,i in enumerate(pool,1):
        chave.append({'item':f'S{bi}{k}','referencia':qid,'candidata':i,
          'A_oficial_rrf_minilm':a.index(i)+1 if i in a else None,
          'B_rrf_qwen':b.index(i)+1 if i in b else None,
          'C_rrf_qwen_reranker':c.index(i)+1 if i in c else None})
rer_sha=hashlib.sha256(open('/mnt/user-data/uploads/resultados_reranker_referencias.json','rb').read()).hexdigest()
proto={'protocolo':'avaliacao_cega_4_v2_tres_metodos','data':'2026-11-06','substitui':'avaliação cega 4 (dois métodos), que não chegou a ser aplicada por pessoa',
 'base_sha256':ix.conf['base_sha256'],'vetores_qwen_sha256':R.QWEN_SHA256,'reranker_resultados_sha256':rer_sha,'semente':SEED,
 'metodos':{'A':'oficial: RRF (k=60) TF-IDF + MiniLM em blocos, top 3',
            'B':'candidato 1: RRF (k=60) TF-IDF + Qwen3-Embedding-8B 4 bits, instrução "conceito", top 3',
            'C':'candidato 2: B reordenado pelo Qwen3-Reranker-4B 4 bits (instrução em português) via RRF com a ordem de B, top 20 → top 3'},
 'selecao':old['selecao'],'pares':len(chave),
 'avaliacao':'cada sugestão é avaliada uma vez; a nota vale para todo método que a sugeriu; Pendente não entra na conta',
 'criterios_definidos_antes':{
   'limiares':['nota 2 >= 50% das sugestões do método','nota 1 ou 2 >= 75%','nenhum bloco com duas ou mais notas 0'],
   'decisao':['1. Entre B e C, vale o de maior média; se a diferença de média for menor que 0,10, vale B (mais simples e barato).',
              '2. O escolhido vira oficial se a média dele for maior que a de A.',
              '3. Se ele também cumprir os três limiares, é aprovado sem ressalvas; se não cumprir, é adotado com a limitação registrada por área.'],
   'leitura_por_area':'CN e CH (6 referências) mostram se a falha da avaliação 2 diminuiu; MT e LC (2) verificam que não piora'},
 'avaliador_requerido':'pessoa, sem consultar IA nem avaliações anteriores; preferencialmente Teles; guardar a ficha preenchida com nome e data',
 'referencias':refs}
json.dump(proto,open('protocolo.json','w'),ensure_ascii=False,indent=1)
json.dump(chave,open('chave_NAO_ABRIR.json','w'),ensure_ascii=False,indent=1)
def q(i):
    r=rows[i]; return {'id':i,'area':r['area'],'ano':r['year'],'texto':r['question'] or '','opcoes':[[o['label'],o.get('text') or ''] for o in sorted(r['options'],key=lambda o:o['label'])],'gabarito':r['answer']}
json.dump([{'bloco':x['bloco'],'ref':q(x['referencia']),'sug':[q(i) for i in x['sugestoes']]} for x in blocos],open('conteudo.json','w'),ensure_ascii=False)
cnt=collections.Counter(''.join(m for m,k in (('A','A_oficial_rrf_minilm'),('B','B_rrf_qwen'),('C','C_rrf_qwen_reranker')) if x[k]) for x in chave)
print('sugestões',len(chave),[len(x['sugestoes']) for x in blocos],dict(cnt))
