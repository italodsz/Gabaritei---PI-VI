#!/usr/bin/env node
/**
 * Conta de demonstração "Julio": cria (ou reaproveita) a conta pela API do Gabaritei e preenche
 * seis semanas de uso realista para gravar vídeos de demonstração.
 *
 * Tudo passa pelas rotas públicas do app (as mesmas que o navegador usa), então funciona igual
 * no servidor local e no site publicado. Nada é gravado direto no banco.
 *
 *   node scripts/conta-demo-julio.mjs --url https://SEU-SITE --senha 'SenhaDoJulio123'
 *
 * Opções:
 *   --url URL           endereço do app (padrão http://127.0.0.1:4173)
 *   --email E           e-mail da conta (padrão julio.demo@gabaritei.app)
 *   --senha S           senha (ou variável GABARITEI_SENHA_DEMO); mínimo 8 caracteres
 *   --nome N            nome completo (padrão "Julio Andrade")
 *   --substituir        sobrescreve estudos, plano e notas se a conta já tiver dados
 *   --sem-tri           não envia as respostas para o perfil TRI
 *   --reenviar-tri      envia as respostas ao perfil TRI mesmo se ele já tiver respostas (duplica eventos)
 *   --semente N         muda o sorteio (padrão 2611)
 *   --saida PASTA       grava também os JSON gerados nessa pasta
 *   --somente-gerar     não chama a API de conta: só gera os JSON (precisa de --saida)
 *   --bootstrap ARQ     lê as questões de um arquivo em vez de /api/bootstrap
 *
 * O modo dev depende do servidor: o e-mail precisa estar em GABARITEI_DEVS (Railway) ou em
 * backend/dados/devs.txt (local).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const E = await import(join(RAIZ, 'frontend/assets/learning-engine.js'));

/* ------------------------------------------------------------------ */
/* Opções                                                              */
/* ------------------------------------------------------------------ */
const args = process.argv.slice(2);
const opt = (nome, padrao) => { const i = args.indexOf(`--${nome}`); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : padrao; };
const flag = nome => args.includes(`--${nome}`);
const URL_BASE = opt('url', 'http://127.0.0.1:4173').replace(/\/+$/, '');
const EMAIL = opt('email', 'julio.demo@gabaritei.app');
const SENHA = opt('senha', process.env.GABARITEI_SENHA_DEMO || '');
const NOME = opt('nome', 'Julio Andrade');
const SEMENTE = Number(opt('semente', '2611'));
const SAIDA = opt('saida', null);
const SO_GERAR = flag('somente-gerar');
if (!SO_GERAR && SENHA.length < 8) { console.error('Informe a senha do Julio com --senha (mínimo 8 caracteres).'); process.exit(2); }
if (SO_GERAR && !SAIDA) { console.error('--somente-gerar precisa de --saida PASTA.'); process.exit(2); }

/* ------------------------------------------------------------------ */
/* API                                                                 */
/* ------------------------------------------------------------------ */
let cookie = '';
async function api(metodo, caminho, dados) {
  const r = await fetch(URL_BASE + caminho, {
    method: metodo,
    headers: { ...(dados === undefined ? {} : { 'Content-Type': 'application/json' }), ...(cookie ? { Cookie: cookie } : {}) },
    body: dados === undefined ? undefined : JSON.stringify(dados),
    signal: AbortSignal.timeout(60000),
  });
  const novos = r.headers.getSetCookie?.() ?? [];
  for (const c of novos) { const par = c.split(';')[0]; if (par.split('=')[1]) cookie = par; }
  let corpo = null; try { corpo = await r.json(); } catch { /* sem corpo */ }
  if (!r.ok) throw Object.assign(new Error(`${metodo} ${caminho}: ${r.status} ${corpo?.error ?? ''}`), { status: r.status, corpo });
  return corpo;
}

/* ------------------------------------------------------------------ */
/* Acervo                                                              */
/* ------------------------------------------------------------------ */
const boot = opt('bootstrap', null) ? JSON.parse(readFileSync(opt('bootstrap'), 'utf8')) : await api('GET', '/api/bootstrap');
E.installTaxonomy(boot.subjects, boot.years);
E.installQuestions(boot.questions);
const Q = new Map(boot.questions.map(q => [q.id, q]));
const catalogo = JSON.parse(readFileSync(join(RAIZ, 'recomendador/rrf-tfidf-minilm-J/catalogo/recomendacoes_titulo_area.json'), 'utf8')).recomendacoes;
console.log(`Acervo: ${Q.size} questões.`);

