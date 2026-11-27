// Recomendador de dificuldade no navegador: perfil TRI por área, chance de cada questão, ordem das
// listas, ajuste suave do Semelhante e resumo da nota. Com login, o servidor é a fonte do perfil;
// sem login, o perfil fica neste navegador. O cálculo é o mesmo do servidor (dificuldade.js).
import * as T from './dificuldade.js';
import { usuarioAtual } from './conta.js';

const CHAVE = 'gabaritei:perfil-tri:v1';
const INEP = { matematica: 'MT', natureza: 'CN', humanas: 'CH', linguagens: 'LC' };
let cfg = null, perfis = null, historico = [], getAccount = () => null, ouvintes = new Set();

/** Alerta de texto da questão (o acervo manda lista vazia quando não há). */
export const temAlerta = q => (Array.isArray(q?.warning) ? q.warning.length > 0 : !!q?.warning);
export const areaDe = q => q?.sourceArea || INEP[q?.areaId];
export const pronto = () => !!cfg && !!perfis;
export const config = () => cfg;
export const aoMudar = fn => { ouvintes.add(fn); return () => ouvintes.delete(fn); };
const avisar = () => ouvintes.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });

const lerLocal = () => { try { return JSON.parse(localStorage.getItem(CHAVE)); } catch { return null; } };
const gravarLocal = () => { if (usuarioAtual()) return; try { localStorage.setItem(CHAVE, JSON.stringify({ perfis, historico })); } catch { /* sem armazenamento */ } };

