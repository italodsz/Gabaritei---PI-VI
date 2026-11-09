// Tela "Monte sua lista de questões": réplica de features/practice/PracticeConfigPage.tsx.
// O mesmo componente monta o "Simulado personalizado" (mode: 'simulation'), com
// as mesmas peças visuais (cabeçalho, abas, matérias por área, assuntos e
// subtópicos, anos, resumo lateral) e as opções próprias de prova (tamanho,
// critério de seleção, cronômetro regressivo; correção só ao finalizar).
import { animate, spring, duration, ease, tabContentIn, collapse, countTo, reduced } from './motion-kit.js';
import { esc, hi, pct, SUBJECT_ICON, pageHeader, tile, cardHeader, card, badge, chip, btn, seg, tabs, switchRow, checkbox, progress, rerender, playBars, playReveal, rotateChevron, animateSwitch, bindTabKeys } from './legacy-ui.js';

const AREA_ORDER = ['linguagens', 'humanas', 'natureza', 'matematica'];
const PACES = [
  { value: 'enem', label: 'Ritmo ENEM', perQuestion: 220000, hint: '≈ 3min40s por questão (5h30 ÷ 90)' },
  { value: 'padrao', label: 'Padrão', perQuestion: 180000, hint: '3 min por questão' },
  { value: 'rapido', label: 'Treino rápido', perQuestion: 120000, hint: '2 min por questão' },
];
const CRITERIA = [
  { value: 'balanced', label: 'Equilibrado', icon: 'Layers', text: 'Prioriza questões inéditas e, depois, as que você errou.' },
  { value: 'weak', label: 'Pontos fracos', icon: 'Target', text: 'Cerca de 60% das questões vêm dos assuntos com menor acerto.' },
  { value: 'random', label: 'Aleatório', icon: 'Shuffle', text: 'Sorteio simples entre as questões disponíveis.' },
];
const durationText = ms => { const m = Math.round(ms / 60000); return m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${String(m % 60).padStart(2, '0')}min` : ''}` : `${m} min`; };

