// Motor do recomendador de dificuldade (compartilhado: navegador e servidor).
// TRI 3PL com os parâmetros oficiais do INEP (D = 1,0), θ do aluno por área como distribuição numa grade
// (EAP), alargada pelo tempo sem prática. Sem dependências; só funções puras.
// Os números vêm de backend/config/dificuldade_v1.json; ver docs/recomendador-dificuldade.md.

export const AREAS = ['CN', 'CH', 'LC', 'MT'];

/* ------------------------------ grade e modelo ------------------------------ */
const grades = new WeakMap();
export function grade(cfg) {
  let g = grades.get(cfg);
  if (!g) {
    const { min, max, passo } = cfg.grade;
    const n = Math.round((max - min) / passo) + 1;
    g = Float64Array.from({ length: n }, (_, i) => min + i * passo);
    grades.set(cfg, g);
  }
  return g;
}

/** Parâmetros usáveis (passaram na triagem); senão null. */
export function triar(tri, cfg) {
  if (!tri || ![tri.a, tri.b, tri.c].every(Number.isFinite)) return null;
  const t = cfg.triagem;
  if (tri.a < t.a_min || tri.b < t.b_min || tri.b > t.b_max || tri.c < 0 || tri.c > t.c_max) return null;
  return { a: tri.a, b: tri.b, c: tri.c };
}

export const p3pl = (theta, it, D = 1) => it.c + (1 - it.c) / (1 + Math.exp(-D * it.a * (theta - it.b)));

/* ------------------------------ perfil do aluno ------------------------------ */
// perfil = { area, lw: log-pesos na grade (relativos ao máximo), n, atualizadoEm (ms), pstar, respostas: [bool...] (últimas) }

function normalLogPesos(cfg, media, dp) {
  return Array.from(grade(cfg), x => -0.5 * ((x - media) / dp) ** 2);
}

export function perfilInicial(area, cfg, { nota = null } = {}) {
  const pr = cfg.prior[area];
  const media = nota != null ? thetaDeNota(area, nota, cfg) : pr.media;
  const dp = nota != null ? 0.5 : pr.dp;
  return { area, lw: arred(normalLogPesos(cfg, media, dp)), n: 0, atualizadoEm: null, pstar: null, respostas: [] };
}

function pesos(lw) {
  const max = Math.max(...lw);
  const w = lw.map(v => Math.exp(v - max));
  const s = w.reduce((a, b) => a + b, 0);
  return w.map(v => v / s);
}

function arred(lw) {
  const max = Math.max(...lw);
  return lw.map(v => Math.max(-40, Math.round((v - max) * 1000) / 1000));
}

export function momentos(perfil, cfg) {
  const g = grade(cfg), w = pesos(perfil.lw);
  let m = 0; for (let i = 0; i < g.length; i++) m += w[i] * g[i];
  let v = 0; for (let i = 0; i < g.length; i++) v += w[i] * (g[i] - m) ** 2;
  return { media: m, dp: Math.sqrt(v) };
}

/** Alarga a distribuição pelo tempo sem prática (passeio aleatório): convolução gaussiana na grade. */
export function alargar(perfil, agoraMs, cfg) {
  if (!perfil.atualizadoEm || !agoraMs || agoraMs <= perfil.atualizadoEm) return perfil;
  const dias = (agoraMs - perfil.atualizadoEm) / 864e5;
  const varianca = Math.min(cfg.variancia_max_deriva, cfg.deriva_tau_por_dia ** 2 * dias);
  if (varianca < 1e-5) return perfil;
  const g = grade(cfg), w = pesos(perfil.lw), out = new Array(g.length).fill(0);
  const sd = Math.sqrt(varianca), passo = cfg.grade.passo, alcance = Math.ceil(4 * sd / passo);
  for (let i = 0; i < g.length; i++) {
    if (w[i] < 1e-12) continue;
    let soma = 0; const k = [];
    for (let d = -alcance; d <= alcance; d++) { const j = i + d; if (j < 0 || j >= g.length) continue; const v = Math.exp(-0.5 * (d * passo / sd) ** 2); k.push([j, v]); soma += v; }
    for (const [j, v] of k) out[j] += w[i] * v / soma;
  }
  return { ...perfil, lw: arred(out.map(v => Math.log(Math.max(v, 1e-300)))) };
}

