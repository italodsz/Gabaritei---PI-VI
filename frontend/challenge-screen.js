/**
 * Desafio de acertos ("Até onde você chega?").
 *
 * Regras:
 * - questões automáticas de qualquer área, sem repetir dentro da tentativa;
 * - 03:40 por questão (330 min ÷ 90 questões do Dia 1), sem acumular sobra;
 * - sem pular, pausar, voltar ou retomar: errar ou esgotar o tempo encerra;
 * - o prazo é um timestamp absoluto, então trocar de aba não para o relógio;
 * - recarregar ou fechar a página encerra a tentativa como abandono (registrado
 *   na próxima abertura); as questões acertadas continuam no histórico.
 */
import { animate, spring, reduced, countTo } from './motion-kit.js';
import { hi } from './legacy-ui.js';

export const CHALLENGE_LIMIT_MS = 220000; // 03:40
const STORE = 'gabaritei:desafio:v1';
const REASONS = {
  erro: { label: 'Resposta incorreta', icon: 'XCircle', text: 'Uma resposta errada encerra a sequência.' },
  tempo: { label: 'Tempo esgotado', icon: 'Hourglass', text: 'O limite de 03:40 por questão chegou ao fim.' },
  abandono: { label: 'Desafio abandonado', icon: 'ArrowLeft', text: 'Você saiu antes de terminar. Tentativas não podem ser retomadas.' },
  acervo: { label: 'Acervo esgotado', icon: 'Trophy', text: 'Você respondeu todas as questões disponíveis sem errar!' },
};
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const mmss = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
const longTime = ms => { const s = Math.round(ms / 1000); const m = Math.floor(s / 60); return m ? `${m}min ${String(s % 60).padStart(2, '0')}s` : `${s}s`; };

/** Estado salvo: recorde, tentativas anteriores e a tentativa ativa (só para registrar abandono). */
export function readChallengeStore() {
  try { const s = JSON.parse(localStorage.getItem(STORE)); if (s && Array.isArray(s.attempts)) return { best: 0, active: null, ...s }; } catch { /* vazio */ }
  return { best: 0, attempts: [], active: null };
}
const writeStore = s => { try { localStorage.setItem(STORE, JSON.stringify(s)); } catch { /* sem armazenamento */ } };

