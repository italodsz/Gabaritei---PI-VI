import { createLearningPages } from './learning-pages.js';
import { createSidebar } from './sidebar.js';
import { createNotes } from './notes.js';
import { animate, spring, duration, ease, cssEase, reduced, pageEnter, bindPress } from './motion-kit.js';
import { hi } from './legacy-ui.js';

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
  { id: 'ecology', title: 'Ecologia e ambiente', description: 'Conecte os seres vivos, o ambiente e as suas relações.', area: 'Natureza', icon: 'leaf', done: false, saved: false, createdAt: iso(seedNow - 96 * HOUR), updatedAt: iso(seedNow - 20 * HOUR) },
  { id: 'percentage', title: 'Porcentagem no cotidiano', description: 'Resolva situações com descontos e proporções.', area: 'Matemática', icon: 'calculator', done: false, saved: false, createdAt: iso(seedNow - 72 * HOUR), updatedAt: iso(seedNow - 72 * HOUR) },
  { id: 'humanities-sim', title: 'Simulado de Humanas', description: 'Dez questões de Ciências Humanas, com correção ao finalizar.', area: 'Humanas', kind: 'simulado', icon: 'clock', done: false, saved: true, createdAt: iso(seedNow - 48 * HOUR), updatedAt: iso(seedNow - 48 * HOUR) },
];
const studyAreas = [
  { key: 'linguagens', area: 'Linguagens', title: 'Linguagens, Códigos', fullName: 'Linguagens, Códigos e suas Tecnologias', subjects: 'LEITURA · EXPRESSÃO · CULTURA', text: 'Textos, sentidos e novas formas de ver o mundo.', id: 'reading', art: 'linguagens' },
  { key: 'natureza', area: 'Natureza', title: 'Ciências da Natureza', fullName: 'Ciências da Natureza e suas Tecnologias', subjects: 'BIOLOGIA · FÍSICA · QUÍMICA', text: 'Descubra as conexões entre a vida e a ciência.', id: 'ecology', art: 'natureza' },
  { key: 'humanas', area: 'Humanas', title: 'Ciências Humanas', fullName: 'Ciências Humanas e suas Tecnologias', subjects: 'SOCIEDADE · HISTÓRIA · ESPAÇO', text: 'Entenda as pessoas, os lugares e suas histórias.', id: 'humanities', art: 'humanas' },
  { key: 'matematica', area: 'Matemática', title: 'Matemática', fullName: 'Matemática e suas Tecnologias', subjects: 'LÓGICA · NÚMEROS · GEOMETRIA', text: 'Encontre caminhos entre números e ideias.', id: 'functions', art: 'matematica' },
];
const areaKey = name => studyAreas.find(area => area.area === name)?.key || 'livre';
const AREA_NAME_BY_KEY = Object.fromEntries(studyAreas.map(a => [a.key, a.area]));

let activities = initial();
try {
  const stored = JSON.parse(localStorage.getItem('gabaritei:plano:v1') ?? localStorage.getItem('gabaritei:canvas-prototype:v1'));
  if (stored && Array.isArray(stored.activities) && stored.activities.every(a => typeof a.id === 'string' && typeof a.title === 'string' && typeof a.description === 'string' && typeof a.area === 'string')) {
    // Migração: o card "Continue de onde parou" virou derivado das listas em andamento;
    // atividades antigas ganham datas de criação/atualização.
    activities = stored.activities.filter(a => !a.featured).map((a, i) => ({ ...a, createdAt: a.createdAt ?? iso(seedNow - (200 - i) * HOUR), updatedAt: a.updatedAt ?? a.createdAt ?? iso(seedNow - (200 - i) * HOUR) }));
  }
} catch { /* O protótipo também funciona sem armazenamento. */ }
const state = { page: 'plano', view: 'map', showDone: false, saved: false, zoom: 1, simArea: null, simView: 'areas' };
function persist() { try { localStorage.setItem('gabaritei:plano:v1', JSON.stringify({ activities })); } catch { /* Estado mantido nesta sessão. */ } }
const touch = a => { a.updatedAt = new Date().toISOString(); };
let toastTimeout;
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimeout); toastTimeout = setTimeout(() => $('#toast').classList.remove('visible'), 3200); }