/** Atualiza o perfil com uma resposta. peso: 1 (simulado) ou 0,8 (prática). */
export function atualizar(perfil, it, acertou, cfg, { agoraMs = Date.now(), peso = 1 } = {}) {
  const base = alargar(perfil, agoraMs, cfg), g = grade(cfg);
  const lw = base.lw.map((v, i) => {
    const p = Math.min(1 - 1e-9, Math.max(1e-9, p3pl(g[i], it, cfg.D)));
    return v + peso * Math.log(acertou ? p : 1 - p);
  });
  return { ...base, lw: arred(lw), n: base.n + 1, atualizadoEm: agoraMs };
}

/** Registra o acerto para o controlador de meta (não muda θ). */
export function registrarAcerto(perfil, acertou, cfg, alvoBase) {
  const janela = cfg.controlador.janela;
  const respostas = [...(perfil.respostas || []), !!acertou].slice(-janela);
  let pstar = perfil.pstar ?? alvoBase;
  if (respostas.length >= janela) {
    const acc = respostas.filter(Boolean).length / respostas.length;
    pstar = pstar + cfg.controlador.ganho * (alvoBase - acc);
    pstar = Math.min(alvoBase + cfg.controlador.amplitude, Math.max(alvoBase - cfg.controlador.amplitude, pstar));
  }
  return { ...perfil, respostas, pstar: Math.round(pstar * 10000) / 10000 };
}

/** Chance de acerto integrada sobre a distribuição atual do θ. */
export function chance(perfil, it, cfg) {
  const g = grade(cfg), w = pesos(perfil.lw);
  let p = 0; for (let i = 0; i < g.length; i++) p += w[i] * p3pl(g[i], it, cfg.D);
  return p;
}

/** Informação de Fisher do 3PL na média do θ. */
export function informacao(perfil, it, cfg) {
  const { media } = momentos(perfil, cfg), P = p3pl(media, it, cfg.D), D = cfg.D;
  return (D * it.a) ** 2 * ((P - it.c) / (1 - it.c)) ** 2 * (1 - P) / P;
}