export function createChallengeScreen({ E, getAccount, save, onExit = () => {}, onNewPractice = () => {} }) {
  const root = document.createElement('div');
  root.className = 'focus-screen qs-screen ch-screen';
  root.hidden = true;
  root.tabIndex = -1;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'Desafio de acertos');
  document.body.append(root);
  const $ = s => root.querySelector(s);
  const $$ = s => [...root.querySelectorAll(s)];

  let run = null;      // tentativa em andamento
  let tick = 0;
  let locked = false;  // durante feedback/transição nada pode ser clicado

  /* ------------------------------------------------------------ */
  /* Tentativa                                                     */
  /* ------------------------------------------------------------ */
  function nextQuestion() {
    const pool = E.questionRepository.query({}).filter(q => !run.used.has(q.id));
    if (!pool.length) return null;
    // Variedade: evita repetir a área da questão anterior quando possível.
    const lastArea = run.items.at(-1) && E.questionRepository.getById(run.items.at(-1).id)?.areaId;
    const other = pool.filter(q => q.areaId !== lastArea);
    const from = other.length ? other : pool;
    return from[Math.floor(Math.random() * from.length)];
  }
  function persistActive() {
    const store = readChallengeStore();
    store.active = run ? { startedAt: run.startedAt, items: run.items } : null;
    writeStore(store);
  }

  /** Registra uma tentativa (inclusive abandonos encontrados ao abrir o app). */
  function record({ startedAt, items, reason, endedAt }) {
    const store = readChallengeStore();
    const streak = items.filter(i => i.correct).length;
    const answered = items.filter(i => i.selected);
    const faced = items.length;
    const totalMs = items.reduce((n, i) => n + (i.timeMs || 0), 0);
    const previousBest = store.best || 0;
    const attempt = { id: `desafio-${startedAt}`, startedAt, endedAt, streak, faced, reason, totalMs, avgMs: answered.length ? Math.round(answered.reduce((n, i) => n + i.timeMs, 0) / answered.length) : 0 };
    store.attempts = [...store.attempts, attempt].slice(-30);
    store.best = Math.max(previousBest, streak);
    store.active = null;
    writeStore(store);
    // As respostas dadas entram no histórico como uma lista concluída (acertos continuam acertos).
    if (answered.length) {
      const acc = getAccount();
      const ids = answered.map(i => i.id);
      const base = E.createPracticeSession({ title: 'Desafio de acertos', questionIds: ids, mode: 'custom', filters: { ...E.EMPTY_FILTERS, count: ids.length }, timerVisible: true, now: startedAt });
      const answers = Object.fromEntries(answered.map(i => [i.id, { questionId: i.id, selected: i.selected, confirmed: true, correct: i.correct, answeredAt: new Date(i.answeredAt).toISOString(), timeSpentMs: i.timeMs }]));
      const iso = new Date(endedAt).toISOString();
      acc.practiceSessions.push({ ...base, answers, status: 'completed', completedAt: iso, updatedAt: iso, currentIndex: ids.length - 1, clock: { elapsedMs: totalMs, runningSince: null }, challenge: { reason, streak } });
      save();
    }
    return { attempt, previousBest, isRecord: streak > previousBest && streak > 0, store };
  }

  /** Tentativa interrompida por recarregamento/fechamento: vira abandono, nunca é retomada. */
  function settleOrphan() {
    const store = readChallengeStore();
    if (!store.active) return null;
    const { startedAt, items } = store.active;
    const all = items || [];
    const last = all.filter(i => i.selected).at(-1);
    return record({ startedAt, items: all, reason: 'abandono', endedAt: last?.answeredAt ?? startedAt });
  }

  function start() {
    settleOrphan();
    run = { startedAt: Date.now(), items: [], used: new Set(), current: null, deadline: 0, shownAt: 0, selected: null };
    locked = false;
    root.hidden = false;
    document.body.classList.add('focus-open');
    root.innerHTML = shellHTML();
    bindShell();
    root.focus({ preventScroll: true });
    // Contagem de entrada curta; o relógio da primeira questão só começa depois dela.
    const intro = $('#ch-intro');
    if (reduced()) { intro.remove(); present(); return; }
    let n = 3;
    const step = () => {
      if (!run) return;
      if (n === 0) { animate(intro, { opacity: [1, 0] }, { duration: 0.2 }).then(() => { intro.remove(); present(); }); return; }
      intro.querySelector('strong').textContent = n;
      animate(intro.querySelector('strong'), { scale: [1.6, 1], opacity: [0, 1] }, spring.bouncy);
      n -= 1;
      setTimeout(step, 620);
    };
    step();
  }

  function present() {
    const q = nextQuestion();
    if (!q) { finish('acervo'); return; }
    run.used.add(q.id);
    run.current = q;
    run.selected = null;
    $('#ch-stage').innerHTML = questionHTML(q);
    $$('.qs-alt').forEach(b => b.onclick = () => select(b.dataset.letter));
    $('#ch-confirm').disabled = true;
    const article = $('#ch-article');
    const shown = () => {
      if (!run || run.current !== q) return;
      // O relógio começa quando a questão já está na tela.
      run.shownAt = Date.now();
      run.deadline = run.shownAt + CHALLENGE_LIMIT_MS;
      run.items.push({ id: q.id, selected: null, correct: null, timeMs: 0, answeredAt: null });
      persistActive();
      locked = false;
      startTick();
    };
    if (reduced()) shown();
    else {
      animate(article, { opacity: [0, 1], y: [18, 0], scale: [0.985, 1] }, spring.soft);
      $$('.qs-alt').forEach((el, i) => animate(el, { opacity: [0, 1], y: [10, 0] }, { ...spring.soft, delay: 0.05 + i * 0.04 }));
      setTimeout(shown, 260);
    }
    renderTimer(CHALLENGE_LIMIT_MS);
  }

  function select(letter) {
    if (locked || !run?.deadline) return;
    run.selected = letter;
    $$('.qs-alt').forEach(b => { const on = b.dataset.letter === letter; b.dataset.state = on ? 'selected' : 'idle'; b.setAttribute('aria-checked', String(on)); });
    $('#ch-confirm').disabled = false;
  }

  function confirmAnswer() {
    if (locked || !run?.selected || !run.deadline) return;
    const now = Date.now();
    if (now >= run.deadline) { timeUp(); return; }
    locked = true;
    stopTick();
    const q = run.current;
    const item = run.items.at(-1);
    item.selected = run.selected;
    item.correct = run.selected === q.correct;
    item.timeMs = now - run.shownAt;
    item.answeredAt = now;
    run.deadline = 0;
    persistActive();
    reveal(q, run.selected);
    if (item.correct) celebrate().then(() => run && present());
    else setTimeout(() => finish('erro'), reduced() ? 300 : 1500);
  }

  function timeUp() {
    if (!run || locked) return;
    locked = true;
    stopTick();
    run.deadline = 0;
    // A questão sem resposta conta como enfrentada, mas não como erro registrado no histórico.
    const item = run.items.at(-1);
    if (item) { item.timedOut = true; item.timeMs = CHALLENGE_LIMIT_MS; }
    renderTimer(0);
    reveal(run.current, null);
    root.classList.add('is-timeout');
    setTimeout(() => finish('tempo'), reduced() ? 300 : 1300);
  }

  function reveal(q, selected) {
    $$('.qs-alt').forEach(b => {
      const l = b.dataset.letter;
      b.disabled = true;
      b.dataset.state = l === q.correct ? 'correct' : l === selected ? 'wrong' : 'idle';
      b.classList.toggle('is-dim', l !== q.correct && l !== selected);
      const g = b.querySelector('.qs-alt-glyph');
      if (l === q.correct) g.innerHTML = hi('Check');
      else if (l === selected) g.innerHTML = hi('X');
    });
    $('#ch-confirm').disabled = true;
    if (selected && selected !== q.correct && !reduced()) animate($('#ch-article'), { x: [0, -8, 7, -4, 3, 0] }, { duration: 0.42 });
  }

  /** Acerto: contador sobe, pequena comemoração e transição para a próxima questão. */
  function celebrate() {
    const streak = run.items.filter(i => i.correct).length;
    const count = $('#ch-streak');
    count.textContent = streak;
    $('#ch-streak-label').textContent = streak === 1 ? 'acerto seguido' : 'acertos seguidos';
    const best = readChallengeStore().best;
    const milestone = streak % 5 === 0;
    const record = streak > best && best > 0 && streak === best + 1;
    paintTrail(streak);
    if (reduced()) return new Promise(r => setTimeout(r, 450));
    animate(count, { scale: [1, 1.45, 1], y: [0, -6, 0] }, { duration: 0.55 });
    animate($('.ch-score'), { boxShadow: ['0 0 0 0 rgb(221 181 77 / .55)', '0 0 0 16px rgb(221 181 77 / 0)'] }, { duration: 0.7 });
    burst($('.ch-score'), milestone || record ? 18 : 9);
    if (milestone || record) banner(record ? 'Novo recorde em andamento!' : `${streak} seguidas!`);
    const article = $('#ch-article');
    return new Promise(res => setTimeout(() => animate(article, { opacity: [1, 0], x: [0, -40] }, { duration: 0.24 }).then(res), 650));
  }
  function paintTrail(streak) {
    const trail = $('#ch-trail');
    if (!trail) return;
    trail.innerHTML = Array.from({ length: Math.min(streak, 24) }, (_, i) => `<i class="${(i + 1) % 5 === 0 ? 'is-five' : ''}"></i>`).join('') + (streak > 24 ? `<b>+${streak - 24}</b>` : '');
    const last = trail.querySelector('i:last-of-type');
    if (last && !reduced()) animate(last, { scale: [0, 1.4, 1], opacity: [0, 1] }, spring.bouncy);
  }
  function banner(text) {
    const b = document.createElement('div');
    b.className = 'ch-banner';
    b.textContent = text;
    root.append(b);
    animate(b, { opacity: [0, 1, 1, 0], y: [12, 0, 0, -10], scale: [0.9, 1, 1, 0.98] }, { duration: 1.6 }).then(() => b.remove());
  }
  function burst(anchor, n) {
    if (!anchor || reduced()) return;
    const r = anchor.getBoundingClientRect();
    const colors = ['#ddb54d', '#f0d27a', '#86a58c', '#c4fcc3', '#f4a385'];
    for (let i = 0; i < n; i++) {
      const p = document.createElement('span');
      p.className = 'ch-particle';
      p.style.left = `${r.left + r.width / 2}px`;
      p.style.top = `${r.top + r.height / 2}px`;
      p.style.background = colors[i % colors.length];
      document.body.append(p);
      const a = (Math.PI * 2 * i) / n + Math.random() * 0.4, d = 34 + Math.random() * 30;
      p.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d}px)) scale(.3)`, opacity: 0 }], { duration: 700 + Math.random() * 200, easing: 'cubic-bezier(.22,1,.36,1)' }).finished.then(() => p.remove(), () => p.remove());
    }
  }

  /* ------------------------------------------------------------ */
  /* Cronômetro (prazo absoluto)                                   */
  /* ------------------------------------------------------------ */
  function startTick() {
    stopTick();
    const loop = () => {
      if (!run?.deadline) return;
      const left = run.deadline - Date.now();
      renderTimer(left);
      if (left <= 0) { timeUp(); return; }
      tick = setTimeout(loop, 200);
    };
    loop();
  }
  function stopTick() { clearTimeout(tick); tick = 0; }
  function renderTimer(left) {
    const el = $('#ch-timer');
    if (!el) return;
    const frac = Math.max(0, Math.min(1, left / CHALLENGE_LIMIT_MS));
    el.querySelector('strong').textContent = mmss(left);
    el.style.setProperty('--p', frac);
    // Cor muda aos poucos: dourado → âmbar → vermelho; pulsa nos últimos 10 s.
    const hue = 45 * Math.min(1, frac / 0.5);
    el.style.setProperty('--tc', `hsl(${Math.round(hue)} ${Math.round(70 + (1 - frac) * 10)}% ${Math.round(48 + frac * 4)}%)`);
    el.classList.toggle('is-urgent', left > 0 && left <= 10000);
    el.setAttribute('aria-label', `Tempo restante: ${mmss(left)}`);
  }

  /* ------------------------------------------------------------ */
  /* Saída e resultado                                             */
  /* ------------------------------------------------------------ */
  function askExit() {
    if (!run || $('.ch-modal')) return;
    const m = document.createElement('div');
    m.className = 'ch-modal';
    m.innerHTML = `<div class="ch-modal-card" role="alertdialog" aria-modal="true" aria-labelledby="ch-exit-title" aria-describedby="ch-exit-text">
      <span class="ch-modal-icon">${hi('AlertTriangle')}</span>
      <h2 id="ch-exit-title">Sair do desafio?</h2>
      <p id="ch-exit-text">Sair agora encerrará seu desafio atual. Seu progresso não poderá ser retomado.</p>
      <div class="ch-modal-actions"><button type="button" class="qs-btn qs-btn-ghost" id="ch-stay">Continuar desafio</button><button type="button" class="qs-btn qs-btn-primary" id="ch-leave">Sair e encerrar</button></div></div>`;
    root.append(m);
    animate(m.firstElementChild, { opacity: [0, 1], y: [14, 0], scale: [0.97, 1] }, spring.soft);
    m.querySelector('#ch-stay').onclick = () => m.remove();
    m.querySelector('#ch-leave').onclick = () => { m.remove(); finish('abandono'); };
    m.querySelector('#ch-stay').focus();
  }

  function finish(reason) {
    if (!run) return;
    stopTick();
    const open = run.items.at(-1);
    if (open && !open.selected && !open.timedOut && run.shownAt) open.timeMs = Math.min(CHALLENGE_LIMIT_MS, Date.now() - run.shownAt);
    const items = run.items; // inclui a questão aberta (enfrentada); só as respondidas vão para o histórico
    const res = record({ startedAt: run.startedAt, items, reason, endedAt: Date.now() });
    run = null;
    locked = false;
    root.classList.remove('is-timeout');
    root.innerHTML = resultHTML(res);
    bindResult(res);
  }

  function close() {
    stopTick();
    run = null;
    root.hidden = true;
    root.innerHTML = '';
    document.body.classList.remove('focus-open');
    onExit();
  }

  /* ------------------------------------------------------------ */
  /* HTML                                                          */
  /* ------------------------------------------------------------ */
  function shellHTML() {
    const best = readChallengeStore().best;
    return `<header class="ch-top">
        <button type="button" class="ch-exit" id="ch-exit" aria-label="Sair do desafio">${hi('X')}</button>
        <div class="ch-title"><span>DESAFIO DE ACERTOS</span><strong>Até onde você chega?</strong></div>
        <div class="ch-best">${hi('Trophy')}<span>Recorde <b>${best}</b></span></div>
      </header>
      <div class="ch-body">
        <aside class="ch-side">
          <div class="ch-score" aria-live="polite"><strong id="ch-streak">0</strong><span id="ch-streak-label">acertos seguidos</span></div>
          <div class="ch-timer" id="ch-timer" role="timer"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="ch-timer-track" cx="60" cy="60" r="52"/><circle class="ch-timer-ring" cx="60" cy="60" r="52" pathLength="1"/></svg><strong>03:40</strong><small>por questão</small></div>
          <div class="ch-trail" id="ch-trail" aria-hidden="true"></div>
          <ul class="ch-rules"><li>${hi('Timer')}03:40 por questão, sem acumular</li><li>${hi('XCircle')}Errou ou o tempo acabou: fim</li><li>${hi('Lock')}Sem pular, pausar ou voltar</li></ul>
        </aside>
        <main class="ch-main"><div id="ch-stage"></div>
          <div class="ch-actions"><button type="button" class="qs-btn qs-btn-primary qs-btn-lg" id="ch-confirm" disabled>${hi('CheckCircle2')}Confirmar resposta</button><small>A confirmação é definitiva.</small></div>
        </main>
      </div>
      <div class="ch-intro" id="ch-intro" aria-live="assertive"><span>Prepare-se</span><strong>3</strong></div>`;
  }
  function questionHTML(q) {
    const subject = E.SUBJECT_BY_ID[q.subjectId];
    const topic = E.TOPIC_BY_ID[q.topicId];
    const n = run.items.length + 1;
    return `<article class="qs-card ch-card" id="ch-article">
      <div class="qs-meta"><span class="qs-num">${n}.</span><span class="qs-badge is-area" style="--area-ink:var(--${q.areaId}-ink);--area-bg:var(--${q.areaId}-bg)">${esc(subject?.name)}</span><span class="qs-badge">${esc(topic?.name ?? '')}</span><span class="qs-badge is-outline is-sm qs-push">Questão demonstrativa · ref. ${q.year}</span></div>
      <div class="qs-gap"><div class="qs-text">${q.support ? `<div class="qs-support">${q.support.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}${q.support.credit ? `<p class="qs-credit">${esc(q.support.credit)}</p>` : ''}</div>` : ''}${q.image ? `<figure class="qs-figure"><img src="${esc(q.image.src)}" alt="${esc(q.image.alt)}" width="${q.image.width}" height="${q.image.height}"></figure>` : ''}<p class="qs-prompt">${esc(q.prompt)}</p></div></div>
      <div class="qs-alts" role="radiogroup" aria-label="Alternativas">${q.alternatives.map(a => `<button type="button" class="qs-alt" role="radio" aria-checked="false" data-state="idle" data-letter="${a.letter}"><span class="qs-alt-letter"><span class="qs-alt-glyph">${a.letter}</span></span><span class="qs-alt-text">${esc(a.text)}</span></button>`).join('')}</div>
    </article>`;
  }
  function resultHTML({ attempt, previousBest, isRecord, store }) {
    const r = REASONS[attempt.reason];
    const prev = store.attempts.slice(0, -1).slice(-6);
    const all = [...prev, attempt];
    const max = Math.max(1, ...all.map(a => a.streak));
    const avgPrev = prev.length ? prev.reduce((n, a) => n + a.streak, 0) / prev.length : null;
    const cmp = avgPrev === null ? 'Primeira tentativa registrada.' : attempt.streak > avgPrev ? `Acima da sua média (${avgPrev.toFixed(1)}).` : attempt.streak === Math.round(avgPrev) ? `Na sua média (${avgPrev.toFixed(1)}).` : `Sua média é ${avgPrev.toFixed(1)}.`;
    return `<div class="ch-result ${isRecord ? 'is-record' : ''}">
      <div class="ch-result-hero">
        <span class="ch-reason reason-${attempt.reason}">${hi(r.icon)}${r.label}</span>
        ${isRecord ? `<span class="ch-record-tag">${hi('Trophy')}Novo recorde pessoal!</span>` : ''}
        <strong class="ch-big" id="ch-big">${attempt.streak}</strong>
        <p class="ch-big-label">${attempt.streak === 1 ? 'acerto seguido' : 'acertos seguidos'}</p>
        <p class="ch-reason-text">${r.text}</p>
      </div>
      <div class="ch-stats">
        <div><span>Questões enfrentadas</span><b>${attempt.faced}</b></div>
        <div><span>Tempo total</span><b>${longTime(attempt.totalMs)}</b></div>
        <div><span>Tempo médio por questão</span><b>${attempt.avgMs ? longTime(attempt.avgMs) : '—'}</b></div>
        <div><span>Melhor sequência</span><b>${store.best}${isRecord && previousBest ? ` <small>antes: ${previousBest}</small>` : ''}</b></div>
      </div>
      <section class="ch-history" aria-label="Tentativas recentes"><header><h3>Tentativas recentes</h3><p>${cmp}</p></header>
        <div class="ch-bars">${all.map((a, i) => `<div class="${i === all.length - 1 ? 'is-now' : ''}" title="${a.streak} acertos · ${REASONS[a.reason].label}"><i style="--h:${a.streak / max}"></i><span>${a.streak}</span></div>`).join('')}</div></section>
      <div class="ch-result-actions"><button type="button" class="qs-btn qs-btn-primary qs-btn-lg" id="ch-again">${hi('RotateCcw')}Tentar novamente</button><button type="button" class="qs-btn qs-btn-ghost qs-btn-lg" id="ch-back">${hi('ArrowLeft')}Voltar à prática</button></div>
    </div>`;
  }

  function bindShell() {
    $('#ch-exit').onclick = askExit;
    $('#ch-confirm').onclick = confirmAnswer;
    root.onkeydown = e => {
      if (!run) return;
      if (e.key === 'Escape') { e.preventDefault(); if ($('.ch-modal')) $('.ch-modal').remove(); else askExit(); return; }
      if ($('.ch-modal')) return;
      const k = e.key.toUpperCase();
      if (/^[A-E]$/.test(k) && !e.metaKey && !e.ctrlKey) select(k);
      if (e.key === 'Enter' && run.selected) { e.preventDefault(); confirmAnswer(); }
    };
  }
  function bindResult(res) {
    root.onkeydown = e => { if (e.key === 'Escape') close(); };
    $('#ch-again').onclick = () => start();
    $('#ch-back').onclick = () => close();
    $('#ch-again').focus({ preventScroll: true });
    if (reduced()) return;
    const big = $('#ch-big');
    countTo(big, res.attempt.streak, { from: 0, seconds: Math.min(1.2, 0.3 + res.attempt.streak * 0.08) });
    animate($('.ch-result-hero'), { opacity: [0, 1], y: [16, 0], scale: [0.98, 1] }, spring.soft);
    $$('.ch-stats > div').forEach((el, i) => animate(el, { opacity: [0, 1], y: [12, 0] }, { ...spring.soft, delay: 0.15 + i * 0.06 }));
    $$('.ch-bars i').forEach((el, i) => el.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(var(--h))' }], { duration: 650, delay: 250 + i * 60, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }));
    if (res.isRecord) { setTimeout(() => burst($('.ch-record-tag'), 22), 350); animate($('.ch-record-tag'), { scale: [0.6, 1.08, 1], opacity: [0, 1, 1] }, { ...spring.bouncy, delay: 0.3 }); }
  }

  // Fechar/recarregar no meio: a tentativa fica marcada como ativa e vira abandono na próxima abertura.
  window.addEventListener('beforeunload', e => { if (run) { persistActive(); e.preventDefault(); e.returnValue = ''; } });

  return { start, settleOrphan, isOpen: () => !root.hidden, store: readChallengeStore };
}