// Detalhes de fundo de cada área (texto decorativo em branco translúcido).
const CARD_DECOR = { matematica: ['√x', 'π'], linguagens: ['Aa', '¶'], natureza: ['H<sub>2</sub>O', 'Δ'], humanas: ['XIX', '§'], livre: ['Aa', '?'] };
const AREA_LABEL = { matematica: 'MATEMÁTICA', linguagens: 'LINGUAGENS', natureza: 'NATUREZA', humanas: 'HUMANAS', livre: 'ESTUDO LIVRE' };
const PLAY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4a1.7 1.7 0 0 1 2.5-1.5l12 7.4a2 2 0 0 1 0 3.2l-12 7.4A1.7 1.7 0 0 1 7 19Z"/></svg>';
const KIND = { lista: { icon: 'list', label: 'Lista de questões' }, simulado: { icon: 'clock', label: 'Simulado' } };
const ACTIVITY_LISTS = {
  functions: { topicIds: ['mat-funcoes'] },
  percentage: { topicIds: ['mat-porcentagem', 'mat-proporcao'] },
  reading: { topicIds: ['por-interpretacao', 'por-generos', 'por-funcoes'] },
  ecology: { topicIds: ['bio-ecologia', 'qui-ambiental', 'geo-ambiental'] },
  humanities: { topicIds: ['geo-natureza', 'geo-cartografia'] },
};
const AREA_IDS = { Linguagens: 'linguagens', Natureza: 'natureza', Humanas: 'humanas', Matemática: 'matematica' };
const listFor = a => (a.kind === 'simulado' ? { areaId: AREA_IDS[a.area] ?? 'matematica', count: 10 } : { count: 5, ...(ACTIVITY_LISTS[a.id] ?? { areaId: AREA_IDS[a.area] ?? 'matematica' }) });
function getActivity(id) { return activities.find(item => item.id === id) || (id === 'humanities' ? { id, title: 'A Terra em movimento', area: 'Humanas', description: 'Explore as relações entre os movimentos da Terra e o nosso cotidiano.', done: false, createdAt: iso(Date.now()), updatedAt: iso(Date.now()) } : null); }