/* ------------------------------ θ ↔ nota ------------------------------ */
export function notaDeTheta(area, theta, cfg) {
  const { theta: x, nota: y } = cfg.tabela_nota[area];
  if (theta <= x[0]) return y[0] + (theta - x[0]) * (y[1] - y[0]) / (x[1] - x[0]);
  if (theta >= x.at(-1)) return y.at(-1) + (theta - x.at(-1)) * (y.at(-1) - y.at(-2)) / (x.at(-1) - x.at(-2));
  let i = 1; while (x[i] < theta) i++;
  return y[i - 1] + (theta - x[i - 1]) * (y[i] - y[i - 1]) / (x[i] - x[i - 1]);
}
export function thetaDeNota(area, nota, cfg) {
  let lo = -6, hi = 6;
  for (let k = 0; k < 60; k++) { const mid = (lo + hi) / 2; if (notaDeTheta(area, mid, cfg) < nota) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}

/** Resumo da nota estimada para mostrar ao aluno. */
export function resumoNota(perfil, cfg) {
  const alvo = cfg.nota;
  if (!perfil) return { area: null, status: 'calibrando', n: 0, faltam: alvo.min_respostas };
  const { area, n } = perfil;
  if (n < alvo.min_respostas) return { area, status: 'calibrando', n, faltam: alvo.min_respostas - (n || 0) };
  const { media, dp } = momentos(perfil, cfg), r = v => Math.round(v / alvo.arredondar) * alvo.arredondar;
  const nota = r(notaDeTheta(area, media, cfg)), min = r(notaDeTheta(area, media - dp, cfg)), max = r(notaDeTheta(area, media + dp, cfg));
  if (max < 500) return { area, status: 'abaixo-500', n, nota, min, max, dp };
  return { area, status: dp <= alvo.dp_faixa_estreita ? 'estreita' : 'larga', n, nota, min, max, dp };
}

/** Média geral, exatas (MT+CN) e humanas (CH+LC), quando as áreas envolvidas já têm nota. */
export function agregados(resumos) {
  const ok = Object.fromEntries(resumos.filter(r => r.status !== 'calibrando').map(r => [r.area, r.nota]));
  const media = ks => ks.every(k => ok[k] != null) ? Math.round(ks.reduce((s, k) => s + ok[k], 0) / ks.length) : null;
  return { geral: media(AREAS), exatas: media(['MT', 'CN']), humanas: media(['CH', 'LC']) };
}

/* ------------------------------ escolha ------------------------------ */
const logit = p => { const q = Math.min(1 - 1e-4, Math.max(1e-4, p)); return Math.log(q / (1 - q)); };
export const metaDe = (desafio, cfg) => cfg.metas[desafio] ?? cfg.metas[cfg.desafio_padrao];
export function adequacao(p, alvo, cfg) { const d = logit(p) - logit(alvo); return Math.exp(-(d * d) / (2 * cfg.largura_logit ** 2)); }

/** Meta efetiva: o menor entre a meta do aluno e a chance da k-ésima questão mais acessível. */
export function metaAlcancavel(meta, chances, cfg) {
  const s = chances.filter(Number.isFinite).sort((a, b) => b - a);
  if (!s.length) return meta;
  return Math.min(meta, s[Math.min(cfg.meta_alcancavel_posicao, s.length) - 1]);
}

/** Semelhante: ordem do titulo_area com ajuste suave. ids na ordem do catálogo; chanceDe(id) → número ou null. */
export function ordenarSemelhantes(ids, chanceDe, alvo, cfg) {
  const { base, peso, candidatas } = cfg.semelhante;
  const lista = ids.slice(0, candidatas);
  const ps = lista.map(chanceDe);
  const alvoEf = metaAlcancavel(alvo, ps, cfg);
  return lista.map((id, k) => {
    const R = 1 / Math.log2(k + 2), A = Number.isFinite(ps[k]) ? adequacao(ps[k], alvoEf, cfg) : 0.5;
    return { id, s: R * (base + peso * A) };
  }).sort((a, b) => b.s - a.s).map(x => x.id).concat(ids.slice(candidatas));
}

/**
 * Lista de conjunto amplo (montar lista, seleção automática, aleatório na minha dificuldade).
 * candidatos: [{ id, p (chance ou null), estado: 'inedita' | 'revisao' | 'errou' | 'acertou', alerta }]
 * Devolve n ids: inéditas mais adequadas + até 20% de revisão de erros antigos; começa pela mais acessível.
 */
export function montarLista(candidatos, n, alvo, cfg, rng = Math.random) {
  const alvoEf = metaAlcancavel(alvo, candidatos.filter(c => c.estado === 'inedita').map(c => c.p), cfg);
  const nota = c => (Number.isFinite(c.p) ? adequacao(c.p, alvoEf, cfg) : 0.5) * (c.alerta ? cfg.penalidade_alerta : 1) + rng() * cfg.lista.jitter;
  const ord = arr => arr.map(c => ({ c, s: nota(c) })).sort((a, b) => b.s - a.s).map(x => x.c);
  const grupos = { inedita: [], revisao: [], errou: [], acertou: [] };
  for (const c of candidatos) (grupos[c.estado] ?? grupos.acertou).push(c);
  const vagasRevisao = Math.min(grupos.revisao.length, Math.floor(n * cfg.lista.revisao_fracao));
  const escolhidas = [...ord(grupos.revisao).slice(0, vagasRevisao)];
  for (const g of ['inedita', 'revisao', 'errou', 'acertou']) {
    for (const c of ord(grupos[g])) { if (escolhidas.length >= n) break; if (!escolhidas.includes(c)) escolhidas.push(c); }
  }
  // aquecimento: a mais acessível primeiro; o resto mantém a ordem de adequação
  const comChance = escolhidas.filter(c => Number.isFinite(c.p));
  if (comChance.length) { const facil = comChance.reduce((a, b) => (b.p > a.p ? b : a)); escolhidas.splice(escolhidas.indexOf(facil), 1); escolhidas.unshift(facil); }
  return escolhidas.map(c => c.id);
}

/* ------------------------------ contornos ------------------------------ */
export const apoioDisponivel = (p, cfg) => Number.isFinite(p) && p < cfg.apoio.abaixo_de;

/** Duas alternativas erradas, sempre as mesmas para a mesma semente. */
export function eliminarAlternativas(letras, correta, semente, cfg) {
  let h = 2166136261; for (const ch of String(semente)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  const erradas = letras.filter(l => l !== correta);
  const out = [];
  while (out.length < Math.min(cfg.apoio.eliminar, erradas.length)) { h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; const l = erradas[h % erradas.length]; if (!out.includes(l)) out.push(l); }
  return out.sort();
}

/** Uma resposta entra no cálculo de θ? */
export function contaParaTheta({ it, primeira, apoio, tempoMs, origem }, cfg) {
  if (!it) return { conta: false, motivo: 'parametros_fora_da_triagem' };
  if (!primeira) return { conta: false, motivo: 'repeticao' };
  if (apoio) return { conta: false, motivo: 'com_apoio' };
  if (Number.isFinite(tempoMs) && tempoMs < cfg.tempo_minimo_ms) return { conta: false, motivo: 'resposta_muito_rapida' };
  return { conta: true, peso: origem === 'simulado' ? cfg.peso.simulado : cfg.peso.pratica };
}
