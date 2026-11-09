// Tela de resolução de questões: réplica da sessão de prática do front anterior
// (PracticeSessionPage + QuestionView), em JavaScript puro. Mesmo layout, textos,
// atalhos, tela de pausa e animações (mesmos tempos e curvas do Motion de antes).
// Só o ícone da marca mudou. Toda mudança de estado passa pelos reducers do motor.
import { resultHTML as legacyResultHTML, bindResultPage } from './result-page.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = value => `${Math.round((value || 0) * 100)}%`;
const clockText = ms => {
  const t = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  const pad = n => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};
const duration = ms => {
  const m = Math.round(ms / 60000);
  if (m < 1) return `${Math.max(0, Math.round(ms / 1000))}s`;
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}min` : `${m}min`;
};
const DIFFICULTY = { facil: 'Fácil', media: 'Média', dificil: 'Difícil' };
const SUBJECT_ICON = { portugues: 'pen', literatura: 'book', ingles: 'languages', espanhol: 'languages', artes: 'palette', historia: 'scroll', geografia: 'globe', filosofia: 'brain', sociologia: 'users', fisica: 'atom', quimica: 'flask', biologia: 'leaf', matematica: 'sigma' };
// Ícone da marca (o único elemento diferente da tela antiga).
const LOGO = '<span class="qs-logo" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span>';

// Curvas e durações do sistema de movimento antigo (tokens.ts / variants.ts).
const EASE = { out: 'cubic-bezier(0.22, 1, 0.36, 1)', emphasized: 'cubic-bezier(0.2, 0, 0, 1)', in: 'cubic-bezier(0.4, 0, 1, 1)' };
const SPRING = { snappy: 'cubic-bezier(0.3, 1.25, 0.5, 1)', soft: 'cubic-bezier(0.22, 1, 0.36, 1)', bouncy: 'cubic-bezier(0.34, 1.7, 0.5, 1)' };

export function createPracticeScreen({ E, icons, toast, getAccount, save, onExit, onProgress, onNewList, onHome = () => {}, onHistory = () => {}, onNewSimulation = () => {}, saveToNotes = () => {}, reviewTopic = () => {} }) {
  const root = document.createElement('div');
  root.className = 'focus-screen';
  root.id = 'focus-screen';
  root.hidden = true;
  root.tabIndex = -1;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'Resolução de questões');
  document.body.append(root);

  let session = null;
  let view = 'question';
  let showExplanation = true;
  let focusMode = false;
  let drawer = false;
  let confirmFinish = false;
  let lightbox = null;
  let welcomeBack = false;
  let tick = null;
  let beats = 0;
  let readOnly = false;
  let resultKicker = 'RESULTADO DA LISTA';
  let resultSimulation = null;
  let navToken = 0;
  let lastCurrent = null;
  const completionHandlers = new Map();

  const $ = selector => root.querySelector(selector);
  const $$ = selector => [...root.querySelectorAll(selector)];
  const account = () => getAccount();
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = () => matchMedia('(max-width: 1023px)').matches;
  // Anima com a Web Animations API; se o navegador pausar as animações (aba em segundo
  // plano), o prazo garante que o fluxo continue (ex.: trocar de questão).
  const animate = (el, frames, opts) => {
    if (!el || reduce() || !el.animate) return Promise.resolve();
    const anim = el.animate(frames, { fill: 'backwards', ...opts });
    const limit = (opts.duration || 0) + (opts.delay || 0) + 120;
    return Promise.race([anim.finished.catch(() => {}), new Promise(r => setTimeout(r, limit))]);
  };
  const current = () => E.questionRepository.getById(session.questionIds[session.currentIndex]);
  const running = () => session.clock.runningSince !== null;
  const answeredCount = () => session.questionIds.filter(id => session.answers[id]?.confirmed).length;
  // Nomes usados pela tela de resultado (mantida da versão anterior).
  const confirmedCount = answeredCount;
  const paused = () => !running();
  const panelOpen = false;

  function persist(next) {
    session = next;
    if (readOnly) return;
    const list = account().practiceSessions;
    const index = list.findIndex(s => s.id === next.id);
    if (index >= 0) list[index] = next; else list.push(next);
    save();
  }

  /* ---------------------------------------------------------------- */
  /* Abrir, sair e cronômetro                                          */
  /* ---------------------------------------------------------------- */

  function open(value, { onComplete } = {}) {
    if (!value) return;
    if (onComplete) completionHandlers.set(value.id, onComplete);
    readOnly = false;
    resultKicker = 'RESULTADO DA LISTA';
    resultSimulation = null;
    session = value.status === 'completed' ? value : E.practice.recover(value, Date.now());
    persist(session);
    view = session.status === 'completed' ? 'result' : 'question';
    welcomeBack = session.status === 'in_progress' && !running() && session.clock.elapsedMs > 0;
    showExplanation = true;
    drawer = false;
    confirmFinish = false;
    lightbox = null;
    lastCurrent = null;
    root.hidden = false;
    document.body.classList.add('focus-open');
    paintAll();
    root.focus({ preventScroll: true });
    startTick();
  }

  /** Mostra só o resultado de uma sessão que não é lista (ex.: simulado), sem salvar nada. */
  function openResult(value, { kicker = 'RESULTADO', review = false, simulation = null } = {}) {
    if (!value) return;
    readOnly = true;
    resultKicker = kicker;
    resultSimulation = simulation;
    session = value;
    view = 'result';
    root.hidden = false;
    document.body.classList.add('focus-open');
    paintAll();
    root.focus({ preventScroll: true });
    if (review) root.querySelector('.rs-review')?.scrollIntoView({ block: 'start' });
  }

  function exit() {
    stopTick();
    if (!readOnly && session?.status === 'in_progress') persist(E.practice.pause(session, Date.now()));
    session = null;
    readOnly = false;
    root.hidden = true;
    root.innerHTML = '';
    root.className = 'focus-screen';
    document.body.classList.remove('focus-open');
    onExit();
  }

  function startTick() {
    stopTick();
    beats = 0;
    tick = setInterval(() => {
      if (!session || view !== 'question' || session.status !== 'in_progress' || !running()) return;
      const el = $('#qs-clock');
      if (el) el.textContent = clockText(E.clockElapsed(session.clock, Date.now()));
      if (++beats % 15 === 0) persist(E.practice.heartbeat(session, Date.now()));
    }, 1000);
  }
  function stopTick() { clearInterval(tick); tick = null; }
  addEventListener('pagehide', () => { if (!readOnly && session?.status === 'in_progress') persist(E.practice.pause(session, Date.now())); });

  /* ---------------------------------------------------------------- */
  /* Estrutura                                                         */
  /* ---------------------------------------------------------------- */

  function paintAll() {
    if (!session) return;
    if (view === 'result') {
      // Resultado no layout do front anterior (PracticeResultPage.tsx).
      root.className = 'focus-screen rs-screen';
      root.innerHTML = `<header class="rs-top"><button type="button" class="lg-icon-btn" id="rs-exit" aria-label="Fechar resultado" title="Fechar">${icons('x')}</button><p>${resultKicker === 'RESULTADO DA LISTA' ? 'Resultado da lista' : 'Resultado do simulado'}</p></header><div class="legacy-ui rs-body">${legacyResultHTML(E, session, { simulation: resultSimulation })}</div>`;
      root.querySelector('#rs-exit').onclick = exit;
      const sim = resultSimulation;
      bindResultPage(root, E, session, {
        retry: () => (sim ? retryWrongFromSimulation() : retryWrong()),
        newList: () => { exit(); sim ? onNewSimulation() : onNewList(); },
        home: () => { exit(); onHome(); },
        history: () => { exit(); onHistory(); },
        backToList: () => { view = 'question'; paintAll(); startTick(); },
        saveNote: el => saveToNotes(sim ? { kind: 'simulation', id: sim.id } : { kind: 'practice', id: session.id }, el),
        reviewTopic: topicId => { exit(); reviewTopic(topicId); },
      });
      return;
    }
    root.className = 'focus-screen qs-screen';
    root.innerHTML = `
      <header class="qs-top">
        <div class="qs-top-row">
          <button class="qs-back" id="qs-exit" aria-label="Sair da lista (o progresso fica salvo)">${icons('arrow-left')}${LOGO}</button>
          <div class="qs-title"><p class="qs-title-main" id="qs-title"></p><p class="qs-title-sub" id="qs-sub"></p></div>
          <div class="qs-tools">
            <div id="qs-timer-slot"></div>
            <button class="qs-icon qs-hide-sm" id="qs-eye"></button>
            <button class="qs-icon" id="qs-pause"></button>
            <button class="qs-icon qs-hide-narrow" id="qs-focus"></button>
            <button class="qs-icon qs-only-narrow" id="qs-drawer" aria-label="Painel da lista" title="Painel da lista">${icons('columns')}</button>
            <button class="qs-btn qs-btn-secondary qs-btn-sm" id="qs-finish" aria-label="Finalizar lista">${icons('flag')}<span class="qs-finish-label">Finalizar</span></button>
          </div>
        </div>
        <div class="qs-line"><div class="qs-line-fill" id="qs-line-fill"></div></div>
      </header>
      <div class="qs-body" id="qs-body">
        <main class="qs-main" id="qs-main">
          <div id="qs-stage"></div>
          <div class="qs-actions" id="qs-actions"></div>
          <div id="qs-pause-layer"></div>
        </main>
        <div class="qs-scrim" id="qs-scrim" aria-hidden="true"></div>
        <aside class="qs-panel" id="qs-panel" aria-label="Painel da lista"><div class="qs-panel-inner" id="qs-panel-inner"></div></aside>
      </div>
      <div id="qs-modal-layer"></div>`;
    $('#qs-exit').onclick = exit;
    $('#qs-eye').onclick = () => { persist(E.practice.setTimerVisible(session, !session.timerVisible)); renderHeader(); };
    $('#qs-pause').onclick = () => (running() ? pause() : resume());
    $('#qs-focus').onclick = toggleFocus;
    $('#qs-drawer').onclick = () => { drawer = !drawer; renderPanelVisibility(); };
    $('#qs-scrim').onclick = () => { drawer = false; renderPanelVisibility(); };
    $('#qs-finish').onclick = () => openFinish();
    renderHeader();
    renderQuestion(0, { enter: false });
    renderActions();
    renderPanel();
    renderPanelVisibility(true);
    renderPause(false);
  }

  /* ---------------------------------------------------------------- */
  /* Cabeçalho                                                         */
  /* ---------------------------------------------------------------- */

  function renderHeader() {
    const total = session.questionIds.length;
    const done = answeredCount();
    $('#qs-title').textContent = session.title;
    $('#qs-sub').textContent = `Questão ${session.currentIndex + 1} de ${total} · ${done} respondidas`;
    const isRunning = running();
    const elapsed = clockText(E.clockElapsed(session.clock, Date.now()));
    $('#qs-timer-slot').innerHTML = session.timerVisible
      ? `<div class="qs-timer ${isRunning ? '' : 'is-paused'}">${icons('clock')}<span id="qs-clock" aria-label="Tempo: ${elapsed}">${elapsed}</span>${isRunning ? '' : '<span class="qs-timer-paused">pausado</span>'}</div>`
      : '';
    const eye = $('#qs-eye');
    eye.innerHTML = icons(session.timerVisible ? 'eye-off' : 'eye');
    eye.setAttribute('aria-label', session.timerVisible ? 'Ocultar cronômetro' : 'Mostrar cronômetro');
    eye.title = eye.getAttribute('aria-label');
    const p = $('#qs-pause');
    p.innerHTML = icons(isRunning ? 'pause' : 'play');
    p.classList.toggle('is-active', !isRunning);
    p.setAttribute('aria-label', isRunning ? 'Pausar (P)' : 'Retomar (P)');
    p.title = p.getAttribute('aria-label');
    const f = $('#qs-focus');
    f.innerHTML = icons('focus');
    f.classList.toggle('is-active', focusMode);
    f.setAttribute('aria-label', focusMode ? 'Sair do modo leitura (F)' : 'Modo leitura concentrada (F)');
    f.title = f.getAttribute('aria-label');
    $('#qs-drawer').classList.toggle('is-active', drawer);
    $('#qs-drawer').setAttribute('aria-expanded', String(drawer));
    $('#qs-line-fill').style.transform = `scaleX(${total ? done / total : 0})`;
  }

  /* ---------------------------------------------------------------- */
  /* Questão                                                           */
  /* ---------------------------------------------------------------- */

  function metaHTML(q) {
    const subject = E.SUBJECT_BY_ID[q.subjectId];
    const topic = E.TOPIC_BY_ID[q.topicId];
    const sub = q.subtopicId ? topic?.subtopics?.find(s => s.id === q.subtopicId)?.name : null;
    return `<div class="qs-meta">
      <span class="qs-num">${session.currentIndex + 1}.</span>
      <span class="qs-badge is-area" style="--area-ink:var(--${q.areaId}-ink);--area-bg:var(--${q.areaId}-bg)">${icons(SUBJECT_ICON[q.subjectId] || 'book')}${esc(subject.name)}</span>
      <span class="qs-badge">${esc(topic?.name ?? '')}${sub ? ` · ${esc(sub)}` : ''}</span>
      <span class="qs-badge is-outline is-sm qs-push">Questão demonstrativa · ref. ${q.year}</span>
      <span class="qs-badge is-outline is-sm">${DIFFICULTY[q.difficulty] ?? ''}</span>
    </div>`;
  }

  function bodyHTML(q) {
    return `<div class="qs-text ${focusMode ? 'is-large' : ''}">
      ${q.support ? `<div class="qs-support">${q.support.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}${q.support.credit ? `<p class="qs-credit">${esc(q.support.credit)}</p>` : ''}</div>` : ''}
      ${q.image ? `<figure class="qs-figure"><button type="button" class="qs-figure-btn" id="qs-zoom" aria-label="Ampliar imagem: ${esc(q.image.alt)}"><img src="${esc(q.image.src)}" alt="${esc(q.image.alt)}" width="${q.image.width}" height="${q.image.height}"><span class="qs-figure-hint">${icons('expand')}Ampliar</span></button>${q.image.caption ? `<figcaption>${esc(q.image.caption)}</figcaption>` : ''}</figure>` : ''}
      <p class="qs-prompt">${esc(q.prompt)}</p>
    </div>`;
  }

  function renderQuestion(dir, { enter = true } = {}) {
    const q = current();
    const stage = $('#qs-stage');
    stage.innerHTML = `<article class="qs-article" id="qs-article" aria-live="polite">
      <div class="qs-card ${focusMode ? 'is-large' : ''}">
        ${focusMode ? '' : metaHTML(q)}
        <div class="${focusMode ? '' : 'qs-gap'}">${bodyHTML(q)}</div>
        <div class="qs-alts" role="radiogroup" aria-label="Alternativas">${q.alternatives.map(a => `<button type="button" class="qs-alt ${focusMode ? 'is-large' : ''}" role="radio" data-letter="${a.letter}"><span class="qs-alt-letter"><span class="qs-alt-glyph">${a.letter}</span></span><span class="qs-alt-text">${esc(a.text)}</span><span class="qs-alt-tag" id="alt-state-${a.letter}"></span></button>`).join('')}</div>
      </div>
      <div id="qs-feedback"></div>
    </article>`;
    $$('.qs-alt').forEach(b => b.onclick = () => select(b.dataset.letter));
    const zoom = $('#qs-zoom');
    if (zoom) zoom.onclick = () => openLightbox(q.image);
    updateAlts({ initial: true });
    renderFeedback(false);
    const article = $('#qs-article');
    if (enter && dir) animate(article, [{ opacity: 0, transform: `translateX(${dir * 48}px)` }, { opacity: 1, transform: 'none' }], { duration: 360, easing: EASE.emphasized });
    if (enter) {
      // Alternativas entram em cascata (40 ms entre elas), como no AlternativeList antigo.
      const a = session.answers[q.id];
      if (!a?.confirmed) $$('.qs-alt').forEach((el, i) => animate(el, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: 40 * i, easing: SPRING.soft }));
    }
  }

  /** Estado visual das alternativas (idle, selecionada, correta, errada) sem recriar o enunciado. */
  function updateAlts({ initial = false, reveal = false } = {}) {
    const q = current();
    const a = session.answers[q.id];
    const revealed = !!a?.confirmed;
    const disabled = revealed || !running();
    $$('.qs-alt').forEach(btn => {
      const letter = btn.dataset.letter;
      const isSel = a?.selected === letter;
      const isCorrect = revealed && letter === q.correct;
      const isWrong = revealed && isSel && !isCorrect;
      const dim = revealed && !isCorrect && !isWrong;
      const state = isCorrect ? 'correct' : isWrong ? 'wrong' : isSel ? 'selected' : 'idle';
      const prev = btn.dataset.state;
      btn.dataset.state = state;
      btn.classList.toggle('is-dim', dim);
      btn.disabled = disabled;
      btn.setAttribute('aria-checked', String(isSel));
      if (isCorrect) btn.setAttribute('aria-describedby', `alt-state-${letter}`); else btn.removeAttribute('aria-describedby');
      const glyph = btn.querySelector('.qs-alt-glyph');
      const glyphKey = state === 'correct' ? 'c' : state === 'wrong' ? 'w' : 'l';
      if (glyph.dataset.key !== glyphKey) {
        glyph.dataset.key = glyphKey;
        glyph.innerHTML = state === 'correct' ? icons('check') : state === 'wrong' ? icons('x') : letter;
        if (!initial) animate(glyph, [{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 260, easing: SPRING.snappy });
      }
      const tag = btn.querySelector('.qs-alt-tag');
      const tagText = isCorrect ? (isSel ? 'Sua resposta · correta' : 'Correta') : isWrong ? 'Sua resposta' : '';
      tag.textContent = tagText;
      tag.className = `qs-alt-tag ${isCorrect ? 'is-correct' : isWrong ? 'is-wrong' : ''}`;
      if (reveal && isCorrect) animate(btn, [{ transform: 'scale(1)' }, { transform: 'scale(1.035)' }, { transform: 'scale(1)' }], { duration: 380, easing: EASE.out, fill: 'none' });
      if (!initial && prev !== state && !reveal) { /* troca de borda/fundo é transição de CSS (200 ms) */ }
    });
  }

  function renderFeedback(animateIn) {
    const q = current();
    const a = session.answers[q.id];
    const box = $('#qs-feedback');
    if (!a?.confirmed) { box.innerHTML = ''; return; }
    box.innerHTML = `<div class="qs-feedback ${a.correct ? 'is-correct' : 'is-wrong'}" id="qs-feedback-card">
      <div class="qs-feedback-head">
        <span class="qs-feedback-icon">${icons(a.correct ? 'check-circle' : 'x-circle')}</span>
        <div class="qs-feedback-copy"><p class="qs-feedback-title">${a.correct ? 'Resposta correta!' : 'Resposta incorreta'}</p><p class="qs-feedback-text">${a.correct ? 'Muito bem. Confira a explicação para fixar o raciocínio.' : `A alternativa correta é a ${q.correct}. Veja a explicação abaixo.`}</p></div>
        <button type="button" class="qs-explain-toggle" id="qs-explain" aria-expanded="${showExplanation}">${icons('lightbulb')} <span>${showExplanation ? 'Ocultar explicação' : 'Ver explicação'}</span></button>
      </div>
      <div class="qs-collapse ${showExplanation ? 'is-open' : ''}" id="qs-collapse"><div class="qs-collapse-inner"><div class="qs-explanation">
        <p class="qs-explanation-text">${esc(q.explanation)}</p>
        <p class="qs-skill">${icons('spark')}<span><strong>Habilidade avaliada:</strong> ${esc(q.skill)}</span></p>
      </div></div></div>
    </div>`;
    $('#qs-explain').onclick = () => {
      showExplanation = !showExplanation;
      $('#qs-collapse').classList.toggle('is-open', showExplanation);
      $('#qs-explain').setAttribute('aria-expanded', String(showExplanation));
      $('#qs-explain span').textContent = showExplanation ? 'Ocultar explicação' : 'Ver explicação';
    };
    if (animateIn) {
      const card = $('#qs-feedback-card');
      animate(card, [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: SPRING.soft }).then(() => {
        if (!a.correct) animate(card, [0, -7, 6, -4, 3, 0].map(x => ({ transform: `translateX(${x}px)` })), { duration: 420, easing: EASE.out, fill: 'none' });
      });
      animate($('.qs-feedback-icon'), [{ transform: 'scale(0) rotate(-30deg)' }, { transform: 'scale(1) rotate(0)' }], { duration: 480, easing: SPRING.bouncy });
    }
  }

  /* ---------------------------------------------------------------- */
  /* Ações                                                             */
  /* ---------------------------------------------------------------- */

  function renderActions() {
    const q = current();
    const a = session.answers[q.id];
    const total = session.questionIds.length;
    const done = answeredCount();
    const isLast = session.currentIndex === total - 1;
    const allDone = done === total;
    $('#qs-actions').innerHTML = `
      <button type="button" class="qs-btn qs-btn-ghost" id="qs-prev" ${session.currentIndex === 0 ? 'disabled' : ''}>${icons('chevron-left')}Anterior</button>
      <div class="qs-actions-right">${!a?.confirmed
        ? `<button type="button" class="qs-btn qs-btn-ghost" id="qs-skip">${icons('skip')}Pular</button>
           <button type="button" class="qs-btn qs-btn-primary qs-btn-lg" id="qs-confirm" ${!a?.selected || !running() ? 'disabled' : ''}>${icons('check-circle')}Confirmar resposta</button>`
        : `<button type="button" class="qs-btn qs-btn-secondary" id="qs-similar">${icons('spark')}Semelhante</button>
           <button type="button" class="qs-btn qs-btn-secondary" id="qs-random">${icons('shuffle')}Aleatória</button>
           <button type="button" class="qs-btn ${allDone ? 'qs-btn-accent' : 'qs-btn-primary'} qs-btn-lg" id="qs-next">${allDone ? 'Ver resultado' : isLast ? 'Próxima pendente' : 'Próxima questão'}${icons(allDone ? 'flag' : 'arrow')}</button>`}
      </div>`;
    const on = (id, fn) => { const el = $(id); if (el) el.onclick = fn; };
    on('#qs-prev', () => go(session.currentIndex - 1));
    on('#qs-skip', () => (isLast ? next() : go(session.currentIndex + 1)));
    on('#qs-confirm', confirm);
    on('#qs-similar', () => addSimilar('similar'));
    on('#qs-random', () => addSimilar('random'));
    on('#qs-next', next);
  }

  /* ---------------------------------------------------------------- */
  /* Painel                                                            */
  /* ---------------------------------------------------------------- */

  function renderPanel(animatedToggle) {
    const total = session.questionIds.length;
    const done = answeredCount();
    const correctSoFar = session.questionIds.filter(id => session.answers[id]?.correct).length;
    const qid = session.questionIds[session.currentIndex];
    const marked = account().reviewMarks.includes(qid);
    const favorite = account().favorites.includes(qid);
    const cells = session.questionIds.map((id, i) => {
      const a = session.answers[id];
      const isMarked = account().reviewMarks.includes(id);
      const st = a?.confirmed ? (a.correct ? 'is-correct' : 'is-wrong') : '';
      const label = `Questão ${i + 1}: ${a?.confirmed ? (a.correct ? 'acertou' : 'errou') : 'não respondida'}${isMarked ? ', marcada para revisão' : ''}`;
      return `<button type="button" class="qs-cell ${st}" data-go="${i}" aria-label="${label}" ${i === session.currentIndex ? 'aria-current="step"' : ''}>${i + 1}${isMarked ? '<span class="qs-cell-dot"></span>' : ''}</button>`;
    }).join('');
    $('#qs-panel-inner').innerHTML = `
      <div class="qs-panel-card">
        <div class="qs-panel-head"><p>Navegação</p><span class="qs-badge is-sage is-sm">${correctSoFar}/${done} acertos</span></div>
        <div class="qs-grid" id="qs-grid">${cells}<span class="qs-grid-ring" id="qs-grid-ring" aria-hidden="true"></span></div>
        <div class="qs-legend"><span><i class="is-correct"></i> Acerto</span><span><i class="is-wrong"></i> Erro</span><span><i class="is-mark"></i> Revisar</span></div>
      </div>
      <div class="qs-panel-card qs-toggles">
        <button type="button" class="qs-toggle ${marked ? 'is-on' : ''}" id="qs-mark" aria-pressed="${marked}"><span class="qs-toggle-icon">${icons(marked ? 'bookmark-check' : 'bookmark')}</span><span class="qs-toggle-label">${marked ? 'Marcada para revisão' : 'Marcar para revisão'}</span><kbd>M</kbd></button>
        <button type="button" class="qs-toggle ${favorite ? 'is-on' : ''}" id="qs-fav" aria-pressed="${favorite}"><span class="qs-toggle-icon">${icons('star')}</span><span class="qs-toggle-label">${favorite ? 'Nas favoritas' : 'Favoritar questão'}</span></button>
      </div>
      <div class="qs-panel-card qs-shortcuts">
        <p>Atalhos</p>
        <ul>
          <li><span>Escolher alternativa</span><span class="qs-keys"><kbd>A</kbd>–<kbd>E</kbd></span></li>
          <li><span>Confirmar / avançar</span><kbd>Enter</kbd></li>
          <li><span>Navegar</span><span class="qs-keys"><kbd aria-label="seta para a esquerda">${icons('arrow-left')}</kbd><kbd aria-label="seta para a direita">${icons('arrow')}</kbd></span></li>
          <li><span>Pausar</span><kbd>P</kbd></li>
        </ul>
      </div>`;
    $$('[data-go]').forEach(b => b.onclick = () => go(Number(b.dataset.go)));
    $('#qs-mark').onclick = toggleMark;
    $('#qs-fav').onclick = toggleFavorite;
    if (animatedToggle) animate($(`#${animatedToggle} .qs-toggle-icon`), [{ transform: 'scale(.6) rotate(-20deg)' }, { transform: 'none' }], { duration: 480, easing: SPRING.bouncy });
    placeRing();
  }

  /** Anel da questão atual: desliza de uma célula para a outra (layoutId "practice-current"). */
  function placeRing() {
    const grid = $('#qs-grid'), ring = $('#qs-grid-ring');
    if (!grid || !ring) return;
    const cellAt = i => grid.querySelector(`[data-go="${i}"]`);
    const to = cellAt(session.currentIndex);
    if (!to) return;
    const pos = el => `translate(${el.offsetLeft}px, ${el.offsetTop}px)`;
    ring.style.width = `${to.offsetWidth}px`;
    ring.style.height = `${to.offsetHeight}px`;
    const from = lastCurrent !== null ? cellAt(lastCurrent) : null;
    ring.style.transition = 'none';
    ring.style.transform = pos(from || to);
    void ring.offsetWidth;
    ring.style.transition = '';
    ring.style.transform = pos(to);
    lastCurrent = session.currentIndex;
  }

  function renderPanelVisibility(initial = false) {
    const panel = $('#qs-panel'), scrim = $('#qs-scrim');
    const isNarrow = narrow();
    const show = isNarrow ? drawer : !focusMode;
    root.classList.toggle('qs-narrow', isNarrow);
    panel.classList.toggle('is-hidden', !show);
    scrim.classList.toggle('is-visible', isNarrow && show);
    root.classList.toggle('qs-focus-mode', focusMode);
    if (initial) panel.classList.add('no-anim'), requestAnimationFrame(() => panel.classList.remove('no-anim'));
    $('#qs-drawer')?.classList.toggle('is-active', drawer);
    $('#qs-drawer')?.setAttribute('aria-expanded', String(drawer));
    if (show) requestAnimationFrame(placeRing);
  }
  addEventListener('resize', () => { if (!root.hidden && view === 'question' && session) renderPanelVisibility(); });

  /* ---------------------------------------------------------------- */
  /* Pausa                                                             */
  /* ---------------------------------------------------------------- */

  function renderPause(animateChange = true) {
    const layer = $('#qs-pause-layer');
    const show = !running() && session.status !== 'completed';
    const isShown = !!layer.firstElementChild;
    if (show) {
      const total = session.questionIds.length;
      layer.innerHTML = `<div class="qs-pause" id="qs-pause-scrim"><div class="qs-pause-card" role="dialog" aria-modal="true" aria-labelledby="qs-pause-title">
        <span class="qs-tile is-gold">${icons(welcomeBack ? 'play' : 'pause')}</span>
        <h2 id="qs-pause-title">${welcomeBack ? 'Bem-vindo de volta!' : 'Lista pausada'}</h2>
        <p>${welcomeBack ? `Seu progresso foi salvo: ${answeredCount()} de ${total} respondidas em ${clockText(E.clockElapsed(session.clock, Date.now()))}.` : 'O cronômetro está parado e a questão fica oculta até você retomar.'}</p>
        <button type="button" class="qs-btn qs-btn-accent qs-btn-lg qs-btn-full" id="qs-resume">${icons('play')}${welcomeBack ? 'Continuar lista' : 'Retomar'}</button>
      </div></div>`;
      $('#qs-resume').onclick = resume;
      if (!isShown && animateChange) {
        animate($('#qs-pause-scrim'), [{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: EASE.out });
        animate($('.qs-pause-card'), [{ transform: 'translateY(20px) scale(.96)' }, { transform: 'none' }], { duration: 450, easing: SPRING.soft });
      }
      requestAnimationFrame(() => $('#qs-resume')?.focus({ preventScroll: true }));
    } else if (isShown) {
      const scrim = $('#qs-pause-scrim');
      Promise.all([
        animate(scrim, [{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: EASE.in, fill: 'forwards' }),
        animate($('.qs-pause-card'), [{ transform: 'none', opacity: 1 }, { transform: 'translateY(10px)', opacity: 0 }], { duration: 200, easing: EASE.in, fill: 'forwards' }),
      ]).then(() => { if (running()) layer.innerHTML = ''; });
    }
  }

  /* ---------------------------------------------------------------- */
  /* Modais: finalizar e imagem ampliada                               */
  /* ---------------------------------------------------------------- */

  function showModal(html, onBind) {
    const layer = $('#qs-modal-layer');
    layer.innerHTML = `<div class="qs-modal-scrim" id="qs-modal-scrim">${html}</div>`;
    onBind?.();
    animate($('#qs-modal-scrim'), [{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: EASE.out });
    animate($('.qs-modal'), [{ opacity: 0, transform: 'translateY(8px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 280, easing: EASE.out });
    $('#qs-modal-scrim').addEventListener('mousedown', e => { if (e.target.id === 'qs-modal-scrim') closeModal(); });
  }
  function closeModal() {
    const layer = $('#qs-modal-layer');
    if (!layer?.firstElementChild) return Promise.resolve();
    confirmFinish = false; lightbox = null;
    return Promise.all([
      animate($('#qs-modal-scrim'), [{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: EASE.in, fill: 'forwards' }),
      animate($('.qs-modal'), [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(4px) scale(.98)' }], { duration: 160, easing: EASE.in, fill: 'forwards' }),
    ]).then(() => { layer.innerHTML = ''; });
  }

  function openFinish() {
    confirmFinish = true;
    const total = session.questionIds.length;
    const done = answeredCount();
    showModal(`<div class="qs-modal" role="alertdialog" aria-modal="true" aria-labelledby="qs-finish-title" aria-describedby="qs-finish-text">
      <span class="qs-tile is-gold">${icons('flag')}</span>
      <h2 id="qs-finish-title">Finalizar a lista?</h2>
      <p id="qs-finish-text">${done < total ? `Você respondeu ${done} de ${total} questões. As ${total - done} restantes aparecerão como não respondidas no resultado.` : 'Todas as questões foram respondidas. Vamos ver seu resultado!'}</p>
      <div class="qs-modal-actions"><button type="button" class="qs-btn qs-btn-ghost" id="qs-finish-cancel">Continuar respondendo</button><button type="button" class="qs-btn qs-btn-primary" id="qs-finish-ok">Finalizar e ver resultado</button></div>
    </div>`, () => {
      $('#qs-finish-cancel').onclick = () => closeModal();
      $('#qs-finish-ok').onclick = () => closeModal().then(finish);
      requestAnimationFrame(() => $('#qs-finish-ok')?.focus());
    });
  }

  function openLightbox(image) {
    lightbox = { scale: 1, x: 0, y: 0 };
    showModal(`<div class="qs-modal qs-modal-xl" role="dialog" aria-modal="true" aria-labelledby="qs-lb-title">
      <div class="qs-modal-head"><div><h2 id="qs-lb-title">Imagem da questão</h2>${image.caption ? `<p>${esc(image.caption)}</p>` : ''}</div><button type="button" class="qs-icon" id="qs-lb-close" aria-label="Fechar">${icons('x')}</button></div>
      <div class="qs-lb-stage" id="qs-lb-stage"><img src="${esc(image.src)}" alt="${esc(image.alt)}" id="qs-lb-img" draggable="false">
        <div class="qs-lb-zoom"><button type="button" id="qs-lb-out" aria-label="Diminuir zoom" disabled>${icons('minus')}</button><span id="qs-lb-pct">100%</span><button type="button" id="qs-lb-in" aria-label="Aumentar zoom">${icons('plus')}</button></div>
      </div>
      <p class="qs-lb-alt">${esc(image.alt)}</p>
    </div>`, () => {
      const img = $('#qs-lb-img');
      const apply = () => {
        img.style.transform = `translate(${lightbox.x}px, ${lightbox.y}px) scale(${lightbox.scale})`;
        img.style.cursor = lightbox.scale > 1 ? 'grab' : '';
        $('#qs-lb-pct').textContent = `${Math.round(lightbox.scale * 100)}%`;
        $('#qs-lb-out').disabled = lightbox.scale <= 1;
        $('#qs-lb-in').disabled = lightbox.scale >= 3;
      };
      $('#qs-lb-in').onclick = () => { lightbox.scale = Math.min(3, lightbox.scale + .5); apply(); };
      $('#qs-lb-out').onclick = () => { lightbox.scale = Math.max(1, lightbox.scale - .5); if (lightbox.scale === 1) lightbox.x = lightbox.y = 0; apply(); };
      $('#qs-lb-close').onclick = () => closeModal();
      // Arrastar a imagem quando ampliada.
      let drag = null;
      img.addEventListener('pointerdown', e => { if (lightbox.scale <= 1) return; drag = { x: e.clientX - lightbox.x, y: e.clientY - lightbox.y }; img.setPointerCapture(e.pointerId); img.style.cursor = 'grabbing'; });
      img.addEventListener('pointermove', e => { if (!drag) return; lightbox.x = Math.max(-300, Math.min(300, e.clientX - drag.x)); lightbox.y = Math.max(-200, Math.min(200, e.clientY - drag.y)); apply(); });
      img.addEventListener('pointerup', () => { drag = null; apply(); });
      apply();
    });
  }

  /* ---------------------------------------------------------------- */
  /* Ações da sessão                                                   */
  /* ---------------------------------------------------------------- */

  function go(target) {
    if (!session || target < 0 || target >= session.questionIds.length || target === session.currentIndex) return;
    const dir = target > session.currentIndex ? 1 : -1;
    showExplanation = true;
    persist(E.practice.goTo(session, target, Date.now()));
    const token = ++navToken;
    renderHeader();
    renderActions();
    renderPanel();
    const article = $('#qs-article');
    // Saída (dir * -36 px, 220 ms) e depois entrada (dir * 48 px, 360 ms), como o directionalSlide.
    animate(article, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${dir * -36}px)` }], { duration: 220, easing: EASE.in, fill: 'forwards' })
      .then(() => { if (token === navToken && session) renderQuestion(dir); });
  }

  function select(letter) {
    if (!session || !running()) return;
    const a = session.answers[current().id];
    if (a?.confirmed) return;
    persist(E.practice.select(session, letter, Date.now()));
    updateAlts();
    renderActions();
  }

  function confirm() {
    if (!session || !running()) return;
    const a = session.answers[current().id];
    if (!a?.selected || a.confirmed) return;
    persist(E.practice.confirm(session, Date.now()));
    showExplanation = true;
    updateAlts({ reveal: true });
    renderFeedback(true);
    renderActions();
    renderHeader();
    renderPanel();
  }

  function next() {
    const total = session.questionIds.length;
    const i = session.currentIndex;
    const done = answeredCount();
    const pending = session.questionIds.findIndex(id => !session.answers[id]?.confirmed);
    if (i < total - 1) go(i + 1);
    else if (done === total) finish();
    else if (pending >= 0) go(pending);
    else openFinish();
  }

  function pause() {
    persist(E.practice.pause(session, Date.now()));
    renderHeader(); updateAlts(); renderActions(); renderPause();
  }
  function resume() {
    welcomeBack = false;
    persist(E.practice.resume(session, Date.now()));
    renderHeader(); updateAlts(); renderActions(); renderPause();
  }

  function toggleFocus() {
    focusMode = !focusMode;
    renderHeader();
    renderQuestion(0, { enter: false });
    renderPanelVisibility();
  }

  function toggleMark() {
    const qid = current().id;
    const list = account().reviewMarks;
    const i = list.indexOf(qid);
    if (i >= 0) list.splice(i, 1); else list.push(qid);
    save();
    renderPanel('qs-mark');
    toast(i >= 0 ? 'Marcação removida' : 'Marcada para revisão. Encontre-a em Histórico › Para revisar.');
  }

  function toggleFavorite() {
    const qid = current().id;
    const list = account().favorites;
    const i = list.indexOf(qid);
    if (i >= 0) list.splice(i, 1); else list.push(qid);
    save();
    renderPanel('qs-fav');
    if (i < 0) toast('Adicionada às favoritas');
  }

  function addSimilar(kind) {
    const q = current();
    const used = new Set(session.questionIds);
    const fresh = list => list.filter(item => !used.has(item.id));
    let pool = fresh(E.questionRepository.query(kind === 'similar' ? { topicIds: [q.topicId] } : { subjectId: q.subjectId }));
    if (kind === 'similar' && !pool.length) pool = fresh(E.questionRepository.query({ subjectId: q.subjectId }));
    if (!pool.length) { toast('Sem novas questões: você já incluiu todas as questões disponíveis deste assunto.'); return; }
    const seen = new Set(E.collectAnswerRecords(account()).map(r => r.questionId));
    const unseen = pool.filter(item => !seen.has(item.id));
    const from = unseen.length ? unseen : pool;
    const pick = from[Math.floor(Math.random() * from.length)];
    const before = session.currentIndex;
    persist(E.practice.insertNext(session, pick.id, Date.now()));
    showExplanation = true;
    lastCurrent = before;
    const token = ++navToken;
    renderHeader(); renderActions(); renderPanel();
    animate($('#qs-article'), [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(-36px)' }], { duration: 220, easing: EASE.in, fill: 'forwards' })
      .then(() => { if (token === navToken && session) renderQuestion(1); });
    toast(kind === 'similar' ? 'Questão semelhante adicionada. Ela entrou logo após a atual na sua lista.' : 'Nova questão adicionada. Ela entrou logo após a atual na sua lista.');
  }

  function finish() {
    persist(E.practice.finish(session, Date.now()));
    stopTick();
    view = 'result';
    paintAll();
    root.scrollTo({ top: 0 });
    const handler = completionHandlers.get(session.id);
    if (handler) { completionHandlers.delete(session.id); handler(session); }
  }

  /** Refazer erros de um simulado: vira uma lista comum (com correção imediata). */
  function retryWrongFromSimulation() {
    const wrong = session.questionIds.filter(id => session.answers[id]?.confirmed && !session.answers[id].correct);
    if (!wrong.length) return;
    const created = E.createPracticeSession({ title: `Refazer erros · ${session.title}`, questionIds: wrong, mode: 'retry', filters: { ...E.EMPTY_FILTERS, count: wrong.length }, timerVisible: true, now: Date.now() });
    account().practiceSessions.push(created);
    save();
    open(created);
  }
  function retryWrong() {
    const wrong = session.questionIds.filter(id => session.answers[id]?.confirmed && !session.answers[id].correct);
    if (!wrong.length) return;
    const created = E.createPracticeSession({ title: `Refazer erros · ${session.title}`, questionIds: wrong, mode: 'retry', filters: session.filters, timerVisible: session.timerVisible, now: Date.now() });
    account().practiceSessions.push(created);
    save();
    open(created);
  }

  /* ---------------------------------------------------------------- */
  /* Resultado (mantido da versão anterior)                            */
  /* ---------------------------------------------------------------- */

  function statusOf(id) {
    const a = session.answers[id];
    if (a?.confirmed) return a.correct ? 'acertou' : 'errou';
    if (a?.selected) return 'marcada';
    return 'pendente';
  }

  function headerHTML() {
    const total = session.questionIds.length;
    const done = confirmedCount();
    const result = view === 'result';
    return `<header class="focus-top">
      <button class="focus-icon-button" id="focus-exit" aria-label="Sair da lista (o progresso fica salvo)" data-tip="Sair">${icons('x')}</button>
      <div class="focus-heading">
        <span class="focus-kicker">${result ? resultKicker : 'LISTA DE QUESTÕES'}</span>
        <h1 id="focus-title">${esc(session.title)}</h1>
      </div>
      ${result ? '' : `<div class="focus-progress" aria-label="${done} de ${total} questões respondidas">
        <span><strong>${done}</strong> de ${total} respondidas</span>
        <div class="focus-progress-track"><div style="width:${total ? (done / total) * 100 : 0}%"></div></div>
      </div>
      <div class="focus-tools">
        ${session.timerVisible ? `<span class="focus-clock" aria-label="Tempo de estudo">${icons('clock')}<span id="focus-clock">${clockText(E.clockElapsed(session.clock, Date.now()))}</span></span>` : ''}
        <button class="focus-ghost" id="focus-timer" aria-pressed="${session.timerVisible}">${session.timerVisible ? 'Ocultar tempo' : 'Mostrar tempo'}</button>
        <button class="focus-ghost" id="focus-pause">${icons(paused() ? 'arrow' : 'focus')}<span>${paused() ? 'Retomar' : 'Pausar'}</span></button>
        <button class="focus-ghost focus-panel-toggle" id="focus-panel-toggle" aria-expanded="${panelOpen}" aria-controls="focus-panel">${icons('grid')}<span>Painel</span></button>
      </div>
      <button class="focus-finish" id="focus-finish">Finalizar</button>`}
    </header>`;
  }

  function resultHTML() {
    const ids = session.questionIds;
    const answers = ids.map(id => session.answers[id]);
    const answered = answers.filter(a => a?.confirmed);
    const correct = answered.filter(a => a.correct).length;
    const wrong = answered.length - correct;
    const blank = ids.length - answered.length;
    const elapsed = E.clockElapsed(session.clock, Date.now());
    const avg = answered.length ? answered.reduce((sum, a) => sum + a.timeSpentMs, 0) / answered.length : 0;
    const accuracy = answered.length ? correct / answered.length : 0;
    const message = !answered.length ? 'Nenhuma resposta confirmada desta vez.' : accuracy >= 0.8 ? 'Excelente. Você dominou esta lista.' : accuracy >= 0.6 ? 'Bom resultado. Revise os erros para fixar.' : 'Cada erro mostra o próximo passo. Vamos revisar?';

    const byTopic = new Map();
    ids.forEach(id => {
      const q = E.questionRepository.getById(id);
      const entry = byTopic.get(q.topicId) ?? { topicId: q.topicId, areaId: q.areaId, total: 0, answered: 0, correct: 0 };
      entry.total++;
      if (session.answers[id]?.confirmed) { entry.answered++; if (session.answers[id].correct) entry.correct++; }
      byTopic.set(q.topicId, entry);
    });

    const topics = [...byTopic.values()].sort((x, y) => (x.answered ? x.correct / x.answered : -1) - (y.answered ? y.correct / y.answered : -1)).map(t => {
      const acc = t.answered ? t.correct / t.answered : 0;
      return `<li style="--area:var(--${t.areaId})"><div><strong>${esc(E.TOPIC_BY_ID[t.topicId]?.name ?? '')}</strong><span>${t.correct} de ${t.answered} certas${t.total > t.answered ? ` · ${t.total - t.answered} em branco` : ''}</span></div><div class="focus-bar" role="img" aria-label="${pct(acc)} de acerto"><div style="width:${acc * 100}%"></div></div><b>${t.answered ? pct(acc) : '—'}</b></li>`;
    }).join('');

    const review = ids.map((id, i) => {
      const q = E.questionRepository.getById(id);
      const a = session.answers[id];
      const st = statusOf(id);
      const chip = { acertou: 'Acertou', errou: 'Errou', marcada: 'Em branco', pendente: 'Em branco' }[st];
      return `<details class="focus-review is-${st}"><summary><span class="focus-review-number">${i + 1}</span><span class="focus-review-title"><strong>${esc(E.TOPIC_BY_ID[q.topicId]?.name ?? '')}</strong><small>${esc(E.SUBJECT_BY_ID[q.subjectId].name)}</small></span><span class="focus-chip is-${st}">${chip}</span>${icons('chevron')}</summary>
        <div class="focus-review-body"><p class="focus-review-prompt">${esc(q.prompt)}</p>
        <ul>${q.alternatives.map(alt => `<li class="${alt.letter === q.correct ? 'is-correct' : a?.confirmed && a.selected === alt.letter ? 'is-wrong' : ''}"><span>${alt.letter}</span>${esc(alt.text)}</li>`).join('')}</ul>
        <p class="focus-review-answer">${a?.confirmed ? `Sua resposta: <strong>${a.selected}</strong> · Gabarito: <strong>${q.correct}</strong>` : `Não respondida · Gabarito: <strong>${q.correct}</strong>`}</p>
        <p>${esc(q.explanation)}</p></div></details>`;
    }).join('');

    return `${headerHTML()}
    <main class="focus-result" id="focus-main" tabindex="-1">
      <section class="focus-result-hero">
        <div class="focus-ring" style="--value:${accuracy * 360}deg" role="img" aria-label="${pct(accuracy)} de acerto nas respondidas"><span>${answered.length ? pct(accuracy) : '—'}</span></div>
        <div><span class="focus-kicker">ACERTO NAS RESPONDIDAS</span><h2>${message}</h2><p>${esc(session.title)} · ${ids.length} ${ids.length === 1 ? 'questão' : 'questões'}. Seus gráficos e metas já incluem estas respostas.</p>
          <div class="focus-result-actions">
            ${wrong ? `<button class="focus-primary" id="result-retry">${icons('arrow')}Refazer erros (${wrong})</button>` : ''}
            <button class="${wrong ? 'focus-secondary' : 'focus-primary'}" id="result-new">Nova lista</button>
            <button class="focus-secondary" id="result-progress">${icons('chart')}Ver progresso</button>
          </div>
        </div>
      </section>
      <section class="focus-stats">
        <article><span>Acertos</span><strong>${correct}</strong></article>
        <article><span>Erros</span><strong>${wrong}</strong></article>
        <article><span>Em branco</span><strong>${blank}</strong></article>
        <article><span>Tempo total</span><strong>${duration(elapsed)}</strong><small>${answered.length ? `${duration(avg)} por questão` : ''}</small></article>
      </section>
      <div class="focus-result-grid">
        <section class="focus-result-block"><h2>Desempenho por assunto</h2><p>Do assunto que pede mais atenção para o mais firme.</p><ul class="focus-topics">${topics}</ul></section>
        <section class="focus-result-block"><h2>Revisão das questões</h2><p>Abra cada questão para ver o gabarito e a explicação.</p><div class="focus-reviews">${review}</div></section>
      </div>
    </main>`;
  }


  function bindResult() {
    const on = (selector, handler) => { const el = $(selector); if (el) el.onclick = handler; };
    on('#focus-exit', exit);
    on('#result-retry', retryWrong);
    on('#result-new', () => { exit(); onNewList(); });
    on('#result-progress', () => { exit(); onProgress(); });
  }

  /* ---------------------------------------------------------------- */
  /* Atalhos (mesmos do front anterior)                                */
  /* ---------------------------------------------------------------- */

  document.addEventListener('keydown', event => {
    if (root.hidden || !session || view !== 'question' || event.metaKey || event.ctrlKey || event.altKey) return;
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)) return;
    const key = event.key.toLowerCase();
    if (key === 'escape') {
      if (lightbox || confirmFinish) { event.preventDefault(); closeModal(); }
      else if (drawer) { event.preventDefault(); drawer = false; renderPanelVisibility(); }
      return;
    }
    if (confirmFinish || lightbox) return;
    if (/^[a-e]$/.test(key)) { event.preventDefault(); select(key.toUpperCase()); return; }
    if (key === 'enter') {
      const focused = document.activeElement;
      if (focused?.closest?.('button') && !focused.matches('.qs-alt')) return;
      event.preventDefault();
      if (session.answers[current().id]?.confirmed) next(); else confirm();
      return;
    }
    if (key === 'arrowright') { event.preventDefault(); go(session.currentIndex + 1); return; }
    if (key === 'arrowleft') { event.preventDefault(); go(session.currentIndex - 1); return; }
    if (key === 'p') { event.preventDefault(); running() ? pause() : resume(); return; }
    if (key === 'm') { event.preventDefault(); toggleMark(); return; }
    if (key === 'f') { event.preventDefault(); toggleFocus(); }
  });

  return { open, openResult, isOpen: () => !root.hidden };
}