/* ------------------------------------------------------------------ */
/* Pendências: atividades + listas e simulados em andamento            */
/* ------------------------------------------------------------------ */
/** Une atividades do plano e sessões em andamento num único formato de card. */
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
    // Da atividade mais recente para a mais antiga (atualização, com criação como reserva).
    .sort((a, b) => b.date.localeCompare(a.date));
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
  canvas.dataset.view = state.view;
  canvas.style.setProperty('--zoom', state.zoom);
  $('#empty-state').hidden = items.length > 0;
  $('#empty-state h2').textContent = state.showDone ? 'Nada concluído por aqui' : $('#search').value ? 'Nenhum assunto por aqui' : 'Tudo em dia!';
  $('#empty-state p').textContent = state.showDone ? 'Conclua uma lista ou simulado para vê-lo aqui.' : $('#search').value ? 'Experimente outra palavra ou limpe os filtros.' : 'Nenhuma atividade pendente. Que tal montar uma nova lista?';
  const banner = state.showDone ? '<div class="done-banner"><span>Mostrando só as atividades <b>concluídas</b>, separadas das pendências.</span><button type="button" id="back-to-pending">Voltar às pendências</button></div>' : '';
  const featuredFirst = !state.showDone;
  if (state.view === 'map') {
    const left = [], right = [];
    items.forEach((it, i) => (i % 2 === 0 ? left : right).push(cardHTML(it, i, featuredFirst && i === 0)));
    $('#activities').innerHTML = `${banner}<div class="trail-col">${left.join('')}</div><div class="trail-col is-right">${right.join('')}</div>`;
  } else {
    $('#activities').innerHTML = banner + items.map((it, i) => cardHTML(it, i, featuredFirst && i === 0)).join('');
  }
  $('#back-to-pending')?.addEventListener('click', () => { state.showDone = false; render({ enter: true }); });
  $('#filter-button').setAttribute('aria-pressed', state.showDone);
  $('#saved-button').setAttribute('aria-pressed', state.saved);
  $$('[data-view]').filter(el => el.tagName === 'BUTTON').forEach(button => { button.classList.toggle('selected', button.dataset.view === state.view); button.setAttribute('aria-pressed', button.dataset.view === state.view); });
  observeCards();
  if (enter || firstPaint) { firstPaint = false; enterCards(); } else drawTrail({ instant: true });
  notes?.refresh();
  sidebar?.renderBottom();
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
  if (!svg || state.page !== 'plano') return;
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
const trailObserver = new ResizeObserver(() => { if (state.page === 'plano') redrawTrail(); });
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
$$('button[data-view]').forEach(button => button.onclick = () => { if (state.view === button.dataset.view) return; state.view = button.dataset.view; render({ enter: true }); });
$('#zoom-in').onclick = () => { state.zoom = Math.min(1.08, +(state.zoom + .04).toFixed(2)); render(); toast(`Visualização: ${Math.round(state.zoom * 100)}%`); };
$('#zoom-out').onclick = () => { state.zoom = Math.max(.84, +(state.zoom - .04).toFixed(2)); render(); toast(`Visualização: ${Math.round(state.zoom * 100)}%`); };
// O zoom anima por CSS (transform .35s); os tracejados acompanham até o fim.
$('#activities').addEventListener('transitionend', e => { if (e.target.id === 'activities') redrawTrail(); });
$('#activities').addEventListener('transitionrun', e => { if (e.target.id !== 'activities') return; const svg = $('#learning-canvas .connections'); if (svg) svg.style.opacity = '0'; setTimeout(() => { redrawTrail(); requestAnimationFrame(() => svg?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, fill: 'forwards' }).finished.then(() => { svg.style.opacity = ''; })); }, 360); });
$('#dock-map').onclick = () => { navigate('plano'); state.view = 'map'; clearFilters(); };
$('#filter-button').onclick = () => { navigate('plano'); state.showDone = !state.showDone; render({ enter: true }); toast(state.showDone ? 'Mostrando só as concluídas, separadas das pendências.' : 'Mostrando só o que falta fazer.'); };
$('#saved-button').onclick = () => { navigate('plano'); state.saved = !state.saved; render({ enter: true }); toast(state.saved ? 'Mostrando atividades salvas.' : 'Mostrando todas as atividades.'); };
$('#notifications').onclick = () => { navigate('plano'); const p = $('#notes-panel'); p.scrollIntoView({ behavior: reduced() ? 'instant' : 'smooth', block: 'nearest' }); animate(p, { backgroundColor: ['#e3f3df', '#efefef'] }, { duration: 0.9 }); p.querySelector('.nb-text')?.focus(); };
$('#profile-button').onclick = () => { const menu = $('#profile-menu'); menu.hidden = !menu.hidden; $('#profile-button').setAttribute('aria-expanded', !menu.hidden); if (!menu.hidden) animate(menu, { opacity: [0, 1], y: [-6, 0], scale: [0.97, 1] }, { duration: duration.fast, ease: ease.out }); };
document.addEventListener('click', event => { if (!event.target.closest('.profile-wrapper')) { $('#profile-menu').hidden = true; $('#profile-button').setAttribute('aria-expanded', false); } });
$('#reset-demo').onclick = () => { activities = initial(); persist(); notes.reset(); clearFilters(); navigate('plano'); $('#profile-menu').hidden = true; $('#profile-button').setAttribute('aria-expanded', false); toast('Demonstração restaurada. Tudo pronto para recomeçar.'); };
// Botão "Criar": recurso futuro, sem ação. Só mostra o aviso.
$('#create-soon').addEventListener('click', e => { e.preventDefault(); const b = e.currentTarget; if (!reduced()) animate(b, { x: [0, -4, 4, -2, 0] }, { duration: 0.36, ease: ease.out }); toast('Em breve: criar listas, simulados e objetivos. Ainda indisponível neste protótipo.'); });
$('#add-button').onclick = () => { openDialog(`<span class="dialog-label">SEU PLANO, DO SEU JEITO</span><h2 id="dialog-title" class="dialog-title">O que vamos estudar?</h2><p class="dialog-description">Adicione um assunto ao seu mural. Você pode reorganizar a visualização pela barra lateral.</p><form id="activity-form"><label class="dialog-field">Assunto<input name="title" placeholder="Ex.: Equações do segundo grau" maxlength="70" required></label><label class="dialog-field">Área<select name="area">${studyAreas.map(area => `<option value="${area.area}">${area.fullName}</option>`).join('')}</select></label><label class="dialog-field">Tipo<select name="kind"><option value="lista">Lista de questões (5 questões do assunto)</option><option value="simulado">Simulado (10 questões da área, correção ao finalizar)</option></select></label><label class="dialog-field">Sua intenção para esse estudo<textarea name="description" placeholder="O que você quer entender melhor?" maxlength="160" required></textarea></label><button class="primary-button" type="submit">Adicionar ao meu plano ${icon('plus')}</button></form>`); $('#activity-form').onsubmit = event => { event.preventDefault(); const data = new FormData(event.target); const title = data.get('title').trim(), description = data.get('description').trim(); if (!title || !description) return; const now = new Date().toISOString(); activities.push({ id: crypto.randomUUID(), title, description, area: data.get('area') || 'Estudo livre', kind: data.get('kind') === 'simulado' ? 'simulado' : 'lista', icon: 'book', done: false, saved: false, createdAt: now, updatedAt: now }); persist(); navigate('plano'); clearFilters(); dialog.close(); toast('Novo assunto adicionado. Seu plano ganhou mais um caminho.'); }; };
let timerRemaining = 25 * 60;
let timerEnd = null;
let timerInterval = null;
const timerText = () => `${String(Math.floor(timerRemaining / 60)).padStart(2, '0')}:${String(timerRemaining % 60).padStart(2, '0')}`;
function updateTimer() { if (timerEnd) timerRemaining = Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000)); if ($('#timer-value')) $('#timer-value').textContent = timerText(); if (timerEnd && timerRemaining === 0) { clearInterval(timerInterval); timerInterval = null; timerEnd = null; if ($('#timer-start')) $('#timer-start').textContent = 'Foco concluído'; toast('Seu tempo de foco terminou. Hora de respirar um pouco.'); } }
$('#focus-button').onclick = () => { updateTimer(); openDialog(`<span class="dialog-label">UMA COISA DE CADA VEZ</span><h2 id="dialog-title" class="dialog-title">Seu momento de foco.</h2><p class="dialog-description">Escolha um tempo, deixe as distrações de lado e dê o próximo passo.</p><div class="timer-modes"><button data-minutes="15">15 min</button><button data-minutes="25" class="active">25 min</button><button data-minutes="45">45 min</button></div><div class="timer-face" id="timer-value" role="timer" aria-label="Tempo restante">${timerText()}</div><div class="dialog-actions" style="justify-content:center"><button class="primary-button" id="timer-start">${timerEnd ? 'Pausar' : 'Começar'}</button><button class="small-button" id="timer-reset">Reiniciar</button></div>`); let minutes = 25; $$('[data-minutes]', dialog).forEach(button => { button.classList.toggle('active', !timerEnd && Number(button.dataset.minutes) === Math.ceil(timerRemaining / 60)); button.onclick = () => { minutes = Number(button.dataset.minutes); clearInterval(timerInterval); timerInterval = null; timerEnd = null; timerRemaining = minutes * 60; $$('[data-minutes]', dialog).forEach(b => b.classList.toggle('active', b === button)); updateTimer(); $('#timer-start').textContent = 'Começar'; }; }); $('#timer-start').onclick = () => { if (timerEnd) { updateTimer(); timerEnd = null; clearInterval(timerInterval); timerInterval = null; $('#timer-start').textContent = 'Continuar'; } else { if (!timerRemaining) timerRemaining = minutes * 60; timerEnd = Date.now() + timerRemaining * 1000; timerInterval = setInterval(updateTimer, 250); $('#timer-start').textContent = 'Pausar'; } }; $('#timer-reset').onclick = () => { clearInterval(timerInterval); timerInterval = null; timerEnd = null; timerRemaining = minutes * 60; updateTimer(); $('#timer-start').textContent = 'Começar'; }; };

