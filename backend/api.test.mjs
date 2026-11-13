import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { carregarAcervo, DATASET_SHA256 } from './acervo.mjs';
import { criarServidor } from './server.mjs';

const acervo = await carregarAcervo();
const server = criarServidor(acervo).listen(0, '127.0.0.1');
await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;
after(() => new Promise(resolve => { server.close(resolve); server.closeIdleConnections(); }));
const get = async path => { const r = await fetch(base + path); return { status: r.status, data: await r.json() }; };
const post = async (path, data) => { const r = await fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); return { status: r.status, data: await r.json() }; };

test('base final e catálogo carregam alinhados, sem banco e sem questões bloqueadas na prática', async () => {
  const { status, data } = await get('/api/health');
  assert.equal(status, 200); assert.equal(data.sha256, DATASET_SHA256);
  assert.equal(data.total, 3086); assert.equal(data.eligible, 2731); assert.equal(data.available, 2657);
  assert.equal(data.emptyRecommendationLists, 68); assert.equal(data.database, false);
  const bootstrap = (await get('/api/bootstrap')).data;
  assert.equal(bootstrap.questions.length, 2657);
  for (const q of bootstrap.questions) {
    const m = acervo.catalogo.questoes[q.id]; assert(!m.defeito && !m.duplicata);
    assert(q.origin === 'oficial'); assert(q.alternatives.some(a => a.letter === q.correct));
  }
  assert.deepEqual(bootstrap.years, Array.from({ length: 16 }, (_, i) => 2024 - i));
});

test('filtros e paginação retornam questões reais da matéria, área e ano escolhidos', async () => {
  const { data } = await get('/api/questoes?area=MT&materia=matematica&ano=2023&limite=3&inicio=2');
  assert(data.total > 3); assert.equal(data.questions.length, 3);
  assert(data.questions.every(q => q.sourceArea === 'MT' && q.subjectId === 'matematica' && q.year === 2023));
  assert.equal((await get('/api/questoes?limite=-1')).status, 400);
  assert.equal((await get('/api/questoes?limite=101')).status, 400);
  assert.equal((await get('/api/questoes?limite=NaN')).status, 400);
});

test('sugestões preservam a ordem oficial e excluem questões já usadas e suas famílias', async () => {
  const source = acervo.questions.find(q => acervo.catalogo.recomendacoes[q.id].length >= 10);
  const original = acervo.catalogo.recomendacoes[source.id];
  const initial = await get(`/api/questoes/${source.id}/recomendacoes`);
  assert.deepEqual(initial.data.ids, original.slice(0, 5));
  const excluded = [source.id, original[0]];
  const result = await post(`/api/questoes/${source.id}/recomendacoes`, { exclude: excluded, limit: 10 });
  assert.equal(result.status, 200); assert.equal(result.data.method, 'titulo_area');
  const families = new Set(excluded.map(id => acervo.byId.get(id).familyId));
  assert.deepEqual(result.data.ids, original.filter(id => !families.has(acervo.byId.get(id).familyId)).slice(0, 10));
});

test('catálogo completo mantém matéria, título, área, idioma e exclusões de família', () => {
  for (const q of acervo.questions) {
    const meta = acervo.catalogo.questoes[q.id], families = new Set([q.familyId]);
    for (const id of acervo.recommendations(q.id, [], 50)) {
      const candidate = acervo.byId.get(id), cm = acervo.catalogo.questoes[id];
      assert(!families.has(candidate.familyId)); families.add(candidate.familyId);
      assert.equal(candidate.areaId, q.areaId); assert.equal(cm.materia, meta.materia); assert.equal(cm.titulo, meta.titulo);
      if (q.foreignLanguage || candidate.foreignLanguage) assert.equal(candidate.foreignLanguage, q.foreignLanguage);
    }
  }
});

test('lista vazia é informada sem completar com sorteio; defeitos não abrem na prática', async () => {
  const id = 'gq_1a3a6d4a138f7ba1fba29cef';
  const result = await get(`/api/questoes/${id}/recomendacoes`);
  assert.deepEqual(result.data.ids, []); assert(result.data.reason);
  const defective = Object.keys(acervo.catalogo.questoes).find(id => acervo.catalogo.questoes[id].defeito);
  assert.equal((await get(`/api/questoes/${defective}`)).status, 422);
  assert.equal((await post(`/api/questoes/${defective}/responder`, { selected: 'A' })).status, 422);
  assert.equal((await get('/api/questoes/gq_000000000000000000000000')).status, 404);
});

test('correção usa o gabarito oficial e não promete persistência no servidor', async () => {
  const q = acervo.questions[0], path = `/api/questoes/${q.id}/responder`;
  const right = await post(path, { selected: q.correct });
  assert.equal(right.data.correct, true); assert.equal(right.data.answer, q.correct); assert.equal(right.data.persisted, false);
  const wrong = await post(path, { selected: q.correct === 'A' ? 'B' : 'A' });
  assert.equal(wrong.data.correct, false);
  assert.equal((await post(path, { selected: '<script>' })).status, 400);
  const malformed = await fetch(base + path, { method: 'POST', body: '{' }); assert.equal(malformed.status, 400);
});

test('descrições aprovadas chegam ao app e os arquivos privados não são servidos', async () => {
  assert(acervo.questions.some(q => q.descriptions.length));
  for (const path of ['/package.json', '/backend/server.mjs', '/Dataset/base_trabalho/data/questions.jsonl', '/%2e%2e%2fpackage.json', '/node_modules/esbuild/lib/main.js']) {
    assert.equal((await fetch(base + path)).status, 404, path);
  }
  assert.equal((await fetch(base + '/')).status, 200);
  assert.equal((await fetch(base + '/assets/learning-engine.js')).status, 200);
});
