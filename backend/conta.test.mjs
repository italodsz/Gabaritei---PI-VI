import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { criarServidor } from './server.mjs';
import { abrirBanco, MIGRACOES, migrar } from './db.mjs';
import { limparHtml } from './repositorio.mjs';

const db = abrirBanco(':memory:');
const server = criarServidor({ info: {} }, { db }).listen(0, '127.0.0.1');
await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;
after(() => new Promise(resolve => { server.close(resolve); server.closeIdleConnections(); }));

/** Cliente simples que guarda o cookie de sessão, como um navegador. */
function cliente() {
  let cookie = '';
  const chamar = async (metodo, caminho, dados, extra = {}) => {
    const r = await fetch(base + caminho, { method: metodo, headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}), ...extra }, body: dados === undefined ? undefined : JSON.stringify(dados) });
    const sc = r.headers.get('set-cookie'); if (sc) cookie = sc.startsWith('gabaritei_sessao=;') ? '' : sc.split(';')[0];
    return { status: r.status, headers: r.headers, data: await r.json() };
  };
  return { get: c => chamar('GET', c), post: (c, d, e) => chamar('POST', c, d ?? {}, e), put: (c, d) => chamar('PUT', c, d), del: (c, d) => chamar('DELETE', c, d ?? {}), cookie: () => cookie };
}
const cadastro = (n = 1) => ({ nome: `Aluno ${n}`, email: `aluno${n}@exemplo.com`, senha: 'senha-segura-123' });
const conta = (id = 'estudante-local') => ({
  schemaVersion: 1, profile: { id, kind: 'new', name: 'Ítalo', nickname: 'It', email: '', school: 'PUC', city: 'Campinas', bio: '', createdAt: '2026-11-01T00:00:00.000Z' },
  onboarding: { status: 'completed', goal: 'treinar', edition: 2024, difficultSubjects: ['fisica'], level: 'intermediario', finishedAt: '2026-11-01T00:00:00.000Z' },
  study: { practiceTimer: true, simulationTimer: true, defaultQuestionCount: 10 },
  practiceSessions: [{ id: 'p1', kind: 'practice', mode: 'custom', title: 'Lista de Física', createdAt: '2026-11-02T10:00:00.000Z', updatedAt: '2026-11-02T10:10:00.000Z', status: 'in_progress', completedAt: null,
    filters: { subjectId: 'fisica', topicIds: ['fisica-mecanica'], subtopicIds: [], years: [2023], count: 2 }, questionIds: ['gq_aaa', 'gq_bbb'],
    answers: { gq_aaa: { questionId: 'gq_aaa', selected: 'C', confirmed: true, correct: false, answeredAt: '2026-11-02T10:05:00.000Z', timeSpentMs: 61000, extraFuturo: { ok: 1 } } },
    currentIndex: 1, clock: { elapsedMs: 70000, runningSince: null }, cursorElapsedMs: 61000, timerVisible: true, campoNovo: 'preservado' }],
  simulations: [{ id: 's1', kind: 'simulation', title: 'Simulado', createdAt: '2026-11-03T10:00:00.000Z', updatedAt: '2026-11-03T11:00:00.000Z', status: 'completed', completedAt: '2026-11-03T11:00:00.000Z', finishReason: 'manual',
    config: { mode: 'custom', edition: null, day: null, areaIds: ['MT'], size: 2, foreignLanguage: 'ingles', criteria: 'balanced', durationMs: 7200000, includesEssay: false }, questionIds: ['gq_ccc', 'gq_ddd'],
    sections: [{ areaId: 'MT', label: 'Matemática', start: 0, end: 2, firstNumber: 1 }], answers: { gq_ccc: { questionId: 'gq_ccc', selected: 'A', answeredAt: null, timeSpentMs: 5 } }, marked: ['gq_ddd'],
    currentIndex: 0, clock: { elapsedMs: 1, runningSince: null }, cursorElapsedMs: 0, timerHidden: false }],
  favorites: ['gq_ccc', 'gq_aaa'], reviewMarks: ['gq_bbb'], goals: [{ kind: 'weekly_questions', target: 30, enabled: true }, { kind: 'weekly_accuracy', target: 70, enabled: false }], celebratedAchievements: ['primeiros-passos'],
});

