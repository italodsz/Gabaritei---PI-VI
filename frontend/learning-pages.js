import * as E from './assets/learning-engine.js';
import { createPracticeScreen } from './practice-screen.js';
import { createHistoryPage } from './history-page.js';
import { createConfigStudio } from './config-studio.js';
import { createProfilePage } from './profile-page.js';
import { createExamScreen } from './exam-screen.js';
import { hi } from './legacy-ui.js';
import { pageEnter } from './motion-kit.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pct = value => `${Math.round((value || 0) * 100)}%`;
const num = value => new Intl.NumberFormat('pt-BR').format(value);
const duration = ms => { const m = Math.floor(ms / 60000); return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}min` : `${m}min`; };
const shortTime = ms => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}min ${String(s % 60).padStart(2, '0')}s`; };
const clockText = ms => { const s = Math.floor(ms / 1000); return `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`; };
const areaOrder = ['linguagens','natureza','humanas','matematica'];
const colors = {linguagens:'#be471c',natureza:'#39a250',humanas:'#e4b324',matematica:'#3e5ac6'};
const inks = {linguagens:'#983d1a',natureza:'#2c703a',humanas:'#7b651c',matematica:'#364ea6'};
const SUBJECT_ICON = {portugues:'pen',literatura:'book',ingles:'languages',espanhol:'languages',artes:'palette',historia:'scroll',geografia:'globe',filosofia:'brain',sociologia:'users',fisica:'atom',quimica:'flask',biologia:'leaf',matematica:'sigma'};
globalThis.__gabaritei = { E };
const storageKey = 'gabaritei:estudos:oficial:v1';
/** Chave usada antes da renomeação; lida só para não perder o progresso já salvo. */

