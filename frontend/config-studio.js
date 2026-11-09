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
  const practice = { tab: 'montar', subjectIds: [], topicIds: [], subtopicIds: [], years: [], count: 10, timer: true, expanded: null, aiCount: 10, openBlock: null, picker: false };
  const sim = { tab: 'conteudo', subjectIds: [], topicIds: [], subtopicIds: [], years: [], size: 20, criteria: 'balanced', pace: 'padrao', timerVisible: true, expanded: null, openBlock: null, picker: false };
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
  /** União das matérias escolhidas (ou todas), respeitando assuntos, subtópicos e anos. */
  function poolFor(st) {
    const subjects = st.subjectIds.length ? st.subjectIds : E.SUBJECTS.map(x => x.id);
    const out = [];
    for (const sid of subjects) {
      const subject = E.SUBJECT_BY_ID[sid];
      const topicIds = st.topicIds.filter(t => subject.topics.some(x => x.id === t));
      const subtopicIds = st.subtopicIds.filter(sub => topicIds.some(t => sub.startsWith(`${t}.`)));
      out.push(...E.questionRepository.query({ subjectId: sid, topicIds, subtopicIds, years: st.years }));
    }
    return [...new Map(out.map(q => [q.id, q])).values()];
  }
  const practicePool = () => poolFor(practice);
  const simPool = () => poolFor(sim);
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
    if (mode === 'practice') return pageHeader('Prática', 'Monte sua lista de questões', 'Adicione as matérias que quer estudar e, se quiser, escolha assuntos e subtópicos. Sem quantidade fixa: responda quantas quiser.');
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
  const selectedSubjects = () => S().subjectIds;

  /** Quantas questões uma matéria contribui com os filtros atuais. */
  function subjectCount(sid) {
    const st = S();
    const subject = E.SUBJECT_BY_ID[sid];
    const topicIds = st.topicIds.filter(t => subject.topics.some(x => x.id === t));
    const subtopicIds = st.subtopicIds.filter(sub => topicIds.some(t => sub.startsWith(`${t}.`)));
    return E.questionRepository.query({ subjectId: sid, topicIds, subtopicIds, years: st.years }).length;
  }
  function blockSummary(sid) {
    const subject = E.SUBJECT_BY_ID[sid];
    const chosen = S().topicIds.filter(t => subject.topics.some(x => x.id === t)).length;
    const n = subjectCount(sid);
    return `${chosen ? `${chosen} ${chosen === 1 ? 'assunto' : 'assuntos'}` : 'Todos os assuntos'} · ${n} ${n === 1 ? 'questão' : 'questões'}`;
  }
  function topicRowsHTML(subject) {
    const st = stats();
    const s = S();
    return `<ul class="cfg-topics">${subject.topics.map(topic => {
      const on = s.topicIds.includes(topic.id);
      const open = s.expanded === topic.id;
      const t = st.get(topic.id);
      const count = E.questionRepository.query({ topicIds: [topic.id], years: s.years }).length;
      const weak = t && t.answered >= 4 && t.smoothed < 0.55;
      return `<li data-topic-row="${topic.id}"><div class="cfg-topic">${checkbox(on, `<span class="cfg-topic-name">${esc(topic.name)}</span>`, { 'data-topic': topic.id, 'data-focus': `topic-${topic.id}` })}${weak ? badge('Maior dificuldade', 'coral', 'AlertTriangle', 'sm') : ''}<span class="cfg-topic-count">${count} ${count === 1 ? 'questão' : 'questões'}${t ? ` · ${pct(t.accuracy)} de acerto` : ''}</span>${topic.subtopics.length > 1 ? `<button type="button" class="cfg-expand" data-expand="${topic.id}" aria-expanded="${open}" aria-label="${open ? 'Ocultar' : 'Mostrar'} subtópicos de ${esc(topic.name)}"><span class="cfg-expand-chev" style="${open ? 'rotate:180deg' : ''}">${hi('ChevronDown')}</span></button>` : ''}</div>${open && topic.subtopics.length > 1 ? subtopicsHTML(topic) : ''}</li>`;
    }).join('')}</ul>`;
  }
  function blockHTML(sid) {
    const subject = E.SUBJECT_BY_ID[sid];
    const area = E.AREA_BY_ID[subject.areaId];
    const open = S().openBlock === sid;
    return `<section class="cfg-block ${open ? 'is-open' : ''}" data-block="${sid}" data-area="${subject.areaId}">
      <header class="cfg-block-head">
        <button type="button" class="cfg-block-toggle" data-block-toggle="${sid}" aria-expanded="${open}" aria-controls="cfg-block-body-${sid}">
          ${tile(SUBJECT_ICON[sid], subject.areaId, 'sm')}
          <span class="cfg-block-copy"><strong>${esc(subject.name)}</strong><small><span>${esc(area.shortName)}</span> · <span data-block-summary="${sid}">${blockSummary(sid)}</span></small></span>
          <span class="cfg-block-chev" style="${open ? 'rotate:180deg' : ''}">${hi('ChevronDown')}</span>
        </button>
        <button type="button" class="cfg-block-remove" data-remove="${sid}" aria-label="Remover ${esc(subject.name)}" title="Remover matéria">${hi('X')}</button>
      </header>
      ${open ? `<div class="cfg-block-body" id="cfg-block-body-${sid}">${topicRowsHTML(subject)}</div>` : ''}
    </section>`;
  }
  function pickerHTML() {
    const chosen = S().subjectIds;
    return `<div class="cfg-picker" id="cfg-picker" role="dialog" aria-label="Escolher matéria">
      <div class="cfg-picker-head"><strong>Escolha uma matéria</strong><button type="button" class="cfg-picker-close" id="cfg-picker-close" aria-label="Fechar seletor">${hi('X')}</button></div>
      <div class="cfg-picker-groups">${AREA_ORDER.map(areaId => `<div class="cfg-picker-group"><p class="lg-section-label">${esc(E.AREA_BY_ID[areaId].shortName)}</p><div class="cfg-picker-items">${E.subjectsOfArea(areaId).map(sub => {
        const added = chosen.includes(sub.id);
        const n = E.questionRepository.query({ subjectId: sub.id, years: S().years }).length;
        return `<button type="button" class="cfg-pick ${added ? 'is-added' : ''}" data-pick="${sub.id}" data-area="${areaId}" ${added ? 'disabled aria-disabled="true"' : ''}>${tile(SUBJECT_ICON[sub.id], areaId, 'sm')}<span><strong>${esc(sub.name)}</strong><small>${added ? 'Já adicionada' : `${n} ${n === 1 ? 'questão' : 'questões'}`}</small></span>${added ? hi('Check') : hi('Plus')}</button>`;
      }).join('')}</div></div>`).join('')}</div>
    </div>`;
  }
  function blocksCard() {
    const s = S();
    const weakest = s.subjectIds.length ? [] : E.rankTopics(records()).weakest.slice(0, 6);
    const desc = s.subjectIds.length
      ? 'Abra uma matéria para escolher assuntos. Matérias sem assunto marcado entram inteiras.'
      : (mode === 'practice' ? 'Sem matérias, a lista mistura todo o acervo.' : 'Sem matérias, o simulado mistura as quatro áreas.');
    const emptyHTML = s.subjectIds.length ? '' : `<div class="cfg-empty-blocks"><p>Nenhuma matéria adicionada ainda.</p>${weakest.length ? `<div class="cfg-weak"><p>Ou comece pelos assuntos em que você tem mais dificuldade:</p><div class="cfg-chips">${weakest.map(t => chip(`${esc(t.name)} <span class="cfg-chip-n">${pct(t.accuracy)}</span>`, false, { 'data-weak': t.topicId }, { icon: `<span class="cfg-warn">${hi('AlertTriangle')}</span>` })).join('')}</div></div>` : ''}</div>`;
    return card(`${cardHeader('1. Matérias e assuntos', desc, tile('BookOpenCheck', 'gold'), s.subjectIds.length ? btn('Limpar', { variant: 'ghost', size: 'sm', extra: { id: 'cfg-clear-subjects' } }) : '')}
      <div class="cfg-blocks" id="cfg-blocks">${s.subjectIds.map(blockHTML).join('')}</div>${emptyHTML}
      <div class="cfg-add-wrap"><button type="button" class="cfg-add" id="cfg-add" aria-expanded="${s.picker}" aria-controls="cfg-picker" data-press="0.97"><span class="cfg-add-plus">${hi('Plus')}</span>${s.subjectIds.length ? 'Adicionar outra matéria' : 'Adicionar matéria'}</button>${s.picker ? pickerHTML() : ''}</div>`, { cls: 'cfg-subjects-card' });
  }
  const subtopicsHTML = topic => `<div class="cfg-collapse"><div class="cfg-subs">${topic.subtopics.map(sub => chip(esc(sub.name), S().subtopicIds.includes(sub.id), { 'data-sub': sub.id, 'data-parent': topic.id, 'data-focus': `sub-${sub.id}` })).join('')}</div></div>`;

  function yearsBlock() {
    const s = S();
    return `${cardHeader(mode === 'practice' ? '2. Ano de referência' : '2. Anos de referência', 'Filtro opcional. Sem seleção, todos os anos.', tile('CalendarRange', 'matematica'))}<div class="cfg-chips">${E.REFERENCE_YEARS.map(y => chip(String(y), s.years.includes(y), { 'data-year': y, 'data-focus': `year-${y}` }, { tone: 'ink' })).join('')}</div><p class="cfg-hint">No acervo demonstrativo, o ano é apenas uma etiqueta de referência — as questões não são provas oficiais.</p>`;
  }

  function buildHTML() {
    if (mode === 'practice') {
      return `<div class="lg-grid"><div class="lg-col-8 lg-stack" data-stagger="0.06">
        ${blocksCard()}
        ${card(yearsBlock())}
      </div>${summaryHTML()}</div>`;
    }
    const content = sim.tab === 'conteudo'
      ? `${blocksCard()}${card(yearsBlock())}`
      : `${card(`${cardHeader('3. Tamanho do simulado', 'Quantidade de questões da prova.', tile('ListChecks', 'coral'))}${seg('size', sim.size, E.SIMULATION_SIZES.map(c => ({ value: c, label: String(c) })), { aria: 'Tamanho do simulado' })}<p class="cfg-hint">As questões são agrupadas por área, na ordem da prova.</p>`)}
         ${card(`${cardHeader('4. Critério de seleção', 'Como as questões são escolhidas entre as disponíveis.', tile('Shuffle', 'sage'))}<div class="cfg-criteria" role="radiogroup" aria-label="Critério de seleção">${CRITERIA.map(c => `<button type="button" role="radio" class="cfg-criterion ${sim.criteria === c.value ? 'is-on' : ''}" aria-checked="${sim.criteria === c.value}" data-criteria="${c.value}" data-focus="crit-${c.value}" data-press="0.98">${sim.criteria === c.value ? '<span class="cfg-criterion-ring" data-indicator="criteria"></span>' : ''}${tile(c.icon, sim.criteria === c.value ? 'gold' : 'neutral', 'sm')}<strong>${c.label}</strong><span>${c.text}</span></button>`).join('')}</div>`)}
         ${card(`${cardHeader('5. Cronômetro', 'Tempo total da prova, em contagem regressiva.', tile('Hourglass', 'gold'))}${seg('pace', sim.pace, PACES.map(p => ({ value: p.value, label: p.label })), { aria: 'Ritmo do cronômetro' })}<p class="cfg-hint">${pace().hint}. Faltando 15 minutos, você recebe um aviso.</p><div class="cfg-switch">${switchRow('cfg-timer-visible', sim.timerVisible, 'Cronômetro visível', 'Você pode ocultá-lo durante a prova; o tempo continua contando.')}</div>`)}
         ${card(`<div class="cfg-rules">${tile('Lock', 'ink', 'sm')}<div><strong>Regras do simulado</strong><ul><li>Sem correção imediata: o gabarito aparece só ao finalizar.</li><li>Questões em branco contam como erro.</li><li>Ao fim do tempo, a prova é encerrada automaticamente.</li><li>Pausar oculta as questões e para o relógio.</li></ul></div></div>`, { surface: 'muted' })}`;
    return `<div class="lg-grid"><div class="lg-col-8 lg-stack" data-stagger="0.06" id="cfg-tab-content">${content}</div>${summaryHTML()}</div>`;
  }

  function summaryValues() {
    if (mode === 'practice') {
      const pool = practicePool();
      const names = practice.subjectIds.map(id => E.SUBJECT_BY_ID[id].name);
      return {
        count: pool.length, available: pool.length, wanted: pool.length,
        rows: [['Matérias', names.length ? names.join(', ') : 'Todas'], ['Assuntos', practice.topicIds.length ? practice.topicIds.map(t => E.TOPIC_BY_ID[t]?.name).join(', ') : 'Todos'], ...(practice.subtopicIds.length ? [['Subtópicos', `${practice.subtopicIds.length} selecionados`]] : []), ['Anos', practice.years.length ? [...practice.years].sort((a, b) => b - a).join(', ') : 'Todos'], ['Quantidade', 'Livre: responda quantas quiser']],
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
      <p class="cfg-sum-count"><span id="cfg-count" data-value="${lastSummary?.count ?? v.count}">${lastSummary?.count ?? v.count}</span><span>${mode === 'practice' ? 'questões disponíveis' : 'questões'}</span></p>
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
      refreshBlockSummaries();
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

  /* Seletor de matérias: abre e fecha com mola, sem redesenhar o painel. */
  function openPicker() {
    const s = S();
    if (s.picker) return closePicker();
    s.picker = true;
    const wrap = root.querySelector('.cfg-add-wrap');
    wrap.insertAdjacentHTML('beforeend', pickerHTML());
    $('#cfg-add').setAttribute('aria-expanded', 'true');
    const picker = $('#cfg-picker');
    bindPicker();
    animate(picker, { opacity: [0, 1], y: [-8, 0], scale: [0.97, 1] }, spring.soft);
    picker.querySelectorAll('.cfg-pick').forEach((el, i) => animate(el, { opacity: [0, 1], y: [6, 0] }, { duration: duration.base, ease: ease.out, delay: 0.04 + Math.min(i, 12) * 0.018 }));
    animate($('#cfg-add .cfg-add-plus'), { rotate: [0, 45] }, spring.snappy);
    picker.querySelector('.cfg-pick:not([disabled])')?.focus({ preventScroll: true });
  }
  function closePicker({ instant = false } = {}) {
    const s = S();
    if (!s.picker) return Promise.resolve();
    s.picker = false;
    const picker = $('#cfg-picker');
    $('#cfg-add')?.setAttribute('aria-expanded', 'false');
    animate($('#cfg-add .cfg-add-plus'), { rotate: [45, 0] }, spring.snappy);
    if (!picker) return Promise.resolve();
    if (instant) { picker.remove(); return Promise.resolve(); }
    return animate(picker, { opacity: [1, 0], y: [0, -6], scale: [1, 0.98] }, { duration: duration.micro, ease: ease.in }).then(() => picker.remove());
  }
  function bindPicker() {
    $$('[data-pick]').forEach(b => b.onclick = () => addSubject(b.dataset.pick));
    const close = $('#cfg-picker-close'); if (close) close.onclick = () => { closePicker(); $('#cfg-add')?.focus(); };
  }
  function addSubject(id) {
    const s = S();
    if (s.subjectIds.includes(id)) return;
    s.subjectIds = [...s.subjectIds, id];
    s.openBlock = id;
    s.picker = false;
    update();
    const block = root.querySelector(`[data-block="${id}"]`);
    if (block) {
      animate(block, { opacity: [0, 1], y: [12, 0], scale: [0.98, 1] }, spring.soft);
      block.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' });
    }
  }
  function removeSubject(id) {
    const s = S();
    const block = root.querySelector(`[data-block="${id}"]`);
    const done = () => {
      s.subjectIds = s.subjectIds.filter(x => x !== id);
      const topics = E.SUBJECT_BY_ID[id].topics.map(t => t.id);
      s.topicIds = s.topicIds.filter(t => !topics.includes(t));
      s.subtopicIds = s.subtopicIds.filter(st => !topics.some(t => st.startsWith(`${t}.`)));
      if (s.openBlock === id) s.openBlock = null;
      update();
    };
    if (!block || reduced()) return done();
    block.style.overflow = 'hidden';
    Promise.all([
      animate(block, { opacity: [1, 0], x: [0, -16] }, { duration: duration.fast, ease: ease.in }),
      animate(block, { height: [block.offsetHeight, 0], marginTop: [getComputedStyle(block).marginTop, '0px'] }, { ...spring.soft, delay: 0.08 }),
    ]).then(done);
  }
  /** Abre um bloco (e fecha o anterior) com Collapse, sem redesenhar a lista. */
  function toggleBlock(id) {
    const s = S();
    const prev = s.openBlock;
    s.openBlock = prev === id ? null : id;
    const closeBlock = bid => {
      const block = root.querySelector(`[data-block="${bid}"]`);
      if (!block) return;
      block.classList.remove('is-open');
      block.querySelector('[data-block-toggle]')?.setAttribute('aria-expanded', 'false');
      rotateChevron(block.querySelector('.cfg-block-chev'), false);
      const body = block.querySelector('.cfg-block-body');
      if (body) collapse(body, false).then(() => body.remove());
    };
    if (prev) closeBlock(prev);
    if (s.openBlock) {
      const block = root.querySelector(`[data-block="${id}"]`);
      if (!block) return;
      block.classList.add('is-open');
      block.querySelector('[data-block-toggle]').setAttribute('aria-expanded', 'true');
      rotateChevron(block.querySelector('.cfg-block-chev'), true);
      block.insertAdjacentHTML('beforeend', `<div class="cfg-block-body" id="cfg-block-body-${id}">${topicRowsHTML(E.SUBJECT_BY_ID[id])}</div>`);
      bindTopics(block);
      collapse(block.querySelector('.cfg-block-body'), true);
    }
  }
  /** Atualiza o resumo de cada bloco (assuntos e questões) sem redesenhar. */
  function refreshBlockSummaries() {
    S().subjectIds.forEach(sid => { const el = root.querySelector(`[data-block-summary="${sid}"]`); if (el) el.textContent = blockSummary(sid); });
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

  function bindTopics(scope) {
    scope.querySelectorAll('[data-topic]').forEach(input => input.onchange = () => {
      const s = S(); const id = input.dataset.topic;
      s.topicIds = input.checked ? [...new Set([...s.topicIds, id])] : s.topicIds.filter(t => t !== id);
      if (!input.checked) s.subtopicIds = s.subtopicIds.filter(x => !x.startsWith(`${id}.`));
      scope.querySelectorAll('.cfg-subs [data-parent]').forEach(c => { if (c.dataset.parent === id && !input.checked) c.setAttribute('aria-checked', 'false'); });
      update({ panel: false });
    });
    scope.querySelectorAll('[data-expand]').forEach(b => b.onclick = () => toggleExpand(b.dataset.expand));
    bindSubs(scope);
  }
  function bind() {
    const back = $('#cfg-back'); if (back) back.onclick = onBack;
    $$('[data-tab-group="cfg"]').forEach(b => b.onclick = () => switchTab(b.dataset.tab));
    bindTabKeys(root, 'cfg', switchTab);
    const add = $('#cfg-add'); if (add) add.onclick = openPicker;
    bindPicker();
    $$('[data-remove]').forEach(b => b.onclick = () => removeSubject(b.dataset.remove));
    $$('[data-block-toggle]').forEach(b => b.onclick = () => toggleBlock(b.dataset.blockToggle));
    const clr = $('#cfg-clear-subjects'); if (clr) clr.onclick = () => { const s = S(); s.subjectIds = []; s.topicIds = []; s.subtopicIds = []; s.openBlock = null; update(); };
    $$('[data-weak]').forEach(b => b.onclick = () => {
      const t = E.TOPIC_BY_ID[b.dataset.weak];
      const s = S();
      if (!s.subjectIds.includes(t.subjectId)) s.subjectIds = [...s.subjectIds, t.subjectId];
      s.topicIds = [t.id]; s.subtopicIds = []; s.expanded = t.id; s.openBlock = t.subjectId;
      update();
    });
    bindTopics(root);
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
      if (!pool.length) return;
      const ids = E.pickQuestions(pool, pool.length, records(), E.createRng(Date.now()), account().onboarding.level).map(q => q.id);
      const f = { subjectId: practice.subjectIds.length === 1 ? practice.subjectIds[0] : null, topicIds: [...practice.topicIds], subtopicIds: [...practice.subtopicIds], years: [...practice.years], count: ids.length };
      const names = practice.topicIds.map(t => E.TOPIC_BY_ID[t]?.name).filter(Boolean);
      const subjects = practice.subjectIds.map(id => E.SUBJECT_BY_ID[id].name);
      const title = names.length === 1 ? names[0] : subjects.length === 1 ? (names.length ? `${subjects[0]} · ${names.length} assuntos` : subjects[0]) : subjects.length > 1 ? `${subjects.length} matérias` : 'Lista livre';
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

  document.addEventListener('keydown', e => { if (e.key === 'Escape' && S().picker && root.contains($('#cfg-picker'))) { closePicker(); $('#cfg-add')?.focus(); } });
  document.addEventListener('mousedown', e => { if (!S().picker) return; const pk = $('#cfg-picker'); if (pk && !pk.contains(e.target) && !e.target.closest?.('#cfg-add')) closePicker(); });

  return { mount, config: () => ({ ...sim }) };
}
