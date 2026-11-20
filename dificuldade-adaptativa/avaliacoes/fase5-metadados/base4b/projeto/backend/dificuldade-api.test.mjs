import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { carregarAcervo } from './acervo.mjs';
import { criarServidor } from './server.mjs';
import { abrirBanco } from './db.mjs';
import * as T from '../frontend/dificuldade.js';

const acervo = await carregarAcervo();
const db = abrirBanco(':memory:');
let now=1800000000000;const TOKEN='test-only-local-development-token-12345';
const server = criarServidor(acervo, { db,relogio:()=>now,devLocal:{enabled:true,token:TOKEN} }).listen(0, '127.0.0.1');
await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;
after(() => new Promise(r => { server.close(r); server.closeIdleConnections(); }));
function cliente(){
 let cookie='',counter=0;
 const chamar=async(m,c,d)=>{const r=await fetch(base+c,{method:m,headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`,...(cookie?{Cookie:cookie}:{})},body:d===undefined?undefined:JSON.stringify(d)});for(const raw of r.headers.getSetCookie()){const ck=raw.split(';')[0],name=ck.split('=')[0];cookie=cookie.split('; ').filter(x=>!x.startsWith(name+'=')).concat(ck).filter(Boolean).join('; ');}return {status:r.status,data:await r.json()};};
 return {get:c=>chamar('GET',c),put:(c,d)=>chamar('PUT',c,d),post:async(c,d={})=>{
  const match=c.match(/^\/api\/questoes\/(gq_[a-f0-9]+)\/responder$/);
  if(match&&d.tempoMs!==undefined&&!d.tentativaId){const a=await chamar('POST',`/api/questoes/${match[1]}/tentativas`,{sessaoId:'fixture-'+counter++});now+=Math.max(8000,d.tempoMs);d={...d,tentativaId:a.data.tentativaId};}
  if(c==='/api/eu/perfil-tri/respostas'&&d.respostas){const respostas=[];for(const r of d.respostas){const a=await chamar('POST',`/api/questoes/${r.questaoId}/tentativas`,{sessaoId:'sim-'+counter++,origem:'simulado'});respostas.push({...r,tentativaId:a.data.tentativaId});}now+=60000;d={...d,respostas};}
  return chamar('POST',c,d);
 }};
}

const mt = acervo.questions.filter(q => q.sourceArea === 'MT' && q.tri);
const semTri = acervo.questions.find(q => !q.tri);

test('o acervo traz parâmetros TRI triados para a maioria das questões liberadas', () => {
  const com = acervo.questions.filter(q => q.tri).length;
  assert.ok(com > 1500 && com < acervo.questions.length, `${com}`);
  assert.ok(acervo.questions.filter(q => q.tri).every(q => q.tri.a >= 0.4 && q.tri.b <= 5));
});

test('config pública e perfil sem login', async () => {
  const c = cliente();
  const cfg = (await c.get('/api/dificuldade/config')).data;
  assert.equal(cfg.D, 1); assert.equal(cfg.metas.ponto, 0.75); assert.match(cfg.sha256, /^[a-f0-9]{64}$/);
  assert.deepEqual((await c.get('/api/eu/perfil-tri')).data, { usuario: null });
  const r = await c.post(`/api/questoes/${mt[0].id}/responder`, { selected: 'A' });
  assert.equal(r.status,401); // envio sem apresentação deve ser rejeitado
});

test('com login, cada resposta vira evento e atualiza o θ; repetição, apoio e chute rápido não contam', async () => {
  const c = cliente();
  await c.post('/api/auth/registrar', { nome: 'Teste TRI', email: 'tri@exemplo.com', senha: 'senha-segura-123' });
  for (let i = 0; i < 16; i++) {
    const q = mt[i];
    const r = await c.post(`/api/questoes/${q.id}/responder`, { selected: q.correct, tempoMs: 40000 });
    assert.equal(r.status, 200); assert.equal(r.data.tri.conta, true); assert.ok(r.data.tri.chancePrevista > 0 && r.data.tri.chancePrevista < 1);
  }
  const rep = await c.post(`/api/questoes/${mt[0].id}/responder`, { selected: mt[0].correct, tempoMs: 40000 });
  assert.equal(rep.data.tri.motivo, 'repeticao');
  assert.equal((await c.post(`/api/questoes/${mt[20].id}/responder`, { selected: 'A', apoio: true, tempoMs: 40000 })).data.tri.motivo, 'com_apoio');
  assert.equal((await c.post(`/api/questoes/${mt[21].id}/responder`, { selected: 'A', tempoMs: 2000 })).status,422);
  if (semTri) assert.equal((await c.post(`/api/questoes/${semTri.id}/responder`, { selected: 'A', tempoMs: 40000 })).data.tri?.motivo ?? 'parametros_fora_da_triagem', 'parametros_fora_da_triagem');
  const v = (await c.get('/api/eu/perfil-tri')).data;
  assert.equal(v.perfis.MT.n, 16);
  const r = v.resumos.find(x => x.area === 'MT');
  assert.notEqual(r.status, 'calibrando'); assert.ok(r.nota > 600, `acertou 16 de 16 e ficou com ${r.nota}`);
  assert.equal(v.historico.filter(h => h.area === 'MT').length, 1);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM evento_integridade').get().n, 16 + 2 + (semTri ? 1 : 0));
});

test('simulado: respostas conferidas no servidor com peso de prova', async () => {
  const c = cliente();
  await c.post('/api/auth/registrar', { nome: 'Sim', email: 'sim@exemplo.com', senha: 'senha-segura-123' });
  const ch = acervo.questions.filter(q => q.sourceArea === 'CH' && q.tri).slice(0, 5);
  const r = await c.post('/api/eu/perfil-tri/respostas', { respostas: ch.map(q => ({ questaoId: q.id, alternativa: q.correct, tempoMs: 60000 })) });
  assert.equal(r.data.registradas, 5); assert.equal(r.data.perfis.CH.n, 5);
  assert.equal(db.prepare("SELECT COUNT(*) n FROM evento_integridade WHERE origem='simulado'").get().n, 5);
});

test('recomendar: semelhante mantém o recorte do titulo_area; conjunto e aleatório respeitam filtros e tamanho', async () => {
  const c = cliente();
  const ref = acervo.questions.find(q => q.tri && acervo.catalogo.recomendacoes[q.id].length >= 20);
  const s = (await c.post('/api/recomendar', { modo: 'semelhante', questaoRef: ref.id, limite: 10 })).data;
  const base = acervo.recommendations(ref.id, [], 50);
  assert.equal(s.ids.length, 10); assert.ok(s.ids.every(id => base.includes(id)));
  assert.equal(s.ids[0], base[0]); // peso leve: a mais relevante continua na frente quando há chance para todas
  const semDif = (await c.post('/api/recomendar', { modo: 'semelhante', questaoRef: ref.id, limite: 10, usarDificuldade: false })).data;
  assert.deepEqual(semDif.ids, base.slice(0, 10));
  const ids = mt.slice(0, 60).map(q => q.id);
  const conj = (await c.post('/api/recomendar', { modo: 'conjunto', ids, limite: 10 })).data;
  assert.equal(conj.ids.length, 10); assert.ok(conj.ids.every(id => ids.includes(id)));
  const facil = conj.itens.reduce((a, b) => (b.chance > a.chance ? b : a));
  assert.equal(conj.ids[0], facil.id); // aquecimento
  const ale = (await c.post('/api/recomendar', { modo: 'aleatorio', area: 'CN', limite: 8 })).data;
  assert.equal(ale.ids.length, 8); assert.ok(ale.ids.every(id => acervo.byId.get(id).sourceArea === 'CN'));
  const mat = (await c.post('/api/recomendar', { modo: 'aleatorio', materia: 'fisica', limite: 5, usarDificuldade: false })).data;
  assert.ok(mat.ids.every(id => acervo.byId.get(id).subjectId === 'fisica'));
  assert.equal((await c.post('/api/recomendar', { modo: 'outro' })).status, 400);
});

test('perfis arbitrários do navegador são ignorados e arquivados sem promover contagens', async () => {
  const c = cliente();
  const cfg = (await c.get('/api/dificuldade/config')).data;
  const n = Math.round((cfg.grade.max - cfg.grade.min) / cfg.grade.passo) + 1;
  const forte = Array.from({ length: n }, (_, i) => -0.5 * (((cfg.grade.min + i * cfg.grade.passo) - 2.5) / 0.3) ** 2);
  const fraco = Array.from({ length: n }, (_, i) => -0.5 * (((cfg.grade.min + i * cfg.grade.passo) + 1) / 0.3) ** 2);
  const ids = mt.slice(0, 200).map(q => q.id);
  const a = (await c.post('/api/recomendar', { modo: 'conjunto', ids, limite: 5, perfis: { MT: { lw: forte, n: 40 } } })).data;
  const b = (await c.post('/api/recomendar', { modo: 'conjunto', ids, limite: 5, perfis: { MT: { lw: fraco, n: 40 } } })).data;
  const prior=T.perfilInicial('MT',cfg);
  for(const r of [a,b])for(const item of r.itens)assert.equal(item.chance,T.chance(prior,acervo.byId.get(item.id).tri,cfg));
  assert.ok(b.itens.every(x=>x.apoioDisponivel===(x.chance<0.45)));
  await c.post('/api/auth/registrar', { nome: 'Novo', email: 'novo@exemplo.com', senha: 'senha-segura-123' });
  const v = (await c.put('/api/eu/perfil-tri', { perfis: { MT: { lw: forte, n: 40 } } })).data;
  assert.equal(v.perfis.MT.n,0);assert.equal(v.importacao.promovido,false);assert.equal(v.resumos.find(r=>r.area==='MT').status,'calibrando');
});

test('laboratório: calibração previsto × observado', async () => {
  const d = (await cliente().get('/api/dev/dificuldade')).data;
  assert.ok(d.eventos >= 21); assert.ok(d.calibracao.length >= 1); assert.ok(d.motivosNaoConta.some(m => m.motivo === 'repeticao'));
});
