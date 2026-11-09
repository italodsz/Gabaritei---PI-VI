import { createLearningPages } from './learning-pages.js';
import { createSidebar } from './sidebar.js';
import { createNotes } from './notes.js';
import { animate, spring, duration, ease, cssEase, reduced, pageEnter, bindPress, collapse, countTo, snapshot, flipList } from './motion-kit.js';
import { hi } from './legacy-ui.js';
import { getThemePref, setThemePref, currentTheme, onThemeChange } from './theme.js';

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const icon = name => `<svg aria-hidden="true"><use href="#i-${/^[a-z-]+$/.test(name) ? name : 'book'}"/></svg>`;
const escape = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const HOUR = 3600000;
const iso = ms => new Date(ms).toISOString();

/* ------------------------------------------------------------------ */
/* Dados do mural                                                      */
/* ------------------------------------------------------------------ */
// Atividades do plano com datas de criação/atualização (usadas na ordenação das pendências).
const seedNow = Date.now();
const initial = () => [
  { id: 'functions', title: 'Funções e gráficos', description: 'Pratique a leitura de gráficos e as relações entre grandezas.', area: 'Matemática', icon: 'plus', done: true, saved: false, createdAt: iso(seedNow - 140 * HOUR), updatedAt: iso(seedNow - 30 * HOUR) },
  { id: 'reading', title: 'Interpretação de texto', description: 'Explore sentidos, argumentos e estratégias de leitura.', area: 'Linguagens', icon: 'book', done: true, saved: false, createdAt: iso(seedNow - 120 * HOUR), updatedAt: iso(seedNow - 50 * HOUR) },
  { id: 'ecology', title: 'Ecologia e ambiente', description: 'Conecte os seres vivos, o ambiente e as suas relações.', area: 'Natureza', icon: 'leaf', done: false, saved: false, createdAt: iso(seedNow - 76 * HOUR), updatedAt: iso(seedNow - 28 * HOUR) },
  { id: 'percentage', title: 'Porcentagem no cotidiano', description: 'Resolva situações com descontos e proporções.', area: 'Matemática', icon: 'calculator', done: false, saved: false, createdAt: iso(seedNow - 92 * HOUR), updatedAt: iso(seedNow - 44 * HOUR) },
  { id: 'humanities-sim', title: 'Simulado de Humanas', description: 'Dez questões de Ciências Humanas, com correção ao finalizar.', area: 'Humanas', kind: 'simulado', icon: 'clock', done: false, saved: true, createdAt: iso(seedNow - 98 * HOUR), updatedAt: iso(seedNow - 50 * HOUR) },
  { id: 'colonia', title: 'Brasil Colônia e Império', description: 'Ciclos econômicos, sociedade colonial e a chegada da corte.', area: 'Humanas', icon: 'book', done: false, saved: false, createdAt: iso(seedNow - 80 * HOUR), updatedAt: iso(seedNow - 32 * HOUR) },
  { id: 'sim-matematica', title: 'Simulado de Matemática', description: 'Dez questões de Matemática, com tempo de prova e nota ao final.', area: 'Matemática', kind: 'simulado', icon: 'clock', done: false, saved: false, createdAt: iso(seedNow - 68 * HOUR), updatedAt: iso(seedNow - 20 * HOUR) },
  { id: 'english', title: 'Leitura em inglês', description: 'Textos curtos com foco em vocabulário e na ideia principal.', area: 'Linguagens', icon: 'book', done: false, saved: true, createdAt: iso(seedNow - 72 * HOUR), updatedAt: iso(seedNow - 24 * HOUR) },
  { id: 'physics-energy', title: 'Energia e eletricidade', description: 'Potência, consumo e circuitos do dia a dia.', area: 'Natureza', icon: 'leaf', done: false, saved: false, createdAt: iso(seedNow - 108 * HOUR), updatedAt: iso(seedNow - 60 * HOUR) },
  { id: 'sim-natureza', title: 'Simulado de Natureza', description: 'Biologia, Física e Química em uma prova de dez questões.', area: 'Natureza', kind: 'simulado', icon: 'clock', done: false, saved: false, createdAt: iso(seedNow - 86 * HOUR), updatedAt: iso(seedNow - 38 * HOUR) },
  { id: 'sim-linguagens', title: 'Simulado de Linguagens', description: 'Português, literatura e língua estrangeira em dez questões.', area: 'Linguagens', kind: 'simulado', icon: 'clock', done: true, saved: false, createdAt: iso(seedNow - 160 * HOUR), updatedAt: iso(seedNow - 90 * HOUR) },
  { id: 'sim-matematica-feito', title: 'Simulado · Matemática', description: 'Prova de Matemática já corrigida: confira a nota no Histórico.', area: 'Matemática', kind: 'simulado', icon: 'clock', simId: 'demo-simulado-005', done: true, saved: false, createdAt: iso(seedNow - 180 * HOUR), updatedAt: iso(seedNow - 110 * HOUR) },
];
/** Versão dos cards de demonstração: quem já tem dados salvos recebe os cards novos uma única vez. */
const DEMO_SEED = 2;
const studyAreas = [
  { key: 'linguagens', area: 'Linguagens', title: 'Linguagens, Códigos', fullName: 'Linguagens, Códigos e suas Tecnologias', subjects: 'LEITURA · EXPRESSÃO · CULTURA', text: 'Textos, sentidos e novas formas de ver o mundo.', id: 'reading', art: 'linguagens' },
  { key: 'natureza', area: 'Natureza', title: 'Ciências da Natureza', fullName: 'Ciências da Natureza e suas Tecnologias', subjects: 'BIOLOGIA · FÍSICA · QUÍMICA', text: 'Descubra as conexões entre a vida e a ciência.', id: 'ecology', art: 'natureza' },
  { key: 'humanas', area: 'Humanas', title: 'Ciências Humanas', fullName: 'Ciências Humanas e suas Tecnologias', subjects: 'SOCIEDADE · HISTÓRIA · ESPAÇO', text: 'Entenda as pessoas, os lugares e suas histórias.', id: 'humanities', art: 'humanas' },
  { key: 'matematica', area: 'Matemática', title: 'Matemática', fullName: 'Matemática e suas Tecnologias', subjects: 'LÓGICA · NÚMEROS · GEOMETRIA', text: 'Encontre caminhos entre números e ideias.', id: 'functions', art: 'matematica' },
];
const areaKey = name => studyAreas.find(area => area.area === name)?.key || 'livre';
const AREA_NAME_BY_KEY = Object.fromEntries(studyAreas.map(a => [a.key, a.area]));

let activities = initial();
let demoSeedUpdated = false;
try {
  const stored = JSON.parse(localStorage.getItem('gabaritei:plano:v1') ?? localStorage.getItem('gabaritei:canvas-prototype:v1'));
  if (stored && Array.isArray(stored.activities) && stored.activities.every(a => typeof a.id === 'string' && typeof a.title === 'string' && typeof a.description === 'string' && typeof a.area === 'string')) {
    // Migração: o card "Continue de onde parou" virou derivado das listas em andamento;
    // atividades antigas ganham datas de criação/atualização.
    activities = stored.activities.filter(a => !a.featured).map((a, i) => ({ ...a, createdAt: a.createdAt ?? iso(seedNow - (200 - i) * HOUR), updatedAt: a.updatedAt ?? a.createdAt ?? iso(seedNow - (200 - i) * HOUR) }));
    if ((stored.seed ?? 1) < DEMO_SEED) {
      const have = new Set(activities.map(a => a.id));
      activities.push(...initial().filter(a => !have.has(a.id)));
      demoSeedUpdated = true;
    }
  }
} catch { /* O protótipo também funciona sem armazenamento. */ }
if (demoSeedUpdated) persist(); // grava a versão para não reacrescentar cards excluídos
const PEND_VIEW_KEY = 'gabaritei:pendentes-view:v1';
const state = { page: 'plano', view: (() => { try { return localStorage.getItem(PEND_VIEW_KEY) === 'list' ? 'list' : 'map'; } catch { return 'map'; } })(), showDone: false, saved: false, zoom: 1, simArea: null, simView: 'areas' };
/** Início e Pendentes usam a mesma área (#plan-page): mural, notas e guias rápidas. */
const onBoard = () => state.page === 'plano' || state.page === 'pendentes';
function persist() { try { localStorage.setItem('gabaritei:plano:v1', JSON.stringify({ activities, seed: DEMO_SEED })); } catch { /* Estado mantido nesta sessão. */ } }
const touch = a => { a.updatedAt = new Date().toISOString(); };
let toastTimeout;
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimeout); toastTimeout = setTimeout(() => $('#toast').classList.remove('visible'), 3200); }

