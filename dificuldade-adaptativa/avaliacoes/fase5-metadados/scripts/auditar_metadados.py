from pathlib import Path
import json,csv,collections,hashlib,re,unicodedata,shutil
from pypdf import PdfReader
R=Path(__file__).resolve().parents[1];W=R.parent;B=R/'base4b/projeto';F=R/'fontes';F.mkdir(exist_ok=True)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(name,data):(R/'resultados'/name).write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
def norm(s):return ''.join(c for c in unicodedata.normalize('NFD',s) if unicodedata.category(c)!='Mn').lower()
mapping={};matrixSources=[]
for name,src,url in [('matriz_2012.pdf',W/'dificuldade-adaptativa/catalogo_mvp/matriz_1.pdf','https://download.inep.gov.br/download/enem/matriz_referencia.pdf'),('matriz_2026.pdf',W/'dificuldade-adaptativa/catalogo_mvp/matriz_0.pdf','https://download.inep.gov.br/enem/outros_documentos/enem_matriz_referencia.pdf')]:
 dest=F/name
 if not dest.exists():shutil.copy2(src,dest)
 pages=PdfReader(dest).pages;m={};area=None;competence=None
 lines=[]
 for pageNo,page in enumerate(pages,1):
  if name=='matriz_2026.pdf':
   pageArea='LC' if 3<=pageNo<=6 else 'MT' if 7<=pageNo<=9 else 'CN' if 10<=pageNo<=13 else 'CH' if 14<=pageNo<=16 else None
   if not pageArea:continue
   lines.append('Matriz de Referencia '+{'LC':'Linguagens','MT':'Matematica','CN':'Natureza','CH':'Humanas'}[pageArea])
  lines.extend((page.extract_text() or '').splitlines())
 for line in lines:
  s=norm(line)
  if 'matriz de referencia' in s:
   if 'linguagens' in s:area='LC'
   elif 'matematica' in s:area='MT'
   elif 'natureza' in s:area='CN'
   elif 'humanas' in s:area='CH'
  c=re.search(r'competencia\s+de\s+area\s*(\d+)',s)
  if c:competence=int(c.group(1))
  h=re.match(r'\s*h\s*(\d+)\s*[-–−]',s)
  if h and area and competence:
   key=area+':H'+str(int(h.group(1)));value=competence
   if key in m and m[key]!=value:raise ValueError('Associação ambígua no PDF: '+key)
   m[key]=value
 matrixSources.append({'path':dest.relative_to(R).as_posix(),'url':url,'sha256':sha(dest),'acquisition':'cópia oficial local preexistente; tentativas de novo acesso nesta execução falharam','mappings':len(m)})
 if len(m)!=120:raise ValueError(f'Extração incompleta de {name}: {len(m)}')
 if mapping and mapping!=m:raise ValueError('Mapeamento habilidade-competência mudou entre PDFs; revisão necessária')
 mapping=m
save('mapa_competencias.json',{'source':matrixSources,'numericMap':mapping,'versionsAgree':True,'scope':'relação normativa por área; não julgamento temático humano'})
tables={};sources=[]
for year in range(2009,2025):
 dest=F/'itens_inep'/f'ITENS_PROVA_{year}.csv';dest.parent.mkdir(exist_ok=True)
 if not dest.exists():shutil.copy2(W/'inep_tabelas'/dest.name,dest)
 try:txt=dest.read_text(encoding='utf-8-sig')
 except UnicodeDecodeError:txt=dest.read_text(encoding='latin1')
 entries=list(csv.DictReader(txt.splitlines(),delimiter=';'));index=collections.defaultdict(list)
 for e in entries:index[(e.get('CO_PROVA'),e.get('CO_ITEM'))].append(e)
 tables[year]=index;sources.append({'year':year,'path':dest.relative_to(R).as_posix(),'sha256':sha(dest),'rows':len(entries),'acquisition':'cópia local de ITENS_PROVA, não readquirida nesta execução'})
rows={q['id']:q for q in map(json.loads,(B/'Dataset/base_trabalho/data/questions.jsonl').read_text(encoding='utf-8').splitlines())}
audit=[]
for q in rows.values():
 matches=tables[q['year']].get((str(q.get('co_prova')),str(q.get('co_item'))),[])
 strict=[e for e in matches if e.get('SG_AREA')==q['area'] and str(e.get('CO_POSICAO'))==str(q['official_reference'].get('position')) and e.get('TX_GABARITO')==q['answer']]
 vals={e['CO_HABILIDADE'] for e in strict if e.get('CO_HABILIDADE','').strip()}
 if not strict:status='vinculo_incompleto_ou_divergente';skill=None
 elif not vals:status='habilidade_ausente_na_fonte';skill=None
 elif len(vals)!=1:status='habilidade_ambigua_na_fonte';skill=None
 else:
  skill=int(next(iter(vals)));status='confirmada_na_copia_tabular' if q.get('skill') is not None else 'recuperavel_da_copia_tabular'
  if q.get('skill') is not None and str(q['skill'])!=str(skill):status='divergencia_dataset_fonte';skill=None
  if skill is not None and q['area']+':H'+str(skill) not in mapping:status='codigo_fora_da_matriz';skill=None
 audit.append({'id':q['id'],'year':q['year'],'area':q['area'],'co_prova':q.get('co_prova'),'co_item':q.get('co_item'),'position':q['official_reference'].get('position'),'originalSkill':q.get('skill'),'referenceSkill':skill,'referenceCompetence':mapping.get(q['area']+':H'+str(skill)) if skill else None,'status':status,'strictMatches':len(strict),'sourceFile':f'ITENS_PROVA_{q["year"]}.csv','textToOfficialItemHumanCertified':q.get('quality_review',{}).get('human_certified') is True,'metadataDoesNotCertifyQuestionTextLink':True})