async function api(metodo, caminho, dados) {
  const r = await fetch(caminho, { method: metodo, credentials: 'same-origin', headers: dados ? { 'Content-Type': 'application/json' } : {}, body: dados ? JSON.stringify(dados) : undefined, signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

/** Chamada no início do app, depois do acervo e da conta. Nunca impede o app de abrir. */
export async function iniciarDificuldade({ account }) {
  getAccount = account;
  try { cfg = await api('GET', '/api/dificuldade/config'); } catch (e) { console.warn('Recomendador de dificuldade indisponível:', e.message); return; }
  const local = lerLocal();
  perfis = Object.fromEntries(T.AREAS.map(a => [a, local?.perfis?.[a]?.lw?.length ? local.perfis[a] : T.perfilInicial(a, cfg)]));
  historico = Array.isArray(local?.historico) ? local.historico : [];
  if (usuarioAtual()) {
    try {
      let v = await api('GET', '/api/eu/perfil-tri');
      const subir = T.AREAS.filter(a => (local?.perfis?.[a]?.n || 0) > 0 && !(v.perfis[a]?.n > 0));
      if (subir.length) v = await api('PUT', '/api/eu/perfil-tri', { perfis: Object.fromEntries(subir.map(a => [a, local.perfis[a]])) });
      perfis = v.perfis; historico = v.historico || [];
      try { localStorage.removeItem(CHAVE); } catch { /* ignora */ }
    } catch (e) { console.warn('Perfil TRI do servidor indisponível; usando o do navegador.', e.message); }
  }
  avisar();
}

/* ----------------------------- leitura ----------------------------- */
export const desafio = () => getAccount()?.study?.desafio || cfg?.desafio_padrao || 'ponto';
export function definirDesafio(valor, save) { const acc = getAccount(); if (!acc || !cfg?.metas[valor]) return; acc.study.desafio = valor; save?.(); avisar(); }
const metaBase = () => T.metaDe(desafio(), cfg);
const perfilDe = area => perfis?.[area] ?? (cfg ? T.perfilInicial(area, cfg) : null);
export function chanceDe(q) {
  if (!pronto() || !q?.tri) return null;
  const p = perfilDe(areaDe(q));
  return p ? T.ajustarChance(T.chance(T.alargar(p, Date.now(), cfg), q.tri, cfg), deltaDe(areaDe(q))) : null;
}
/** δ da área aprendido com as respostas de todos os alunos (0 enquanto há poucos dados). */
export const deltaDe = area => cfg?.ajuste?.porArea?.[area]?.delta || 0;
export const ajusteSistema = () => cfg?.ajuste ?? null;
/** Meta do desafio atual (antes do controlador). Leitura pública para o modo dev. */
export const metaDesafio = () => metaBase();
/** Leitura somente leitura do perfil da área, já alargado pelo tempo sem prática (o mesmo que
 *  chanceDe usa por baixo). Só para mostrar o que o sistema sabe agora; nunca grava nada. */
export function perfilAgora(area) {
  const p = perfilDe(area);
  return p ? T.alargar(p, Date.now(), cfg) : null;
}

export function resumo() {
  if (!pronto()) return null;
  const resumos = T.AREAS.map(a => T.resumoNota(perfilDe(a), cfg));
  return { resumos, agregados: T.agregados(resumos), historico };
}

/* ----------------------------- ordens ----------------------------- */
/** Os números de cada candidata (semântica, chance, adequação, escore), sem ordenar: a mesma conta
 *  de ordenarSemelhantes (abaixo), para o modo dev nunca divergir da escolha real do app. */
export function detalharSemelhantes(ids, repo) {
  if (!pronto()) return null;
  const q0 = repo.getById(ids[0]), alvo = perfilDe(areaDe(q0))?.pstar ?? metaBase();
  return T.detalharSemelhantes(ids, id => chanceDe(repo.getById(id)), alvo, cfg);
}
/** Ajuste suave sobre a ordem do titulo_area (Semelhante e Recomendadas). */
export function ordenarSemelhantes(ids, repo) {
  const d = detalharSemelhantes(ids, repo);
  if (!d) return ids;
  return [...d.linhas].sort((a, b) => b.escore - a.escore).map(l => l.id).concat(d.restante);
}

function estados(records) {
  const ultimo = new Map();
  for (const r of records) { const t = Date.parse(r.answeredAt || 0); const u = ultimo.get(r.questionId); if (!u || t >= u.t) ultimo.set(r.questionId, { t, correct: r.correct }); }
  return id => { const u = ultimo.get(id); if (!u) return 'inedita'; if (u.correct) return 'acertou'; return Date.now() - u.t >= cfg.lista.revisao_dias * 864e5 ? 'revisao' : 'errou'; };
}

/** Lista de conjunto amplo: escolhe n questões do conjunto pela adequação, com revisão e aquecimento. */
export function montarLista(questoes, n, records, rng = Math.random) {
  const estado = estados(records), areas = new Set(questoes.map(areaDe));
  const alvo = areas.size === 1 ? (perfilDe([...areas][0])?.pstar ?? metaBase()) : metaBase();
  return T.montarLista(questoes.map(q => ({ id: q.id, p: chanceDe(q), estado: estado(q.id), alerta: temAlerta(q) })), n, alvo, cfg, rng);
}

/** Ordena questões da mais adequada à menos adequada para o desafio do aluno (meta de cada área).
 *  Usada nas fontes da prática contínua. Sem perfil carregado, devolve a ordem recebida. */
export function porAdequacao(questoes) {
  if (!pronto() || questoes.length < 2) return questoes;
  const agora = Date.now(), porArea = new Map();
  for (const q of questoes) { const a = areaDe(q); if (!porArea.has(a)) porArea.set(a, []); porArea.get(a).push(q); }
  const nota = new Map();
  for (const [a, qs] of porArea) {
    const p = perfilDe(a);
    if (!p) { qs.forEach(q => nota.set(q.id, 0.5)); continue; }
    const larg = T.alargar(p, agora, cfg), ps = qs.map(q => (q.tri ? T.ajustarChance(T.chance(larg, q.tri, cfg), deltaDe(a)) : null));
    const alvo = T.metaAlcancavel(p.pstar ?? metaBase(), ps.filter(Number.isFinite), cfg);
    qs.forEach((q, i) => nota.set(q.id, (Number.isFinite(ps[i]) ? T.adequacao(ps[i], alvo, cfg) : 0.5) * (temAlerta(q) ? cfg.penalidade_alerta : 1)));
  }
  return [...questoes].sort((x, y) => nota.get(y.id) - nota.get(x.id));
}

/** Envolve o motor de estudos: Montar lista e Seleção automática passam a considerar a dificuldade. */
export function comDificuldade(E) {
  return {
    ...E,
    selectPracticeQuestions(filters, records, seed, level) {
      if (!pronto()) return E.selectPracticeQuestions(filters, records, seed, level);
      const rng = E.createRng(seed);
      return montarLista(E.availableForFilters(filters), filters.count, records, rng);
    },
    buildAutoSelection(account, records, count, now, seed) {
      const sel = E.buildAutoSelection(account, records, count, now, seed);
      if (!pronto() || !sel.questionIds.length) return sel;
      // a seleção automática decide os assuntos; aqui só se aplica a ordem (aquecimento e adequação)
      return { ...sel, questionIds: montarLista(E.questionRepository.getMany(sel.questionIds), sel.questionIds.length, records, E.createRng(seed)) };
    },
  };
}

/** Chance prevista de cada questão no momento em que a lista é criada (para o “esperado” do resultado). */
export function previsto(ids, repo) {
  if (!pronto()) return {};
  return Object.fromEntries(ids.map(id => [id, chanceDe(repo.getById(id))]).filter(([, p]) => Number.isFinite(p)).map(([id, p]) => [id, Math.round(p * 1000) / 1000]));
}

/* ----------------------------- respostas ----------------------------- */
function registrarHistorico(area) {
  const r = T.resumoNota(perfis[area], cfg);
  if (r.status === 'calibrando') return;
  const dia = new Date().toISOString().slice(0, 10);
  historico = historico.filter(h => !(h.area === area && h.dia === dia)).concat({ area, dia, nota: r.nota, nota_min: r.min, nota_max: r.max, n: r.n });
}

/* ----------------------------- aprendizado ----------------------------- */
// Cada resposta vira um registro do que o recomendador aprendeu: θ, nota, faixa e meta antes e
// depois, a chance que ele tinha previsto e o motivo quando a resposta não entra no cálculo.
// Fica neste navegador (últimos 200) e alimenta o card da questão e o modo dev.
const CHAVE_APRENDIZADO = 'gabaritei:aprendizado:v1';
export const MOTIVOS = {
  parametros_fora_da_triagem: 'a questão não tem parâmetros TRI confiáveis do INEP',
  repeticao: 'você já tinha respondido esta questão antes',
  resposta_muito_rapida: 'a resposta veio em menos de 8 segundos',
};
let feed = [];
// Relido a cada uso: o modo dev acompanha o app ao vivo.
const lerFeed = () => { try { const v = JSON.parse(localStorage.getItem(CHAVE_APRENDIZADO)); if (Array.isArray(v)) feed = v; } catch { /* sem armazenamento: fica em memória */ } return feed; };
export const aprendizados = () => lerFeed().slice();
const CHAVE_MOSTRAR = 'gabaritei:mostrar-aprendizado';
export const mostrarAprendizado = () => { try { return localStorage.getItem(CHAVE_MOSTRAR) !== '0'; } catch { return true; } };
export const definirMostrarAprendizado = v => { try { localStorage.setItem(CHAVE_MOSTRAR, v ? '1' : '0'); } catch { /* ignora */ } avisar(); };
export const aprendizadoDe = id => [...lerFeed()].reverse().find(x => x.questaoId === id) ?? null;
function foto(p) {
  if (!p) return null;
  const { media, dp } = T.momentos(p, cfg), r = T.resumoNota(p, cfg);
  return { theta: +media.toFixed(3), dp: +dp.toFixed(3), nota: Math.round(T.notaDeTheta(p.area, media, cfg)), faixa: r.min != null ? [r.min, r.max] : null, status: r.status, n: p.n || 0, pstar: p.pstar ?? metaBase() };
}
function anotar(reg) {
  feed = [...lerFeed(), reg].slice(-200);
  try { localStorage.setItem(CHAVE_APRENDIZADO, JSON.stringify(feed)); } catch { /* sem armazenamento */ }
}
/** Também registra uma decisão do recomendador (ex.: por que a próxima questão foi escolhida). */
export function anotarDecisao(d) { anotar({ tipo: 'decisao', em: new Date().toISOString(), ...d }); avisar(); }

/** Depois de conferir uma resposta. tri = o que o servidor devolveu (com login). Devolve o aprendizado. */
export function registrarResposta(q, correta, { tempoMs, primeira = true, origem = 'pratica', tri = null } = {}) {
  if (!pronto()) return null;
  const area = areaDe(q);
  if (!T.AREAS.includes(area)) return null;
  const antesP = perfis[area], chanceAntes = chanceDe(q);
  const regra = T.contaParaTheta({ it: q.tri, primeira, tempoMs, origem }, cfg);
  let p = antesP, conta = regra.conta, motivo = regra.motivo ?? null;
  if (tri?.perfil) { p = tri.perfil; conta = tri.conta; motivo = tri.motivo ?? null; }
  else if (usuarioAtual()) return null; // com login sem resposta do servidor: o servidor continua sendo a fonte
  else {
    if (regra.conta) p = T.atualizar(p, q.tri, correta, cfg, { agoraMs: Date.now(), peso: regra.peso });
    if (origem === 'pratica') p = T.registrarAcerto(p, correta, cfg, metaBase());
  }
  perfis[area] = p; registrarHistorico(area); gravarLocal();
  const reg = {
    tipo: 'resposta', em: new Date().toISOString(), questaoId: q.id, area, acertou: !!correta, origem,
    tempoMs: Number.isFinite(tempoMs) ? Math.round(tempoMs) : null, b: q.tri?.b ?? null,
    chanceAntes: Number.isFinite(chanceAntes) ? +chanceAntes.toFixed(3) : null, chanceDepois: Number.isFinite(chanceDe(q)) ? +chanceDe(q).toFixed(3) : null,
    conta, motivo, peso: conta ? (origem === 'simulado' ? cfg.peso.simulado : cfg.peso.pratica) : 0,
    delta: deltaDe(area), antes: foto(antesP), depois: foto(p), servidor: !!tri?.perfil,
  };
  anotar(reg); avisar();
  return reg;
}

/** Respostas de um simulado finalizado (peso de prova). */
export async function registrarSimulado(sim, repo, recordsAntes) {
  if (!pronto()) return;
  const vistas = new Set(recordsAntes.map(r => r.questionId));
  const respostas = sim.questionIds.map(id => ({ id, a: sim.answers[id] })).filter(x => x.a?.selected).map(x => ({ questaoId: x.id, alternativa: x.a.selected, tempoMs: x.a.timeSpentMs }));
  if (!respostas.length) return;
  if (usuarioAtual()) {
    try {
      const antes = Object.fromEntries(T.AREAS.map(a => [a, foto(perfis[a])]));
      const v = await api('POST', '/api/eu/perfil-tri/respostas', { respostas }); perfis = v.perfis; historico = v.historico || historico;
      anotar({ tipo: 'simulado', em: new Date().toISOString(), respostas: respostas.length, areas: Object.fromEntries(T.AREAS.map(a => [a, { antes: antes[a], depois: foto(perfis[a]) }])) });
      avisar();
    } catch (e) { console.warn('Não foi possível registrar o simulado no perfil TRI.', e.message); }
    return;
  }
  for (const r of respostas) { const q = repo.getById(r.questaoId); if (q) registrarResposta(q, r.alternativa === q.correct, { origem: 'simulado', tempoMs: r.tempoMs, primeira: !vistas.has(q.id) }); }
}

/** Resultado da lista: acertos × esperado (só respostas com chance conhecida). */
export function esperado(session) {
  const prev = session.previsto || {}, apoio = session.apoio || {}; // apoio: só em listas antigas
  const ids = session.questionIds.filter(id => session.answers[id]?.confirmed && Number.isFinite(prev[id]) && !apoio[id]);
  if (ids.length < 3) return null;
  return { n: ids.length, acertos: ids.filter(id => session.answers[id].correct).length, esperado: ids.reduce((s, id) => s + prev[id], 0) };
}
