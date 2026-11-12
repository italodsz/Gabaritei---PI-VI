import json, hashlib, random, sys
sys.path.insert(0,'/home/claude/pkg/recomendador_italo_rrf')
import recomendador as R
ix=R.Indice(); rows=ix.rows
SEED='gabaritei-avaliacao-cega-2026-10-29'
USADAS={'gq_d44b2128b5cc27ae1028bb0d','gq_79fcf6bf11c88002d01701d9','gq_7577d93ba4e3a9a8709d140e','gq_375ce58eb2ecbf1eb62fedd6'}
test=[d for d in ix.docs if d['split']=='test' and d['id'] not in USADAS]
refs=[]
for area in ('MT','CN','CH','LC'):
    c=sorted([d for d in test if d['area']==area],key=lambda d:hashlib.sha256((SEED+d['id']).encode()).hexdigest())
    refs+=[d['id'] for d in c[:2]]
blocos=[]; chave=[]
rng=random.Random(SEED)
for bi,qid in enumerate(refs,1):
    top=[i for i,_ in ix.ranking(qid,'rrf')[:3]]
    ordem=top[:]; rng.shuffle(ordem)
    blocos.append({'bloco':bi,'referencia':qid,'sugestoes':ordem})
    for k,i in enumerate(ordem,1): chave.append({'item':f'S{bi}{k}','referencia':qid,'candidata':i,'posicao_rrf':top.index(i)+1})
proto={'protocolo':'avaliacao_cega_rrf_v1','data':'2026-10-29','configuracao':'DECISAO_FINAL.json (RRF k=60, TF-IDF + MiniLM)',
 'base_sha256':ix.conf['base_sha256'],'semente':SEED,'selecao':'2 referências por área do teste elegível, ordenadas por sha256(semente+id); exclui as 4 do piloto reservado',
 'sugestoes_por_referencia':3,'pares':len(chave),
 'criterios_definidos_antes':{'proporcao_nota_2_min':0.50,'proporcao_nota_1_ou_2_min':0.75,'blocos_com_duas_ou_mais_notas_0_max':0},
 'regras':['avaliador humano, sem consultar IA nem notas anteriores','pendente nao vira 0','nota de integridade separada da relevancia','dificuldade nao entra'],
 'referencias':refs}
json.dump(proto,open('protocolo.json','w'),ensure_ascii=False,indent=1)
json.dump(chave,open('chave_NAO_ABRIR.json','w'),ensure_ascii=False,indent=1)
json.dump(blocos,open('blocos.json','w'),ensure_ascii=False,indent=1)
print(len(refs),len(chave),[rows[r]['area']+str(rows[r]['year']) for r in refs])