export function createConfigStudio({ E, root, account, records, save, toast, onStartPractice, onStartSimulation, onBack, saveToNotes }) {
  const $ = s => root.querySelector(s);
  const $$ = s => [...root.querySelectorAll(s)];
  let mode = 'practice';
  const practice = { tab: 'montar', subjectId: null, topicIds: [], subtopicIds: [], years: [], count: 10, timer: true, expanded: null, aiCount: 10 };
  const sim = { tab: 'conteudo', subjectIds: [], topicIds: [], subtopicIds: [], years: [], size: 20, criteria: 'balanced', pace: 'padrao', timerVisible: true, expanded: null };
  let lastSummary = null;
  let initialised = false;

  function init() {
    if (initialised) return;
    initialised = true;
    practice.count = account().study.defaultQuestionCount;
    practice.aiCount = practice.count;
    practice.timer = account().study.practiceTimer;
  }

  /* ---------------------------------------------------------------- */
  /* Dados                                                             */
  /* ---------------------------------------------------------------- */
  const stats = () => new Map(E.topicStats(records()).map(t => [t.topicId, t]));
  const recs = () => E.recommendTopics({ records: records(), difficultSubjects: account().onboarding.difficultSubjects, now: Date.now(), limit: 6 });
  function practicePool() { return E.availableForFilters({ subjectId: practice.subjectId, topicIds: practice.topicIds, subtopicIds: practice.subtopicIds, years: practice.years, count: practice.count }); }
  /** Simulado: união das matérias escolhidas (ou todas), respeitando assuntos, subtópicos e anos. */
  function simPool() {
    const subjects = sim.subjectIds.length ? sim.subjectIds : E.SUBJECTS.map(s => s.id);
    const out = [];
    for (const sid of subjects) {
      const subject = E.SUBJECT_BY_ID[sid];
      const topicIds = sim.topicIds.filter(t => subject.topics.some(x => x.id === t));
      const subtopicIds = sim.subtopicIds.filter(st => topicIds.some(t => st.startsWith(`${t}.`)));
      out.push(...E.questionRepository.query({ subjectId: sid, topicIds, subtopicIds, years: sim.years }));
    }
    return [...new Map(out.map(q => [q.id, q])).values()];
  }
  const pace = () => PACES.find(p => p.value === sim.pace);

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */
  function mount(nextMode) {
    init();
    mode = nextMode;
    lastSummary = null;
    root.innerHTML = `<div class="lg-page cfg" data-mode="${mode}">${headerHTML()}${tabsHTML()}<div id="cfg-panel" role="tabpanel">${panelHTML()}</div></div>`;
    bind();
    playReveal(root);
    playBars(root);
    enterSummary();
  }
  function headerHTML() {
    if (mode === 'practice') return pageHeader('Prática', 'Monte sua lista de questões', 'Escolha matéria, assuntos e quantidade — ou deixe as recomendações decidirem por você.');
    return `<button type="button" class="cfg-back" id="cfg-back" data-press>${hi('ArrowLeft')}Voltar às áreas</button>${pageHeader('Simulado personalizado', 'Monte seu simulado', 'Escolha matérias, assuntos, anos e o formato da prova. No simulado, a correção acontece só quando você finaliza.', `<span class="cfg-demo">${hi('Info')}Acervo demonstrativo: as questões são autorais, não provas oficiais.</span>`)}`;
  }
  function tabsHTML() {
    if (mode === 'practice') return tabs('cfg', practice.tab, [
      { value: 'montar', label: 'Montar lista', icon: 'Settings2' },
      { value: 'recomendadas', label: 'Recomendadas', icon: 'Brain', count: recs().length },
      { value: 'ia', label: 'IA escolhe por mim', icon: 'Wand2' },
    ]);
    return tabs('cfg', sim.tab, [
      { value: 'conteudo', label: 'Conteúdo', icon: 'Settings2' },
      { value: 'formato', label: 'Formato da prova', icon: 'Timer' },
    ]);
  }
  function panelHTML() {
    if (mode === 'practice') return practice.tab === 'montar' ? buildHTML() : practice.tab === 'recomendadas' ? recsHTML() : aiHTML();
    return buildHTML();
  }

  /** Estado unificado das duas versões (lista e simulado). */
  const S = () => (mode === 'practice' ? practice : sim);
  const selectedSubjects = () => (mode === 'practice' ? (practice.subjectId ? [practice.subjectId] : []) : sim.subjectIds);

  function subjectsCard() {
    const st = stats();
    const groups = AREA_ORDER.map(areaId => {
      const area = E.AREA_BY_ID[areaId];
      return `<div><p class="lg-section-label cfg-area-label">${esc(area.shortName)}</p><div class="cfg-pills" role="${mode === 'practice' ? 'radiogroup' : 'group'}" aria-label="${esc(area.shortName)}">${E.subjectsOfArea(areaId).map(s => {
        const on = selectedSubjects().includes(s.id);
        const answered = st.size ? s.topics.reduce((n, t) => n + (st.get(t.id)?.answered ?? 0), 0) : 0;
        return `<button type="button" class="cfg-pill ${on ? 'is-on' : ''}" role="${mode === 'practice' ? 'radio' : 'checkbox'}" aria-checked="${on}" data-subject="${s.id}" data-focus="subject-${s.id}" data-press="0.95">${on ? `<span class="cfg-pill-bg" ${mode === 'practice' ? 'data-indicator="subject-pill"' : ''}></span>` : ''}${hi(SUBJECT_ICON[s.id])}<span>${esc(s.name)}</span>${answered > 0 ? `<span class="cfg-pill-count">${answered}</span>` : ''}</button>`;
      }).join('')}</div></div>`;
    }).join('');
    const desc = mode === 'practice' ? 'Selecione uma matéria ou deixe em branco para misturar todas.' : 'Selecione uma ou mais matérias. Sem seleção, o simulado mistura as quatro áreas.';
    return card(`${cardHeader(mode === 'practice' ? '1. Matéria' : '1. Matérias e áreas', desc, tile('BookOpenCheck', 'gold'), mode === 'simulation' && sim.subjectIds.length ? btn('Limpar', { variant: 'ghost', size: 'sm', extra: { id: 'cfg-clear-subjects' } }) : '')}<div class="cfg-groups">${groups}</div>`);
  }

  function topicsCard() {
    const st = stats();
    const subjects = selectedSubjects().map(id => E.SUBJECT_BY_ID[id]);
    const s = S();
    let body;
    if (!subjects.length) {
      const weakest = E.rankTopics(records()).weakest.slice(0, 6);
      body = `<div class="cfg-weak"><p>Ou comece pelos assuntos em que você tem mais dificuldade:</p>${weakest.length ? `<div class="cfg-chips">${weakest.map(t => chip(`${esc(t.name)} <span class="cfg-chip-n">${pct(t.accuracy)}</span>`, false, { 'data-weak': t.topicId }, { icon: `<span class="cfg-warn">${hi('AlertTriangle')}</span>` })).join('')}</div>` : '<p class="cfg-nodata">Ainda não há dados suficientes. Responda algumas questões para descobrir seus pontos de atenção.</p>'}</div>`;
    } else {
      body = subjects.map(subject => `${subjects.length > 1 ? `<p class="lg-section-label cfg-topic-subject">${esc(subject.name)}</p>` : ''}<ul class="cfg-topics">${subject.topics.map(topic => {
        const on = s.topicIds.includes(topic.id);
        const open = s.expanded === topic.id;
        const t = st.get(topic.id);
        const count = E.questionRepository.query({ topicIds: [topic.id], years: s.years }).length;
        const weak = t && t.answered >= 4 && t.smoothed < 0.55;
        return `<li data-topic-row="${topic.id}"><div class="cfg-topic">${checkbox(on, `<span class="cfg-topic-name">${esc(topic.name)}</span>`, { 'data-topic': topic.id, 'data-focus': `topic-${topic.id}` })}${weak ? badge('Maior dificuldade', 'coral', 'AlertTriangle', 'sm') : ''}<span class="cfg-topic-count">${count} ${count === 1 ? 'questão' : 'questões'}${t ? ` · ${pct(t.accuracy)} de acerto` : ''}</span>${topic.subtopics.length > 1 ? `<button type="button" class="cfg-expand" data-expand="${topic.id}" aria-expanded="${open}" aria-label="${open ? 'Ocultar' : 'Mostrar'} subtópicos de ${esc(topic.name)}"><span class="cfg-expand-chev" style="${open ? 'rotate:180deg' : ''}">${hi('ChevronDown')}</span></button>` : ''}</div>${open && topic.subtopics.length > 1 ? subtopicsHTML(topic) : ''}</li>`;
      }).join('')}</ul>`).join('');
    }
    const desc = subjects.length === 1 ? `Marque um ou mais assuntos de ${esc(subjects[0].name)}. Sem marcação, todos entram.` : subjects.length > 1 ? 'Marque assuntos de cada matéria. Matérias sem marcação entram com todos os assuntos.' : 'Escolha uma matéria para ver os assuntos.';
    return card(`${cardHeader('2. Assuntos e subtópicos', desc, tile('Layers', 'sage'))}${body}`);
  }
  const subtopicsHTML = topic => `<div class="cfg-collapse"><div class="cfg-subs">${topic.subtopics.map(sub => chip(esc(sub.name), S().subtopicIds.includes(sub.id), { 'data-sub': sub.id, 'data-parent': topic.id, 'data-focus': `sub-${sub.id}` })).join('')}</div></div>`;

  function yearsBlock() {
    const s = S();
    return `${cardHeader(mode === 'practice' ? '4. Ano de referência' : '3. Anos de referência', 'Filtro opcional. Sem seleção, todos os anos.', tile('CalendarRange', 'matematica'))}<div class="cfg-chips">${E.REFERENCE_YEARS.map(y => chip(String(y), s.years.includes(y), { 'data-year': y, 'data-focus': `year-${y}` }, { tone: 'ink' })).join('')}</div><p class="cfg-hint">No acervo demonstrativo, o ano é apenas uma etiqueta de referência — as questões não são provas oficiais.</p>`;
  }

  function buildHTML() {
    if (mode === 'practice') {
      return `<div class="lg-grid"><div class="lg-col-8 lg-stack" data-stagger="0.06">
        ${subjectsCard()}${topicsCard()}
        ${card(`<div class="cfg-two"><div>${cardHeader('3. Quantidade', 'Número de questões da lista.', tile('ListChecks', 'coral'))}${seg('count', practice.count, E.PRACTICE_COUNTS.map(c => ({ value: c, label: String(c) })), { aria: 'Quantidade de questões' })}</div><div>${yearsBlock()}</div></div>`)}
      </div>${summaryHTML()}</div>`;
    }
    const content = sim.tab === 'conteudo'
      ? `${subjectsCard()}${topicsCard()}${card(yearsBlock())}`
      : `${card(`${cardHeader('4. Tamanho do simulado', 'Quantidade de questões da prova.', tile('ListChecks', 'coral'))}${seg('size', sim.size, E.SIMULATION_SIZES.map(c => ({ value: c, label: String(c) })), { aria: 'Tamanho do simulado' })}<p class="cfg-hint">As questões são agrupadas por área, na ordem da prova.</p>`)}
         ${card(`${cardHeader('5. Critério de seleção', 'Como as questões são escolhidas entre as disponíveis.', tile('Shuffle', 'sage'))}<div class="cfg-criteria" role="radiogroup" aria-label="Critério de seleção">${CRITERIA.map(c => `<button type="button" role="radio" class="cfg-criterion ${sim.criteria === c.value ? 'is-on' : ''}" aria-checked="${sim.criteria === c.value}" data-criteria="${c.value}" data-focus="crit-${c.value}" data-press="0.98">${sim.criteria === c.value ? '<span class="cfg-criterion-ring" data-indicator="criteria"></span>' : ''}${tile(c.icon, sim.criteria === c.value ? 'gold' : 'neutral', 'sm')}<strong>${c.label}</strong><span>${c.text}</span></button>`).join('')}</div>`)}
         ${card(`${cardHeader('6. Cronômetro', 'Tempo total da prova, em contagem regressiva.', tile('Hourglass', 'gold'))}${seg('pace', sim.pace, PACES.map(p => ({ value: p.value, label: p.label })), { aria: 'Ritmo do cronômetro' })}<p class="cfg-hint">${pace().hint}. Faltando 15 minutos, você recebe um aviso.</p><div class="cfg-switch">${switchRow('cfg-timer-visible', sim.timerVisible, 'Cronômetro visível', 'Você pode ocultá-lo durante a prova; o tempo continua contando.')}</div>`)}
         ${card(`<div class="cfg-rules">${tile('Lock', 'ink', 'sm')}<div><strong>Regras do simulado</strong><ul><li>Sem correção imediata: o gabarito aparece só ao finalizar.</li><li>Questões em branco contam como erro.</li><li>Ao fim do tempo, a prova é encerrada automaticamente.</li><li>Pausar oculta as questões e para o relógio.</li></ul></div></div>`, { surface: 'muted' })}`;
    return `<div class="lg-grid"><div class="lg-col-8 lg-stack" data-stagger="0.06" id="cfg-tab-content">${content}</div>${summaryHTML()}</div>`;
  }

  function summaryValues() {
    if (mode === 'practice') {
      const pool = practicePool();
      const subject = practice.subjectId ? E.SUBJECT_BY_ID[practice.subjectId] : null;
      return {
        count: Math.min(practice.count, pool.length), available: pool.length, wanted: practice.count,
        rows: [['Matéria', subject?.name ?? 'Todas'], ['Assuntos', practice.topicIds.length ? practice.topicIds.map(t => E.TOPIC_BY_ID[t]?.name).join(', ') : 'Todos'], ...(practice.subtopicIds.length ? [['Subtópicos', `${practice.subtopicIds.length} selecionados`]] : []), ['Anos', practice.years.length ? [...practice.years].sort((a, b) => b - a).join(', ') : 'Todos'], ['Disponíveis', `${pool.length} no acervo`]],
      };
    }
    const pool = simPool();
    const n = Math.min(sim.size, pool.length);
    const areas = [...new Set(pool.map(q => q.areaId))];
    return {
      count: n, available: pool.length, wanted: sim.size,
      rows: [
        ['Matérias', sim.subjectIds.length ? sim.subjectIds.map(id => E.SUBJECT_BY_ID[id].name).join(', ') : 'Todas'],
        ['Áreas', areas.length === 4 ? 'As quatro áreas' : areas.map(a => E.AREA_BY_ID[a].shortName).join(', ') || '—'],
        ['Assuntos', sim.topicIds.length ? `${sim.topicIds.length} selecionados` : 'Todos'],
        ['Anos', sim.years.length ? [...sim.years].sort((a, b) => b - a).join(', ') : 'Todos'],
        ['Critério', CRITERIA.find(c => c.value === sim.criteria).label],
        ['Duração', n ? durationText(n * pace().perQuestion) : '—'],
        ['Correção', 'Ao finalizar'],
        ['Disponíveis', `${pool.length} no acervo`],
      ],
    };
  }
  function summaryHTML() {
    const v = summaryValues();
    const warn = v.available < v.wanted ? (v.available === 0 ? 'Nenhuma questão com esses filtros. Remova algum filtro para continuar.' : `Há apenas ${v.available} questões com esses filtros. ${mode === 'practice' ? 'A lista' : 'O simulado'} terá ${v.available}.`) : '';
    return `<aside class="lg-col-4 lg-sticky cfg-summary" id="cfg-summary">${card(`
      <p class="cfg-sum-label">${mode === 'practice' ? 'Resumo da lista' : 'Resumo do simulado'}</p>
      <p class="cfg-sum-count"><span id="cfg-count" data-value="${lastSummary?.count ?? v.count}">${lastSummary?.count ?? v.count}</span><span>questões</span></p>
      <dl class="cfg-sum-rows">${v.rows.map(([k, val]) => `<div><dt>${k}</dt><dd><span data-row="${esc(k)}">${esc(val)}</span></dd></div>`).join('')}</dl>
      <div class="cfg-warn-box" id="cfg-warn" ${warn ? '' : 'hidden'}><p>${hi('AlertTriangle')}<span>${warn}</span></p></div>
      <div class="cfg-sum-switch">${mode === 'practice' ? switchRow('cfg-timer', practice.timer, 'Cronômetro visível', 'Você pode ocultá-lo durante a lista.') : `<p class="cfg-sum-note">${hi('Info')}Sem correção imediata. O resultado, com gabarito e explicações, aparece ao finalizar.</p>`}</div>
      ${btn(mode === 'practice' ? 'Começar lista' : 'Começar simulado', { variant: 'accent', size: 'lg', icon: 'Play', full: true, cls: 'cfg-start', extra: { id: 'cfg-start', ...(v.available ? {} : { disabled: true }) } })}
      ${mode === 'simulation' ? `<button type="button" class="cfg-save-note" id="cfg-note">${hi('NotebookPen')}Guardar esta configuração nas notas</button>` : ''}`, { padded: 'lg' })}</aside>`;
  }
  /** Resumo: número animado, linhas que trocam com fade (AnimatePresence) e aviso com Collapse. */
  function enterSummary() {
    const v = summaryValues();
    const aside = $('#cfg-summary');
    if (!aside) return;
    if (!lastSummary) {
      animate(aside, { opacity: [0, 1], x: [16, 0] }, { ...spring.soft, delay: 0.15 });
      const c = $('#cfg-count'); c.dataset.value = '0'; countTo(c, v.count, { seconds: 0.4 });
    } else {
      countTo($('#cfg-count'), v.count, { from: lastSummary.count, seconds: 0.4 });
      const prev = new Map(lastSummary.rows);
      v.rows.forEach(([k, val]) => { if (prev.get(k) !== val) animate(aside.querySelector(`[data-row="${CSS.escape(k)}"]`), { opacity: [0, 1], y: [4, 0] }, { duration: 0.15 }); });
      const warnNow = v.available < v.wanted, warnBefore = lastSummary.available < lastSummary.wanted;
      const box = $('#cfg-warn');
      if (warnNow && !warnBefore) { box.hidden = false; collapse(box, true); }
      else if (!warnNow && warnBefore) { box.hidden = false; collapse(box, false).then(() => { box.hidden = true; box.style.height = ''; box.style.opacity = ''; }); }
    }
    lastSummary = v;
  }

  function recsHTML() {
    const list = recs();
    return `<div class="cfg-recs" data-stagger="0.06">${list.map(rec => card(`<div class="cfg-rec-top">${tile(SUBJECT_ICON[rec.subjectId], rec.areaId, 'lg')}${badge(esc(E.RECOMMENDATION_LABEL[rec.kind]), rec.kind === 'desempenho' ? 'coral' : rec.kind === 'dificuldade' ? 'gold' : rec.kind === 'revisao' ? 'sage' : 'neutral')}</div>
      <p class="cfg-rec-subject">${esc(rec.subjectName)}</p><h3 class="cfg-rec-title">${esc(rec.topicName)}</h3><p class="cfg-rec-reason">${esc(rec.reason)}</p>
      ${rec.accuracy !== null ? `<div class="cfg-rec-acc"><div><span>Seu acerto</span><b>${pct(rec.accuracy)}</b></div>${progress(rec.accuracy, rec.accuracy < 0.5 ? 'coral' : 'sage', { thin: true })}</div>` : ''}
      <div class="cfg-rec-foot"><span>${rec.available} questões disponíveis</span><span class="cfg-rec-go">Praticar ${Math.min(account().study.defaultQuestionCount, rec.available)} ${hi('ArrowRight')}</span></div>`, { tag: 'button', cls: 'is-interactive cfg-rec', extra: { 'data-rec': rec.topicId, type: 'button' } })).join('')}</div>
      <p class="cfg-method">As recomendações combinam seu acerto por assunto (com suavização para poucos dados), as matérias marcadas como dificuldade e o tempo desde o último contato.</p>`;
  }
  function aiHTML() {
    const preview = E.buildAutoSelection(account(), records(), practice.aiCount, Date.now(), 'preview');
    return `<div class="lg-grid">
      ${card(`<div class="cfg-dots" aria-hidden="true"></div><div class="cfg-ai">
        <span class="cfg-ai-icon" id="cfg-ai-icon">${hi('Sparkles')}</span>
        <h2>Deixe a seleção com a gente</h2>
        <p>Montamos uma lista equilibrando seus pontos de atenção, as matérias que você marcou como difíceis e assuntos que precisam de revisão.</p>
        <p class="cfg-ai-q">Quantas questões?</p>
        <div class="cfg-ai-seg" role="radiogroup" aria-label="Quantidade">${E.PRACTICE_COUNTS.map(c => `<button type="button" role="radio" aria-checked="${practice.aiCount === c}" data-ai="${c}" data-focus="ai-${c}">${practice.aiCount === c ? '<span data-indicator="ai-count"></span>' : ''}<b>${c}</b></button>`).join('')}</div>
        <div class="cfg-ai-actions">${btn('Gerar e começar', { variant: 'accent', size: 'lg', icon: 'Wand2', extra: { id: 'cfg-ai-start' } })}</div>
        <p class="cfg-ai-note">Demonstração local: a seleção usa regras simples no próprio navegador, sem modelos de IA ou serviços externos.</p>
      </div>`, { surface: 'ink', padded: 'lg', cls: 'lg-col-7 cfg-ai-card' })}
      ${card(`${cardHeader('Como a lista seria composta', esc(preview.summary), tile('Shuffle', 'sage'))}<ul class="cfg-ai-list">${preview.topics.map((t, i) => { const n = preview.questionIds.filter(id => E.questionRepository.getById(id)?.topicId === t.topicId).length; return `<li data-ai-row style="--i:${i}"><div><span><strong>${esc(t.topicName)}</strong> · ${esc(t.subjectName)}</span><b>${n} q.</b></div>${progress(practice.aiCount ? n / practice.aiCount : 0, t.areaId, { thin: true, delay: 0.1 + i * 0.06 })}<p>${esc(E.RECOMMENDATION_LABEL[t.kind])}</p></li>`; }).join('')}</ul><p class="cfg-ai-foot">${hi('Timer')} Prioriza questões inéditas e, depois, as que você errou.</p>`, { cls: 'lg-col-5' })}
    </div>`;
  }

  /* ---------------------------------------------------------------- */
  /* Eventos                                                           */
  /* ---------------------------------------------------------------- */
  function update({ panel = true, changedKey = null } = {}) {
    if (panel) {
      rerender(root, () => { $('#cfg-panel').innerHTML = panelHTML(); bind(); });
      playBars(root);
      if (changedKey) {
        const el = root.querySelector(`[data-focus="${CSS.escape(changedKey)}"] .lg-chip-check`);
        if (el) animate(el, { width: [0, 14], opacity: [0, 1], scale: [0.5, 1] }, spring.snappy);
        const bg = root.querySelector(`[data-focus="${CSS.escape(changedKey)}"] .cfg-pill-bg:not([data-indicator])`);
        if (bg) animate(bg, { opacity: [0, 1], scale: [0.9, 1] }, spring.layout);
      }
    }
    else {
      // Só o resumo muda (ex.: marcar um assunto): troca o painel lateral e anima as diferenças.
      const aside = $('#cfg-summary');
      if (aside) { aside.outerHTML = summaryHTML(); $('#cfg-summary').style.opacity = '1'; bind(); }
    }
    enterSummary();
  }
  function switchTab(tab) {
    const s = S();
    if (tab === s.tab) return;
    s.tab = tab;
    const panel = $('#cfg-panel');
    animate(panel, { opacity: [1, 0], y: [0, -6] }, { duration: duration.fast }).then(() => {
      lastSummary = null;
      rerender(root, () => { root.querySelector('.lg-tabs').outerHTML = tabsHTML(); panel.innerHTML = panelHTML(); bind(); });
      panel.style.transform = '';
      tabContentIn(panel);
      playReveal(panel); playBars(root); enterSummary();
      if (mode === 'simulation' && $('#cfg-summary')) $('#cfg-summary').style.opacity = '1';
      root.querySelector(`#tab-cfg-${tab}`)?.focus({ preventScroll: true });
      if (tab === 'ia') aiEnter();
    });
  }
  function aiEnter() {
    $$('[data-ai-row]').forEach((el, i) => animate(el, { opacity: [0, 1], x: [10, 0] }, { duration: duration.slow, ease: ease.out, delay: 0.1 + i * 0.06 }));
    const icon = $('#cfg-ai-icon');
    if (icon && !reduced()) icon.animate([{ transform: 'rotate(0)', offset: 0 }, { transform: 'rotate(-8deg)', offset: 0.15 }, { transform: 'rotate(8deg)', offset: 0.3 }, { transform: 'rotate(0)', offset: 0.44 }, { transform: 'rotate(0)', offset: 1 }], { duration: 5400, iterations: Infinity });
  }

  function toggleSubject(id) {
    if (mode === 'practice') { practice.subjectId = practice.subjectId === id ? null : id; practice.topicIds = []; practice.subtopicIds = []; practice.expanded = null; }
    else {
      const on = sim.subjectIds.includes(id);
      sim.subjectIds = on ? sim.subjectIds.filter(x => x !== id) : [...sim.subjectIds, id];
      if (on) { const topics = E.SUBJECT_BY_ID[id].topics.map(t => t.id); sim.topicIds = sim.topicIds.filter(t => !topics.includes(t)); sim.subtopicIds = sim.subtopicIds.filter(st => !topics.some(t => st.startsWith(`${t}.`))); }
    }
    update({ changedKey: `subject-${id}` });
  }
  /** Subtópicos abrem com Collapse e chevron girando, sem redesenhar a lista. */
  function toggleExpand(topicId) {
    const s = S();
    const prev = s.expanded;
    s.expanded = prev === topicId ? null : topicId;
    if (prev) {
      const li = root.querySelector(`[data-topic-row="${prev}"]`);
      const box = li?.querySelector('.cfg-collapse');
      li?.querySelector('[data-expand]')?.setAttribute('aria-expanded', 'false');
      rotateChevron(li?.querySelector('.cfg-expand-chev'), false);
      if (box) collapse(box, false).then(() => box.remove());
    }
    if (s.expanded) {
      const li = root.querySelector(`[data-topic-row="${topicId}"]`);
      const topic = E.TOPIC_BY_ID[topicId];
      if (!li || !topic) return;
      li.querySelector('[data-expand]').setAttribute('aria-expanded', 'true');
      rotateChevron(li.querySelector('.cfg-expand-chev'), true);
      li.insertAdjacentHTML('beforeend', subtopicsHTML(topic));
      bindSubs(li);
      collapse(li.querySelector('.cfg-collapse'), true);
    }
  }
  function bindSubs(scope) {
    scope.querySelectorAll('[data-sub]').forEach(b => b.onclick = () => {
      const s = S(); const id = b.dataset.sub; const on = s.subtopicIds.includes(id);
      s.subtopicIds = on ? s.subtopicIds.filter(x => x !== id) : [...s.subtopicIds, id];
      if (!s.topicIds.includes(b.dataset.parent)) s.topicIds = [...s.topicIds, b.dataset.parent];
      update({ changedKey: `sub-${id}` });
    });
  }

  function bind() {
    const back = $('#cfg-back'); if (back) back.onclick = onBack;
    $$('[data-tab-group="cfg"]').forEach(b => b.onclick = () => switchTab(b.dataset.tab));
    bindTabKeys(root, 'cfg', switchTab);
    $$('[data-subject]').forEach(b => b.onclick = () => toggleSubject(b.dataset.subject));
    const clr = $('#cfg-clear-subjects'); if (clr) clr.onclick = () => { sim.subjectIds = []; sim.topicIds = []; sim.subtopicIds = []; update(); };
    $$('[data-weak]').forEach(b => b.onclick = () => {
      const t = E.TOPIC_BY_ID[b.dataset.weak];
      const s = S();
      if (mode === 'practice') practice.subjectId = t.subjectId; else if (!sim.subjectIds.includes(t.subjectId)) sim.subjectIds = [...sim.subjectIds, t.subjectId];
      s.topicIds = [t.id]; s.subtopicIds = []; s.expanded = t.id;
      update();
    });
    $$('[data-topic]').forEach(input => input.onchange = () => {
      const s = S(); const id = input.dataset.topic;
      s.topicIds = input.checked ? [...s.topicIds, id] : s.topicIds.filter(t => t !== id);
      if (!input.checked) s.subtopicIds = s.subtopicIds.filter(x => !x.startsWith(`${id}.`));
      $$('.cfg-subs [data-parent]').forEach(c => { if (c.dataset.parent === id && !input.checked) c.setAttribute('aria-checked', 'false'); });
      update({ panel: false });
    });
    $$('[data-expand]').forEach(b => b.onclick = () => toggleExpand(b.dataset.expand));
    bindSubs(root);
    $$('[data-year]').forEach(b => b.onclick = () => { const s = S(); const y = Number(b.dataset.year); s.years = s.years.includes(y) ? s.years.filter(x => x !== y) : [...s.years, y]; update({ changedKey: `year-${y}` }); });
    $$('[data-seg]').forEach(b => b.onclick = () => {
      if (b.getAttribute('aria-checked') === 'true') return;
      const v = b.dataset.value;
      if (b.dataset.seg === 'count') practice.count = Number(v);
      if (b.dataset.seg === 'size') sim.size = Number(v);
      if (b.dataset.seg === 'pace') sim.pace = v;
      update();
    });
    $$('[data-criteria]').forEach(b => b.onclick = () => { if (sim.criteria === b.dataset.criteria) return; sim.criteria = b.dataset.criteria; update(); });
    const timer = $('#cfg-timer');
    if (timer) timer.onclick = () => { practice.timer = !practice.timer; animateSwitch(timer, practice.timer); account().study.practiceTimer = practice.timer; save(); };
    const tv = $('#cfg-timer-visible');
    if (tv) tv.onclick = () => { sim.timerVisible = !sim.timerVisible; animateSwitch(tv, sim.timerVisible); };
    const st = $('#cfg-start'); if (st) st.onclick = start;
    const nt = $('#cfg-note'); if (nt) nt.onclick = e => saveToNotes({ kind: 'custom-sim' }, e.currentTarget);
    $$('[data-rec]').forEach(b => b.onclick = () => startRec(b.dataset.rec));
    $$('[data-ai]').forEach(b => b.onclick = () => { if (practice.aiCount === Number(b.dataset.ai)) return; practice.aiCount = Number(b.dataset.ai); update(); aiEnter(); });
    const ais = $('#cfg-ai-start'); if (ais) ais.onclick = (() => { const sel = E.buildAutoSelection(account(), records(), practice.aiCount, Date.now(), Date.now()); onStartPractice('Seleção automática', sel.questionIds, 'auto', { ...E.EMPTY_FILTERS, count: sel.questionIds.length }); });
  }

  function startRec(topicId) {
    const t = E.TOPIC_BY_ID[topicId];
    const n = account().study.defaultQuestionCount;
    const f = { ...E.EMPTY_FILTERS, subjectId: t.subjectId, topicIds: [topicId], count: n };
    onStartPractice(t.name, E.selectPracticeQuestions(f, records(), E.freshSeed(), account().onboarding.level), 'recommended', f);
  }

  function start() {
    if (mode === 'practice') {
      const pool = practicePool();
      const f = { subjectId: practice.subjectId, topicIds: [...practice.topicIds], subtopicIds: [...practice.subtopicIds], years: [...practice.years], count: Math.min(practice.count, pool.length) };
      const ids = E.selectPracticeQuestions(f, records(), Date.now(), account().onboarding.level);
      const subject = practice.subjectId ? E.SUBJECT_BY_ID[practice.subjectId] : null;
      const names = practice.topicIds.map(t => E.TOPIC_BY_ID[t]?.name).filter(Boolean);
      const title = names.length === 1 ? names[0] : subject ? (names.length ? `${subject.name} · ${names.length} assuntos` : subject.name) : 'Lista personalizada';
      onStartPractice(title, ids, 'custom', f);
      return;
    }
    const pool = simPool();
    const n = Math.min(sim.size, pool.length);
    if (!n) return;
    const rs = records();
    const rng = E.createRng(Date.now());
    let chosen;
    if (sim.criteria === 'random') chosen = E.shuffle(pool, rng).slice(0, n);
    else if (sim.criteria === 'weak') {
      const weakTopics = new Set(E.recommendTopics({ records: rs, difficultSubjects: account().onboarding.difficultSubjects, now: Date.now(), limit: 10, maxPerSubject: 3 }).map(t => t.topicId));
      const weakPool = pool.filter(q => weakTopics.has(q.topicId));
      const first = E.pickQuestions(weakPool, Math.ceil(n * 0.6), rs, rng);
      const taken = new Set(first.map(q => q.id));
      chosen = [...first, ...E.pickQuestions(pool.filter(q => !taken.has(q.id)), n - first.length, rs, rng)];
    } else chosen = E.pickQuestions(pool, n, rs, rng);
    const names = sim.subjectIds.map(id => E.SUBJECT_BY_ID[id].name);
    const title = names.length === 1 ? `Simulado personalizado · ${names[0]}` : names.length > 1 ? `Simulado personalizado · ${names.length} matérias` : `Simulado personalizado · ${chosen.length} questões`;
    onStartSimulation({ title, questionIds: chosen.map(q => q.id), durationMs: chosen.length * pace().perQuestion, timerHidden: !sim.timerVisible, criteria: sim.criteria });
  }

  return { mount, config: () => ({ ...sim }) };
}
