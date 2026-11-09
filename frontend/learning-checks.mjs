import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from './assets/learning-engine.js';

const now = new Date(2026,10,9,12,0,0).getTime();
const demo = E.createDemoAccount(now);
const records = E.collectAnswerRecords(demo);

test('acervo anterior: 254 questões distintas, cinco alternativas e gabarito válido', () => {
  const bank = E.questionRepository.all();
  assert.equal(bank.length,254);
  assert.equal(new Set(bank.map(q=>q.id)).size,bank.length);
  for(const q of bank){assert.equal(q.alternatives.length,5);assert(q.alternatives.some(a=>a.letter===q.correct));assert.equal(q.origin,'demonstrativa');}
});

test('listas respeitam matéria, assunto, subtópico, ano e limite disponível', () => {
  for(const s of E.SUBJECTS){
    const topic=s.topics[0];
    const sample=E.questionRepository.query({subjectId:s.id,topicIds:[topic.id]})[0];
    if(!sample)continue;
    const filters={...E.EMPTY_FILTERS,subjectId:s.id,topicIds:[topic.id],subtopicIds:sample.subtopicId?[sample.subtopicId]:[],years:[sample.year],count:30};
    const available=E.availableForFilters(filters);
    const selected=E.selectPracticeQuestions(filters,records,'checks',demo.onboarding.level);
    assert.equal(selected.length,Math.min(30,available.length));
    assert.equal(new Set(selected).size,selected.length);
    for(const id of selected){const q=E.questionRepository.getById(id);assert.equal(q.subjectId,s.id);assert.equal(q.topicId,topic.id);assert.equal(q.year,sample.year);if(sample.subtopicId)assert.equal(q.subtopicId,sample.subtopicId);}
  }
  assert.deepEqual(E.selectPracticeQuestions({...E.EMPTY_FILTERS,years:[1900]},records,'empty',null),[]);
});

test('seleção automática entrega a quantidade pedida sem duplicar questões', () => {
  for(const count of E.PRACTICE_COUNTS){const selection=E.buildAutoSelection(demo,records,count,now,'checks');assert.equal(selection.questionIds.length,count);assert.equal(new Set(selection.questionIds).size,count);assert(selection.questionIds.every(id=>E.questionRepository.getById(id)));}
});

test('recomendações e rankings referenciam assuntos válidos do acervo', () => {
  const recs=E.recommendTopics({records,difficultSubjects:demo.onboarding.difficultSubjects,now,limit:6});
  assert.equal(recs.length,6);
  for(const rec of recs){assert(E.TOPIC_BY_ID[rec.topicId]);assert(rec.available>0);assert(rec.reason.length>0);}
  for(const t of E.rankTopics(records).weakest)assert(t.answered>=4);
});

test('responder uma questão atualiza a mesma fonte de dados dos gráficos e das metas', () => {
  const account=E.createEmptyAccount({id:'checks',kind:'new',name:'Teste',email:'teste@example.invalid',now});
  const q=E.questionRepository.all()[0];
  let session=E.createPracticeSession({id:'test-list',mode:'custom',title:'Teste',questionIds:[q.id],filters:{...E.EMPTY_FILTERS,count:1},timerVisible:true,now});
  session=E.practice.select(session,q.correct,now+1000);
  session=E.practice.confirm(session,now+5000);
  session=E.practice.finish(session,now+6000);
  account.practiceSessions.push(session);
  const rs=E.collectAnswerRecords(account);
  assert.equal(rs.length,1);
  assert.equal(E.summarize(rs).correct,1);
  assert.equal(E.areaStats(rs).reduce((n,a)=>n+a.answered,0),1);
  assert.equal(E.subjectStats(rs).reduce((n,s)=>n+s.answered,0),1);
  assert.equal(E.buildSeries(rs,'day',now+7000).reduce((n,p)=>n+p.answered,0),1);
  assert.equal(E.activityCalendar(rs,now+7000,20).flat().reduce((n,c)=>n+c.count,0),1);
  assert.equal(E.goalProgress({kind:'weekly_questions',target:10,enabled:true},rs,account,now+7000).current,1);
});

test('pausa e retomada descontam o tempo fora da prática', () => {
  const q=E.questionRepository.all()[0];
  let session=E.createPracticeSession({id:'pause-test',mode:'custom',title:'Teste',questionIds:[q.id],filters:{...E.EMPTY_FILTERS,count:1},timerVisible:true,now});
  session=E.practice.pause(session,now+5000);
  assert.equal(E.clockElapsed(session.clock,now+65000),5000);
  session=E.practice.resume(session,now+65000);
  session=E.practice.select(session,q.correct,now+66000);
  session=E.practice.confirm(session,now+70000);
  assert.equal(session.answers[q.id].timeSpentMs,10000);
  session=E.practice.recover({...session,updatedAt:new Date(now+70000).toISOString()},now+3600000);
  assert.equal(session.clock.runningSince,null);
});

test('histórico, gráficos, distribuição e calendário compartilham totais coerentes', () => {
  const total=E.summarize(records);
  assert.equal(E.areaStats(records).reduce((n,a)=>n+a.answered,0),total.answered);
  assert.equal(E.subjectStats(records).reduce((n,s)=>n+s.correct,0),total.correct);
  assert.equal(E.activityCalendar(records,now,20).flat().reduce((n,c)=>n+c.count,0),total.answered);
  for(const period of ['day','week','month']){const series=E.buildSeries(records,period,now);assert.equal(series.reduce((n,s)=>n+s.answered,0),E.comparePeriods(records,period,now).current.answered);for(const s of series){assert(s.accuracy===null||s.accuracy>=0&&s.accuracy<=1);if(!s.answered)assert.equal(s.accuracy,null);}}
});
