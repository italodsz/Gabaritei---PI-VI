import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {carregarAcervo} from './acervo.mjs';
import {abrirBanco} from './db.mjs';
import {criarServidor} from './server.mjs';
import {criarIntegridade,tempoValido} from './integridade.mjs';
import {repositorio} from './repositorio.mjs';
const acervo=await carregarAcervo(),TOKEN='test-only-local-development-token-12345';
const cfg=JSON.parse(readFileSync(new URL('./config/dificuldade_v1.json',import.meta.url)));
async function fixture(){
 let now=1800000000000;
 const db=abrirBanco(':memory:'),server=criarServidor(acervo,{db,relogio:()=>now,devLocal:{enabled:true,token:TOKEN}}).listen(0,'127.0.0.1');await once(server,'listening');
 const base=`http://127.0.0.1:${server.address().port}`;
 function client(){let cookie='';return async(method,path,body,headers={})=>{
  const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',Cookie:cookie,...headers},body:body===undefined?undefined:JSON.stringify(body)});
  for(const c of r.headers.getSetCookie()) {const first=c.split(';')[0],name=first.split('=')[0];cookie=cookie.split('; ').filter(x=>!x.startsWith(name+'=')).concat(first).filter(Boolean).join('; ');}
  return {status:r.status,data:await r.json()};};}
 const c=client(),q=acervo.questions.find(q=>q.sourceArea==='MT'&&q.tri);
 const emit=(session='sessao',question=q,origem='pratica')=>c('POST',`/api/questoes/${question.id}/tentativas`,{sessaoId:session,origem});
 const answer=(a,extra={})=>c('POST',`/api/questoes/${q.id}/responder`,{tentativaId:a.data.tentativaId,selected:q.correct,tempoMs:8000,...extra});
 return {db,c,client,q,emit,answer,tick:ms=>{now+=ms;},now:()=>now,panel:()=>c('GET','/api/dev/dificuldade',undefined,{Authorization:'Bearer '+TOKEN}),close:()=>new Promise(r=>{server.close(r);server.closeIdleConnections();})};
}
for(const seconds of [3,7,8])test(`intervalo servidor: ${seconds}s`,async()=>{const f=await fixture();try{const a=await f.emit();f.tick(seconds*1000);const r=await f.answer(a,{tempoMs:seconds*1000});assert.equal(r.status,seconds<8?425:200);assert.equal(f.db.prepare('SELECT COUNT(*) n FROM evento_integridade').get().n,seconds<8?0:1);}finally{await f.close();}});
for(const value of [undefined,null,'8000',true,-1,0,7999,8000.5])test(`tempo cliente inválido: ${String(value)}`,async()=>{const f=await fixture();try{const a=await f.emit();f.tick(9000);const r=await f.answer(a,{tempoMs:value});assert.equal(r.status,422);assert.equal(f.db.prepare('SELECT COUNT(*) n FROM evento_integridade').get().n,0);assert.equal((await f.panel()).data.N,0);}finally{await f.close();}});
test('fraudar cronômetro cliente não vence o intervalo servidor',async()=>{const f=await fixture();try{const a=await f.emit();f.tick(1000);assert.equal((await f.answer(a,{tempoMs:999999})).status,425);}finally{await f.close();}});
test('tentativa inexistente, de outro sujeito, incompatível e expirada são recusadas',async()=>{const f=await fixture();try{const a=await f.emit();f.tick(8000);assert.equal((await f.answer({data:{tentativaId:'nao-existe'}})).status,404);const other=f.client();assert.equal((await other('POST',`/api/questoes/${f.q.id}/responder`,{selected:f.q.correct,tentativaId:a.data.tentativaId,tempoMs:8000})).status,401);const wrong=acervo.questions.find(q=>q.id!==f.q.id);assert.equal((await f.c('POST',`/api/questoes/${wrong.id}/responder`,{selected:'A',tentativaId:a.data.tentativaId,tempoMs:8000})).status,409);f.tick(7*3600_000);assert.equal((await f.answer(a)).status,410);}finally{await f.close();}});
test('Anterior e retomada reutilizam a apresentação; retry não duplica evento',async()=>{const f=await fixture();try{const a=await f.emit(),again=await f.emit();assert.equal(a.data.tentativaId,again.data.tentativaId);f.tick(8000);const first=await f.answer(a),repeat=await f.answer(a);assert.deepEqual(repeat,first);assert.equal(f.db.prepare('SELECT COUNT(*) n FROM evento_integridade').get().n,1);assert.equal((await f.answer(a,{selected:f.q.correct==='A'?'B':'A'})).status,409);}finally{await f.close();}});
test('dez reenvios concorrentes produzem um só evento e contador',async()=>{const f=await fixture();try{const a=await f.emit();f.tick(8000);const rs=await Promise.all(Array.from({length:10},()=>f.answer(a)));assert(rs.every(r=>r.status===200));assert.equal(new Set(rs.map(r=>r.data.tri.eventId)).size,1);assert.equal(rs[0].data.tri.perfil.n,1);}finally{await f.close();}});
test('sonda 18 revisões: uma evidência e meta inalterada',async()=>{const f=await fixture();try{const a=await f.emit();f.tick(8000);const first=await f.answer(a),profile=first.data.tri.perfil;for(let n=0;n<18;n++){const b=await f.emit('revisao-'+n);f.tick(8000);const r=await f.answer(b);assert.equal(r.data.tri.motivo,'repeticao');assert.deepEqual(r.data.tri.perfil,profile);}const view=(await f.c('GET','/api/eu/perfil-tri')).data;assert.deepEqual(view.perfis.MT,profile);assert.equal(profile.n,1);assert.equal(profile.respostas.length,1);assert.equal(f.db.prepare('SELECT COUNT(*) n FROM evento_integridade').get().n,19);}finally{await f.close();}});
test('importar n=15 e vetor inválido não promove o perfil e preserva legado deduplicado',async()=>{const f=await fixture();try{await f.emit();const payload={perfis:{MT:{lw:[0],n:15}}};const a=await f.c('PUT','/api/eu/perfil-tri',payload),b=await f.c('PUT','/api/eu/perfil-tri',payload);assert.equal(a.status,200);assert.equal(a.data.perfis.MT.n,0);assert.equal(a.data.importacao.promovido,false);assert.equal(a.data.importacao.hash,b.data.importacao.hash);assert.equal(f.db.prepare('SELECT COUNT(*) n FROM legado_importado').get().n,1);}finally{await f.close();}});
test('apoio servidor não pode ser ocultado com apoio=false',async()=>{const f=await fixture();try{const a=await f.emit();await f.c('POST',`/api/tentativas/${a.data.tentativaId}/apoio`,{});f.tick(8000);const r=await f.answer(a,{apoio:false});assert.equal(r.data.tri.motivo,'com_apoio');assert.equal(r.data.tri.conta,false);assert.equal(r.data.tri.adapta,false);}finally{await f.close();}});
test('TRI e controlador não usam item reprovado pela triagem',async()=>{const f=await fixture();try{const q=acervo.questions.find(q=>q.sourceArea==='MT'&&!q.tri),a=await f.emit('sem-tri',q);f.tick(8000);const r=await f.c('POST',`/api/questoes/${q.id}/responder`,{selected:q.correct,tentativaId:a.data.tentativaId,tempoMs:8000});assert.equal(r.data.tri.conta,false);assert.equal(r.data.tri.perfil.respostas.length,0);}finally{await f.close();}});
test('replay de eventos reconstrói perfil inclusive alvo de desafio',async()=>{const f=await fixture();try{for(let i=0;i<5;i++){const q=acervo.questions.filter(q=>q.sourceArea==='MT'&&q.tri)[i];const a=await f.emit('sequencia',q);f.tick(8000);await f.c('POST',`/api/questoes/${q.id}/responder`,{selected:q.correct,tentativaId:a.data.tentativaId,tempoMs:8000,desafio:'leve'});}const s=f.db.prepare('SELECT sujeito FROM evento_integridade LIMIT 1').get().sujeito;const engine=criarIntegridade({db:f.db,repo:repositorio(f.db),acervo,cfg,relogio:f.now});assert.deepEqual(engine.reconstruir(s),engine.perfis(s));}finally{await f.close();}});
test('exceção ao projetar provoca rollback do evento e permite retry limpo',async()=>{const f=await fixture();try{const a=await f.emit();f.tick(8000);f.db.exec("CREATE TRIGGER falha_teste BEFORE INSERT ON perfil_verificado BEGIN SELECT RAISE(ABORT,'fixture rollback'); END");assert.equal((await f.answer(a)).status,500);assert.equal(f.db.prepare('SELECT COUNT(*) n FROM evento_integridade').get().n,0);f.db.exec('DROP TRIGGER falha_teste');assert.equal((await f.answer(a)).data.tri.perfil.n,1);}finally{await f.close();}});
test('mínimo numérico compartilhado é estrito',()=>{assert(tempoValido(8000));for(const v of [NaN,Infinity,'8000',true,null,undefined,-1,7999,8000.2])assert.equal(tempoValido(v),false);});
test('calibração 1/19 vira 1/1, com exclusões auditáveis',async()=>{const f=await fixture();try{for(let n=0;n<19;n++){const a=await f.emit('calib-'+n);f.tick(8000);await f.answer(a);}const d=(await f.panel()).data;assert.equal(d.eventos,19);assert.equal(d.contamParaTheta,1);assert.equal(d.N,1);assert.equal(d.calibracao.reduce((s,b)=>s+b.n,0),1);assert.equal(d.motivosNaoConta.find(m=>m.motivo==='repeticao').n,18);}finally{await f.close();}});
test('previsão congelada antes da resposta não muda com respostas intermediárias',async()=>{const f=await fixture();try{const q2=acervo.questions.filter(q=>q.sourceArea==='MT'&&q.tri)[1],a=await f.emit(),b=await f.emit('segunda',q2);const p=f.db.prepare('SELECT chance_previa FROM tentativa_integridade WHERE id=?').get(b.data.tentativaId).chance_previa;f.tick(8000);await f.answer(a);const r=await f.c('POST',`/api/questoes/${q2.id}/responder`,{selected:q2.correct,tentativaId:b.data.tentativaId,tempoMs:8000});assert.equal(r.data.tri.chancePrevista,p);assert.equal((await f.panel()).data.N,2);}finally{await f.close();}});
test('painel vazio usa N=0 sem inventar taxa e exige capacidade local',async()=>{const f=await fixture();try{assert.equal((await f.c('GET','/api/dev/dificuldade')).status,403);const d=(await f.panel()).data;assert.equal(d.N,0);assert.deepEqual(d.calibracao,[]);}finally{await f.close();}});
test('laboratório fica desabilitado por padrão, inclusive o worker semântico',async()=>{const db=abrirBanco(':memory:'),server=criarServidor(acervo,{db,devLocal:{enabled:false,token:TOKEN}}).listen(0,'127.0.0.1');await once(server,'listening');try{for(const p of ['/api/dev/dificuldade','/api/dev/resumo','/api/dev/diagnostico']){const r=await fetch(`http://127.0.0.1:${server.address().port}${p}`,{headers:{Authorization:'Bearer '+TOKEN}});assert.equal(r.status,404);}}finally{await new Promise(r=>{server.close(r);server.closeIdleConnections();});}});