// Detalhes de fundo de cada área (texto decorativo em branco translúcido).
const CARD_DECOR = { matematica: ['√x', 'π'], linguagens: ['Aa', '¶'], natureza: ['H<sub>2</sub>O', 'Δ'], humanas: ['XIX', '§'], livre: ['Aa', '?'] };
const AREA_LABEL = { matematica: 'MATEMÁTICA', linguagens: 'LINGUAGENS', natureza: 'NATUREZA', humanas: 'HUMANAS', livre: 'ESTUDO LIVRE' };
const PLAY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.2 5.2C8.2 4.4 9.1 3.9 9.8 4.4L19.3 10.9C20 11.4 20 12.6 19.3 13.1L9.8 19.6C9.1 20.1 8.2 19.6 8.2 18.8Z"/></svg>';
const KIND = { lista: { icon: 'list', label: 'Lista de questões' }, simulado: { icon: 'clock', label: 'Simulado' } };
const ACTIVITY_LISTS = {
  functions: { topicIds: ['mat-funcoes'] },
  percentage: { topicIds: ['mat-porcentagem', 'mat-proporcao'] },
  reading: { topicIds: ['por-interpretacao', 'por-generos', 'por-funcoes'] },
  ecology: { topicIds: ['bio-ecologia', 'qui-ambiental', 'geo-ambiental'] },
  humanities: { topicIds: ['geo-natureza', 'geo-cartografia'] },
  colonia: { topicIds: ['his-brasil-colonia', 'his-brasil-imperio'] },
  english: { topicIds: ['ing-interpretacao'] },
  'physics-energy': { topicIds: ['fis-energia', 'fis-eletricidade'] },
};
const AREA_IDS = { Linguagens: 'linguagens', Natureza: 'natureza', Humanas: 'humanas', Matemática: 'matematica' };
const listFor = a => (a.kind === 'simulado' ? { areaId: AREA_IDS[a.area] ?? 'matematica', count: 10 } : { count: 5, ...(ACTIVITY_LISTS[a.id] ?? { areaId: AREA_IDS[a.area] ?? 'matematica' }) });
function getActivity(id) { return activities.find(item => item.id === id) || (id === 'humanities' ? { id, title: 'A Terra em movimento', area: 'Humanas', description: 'Explore as relações entre os movimentos da Terra e o nosso cotidiano.', done: false, createdAt: iso(Date.now()), updatedAt: iso(Date.now()) } : null); }

/* ------------------------------------------------------------------ */
/* Pendências: atividades + listas e simulados em andamento            */
/* ------------------------------------------------------------------ */
/** Une atividades do plano e sessões em andamento num único formato de card. */
/** Sessão aberta (fora do plano) em que ainda não se respondeu nada. */
const untouched = it => (it.source !== 'activity' && !it.done && (it.answered ?? 0) === 0 ? 1 : 0);
function studyItems() {
  const linked = new Set(activities.flatMap(a => [a.sessionId, a.simId]).filter(Boolean));
  const fromActivities = activities.map(a => {
    const info = a.kind === 'simulado' ? (a.simId ? learning.simulationInfo(a.simId) : null) : (a.sessionId ? learning.sessionInfo(a.sessionId) : null);
    const sessionDate = info ? (a.kind === 'simulado' ? info.updatedAt : learning.account().practiceSessions.find(s => s.id === a.sessionId)?.updatedAt) : null;
    const date = [a.updatedAt, sessionDate].filter(Boolean).sort().pop() || a.createdAt;
    const total = info?.total ?? listFor(a).count;
    return { key: `activity:${a.id}`, source: 'activity', id: a.id, title: a.title, description: a.description, area: a.area, kind: a.kind === 'simulado' ? 'simulado' : 'lista', done: a.done, saved: a.saved, date, total, answered: a.done ? total : (info?.answered ?? 0), inProgress: info?.status === 'in_progress' && (info?.answered ?? 0) > 0 };
  });
  const fromSessions = learning.pendingSessions().filter(s => !linked.has(s.id)).map(s => {
    const areaName = s.areaIds?.length === 1 ? AREA_NAME_BY_KEY[s.areaIds[0]] : (s.areaIds?.length ? AREA_NAME_BY_KEY[s.areaIds[0]] : 'Matemática');
    return { key: `${s.kind}:${s.id}`, source: s.kind, id: s.id, title: s.title, description: s.kind === 'simulation' ? 'Simulado interrompido · correção ao finalizar' : 'Lista em andamento', area: areaName || 'Matemática', mixed: (s.areaIds?.length ?? 0) > 1, kind: s.kind === 'simulation' ? 'simulado' : 'lista', done: false, saved: false, date: s.updatedAt || s.createdAt, total: s.total, answered: s.answered, inProgress: true };
  });
  return [...fromActivities, ...fromSessions];
}
const norm = text => text.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/\p{Diacritic}/gu, '');
function visibleItems() {
  const query = norm($('#search').value.trim());
  return studyItems()
    // A lista principal mostra só pendências; "Concluídas" mostra só as concluídas, à parte.
    .filter(it => (state.showDone ? it.done : !it.done) && (!state.saved || it.saved) && norm(`${it.title} ${it.description} ${it.area}`).includes(query))
    // Pendentes: só listas e simulados já começados e ainda não terminados.

    // Da atividade mais recente para a mais antiga (atualização, com criação como reserva).
    // Listas e simulados abertos sem nenhuma resposta ("0 de N") vão para o fim, para não
    // empurrar as atividades do plano para baixo.
    // Grade e Lista: mesma lista e mesma ordem. Em andamento primeiro (mais recente no topo),
    // depois as ainda não começadas; sessões abertas sem resposta ficam por último.
    .sort((a, b) => (b.inProgress ? 1 : 0) - (a.inProgress ? 1 : 0) || untouched(a) - untouched(b) || b.date.localeCompare(a.date));
}

/* ------------------------------------------------------------------ */
/* Cards                                                               */
/* ------------------------------------------------------------------ */
const refOf = it => JSON.stringify(it.source === 'activity' ? { kind: 'activity', id: it.id } : { kind: it.source, id: it.id });
function cardHTML(it, i, featured) {
  const key = it.mixed ? 'livre' : areaKey(it.area);
  const kind = KIND[it.kind];
  const progress = `<div class="card-progress" role="progressbar" aria-label="Progresso: ${it.answered} de ${it.total} questões ${it.kind === 'simulado' ? 'respondidas' : 'respondidas'}" aria-valuemin="0" aria-valuemax="${it.total}" aria-valuenow="${it.answered}"><span class="card-progress-bar"><span style="width:${it.total ? (it.answered / it.total) * 100 : 0}%"></span></span><span class="card-progress-text">${it.done ? 'Concluída' : `<b>${it.answered}</b> de ${it.total} respondidas`}</span></div>`;
  const [big, small] = CARD_DECOR[key] || CARD_DECOR.livre;
  const decor = `<span class="card-decoration" aria-hidden="true">${big}</span><span class="card-decoration is-small" aria-hidden="true">${small}</span>`;
  const actionLabel = it.done ? 'Praticar novamente' : it.inProgress || it.source !== 'activity' ? 'Continuar' : it.kind === 'simulado' ? 'Começar simulado' : 'Começar prática';
  const label = featured ? (it.done ? 'MAIS UM PASSO CONCLUÍDO' : 'SEU PRÓXIMO PASSO') : `${AREA_LABEL[key] || escape(it.area).toUpperCase()}${it.done ? ' · CONCLUÍDA' : ''}`;
  const isActivity = it.source === 'activity';
  return `<article class="activity-card is-colored ${featured ? 'featured' : ''} ${it.done ? 'is-done' : ''}" data-key="${escape(it.key)}" data-id="${escape(it.id)}" data-source="${it.source}" data-area="${key}" data-note-ref='${escape(refOf(it))}' style="--index:${i}" title="Arraste para Minhas notas para criar um atalho">
    <div class="card-head"><span class="card-kind">${icon(kind.icon)}${kind.label}</span><span class="card-top-label">${label}</span></div><h2>${escape(it.title)}</h2><p class="card-description">${escape(it.description)}</p>
    ${decor}<button class="play-button" data-action="start" aria-label="${actionLabel}: ${escape(it.title)}">${PLAY_ICON}</button>
    ${progress}<div class="card-actions"><button class="resume-button" data-action="start">${icon(it.done ? 'check' : it.inProgress ? 'clock' : 'arrow')}${actionLabel}</button><div class="card-action-group"><button class="icon-button card-menu-button" data-action="menu" aria-haspopup="menu" aria-expanded="false" aria-label="Mais opções: ${escape(it.title)}">${icon('dots')}</button>${isActivity ? `<button class="icon-button save-button" data-action="save" aria-label="${it.saved ? 'Remover dos salvos' : 'Salvar atividade'}: ${escape(it.title)}" aria-pressed="${Boolean(it.saved)}">${icon('bookmark')}</button><button class="icon-button complete-button ${it.done ? 'done' : ''}" data-action="complete" aria-pressed="${Boolean(it.done)}" aria-label="${it.done ? 'Marcar como pendente' : 'Marcar como concluída'}: ${escape(it.title)}">${icon('check')}</button>` : ''}</div></div>
  </article>`;
}