/* ------------------------------------------------------------------ */
/* Simulados: áreas → configuração (ano, tamanho, tempo) → prova         */
/* ------------------------------------------------------------------ */
const SIM_PACES = [
  { value: 'enem', label: 'Ritmo ENEM', perQuestion: 220000, hint: '≈ 3min40s por questão' },
  { value: 'padrao', label: 'Padrão', perQuestion: 180000, hint: '3 min por questão' },
  { value: 'rapido', label: 'Rápido', perQuestion: 120000, hint: '2 min por questão' },
];
const simChoices = {}; // contexto preservado por área ao voltar
const durationText = ms => { const m = Math.round(ms / 60000); return m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${String(m % 60).padStart(2, '0')}min` : ''}` : `${m} min`; };
function areaCards() {
  return `<div class="area-grid">${studyAreas.map((area, index) => `<button class="area-card area-${area.key}" data-sim-area="${area.key}" data-note-ref='${escape(JSON.stringify({ kind: 'sim-area', id: area.key }))}' aria-label="Configurar simulado: ${area.fullName}">
    <span class="area-number">${String(index + 1).padStart(2, '0')}</span>
    <span class="area-kicker">${area.subjects}</span>
    <span class="area-copy"><h2><span class="area-title">${area.title}</span> <span class="area-suffix">e suas Tecnologias</span></h2><span class="area-description">${area.text}</span><span class="area-meta">Simulado por área <span>·</span> ${simAvailable(area.key)} questões no acervo</span><span class="area-cta">Configurar simulado ${icon('arrow')}</span></span>
    <img class="area-art" src="assets/area-${area.art}.svg" alt="" width="180" height="190" draggable="false">
  </button>`).join('')}</div><p class="area-demo-note">${icon('spark')} Escolha a área para configurar ano de referência, tamanho e tempo antes de começar. Arraste um card para Minhas notas para guardar um atalho.</p>`;
}
const E = () => window.__gabaritei.E;
const simAvailable = (areaKey, year = null) => E().questionRepository.query({ areaIds: [areaKey], ...(year ? { years: [year] } : {}) }).length;
function renderSimulados({ direction = 0 } = {}) {
  const page = $('#secondary-page');
  delete page.dataset.learning;
  page.classList.remove('learning-page', 'legacy-ui');
  page.dataset.sim = state.simView;
  if (state.simView === 'areas') {
    page.innerHTML = `<div class="sim-head"><div><div class="eyebrow">SE PREPARAR TAMBÉM É EXPERIMENTAR</div><h1>Um treino no seu ritmo.</h1><p class="secondary-description">Escolha uma das quatro áreas do ENEM. Antes de começar, você define o ano de referência, o tamanho e o tempo da prova.</p></div>
      <button type="button" class="custom-sim-btn" id="custom-sim" data-press="0.96"><span class="custom-sim-icon">${hi('SlidersHorizontal')}</span><span class="custom-sim-copy"><strong>Simulado personalizado</strong><small>Matérias, assuntos, anos e tempo</small></span><span class="custom-sim-arrow">${hi('ArrowRight')}</span></button></div>${areaCards()}`;
    $('#custom-sim').onclick = () => navigate('simulado-personalizado');
    $$('[data-sim-area]', page).forEach(b => b.onclick = () => openAreaConfig(b.dataset.simArea, b));
    if (direction) slideIn(page, direction);
    else $$('.area-card', page).forEach((c, i) => c.animate([{ opacity: 0, translate: '0 14px' }, { opacity: 1, translate: '0 0' }], { duration: 480, delay: 60 + i * 60, easing: cssEase.out, fill: 'backwards' }));
    animate($('#custom-sim'), { opacity: [0, 1], x: [16, 0] }, { ...spring.soft, delay: 0.12 });
    return;
  }
  const area = studyAreas.find(a => a.key === state.simArea);
  const c = simChoices[area.key] ??= { year: null, size: 10, pace: 'padrao', timerVisible: true };
  const years = E().REFERENCE_YEARS.map(y => ({ y, n: simAvailable(area.key, y) })).filter(x => x.n > 0);
  const available = simAvailable(area.key, c.year);
  const sizes = [5, 10, 15, 20, 30, 45];
  const size = Math.min(c.size, available);
  const pace = SIM_PACES.find(p => p.value === c.pace);
  const subjects = E().subjectsOfArea(area.key).map(s => ({ name: s.name, n: E().questionRepository.query({ subjectId: s.id, ...(c.year ? { years: [c.year] } : {}) }).length })).filter(s => s.n);
  const maxN = Math.max(1, ...subjects.map(s => s.n));
  page.innerHTML = `<div class="sim-config area-${area.key}">
    <button type="button" class="sim-back" id="sim-back" data-press="0.96">${icon('arrow-left')}Voltar às quatro áreas</button>
    <section class="sim-hero"><div class="sim-hero-copy"><span class="area-kicker">${area.subjects}</span><h1>Simulado de ${area.title}<span> e suas Tecnologias</span></h1><p>Prova no formato do ENEM, com cronômetro regressivo e correção só ao finalizar.</p></div><img class="sim-hero-art" src="assets/area-${area.art}.svg" alt="" width="180" height="190" draggable="false"></section>
    <div class="sim-layout"><div class="sim-steps">
      <section class="sim-step" data-step><header><span class="sim-step-n">1</span><div><h2>Edição de referência</h2><p>Só aparecem os anos que existem no acervo desta área.</p></div></header>
        <div class="sim-years" role="radiogroup" aria-label="Ano de referência"><button type="button" role="radio" aria-checked="${c.year === null}" data-year="" class="${c.year === null ? 'is-on' : ''}"><strong>Todos</strong><small>${simAvailable(area.key)} questões</small></button>${years.map(({ y, n }) => `<button type="button" role="radio" aria-checked="${c.year === y}" data-year="${y}" class="${c.year === y ? 'is-on' : ''}"><strong>${y}</strong><small>${n} ${n === 1 ? 'questão' : 'questões'}</small></button>`).join('')}</div>
        <p class="sim-note">${icon('spark')} Acervo demonstrativo: o ano é uma etiqueta de referência das questões autorais, não uma prova oficial do Inep.</p></section>
      <section class="sim-step" data-step><header><span class="sim-step-n">2</span><div><h2>Quantidade de questões</h2><p>${available} disponíveis com o filtro atual.</p></div></header>
        <div class="sim-sizes" role="radiogroup" aria-label="Quantidade de questões">${sizes.map(n => `<button type="button" role="radio" aria-checked="${c.size === n}" data-size="${n}" class="${c.size === n ? 'is-on' : ''}" ${n > available ? 'disabled' : ''}>${n}</button>`).join('')}</div>
        ${c.size > available ? `<p class="sim-warn">${icon('bell')} Com esse ano há apenas ${available} questões; o simulado terá ${available}.</p>` : ''}</section>
      <section class="sim-step" data-step><header><span class="sim-step-n">3</span><div><h2>Tempo de prova</h2><p>${pace.hint}. Aviso quando faltarem 15 minutos.</p></div></header>
        <div class="sim-sizes is-pace" role="radiogroup" aria-label="Ritmo do cronômetro">${SIM_PACES.map(p => `<button type="button" role="radio" aria-checked="${c.pace === p.value}" data-pace="${p.value}" class="${c.pace === p.value ? 'is-on' : ''}">${p.label}</button>`).join('')}</div>
        <label class="sim-toggle"><input type="checkbox" id="sim-timer-visible" ${c.timerVisible ? 'checked' : ''}><span><strong>Cronômetro visível</strong><small>O tempo continua contando mesmo oculto.</small></span></label></section>
    </div>
    <aside class="sim-summary" id="sim-summary"><span class="sim-summary-label">SEU SIMULADO</span><div class="sim-summary-count"><strong id="sim-count">${size}</strong><span>questões</span></div>
      <dl><div><dt>Área</dt><dd>${area.fullName}</dd></div><div><dt>Edição</dt><dd>${c.year ?? 'Todos os anos'}</dd></div><div><dt>Duração</dt><dd>${size ? durationText(size * pace.perQuestion) : '—'}</dd></div><div><dt>Correção</dt><dd>Ao finalizar a prova</dd></div><div><dt>Disponíveis</dt><dd>${available} no acervo</dd></div></dl>
      <div class="sim-mix"><span>Matérias no acervo filtrado</span>${subjects.map(s => `<div><span>${escape(s.name)}</span><i><i style="--w:${s.n / maxN}"></i></i><b>${s.n}</b></div>`).join('')}</div>
      <button type="button" class="sim-start" id="sim-start" ${size ? '' : 'disabled'} data-press="0.97">Iniciar simulado ${icon('arrow')}</button>
      <p class="sim-fine">Nada começa antes de você confirmar. Você pode pausar e continuar depois.</p></aside></div>
  </div>`;
  const rerender = () => { const sc = page.scrollTop; renderSimulados(); page.scrollTop = sc; };
  $('#sim-back').onclick = () => { history.replaceState(null, '', '#simulados'); state.simView = 'areas'; renderSimulados({ direction: -1 }); };
  $$('[data-year]', page).forEach(b => b.onclick = () => { c.year = b.dataset.year ? Number(b.dataset.year) : null; rerender(); });
  $$('[data-size]', page).forEach(b => b.onclick = () => { c.size = Number(b.dataset.size); rerender(); });
  $$('[data-pace]', page).forEach(b => b.onclick = () => { c.pace = b.dataset.pace; rerender(); });
  $('#sim-timer-visible').onchange = e => { c.timerVisible = e.target.checked; };
  $('#sim-start').onclick = () => {
    const pool = E().questionRepository.query({ areaIds: [area.key], ...(c.year ? { years: [c.year] } : {}) });
    const ids = E().pickQuestions(pool, size, learning.records(), E().createRng(Date.now())).map(q => q.id);
    learning.startSimulation({ title: `Simulado · ${area.title}${c.year ? ` · ref. ${c.year}` : ''}`, questionIds: ids, durationMs: ids.length * pace.perQuestion, timerHidden: !c.timerVisible, edition: c.year });
  };
  if (direction) slideIn(page, direction);
  page.querySelectorAll('.sim-mix i > i').forEach((bar, i) => bar.animate([{ transform: 'scaleX(0)' }, { transform: `scaleX(${bar.style.getPropertyValue('--w')})` }], { duration: 750, delay: i * 50, easing: cssEase.emphasized, fill: 'both' }));
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
const PAGE_NAMES = { perfil: 'Perfil', plano: 'Meus estudos', questoes: 'Questões', simulados: 'Simulados', 'simulado-personalizado': 'Simulado personalizado', historico: 'Histórico', progresso: 'Progresso' };
function navigate(page, { sub = null } = {}) {
  const changed = page !== state.page || sub;
  state.page = page;
  if (page === 'simulados') { state.simView = sub ? 'config' : 'areas'; if (sub) state.simArea = sub; }
  history.replaceState(null, '', `#${page}${page === 'simulados' && sub ? `/${sub}` : ''}`);
  $('#plan-page').hidden = page !== 'plano';
  $('#secondary-page').hidden = page === 'plano';
  sidebar.setActive(page === 'simulado-personalizado' ? 'simulados' : page);
  $('.side-bottom .profile-wrapper')?.classList.toggle('is-current', page === 'perfil');
  document.title = `${PAGE_NAMES[page]} · Gabaritei`;
  if ($('#topbar-title')) $('#topbar-title').innerHTML = `Gabaritei <span aria-hidden="true">/</span> <strong>${PAGE_NAMES[page]}</strong>`;
  closeCardMenu();
  if (page === 'plano') { if (changed) render({ enter: true }); return; }
  scrollTo({ top: 0 });
  const secondary = $('#secondary-page');
  if (page === 'simulados') renderSimulados();
  else learning.mount(page);
  if (changed && !reduced() && page !== 'simulados') pageEnter(secondary.firstElementChild);
}
const sidebar = createSidebar({
  onNavigate: page => navigate(page),
  getResume: () => learning.resumeTarget(),
  getStreak: () => learning.streak(),
  icons: hi,
});
document.addEventListener('keydown', event => { const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable; if (event.key === '/' && !typing && !dialog.open) { event.preventDefault(); navigate('plano'); $('#search').focus(); } if (event.key === 'Escape') { $('#profile-menu').hidden = true; $('#profile-button').setAttribute('aria-expanded', false); } });

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

const learning = createLearningPages({ root: $('#secondary-page'), openDialog, closeDialog: () => dialog.close(), toast, navigate, icons: icon, saveToNotes: (ref, el) => saveToNotes(ref, el), onProfileChange: p => paintProfile(p), onChange: () => { if (state.page === 'plano') render(); sidebar.renderBottom(); notes?.refresh(); } });
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
if (['plano', 'questoes', 'simulados', 'simulado-personalizado', 'historico', 'progresso', 'perfil'].includes(hashPage) && hashPage !== 'plano') { state.page = ''; navigate(hashPage, { sub: hashPage === 'simulados' ? hashSub || null : null }); render(); }
else { state.page = 'plano'; navigate('plano'); sidebar.setActive('plano'); render({ enter: true }); }
addEventListener('hashchange', () => { const [p, sub] = location.hash.slice(1).split('/'); if (PAGE_NAMES[p] && (p !== state.page || sub)) navigate(p, { sub: p === 'simulados' ? sub || null : null }); });