test('migrações são idempotentes e registradas', () => {
  assert.deepEqual(migrar(db), []);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM migracao').get().n, MIGRACOES.length);
  assert.equal(db.prepare('PRAGMA foreign_keys').get().foreign_keys, 1);
});

test('cadastro, sessão por cookie HttpOnly, saída e entrada', async () => {
  const c = cliente();
  assert.equal((await c.get('/api/eu')).data.usuario, null);
  const r = await c.post('/api/auth/registrar', cadastro());
  assert.equal(r.status, 201); assert.equal(r.data.usuario.email, 'aluno1@exemplo.com'); assert.equal(r.data.usuario.senha_hash, undefined);
  assert.match(r.headers.get('set-cookie'), /HttpOnly; SameSite=Lax/);
  assert.equal((await c.get('/api/eu')).data.usuario.nome, 'Aluno 1');
  // a senha nunca fica em texto puro e o token de sessão só é guardado em hash
  const guardado = db.prepare('SELECT senha_hash FROM usuario').get().senha_hash; assert.match(guardado, /^scrypt\$/); assert(!guardado.includes('senha-segura'));
  assert(!db.prepare('SELECT token_hash FROM sessao_login').all().some(s => c.cookie().includes(s.token_hash)));
  await c.post('/api/auth/sair'); assert.equal((await c.get('/api/eu')).data.usuario, null);
  assert.equal((await c.post('/api/auth/entrar', { email: 'ALUNO1@exemplo.com', senha: 'senha-segura-123' })).status, 200);
  assert.equal((await c.get('/api/eu')).data.usuario.id.length, 36);
});

test('rejeita cadastro inválido, e-mail repetido, senha errada e acesso sem login', async () => {
  const c = cliente();
  assert.equal((await c.post('/api/auth/registrar', { ...cadastro(2), senha: 'curta' })).status, 400);
  assert.equal((await c.post('/api/auth/registrar', { ...cadastro(2), email: 'sem-arroba' })).status, 400);
  assert.equal((await c.post('/api/auth/registrar', cadastro(1))).status, 409);
  assert.equal((await c.post('/api/auth/entrar', { email: 'aluno1@exemplo.com', senha: 'errada-errada' })).status, 401);
  assert.equal((await c.post('/api/auth/entrar', { email: 'ninguem@exemplo.com', senha: 'errada-errada' })).status, 401);
  for (const k of ['estudos', 'plano', 'notas']) { assert.equal((await c.get(`/api/eu/${k}`)).status, 401); assert.equal((await c.put(`/api/eu/${k}`, { data: {} })).status, 401); }
});

test('bloqueia força bruta e escrita de outra origem', async () => {
  const c = cliente(); await c.post('/api/auth/registrar', cadastro(3)); await c.post('/api/auth/sair');
  let ultimo;
  for (let i = 0; i < 9; i++) ultimo = await c.post('/api/auth/entrar', { email: 'aluno3@exemplo.com', senha: 'errada-errada' });
  assert.equal(ultimo.status, 429);
  assert.equal((await c.post('/api/auth/entrar', { email: 'aluno3@exemplo.com', senha: 'senha-segura-123' })).status, 429);
  assert.equal((await cliente().post('/api/auth/registrar', cadastro(4), { Origin: 'http://site-malicioso.example' })).status, 403);
});