/* ------------------------------------------------------------------ */
/* Render da página inicial                                            */
/* ------------------------------------------------------------------ */
let firstPaint = true;
function render({ enter = false } = {}) {
  // Atividades vinculadas a listas/simulados concluídos passam a "concluída".
  let synced = false;
  for (const a of activities) {
    if (a.done) continue;
    const done = a.kind === 'simulado' ? (a.simId && learning.simulationInfo(a.simId)?.status === 'completed') : (a.sessionId && learning.sessionInfo(a.sessionId)?.status === 'completed');
    if (done) { a.done = true; touch(a); synced = true; }
  }
  if (synced) persist();
  const all = studyItems();
  const items = visibleItems();
  const pendingCount = all.filter(it => !it.done).length;
  $('#total-count').textContent = all.length;
  $('#done-count').textContent = all.filter(it => it.done).length;
  $('#upcoming-count').textContent = pendingCount;
  const canvas = $('#learning-canvas');
  const practicing = state.page === 'plano';
  canvas.dataset.view = practicing ? 'practice' : state.view;
  canvas.style.setProperty('--zoom', state.zoom);
  $('#empty-state').hidden = practicing || items.length > 0;
  $('#empty-state h2').textContent = state.showDone ? 'Nada concluído por aqui' : $('#search').value ? 'Nenhum assunto por aqui' : 'Nada pendente por aqui';
  $('#empty-state p').textContent = state.showDone ? 'Conclua uma lista ou simulado para vê-lo aqui.' : $('#search').value ? 'Experimente outra palavra ou limpe os filtros.' : 'Listas e simulados que você começar e ainda não terminar aparecem aqui. Para praticar agora, volte ao Início.';
  const banner = state.showDone ? '<div class="done-banner"><span>Mostrando só as atividades <b>concluídas</b>, separadas das pendências.</span><button type="button" id="back-to-pending">Voltar às pendências</button></div>' : '';
  const featuredFirst = !state.showDone;
  if (practicing) {
    $('#activities').innerHTML = practiceHubHTML();
    bindPracticeHub();
  } else if (state.view === 'map') {
    const left = [], right = [];
    items.forEach((it, i) => (i % 2 === 0 ? left : right).push(cardHTML(it, i, featuredFirst && i === 0)));
    $('#activities').innerHTML = `${banner}<div class="trail-col">${left.join('')}</div><div class="trail-col is-right">${right.join('')}</div>`;
  } else {
    $('#activities').innerHTML = banner + items.map((it, i) => cardHTML(it, i, featuredFirst && i === 0)).join('');
  }
  $('#back-to-pending')?.addEventListener('click', () => { state.showDone = false; render({ enter: true }); });
  $('#filter-button')?.setAttribute('aria-pressed', state.showDone);
  $('#saved-button')?.setAttribute('aria-pressed', state.saved);
  paintViewSwitch();
  $$('[data-view]').filter(el => el.tagName === 'BUTTON').forEach(button => { button.classList.toggle('selected', button.dataset.view === state.view); button.setAttribute('aria-pressed', button.dataset.view === state.view); });
  observeCards();
  if (practicing) { firstPaint = false; drawTrail({ instant: true }); if (enter) enterPracticeHub(); }
  else if (enter || firstPaint) { firstPaint = false; enterCards(); } else drawTrail({ instant: true });
  notes?.refresh();
  sidebar?.renderBottom();
}