test('outra sessão de exercício não pode responder à tentativa alheia',async()=>{
 const f=await fixture();try{const a=await f.emit(),other=f.client();await other('POST',`/api/questoes/${f.q.id}/tentativas`,{sessaoId:'outro'});f.tick(8000);
 assert.equal((await other('POST',`/api/questoes/${f.q.id}/responder`,{selected:f.q.correct,tentativaId:a.data.tentativaId,tempoMs:8000})).status,404);
 assert.equal(f.db.prepare('SELECT COUNT(*) n FROM evento_integridade').get().n,0);
 }finally{await f.close();}
});

test('SQLite em disco: perfil e recibo sobrevivem ao reinício; tentativa pendente é renovada',()=>{
 const dir=mkdtempSync(join(tmpdir(),'gabaritei-fase4a-'));const path=join(dir,'fixture.sqlite');let db,now=1800000000000;
 try{
 db=abrirBanco(path);const s='session:fixture-persistencia',q=acervo.questions.find(q=>q.sourceArea==='MT'&&q.tri);
 let engine=criarIntegridade({db,repo:repositorio(db),acervo,cfg,relogio:()=>now});
 const a=engine.emitir(s,q.id,{sessaoId:'persistente'}),pending=engine.emitir(s,q.id,{sessaoId:'pendente'});
 now+=8000;const input={tentativaId:a.tentativaId,selected:q.correct,tempoMs:8000};const receipt=engine.responder(s,q.id,input);
 const before=engine.perfis(s);db.close();db=abrirBanco(path);
 engine=criarIntegridade({db,repo:repositorio(db),acervo,cfg,relogio:()=>now});
 assert.deepEqual(engine.perfis(s),before);assert.deepEqual(engine.reconstruir(s),before);
 assert.deepEqual(engine.responder(s,q.id,input),receipt);
 assert.throws(()=>engine.responder(s,q.id,{...input,tentativaId:pending.tentativaId}),e=>e.status===410||e.statusCode===410);
 assert.notEqual(engine.emitir(s,q.id,{sessaoId:'pendente'}).tentativaId,pending.tentativaId);
 assert.equal(db.prepare('SELECT COUNT(*) n FROM evento_integridade').get().n,1);
 }finally{db?.close();rmSync(dir,{recursive:true,force:true});}
});