export function createLearningPages({ root, openDialog, closeDialog, toast, navigate, icons, onChange = () => {}, saveToNotes = () => {}, onProfileChange = () => {} }) {
  const $ = (s, parent = root) => parent.querySelector(s);
  const $$ = (s, parent = root) => [...parent.querySelectorAll(s)];
  let account;
  try { const saved = JSON.parse(localStorage.getItem(storageKey)); if (saved && Array.isArray(saved.practiceSessions) && Array.isArray(saved.simulations) && Array.isArray(saved.goals) && saved.onboarding && saved.study && saved.profile) account = saved; } catch { /* Funciona sem armazenamento. */ }
  if (!account) account = E.createEmptyAccount({ id: 'estudante-local', kind: 'new', name: 'Ítalo', email: '', now: Date.now() });
  account.practiceSessions = account.practiceSessions.map(s => s.status === 'in_progress' ? E.practice.pause(E.practice.recover(s,Date.now()),Date.now()) : s);
  let memoryNotice = false;
  function save() { try { localStorage.setItem(storageKey, JSON.stringify(account)); } catch { if (!memoryNotice) { memoryNotice = true; toast('Armazenamento indisponível: suas práticas ficam nesta sessão.'); } } }
  const records = () => E.collectAnswerRecords(account);
  const settings = { tab:'montar', subjectId:null, topicIds:[], subtopicIds:[], years:[], count:account.study.defaultQuestionCount, timer:account.study.practiceTimer, expanded:null, area:null, aiCount:account.study.defaultQuestionCount };
  const performance = { period:'day', subjectView:'barras' };
  let page = 'questoes';
  const filter = () => ({subjectId:settings.subjectId,topicIds:[...settings.topicIds],subtopicIds:[...settings.subtopicIds],years:[...settings.years],count:settings.count});
  const subject = () => E.SUBJECT_BY_ID[settings.subjectId];
  const activeArea = () => subject()?.areaId || settings.area;
  const recs = (limit = 6) => E.recommendTopics({records:records(),difficultSubjects:account.onboarding.difficultSubjects,now:Date.now(),limit});
  const segmented = (name, value, options, aria) => `<div class="studio-segments" role="group" aria-label="${aria}">${options.map(o=>`<button type="button" data-${name}="${esc(o.value)}" aria-pressed="${value===o.value}" class="${value===o.value?'is-active':''}">${esc(o.label)}</button>`).join('')}</div>`;
  const panel = (title, subtitle, content, cls='', action='') => `<section class="studio-panel ${cls}"><header class="studio-panel-heading"><div><h2>${title}</h2>${subtitle?`<p>${subtitle}</p>`:''}</div>${action}</header>${content}</section>`;
  const bar = (value, color, label='') => `<div class="studio-progress" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(value*100)}"><span style="width:${Math.max(0,Math.min(1,value))*100}%;background:${color}"></span></div>`;
  function pageHeader(eyebrow,title,description,actions='') { return `<header class="studio-header"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${description}</p></div>${actions?`<div class="studio-header-actions">${actions}</div>`:''}</header>`; }
  const notice = () => `<div class="studio-demo-tag">${icons('spark')} Questões oficiais do ENEM · Seu progresso fica neste navegador</div>`;

  function mount(nextPage, { enter = true } = {}) {
    page = nextPage; root.dataset.learning = nextPage; root.classList.add('learning-page');
    root.classList.toggle('legacy-ui', page !== 'progresso');
    if (page === 'questoes') studio.mount('practice');
    else if (page === 'simulado-personalizado') studio.mount('simulation');
    else if (page === 'historico') history.render();
    else if (page === 'perfil') profile.render();
    else renderPerformance();
  }
  function preserveRender(renderFn) { const focused = document.activeElement?.getAttribute('data-focus'); renderFn(); if (focused) $$('[data-focus]').find(el=>el.dataset.focus===focused)?.focus({preventScroll:true}); }

  function startTopic(id) { const t=E.TOPIC_BY_ID[id];if(!t)return;const f={...E.EMPTY_FILTERS,subjectId:t.subjectId,topicIds:[id],count:account.study.defaultQuestionCount};const ids=E.selectPracticeQuestions(f,records(),Date.now(),account.onboarding.level);beginList(t.name,ids,'recommended',f); }
  function beginList(title,ids,mode,filters,onComplete) { if(!ids.length){toast('Nenhuma questão disponível com esses filtros.');return null;}const created=E.createPracticeSession({title,questionIds:ids,mode,filters,timerVisible:account.study.practiceTimer,now:Date.now()});account.practiceSessions.push(created);save();openSession(created,{onComplete});return created; }

  const studio = createConfigStudio({
    E, root, account: () => account, records, save, toast, saveToNotes,
    onStartPractice: (title, ids, mode, filters) => beginList(title, ids, mode, filters),
    onStartSimulation: input => startSimulation(input),
    onBack: () => navigate('simulados'),
  });
  const practiceScreen = createPracticeScreen({
    E, icons, toast, save,
    getAccount: () => account,
    onExit: () => { if (!root.hidden && ['questoes', 'progresso', 'historico'].includes(page)) mount(page, { enter: false }); onChange(); },
    onProgress: () => navigate('progresso'),
    onNewList: () => navigate('questoes'),
    onNewSimulation: () => navigate('simulados'),
    onHome: () => navigate('plano'),
    onHistory: () => navigate('historico'),
    saveToNotes: (ref, el) => saveToNotes(ref, el),
    reviewTopic: topicId => { const t = E.TOPIC_BY_ID[topicId]; const ids = E.pickQuestions(E.questionRepository.query({ topicIds: [topicId] }), account.study.defaultQuestionCount, records(), E.createRng(E.freshSeed()), account.onboarding.level).map(q => q.id); beginList(t?.name ?? 'Revisão', ids, 'recommended', { ...E.EMPTY_FILTERS, topicIds: [topicId], count: ids.length }); },
  });
  /** Resultado de um simulado na mesma tela de resultado, só para leitura. */
  function openSimulationResult(sim, options = {}) {
    if (!sim) return;
    const answers = {};
    for (const id of sim.questionIds) {
      const a = sim.answers[id];
      const q = E.questionRepository.getById(id);
      answers[id] = { questionId: id, selected: a?.selected ?? null, confirmed: !!a?.selected, correct: a?.selected ? a.selected === q?.correct : null, answeredAt: a?.answeredAt ?? null, timeSpentMs: a?.timeSpentMs ?? 0 };
    }
    const asList = { ...sim, kind: 'practice', mode: 'custom', filters: { ...E.EMPTY_FILTERS, count: sim.questionIds.length }, timerVisible: true, currentIndex: 0, cursorElapsedMs: 0, answers };
    practiceScreen.openResult(asList, { kicker: 'RESULTADO DO SIMULADO', review: options.review, simulation: sim });
  }
  const history = createHistoryPage({ E, root, icons, toast, save, records, navigate, beginList: (...args) => beginList(...args), openSession: (...args) => openSession(...args), openSimulationResult, openExam: sim => openExam(sim), saveToNotes, getAccount: () => account });

  const profile = createProfilePage({ E, root, getAccount: () => account, save, records, toast, onProfileChange });

  /* Simulados: prova sem correção imediata (exam-screen.js). */
  const exam = createExamScreen({
    E, hi, toast, save, getAccount: () => account,
    onExit: () => { if (!root.hidden && ['historico', 'simulado-personalizado'].includes(page)) mount(page, { enter: false }); onChange(); },
    onFinished: sim => { openSimulationResult(sim, { kicker: 'RESULTADO DO SIMULADO' }); onChange(); },
  });
  function openExam(sim) { if (sim) exam.open(sim); }
  /** Cria um simulado com as questões escolhidas e abre a prova. */
  function startSimulation({ title, questionIds, durationMs, timerHidden = false, criteria = 'balanced', edition = null }) {
    if (!questionIds.length) { toast('Nenhuma questão disponível com essas opções.'); return null; }
    const created = E.createSimulationFromQuestions({ title, questionIds, config: { durationMs, criteria, edition }, now: Date.now(), timerHidden });
    account.simulations.push(created);
    save();
    exam.open(created);
    return created;
  }
  /** Informações de um simulado (para cards, notas e menu lateral). */
  function simulationInfo(id) {
    const s = account.simulations.find(x => x.id === id);
    if (!s) return null;
    return { id: s.id, title: s.title, status: s.status, total: s.questionIds.length, answered: s.questionIds.filter(q => s.answers[q]?.selected).length, updatedAt: s.updatedAt, createdAt: s.createdAt, areaIds: s.sections.map(x => x.areaId) };
  }
  /** Atividade em andamento mais recente (lista ou simulado), para o atalho do menu. */
  function resumeTarget() {
    const p = account.practiceSessions.filter(x => x.status === 'in_progress').sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    const q = account.simulations.filter(x => x.status === 'in_progress').sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    const latest = [p, q].filter(Boolean).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    if (!latest) return null;
    return latest.kind === 'practice'
      ? { label: 'Lista em andamento', title: latest.title, open: () => openSession(latest) }
      : { label: 'Simulado em andamento', title: latest.title, open: () => openExam(latest) };
  }
  /** Listas e simulados não concluídos, do mais recente para o mais antigo. */
  function pendingSessions() {
    const lists = account.practiceSessions.filter(x => x.status === 'in_progress').map(x => ({ kind: 'practice', ...sessionInfo(x.id), updatedAt: x.updatedAt, createdAt: x.createdAt, areaIds: [...new Set(E.questionRepository.getMany(x.questionIds).map(q => q.areaId))] }));
    const sims = account.simulations.filter(x => x.status === 'in_progress').map(x => ({ kind: 'simulation', ...simulationInfo(x.id) }));
    return [...lists, ...sims].sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
  }
  const streak = () => E.computeStreak(records(), Date.now());

  /** Abre uma lista na tela de resolução em tela cheia. */
  function openSession(value, options) { if (value) practiceScreen.open(value, options); }
  function openById(kind, id) { if (kind === 'simulation') { const sim = account.simulations.find(x => x.id === id); if (!sim) return false; if (sim.status === 'completed') openSimulationResult(sim, { kicker: 'RESULTADO DO SIMULADO' }); else openExam(sim); return true; } const ps = account.practiceSessions.find(x => x.id === id); if (ps) openSession(ps); return !!ps; }

  /** Cria e abre uma lista a partir de assuntos (usada pelas atividades do plano). */
  function startTopics({ title, topicIds, areaId, count = 5, onComplete }) {
    const topics = topicIds?.length ? topicIds.filter(id => E.TOPIC_BY_ID[id]) : E.TOPICS.filter(t => E.SUBJECT_BY_ID[t.subjectId].areaId === areaId).map(t => t.id);
    const filters = { ...E.EMPTY_FILTERS, topicIds: topics, count };
    const ids = E.selectPracticeQuestions(filters, records(), Date.now(), account.onboarding.level);
    return beginList(title, ids, 'custom', filters, onComplete);
  }
  /** Lista com as questões que você errou mais recentemente (até 10). */
  function startReview({ onComplete } = {}) {
    const latest = new Map();
    records().filter(r => !r.correct).sort((a, b) => b.answeredAt - a.answeredAt).forEach(r => { if (!latest.has(r.questionId)) latest.set(r.questionId, r); });
    const ids = [...latest.keys()].slice(0, 10);
    if (!ids.length) { toast('Você ainda não tem erros para revisar. Que tal uma lista nova?'); return; }
    beginList('Revisão dos seus erros', ids, 'retry', { ...E.EMPTY_FILTERS, count: ids.length }, onComplete);
  }
  /** Progresso de uma lista: título, situação e quantas questões já foram respondidas. */
  function sessionInfo(id) {
    const s = account.practiceSessions.find(x => x.id === id);
    if (!s) return null;
    return { id: s.id, title: s.title, status: s.status, total: s.questionIds.length, answered: s.questionIds.filter(q => s.answers[q]?.confirmed).length };
  }
  /** A lista em andamento mais recente (usada pelo card "Seu próximo passo"). */
  function latestInProgress() {
    const latest = account.practiceSessions.filter(x => x.status === 'in_progress').sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    return latest ? sessionInfo(latest.id) : null;
  }
  function resumeById(id) { const s = account.practiceSessions.find(x => x.id === id); if (s) openSession(s); return !!s; }
  /** Retoma a lista em andamento mais recente; devolve false se não houver. */
  function resumeLatest() {
    const latest = account.practiceSessions.filter(s => s.status === 'in_progress').sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    if (!latest) return false;
    openSession(latest);
    return true;
  }

  function renderPerformance() {
    const rs=records();const now=Date.now();const overall=E.summarize(rs);const series=E.buildSeries(rs,performance.period,now);const comparison=E.comparePeriods(rs,performance.period,now);const cfg=E.GRANULARITY_CONFIG[performance.period];const subjects=E.subjectStats(rs).filter(s=>s.answered).sort((a,b)=>b.accuracy-a.accuracy);const areas=E.areaStats(rs);const ranks=E.rankTopics(rs);const streak=E.computeStreak(rs,now);const calendar=E.activityCalendar(rs,now,20);const goals=account.goals.filter(g=>g.enabled).map(g=>E.goalProgress(g,rs,account,now));
    const delta=comparison.accuracyDelta===null?'Sem período anterior':`${comparison.accuracyDelta>=0?'+':''}${Math.round(comparison.accuracyDelta*100)} p.p. no período`;
    const stat=(cls,icon,label,value,detail)=>`<article class="metric-card ${cls}"><div><span>${label}</span>${icons(icon)}</div><strong>${value}</strong><p>${detail}</p></article>`;
    root.innerHTML=`<div class="learning-shell performance-shell">${pageHeader('PROGRESSO · CADA PASSO CONTA','Análise da sua evolução','Acompanhe seus acertos, seu ritmo de estudo e os assuntos que pedem atenção.',segmented('period',performance.period,[{value:'day',label:'Diário'},{value:'week',label:'Semanal'},{value:'month',label:'Mensal'}],'Período da análise'))}${notice()}
      <div class="metrics-grid">${stat('metric-blue','target','Taxa geral de acertos',pct(overall.accuracy),delta)}${stat('metric-green','layers','Questões no período',num(comparison.current.answered),`${num(overall.answered)} respostas no total`)}${stat('metric-orange','clock','Tempo total de estudo',duration(E.totalStudyTime(account,now)),'Soma dos cronômetros das sessões')}${stat('metric-red','focus','Tempo médio por questão',shortTime(overall.avgTimeMs),'Tempo das respostas registradas')}</div>
      <div class="performance-grid">
        ${panel('Evolução da taxa de acerto',`${cfg.label} · ${performance.period==='week'?'últimas':'últimos'} ${cfg.buckets} ${performance.period==='day'?'dias':performance.period==='week'?'semanas':'meses'}`,accuracyChart(series),'span-8')}
        ${panel('Comparação',`Período atual vs. ${cfg.compareLabel}`,comparisonPanel(comparison),'span-4')}
        ${panel('Volume de questões',`Questões respondidas por ${performance.period==='day'?'dia':performance.period==='week'?'semana':'mês'}`,volumeChart(series),'span-6')}
        ${panel('Distribuição por área','Respostas e acertos nas quatro áreas do ENEM',distribution(areas,overall.answered),'span-6')}
        ${panel('Acerto por matéria','Ordenado do maior para o menor acerto',subjectPerformance(subjects),'span-7',segmented('subject-view',performance.subjectView,[{value:'barras',label:'Barras'},{value:'tabela',label:'Tabela'}],'Visualização por matéria'))}
        ${panel('Assuntos','Pelo menos 4 respostas para identificar um padrão.',topicRankings(ranks),'span-5')}
        ${panel('Calendário de atividades','Questões respondidas por dia nas últimas 20 semanas.',calendarHTML(calendar),'span-8')}
        <section class="streak-panel span-4"><span class="streak-icon">${icons('flame')}</span><span>Sequência atual</span><strong>${streak.current} <small>${streak.current===1?'dia':'dias'}</small></strong><div><article><span>Melhor sequência</span><b>${streak.best} dias</b></article><article><span>Hoje</span><b>${streak.activeToday?'Estudou':'Ainda dá tempo'}</b></article></div></section>
        ${panel('Metas pessoais','Seu progresso acompanha as respostas e as sessões.',goalsHTML(goals),'span-7',`<button class="small-button" id="edit-goals">Editar metas ${icons('target')}</button>`)}
        ${panel('Recomendações de revisão','Pontos de atenção, dificuldades e tempo sem revisar.',`<div class="review-recommendations">${recs(4).map(r=>`<button data-start-topic="${r.topicId}" style="--rec-color:${colors[r.areaId]};--rec-ink:${inks[r.areaId]}"><span><strong>${esc(r.topicName)}</strong><small>${esc(r.reason)}</small></span>${icons('arrow')}</button>`).join('')}</div>`,'span-5')}
      </div></div>`;
    $$('[data-period]').forEach(b=>b.onclick=()=>{performance.period=b.dataset.period;renderPerformance();});
    $$('[data-subject-view]').forEach(b=>b.onclick=()=>{performance.subjectView=b.dataset.subjectView;renderPerformance();});
    $$('[data-start-topic]').forEach(b=>b.onclick=()=>startTopic(b.dataset.startTopic));
    $$('[data-calendar-day]').forEach(b=>b.onclick=()=>toast(b.getAttribute('aria-label')));
    $('#edit-goals').onclick=editGoals;
  }
  function dataTable(series) { return `<details class="chart-data"><summary>Ver dados em tabela</summary><div class="table-scroll"><table><caption>Respostas e acertos por período</caption><thead><tr><th>Período</th><th>Respondidas</th><th>Acertos</th><th>Taxa</th></tr></thead><tbody>${series.map(s=>`<tr><th scope="row">${esc(s.label)}</th><td>${s.answered}</td><td>${s.correct}</td><td>${s.accuracy===null?'Sem dados':pct(s.accuracy)}</td></tr>`).join('')}</tbody></table></div></details>`; }
  function accuracyChart(series) {
    const width=660,height=225,left=38,right=16,top=14,bottom=35;const x=i=>left+i*(width-left-right)/Math.max(1,series.length-1);const y=v=>top+(1-v)*(height-top-bottom);const groups=[];let current=[];series.forEach((s,i)=>{if(s.accuracy===null){if(current.length)groups.push(current);current=[];}else current.push([x(i),y(s.accuracy),s]);});if(current.length)groups.push(current);
    return `<div class="chart-key"><span><i style="background:#2856b6"></i>Taxa de acerto</span><small>Sem respostas = sem ponto no gráfico</small></div><svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Evolução da taxa de acerto. Os valores também estão disponíveis na tabela abaixo.">${[0,.25,.5,.75,1].map(n=>`<line x1="${left}" x2="${width-right}" y1="${y(n)}" y2="${y(n)}" stroke="#e8ede7" stroke-dasharray="3 5"/><text x="${left-8}" y="${y(n)+3}" text-anchor="end">${pct(n)}</text>`).join('')}${groups.map(g=>`${g.length>1?`<path d="M${g[0][0]} ${y(0)} L${g.map(p=>`${p[0]} ${p[1]}`).join(' L')} L${g.at(-1)[0]} ${y(0)}Z" fill="#2856b614"/><path d="M${g.map(p=>`${p[0]} ${p[1]}`).join(' L')}" stroke="#2856b6" stroke-width="2.8" stroke-linejoin="round"/>`:''}${g.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#fff" stroke="#2856b6" stroke-width="2"><title>${esc(p[2].label)}: ${pct(p[2].accuracy)} · ${p[2].answered} respostas</title></circle>`).join('')}`).join('')}${series.map((s,i)=>i%Math.max(1,Math.floor(series.length/7))===0||i===series.length-1?`<text x="${x(i)}" y="${height-9}" text-anchor="middle">${esc(s.label)}</text>`:'').join('')}</svg>${dataTable(series)}`;
  }
  function volumeChart(series) { const max=Math.max(1,...series.map(s=>s.answered));return `<div class="volume-chart" role="img" aria-label="Volume de questões por período. Consulte também a tabela abaixo.">${series.map(s=>`<div class="volume-column"><div class="volume-space"><div class="volume-bar" style="--bar-height:${s.answered/max*100}%" title="${esc(s.label)}: ${s.answered} questões"><span>${s.answered||''}</span></div></div><span>${esc(s.label)}</span></div>`).join('')}</div>${dataTable(series)}`; }
  function comparisonPanel(cmp) { return `<div class="comparison-groups">${[{label:'Taxa de acerto',cur:cmp.current.accuracy,prev:cmp.previous.accuracy,max:1,format:pct},{label:'Questões respondidas',cur:cmp.current.answered,prev:cmp.previous.answered,max:Math.max(1,cmp.current.answered,cmp.previous.answered),format:num}].map(row=>`<div><h3>${row.label}</h3><div class="comparison-row"><span>Atual</span>${bar(row.cur/row.max,'#2856b6',`${row.label} no período atual`)}<b>${row.format(row.cur)}</b></div><div class="comparison-row"><span>Anterior</span>${bar(row.prev/row.max,'#6db589',`${row.label} no período anterior`)}<b>${cmp.previous.answered?row.format(row.prev):'—'}</b></div></div>`).join('')}${!cmp.previous.answered?'<p class="field-hint">Sem atividades no período anterior para comparar.</p>':''}</div>`; }
  function distribution(areas,total) { let start=0;const gradient=areas.map(a=>{const end=start+(total?a.answered/total*100:0);const piece=`${colors[a.areaId]} ${start}% ${end}%`;start=end;return piece;}).join(',');return `<div class="distribution-layout"><div class="distribution-donut" style="background:${total?`conic-gradient(${gradient})`:'#edf0eb'}" aria-hidden="true"><div><strong>${num(total)}</strong><span>questões</span></div></div><ul class="distribution-legend">${areas.map(a=>`<li><i style="background:${colors[a.areaId]}"></i><span>${esc(E.AREA_BY_ID[a.areaId].name)}<small>${a.answered} respostas · ${pct(a.accuracy)} de acerto</small></span></li>`).join('')}</ul></div>`; }
  const subjectTile = s => `<span class="subject-tile" aria-hidden="true">${icons(SUBJECT_ICON[s.subjectId] || 'book')}</span>`;
  function subjectPerformance(subjects) { if(performance.subjectView==='tabela')return `<div class="table-scroll"><table><caption>Desempenho por matéria</caption><thead><tr><th>Matéria</th><th>Respondidas</th><th>Acertos</th><th>Tempo médio</th><th>Acerto</th></tr></thead><tbody>${subjects.map(s=>`<tr><th scope="row" style="--area-ink:${inks[s.areaId]};--area-bg:var(--${s.areaId}-bg)">${subjectTile(s)}${esc(s.name)}</th><td>${s.answered}</td><td>${s.correct}</td><td>${shortTime(s.avgTimeMs)}</td><td><strong>${pct(s.accuracy)}</strong></td></tr>`).join('')}</tbody></table></div>`;return `<ul class="subject-rows">${subjects.map(s=>`<li style="--area-ink:${inks[s.areaId]};--area-bg:var(--${s.areaId}-bg)">${subjectTile(s)}<div class="subject-row-main"><div class="subject-row-top"><strong>${esc(s.name)}</strong><span>${s.correct}/${s.answered} · <b>${pct(s.accuracy)}</b></span></div>${bar(s.accuracy,colors[s.areaId],`${s.name}: ${pct(s.accuracy)}`)}</div></li>`).join('')}</ul>`; }
  function topicRankings(ranks) { return [{title:'Maior dificuldade',items:ranks.weakest.slice(0,4),weak:true},{title:'Melhor desempenho',items:ranks.strongest.slice(0,4),weak:false}].map(group=>`<div class="ranking-group"><h3>${icons(group.weak?'target':'check')}${group.title}</h3>${group.items.map(t=>`<div><span>${esc(t.name)}<small>${t.answered} questões respondidas</small></span><strong>${pct(t.accuracy)}</strong>${group.weak?`<button class="text-button" data-start-topic="${t.topicId}">Praticar ${icons('arrow')}</button>`:''}</div>`).join('')||'<p class="field-hint">Responda mais questões para identificar.</p>'}</div>`).join(''); }
  function calendarHTML(columns) { const date=new Intl.DateTimeFormat('pt-BR',{day:'numeric',month:'long'});return `<div class="activity-calendar-scroll"><div class="activity-calendar">${columns.map(col=>`<div>${col.map(cell=>{const level=!cell.count?0:cell.count<6?1:cell.count<15?2:cell.count<30?3:4;const label=`${date.format(cell.date)}: ${cell.future?'data futura':`${cell.count} questões, ${cell.correct} acertos`}`;return `<button class="calendar-cell level-${level} ${cell.future?'future':''}" data-calendar-day="${cell.key}" title="${label}" aria-label="${label}" ${cell.future?'disabled':''}></button>`;}).join('')}</div>`).join('')}</div></div><div class="calendar-legend"><span>20 semanas de pequenos passos</span><span>Menos <i class="level-0"></i><i class="level-1"></i><i class="level-2"></i><i class="level-3"></i><i class="level-4"></i> Mais</span></div>`; }
  function goalsHTML(goals) { return goals.length?`<div class="personal-goals">${goals.map((p,i)=>{const meta=E.GOAL_META[p.goal.kind];return `<article><div class="goal-ring" style="--goal-progress:${p.progress*360}deg;--goal-color:${['#2856b6','#226b47','#914315','#9d2f40'][i%4]}" role="img" aria-label="${meta.title}: ${p.pendingReason||`${meta.format(p.current)} de ${meta.format(p.goal.target)}`}"><span>${p.pendingReason?'—':meta.format(p.current)}</span></div><h3>${meta.title}</h3><p>${p.pendingReason||`${meta.format(p.current)} de ${meta.format(p.goal.target)}`}</p></article>`;}).join('')}</div>`:'<p class="field-hint">Nenhuma meta ativa. Use “Editar metas” para definir seu próximo passo.</p>'; }
  function editGoals() { openDialog(`<span class="dialog-label">SEU RITMO, SUAS METAS</span><h2 id="dialog-title" class="dialog-title">Pequenos passos possíveis.</h2><p class="dialog-description">As metas são recalculadas com base nas suas práticas realizadas aqui.</p><form id="goals-form">${account.goals.map(g=>{const meta=E.GOAL_META[g.kind];return `<div class="goal-editor-row"><label class="goal-enable"><input type="checkbox" name="enabled-${g.kind}" ${g.enabled?'checked':''}><span><strong>${meta.title}</strong><small>${meta.description}</small></span></label><label class="goal-target">Meta em ${meta.unit}<input type="number" name="target-${g.kind}" value="${g.target}" min="${meta.min}" max="${meta.max}" step="${meta.step}" required></label></div>`;}).join('')}<button class="primary-button" type="submit">Salvar metas ${icons('check')}</button></form>`);document.querySelector('#goals-form').onsubmit=event=>{event.preventDefault();const data=new FormData(event.target);account.goals=account.goals.map(g=>({...g,enabled:data.has(`enabled-${g.kind}`),target:Number(data.get(`target-${g.kind}`))}));save();closeDialog();renderPerformance();toast('Metas atualizadas. Um caminho possível para você.');}; }
  return { mount, startTopics, startReview, resumeLatest, sessionInfo, latestInProgress, resumeById, startSimulation, openExam, simulationInfo, resumeTarget, pendingSessions, streak, openById, records, account: () => account, save };
}
