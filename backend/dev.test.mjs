import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { carregarAcervo } from './acervo.mjs';
import { criarServidor } from './server.mjs';
import { DevWorker } from './dev-worker.mjs';
import { emptySession, sessionStats, saveReview, exportCSV, removeLatestRecord, restoreRecord } from '../frontend/dev-session.js';

const acervo = await carregarAcervo();
const server = criarServidor(acervo).listen(0,'127.0.0.1');
await once(server,'listening');
const base=`http://127.0.0.1:${server.address().port}`;
after(()=>new Promise(resolve=>{server.close(resolve);server.closeIdleConnections();}));
const get=async path=>{const r=await fetch(base+path);return {status:r.status,data:await r.json()};};
const post=async(path,data)=>{const r=await fetch(base+path,{method:'POST',body:JSON.stringify(data)});return {status:r.status,data:await r.json()};};

test('resumo dev deriva do catálogo e identifica a origem das estatísticas',async()=>{
  const {status,data}=await get('/api/dev/resumo');assert.equal(status,200);
  assert.equal(data.catalog.empty,68);assert.equal(data.catalog.median,45);
  assert.equal(data.catalog.histogram.reduce((n,r)=>n+r.value,0),2731);
  assert.equal(data.distributions.status.reduce((n,r)=>n+r.value,0),3086);
  assert.equal(data.catalog.topFive,13315);assert.equal(data.catalog.newLabelsTopFive,3165);
  assert.equal(data.worker.state,'aguardando','o Python não inicia para consultar estatísticas');
  assert(data.audit.source.includes('não é uma nova execução'));
});

test('explorador encontra IDs, filtra conjuntos e permite inspecionar defeitos sem liberar prática',async()=>{
  const source=acervo.questions.find(q=>acervo.splits.validation.includes(q.id));
  const result=await get(`/api/dev/questoes?busca=${source.id}&split=validation`);
  assert.equal(result.data.total,1);assert.equal(result.data.records[0].id,source.id);
  const defects=await get('/api/dev/questoes?status=defeito');assert.equal(defects.data.total,67);
  const detail=await get('/api/dev/questoes/'+defects.data.records[0].id);
  assert.equal(detail.data.canAnalyze,false);assert(detail.data.question.prompt);assert(detail.data.analysisRestriction);
  const absent=await get('/api/dev/questoes?status=fora');assert.equal(absent.data.total,355);
  assert.equal((await get('/api/dev/questoes?limite=101')).status,400);
});

test('teste 2024 e bloqueios não iniciam diagnóstico numérico',async()=>{
  const q=acervo.questions.find(q=>acervo.splits.test.includes(q.id));
  const detail=await get('/api/dev/questoes/'+q.id);assert.equal(detail.data.canAnalyze,false);
  const result=await post('/api/dev/diagnostico',{questionId:q.id});assert.equal(result.status,422);assert.match(result.data.error,/2024/);
  assert.equal((await get('/api/dev/resumo')).data.worker.state,'aguardando');
  assert.equal((await post('/api/dev/diagnostico',{questionId:'gq_000000000000000000000000'})).status,404);
});

test('página dev e seus módulos são servidos pelo mesmo servidor',async()=>{
  const response=await fetch(base+'/dev');assert.equal(response.status,200);const html=await response.text();
  assert(html.includes('Laboratório do recomendador'));assert(html.includes('id="year"'));
  for(const file of ['/dev.js','/dev.css','/dev-session.js'])assert.equal((await fetch(base+file)).status,200);
});

test('sessão dev separa versões, acerto do usuário e relevância manual',()=>{
  const session=emptySession();
  session.answers.push({baseSha256:'atual',questionId:'q1',correct:true,durationMs:2000},{baseSha256:'atual',questionId:'q1',correct:false,durationMs:4000},{baseSha256:'antiga',questionId:'q2',correct:true,durationMs:1000});
  const review={baseSha256:'atual',questionId:'q1',candidateId:'c1',gallery:'train',rating:'boa'};
  saveReview(session,review);saveReview(session,{...review,rating:'parcial',note:'Reavaliada'});
  assert.equal(session.reviews.length,1);
  const stats=sessionStats(session,'atual');assert.equal(stats.answered,2);assert.equal(stats.distinct,1);assert.equal(stats.accuracy,.5);assert.equal(stats.meanMs,3000);assert.equal(stats.ratings.parcial,1);assert.equal(stats.otherVersions,1);
  assert.equal(sessionStats(emptySession(),'atual').accuracy,null);
});

test('exportação CSV preserva notas multilinha, valores numéricos e neutraliza fórmulas',()=>{
  const session=emptySession();
  session.reviews.push({at:'2026-11-13',baseSha256:'sha',questionId:'q',candidateId:'c',gallery:'train',rating:'ruim',score:.01,components:{qwen:{value:.7}},note:'=1+1\n"rever"'});
  const csv=exportCSV(session);assert(csv.startsWith('\uFEFF'));assert(csv.includes('"\'=1+1\n""rever"""'));assert(csv.includes('"0.7"'));
});

test('remover e desfazer preservam os outros registros da sessão dev',()=>{
  const session=emptySession();session.answers.push({at:'2026-11-13T10:00:00Z',questionId:'q'});session.reviews.push({at:'2026-11-13T11:00:00Z',candidateId:'c'});
  const removed=removeLatestRecord(session);assert.equal(removed.kind,'reviews');assert.equal(session.answers.length,1);assert.equal(session.reviews.length,0);
  restoreRecord(session,removed);assert.equal(session.reviews[0].candidateId,'c');assert.equal(session.answers[0].questionId,'q');
});

test('Python ausente retorna erro explícito sem substituir escores',async()=>{
  const previous=process.env.GABARITEI_PYTHON;
  process.env.GABARITEI_PYTHON=process.execPath+'.python-inexistente';
  const worker=new DevWorker();
  try{await assert.rejects(worker.diagnose({questionId:'gq_29ef25a472475b50d03207ab'}),e=>e.status===503&&e.message.includes('GABARITEI_PYTHON'));assert.equal(worker.status().state,'indisponivel');}
  finally{worker.close();if(previous===undefined)delete process.env.GABARITEI_PYTHON;else process.env.GABARITEI_PYTHON=previous;}
});