universe=json.loads((R/'protocolo_humano/universo_congelado.json').read_text(encoding='utf-8'));lookup={x['id']:x for x in audit}
formAudit=[];frozen=R/'evidencias/formularios_originais';frozen.mkdir(exist_ok=True)
for who in ['A','B']:
 p=R/f'protocolo_humano/avaliador_{who}.csv';data=list(csv.DictReader(p.open(encoding='utf-8-sig',newline='')));pairs=[x['pair_id'] for x in data]
 expected={x['pair_id']:(x['query_id'],x['candidate_id']) for x in universe['key']}
 assert len(data)==746 and len(set(pairs))==746 and set(pairs)==set(expected)
 assert all(expected[x['pair_id']]==(x['query_id'],x['candidate_id']) for x in data)
 assert not any(any(t in k.lower() for t in ['score','rank','algorithm','escore','estrategia']) for k in data[0])
 filled=sum(x['grade'].strip() in ['0','1','2'] for x in data)
 formAudit.append({'reviewer':who,'pairs':len(data),'validGrades':filled,'reviewerIdentifications':sum(bool(x['reviewer'].strip()) for x in data),'sha256':sha(p),'blindingColumnsOK':True,'duplicatePairs':0})
 if not (frozen/p.name).exists():shutil.copy2(p,frozen/p.name)
ids={x['query_id'] for x in universe['key']}|{x['candidate_id'] for x in universe['key']}
visual=[]
for id in sorted(ids):
 q=rows[id];assets=q.get('assets',[]);available=[];missing=[]
 for asset in assets:
  paths=[B/'Dataset/base_trabalho'/asset['path'],B/'recomendador/rrf-tfidf-minilm-J/base'/asset['path']]
  p=next((p for p in paths if p.exists()),None)
  (available if p else missing).append({'path':asset['path'],'expectedSHA256':asset.get('sha256'),'found':bool(p)})
 visual.append({'id':id,'area':q['area'],'assetsDeclared':len(assets),'available':len(available),'missing':len(missing),'descriptionsAvailable':sum(d.get('use_for_recommender') is True for d in q.get('descriptions',[])),'visualMentionHeuristic':bool(re.search(r'\[imagem\]|figura|gr[aá]fico|tabela|charge',q['question'],re.I)),'officialReference':q['official_reference']})
coverage=[]
for qid in universe['queries']:
 pairs=[p for p in universe['key'] if p['query_id']==qid]
 coverage.append({'query':qid,'area':rows[qid]['area'],'queryReferenceValid':lookup[qid]['referenceSkill'] is not None,'frozenCandidates':len(pairs),'candidateLabelsKnown':sum(lookup[p['candidate_id']]['referenceSkill'] is not None for p in pairs)})
save('auditoria_metadados.json',{'datasetSHA256':sha(B/'Dataset/base_trabalho/data/questions.jsonl'),'records':len(rows),'statuses':dict(collections.Counter(x['status'] for x in audit)),'perYear':[{ 'year':y,'records':sum(x['year']==y for x in audit),'known':sum(x['year']==y and x['referenceSkill'] is not None for x in audit)} for y in range(2009,2025)],'perArea':[{ 'area':a,'records':sum(x['area']==a for x in audit),'known':sum(x['area']==a and x['referenceSkill'] is not None for x in audit)} for a in ['CN','CH','LC','MT']],'frozenQueryCoverage':coverage,'forms':formAudit,'qualificationDocumentsFound':[],'humanAssessorsAssigned':False,'humanJudgmentsReceived':0,'sourceLimit':'Fontes locais atribuídas ao INEP e conferência estrutural; não nova aquisição das tabelas nem certificação humana do vínculo texto-item.'})
save('referencias_por_questao.json',audit);save('material_visual_pendente.json',visual)
sourcesDoc={'matriz':matrixSources,'itens':sources,'officialLandingPage':'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/enem'}
(F/'manifesto_fontes.json').write_text(json.dumps(sourcesDoc,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'statuses':dict(collections.Counter(x['status'] for x in audit)),'knownCandidatesIn746':sum(x['candidateLabelsKnown'] for x in coverage),'queries':len(coverage),'forms':formAudit,'uniqueQuestions':len(ids),'questionsWithMissingAssets':sum(x['missing']>0 for x in visual)},ensure_ascii=False,indent=2))
