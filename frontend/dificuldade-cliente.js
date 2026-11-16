// Recomendador de dificuldade no navegador: perfil TRI por área, chance de cada questão, ordem das
// listas, ajuste suave do Semelhante, apoio e resumo da nota. Com login, o servidor é a fonte do perfil;
// sem login, o perfil fica neste navegador. O cálculo é o mesmo do servidor (dificuldade.js).
import * as T from './dificuldade.js';
import { usuarioAtual } from './conta.js';

const CHAVE = 'gabaritei:perfil-tri:v1';
const INEP = { matematica: 'MT', natureza: 'CN', humanas: 'CH', linguagens: 'LC' };
let cfg = null, perfis = null, historico = [], getAccount = () => null, ouvintes = new Set();

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
  return p ? T.chance(T.alargar(p, Date.now(), cfg), q.tri, cfg) : null;
}
export const apoioDisponivel = q => pronto() && T.apoioDisponivel(chanceDe(q), cfg);
export const eliminar = (q, semente) => T.eliminarAlternativas(q.alternatives.map(a => a.letter), q.correct, semente, cfg);

export function resumo() {
  if (!pronto()) return null;
  const resumos = T.AREAS.map(a => T.resumoNota(perfilDe(a), cfg));
  return { resumos, agregados: T.agregados(resumos), historico };
}

/* ----------------------------- ordens ----------------------------- */
/** Ajuste suave sobre a ordem do titulo_area (Semelhante e Recomendadas). */
export function ordenarSemelhantes(ids, repo) {
  if (!pronto()) return ids;
  const q0 = repo.getById(ids[0]), alvo = perfilDe(areaDe(q0))?.pstar ?? metaBase();
  return T.ordenarSemelhantes(ids, id => chanceDe(repo.getById(id)), alvo, cfg);
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
  return T.montarLista(questoes.map(q => ({ id: q.id, p: chanceDe(q), estado: estado(q.id), alerta: !!q.warning })), n, alvo, cfg, rng);
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

/** Depois de conferir uma resposta. tri = o que o servidor devolveu (com login). */
export function registrarResposta(q, correta, { apoio = false, tempoMs, primeira = true, origem = 'pratica', tri = null } = {}) {
  if (!pronto()) return;
  const area = areaDe(q);
  if (!T.AREAS.includes(area)) return;
  if (tri?.perfil) { perfis[area] = tri.perfil; registrarHistorico(area); avisar(); return; }
  if (usuarioAtual()) return; // com login sem resposta do servidor: o servidor continua sendo a fonte
  const regra = T.contaParaTheta({ it: q.tri, primeira, apoio, tempoMs, origem }, cfg);
  let p = perfis[area];
  if (regra.conta) p = T.atualizar(p, q.tri, correta, cfg, { agoraMs: Date.now(), peso: regra.peso });
  if (origem === 'pratica' && !apoio) p = T.registrarAcerto(p, correta, cfg, metaBase());
  perfis[area] = p; registrarHistorico(area); gravarLocal(); avisar();
}

/** Respostas de um simulado finalizado (peso de prova). */
export async function registrarSimulado(sim, repo, recordsAntes) {
  if (!pronto()) return;
  const vistas = new Set(recordsAntes.map(r => r.questionId));
  const respostas = sim.questionIds.map(id => ({ id, a: sim.answers[id] })).filter(x => x.a?.selected).map(x => ({ questaoId: x.id, alternativa: x.a.selected, tempoMs: x.a.timeSpentMs }));
  if (!respostas.length) return;
  if (usuarioAtual()) {
    try { const v = await api('POST', '/api/eu/perfil-tri/respostas', { respostas }); perfis = v.perfis; historico = v.historico || historico; avisar(); } catch (e) { console.warn('Não foi possível registrar o simulado no perfil TRI.', e.message); }
    return;
  }
  for (const r of respostas) { const q = repo.getById(r.questaoId); if (q) registrarResposta(q, r.alternativa === q.correct, { origem: 'simulado', tempoMs: r.tempoMs, primeira: !vistas.has(q.id) }); }
}

/** Resultado da lista: acertos × esperado (só respostas sem apoio e com chance conhecida). */
export function esperado(session) {
  const prev = session.previsto || {}, apoio = session.apoio || {};
  const ids = session.questionIds.filter(id => session.answers[id]?.confirmed && Number.isFinite(prev[id]) && !apoio[id]);
  if (ids.length < 3) return null;
  return { n: ids.length, acertos: ids.filter(id => session.answers[id].correct).length, esperado: ids.reduce((s, id) => s + prev[id], 0) };
}