/* ------------------------------------------------------------------ */
/* Praticar: hub de prática contínua                                   */
/* ------------------------------------------------------------------ */
const RECO_SOURCES = [
  ['marcadas', 'Marcadas para revisar', 'bookmark'],
  ['erradas', 'Erradas da última vez', 'x-circle'],
  ['pendentes', 'Pendentes em listas', 'clock'],
  ['dificuldade', 'Assuntos com dificuldade', 'target'],
  ['revisao', 'Revisão espaçada', 'history'],
  ['ineditas', 'Inéditas relevantes', 'spark'],
];
function practiceHubHTML() {
  const o = learning.recommendationOverview();
  const chips = RECO_SOURCES.filter(([k]) => o.counts[k]).map(([k, label, ic]) => `<span class="ph-chip">${icon(ic)}<b>${Math.min(o.counts[k], 99)}${o.counts[k] > 99 ? '+' : ''}</b>${label}</span>`).join('');
  const next = o.next.map((q, i) => `<li style="--i:${i}"><span class="ph-dot area-${q.areaId}"></span><span class="ph-next-copy"><strong>${escape(q.subject)} · ${escape(q.topic)}</strong><small>${escape(q.reason)}</small></span></li>`).join('');
  const cta = o.active ? `Continuar praticando <small>${o.active.answered} respondidas</small>` : 'Começar a praticar';
  return `<section class="practice-hub" aria-label="Praticar">
    <article class="ph-main">
      <div class="ph-main-copy">
        <span class="ph-kicker">${icon('spark')} PRÁTICA CONTÍNUA</span>
        <h2>Recomendações para você</h2>
        <p>Sem escolher matéria nem quantidade: as questões chegam uma depois da outra, priorizando o que mais ajuda agora. Pare quando quiser e continue de onde parou.</p>
        <div class="ph-chips">${chips || '<span class="ph-chip">Responda algumas questões para personalizar a fila.</span>'}</div>
        <button type="button" class="ph-start" id="ph-start" data-press="0.97">${icon('play')}<span>${cta}</span></button>
      </div>
      <div class="ph-queue"><span class="ph-queue-label">PRÓXIMAS NA FILA</span><ol>${next || '<li><span class="ph-next-copy"><small>Nenhuma questão disponível.</small></span></li>'}</ol><small class="ph-queue-foot">${o.total} questões na fila · regras locais de demonstração</small></div>
    </article>
    <div class="ph-modes">${challengeCardHTML()}${reviewCardHTML()}</div>
  </section>`;
}
/** Card do Desafio de acertos: recorde pessoal e últimas tentativas. */
function challengeCardHTML() {
  const st = learning.challengeStore();
  const last = st.attempts.at(-1);
  const recent = st.attempts.slice(-8);
  const max = Math.max(1, ...recent.map(a => a.streak));
  return `<article class="ph-mode ph-challenge" data-mode="desafio">
    <div class="ph-ch-copy">
      <span class="ph-ch-kicker">${hi('Zap')} DESAFIO DE ACERTOS</span>
      <h3>Até onde você chega?</h3>
      <p>Questões de todas as áreas, uma por vez. Errou ou o tempo acabou, o desafio termina.</p>
      <ul class="ph-ch-rules"><li>${hi('Timer')}03:40 por questão</li><li>${hi('Lock')}Sem pausa nem pulo</li></ul>
      <button type="button" class="ph-ch-start" id="ph-challenge" data-press="0.97">${hi('Play')}Começar desafio</button>
    </div>
    <div class="ph-ch-record" aria-label="Recorde pessoal: ${st.best} acertos seguidos">
      <span>${hi('Trophy')}RECORDE</span><strong>${st.best}</strong><small>${st.best === 1 ? 'acerto seguido' : 'acertos seguidos'}</small>
      ${recent.length ? `<div class="ph-ch-bars" aria-hidden="true">${recent.map(a => `<i style="--h:${Math.max(0.08, a.streak / max)}"></i>`).join('')}</div><em>Última: ${last.streak}</em>` : '<em>Nenhuma tentativa ainda</em>'}
    </div>
  </article>`;
}
/** Card do Revisar: erros ainda não superados. */
function reviewCardHTML() {
  const o = learning.reviewOverview();
  if (!o.pending && !o.active) return `<article class="ph-mode ph-review is-empty" data-mode="revisar">
    <span class="ph-rv-icon">${hi('CheckCircle2')}</span>
    <div><span class="ph-rv-kicker">REVISAR</span><h3>Tudo revisado por enquanto!</h3><p>Nenhuma questão errada pendente. Quando errar alguma, ela aparece aqui até você acertá-la.</p>
    <button type="button" class="ph-rv-start" id="ph-other" data-press="0.97">${hi('Sparkles')}Iniciar outra prática</button></div>
  </article>`;
  const a = o.active;
  const pct = a ? a.reviewed / Math.max(1, a.total) : 0;
  return `<article class="ph-mode ph-review" data-mode="revisar">
    <div class="ph-rv-ring" style="--p:${pct}" role="img" aria-label="${a ? `${a.reviewed} de ${a.total} revisadas` : `${o.pending} pendentes`}"><strong>${a ? a.reviewed : o.pending}</strong><small>${a ? `de ${a.total}` : 'pendentes'}</small></div>
    <div><span class="ph-rv-kicker">REVISAR</span><h3>Erros para superar</h3>
      <p>${o.pending} ${o.pending === 1 ? 'questão errada continua pendente' : 'questões erradas continuam pendentes'}. Cada uma sai da fila quando você acertá-la.</p>
      ${a ? `<div class="ph-rv-stats"><span><b>${a.initial}</b> no início</span><span><b>${a.reviewed}</b> revisadas</span><span><b>${a.correct}</b> acertadas</span></div>` : ''}
      <button type="button" class="ph-rv-start" id="ph-review" data-press="0.97">${hi('RotateCcw')}${a ? 'Continuar revisão' : 'Revisar agora'}</button></div>
  </article>`;
}
function bindPracticeHub() {
  $('#ph-start')?.addEventListener('click', () => learning.startRecommended());
  $('#ph-challenge')?.addEventListener('click', () => learning.startChallenge());
  $('#ph-review')?.addEventListener('click', () => learning.startReviewMode());
  $('#ph-other')?.addEventListener('click', () => learning.startRecommended());
}
function enterPracticeHub() {
  if (reduced()) return;
  animate($('.ph-main'), { opacity: [0, 1], y: [16, 0], scale: [0.985, 1] }, spring.soft);
  $$('.ph-queue li').forEach((li, i) => animate(li, { opacity: [0, 1], x: [12, 0] }, { ...spring.soft, delay: 0.12 + i * 0.06 }));
  $$('.ph-chip').forEach((c, i) => animate(c, { opacity: [0, 1], y: [6, 0] }, { ...spring.snappy, delay: 0.08 + i * 0.04 }));
  $$('.ph-mode').forEach((m, i) => animate(m, { opacity: [0, 1], y: [14, 0] }, { ...spring.soft, delay: 0.18 + i * 0.07 }));
  $$('.ph-ch-bars i').forEach((b, i) => b.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(var(--h))' }], { duration: 600, delay: 350 + i * 50, easing: cssEase.out, fill: 'backwards' }));
  const ring = $('.ph-rv-ring');
  if (ring) { const p = ring.style.getPropertyValue('--p'); ring.animate([{ '--p': 0 }, { '--p': p }], { duration: 900, delay: 250, easing: cssEase.out, fill: 'backwards' }); }
  const rec = $('.ph-ch-record strong');
  if (rec) countTo(rec, Number(rec.textContent), { from: 0, seconds: 0.8 });
}
/* ------------------------------------------------------------------ */
/* Entrada coordenada: cards, depois os tracejados                      */
/* ------------------------------------------------------------------ */
let entering = 0;
function enterCards() {
  const token = ++entering;
  trailDrawn = false;
  const canvas = $('#learning-canvas');
  const cards = $$('.activity-card', canvas).sort((a, b) => Number(a.style.getPropertyValue('--index')) - Number(b.style.getPropertyValue('--index')));
  const stats = $('.stats', canvas);
  // A geometria do traço é calculada já com o layout final (offsets não mudam com a animação).
  drawTrail({ hidden: true });
  if (reduced()) { trailDrawn = true; drawTrail({ instant: true }); return; }
  // `translate` (propriedade separada) não interfere na rotação do card destacado.
  const arrive = (el, delay) => el.animate([{ opacity: 0, translate: '0 14px' }, { opacity: 1, translate: '0 0' }], { duration: duration.slow * 1000 + 120, delay, easing: cssEase.out, fill: 'backwards' }).finished.catch(() => {});
  const jobs = [stats && arrive(stats, 0), ...cards.map((c, i) => arrive(c, 60 + i * 70))].filter(Boolean);
  const longest = 60 + cards.length * 70 + duration.slow * 1000 + 200;
  Promise.race([Promise.all(jobs), new Promise(r => setTimeout(r, longest))]).then(() => { if (token === entering) { trailDrawn = true; drawTrail({ animateIn: true }); } });
}

/**
 * Tracejados da trilha: uma linha vertical entre as colunas, com ramos até a
 * lateral de cada card e uma bolinha em cada ponta. Os pontos de conexão vêm
 * da posição de LAYOUT de cada card (offsetLeft/Top), corrigida pela transformação
 * estática do card (rotação do destacado) e pelo zoom do mural — por isso não
 * entortam durante as animações de entrada nem em mudanças de tamanho.
 */
function drawTrail({ hidden = false, animateIn = false, instant = false } = {}) {
  const canvas = $('#learning-canvas');
  const svg = canvas?.querySelector('.connections');
  if (!svg || state.page !== 'pendentes') return;
  const cols = [...canvas.querySelectorAll('.trail-col')];
  if (state.view !== 'map' || cols.length < 2 || matchMedia('(max-width: 760px)').matches) { svg.innerHTML = ''; return; }
  const act = $('#activities');
  const zoom = state.zoom;
  const W = canvas.clientWidth, H = Math.max(canvas.scrollHeight, act.offsetTop + act.offsetHeight * zoom);
  const cx = act.offsetWidth / 2;
  const toCanvas = (x, y) => ({ x: act.offsetLeft + cx + (x - cx) * zoom, y: act.offsetTop + y * zoom });
  /** Ponto local (px, py) do card, depois da transformação estática do próprio card. */
  const cardPoint = (card, px, py) => {
    let left = 0, top = 0, el = card;
    while (el && el !== act) { left += el.offsetLeft; top += el.offsetTop; el = el.offsetParent; }
    const t = getComputedStyle(card).transform;
    let x = px, y = py;
    if (t && t !== 'none') {
      const m = new DOMMatrixReadOnly(t);
      const ox = card.offsetWidth / 2, oy = card.offsetHeight / 2;
      const p = m.transformPoint(new DOMPoint(px - ox, py - oy));
      x = p.x + ox; y = p.y + oy;
    }
    return toCanvas(left + x, top + y);
  };
  const anchors = [];
  for (const card of cols[0].querySelectorAll('.activity-card')) anchors.push({ ...cardPoint(card, card.offsetWidth - 2, Math.min(card.offsetHeight * 0.45, 110)), side: -1 });
  for (const card of cols[1].querySelectorAll('.activity-card')) anchors.push({ ...cardPoint(card, 2, Math.min(card.offsetHeight * 0.45, 110)), side: 1 });
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', W); svg.setAttribute('height', H);
  svg.style.width = `${W}px`; svg.style.height = `${H}px`;
  if (anchors.length < 2) { svg.innerHTML = ''; return; }
  const colL = cols[0], colR = cols[1];
  const midLocal = (colL.offsetLeft + colL.offsetWidth + colR.offsetLeft) / 2;
  const x = toCanvas(midLocal, 0).x;
  anchors.sort((a, b) => a.y - b.y);
  const r = 12, top = anchors[0], bottom = anchors[anchors.length - 1];
  const f = n => n.toFixed(1);
  let d = `M${f(top.x)} ${f(top.y)}H${f(x + top.side * r)}Q${f(x)} ${f(top.y)} ${f(x)} ${f(top.y + r)}V${f(bottom.y - r)}Q${f(x)} ${f(bottom.y)} ${f(x + bottom.side * r)} ${f(bottom.y)}H${f(bottom.x)}`;
  for (const a of anchors.slice(1, -1)) d += `M${f(x)} ${f(a.y)}H${f(a.x)}`;
  svg.innerHTML = `<defs><mask id="trail-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><path d="${d}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${hidden || animateIn ? 1 : 0}"/></mask></defs><path class="trail-line" d="${d}" mask="url(#trail-mask)"/><g>${anchors.map(a => `<circle cx="${f(a.x)}" cy="${f(a.y)}" r="3.2" ${hidden || animateIn ? 'style="opacity:0"' : ''}/>`).join('')}</g>`;
  if (animateIn && !reduced()) {
    const m = svg.querySelector('mask path');
    m.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 900, easing: cssEase.emphasized, fill: 'forwards' });
    $$('circle', svg).forEach((c, i) => c.animate([{ opacity: 0, transform: 'scale(0)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 420, delay: 300 + i * 60, easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'forwards' }));
  } else if (animateIn) {
    svg.querySelector('mask path').setAttribute('stroke-dashoffset', '0');
    $$('circle', svg).forEach(c => { c.style.opacity = '1'; });
  }
}
let trailFrame;
let trailDrawn = false;
const redrawTrail = () => { cancelAnimationFrame(trailFrame); trailFrame = requestAnimationFrame(() => drawTrail(trailDrawn ? { instant: true } : { hidden: true })); };
// Redesenha quando o tamanho do mural ou de qualquer card muda (fontes, zoom, janela, conteúdo).
const trailObserver = new ResizeObserver(() => { if (state.page === 'pendentes') redrawTrail(); });
function observeCards() {
  trailObserver.disconnect();
  trailObserver.observe($('#learning-canvas'));
  $$('#activities .activity-card').forEach(c => trailObserver.observe(c));
}
document.fonts?.ready.then(() => redrawTrail());

/* ------------------------------------------------------------------ */
/* Diálogos e ações dos cards                                          */
/* ------------------------------------------------------------------ */
const dialog = $('#dialog');
function openDialog(content) { if (dialog.open) dialog.close(); $('#dialog-content').innerHTML = content; dialog.showModal(); animate(dialog, { opacity: [0, 1], y: [18, 0], scale: [0.97, 1] }, spring.soft); }
$('#close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close(); } });

function markActivityDone(id) {
  const a = getActivity(id);
  if (!a) return;
  if (!activities.some(item => item.id === id)) activities.push(a);
  a.done = true; touch(a);
  persist();
  render();
}
const itemByKey = key => studyItems().find(it => it.key === key);
let cardMenu = null;
function closeCardMenu() {
  if (!cardMenu) return;
  document.querySelector(`[data-action="menu"][aria-expanded="true"]`)?.setAttribute('aria-expanded', 'false');
  const m = cardMenu; cardMenu = null;
  animate(m, { opacity: [1, 0], y: [0, -4], scale: [1, 0.98] }, { duration: duration.micro, ease: ease.in }).then(() => m.remove());
}
document.addEventListener('mousedown', event => { if (cardMenu && !cardMenu.contains(event.target) && !event.target.closest('[data-action="menu"]')) closeCardMenu(); }, true);
addEventListener('resize', closeCardMenu);
addEventListener('scroll', closeCardMenu, { passive: true });
function openCardMenu(key, anchor) {
  const reopen = cardMenu?.dataset.key !== key;
  closeCardMenu();
  if (!reopen) return;
  const it = itemByKey(key);
  if (!it) return;
  const isActivity = it.source === 'activity';
  const a = isActivity ? getActivity(it.id) : null;
  const info = a?.sessionId ? learning.sessionInfo(a.sessionId) : null;
  const items = [
    { act: 'open', icon: it.done ? 'check' : 'arrow', label: it.done ? 'Praticar novamente' : it.inProgress || !isActivity ? 'Continuar de onde parou' : it.kind === 'simulado' ? 'Começar simulado' : 'Começar prática' },
    isActivity && info?.status === 'in_progress' && info.answered > 0 ? { act: 'restart', icon: 'history', label: 'Recomeçar do zero' } : null,
    { act: 'notes', icon: 'pin', label: notes.hasRef(JSON.parse(refOf(it))) ? 'Já está em Minhas notas' : 'Salvar em Minhas notas' },
    isActivity ? { act: 'done', icon: 'check', label: it.done ? 'Marcar como pendente' : 'Marcar como concluída' } : null,
    isActivity ? { act: 'save', icon: 'bookmark', label: it.saved ? 'Remover dos salvos' : 'Salvar' } : { act: 'history', icon: 'history', label: 'Ver no Histórico' },
    isActivity ? { act: 'delete', icon: 'trash', label: 'Excluir atividade', danger: true } : null,
  ].filter(Boolean);
  const menu = document.createElement('div');
  menu.className = 'card-menu';
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-label', `Opções: ${it.title}`);
  menu.dataset.key = key;
  menu.innerHTML = items.map(x => `<button type="button" role="menuitem" class="${x.danger ? 'is-danger' : ''}" data-menu="${x.act}">${icon(x.icon)}<span>${x.label}</span></button>`).join('');
  document.body.append(menu);
  cardMenu = menu;
  const r = anchor.getBoundingClientRect();
  const left = Math.min(innerWidth - menu.offsetWidth - 8, Math.max(8, r.right - menu.offsetWidth));
  let top = r.bottom + 8;
  if (top + menu.offsetHeight > innerHeight - 8) top = r.top - menu.offsetHeight - 8;
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
  menu.style.transformOrigin = 'top right';
  animate(menu, { opacity: [0, 1], y: [-6, 0], scale: [0.97, 1] }, { duration: duration.fast, ease: ease.out });
  anchor.setAttribute('aria-expanded', 'true');
  const buttons = [...menu.querySelectorAll('button')];
  menu.addEventListener('click', event => { const b = event.target.closest('[data-menu]'); if (!b) return; closeCardMenu(); anchor.focus({ preventScroll: true }); cardAction(key, b.dataset.menu, anchor); });
  menu.addEventListener('keydown', event => {
    const i = buttons.indexOf(document.activeElement);
    if (event.key === 'ArrowDown') { event.preventDefault(); buttons[(i + 1) % buttons.length].focus(); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); buttons[(i - 1 + buttons.length) % buttons.length].focus(); }
    else if (event.key === 'Escape' || event.key === 'Tab') { event.preventDefault(); closeCardMenu(); anchor.focus({ preventScroll: true }); }
  });
  buttons[0]?.focus({ preventScroll: true });
}
function cardAction(key, act, anchor) {
  const it = itemByKey(key);
  if (!it) return;
  const a = it.source === 'activity' ? getActivity(it.id) : null;
  if (act === 'open') startItem(it);
  else if (act === 'notes') saveToNotes(JSON.parse(refOf(it)), anchor);
  else if (act === 'history') navigate('historico');
  else if (!a) return;
  else if (act === 'restart') { a.sessionId = null; touch(a); persist(); startQuestion(a.id); }
  else if (act === 'done') { if (!activities.some(item => item.id === a.id)) activities.push(a); a.done = !a.done; touch(a); persist(); render(); toast(a.done ? 'Mais um passo concluído. Boa!' : 'Atividade marcada como pendente.'); }
  else if (act === 'save') { a.saved = !a.saved; persist(); render(); toast(a.saved ? 'Atividade guardada nos seus salvos.' : 'Atividade removida dos salvos.'); }
  else if (act === 'delete') confirmDeleteActivity(a.id);
}
function confirmDeleteActivity(id) {
  const a = getActivity(id);
  if (!a) return;
  openDialog(`<span class="dialog-label">EXCLUIR ATIVIDADE</span><h2 id="dialog-title" class="dialog-title">Excluir “${escape(a.title)}”?</h2><p class="dialog-description">Ela sai do seu plano. As questões que você já respondeu continuam no Histórico e no Progresso. Atalhos dessa atividade em Minhas notas passam a aparecer como indisponíveis.</p><div class="dialog-actions"><button class="primary-button danger-button" id="confirm-delete">${icon('trash')}Excluir</button><button class="small-button" id="cancel-delete">Cancelar</button></div>`);
  $('#cancel-delete').onclick = () => dialog.close();
  $('#confirm-delete').onclick = () => {
    dialog.close();
    const card = $(`.activity-card[data-key="activity:${CSS.escape(id)}"]`);
    const go = () => { activities = activities.filter(item => item.id !== id); persist(); render(); toast('Atividade excluída do seu plano.'); };
    if (card && !reduced()) card.animate([{ opacity: 1, scale: '1' }, { opacity: 0, scale: '.96' }], { duration: 200, easing: cssEase.in, fill: 'forwards' }).finished.then(go); else go();
  };
}
/** Abre o item conforme seu estado: continuar, começar ou praticar de novo. */
function startItem(it) {
  if (it.source === 'activity') startQuestion(it.id);
  else learning.openById(it.source, it.id);
}
function startQuestion(id) {
  const a = getActivity(id);
  if (!a) return;
  if (dialog.open) dialog.close();
  if (a.kind === 'simulado') {
    // Atividade do tipo simulado abre uma prova de verdade (sem correção imediata).
    const sim = a.simId ? learning.account().simulations.find(s => s.id === a.simId) : null;
    if (sim && sim.status === 'in_progress') { learning.openExam(sim); return; }
    const { areaId, count } = listFor(a);
    const E = window.__gabaritei.E;
    const pool = E.questionRepository.query({ areaIds: [areaId] });
    const ids = E.pickQuestions(pool, count, learning.records(), E.createRng(Date.now())).map(q => q.id);
    const created = learning.startSimulation({ title: a.title, questionIds: ids, durationMs: ids.length * 180000 });
    if (created) { if (!activities.some(item => item.id === id)) activities.push(a); a.simId = created.id; a.done = false; touch(a); persist(); }
    return;
  }
  if (a.sessionId && learning.sessionInfo(a.sessionId)?.status === 'in_progress') { touch(a); persist(); learning.resumeById(a.sessionId); return; }
  const created = learning.startTopics({ title: a.title, ...listFor(a), onComplete: () => markActivityDone(id) });
  if (created) { if (!activities.some(item => item.id === id)) activities.push(a); a.sessionId = created.id; touch(a); persist(); }
}
$('#activities').addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const card = button.closest('.activity-card');
  const it = itemByKey(card?.dataset.key);
  if (!it) return;
  if (button.dataset.action === 'start') startItem(it);
  else if (button.dataset.action === 'menu') openCardMenu(it.key, button);
  else {
    const a = getActivity(it.id);
    if (!a) return;
    if (button.dataset.action === 'save') { a.saved = !a.saved; persist(); render(); toast(a.saved ? 'Atividade guardada nos seus salvos.' : 'Atividade removida dos salvos.'); }
    else {
      a.done = !a.done; touch(a); persist();
      // A atividade concluída sai das pendências com uma saída suave.
      if (a.done && !state.showDone && !reduced()) card.animate([{ opacity: 1, scale: '1' }, { opacity: 0, scale: '.96' }], { duration: 220, easing: cssEase.in, fill: 'forwards' }).finished.then(() => render());
      else render();
      toast(a.done ? 'Mais um passo concluído. Boa!' : 'Atividade marcada como pendente.');
    }
  }
});
$('#search').addEventListener('input', () => render());
function clearFilters() { $('#search').value = ''; state.showDone = false; state.saved = false; render({ enter: true }); }
$('#clear-search').onclick = clearFilters;
/** Indicador da visualização escolhida (Grade | Lista), que desliza entre os botões. */
function paintViewSwitch() {
  const sw = $('.view-switch');
  if (!sw) return;
  const btn = sw.querySelector(`button[data-view="${state.view}"]`);
  let ind = sw.querySelector('.view-ind');
  if (!ind) { ind = document.createElement('span'); ind.className = 'view-ind'; ind.setAttribute('aria-hidden', 'true'); sw.prepend(ind); }
  if (!btn) return;
  const from = ind.dataset.pos ? ind.dataset.pos.split(',').map(Number) : null;
  const top = btn.offsetTop, left = btn.offsetLeft;
  if (!btn.offsetWidth) return; // página oculta: posiciona na próxima pintura
  ind.style.top = `${top}px`;
  ind.style.left = `${left}px`;
  ind.style.width = `${btn.offsetWidth}px`;
  ind.style.height = `${btn.offsetHeight}px`;
  ind.dataset.pos = `${left},${top}`;
  if (from && (from[0] !== left || from[1] !== top) && !reduced()) animate(ind, { x: [from[0] - left, 0], y: [from[1] - top, 0] }, spring.layout);
}
// Mudança de layout (janela, celular): reposiciona o indicador sem animar.
addEventListener('resize', () => { const ind = $('.view-ind'); if (ind) delete ind.dataset.pos; paintViewSwitch(); });
$$('button[data-view]').forEach(button => button.onclick = () => {
  if (state.view === button.dataset.view) return;
  state.view = button.dataset.view;
  try { localStorage.setItem(PEND_VIEW_KEY, state.view); } catch { /* sem armazenamento */ }
  // As mesmas atividades mudam de arranjo: os cards deslizam da posição antiga (FLIP).
  const before = snapshot($('#activities'), '.activity-card', 'data-key');
  render();
  if (reduced()) return;
  flipList($('#activities'), before);
  $$('.activity-card', $('#activities')).forEach((c, i) => { if (!before.has(c.dataset.key)) c.animate([{ opacity: 0, translate: '0 12px' }, { opacity: 1, translate: '0 0' }], { duration: 380, delay: i * 30, easing: cssEase.out, fill: 'backwards' }); });
  if (state.view === 'map') { trailDrawn = false; setTimeout(() => { trailDrawn = true; drawTrail({ animateIn: true }); }, 420); }
});
// O zoom anima por CSS (transform .35s); os tracejados acompanham até o fim.
$('#activities').addEventListener('transitionend', e => { if (e.target.id === 'activities') redrawTrail(); });
$('#activities').addEventListener('transitionrun', e => { if (e.target.id !== 'activities') return; const svg = $('#learning-canvas .connections'); if (svg) svg.style.opacity = '0'; setTimeout(() => { redrawTrail(); requestAnimationFrame(() => svg?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, fill: 'forwards' }).finished.then(() => { svg.style.opacity = ''; })); }, 360); });
$('#profile-button').onclick = () => { const menu = $('#profile-menu'); menu.hidden = !menu.hidden; $('#profile-button').setAttribute('aria-expanded', !menu.hidden); if (!menu.hidden) animate(menu, { opacity: [0, 1], y: [-6, 0], scale: [0.97, 1] }, { duration: duration.fast, ease: ease.out }); };
document.addEventListener('click', event => { if (!event.target.closest('.profile-wrapper')) { $('#profile-menu').hidden = true; $('#profile-button').setAttribute('aria-expanded', false); } });
$('#reset-demo').onclick = () => { activities = initial(); persist(); notes.reset(); clearFilters(); navigate('plano'); $('#profile-menu').hidden = true; $('#profile-button').setAttribute('aria-expanded', false); toast('Demonstração restaurada. Tudo pronto para recomeçar.'); };
// Botão "Criar": recurso futuro, sem ação. Só mostra o aviso.
$('#create-soon').addEventListener('click', e => { e.preventDefault(); const b = e.currentTarget; if (!reduced()) animate(b, { x: [0, -4, 4, -2, 0] }, { duration: 0.36, ease: ease.out }); toast('Em breve: criar listas, simulados e objetivos. Ainda indisponível neste protótipo.'); });
$('#add-button').onclick = () => { openDialog(`<span class="dialog-label">SEU PLANO, DO SEU JEITO</span><h2 id="dialog-title" class="dialog-title">O que vamos estudar?</h2><p class="dialog-description">Adicione um assunto ao seu mural. Você pode reorganizar a visualização pela barra lateral.</p><form id="activity-form"><label class="dialog-field">Assunto<input name="title" placeholder="Ex.: Equações do segundo grau" maxlength="70" required></label><label class="dialog-field">Área<select name="area">${studyAreas.map(area => `<option value="${area.area}">${area.fullName}</option>`).join('')}</select></label><label class="dialog-field">Tipo<select name="kind"><option value="lista">Lista de questões (5 questões do assunto)</option><option value="simulado">Simulado (10 questões da área, correção ao finalizar)</option></select></label><label class="dialog-field">Sua intenção para esse estudo<textarea name="description" placeholder="O que você quer entender melhor?" maxlength="160" required></textarea></label><button class="primary-button" type="submit">Adicionar ao meu plano ${icon('plus')}</button></form>`); $('#activity-form').onsubmit = event => { event.preventDefault(); const data = new FormData(event.target); const title = data.get('title').trim(), description = data.get('description').trim(); if (!title || !description) return; const now = new Date().toISOString(); activities.push({ id: crypto.randomUUID(), title, description, area: data.get('area') || 'Estudo livre', kind: data.get('kind') === 'simulado' ? 'simulado' : 'lista', icon: 'book', done: false, saved: false, createdAt: now, updatedAt: now }); persist(); navigate('pendentes'); clearFilters(); dialog.close(); toast('Novo assunto adicionado. Seu plano ganhou mais um caminho.'); }; };
let timerRemaining = 25 * 60;
let timerEnd = null;
let timerInterval = null;
const timerText = () => `${String(Math.floor(timerRemaining / 60)).padStart(2, '0')}:${String(timerRemaining % 60).padStart(2, '0')}`;
function updateTimer() { if (timerEnd) timerRemaining = Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000)); if ($('#timer-value')) $('#timer-value').textContent = timerText(); if (timerEnd && timerRemaining === 0) { clearInterval(timerInterval); timerInterval = null; timerEnd = null; if ($('#timer-start')) $('#timer-start').textContent = 'Foco concluído'; toast('Seu tempo de foco terminou. Hora de respirar um pouco.'); } }