test('estudos: grava em tabelas e devolve exatamente o que recebeu, com campos extras preservados', async () => {
  const c = cliente(); await c.post('/api/auth/registrar', cadastro(5));
  const vazio = await c.get('/api/eu/estudos'); assert.deepEqual(vazio.data, { revisao: 0, data: null });
  const original = conta();
  const salvo = await c.put('/api/eu/estudos', { data: original, baseRevisao: 0 }); assert.equal(salvo.data.revisao, 1);
  const lido = (await c.get('/api/eu/estudos')).data;
  assert.equal(lido.revisao, 1);
  const { profile, ...resto } = lido.data, { profile: pOriginal, ...restoOriginal } = original;
  assert.deepEqual(resto, restoOriginal);
  assert.equal(profile.kind, 'registered'); assert.equal(profile.email, 'aluno5@exemplo.com'); assert.equal(profile.school, 'PUC'); assert.equal(profile.name, 'Aluno 5'); // 1º envio mantém o nome do cadastro
  const uid = (await c.get('/api/eu')).data.usuario.id;
  assert.equal(db.prepare('SELECT COUNT(*) n FROM resposta_pratica').get().n, 1);
  assert.equal(db.prepare('SELECT correta FROM resposta_pratica').get().correta, 0);
  assert.deepEqual(db.prepare('SELECT questao_id FROM favorita WHERE usuario_id=? ORDER BY ordem').all(uid).map(x => x.questao_id), ['gq_ccc', 'gq_aaa']);
});

test('estudos: segunda gravação substitui sem deixar resíduo e respeita a revisão', async () => {
  const c = cliente(); await c.post('/api/auth/entrar', { email: 'aluno5@exemplo.com', senha: 'senha-segura-123' });
  const nova = conta(); nova.practiceSessions = []; nova.favorites = []; nova.goals = [];
  assert.equal((await c.put('/api/eu/estudos', { data: nova, baseRevisao: 1 })).data.revisao, 2);
  assert.equal((await c.get('/api/eu/estudos')).data.data.profile.name, 'Ítalo'); // edições seguintes mudam o nome
  assert.equal(db.prepare('SELECT COUNT(*) n FROM resposta_pratica').get().n, 0);
  const velha = await c.put('/api/eu/estudos', { data: nova, baseRevisao: 1 });
  assert.equal(velha.status, 409); assert.equal(velha.data.revisao, 2);
  assert.equal((await c.put('/api/eu/estudos', { data: nova })).data.revisao, 3); // sem baseRevisao: última gravação vence
});

test('estudos: valida o conteúdo antes de gravar e não grava pela metade', async () => {
  const c = cliente(); await c.post('/api/auth/entrar', { email: 'aluno5@exemplo.com', senha: 'senha-segura-123' });
  const antes = (await c.get('/api/eu/estudos')).data;
  const ruim = conta(); ruim.practiceSessions[0].answers.gq_aaa.selected = 'Z';
  assert.equal((await c.put('/api/eu/estudos', { data: ruim })).status, 400);
  const repetido = conta(); repetido.simulations.push({ ...repetido.simulations[0] });
  assert.equal((await c.put('/api/eu/estudos', { data: repetido })).status, 400);
  const lixo = conta(); lixo.practiceSessions[0].questionIds = Array.from({ length: 3001 }, (_, i) => 'gq_' + i);
  assert.equal((await c.put('/api/eu/estudos', { data: lixo })).status, 400);
  assert.deepEqual((await c.get('/api/eu/estudos')).data, antes);
});

test('isolamento: um usuário não lê nem sobrescreve os dados do outro', async () => {
  const a = cliente(), b = cliente();
  await a.post('/api/auth/entrar', { email: 'aluno5@exemplo.com', senha: 'senha-segura-123' });
  await b.post('/api/auth/registrar', cadastro(6));
  assert.equal((await b.get('/api/eu/estudos')).data.data, null);
  await a.put('/api/eu/estudos', { data: conta() });
  // ids de práticas são únicos no banco: b não pode reaproveitar o id 'p1' de a
  assert.equal((await b.put('/api/eu/estudos', { data: conta() })).status, 409);
  assert.equal((await b.get('/api/eu/estudos')).data.data, null);
});