/* ------------------------------------------------------------------ */
/* Sorteio determinístico                                              */
/* ------------------------------------------------------------------ */
let estado = SEMENTE >>> 0 || 1;
const rnd = () => { estado ^= estado << 13; estado >>>= 0; estado ^= estado >>> 17; estado ^= estado << 5; estado >>>= 0; return estado / 4294967296; };
const escolhe = lista => lista[Math.floor(rnd() * lista.length)];
const embaralha = lista => { const a = lista.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const entre = (a, b) => a + rnd() * (b - a);
let contadorId = 0;
const novoId = (prefixo, ms) => `${prefixo}_${Math.floor(ms).toString(36)}${(++contadorId).toString(36).padStart(4, '0')}`;
const iso = ms => new Date(ms).toISOString();

/* ------------------------------------------------------------------ */
/* Como o Julio responde                                               */
/* ------------------------------------------------------------------ */
// Habilidade (escala da TRI do INEP) no início e no fim das seis semanas. Forte em Humanas e
// Linguagens, mais fraco em Matemática e Natureza, com melhora visível ao longo do período.
const HABILIDADE = { humanas: [0.85, 1.45], linguagens: [0.75, 1.3], natureza: [0.35, 0.95], matematica: [0.25, 1.0] };
const AJUSTE_DIFICULDADE = { facil: 0.15, media: 0, dificil: -0.15 };
function chance(q, progresso) {
  const [ini, fim] = HABILIDADE[q.areaId] ?? [0, 0.3];
  const theta = ini + (fim - ini) * progresso;
  if (q.tri) { const { a, b, c } = q.tri; return c + (1 - c) / (1 + Math.exp(-a * (theta - b))); }
  return Math.min(0.92, Math.max(0.15, 0.55 + theta * 0.25 + (AJUSTE_DIFICULDADE[q.difficulty] ?? 0)));
}
function responde(q, progresso, bonus = 0) {
  const acerta = rnd() < Math.min(0.97, chance(q, progresso) + bonus);
  if (acerta) return { letra: q.correct, certa: true };
  return { letra: escolhe(['A', 'B', 'C', 'D', 'E'].filter(l => l !== q.correct)), certa: false };
}
const tempoDe = q => Math.round((q.areaId === 'matematica' || q.areaId === 'natureza' ? entre(95, 260) : entre(60, 200)) * 1000);

/* ------------------------------------------------------------------ */
/* Linha do tempo                                                      */
/* ------------------------------------------------------------------ */
const AGORA = Date.now();
const DIA = 86400000;
const INICIO = AGORA - 41 * DIA;
// Dias de estudo: poucos no começo, quase todos no fim; os últimos 7 dias seguidos (sequência ativa).
const dias = [];
for (let d = 41; d >= 0; d--) {
  const p = 1 - d / 41;
  if (d <= 6 || rnd() < 0.35 + 0.5 * p) dias.push(d);
}
// Horário local (UTC-3): tarde e noite.
const horario = (d, hora) => { const base = new Date(AGORA - d * DIA); base.setUTCHours(hora + 3, Math.floor(entre(0, 59)), 0, 0); return Math.min(base.getTime(), AGORA - 20 * 60000); };

const vistas = new Set();
const historico = []; // respostas em ordem: { id, letra, certa, ms, tempo, origem, primeira }
const praticas = [];
const simulados = [];
const progressoDe = ms => Math.min(1, Math.max(0, (ms - INICIO) / (AGORA - INICIO)));

function registrar(id, r, ms, tempo, origem) {
  historico.push({ id, letra: r.letra, certa: r.certa, ms, tempo, origem, primeira: !vistas.has(id) });
  vistas.add(id);
}
const inditas = (lista, n) => embaralha(lista.filter(q => !vistas.has(q.id))).slice(0, n);

/** Lista de questões respondida (ou parcialmente respondida) a partir de `inicio`. */
function lista({ titulo, ids, inicio, modo = 'recommended', filtros = {}, respondidas = ids.length, extra = {}, bonus = 0 }) {
  let s = E.createPracticeSession({ id: novoId('lista', inicio), mode: modo, title: titulo, questionIds: ids, filters: { ...E.EMPTY_FILTERS, ...filtros, count: ids.length }, timerVisible: true, now: inicio });
  s = { ...s, ...extra };
  let t = inicio, total = 0;
  ids.forEach((id, i) => {
    if (i >= respondidas) return;
    const q = Q.get(id), tempo = tempoDe(q);
    t += tempo; total += tempo;
    const r = responde(q, progressoDe(t), bonus);
    s.answers[id] = { questionId: id, selected: r.letra, confirmed: true, correct: r.certa, answeredAt: iso(t), timeSpentMs: tempo };
    registrar(id, r, t, tempo, 'pratica');
  });
  const fim = respondidas >= ids.length;
  s.clock = { elapsedMs: Math.round(total * 1.06), runningSince: null };
  s.cursorElapsedMs = s.clock.elapsedMs;
  s.currentIndex = fim ? ids.length - 1 : respondidas;
  s.status = fim ? 'completed' : 'in_progress';
  s.completedAt = fim ? iso(t) : null;
  s.updatedAt = iso(t);
  praticas.push(s);
  return { sessao: s, fim: t };
}

/** Prática sob medida: segue o catálogo titulo_area a partir do ponto de partida. */
function sobMedida({ escolha, primeira, n, inicio, aberta = false }) {
  const ids = [primeira.id], razoes = { [primeira.id]: primeira.razao };
  while (ids.length < n) {
    const bloqueadas = new Set([...vistas, ...ids]);
    let achou = null;
    for (const [k, ref] of [...ids].reverse().slice(0, 5).entries()) {
      const cand = (catalogo[ref] ?? []).filter(id => Q.has(id) && !bloqueadas.has(id)).slice(0, 20);
      if (!cand.length) continue;
      const pos = rnd() < 0.7 ? 0 : Math.min(cand.length - 1, rnd() < 0.6 ? 1 : 2);
      const id = cand[pos], p = Math.round(chance(Q.get(id), progressoDe(inicio)) * 100);
      achou = { id, razao: `${k === 0 ? 'Parecida com a anterior' : `Parecida com a ${k + 1}ª anterior (a última não tem parecidas novas)`} · ${pos + 1}ª no titulo_area${pos > 0 ? ', subiu pela dificuldade' : ''} · chance ${p}%` };
      break;
    }
    if (!achou) break;
    ids.push(achou.id); razoes[achou.id] = achou.razao;
  }
  const r = lista({ titulo: 'Prática sob medida', ids, inicio, modo: 'custom', respondidas: aberta ? ids.length - 1 : ids.length, extra: { continuous: true, sobMedida: escolha, reasons: razoes } });
  return r;
}

/** Revisão de erros: as questões cuja última tentativa foi um erro. */
function filaDeRevisao() {
  const ultima = new Map();
  for (const h of historico) ultima.set(h.id, h);
  return [...ultima.values()].filter(h => !h.certa).sort((a, b) => b.ms - a.ms).map(h => h.id);
}

/** Simulado (prova sem correção imediata) respondido a partir de `inicio`. */
function simulado({ titulo, ids, inicio, duracaoMin, aberta = false, oficial = null }) {
  let s;
  if (oficial) {
    s = E.createSimulationSession({ config: oficial.config, records: [], difficultSubjects: ['matematica', 'fisica', 'quimica'], now: inicio, timerHidden: false, seed: Math.floor(rnd() * 1e9) });
    s.sections = s.sections.map(sec => ({ ...sec, firstNumber: oficial.primeiro + sec.start }));
    s.config = { ...s.config, ...oficial.final };
    s.questionIds = s.questionIds.filter(id => Q.has(id));
    s.answers = Object.fromEntries(s.questionIds.map(id => [id, { questionId: id, selected: null, answeredAt: null, timeSpentMs: 0 }]));
    s.title = titulo;
  } else {
    s = E.createSimulationFromQuestions({ title: titulo, questionIds: ids, config: { durationMs: duracaoMin * 60000, criteria: 'balanced' }, now: inicio });
  }
  s.id = novoId('simulado', inicio);
  const limite = aberta ? Math.floor(s.questionIds.length * 0.4) : s.questionIds.length;
  let t = inicio, total = 0;
  s.questionIds.forEach((id, i) => {
    if (i >= limite) return;
    const q = Q.get(id), tempo = Math.round(tempoDe(q) * 0.85);
    t += tempo; total += tempo;
    const pulou = rnd() < 0.03 && !aberta;
    if (pulou) return;
    const r = responde(q, progressoDe(t));
    s.answers[id] = { questionId: id, selected: r.letra, answeredAt: iso(t), timeSpentMs: tempo };
    if (!aberta) registrar(id, r, t, tempo, 'simulado');
    else vistas.add(id);
  });
  s.marked = embaralha(s.questionIds.slice(0, limite)).slice(0, Math.max(1, Math.round(limite * 0.08)));
  s.clock = { elapsedMs: total, runningSince: null };
  s.cursorElapsedMs = total;
  s.currentIndex = aberta ? limite : s.questionIds.length - 1;
  s.status = aberta ? 'in_progress' : 'completed';
  s.completedAt = aberta ? null : iso(t + 60000);
  s.finishReason = aberta ? null : 'manual';
  s.updatedAt = iso(aberta ? t : t + 60000);
  simulados.push(s);
  return { sessao: s, fim: t };
}

/** Desafio de acertos: escada pela dificuldade oficial (b), áreas alternadas, termina no 1º erro. */
const ESCADA = boot.questions.filter(q => q.tri && !q.foreignLanguage).sort((a, b) => a.tri.b - b.tri.b);
const tentativas = [];
function desafio(inicio) {
  const areas = embaralha(['matematica', 'natureza', 'humanas', 'linguagens']);
  const itens = []; let t = inicio, degrau = 0;
  for (let k = 0; k < 60; k++) {
    const area = areas[k % 4];
    const alvo = Math.floor((degrau / 40) * ESCADA.length * 0.9);
    const q = ESCADA.slice(alvo).find(x => x.areaId === area && !vistas.has(x.id) && !itens.some(i => i.id === x.id));
    if (!q) break;
    const tempo = Math.round(entre(35, 170) * 1000); t += tempo;
    const r = responde(q, progressoDe(t), 0.12);
    itens.push({ id: q.id, selected: r.letra, correct: r.certa, timeMs: tempo, answeredAt: t });
    registrar(q.id, r, t, tempo, 'pratica');
    degrau++;
    if (!r.certa) break;
  }
  const streak = itens.filter(i => i.correct).length, totalMs = itens.reduce((n, i) => n + i.timeMs, 0);
  tentativas.push({ id: `desafio-${inicio}`, startedAt: inicio, endedAt: t, streak, faced: itens.length, reason: itens.at(-1)?.correct ? 'acervo' : 'erro', totalMs, avgMs: Math.round(totalMs / Math.max(1, itens.length)) });
  const ids = itens.map(i => i.id);
  const base = E.createPracticeSession({ id: novoId('lista', inicio), title: 'Desafio de acertos', questionIds: ids, mode: 'custom', filters: { ...E.EMPTY_FILTERS, count: ids.length }, timerVisible: true, now: inicio });
  const answers = Object.fromEntries(itens.map(i => [i.id, { questionId: i.id, selected: i.selected, confirmed: true, correct: i.correct, answeredAt: iso(i.answeredAt), timeSpentMs: i.timeMs }]));
  praticas.push({ ...base, answers, status: 'completed', completedAt: iso(t), updatedAt: iso(t), currentIndex: ids.length - 1, clock: { elapsedMs: totalMs, runningSince: null }, cursorElapsedMs: totalMs, challenge: { reason: tentativas.at(-1).reason, streak } });
  return { fim: t };
}

/* ------------------------------------------------------------------ */
/* Seis semanas de estudo                                              */
/* ------------------------------------------------------------------ */
const porTopico = topicIds => E.questionRepository.query({ topicIds });
const daArea = areaId => E.questionRepository.query({ areaIds: [areaId] }).filter(q => !q.foreignLanguage || q.subjectId === 'ingles');
const TOPICOS_FAVORITOS = {
  matematica: ['matematica-porcentagem-e-matematica-financeira', 'matematica-algebra-e-funcoes', 'matematica-razao-e-proporcao', 'matematica-geometria-plana', 'matematica-estatistica-e-probabilidade'],
  natureza: ['biologia-ecologia', 'fisica-eletricidade-e-magnetismo', 'quimica-quimica-ambiental-e-aplicada', 'biologia-genetica-e-hereditariedade', 'fisica-fisica-moderna-e-energia'],
  humanas: ['historia-brasil-colonia', 'historia-independencia-e-imperio', 'geografia-questao-ambiental-e-recursos', 'sociologia-cultura-e-sociedade', 'filosofia-etica-e-politica'],
  linguagens: ['portugues-leitura-e-interpretacao', 'portugues-generos-e-tipos-textuais', 'ingles-leitura-em-lingua-estrangeira', 'literatura-modernismo'],
};
const TOPICOS_VALIDOS = new Set(E.TOPICS.map(t => t.id));
for (const k of Object.keys(TOPICOS_FAVORITOS)) TOPICOS_FAVORITOS[k] = TOPICOS_FAVORITOS[k].filter(t => TOPICOS_VALIDOS.has(t) && porTopico([t]).length >= 6);
const nomeTopico = id => E.TOPIC_BY_ID[id]?.name ?? 'Revisão';
const PESO_AREA = [['matematica', 4], ['natureza', 3], ['humanas', 2], ['linguagens', 2]];
const sorteiaArea = () => { let r = rnd() * 11; for (const [a, p] of PESO_AREA) { r -= p; if (r <= 0) return a; } return 'matematica'; };

const sessoesPlano = {}; // atividade do plano -> sessão/simulado criado por ela
let ultimaRevisao = 99;
for (const d of dias) {
  let t = horario(d, Math.floor(entre(14, 19)));
  const atividades = d === 0 ? 1 : Math.floor(entre(1, d <= 10 ? 3.6 : 2.6));
  for (let k = 0; k < atividades; k++) {
    const roleta = rnd();
    let r;
    if (d % 9 === 3 && k === 0) {
      // Simulado de área com 10 a 20 questões.
      const area = escolhe(['matematica', 'natureza', 'humanas', 'linguagens']);
      const n = escolhe([10, 10, 15, 20]);
      const ids = inditas(daArea(area), n).map(q => q.id);
      r = simulado({ titulo: `Simulado · ${E.AREA_BY_ID[area].shortName}`, ids, inicio: t, duracaoMin: n * 3 });
    } else if (roleta < 0.15 && d <= 30) {
      r = desafio(t);
    } else if (roleta < 0.3 && ultimaRevisao - d >= 2 && filaDeRevisao().length >= 5) {
      const ids = filaDeRevisao().slice(0, 20);
      r = lista({ titulo: 'Revisão de erros', ids, inicio: t, modo: 'retry', extra: { review: true, reviewInitial: ids.length, timerVisible: false }, bonus: 0.25 });
      ultimaRevisao = d;
    } else if (roleta < 0.46) {
      const tema = rnd() < 0.6;
      const area = sorteiaArea();
      const topico = escolhe(TOPICOS_FAVORITOS[area]);
      const pool = tema ? inditas(porTopico([topico]), 1) : inditas(daArea(area), 1);
      if (!pool.length) continue;
      const escolha = tema ? { modo: 'tema', topicId: topico } : { modo: 'aleatorio', areaId: area };
      const razao = tema ? `Começo em ${nomeTopico(topico)}, no seu nível (chance ${Math.round(chance(pool[0], progressoDe(t)) * 100)}%)` : 'Sorteada para começar';
      r = sobMedida({ escolha, primeira: { id: pool[0].id, razao }, n: Math.floor(entre(6, 14)), inicio: t });
    } else {
      const area = sorteiaArea();
      const topico = escolhe(TOPICOS_FAVORITOS[area]);
      const n = escolhe([5, 10, 10, 10, 15]);
      const ids = inditas(porTopico([topico]), n).map(q => q.id);
      if (ids.length < 4) continue;
      r = lista({ titulo: nomeTopico(topico), ids, inicio: t, filtros: { subjectId: E.TOPIC_BY_ID[topico]?.subjectId ?? null, topicIds: [topico] } });
    }
    t = r.fim + Math.round(entre(5, 40) * 60000);
  }
}

desafio(horario(1, 22)); desafio(horario(0, 13));

// Atividades do plano ligadas a listas e simulados (como se o Julio tivesse clicado nos cards).
const ACTIVITY_LISTS = {
  functions: ['matematica-algebra-e-funcoes'],
  percentage: ['matematica-porcentagem-e-matematica-financeira', 'matematica-razao-e-proporcao'],
  reading: ['portugues-leitura-e-interpretacao', 'portugues-generos-e-tipos-textuais', 'portugues-funcoes-da-linguagem'],
  ecology: ['biologia-ecologia', 'quimica-quimica-ambiental-e-aplicada', 'geografia-questao-ambiental-e-recursos'],
  colonia: ['historia-brasil-colonia', 'historia-independencia-e-imperio'],
};
const listaDoPlano = (atividade, titulo, d, respondidas) => {
  const ids = inditas(porTopico(ACTIVITY_LISTS[atividade]), 5).map(q => q.id);
  const r = lista({ titulo, ids, inicio: horario(d, 20), modo: 'recommended', filtros: { topicIds: ACTIVITY_LISTS[atividade] }, respondidas: respondidas ?? ids.length });
  sessoesPlano[atividade] = r.sessao;
};
listaDoPlano('functions', 'Funções e gráficos', 12);
listaDoPlano('reading', 'Interpretação de texto', 9);
listaDoPlano('colonia', 'Brasil Colônia e Império', 2);
listaDoPlano('percentage', 'Porcentagem no cotidiano', 1, 3); // em andamento
const simPlano = (atividade, titulo, area, d, aberta = false) => {
  const ids = inditas(daArea(area), 10).map(q => q.id);
  sessoesPlano[atividade] = simulado({ titulo, ids, inicio: horario(d, 19), duracaoMin: 30, aberta }).sessao;
};
simPlano('humanities-sim', 'Simulado de Humanas', 'humanas', 16);
simPlano('sim-linguagens', 'Simulado de Linguagens', 'linguagens', 6);
simPlano('sim-matematica', 'Simulado de Matemática', 'matematica', 0, true); // em andamento

// Prova no formato ENEM: Ciências Humanas do Dia 1 (45 questões, 2h45).
simulado({
  titulo: 'ENEM · Dia 1 · Ciências Humanas e suas Tecnologias', inicio: horario(5, 14),
  oficial: { config: { edition: null, foreignLanguage: 'ingles', criteria: 'balanced', mode: 'custom', day: null, areaIds: ['humanas'], size: 45, durationMs: E.simulationDuration({ mode: 'official', day: 1, size: 45 }) }, primeiro: 46, final: { mode: 'official', day: 1, areaIds: ['humanas'], includesEssay: false } },
});
// Simulado personalizado das quatro áreas (20 questões), feito anteontem.
simulado({ titulo: 'Simulado geral · 20 questões', ids: ['linguagens', 'humanas', 'natureza', 'matematica'].flatMap(a => inditas(daArea(a), 5).map(q => q.id)), inicio: horario(2, 15), duracaoMin: 60 });
// Lista avulsa em andamento e uma prática sob medida aberta (para "Continuar praticando").
{
  const ids = inditas(porTopico(['fisica-eletricidade-e-magnetismo']), 10).map(q => q.id);
  if (ids.length >= 5) lista({ titulo: nomeTopico('fisica-eletricidade-e-magnetismo'), ids, inicio: horario(0, 18), filtros: { topicIds: ['fisica-eletricidade-e-magnetismo'] }, respondidas: 4 });
  const topico = TOPICOS_FAVORITOS.natureza[0];
  const p = inditas(porTopico([topico]), 1)[0];
  if (p) sobMedida({ escolha: { modo: 'tema', topicId: topico }, primeira: { id: p.id, razao: `Começo em ${nomeTopico(topico)}, no seu nível (chance ${Math.round(chance(p, 1) * 100)}%)` }, n: 8, inicio: horario(0, 21), aberta: true });
}

praticas.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
simulados.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
historico.sort((a, b) => a.ms - b.ms);

/* ------------------------------------------------------------------ */
/* Estudos, plano e notas                                              */
/* ------------------------------------------------------------------ */
const respondidasPratica = historico.filter(h => h.origem === 'pratica');
const erradas = [...new Set(respondidasPratica.filter(h => !h.certa).map(h => h.id))];
const certas = [...new Set(respondidasPratica.filter(h => h.certa).map(h => h.id))];
const estudos = {
  ...E.createEmptyAccount({ id: 'julio', kind: 'registered', name: NOME, email: EMAIL, now: INICIO }),
};
Object.assign(estudos.profile, { nickname: NOME.split(/\s+/)[0], school: 'EE Professor Clóvis Bevilacqua', city: 'Campinas, SP', bio: '3º ano do ensino médio. Quero Engenharia de Computação na Unicamp. Matemática é meu desafio; Humanas é onde vou buscar pontos.' });
estudos.onboarding = { status: 'completed', goal: 'universidade_publica', edition: 2026, difficultSubjects: ['matematica', 'fisica', 'quimica'], level: 'intermediario', finishedAt: iso(INICIO + 15 * 60000) };
estudos.study = { practiceTimer: true, simulationTimer: true, defaultQuestionCount: 10 };
estudos.practiceSessions = praticas;
estudos.simulations = simulados;
estudos.favorites = embaralha(certas).slice(0, 9).concat(embaralha(erradas).slice(0, 5));
estudos.reviewMarks = embaralha(erradas).slice(0, 8);
estudos.goals = [
  { kind: 'weekly_questions', target: 80, enabled: true },
  { kind: 'weekly_accuracy', target: 65, enabled: true },
  { kind: 'weekly_study_days', target: 5, enabled: true },
  { kind: 'monthly_simulations', target: 4, enabled: true },
];
estudos.celebratedAchievements = [];

const H = 3600000;
const atv = (id, title, description, area, extra, criadaHa, atualizadaHa) => ({ id, title, description, area, icon: 'book', done: false, saved: false, createdAt: iso(AGORA - criadaHa * H), updatedAt: iso(AGORA - atualizadaHa * H), ...extra });
const plano = {
  seed: 2,
  activities: [
    atv('functions', 'Funções e gráficos', 'Pratique a leitura de gráficos e as relações entre grandezas.', 'Matemática', { icon: 'plus', done: true, sessionId: sessoesPlano.functions?.id }, 330, 288),
    atv('reading', 'Interpretação de texto', 'Explore sentidos, argumentos e estratégias de leitura.', 'Linguagens', { done: true, sessionId: sessoesPlano.reading?.id }, 300, 216),
    atv('ecology', 'Ecologia e ambiente', 'Conecte os seres vivos, o ambiente e as suas relações.', 'Natureza', { icon: 'leaf' }, 260, 70),
    atv('percentage', 'Porcentagem no cotidiano', 'Resolva situações com descontos e proporções.', 'Matemática', { icon: 'calculator', saved: true, sessionId: sessoesPlano.percentage?.id }, 240, 24),
    atv('humanities-sim', 'Simulado de Humanas', 'Dez questões de Ciências Humanas, com correção ao finalizar.', 'Humanas', { kind: 'simulado', icon: 'clock', done: true, simId: sessoesPlano['humanities-sim']?.id }, 420, 380),
    atv('colonia', 'Brasil Colônia e Império', 'Ciclos econômicos, sociedade colonial e a chegada da corte.', 'Humanas', { done: true, sessionId: sessoesPlano.colonia?.id }, 200, 46),
    atv('sim-matematica', 'Simulado de Matemática', 'Dez questões de Matemática, com tempo de prova e nota ao final.', 'Matemática', { kind: 'simulado', icon: 'clock', simId: sessoesPlano['sim-matematica']?.id }, 150, 3),
    atv('english', 'Leitura em inglês', 'Textos curtos com foco em vocabulário e na ideia principal.', 'Linguagens', { saved: true }, 180, 120),
    atv('physics-energy', 'Energia e eletricidade', 'Potência, consumo e circuitos do dia a dia.', 'Natureza', { icon: 'leaf' }, 170, 30),
    atv('sim-natureza', 'Simulado de Natureza', 'Biologia, Física e Química em uma prova de dez questões.', 'Natureza', { kind: 'simulado', icon: 'clock' }, 160, 100),
    atv('sim-linguagens', 'Simulado de Linguagens', 'Português, literatura e língua estrangeira em dez questões.', 'Linguagens', { kind: 'simulado', icon: 'clock', done: true, simId: sessoesPlano['sim-linguagens']?.id }, 190, 140),
    atv('julio-estequiometria', 'Estequiometria sem medo', 'Mol, massa molar e rendimento: refazer até sair no automático.', 'Natureza', { kind: 'lista' }, 96, 96),
    atv('julio-revolucoes', 'Revoluções Industrial e Francesa', 'Comparar causas e consequências para as questões de Humanas.', 'Humanas', { kind: 'lista', saved: true }, 60, 60),
    atv('julio-geometria', 'Geometria plana: áreas', 'Áreas de figuras compostas e escalas em mapas e plantas.', 'Matemática', { kind: 'lista' }, 30, 30),
  ].map(a => Object.fromEntries(Object.entries(a).filter(([, v]) => v !== undefined))),
};
const ultimaLista = [...praticas].reverse().find(s => s.status === 'completed' && !s.continuous && !s.review);
const ultimoSimulado = [...simulados].reverse().find(s => s.status === 'completed');
let nb = 0;
const bloco = html => ({ id: `nb-julio-${++nb}`, type: 'text', html });
const atalho = (kind, id) => ({ id: `nb-julio-${++nb}`, type: 'ref', ref: { kind, id } });
const notas = {
  blocks: [
    bloco('<b>Plano até o ENEM</b><br>Meta: 720 na média. Foco em Matemática e Natureza, sem largar Humanas.'),
    atalho('activity', 'percentage'),
    bloco('<ul><li>Porcentagem: <u>sempre</u> transformar em fração antes de calcular aumento sobre aumento</li><li>Funções: ler o gráfico pelos eixos primeiro, depois a pergunta</li><li>Física: revisar potência = energia ÷ tempo</li></ul>'),
    atalho('activity', 'sim-matematica'),
    bloco('<b>Erros que mais se repetem</b><ol><li>Pular a unidade de medida (km × m)</li><li>Confundir mediana com média</li><li>Ler rápido demais os textos de Sociologia</li></ol>'),
    ...(ultimoSimulado ? [atalho('simulation', ultimoSimulado.id)] : []),
    bloco('<i>Simulado geral: Humanas foi bem, Matemática ainda abaixo do que eu quero. Refazer as erradas no domingo.</i>'),
    ...(ultimaLista ? [atalho('practice', ultimaLista.id)] : []),
    atalho('sim-area', 'natureza'),
    bloco('Próxima semana: 1 simulado de Natureza + revisão de erros todo dia antes de dormir.'),
    bloco(''),
  ],
};

/* ------------------------------------------------------------------ */
/* Resumo                                                              */
/* ------------------------------------------------------------------ */
const acertos = historico.filter(h => h.certa).length;
console.log(`Gerado: ${praticas.length} listas e práticas (${praticas.filter(s => s.status === 'in_progress').length} em andamento), ` +
  `${tentativas.length} desafios (recorde ${Math.max(0, ...tentativas.map(a => a.streak))}), ${simulados.length} simulados (${simulados.filter(s => s.status === 'in_progress').length} em andamento), ${historico.length} respostas ` +
  `(${Math.round((acertos / historico.length) * 100)}% de acerto), ${dias.length} dias de estudo, ${filaDeRevisao().length} erros na fila de revisão.`);
const desafioLocal = { best: Math.max(0, ...tentativas.map(a => a.streak)), attempts: tentativas.sort((a, b) => a.startedAt - b.startedAt).slice(-30), active: null };
const trechoDesafio = `localStorage.setItem('gabaritei:desafio:v1', ${JSON.stringify(JSON.stringify(desafioLocal))}); location.reload();`;
if (SAIDA) {
  mkdirSync(SAIDA, { recursive: true });
  for (const [nome, dados] of Object.entries({ estudos, plano, notas, respostas: historico, desafio: desafioLocal })) writeFileSync(join(SAIDA, `${nome}.json`), JSON.stringify(dados, null, 1));
  console.log(`JSON gravados em ${SAIDA}.`);
}
if (SO_GERAR) process.exit(0);

/* ------------------------------------------------------------------ */
/* Conta                                                               */
/* ------------------------------------------------------------------ */
try {
  await api('POST', '/api/auth/registrar', { nome: NOME, email: EMAIL, senha: SENHA });
  console.log(`Conta criada: ${EMAIL}`);
} catch (e) {
  if (e.status !== 409) throw e;
  await api('POST', '/api/auth/entrar', { email: EMAIL, senha: SENHA });
  console.log(`Conta já existia; entrei como ${EMAIL}.`);
}
const eu = (await api('GET', '/api/eu')).usuario;
if (!eu) throw new Error('A sessão não foi criada (cookie recusado?).');

const blocos = { estudos, plano, notas };
const atuais = {};
for (const chave of Object.keys(blocos)) atuais[chave] = await api('GET', `/api/eu/${chave}`);
const temDados = Object.values(atuais).some(r => r.data);
if (temDados && !flag('substituir')) {
  console.error('A conta já tem estudos/plano/notas. Rode de novo com --substituir para sobrescrever.');
  process.exit(3);
}
for (const [chave, dados] of Object.entries(blocos)) {
  await api('PUT', `/api/eu/${chave}`, { data: dados, baseRevisao: atuais[chave].revisao });
  console.log(`Gravado: ${chave}`);
}

/* ------------------------------------------------------------------ */
/* Perfil TRI: as mesmas chamadas que o app faz ao corrigir respostas  */
/* ------------------------------------------------------------------ */
if (!flag('sem-tri')) {
  const perfil = await api('GET', '/api/eu/perfil-tri');
  const jaTem = (perfil.perfis && Object.values(perfil.perfis).some(p => p.n > 0));
  if (jaTem && !flag('reenviar-tri')) {
    console.log('O perfil TRI já tem respostas; não reenviei (use --reenviar-tri para enviar mesmo assim).');
  } else {
    let feitas = 0, lote = [];
    const enviarLote = async () => { if (lote.length) { await api('POST', '/api/eu/perfil-tri/respostas', { respostas: lote }); lote = []; } };
    for (const h of historico) {
      if (h.origem === 'simulado') { lote.push({ questaoId: h.id, alternativa: h.letra, tempoMs: h.tempo }); if (lote.length >= 150) await enviarLote(); }
      else { await enviarLote(); await api('POST', `/api/questoes/${h.id}/responder`, { selected: h.letra, tempoMs: h.tempo, primeira: h.primeira }); }
      if (++feitas % 100 === 0) console.log(`Perfil TRI: ${feitas}/${historico.length} respostas`);
    }
    await enviarLote();
    const fim = await api('GET', '/api/eu/perfil-tri');
    console.log('Perfil TRI:', (fim.resumos ?? []).map(r => `${r.area} ${r.status}${r.nota ? ` ${r.nota}` : ''}`).join(' · '));
  }
}
const final = (await api('GET', '/api/eu')).usuario;
writeFileSync(join(SAIDA ?? '.', 'desafio-julio-console.txt'), trechoDesafio + '\n');
console.log(`\nRecorde do desafio (${desafioLocal.best}) e últimas tentativas: esse painel fica só no navegador.`);
console.log(`Depois de entrar como Julio, cole no Console do navegador (F12) o conteúdo de ${join(SAIDA ?? '.', 'desafio-julio-console.txt')}.`);
console.log(`Pronto. ${final.nome} <${final.email}> · modo dev: ${final.dev ? 'ligado' : 'DESLIGADO (adicione o e-mail em GABARITEI_DEVS e reinicie o servidor)'}`);
