// Tela de prova do simulado: réplica do ExamPage.tsx do front anterior, em
// JavaScript puro. Regra própria do simulado: NÃO há correção imediata — as
// respostas só são corrigidas ao finalizar. Cronômetro regressivo, grade de
// questões por área, marcar para revisar, limpar resposta, pausa que oculta a
// questão, aviso de 15 minutos e encerramento automático ao fim do tempo.
// Toda mudança de estado passa pelos reducers `simulation` do motor antigo.
import { animate, spring, duration, ease, reduced } from './motion-kit.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clock = ms => {
  const t = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  const pad = n => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};
const WARNING_MS = 15 * 60000;
const DIFFICULTY = { facil: 'Fácil', media: 'Média', dificil: 'Difícil' };
const SUBJECT_ICON = { portugues: 'PenLine', literatura: 'BookOpen', ingles: 'Languages', espanhol: 'Languages', artes: 'Palette', historia: 'ScrollText', geografia: 'Globe', filosofia: 'Brain', sociologia: 'Users', fisica: 'Atom', quimica: 'FlaskConical', biologia: 'Leaf', matematica: 'Sigma' };

export function createExamScreen({ E, hi, toast, getAccount, save, onExit, onFinished }) {
  const root = document.createElement('div');
  root.className = 'focus-screen exam-screen';
  root.hidden = true;
  root.tabIndex = -1;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'Simulado');
  document.body.append(root);

  let s = null;
  let tick = 0;
  let beats = 0;
  let warned = false;
  let showRestore = false;
  let panelOpen = true;
  let confirmOpen = false;
  let navToken = 0;
  let ringIndex = null;

  const $ = sel => root.querySelector(sel);
  const $$ = sel => [...root.querySelectorAll(sel)];
  const running = () => s.clock.runningSince !== null;
  const narrow = () => matchMedia('(max-width: 1023px)').matches;
  const answered = () => s.questionIds.filter(id => s.answers[id]?.selected).length;
  const remaining = () => E.simulation.remaining(s, Date.now());

  function persist(next) {
    s = next;
    const list = getAccount().simulations;
    const i = list.findIndex(x => x.id === next.id);
    if (i >= 0) list[i] = next; else list.push(next);
    save();
  }

  function open(session) {
    if (!session) return;
    if (session.status === 'completed') { onFinished(session); return; }
    s = session;
    // Primeira abertura inicia o relógio; reabrir mostra "Simulado salvo".
    showRestore = s.clock.runningSince === null && s.clock.elapsedMs > 0;
    if (s.clock.runningSince === null && s.clock.elapsedMs === 0) persist(E.simulation.resume(s, Date.now()));
    else persist(E.simulation.recover(s, Date.now()));
    warned = remaining() <= WARNING_MS;
    panelOpen = !narrow();
    confirmOpen = false;
    ringIndex = null;
    root.hidden = false;
    document.body.classList.add('focus-open');
    paint();
    root.focus({ preventScroll: true });
    animate(root, { opacity: [0, 1] }, { duration: duration.base, ease: ease.out });
    clearInterval(tick);
    beats = 0;
    tick = setInterval(onTick, 1000);
    if (remaining() <= 0) timeout();
  }

  function exit() {
    clearInterval(tick);
    if (s && s.status === 'in_progress') persist(E.simulation.pause(s, Date.now()));
    s = null;
    root.hidden = true;
    root.innerHTML = '';
    document.body.classList.remove('focus-open');
    onExit();
  }
  addEventListener('pagehide', () => { if (s && s.status === 'in_progress') persist(E.simulation.pause(s, Date.now())); });

  function onTick() {
    if (!s || s.status !== 'in_progress' || !running()) return;
    const left = remaining();
    renderTimer();
    if (++beats % 15 === 0) persist(E.simulation.heartbeat(s, Date.now()));
    if (!warned && left <= WARNING_MS && left > 0) {
      warned = true;
      const t = $('#ex-timer');
      if (t) animate(t, { scale: [1, 1.06, 1] }, { duration: 0.6 });
      if (s.timerHidden) toast('Faltam 15 minutos. Reserve um tempo para revisar as questões marcadas.');
    }
    if (left <= 0) timeout();
  }
  function timeout() {
    finish('timeout');
    toast('Tempo esgotado. O simulado foi encerrado automaticamente; questões em branco contam como erro.');
  }

  /* ---------------------------------------------------------------- */
  /* Estrutura                                                         */
  /* ---------------------------------------------------------------- */
  function paint() {
    root.innerHTML = `
      <header class="ex-top">
        <button class="ex-back" id="ex-exit" aria-label="Sair do simulado (fica pausado e salvo)">${hi('ArrowLeft')}<span class="ex-logo" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span></button>
        <div class="ex-title"><p id="ex-title">${esc(s.title)}</p><p class="ex-sub" id="ex-sub"></p></div>
        <div class="ex-tools">
          <div id="ex-timer-slot" class="ex-timer-slot"></div>
          <button class="lg-icon-btn ex-hide-sm" id="ex-eye"></button>
          <button class="lg-icon-btn" id="ex-pause"></button>
          <button class="lg-icon-btn" id="ex-panel-toggle"></button>
          <button class="lg-btn lg-btn-primary lg-btn-sm" id="ex-finish" aria-label="Finalizar simulado" data-press>${hi('Send')}<span class="ex-hide-sm">Finalizar</span></button>
        </div>
      </header>
      <div class="ex-body">
        <main class="ex-main">
          <div class="ex-crumb" id="ex-crumb"></div>
          <div id="ex-stage"></div>
          <div class="ex-actions" id="ex-actions"></div>
          <div id="ex-pause-layer"></div>
        </main>
        <div class="ex-scrim" id="ex-scrim" aria-hidden="true"></div>
        <aside class="ex-panel" id="ex-panel" aria-label="Grade de questões"><div class="ex-panel-card" id="ex-panel-card"></div></aside>
      </div>
      <div id="ex-modal-layer"></div>`;
    $('#ex-exit').onclick = exit;
    $('#ex-eye').onclick = () => { persist(E.simulation.setTimerHidden(s, !s.timerHidden)); renderHeader(); };
    $('#ex-pause').onclick = () => (running() ? pause() : resume());
    $('#ex-panel-toggle').onclick = () => { panelOpen = !panelOpen; renderPanelVisibility(true); renderHeader(); };
    $('#ex-scrim').onclick = () => { panelOpen = false; renderPanelVisibility(true); renderHeader(); };
    $('#ex-finish').onclick = openConfirm;
    renderHeader();
    renderQuestion(0);
    renderActions();
    renderPanel();
    renderPanelVisibility(false);
    renderPause(false);
  }

  function renderTimer() {
    const slot = $('#ex-timer-slot');
    if (!slot) return;
    if (s.timerHidden) { slot.innerHTML = ''; return; }
    const left = remaining();
    const warn = left <= WARNING_MS;
    const cls = !running() ? 'is-paused' : warn ? 'is-warning' : '';
    const el = $('#ex-timer');
    if (el && el.dataset.cls === cls) { $('#ex-timer-value').textContent = clock(left); el.setAttribute('aria-label', `Tempo restante: ${clock(left)}`); return; }
    slot.innerHTML = `<div class="ex-timer ${cls}" id="ex-timer" data-cls="${cls}" role="timer" aria-label="Tempo restante: ${clock(left)}">${hi('Hourglass')}<span id="ex-timer-value">${clock(left)}</span>${running() ? '' : '<small>pausado</small>'}</div>`;
  }

  function renderHeader() {
    $('#ex-sub').textContent = `${answered()} de ${s.questionIds.length} respondidas · ${s.marked.length} ${s.marked.length === 1 ? 'marcada' : 'marcadas'}`;
    renderTimer();
    const eye = $('#ex-eye');
    eye.innerHTML = hi(s.timerHidden ? 'Eye' : 'EyeOff');
    eye.setAttribute('aria-label', s.timerHidden ? 'Mostrar cronômetro' : 'Ocultar cronômetro');
    eye.title = eye.getAttribute('aria-label');
    const p = $('#ex-pause');
    p.innerHTML = hi(running() ? 'Pause' : 'Play');
    p.classList.toggle('is-active', !running());
    p.setAttribute('aria-label', running() ? 'Pausar (P)' : 'Retomar (P)');
    p.title = p.getAttribute('aria-label');
    const t = $('#ex-panel-toggle');
    t.innerHTML = hi(panelOpen ? 'PanelRightClose' : 'PanelRightOpen');
    t.classList.toggle('is-active', panelOpen);
    t.setAttribute('aria-label', panelOpen ? 'Recolher painel' : 'Mostrar painel');
    t.setAttribute('aria-expanded', String(panelOpen));
    t.title = t.getAttribute('aria-label');
  }

  function questionHTML(q, number) {
    const subject = E.SUBJECT_BY_ID[q.subjectId];
    const topic = E.TOPIC_BY_ID[q.topicId];
    const a = s.answers[q.id];
    return `<article class="ex-article" id="ex-article">
      <div class="lg-qmeta">
        <span class="lg-qnum">${number}.</span>
        <span class="lg-badge tone-${q.areaId}">${hi(SUBJECT_ICON[q.subjectId] || 'BookOpen')}<span>${esc(subject.name)}</span></span>
        <span class="lg-badge">${esc(topic?.name ?? '')}</span>
        <span class="lg-badge tone-outline is-sm lg-push">Questão demonstrativa · ref. ${q.year}</span>
        <span class="lg-badge tone-outline is-sm">${DIFFICULTY[q.difficulty] ?? ''}</span>
      </div>
      <div class="ex-text">
        ${q.support ? `<div class="qs-support">${q.support.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}${q.support.credit ? `<p class="qs-credit">${esc(q.support.credit)}</p>` : ''}</div>` : ''}
        ${q.image ? `<figure class="qs-figure"><img src="${esc(q.image.src)}" alt="${esc(q.image.alt)}" width="${q.image.width}" height="${q.image.height}">${q.image.caption ? `<figcaption>${esc(q.image.caption)}</figcaption>` : ''}</figure>` : ''}
        <p class="qs-prompt">${esc(q.prompt)}</p>
      </div>
      <div class="ex-alts" role="radiogroup" aria-label="Alternativas">${q.alternatives.map(alt => `<button type="button" class="ex-alt ${a?.selected === alt.letter ? 'is-selected' : ''}" role="radio" aria-checked="${a?.selected === alt.letter}" data-letter="${alt.letter}" ${running() ? '' : 'disabled'}><span class="ex-alt-letter">${alt.letter}</span><span class="ex-alt-text">${esc(alt.text)}</span></button>`).join('')}</div>
    </article>`;
  }

  function renderQuestion(dir) {
    const i = s.currentIndex;
    const q = E.questionRepository.getById(s.questionIds[i]);
    const number = E.questionNumber(s, i);
    const section = s.sections.find(x => i >= x.start && i < x.end);
    $('#ex-crumb').innerHTML = `${section ? `<span class="lg-badge tone-${section.areaId}"><span>${esc(section.label)}</span></span>` : ''}<span>Questão <strong>${number}</strong></span>`;
    $('#ex-stage').innerHTML = questionHTML(q, number);
    $$('.ex-alt').forEach(b => b.onclick = () => select(b.dataset.letter));
    // quietSlide: variante contida usada em simulados (preserva concentração).
    if (dir) animate($('#ex-article'), { opacity: [0, 1], x: [dir * 14, 0] }, { duration: duration.fast, ease: ease.out });
  }

  function renderActions() {
    const i = s.currentIndex;
    const qid = s.questionIds[i];
    const marked = s.marked.includes(qid);
    const a = s.answers[qid];
    const last = i === s.questionIds.length - 1;
    $('#ex-actions').innerHTML = `
      <button type="button" class="lg-btn lg-btn-ghost" id="ex-prev" ${i === 0 ? 'disabled' : ''} data-press>${hi('ChevronLeft')}Anterior</button>
      <button type="button" class="lg-btn ${marked ? 'lg-btn-soft is-gold' : 'lg-btn-ghost'}" id="ex-mark" aria-pressed="${marked}" data-press>${hi('Flag')}${marked ? 'Marcada' : 'Marcar para revisar'}</button>
      ${a?.selected ? `<button type="button" class="lg-btn lg-btn-ghost" id="ex-clear" data-press>${hi('Eraser')}Limpar resposta</button>` : ''}
      <span class="ex-spacer"></span>
      ${last ? `<button type="button" class="lg-btn lg-btn-accent" id="ex-finish-2" data-press>${hi('Send')}Finalizar simulado</button>` : `<button type="button" class="lg-btn lg-btn-primary" id="ex-next" data-press>Próxima${hi('ChevronRight')}</button>`}`;
    const on = (id, fn) => { const el = $(id); if (el) el.onclick = fn; };
    on('#ex-prev', () => go(i - 1));
    on('#ex-next', () => go(i + 1));
    on('#ex-mark', toggleMark);
    on('#ex-clear', () => { persist(E.simulation.select(s, null, Date.now())); refreshAnswer(); });
    on('#ex-finish-2', openConfirm);
  }

  function renderPanel() {
    const total = s.questionIds.length;
    const done = answered();
    $('#ex-panel-card').innerHTML = `
      <div class="ex-panel-head"><p>Questões</p><span>${done}/${total}</span></div>
      <div class="ex-panel-track"><div id="ex-panel-fill" style="transform:scaleX(${total ? done / total : 0})"></div></div>
      <div class="ex-grid-wrap" id="ex-grid-wrap">${s.sections.map(sec => `<div class="ex-sec"><p>${esc(sec.label)}</p><div class="ex-grid">${s.questionIds.slice(sec.start, sec.end).map((qid, j) => {
        const idx = sec.start + j;
        const a = s.answers[qid];
        const mk = s.marked.includes(qid);
        return `<button type="button" class="ex-cell ${a?.selected ? 'is-answered' : ''}" data-go="${idx}" ${idx === s.currentIndex ? 'aria-current="step"' : ''} aria-label="Questão ${sec.firstNumber + j}: ${a?.selected ? `respondida (${a.selected})` : 'em branco'}${mk ? ', marcada' : ''}">${sec.firstNumber + j}${mk ? `<span class="ex-cell-flag">${hi('Flag')}</span>` : ''}</button>`;
      }).join('')}</div></div>`).join('')}<span class="ex-ring" id="ex-ring" aria-hidden="true"></span></div>
      <div class="ex-legend"><span><i class="is-answered"></i>Respondida</span><span><i></i>Em branco</span><span>${hi('Flag')}Marcada</span></div>`;
    $$('[data-go]').forEach(b => b.onclick = () => go(Number(b.dataset.go)));
    placeRing();
  }

  /** Anel da questão atual (layoutId "exam-current"): desliza entre as células. */
  function placeRing() {
    const wrap = $('#ex-grid-wrap'), ring = $('#ex-ring');
    const cell = wrap?.querySelector(`[data-go="${s.currentIndex}"]`);
    if (!cell || !ring) return;
    const pos = el => { const w = wrap.getBoundingClientRect(), r = el.getBoundingClientRect(); return { x: r.left - w.left, y: r.top - w.top, w: r.width, h: r.height }; };
    const to = pos(cell);
    ring.style.width = `${to.w}px`; ring.style.height = `${to.h}px`;
    const prevCell = ringIndex !== null ? wrap.querySelector(`[data-go="${ringIndex}"]`) : null;
    if (prevCell && ringIndex !== s.currentIndex && !reduced()) {
      const from = pos(prevCell);
      animate(ring, { x: [from.x, to.x], y: [from.y, to.y] }, spring.layout);
    } else {
      ring.style.translate = `${to.x}px ${to.y}px`;
    }
    ringIndex = s.currentIndex;
  }

  function renderPanelVisibility(animated) {
    const panel = $('#ex-panel'), scrim = $('#ex-scrim');
    const isNarrow = narrow();
    root.classList.toggle('ex-narrow', isNarrow);
    scrim.classList.toggle('is-visible', isNarrow && panelOpen);
    if (!animated || reduced()) { panel.classList.toggle('is-hidden', !panelOpen); if (panelOpen) requestAnimationFrame(placeRing); return; }
    if (panelOpen) {
      panel.classList.remove('is-hidden');
      if (isNarrow) animate(panel, { x: [360, 0] }, spring.soft);
      else animate(panel, { opacity: [0, 1], width: [0, 320] }, spring.soft);
      requestAnimationFrame(placeRing);
    } else {
      const done = isNarrow ? animate(panel, { x: [0, 360] }, spring.soft) : animate(panel, { opacity: [1, 0], width: [320, 0] }, spring.soft);
      done.then(() => { if (!panelOpen) { panel.classList.add('is-hidden'); panel.style.width = ''; panel.style.transform = ''; panel.style.opacity = ''; } });
    }
  }
  addEventListener('resize', () => { if (s && !root.hidden) renderPanelVisibility(false); });

  function renderPause(animated = true) {
    const layer = $('#ex-pause-layer');
    const show = !running() && s.status !== 'completed';
    if (show) {
      layer.innerHTML = `<div class="ex-pause" id="ex-pause-scrim"><div class="lg-card ex-pause-card" role="dialog" aria-modal="true" aria-labelledby="ex-pause-title">
        <span class="lg-tile tone-gold is-lg">${hi(showRestore ? 'Play' : 'Pause')}</span>
        <h2 id="ex-pause-title">${showRestore ? 'Simulado salvo' : 'Simulado pausado'}</h2>
        <p>${answered()} de ${s.questionIds.length} respondidas · restam <strong>${clock(remaining())}</strong>. As questões ficam ocultas enquanto o tempo está parado.</p>
        <button type="button" class="lg-btn lg-btn-accent lg-btn-lg lg-btn-full" id="ex-resume" data-press>${hi('Play')}${showRestore ? 'Continuar simulado' : 'Retomar'}</button>
      </div></div>`;
      $('#ex-resume').onclick = resume;
      if (animated) { animate($('#ex-pause-scrim'), { opacity: [0, 1] }, { duration: duration.fast }); animate($('.ex-pause-card'), { y: [16, 0] }, spring.soft); }
      requestAnimationFrame(() => $('#ex-resume')?.focus({ preventScroll: true }));
    } else if (layer.firstElementChild) {
      animate($('#ex-pause-scrim'), { opacity: [1, 0] }, { duration: duration.micro, ease: ease.in }).then(() => { if (running()) layer.innerHTML = ''; });
    }
  }

  function openConfirm() {
    confirmOpen = true;
    const total = s.questionIds.length;
    const blank = total - answered();
    $('#ex-modal-layer').innerHTML = `<div class="lg-scrim" id="ex-modal-scrim"><div class="lg-modal" role="alertdialog" aria-modal="true" aria-labelledby="ex-confirm-title" aria-describedby="ex-confirm-text">
      <span class="lg-tile is-lg ${blank ? 'tone-coral' : 'tone-sage'}">${hi(blank ? 'AlertTriangle' : 'Send')}</span>
      <h2 id="ex-confirm-title">Finalizar o simulado?</h2>
      <div id="ex-confirm-text" class="lg-modal-text">
        <p>${blank ? `Você deixou <strong>${blank} ${blank === 1 ? 'questão em branco' : 'questões em branco'}</strong>. Elas serão contadas como erro.` : `Todas as ${total} questões foram respondidas.`}</p>
        ${s.marked.length ? `<p>Há ${s.marked.length} ${s.marked.length === 1 ? 'questão marcada' : 'questões marcadas'} para revisar.</p>` : ''}
        <p>Depois de finalizar, não será possível alterar as respostas.</p>
      </div>
      <div class="lg-modal-actions"><button type="button" class="lg-btn lg-btn-ghost" id="ex-cancel" data-press>Voltar à prova</button><button type="button" class="lg-btn lg-btn-primary" id="ex-ok" data-press>Finalizar e ver resultado</button></div>
    </div></div>`;
    animate($('#ex-modal-scrim'), { opacity: [0, 1] }, { duration: duration.base, ease: ease.out });
    animate($('.lg-modal'), { opacity: [0, 1], y: [18, 0], scale: [0.97, 1] }, spring.soft);
    $('#ex-cancel').onclick = closeConfirm;
    $('#ex-ok').onclick = () => { closeConfirm(); finish('manual'); };
    $('#ex-modal-scrim').addEventListener('mousedown', e => { if (e.target.id === 'ex-modal-scrim') closeConfirm(); });
    requestAnimationFrame(() => $('#ex-ok')?.focus());
  }
  function closeConfirm() {
    confirmOpen = false;
    const scrim = $('#ex-modal-scrim');
    if (!scrim) return;
    animate($('.lg-modal'), { opacity: [1, 0], y: [0, 10], scale: [1, 0.98] }, { duration: duration.fast, ease: ease.in });
    animate(scrim, { opacity: [1, 0] }, { duration: duration.fast, ease: ease.in }).then(() => { const layer = $('#ex-modal-layer'); if (layer) layer.innerHTML = ''; });
  }

  /* ---------------------------------------------------------------- */
  /* Ações                                                             */
  /* ---------------------------------------------------------------- */
  function go(target) {
    if (!s || target < 0 || target >= s.questionIds.length || target === s.currentIndex) return;
    const dir = target > s.currentIndex ? 1 : -1;
    persist(E.simulation.goTo(s, target, Date.now()));
    const token = ++navToken;
    renderActions(); renderPanel(); renderHeader();
    animate($('#ex-article'), { opacity: [1, 0], x: [0, dir * -10] }, { duration: duration.micro, ease: ease.in }).then(() => { if (token === navToken && s) renderQuestion(dir); });
  }
  function refreshAnswer() {
    const qid = s.questionIds[s.currentIndex];
    const sel = s.answers[qid]?.selected;
    $$('.ex-alt').forEach(b => { const on = b.dataset.letter === sel; b.classList.toggle('is-selected', on); b.setAttribute('aria-checked', String(on)); });
    renderActions(); renderPanel(); renderHeader();
  }
  function select(letter) {
    if (!s || !running()) return;
    persist(E.simulation.select(s, letter, Date.now()));
    refreshAnswer();
    const b = root.querySelector(`.ex-alt[data-letter="${letter}"] .ex-alt-letter`);
    if (b) animate(b, { scale: [0.85, 1] }, spring.snappy);
  }
  function toggleMark() {
    const qid = s.questionIds[s.currentIndex];
    persist(E.simulation.toggleMark(s, qid, Date.now()));
    renderActions(); renderPanel(); renderHeader();
  }
  function pause() { persist(E.simulation.pause(s, Date.now())); paintState(); }
  function resume() { showRestore = false; persist(E.simulation.resume(s, Date.now())); paintState(); }
  function paintState() { renderHeader(); renderPause(); $$('.ex-alt').forEach(b => { b.disabled = !running(); }); }
  function finish(reason) {
    if (!s || s.status === 'completed') return;
    clearInterval(tick);
    persist(E.simulation.finish(s, reason, Date.now()));
    const done = s;
    s = null;
    root.hidden = true;
    root.innerHTML = '';
    document.body.classList.remove('focus-open');
    onFinished(done);
  }

  document.addEventListener('keydown', e => {
    if (root.hidden || !s || e.metaKey || e.ctrlKey || e.altKey) return;
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)) return;
    const key = e.key.toLowerCase();
    if (key === 'escape') { if (confirmOpen) { e.preventDefault(); closeConfirm(); } else if (panelOpen && narrow()) { panelOpen = false; renderPanelVisibility(true); renderHeader(); } return; }
    if (confirmOpen) return;
    if (/^[a-e]$/.test(key)) { e.preventDefault(); select(key.toUpperCase()); }
    else if (key === 'arrowright') { e.preventDefault(); go(s.currentIndex + 1); }
    else if (key === 'arrowleft') { e.preventDefault(); go(s.currentIndex - 1); }
    else if (key === 'm') { e.preventDefault(); toggleMark(); }
    else if (key === 'p') { e.preventDefault(); running() ? pause() : resume(); }
  });

  return { open, isOpen: () => !root.hidden };
}