/* ------------------------------------------------------------------ */
/* Simulados: áreas → configuração (ano, tamanho, tempo) → prova         */
/* ------------------------------------------------------------------ */
const simChoices = {}; // contexto preservado por área ao voltar
function areaCards() {
  return `<div class="area-grid">${studyAreas.map((area, index) => `<button class="area-card area-${area.key}" data-sim-area="${area.key}" data-note-ref='${escape(JSON.stringify({ kind: 'sim-area', id: area.key }))}' aria-label="Configurar simulado: ${area.fullName}">
    <span class="area-number">${String(index + 1).padStart(2, '0')}</span>
    <span class="area-kicker">${area.subjects}</span>
    <span class="area-copy"><h2><span class="area-title">${area.title}</span> <span class="area-suffix">e suas Tecnologias</span></h2><span class="area-description">${area.text}</span><span class="area-meta">Dia ${E().AREA_BY_ID[area.key].day} do ENEM <span>·</span> 45 ou 90 questões</span><span class="area-cta">Configurar simulado ${icon('arrow')}</span></span>
    <img class="area-art" src="assets/area-${area.art}.svg" alt="" width="180" height="190" draggable="false">
  </button>`).join('')}</div><p class="area-demo-note">${icon('spark')} Escolha a área para definir a edição e se a prova terá 45 questões (só a área) ou 90 (o dia completo). Arraste um card para Minhas notas para guardar um atalho.</p>`;
}
const E = () => window.__gabaritei.E;
const simAvailable = (areaKey, year = null) => E().questionRepository.query({ areaIds: [areaKey], ...(year ? { years: [year] } : {}) }).length;
function renderSimulados({ direction = 0 } = {}) {
  const page = $('#secondary-page');
  delete page.dataset.learning;
  page.classList.remove('learning-page', 'legacy-ui');
  page.dataset.sim = state.simView;
  if (state.simView === 'areas') {
    page.innerHTML = `<div class="sim-head"><div><div class="eyebrow">SE PREPARAR TAMBÉM É EXPERIMENTAR</div><h1>Um treino no seu ritmo.</h1><p class="secondary-description">Escolha uma das quatro áreas para fazer a prova no formato do ENEM, ou monte um simulado do seu jeito.</p></div></div>
      ${customSimCardHTML()}${areaCards()}`;
    bindCustomSimCard();
    $$('[data-sim-area]', page).forEach(b => b.onclick = () => openAreaConfig(b.dataset.simArea, b));
    if (direction) slideIn(page, direction);
    else {
      $$('.area-card', page).forEach((c, i) => c.animate([{ opacity: 0, translate: '0 14px' }, { opacity: 1, translate: '0 0' }], { duration: 480, delay: 160 + i * 60, easing: cssEase.out, fill: 'backwards' }));
    }
    return;
  }
  const area = studyAreas.find(a => a.key === state.simArea);
  const info = E().AREA_BY_ID[area.key];
  const day = info.day;
  const c = simChoices[area.key] ??= { year: null, size: 45, foreign: 'ingles', timerVisible: true };
  if (![45, 90].includes(c.size)) c.size = 45;
  const full = c.size === 90;
  const partner = dayAreas(day).find(a => a.key !== area.key);
  const included = full ? dayAreas(day) : [area];
  const years = E().REFERENCE_YEARS.map(y => ({ y, n: simAvailable(area.key, y) })).filter(x => x.n > 0);
  const msOf = size => E().simulationDuration({ mode: 'official', day, size });
  const ms = msOf(c.size);
  const numbering = full ? (day === 1 ? '1 a 90' : '91 a 180') : info.officialRange.join(' a ');
  const fromEdition = c.year ? included.reduce((n, a) => n + simAvailable(a.key, c.year), 0) : null;
  const showForeign = included.some(a => a.key === 'linguagens');
  const subjects = included.flatMap(a => E().subjectsOfArea(a.key)).map(sb => ({ name: sb.name, n: E().questionRepository.query({ subjectId: sb.id, ...(c.year ? { years: [c.year] } : {}) }).length })).filter(sb => sb.n);
  const maxN = Math.max(1, ...subjects.map(sb => sb.n));
  const shortName = a => a.title.replace(', Códigos', '');
  const before = page.dataset.sim === 'config' && page.querySelector('.sim-config')?.dataset.area === area.key
    ? { ring: $('.off-opt-ring')?.getBoundingClientRect(), q: $('#sim-count')?.textContent, t: $('#sim-time')?.textContent, scroll: page.scrollTop } : null;
  page.innerHTML = `<div class="sim-config area-${area.key}" data-area="${area.key}">
    <button type="button" class="sim-back" id="sim-back" data-press="0.96">${icon('arrow-left')}Voltar às quatro áreas</button>
    <section class="sim-hero"><div class="sim-hero-copy"><span class="area-kicker">${area.subjects} · DIA ${day} DO ENEM</span><h1>Simulado de ${area.title}<span> e suas Tecnologias</span></h1><p>Prova no formato do ENEM, com numeração oficial, cronômetro regressivo e correção só ao finalizar.</p></div><img class="sim-hero-art" src="assets/area-${area.art}.svg" alt="" width="180" height="190" draggable="false"></section>
    <div class="sim-layout"><div class="sim-steps">
      <section class="sim-step" data-step><header><span class="sim-step-n">1</span><div><h2>Edição do ENEM</h2><p>Todas as edições que existem no acervo desta área.</p></div></header>
        <div class="sim-years" role="radiogroup" aria-label="Edição do ENEM"><button type="button" role="radio" aria-checked="${c.year === null}" data-year="" class="${c.year === null ? 'is-on' : ''}"><strong>Todas</strong><small>${simAvailable(area.key)} questões</small></button>${years.map(({ y, n }) => `<button type="button" role="radio" aria-checked="${c.year === y}" data-year="${y}" class="${c.year === y ? 'is-on' : ''}"><strong>${y}</strong><small>${n} ${n === 1 ? 'questão' : 'questões'}</small></button>`).join('')}</div>
        <p class="sim-note">${icon('spark')} Acervo demonstrativo: o ano é uma etiqueta de referência das questões autorais${c.year ? `. Há ${fromEdition} questões de ${c.year} para esta prova; elas entram primeiro e o restante vem de outras edições` : ''}.</p></section>
      <section class="sim-step" data-step><header><span class="sim-step-n">2</span><div><h2>Quantidade de questões</h2><p>Como no ENEM: só a área ou o dia completo.</p></div></header>
        <div class="off-options" role="radiogroup" aria-label="Quantidade de questões">
          <button type="button" role="radio" class="off-opt ${full ? '' : 'is-on'}" aria-checked="${!full}" data-size="45" data-press="0.98">${full ? '' : '<span class="off-opt-ring"></span>'}<strong>45 questões</strong><span>Apenas ${shortName(area)}</span><small>Questões ${info.officialRange.join(' a ')} · ${hoursText(msOf(45))}</small></button>
          <button type="button" role="radio" class="off-opt ${full ? 'is-on' : ''}" aria-checked="${full}" data-size="90" data-press="0.98">${full ? '<span class="off-opt-ring"></span>' : ''}<strong>90 questões</strong><span>Prova completa do Dia ${day}: ${shortName(dayAreas(day)[0])} e ${shortName(dayAreas(day)[1])}</span><small>Questões ${day === 1 ? '1 a 90' : '91 a 180'} · ${hoursText(msOf(90))}</small></button>
        </div>
        ${showForeign ? `<div class="sim-foreign"><span>Língua estrangeira</span><div class="off-seg" role="radiogroup" aria-label="Língua estrangeira">${[['ingles', 'Inglês'], ['espanhol', 'Espanhol']].map(([v, l]) => `<button type="button" role="radio" class="${c.foreign === v ? 'is-on' : ''}" aria-checked="${c.foreign === v}" data-foreign="${v}">${l}</button>`).join('')}</div><small>Questões 1 a 5 de Linguagens.</small></div>` : ''}</section>
      <section class="sim-step" data-step><header><span class="sim-step-n">3</span><div><h2>Tempo de prova</h2><p>Ajustado automaticamente: ${full ? 'tempo oficial do Dia ' + day : 'metade do tempo da prova completa do Dia ' + day}. Aviso quando faltarem 15 minutos.</p></div></header>
        <div class="sim-time" aria-live="polite"><span class="sim-time-icon">${icon('clock')}</span><div><strong id="sim-time-big">${hoursText(ms)}</strong><small>${full ? `90 questões · Dia ${day} completo` : `45 questões · metade de ${hoursText(msOf(90))}`}</small></div><div class="sim-time-bar" aria-hidden="true"><i style="--w:${c.size / 90}"></i></div></div>
        <label class="sim-toggle"><input type="checkbox" id="sim-timer-visible" ${c.timerVisible ? 'checked' : ''}><span><strong>Cronômetro visível</strong><small>O tempo continua contando mesmo oculto.</small></span></label></section>
    </div>
    <aside class="sim-summary" id="sim-summary"><span class="sim-summary-label">SEU SIMULADO</span><div class="sim-summary-count"><strong id="sim-count">${c.size}</strong><span>questões</span></div>
      <dl><div><dt>${included.length > 1 ? 'Áreas' : 'Área'}</dt><dd>${included.map(a => a.fullName).join(' + ')}</dd></div><div><dt>Dia</dt><dd>Dia ${day}</dd></div><div><dt>Numeração</dt><dd>Questões ${numbering}</dd></div><div><dt>Edição</dt><dd>${c.year ?? 'Todas as edições'}</dd></div><div><dt>Duração</dt><dd id="sim-time">${hoursText(ms)}</dd></div><div><dt>Correção</dt><dd>Ao finalizar a prova</dd></div>${day === 1 && full ? '<div><dt>Redação</dt><dd>Prova à parte, não incluída aqui</dd></div>' : ''}</dl>
      <div class="sim-mix"><span>Matérias no acervo${c.year ? ` de ${c.year}` : ''}</span>${subjects.map(sb => `<div><span>${escape(sb.name)}</span><i><i style="--w:${sb.n / maxN}"></i></i><b>${sb.n}</b></div>`).join('')}</div>
      <button type="button" class="sim-start" id="sim-start" data-press="0.97">Iniciar simulado ${icon('arrow')}</button>
      <p class="sim-fine">Nada começa antes de você confirmar. Você pode pausar e continuar depois.</p></aside></div>
  </div>`;
  const rerender = () => { const sc = page.scrollTop; renderSimulados(); page.scrollTop = sc; };
  $('#sim-back').onclick = () => { history.replaceState(null, '', '#simulados'); state.simView = 'areas'; renderSimulados({ direction: -1 }); };
  $$('[data-year]', page).forEach(b => b.onclick = () => { c.year = b.dataset.year ? Number(b.dataset.year) : null; rerender(); });
  $$('[data-size]', page).forEach(b => b.onclick = () => { const n = Number(b.dataset.size); if (n === c.size) return; c.size = n; rerender(); });
  $$('[data-foreign]', page).forEach(b => b.onclick = () => { c.foreign = b.dataset.foreign; rerender(); });
  $('#sim-timer-visible').onchange = e => { c.timerVisible = e.target.checked; };
  $('#sim-start').onclick = () => learning.startOfficial({ day, areaId: full ? null : area.key, foreignLanguage: c.foreign, timerHidden: !c.timerVisible, edition: c.year });
  if (direction) slideIn(page, direction);
  if (before) {
    page.scrollTop = before.scroll;
    // Motion: o anel da opção desliza entre 45 e 90 e os números do tempo/quantidade trocam suavemente.
    const ring = $('.off-opt-ring');
    if (ring && before.ring) { const now = ring.getBoundingClientRect(); if (Math.abs(before.ring.left - now.left) + Math.abs(before.ring.top - now.top) > 1) animate(ring, { x: [before.ring.left - now.left, 0], y: [before.ring.top - now.top, 0] }, spring.layout); }
    if (before.q !== $('#sim-count').textContent) animate($('#sim-count'), { opacity: [0, 1], y: [10, 0] }, spring.snappy);
    if (before.t !== $('#sim-time').textContent) {
      animate($('#sim-time'), { opacity: [0, 1], y: [8, 0] }, spring.snappy);
      animate($('#sim-time-big'), { opacity: [0, 1], y: [12, 0], scale: [0.96, 1] }, spring.soft);
      const bar = $('.sim-time-bar i'); const w = Number(bar.style.getPropertyValue('--w'));
      bar.animate([{ transform: `scaleX(${w === 1 ? 0.5 : 1})` }, { transform: `scaleX(${w})` }], { duration: 520, easing: cssEase.emphasized, fill: 'both' });
    }
  } else {
    page.querySelectorAll('.sim-mix i > i').forEach((bar, i) => bar.animate([{ transform: 'scaleX(0)' }, { transform: `scaleX(${bar.style.getPropertyValue('--w')})` }], { duration: 750, delay: i * 50, easing: cssEase.emphasized, fill: 'both' }));
  }
}
/** 5h30, 2h45, 5h… (formato curto usado no ENEM). */
const hoursText = ms => { const m = Math.round(ms / 60000); const h = Math.floor(m / 60), r = m % 60; return h ? `${h}h${r ? String(r).padStart(2, '0') : ''}` : `${r} min`; };
const dayAreas = day => studyAreas.filter(a => E().AREA_BY_ID[a.key].day === day);