test('plano e notas: ordem e campos extras preservados, HTML das notas é limpo', async () => {
  const c = cliente(); await c.post('/api/auth/registrar', cadastro(7));
  const plano = { activities: [{ id: 'z', title: 'Segunda', description: 'd', area: 'matematica', createdAt: '2026-11-01T00:00:00.000Z', updatedAt: '2026-11-01T00:00:00.000Z', done: true, kind: 'lista' }, { id: 'a', title: 'Primeira', description: '', area: 'livre' }] };
  assert.equal((await c.put('/api/eu/plano', { data: plano })).data.revisao, 1);
  assert.deepEqual((await c.get('/api/eu/plano')).data.data, plano);
  const notas = { blocks: [
    { id: 'n1', type: 'text', html: '<b>Oi</b><script>alert(1)</script><img src=x onerror=alert(1)><span style="color: #3e5ac6; position:fixed" onclick="x()">cor</span>' },
    { id: 'n2', type: 'ref', ref: { kind: 'activity', id: 'ecology' } }] };
  await c.put('/api/eu/notas', { data: notas });
  const lido = (await c.get('/api/eu/notas')).data.data.blocks;
  assert.equal(lido[0].html, '<b>Oi</b>alert(1)<span style="color: #3e5ac6">cor</span>'); assert.doesNotMatch(JSON.stringify(lido), /script|onerror|onclick|<img/);
  assert.deepEqual(lido[1], notas.blocks[1]);
  assert.equal((await c.put('/api/eu/notas', { data: { blocks: [{ id: 'x', type: 'ref', ref: { kind: 'a' } }, { id: 'x', type: 'text', html: '' }] } })).status, 400);
});

test('limparHtml mantém a formatação suportada e neutraliza o resto', () => {
  assert.equal(limparHtml('<div><b>a</b> <i>b</i><u>c</u><br></div><ul><li>x</li></ul>'), '<div><b>a</b> <i>b</i><u>c</u><br></div><ul><li>x</li></ul>');
  assert.equal(limparHtml('<a href="javascript:x()">link</a>'), 'link');
  assert.equal(limparHtml('1 < 2 e <outro'), '1 &lt; 2 e &lt;outro');
});

test('trocar senha encerra as outras sessões; excluir conta apaga tudo', async () => {
  const a = cliente(), b = cliente();
  await a.post('/api/auth/entrar', { email: 'aluno7@exemplo.com', senha: 'senha-segura-123' });
  await b.post('/api/auth/entrar', { email: 'aluno7@exemplo.com', senha: 'senha-segura-123' });
  assert.equal((await a.post('/api/eu/senha', { atual: 'errada-errada', nova: 'nova-senha-456' })).status, 403);
  assert.equal((await a.post('/api/eu/senha', { atual: 'senha-segura-123', nova: 'nova-senha-456' })).status, 200);
  assert.equal((await a.get('/api/eu')).data.usuario.email, 'aluno7@exemplo.com');
  assert.equal((await b.get('/api/eu')).data.usuario, null);
  const exp = (await a.get('/api/eu/exportar')).data; assert.equal(exp.plano.activities.length, 2); assert.equal(exp.usuario.email, 'aluno7@exemplo.com');
  assert.equal((await a.del('/api/eu', { senha: 'errada-errada' })).status, 403);
  assert.equal((await a.del('/api/eu', { senha: 'nova-senha-456' })).status, 200);
  assert.equal(db.prepare("SELECT COUNT(*) n FROM usuario WHERE email='aluno7@exemplo.com'").get().n, 0);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM atividade_plano').get().n, 0);
  assert.equal((await a.get('/api/eu')).data.usuario, null);
});

test('lista longa (prática sob medida ou lista livre com mais de 500 respostas) continua sincronizando', async () => {
  const c = cliente();
  assert.equal((await c.post('/api/auth/registrar', cadastro(77))).status, 201);
  const d = conta(), s = d.practiceSessions[0];
  s.id = 'p-longa'; d.simulations[0].id = 's-longa';
  s.questionIds = Array.from({ length: 800 }, (_, i) => `gq_${i.toString(16).padStart(6, '0')}`);
  s.answers = Object.fromEntries(s.questionIds.map(id => [id, { questionId: id, selected: 'A', confirmed: true, correct: true, answeredAt: '2026-11-02T10:05:00.000Z', timeSpentMs: 9000 }]));
  const r = await c.put('/api/eu/estudos', { data: d });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(Object.keys((await c.get('/api/eu/estudos')).data.data.practiceSessions[0].answers).length, 800);
});
