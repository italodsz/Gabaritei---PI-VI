// Página Histórico: réplica de features/history/HistoryPage.tsx do front anterior.
// Abas Atividades | Erradas | Favoritas | Para revisar, com os mesmos filtros,
// cards expansíveis, ações, estados vazios, ilustrações e animações (indicadores
// com layoutId, conteúdo da aba com fade, lista com cascata e saída animada,
// Collapse de altura, chevron girando). Componentes em legacy-ui.js.
import { animate, spring, duration, ease, tabContentIn, collapse, snapshot, flipList, reduced } from './motion-kit.js';
import { esc, hi, pct, SUBJECT_ICON, pageHeader, tile, card, badge, btn, iconBtn, seg, tabs, select, checkbox, progress, empty, illus, rerender, playBars, playReveal, bindSelects, rotateChevron, bindTabKeys } from './legacy-ui.js';

const DAY = 86400000;
const PAGE = 12;
const MAX_LIST = 30;
const pad = n => String(n).padStart(2, '0');
const formatTime = iso => { const d = new Date(iso); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const formatDate = value => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
function formatRelativeDay(iso, now) {
  const start = date => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diff = Math.round((start(new Date(now)) - start(new Date(iso))) / DAY);
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Ontem';
  if (diff < 7) return `Há ${diff} dias`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
}
function formatDuration(ms) {
  const m = Math.round(ms / 60000);
  if (m < 1) return `${Math.max(0, Math.round(ms / 1000))}s`;
  return m >= 60 ? `${Math.floor(m / 60)}h ${pad(m % 60)}min` : `${m} min`;
}

export function createHistoryPage({ E, root, toast, getAccount, save, records, navigate, beginList, openSession, openSimulationResult, openExam, saveToNotes }) {
  const state = {
    tab: 'atividades', kind: 'todas', status: 'todos', subject: 'todas', period: '30', result: 'todos',
    open: null, limit: PAGE, toDelete: null,
    collection: { erradas: { subject: 'todas', selected: [] }, favoritas: { subject: 'todas', selected: [] }, revisar: { subject: 'todas', selected: [] } },
  };
  const $ = s => root.querySelector(s);
  const $$ = s => [...root.querySelectorAll(s)];
  const account = () => getAccount();

  /* Dados ------------------------------------------------------------ */
  function wrongRecords() {
    const latest = new Map();
    for (const r of records()) { const prev = latest.get(r.questionId); if (!prev || r.answeredAt > prev.answeredAt) latest.set(r.questionId, r); }
    return [...latest.values()].filter(r => !r.correct).sort((a, b) => b.answeredAt - a.answeredAt);
  }
  function activityItems(now) {
    const subjectsOf = ids => { const qs = E.questionRepository.getMany(ids); return { subjects: [...new Set(qs.map(q => q.subjectId))], areas: [...new Set(qs.map(q => q.areaId))] }; };
    const practice = account().practiceSessions.map(s => {
      const r = E.practiceResult(s, now);
      return { id: s.id, kind: 'practice', title: s.title, date: s.completedAt ?? s.updatedAt, status: s.status, total: r.total, answered: r.answered, correct: r.correct, accuracy: r.accuracyAnswered, timeMs: r.timeMs, session: s, ...subjectsOf(s.questionIds) };
    });
    const sims = account().simulations.map(s => {
      const r = E.simulationResult(s, now);
      const done = s.status === 'completed';
      return { id: s.id, kind: 'simulation', title: s.title, date: s.completedAt ?? s.updatedAt, status: s.status, total: r.total, answered: r.answered, correct: done ? r.correct : 0, accuracy: done ? r.accuracy : 0, timeMs: r.timeMs, session: s, ...subjectsOf(s.questionIds) };
    });
    return [...practice, ...sims].sort((a, b) => b.date.localeCompare(a.date));
  }
  function filterItems(items, now) {
    return items.filter(it => {
      if (state.kind === 'listas' && it.kind !== 'practice') return false;
      if (state.kind === 'simulados' && it.kind !== 'simulation') return false;
      if (state.status === 'concluidas' && it.status !== 'completed') return false;
      if (state.status === 'interrompidas' && it.status !== 'in_progress') return false;
      if (state.subject !== 'todas' && !it.subjects.includes(state.subject)) return false;
      if (state.period !== 'tudo' && now - new Date(it.date).getTime() > Number(state.period) * DAY) return false;
      if (state.result !== 'todos') {
        if (it.status !== 'completed' || it.answered === 0) return false;
        if (state.result === 'alto' && it.accuracy < 0.7) return false;
        if (state.result === 'medio' && (it.accuracy < 0.5 || it.accuracy >= 0.7)) return false;
        if (state.result === 'baixo' && it.accuracy >= 0.5) return false;
      }
      return true;
    });
  }

  /* Render ----------------------------------------------------------- */
  function render({ entering = true } = {}) {
    const wrong = wrongRecords();
    const acc = account();
    root.innerHTML = `<div class="lg-page hist">
      ${pageHeader('Histórico', 'Suas atividades', 'Listas e simulados, concluídos ou interrompidos, além das questões para revisar.')}
      ${tabsHTML(wrong, acc)}
      <div id="hist-panel" role="tabpanel" aria-labelledby="tab-hist-${state.tab}">${panelHTML(wrong)}</div>
    </div>`;
    bindAll(wrong);
    if (entering) { playReveal(root); listEnter(); }
    playBars(root);
  }
  const tabsHTML = (wrong, acc) => tabs('hist', state.tab, [
    { value: 'atividades', label: 'Atividades', icon: 'History', count: acc.practiceSessions.length + acc.simulations.length },
    { value: 'erradas', label: 'Erradas', icon: 'XCircle', count: wrong.length },
    { value: 'favoritas', label: 'Favoritas', icon: 'Star', count: acc.favorites.length },
    { value: 'revisar', label: 'Para revisar', icon: 'Bookmark', count: acc.reviewMarks.length },
  ]);
  const panelHTML = wrong => (state.tab === 'atividades' ? activitiesHTML() : collectionHTML(state.tab, wrong));

  /** Re-render parcial do painel (filtros mudaram), preservando indicadores. */
  function renderPanel({ enterList = true } = {}) {
    const wrong = wrongRecords();
    rerender(root, () => { $('#hist-panel').innerHTML = panelHTML(wrong); bindAll(wrong); });
    playBars(root);
    if (enterList) listEnter();
  }
  function switchTab(tab) {
    if (tab === state.tab) return;
    state.tab = tab; state.open = null;
    const wrong = wrongRecords();
    const panel = $('#hist-panel');
    // Cor do indicador antes da troca: a nova cor é interpolada junto com o deslize.
    const oldInd = root.querySelector('.lg-tab-ind');
    const fromColor = oldInd ? getComputedStyle(oldInd).backgroundColor : null;
    // AnimatePresence mode="wait": sai subindo 6px e o novo entra descendo 10px.
    animate(panel, { opacity: [1, 0], y: [0, -6] }, { duration: duration.fast }).then(() => {
      rerender(root, () => {
        root.querySelector('.lg-tabs').outerHTML = tabsHTML(wrong, account());
        panel.innerHTML = panelHTML(wrong);
        panel.setAttribute('aria-labelledby', `tab-hist-${tab}`);
        bindAll(wrong);
      });
      const ind = root.querySelector('.lg-tab-ind');
      if (ind && fromColor && !reduced()) { const to = getComputedStyle(ind).backgroundColor; if (to !== fromColor) ind.animate([{ backgroundColor: fromColor }, { backgroundColor: to }], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' }); }
      panel.style.transform = '';
      tabContentIn(panel);
      playBars(root); playReveal(panel); listEnter();
      $(`#tab-hist-${tab}`)?.focus({ preventScroll: true });
    });
  }
  /** Itens da lista entram em cascata (delay = min(i, 8) × 35 ms). */
  function listEnter(only) {
    const items = only || $$('.hist-item, .hist-qrow');
    items.forEach((el, i) => animate(el, { opacity: [0, 1], y: [el.classList.contains('hist-qrow') ? 10 : 12, 0] }, { duration: duration.slow, ease: ease.out, delay: Math.min(i, 8) * (el.classList.contains('hist-qrow') ? 0.03 : 0.035) }));
  }

  const filterBlock = (label, content, w = '') => `<div class="hist-filter" ${w ? `style="width:${w}px"` : ''}><p>${label}</p>${content}</div>`;
  function activitiesHTML() {
    const now = Date.now();
    const filtered = filterItems(activityItems(now), now);
    const shown = filtered.slice(0, state.limit);
    const filters = card(`<div class="hist-filters">
      ${filterBlock('Tipo', seg('kind', state.kind, [{ value: 'todas', label: 'Todas' }, { value: 'listas', label: 'Listas' }, { value: 'simulados', label: 'Simulados' }], { aria: 'Tipo de atividade', size: 'sm' }))}
      ${filterBlock('Situação', seg('status', state.status, [{ value: 'todos', label: 'Todas' }, { value: 'concluidas', label: 'Concluídas' }, { value: 'interrompidas', label: 'Interrompidas' }], { aria: 'Situação', size: 'sm' }))}
      ${filterBlock('Matéria', select('subject', state.subject, [{ value: 'todas', label: 'Todas as matérias' }, ...E.SUBJECTS.map(s => ({ value: s.id, label: s.name }))], 'Matéria'), 208)}
      ${filterBlock('Período', select('period', state.period, [{ value: '7', label: 'Últimos 7 dias' }, { value: '30', label: 'Últimos 30 dias' }, { value: '90', label: 'Últimos 90 dias' }, { value: 'tudo', label: 'Todo o período' }], 'Período'), 176)}
      ${filterBlock('Resultado', select('result', state.result, [{ value: 'todos', label: 'Qualquer resultado' }, { value: 'alto', label: '70% ou mais' }, { value: 'medio', label: 'Entre 50% e 69%' }, { value: 'baixo', label: 'Abaixo de 50%' }], 'Resultado'), 192)}
    </div>`, { padded: 'sm', cls: 'hist-filter-card' });
    const count = `<p class="hist-count" aria-live="polite">${filtered.length} ${filtered.length === 1 ? 'atividade encontrada' : 'atividades encontradas'}</p>`;
    if (!filtered.length) return filters + count + card(empty(illus.stack, 'Nenhuma atividade com esses filtros', 'Ajuste os filtros acima ou comece uma nova lista de questões.', btn('Praticar agora', { icon: 'BookOpenCheck', extra: { 'data-go-practice': '' } })));
    const more = filtered.length > state.limit ? `<div class="hist-more">${btn(`Mostrar mais (${filtered.length - state.limit} restantes)`, { variant: 'secondary', extra: { 'data-more': '', 'data-focus': 'more' } })}</div>` : '';
    return `${filters}${count}<ul class="hist-list" id="hist-list">${shown.map(itemHTML).join('')}</ul>${more}`;
  }

  function itemHTML(it) {
    const isOpen = state.open === it.id;
    const known = it.status === 'completed' || it.kind === 'practice';
    const tone = it.status !== 'completed' && it.kind === 'simulation' ? 'ink' : it.accuracy >= 0.7 ? 'sage' : it.accuracy >= 0.5 ? 'gold' : 'coral';
    const ref = JSON.stringify({ kind: it.kind === 'practice' ? 'practice' : 'simulation', id: it.id });
    return `<li class="hist-item" data-key="${esc(it.id)}" data-note-ref='${esc(ref)}'>
      <button type="button" class="hist-head" data-toggle="${esc(it.id)}" data-focus="toggle-${esc(it.id)}" aria-expanded="${isOpen}">
        ${tile(it.kind === 'practice' ? 'BookOpenCheck' : 'Timer', it.kind === 'practice' ? 'sage' : 'coral')}
        <span class="hist-main"><span class="hist-title"><strong>${esc(it.title)}</strong>${badge(it.status === 'completed' ? 'Concluída' : 'Interrompida', it.status === 'completed' ? 'sage' : 'warning', '', 'sm')}</span>
          <small>${it.kind === 'practice' ? 'Lista de questões' : 'Simulado'} · ${formatRelativeDay(it.date, Date.now())} às ${formatTime(it.date)} · ${formatDuration(it.timeMs)}</small></span>
        <span class="hist-score"><span><span>${known ? `${it.correct}/${it.answered || it.total}` : `${it.answered}/${it.total} resp.`}</span><b>${known ? pct(it.accuracy) : '—'}</b></span>${progress(known ? it.accuracy : it.answered / it.total, tone, { thin: true })}</span>
        <span class="hist-chev" style="${isOpen ? 'rotate:180deg' : ''}">${hi('ChevronDown')}</span>
      </button>
      ${isOpen ? detailHTML(it) : ''}
    </li>`;
  }
  function detailHTML(it) {
    return `<div class="hist-collapse" id="hist-detail-${esc(it.id)}"><div class="hist-detail">
      <div class="hist-badges">${it.subjects.map(s => badge(esc(E.SUBJECT_BY_ID[s].name), E.SUBJECT_BY_ID[s].areaId, SUBJECT_ICON[s])).join('')}</div>
      <dl class="hist-stats">
        <div><dt>Questões</dt><dd>${it.total}</dd></div>
        <div><dt>Respondidas</dt><dd>${it.answered}</dd></div>
        <div><dt>Acertos</dt><dd>${it.kind === 'simulation' && it.status !== 'completed' ? 'após finalizar' : it.correct}</dd></div>
        <div><dt>Data</dt><dd>${formatDate(it.date)}</dd></div>
      </dl>
      <div class="hist-actions">${it.status === 'completed'
        ? `${btn('Ver resultado', { size: 'sm', icon: 'BarChart3', extra: { 'data-result': it.id, 'data-kind': it.kind } })}${it.kind === 'simulation' ? btn('Revisão', { size: 'sm', variant: 'secondary', icon: 'Eye', extra: { 'data-review': it.id } }) : ''}`
        : `${btn('Continuar', { size: 'sm', variant: 'accent', icon: 'Play', extra: { 'data-continue': it.id, 'data-kind': it.kind } })}${btn('Excluir', { size: 'sm', variant: 'ghost', icon: 'Trash2', extra: { 'data-delete': it.id, 'data-kind': it.kind } })}`}
        ${btn('Salvar nas notas', { size: 'sm', variant: 'ghost', icon: 'NotebookPen', cls: 'hist-note-btn', extra: { 'data-note-save': it.id, 'data-kind': it.kind } })}
      </div>
    </div></div>`;
  }

  function collectionHTML(tab, wrong) {
    const cfg = {
      erradas: { ids: wrong.map(w => w.questionId), mode: 'retry', title: 'Refazer questões erradas', emptyTitle: 'Nenhuma questão errada pendente', emptyText: 'Quando você errar uma questão, ela aparece aqui até que você acerte numa nova tentativa.', illus: illus.flag, note: 'Ao refazer, sua resposta anterior não é exibida — você começa do zero.' },
      favoritas: { ids: account().favorites, mode: 'favorites', title: 'Praticar favoritas', emptyTitle: 'Nenhuma questão favorita', emptyText: 'Use a estrela durante a resolução para guardar questões que você quer rever.', illus: illus.star },
      revisar: { ids: account().reviewMarks, mode: 'marks', title: 'Praticar marcadas', emptyTitle: 'Nada marcado para revisão', emptyText: 'Marque questões durante a prática (tecla M) para encontrá-las aqui.', illus: illus.stack },
    }[tab];
    if (!cfg.ids.length) return card(empty(cfg.illus, cfg.emptyTitle, cfg.emptyText, btn('Praticar questões', { extra: { 'data-go-practice': '' } })));
    const cs = state.collection[tab];
    const all = E.questionRepository.getMany(cfg.ids);
    const present = [...new Set(all.map(q => q.subjectId))];
    if (cs.subject !== 'todas' && !present.includes(cs.subject)) cs.subject = 'todas';
    const questions = all.filter(q => cs.subject === 'todas' || q.subjectId === cs.subject);
    cs.selected = cs.selected.filter(id => questions.some(q => q.id === id));
    const meta = id => { if (tab !== 'erradas') return ''; const w = wrong.find(x => x.questionId === id); return w ? `Último erro: ${formatDate(w.answeredAt)}` : ''; };
    const rows = questions.map(q => {
      const checked = cs.selected.includes(q.id);
      const m = meta(q.id);
      return `<li class="hist-qrow ${checked ? 'is-checked' : ''}" data-key="${esc(q.id)}">
        <div class="hist-qcheck">${checkbox(checked, '<span class="sr-only">Selecionar questão</span>', { 'data-check': q.id, 'data-focus': `check-${q.id}` })}</div>
        <div class="hist-qmain"><div class="hist-qmeta">${badge(esc(E.SUBJECT_BY_ID[q.subjectId].name), q.areaId, SUBJECT_ICON[q.subjectId], 'sm')}<span>${esc(E.TOPIC_BY_ID[q.topicId]?.name ?? '')}</span>${m ? `<span>· ${m}</span>` : ''}</div><p>${esc(q.support?.paragraphs[0] ?? q.prompt)}</p></div>
        <div class="hist-qactions">${cfg.mode !== 'retry' ? iconBtn('Trash2', 'Remover da lista', { 'data-remove': q.id }, { size: 'sm' }) : ''}${btn('Praticar', { size: 'sm', variant: 'secondary', icon: 'Play', extra: { 'data-single': q.id } })}</div>
      </li>`;
    }).join('');
    const target = cs.selected.length ? cs.selected : questions.map(q => q.id);
    return `<div class="lg-grid">
      <div class="lg-col-8">
        <div class="hist-ctools"><div style="width:224px">${select('collection-subject', cs.subject, [{ value: 'todas', label: 'Todas as matérias' }, ...present.map(s => ({ value: s, label: E.SUBJECT_BY_ID[s].name }))], 'Filtrar por matéria')}</div>
          ${checkbox(cs.selected.length > 0 && cs.selected.length === questions.length, `<span class="hist-muted">Selecionar todas (${questions.length})</span>`, { 'data-check-all': '', 'data-focus': 'check-all' })}</div>
        <ul class="hist-qlist" id="hist-qlist">${rows}</ul>
      </div>
      ${card(`${tile('RotateCcw', 'gold', 'lg')}<h3 class="hist-start-title">${cfg.title}</h3><p class="hist-start-text" id="hist-start-text">${startText(cs, target)}</p>${cfg.note ? `<p class="hist-start-note">${cfg.note}</p>` : ''}${btn('Começar', { variant: 'accent', icon: 'Play', full: true, cls: 'hist-start-btn', extra: { 'data-start-collection': tab, ...(target.length ? {} : { disabled: true }) } })}`, { surface: 'ink', cls: 'lg-col-4 lg-sticky' })}
    </div>`;
  }
  const startText = (cs, target) => { const n = Math.min(MAX_LIST, target.length); return cs.selected.length ? `${n} questões selecionadas.` : `Todas as ${n} questões${target.length > MAX_LIST ? ` (máximo de ${MAX_LIST} por lista)` : ''} do filtro atual.`; };

  /* Eventos ---------------------------------------------------------- */
  function startCollection(tab, wrong) {
    const ids = { erradas: wrong.map(w => w.questionId), favoritas: account().favorites, revisar: account().reviewMarks }[tab];
    const cs = state.collection[tab];
    const visible = E.questionRepository.getMany(ids).filter(q => cs.subject === 'todas' || q.subjectId === cs.subject).map(q => q.id);
    const chosen = (cs.selected.length ? cs.selected : visible).slice(0, MAX_LIST);
    if (!chosen.length) return;
    beginList({ erradas: 'Revisão de erros', favoritas: 'Questões favoritas', revisar: 'Questões marcadas' }[tab], chosen, tab === 'erradas' ? 'retry' : 'custom', { ...E.EMPTY_FILTERS, count: chosen.length });
  }
  const findSession = (id, kind) => (kind === 'simulation' ? account().simulations : account().practiceSessions).find(s => s.id === id);

  /** Abre/fecha o card (Collapse de altura + chevron com spring.snappy). */
  function toggleItem(id) {
    const prev = state.open;
    state.open = prev === id ? null : id;
    if (prev) {
      const li = root.querySelector(`.hist-item[data-key="${CSS.escape(prev)}"]`);
      const box = li?.querySelector('.hist-collapse');
      li?.querySelector('.hist-head')?.setAttribute('aria-expanded', 'false');
      rotateChevron(li?.querySelector('.hist-chev'), false);
      if (box) collapse(box, false).then(() => box.remove());
    }
    if (state.open) {
      const li = root.querySelector(`.hist-item[data-key="${CSS.escape(id)}"]`);
      const it = activityItems(Date.now()).find(x => x.id === id);
      if (!li || !it) return;
      li.querySelector('.hist-head').setAttribute('aria-expanded', 'true');
      rotateChevron(li.querySelector('.hist-chev'), true);
      li.insertAdjacentHTML('beforeend', detailHTML(it));
      const box = li.querySelector('.hist-collapse');
      bindDetail(box);
      collapse(box, true);
    }
  }
  function bindDetail(scope) {
    scope.querySelectorAll('[data-result]').forEach(b => b.onclick = () => { const s = findSession(b.dataset.result, b.dataset.kind); if (b.dataset.kind === 'simulation') openSimulationResult(s); else openSession(s); });
    scope.querySelectorAll('[data-review]').forEach(b => b.onclick = () => openSimulationResult(findSession(b.dataset.review, 'simulation'), { review: true }));
    scope.querySelectorAll('[data-continue]').forEach(b => b.onclick = () => { const s = findSession(b.dataset.continue, b.dataset.kind); if (b.dataset.kind === 'simulation') openExam(s); else openSession(s); });
    scope.querySelectorAll('[data-delete]').forEach(b => b.onclick = () => openDelete({ id: b.dataset.delete, kind: b.dataset.kind }));
    scope.querySelectorAll('[data-note-save]').forEach(b => b.onclick = () => saveToNotes({ kind: b.dataset.kind === 'simulation' ? 'simulation' : 'practice', id: b.dataset.noteSave }, b));
  }

  function bindAll(wrong) {
    $$('[data-tab-group="hist"]').forEach(b => b.onclick = () => switchTab(b.dataset.tab));
    bindTabKeys(root, 'hist', switchTab);
    $$('[data-seg]').forEach(b => b.onclick = () => { if (b.getAttribute('aria-checked') === 'true') return; state[b.dataset.seg] = b.dataset.value; state.limit = PAGE; renderPanel(); });
    bindSelects(root, (name, value) => {
      if (name === 'collection-subject') { state.collection[state.tab].subject = value; state.collection[state.tab].selected = []; }
      else { state[name] = value; state.limit = PAGE; }
      renderPanel();
    });
    $$('[data-toggle]').forEach(b => b.onclick = () => toggleItem(b.dataset.toggle));
    $$('.hist-collapse').forEach(bindDetail);
    const more = $('[data-more]');
    if (more) more.onclick = () => {
      const before = $$('.hist-item').length;
      state.limit += PAGE;
      renderPanel({ enterList: false });
      listEnter($$('.hist-item').slice(before));
    };
    $$('[data-go-practice]').forEach(b => b.onclick = () => navigate('questoes'));
    // Coleções
    $$('[data-check]').forEach(c => c.onchange = () => {
      const cs = state.collection[state.tab];
      cs.selected = c.checked ? [...cs.selected, c.dataset.check] : cs.selected.filter(x => x !== c.dataset.check);
      c.closest('.hist-qrow').classList.toggle('is-checked', c.checked);
      refreshCollectionSummary();
    });
    const all = $('[data-check-all]');
    if (all) all.onchange = () => {
      const cs = state.collection[state.tab];
      cs.selected = all.checked ? $$('[data-check]').map(c => c.dataset.check) : [];
      $$('[data-check]').forEach(c => { c.checked = all.checked; c.closest('.hist-qrow').classList.toggle('is-checked', all.checked); });
      refreshCollectionSummary();
    };
    $$('[data-remove]').forEach(b => b.onclick = () => removeQuestion(b.dataset.remove, b.closest('.hist-qrow')));
    $$('[data-single]').forEach(b => b.onclick = () => {
      const q = E.questionRepository.getById(b.dataset.single);
      beginList(E.TOPIC_BY_ID[q.topicId]?.name ?? 'Questão', [q.id], state.tab === 'erradas' ? 'retry' : 'single', { ...E.EMPTY_FILTERS, count: 1 });
    });
    const start = $('[data-start-collection]');
    if (start) start.onclick = () => startCollection(state.tab, wrong);
  }
  function refreshCollectionSummary() {
    const cs = state.collection[state.tab];
    const visible = $$('[data-check]').map(c => c.dataset.check);
    const target = cs.selected.length ? cs.selected : visible;
    const t = $('#hist-start-text'); if (t) t.textContent = startText(cs, target);
    const all = $('[data-check-all]'); if (all) all.checked = cs.selected.length > 0 && cs.selected.length === visible.length;
    const st = $('[data-start-collection]'); if (st) st.disabled = !target.length;
  }
  /** Remoção com saída animada (x: -24) e reorganização (layout) do restante. */
  function removeQuestion(id, row) {
    const listName = state.tab === 'favoritas' ? 'favorites' : 'reviewMarks';
    account()[listName] = account()[listName].filter(x => x !== id);
    save();
    toast(state.tab === 'favoritas' ? 'Removida das favoritas' : 'Marcação removida');
    animate(row, { opacity: [1, 0], x: [0, -24] }, { duration: 0.18 }).then(() => {
      const list = $('#hist-qlist');
      const before = snapshot(list, '.hist-qrow', 'data-key');
      renderPanel({ enterList: false });
      const after = $('#hist-qlist');
      if (after) flipList(after, before);
      const tabCount = root.querySelector(`[data-tab="${state.tab}"] .lg-count`);
      if (tabCount) tabCount.textContent = account()[listName].length;
    });
  }

  /* Confirmação de exclusão (ConfirmDialog tone=danger) */
  function openDelete(target) {
    state.toDelete = target;
    const layer = document.createElement('div');
    layer.className = 'lg-scrim';
    layer.id = 'hist-delete';
    layer.innerHTML = `<div class="lg-modal" role="alertdialog" aria-modal="true" aria-labelledby="hist-del-title" aria-describedby="hist-del-text">
      ${tile('Trash2', 'danger', 'lg')}
      <h2 id="hist-del-title">Excluir atividade interrompida?</h2>
      <div class="lg-modal-text" id="hist-del-text"><p>As respostas já corrigidas desta atividade deixarão de contar nas suas estatísticas.</p></div>
      <div class="lg-modal-actions">${btn('Cancelar', { variant: 'ghost', extra: { id: 'hist-del-cancel' } })}${btn('Excluir', { variant: 'danger', extra: { id: 'hist-del-ok' } })}</div>
    </div>`;
    document.body.append(layer);
    animate(layer, { opacity: [0, 1] }, { duration: duration.base, ease: ease.out });
    animate(layer.querySelector('.lg-modal'), { opacity: [0, 1], y: [18, 0], scale: [0.97, 1] }, spring.soft);
    const close = () => { state.toDelete = null; animate(layer.querySelector('.lg-modal'), { opacity: [1, 0], y: [0, 10], scale: [1, 0.98] }, { duration: duration.fast, ease: ease.in }); animate(layer, { opacity: [1, 0] }, { duration: duration.fast, ease: ease.in }).then(() => layer.remove()); };
    layer.querySelector('#hist-del-cancel').onclick = close;
    layer.addEventListener('mousedown', e => { if (e.target === layer) close(); });
    layer.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); close(); } });
    layer.querySelector('#hist-del-ok').onclick = () => {
      const { id, kind } = target;
      close();
      const key = kind === 'simulation' ? 'simulations' : 'practiceSessions';
      account()[key] = account()[key].filter(s => s.id !== id);
      save();
      toast('Atividade excluída');
      const li = root.querySelector(`.hist-item[data-key="${CSS.escape(id)}"]`);
      const done = () => {
        const list = $('#hist-list');
        const before = list ? snapshot(list, '.hist-item', 'data-key') : null;
        if (state.open === id) state.open = null;
        renderPanel({ enterList: false });
        const tabCount = root.querySelector('[data-tab="atividades"] .lg-count');
        if (tabCount) tabCount.textContent = account().practiceSessions.length + account().simulations.length;
        const after = $('#hist-list');
        if (after && before) flipList(after, before);
      };
      if (li && !reduced()) animate(li, { opacity: [1, 0], scale: [1, 0.98] }, { duration: duration.fast }).then(done); else done();
    };
    requestAnimationFrame(() => layer.querySelector('#hist-del-cancel')?.focus());
  }

  return { render, setTab: tab => { state.tab = tab; } };
}