/* ------------------------------------------------------------------ */
/* Card de destaque: Simulado personalizado                           */
/* ------------------------------------------------------------------ */
function customSimCardHTML() {
  return `<button type="button" class="custom-sim-card" id="custom-sim" data-note-ref='${escape(JSON.stringify({ kind: 'custom-sim' }))}' aria-label="Montar um simulado personalizado">
    <span class="area-number csc-number" aria-hidden="true">${hi('SlidersHorizontal')}</span>
    <span class="csc-copy">
      <span class="area-kicker">MATÉRIAS · ASSUNTOS · ANOS · TEMPO</span>
      <h2>Simulado personalizado</h2>
      <span class="csc-text">Escolha matérias e assuntos, o tamanho da prova, o critério de seleção das questões e o ritmo do cronômetro. Como no ENEM, a correção aparece só ao finalizar.</span>
      <span class="csc-steps" aria-hidden="true"><span><b>1</b>Conteúdo</span><span><b>2</b>Formato</span><span><b>3</b>Começar</span></span>
      <span class="area-cta csc-cta">Personalizar simulado ${icon('arrow')}</span>
    </span>
    <img class="csc-art" src="assets/sim-personalizado.svg" alt="" width="220" height="190" draggable="false">
  </button>`;
}
function bindCustomSimCard() {
  const cardEl = $('#custom-sim');
  if (!cardEl) return;
  const art = cardEl.querySelector('.csc-art');
  animate(cardEl, { opacity: [0, 1], y: [16, 0], scale: [0.985, 1] }, { ...spring.soft, delay: 0.1 });
  if (art && !reduced()) {
    animate(art, { opacity: [0, 1], y: [10, 0], rotate: [-4, 0] }, { ...spring.bouncy, delay: 0.25 });
    // Movimento leve e contínuo da ilustração (para quando o usuário prefere menos movimento).
    art.animate([{ translate: '0 0', rotate: '0deg' }, { translate: '0 -5px', rotate: '-1.5deg' }, { translate: '0 0', rotate: '0deg' }], { duration: 5200, iterations: Infinity, easing: cssEase.inOut, delay: 900 });
  }
  cardEl.addEventListener('pointerenter', () => animate(art, { scale: [1, 1.05] }, spring.soft));
  cardEl.addEventListener('pointerleave', () => animate(art, { scale: [1.05, 1] }, spring.soft));
  cardEl.onclick = () => {
    if (reduced()) { navigate('simulado-personalizado'); return; }
    // Transição: os outros blocos somem e o card cresce de leve antes de abrir a configuração.
    $$('.area-card, .sim-head, .area-demo-note', $('#secondary-page')).forEach(el => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards', easing: cssEase.in }));
    cardEl.animate([{ opacity: 1, scale: '1' }, { opacity: 0, scale: '1.025' }], { duration: 220, fill: 'forwards', easing: cssEase.in }).finished.then(() => navigate('simulado-personalizado'));
  };
}

function slideIn(page, direction) {
  const kids = [...page.firstElementChild.children];
  kids.forEach((el, i) => el.animate([{ opacity: 0, translate: `${direction * 36}px 0` }, { opacity: 1, translate: '0 0' }], { duration: 360, delay: i * 50, easing: cssEase.emphasized, fill: 'backwards' }));
}
function openAreaConfig(key, fromCard) {
  state.simArea = key;
  state.simView = 'config';
  history.replaceState(null, '', `#simulados/${key}`);
  const go = () => renderSimulados({ direction: 1 });
  if (fromCard && !reduced()) {
    const others = $$('.area-card, .sim-head, .area-demo-note', $('#secondary-page')).filter(el => el !== fromCard);
    others.forEach(el => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards', easing: cssEase.in }));
    fromCard.animate([{ opacity: 1, scale: '1' }, { opacity: 0, scale: '1.03' }], { duration: 200, fill: 'forwards', easing: cssEase.in }).finished.then(go);
  } else go();
}

/* ------------------------------------------------------------------ */
/* Navegação                                                           */
/* ------------------------------------------------------------------ */
const PAGE_NAMES = { perfil: 'Perfil', plano: 'Meus estudos', pendentes: 'Pendentes', questoes: 'Questões', simulados: 'Simulados', 'simulado-personalizado': 'Simulado personalizado', historico: 'Histórico', progresso: 'Progresso' };
function navigate(page, { sub = null } = {}) {
  const changed = page !== state.page || sub;
  state.page = page;
  if (page === 'simulados') { state.simView = sub ? 'config' : 'areas'; if (sub) state.simArea = sub; }
  history.replaceState(null, '', `#${page}${page === 'simulados' && sub ? `/${sub}` : ''}`);
  const board = page === 'plano' || page === 'pendentes';
  $('#plan-page').hidden = !board;
  $('#secondary-page').hidden = board;
  if (board) paintBoardHeading(page);
  sidebar.setActive(page === 'simulado-personalizado' ? 'simulados' : page);
  $('.side-bottom .profile-wrapper')?.classList.toggle('is-current', page === 'perfil');
  document.title = `${PAGE_NAMES[page]} · Gabaritei`;
  if ($('#topbar-title')) $('#topbar-title').innerHTML = `Gabaritei <span aria-hidden="true">/</span> <strong>${PAGE_NAMES[page]}</strong>`;
  closeCardMenu();
  if (board) { if (changed) { scrollTo({ top: 0 }); render({ enter: true }); if (!reduced()) pageEnter($('#plan-page .page-heading')); } return; }
  scrollTo({ top: 0 });
  const secondary = $('#secondary-page');
  if (page === 'simulados') renderSimulados();
  else learning.mount(page);
  if (changed && !reduced() && page !== 'simulados') pageEnter(secondary.firstElementChild);
}
/** Cabeçalho da área compartilhada: Início (prática) ou Pendentes (Grade | Lista). */
function paintBoardHeading(page) {
  const pend = page === 'pendentes';
  $('#plan-page').dataset.board = pend ? 'pendentes' : 'inicio';
  $('#plan-page .eyebrow').textContent = pend ? 'CONTINUE DE ONDE PAROU' : 'UM POUCO MELHOR, TODOS OS DIAS';
  $('#page-title').textContent = pend ? 'Pendentes' : 'Meus estudos';
}
const sidebar = createSidebar({
  onNavigate: page => navigate(page),
  getResume: () => learning.resumeTarget(),
  icons: hi,
});
document.addEventListener('keydown', event => { const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable; if (event.key === '/' && !typing && !dialog.open) { event.preventDefault(); navigate('pendentes'); $('#search').focus(); } if (event.key === 'Escape') { $('#profile-menu').hidden = true; $('#profile-button').setAttribute('aria-expanded', false); } });

/* ------------------------------------------------------------------ */
/* Minhas notas: resolver e abrir atalhos                              */
/* ------------------------------------------------------------------ */
function resolveRef(ref) {
  if (ref.kind === 'activity') {
    const a = activities.find(x => x.id === ref.id);
    if (!a) return null;
    const it = studyItems().find(x => x.key === `activity:${a.id}`);
    return { title: a.title, kindLabel: a.kind === 'simulado' ? 'Simulado' : 'Lista de questões', status: a.done ? 'Concluída' : it?.inProgress ? 'Em andamento' : 'Pendente', icon: a.kind === 'simulado' ? 'Timer' : 'BookOpenCheck', area: areaKey(a.area), meta: `${it?.answered ?? 0} de ${it?.total ?? listFor(a).count} respondidas`, progress: it && it.total ? it.answered / it.total : 0 };
  }
  if (ref.kind === 'practice') {
    const s = learning.sessionInfo(ref.id);
    if (!s) return null;
    const areas = [...new Set(E().questionRepository.getMany(learning.account().practiceSessions.find(x => x.id === ref.id).questionIds).map(q => q.areaId))];
    return { title: s.title, kindLabel: 'Lista de questões', status: s.status === 'completed' ? 'Concluída' : 'Em andamento', icon: 'BookOpenCheck', area: areas.length === 1 ? areas[0] : 'mista', meta: `${s.answered} de ${s.total} respondidas`, progress: s.total ? s.answered / s.total : 0 };
  }
  if (ref.kind === 'simulation') {
    const s = learning.simulationInfo(ref.id);
    if (!s) return null;
    return { title: s.title, kindLabel: 'Simulado', status: s.status === 'completed' ? 'Finalizado' : 'Interrompido', icon: 'Timer', area: s.areaIds.length === 1 ? s.areaIds[0] : 'mista', meta: s.status === 'completed' ? 'Ver resultado' : `${s.answered} de ${s.total} respondidas`, progress: s.total ? s.answered / s.total : 0 };
  }
  if (ref.kind === 'sim-area') {
    const a = studyAreas.find(x => x.key === ref.id);
    return a ? { title: `Simulado de ${a.title}`, kindLabel: 'Simulado por área', status: '', icon: 'Timer', area: a.key, meta: 'Abrir configuração', progress: null } : null;
  }
  if (ref.kind === 'custom-sim') return { title: 'Simulado personalizado', kindLabel: 'Configuração', status: '', icon: 'SlidersHorizontal', area: 'mista', meta: 'Matérias, assuntos, anos e tempo', progress: null };
  return null;
}
function openRef(ref) {
  if (ref.kind === 'activity') { const it = studyItems().find(x => x.key === `activity:${ref.id}`); if (it) startItem(it); }
  else if (ref.kind === 'practice' || ref.kind === 'simulation') { if (!learning.openById(ref.kind, ref.id)) toast('Esse item não existe mais.'); }
  else if (ref.kind === 'sim-area') navigate('simulados', { sub: ref.id });
  else if (ref.kind === 'custom-sim') navigate('simulado-personalizado');
}
function saveToNotes(ref, el) { notes.addRef(ref, el); }

const learning = createLearningPages({ root: $('#secondary-page'), openDialog, closeDialog: () => dialog.close(), toast, navigate, icons: icon, saveToNotes: (ref, el) => saveToNotes(ref, el), onProfileChange: p => paintProfile(p), onChange: () => { if (onBoard()) render(); sidebar.renderBottom(); notes?.refresh(); } });
/** Nome e iniciais do perfil no rodapé do menu lateral. */
function paintProfile(p) {
  const ini = p.name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  $('#profile-button .avatar').textContent = ini || '?';
  $('#profile-button .profile-text strong').textContent = p.nickname || p.name;
}
paintProfile(learning.account().profile);
$('#open-profile').onclick = () => { $('#profile-menu').hidden = true; $('#profile-button').setAttribute('aria-expanded', false); sidebar.close(); navigate('perfil'); };
const notes = createNotes({ panel: $('#notes-panel'), resolveRef, openRef, toast, hi });
notes.render();
bindPress();

const [hashPage, hashSub] = location.hash.slice(1).split('/');
if (['plano', 'pendentes', 'questoes', 'simulados', 'simulado-personalizado', 'historico', 'progresso', 'perfil'].includes(hashPage) && hashPage !== 'plano') { state.page = ''; navigate(hashPage, { sub: hashPage === 'simulados' ? hashSub || null : null }); render(); }
else { state.page = 'plano'; navigate('plano'); sidebar.setActive('plano'); render({ enter: true }); }
addEventListener('hashchange', () => { const [p, sub] = location.hash.slice(1).split('/'); if (PAGE_NAMES[p] && (p !== state.page || sub)) navigate(p, { sub: p === 'simulados' ? sub || null : null }); });

/* ------------------------------------------------------------------ */
/* Atalho de tema no menu lateral                                      */
/* ------------------------------------------------------------------ */
function paintThemeToggle(theme = currentTheme()) {
  const btn = $('#theme-toggle');
  if (!btn) return;
  const pref = getThemePref();
  const dark = theme === 'dark';
  const name = pref === 'auto' ? `automático (${dark ? 'escuro' : 'claro'})` : dark ? 'escuro' : 'claro';
  btn.querySelector('use').setAttribute('href', dark ? '#i-moon' : '#i-sun');
  btn.querySelector('.theme-toggle-label').textContent = `Tema ${name}`;
  btn.setAttribute('aria-label', `Tema ${name}. Alternar para ${dark ? 'claro' : 'escuro'}`);
  btn.dataset.tooltip = dark ? 'Tema escuro' : 'Tema claro';
}
$('#theme-toggle')?.addEventListener('click', () => {
  setThemePref(currentTheme() === 'dark' ? 'light' : 'dark');
  if (!reduced()) animate($('#theme-toggle .theme-toggle-icon svg'), { rotate: [-90, 0], scale: [0.6, 1] }, spring.bouncy);
});
onThemeChange((pref, theme) => paintThemeToggle(theme));
paintThemeToggle();
