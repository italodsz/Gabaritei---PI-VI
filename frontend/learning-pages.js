import * as E from './assets/learning-engine.js';
import { createPracticeScreen } from './practice-screen.js';
import { createHistoryPage } from './history-page.js';
import { createConfigStudio } from './config-studio.js';
import { createProfilePage } from './profile-page.js';
import { createExamScreen } from './exam-screen.js';
import { createChallengeScreen } from './challenge-screen.js';
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
const storageKey = 'gabaritei:estudos:v1';
/** Chave usada antes da renomeação; lida só para não perder o progresso já salvo. */
const oldStorageKey = 'gabaritei:canvas-learning:v1';

export function createLearningPages({ root, openDialog, closeDialog, toast, navigate, icons, onChange = () => {}, saveToNotes = () => {}, onProfileChange = () => {} }) {
  const $ = (s, parent = root) => parent.querySelector(s);
  const $$ = (s, parent = root) => [...parent.querySelectorAll(s)];
  let account;
  try { const saved = JSON.parse(localStorage.getItem(storageKey) ?? localStorage.getItem(oldStorageKey)); if (saved && Array.isArray(saved.practiceSessions) && Array.isArray(saved.simulations) && Array.isArray(saved.goals) && saved.onboarding && saved.study && saved.profile) account = saved; } catch { /* Funciona sem armazenamento. */ }
  if (!account) { account = E.createDemoAccount(Date.now()); account.profile.name = 'Ítalo'; account.profile.nickname = 'Ítalo'; }
  account.practiceSessions = account.practiceSessions.map(s => s.status === 'in_progress' ? E.practice.pause(E.practice.recover(s,Date.now()),Date.now()) : s);
  let memoryNotice = false;
  function save() { try { localStorage.setItem(storageKey, JSON.stringify(account)); } catch { if (!memoryNotice) { memoryNotice = true; toast('Armazenamento indisponível: suas práticas ficam nesta sessão.'); } } }
  const records = () => E.collectAnswerRecords(account);
  const settings = { tab:'montar', subjectId:null, topicIds:[], subtopicIds:[], years:[], count:account.study.defaultQuestionCount, timer:account.study.practiceTimer, expanded:null, area:null, aiCount:account.study.defaultQuestionCount };
  const performance = { period:'all', subjectView:'barras' };
  let page = 'questoes';
  const filter = () => ({subjectId:settings.subjectId,topicIds:[...settings.topicIds],subtopicIds:[...settings.subtopicIds],years:[...settings.years],count:settings.count});
  const subject = () => E.SUBJECT_BY_ID[settings.subjectId];
  const activeArea = () => subject()?.areaId || settings.area;
  const recs = (limit = 6) => E.recommendTopics({records:records(),difficultSubjects:account.onboarding.difficultSubjects,now:Date.now(),limit});
  const segmented = (name, value, options, aria) => `<div class="studio-segments" role="group" aria-label="${aria}">${options.map(o=>`<button type="button" data-${name}="${esc(o.value)}" aria-pressed="${value===o.value}" class="${value===o.value?'is-active':''}">${esc(o.label)}</button>`).join('')}</div>`;
  const panel = (title, subtitle, content, cls='', action='') => `<section class="studio-panel ${cls}"><header class="studio-panel-heading"><div><h2>${title}</h2>${subtitle?`<p>${subtitle}</p>`:''}</div>${action}</header>${content}</section>`;
  const bar = (value, color, label='') => `<div class="studio-progress" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(value*100)}"><span style="width:${Math.max(0,Math.min(1,value))*100}%;background:${color}"></span></div>`;
  function pageHeader(eyebrow,title,description,actions='') { return `<header class="studio-header"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${description}</p></div>${actions?`<div class="studio-header-actions">${actions}</div>`:''}</header>`; }
  const notice = () => `<div class="studio-demo-tag">${icons('spark')} Acervo autoral demonstrativo · Histórico simulado + suas práticas</div>`;

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
    nextRecommended: current => recommendationQueue({ exclude: new Set(current.questionIds), offset: current.questionIds.length })[0] ?? null,
    reviewTopic: topicId => { const t = E.TOPIC_BY_ID[topicId]; const ids = E.pickQuestions(E.questionRepository.query({ topicIds: [topicId] }), account.study.defaultQuestionCount, records(), E.createRng(E.freshSeed()), account.onboarding.level).map(q => q.id); beginList(t?.name ?? 'Revisão', ids, 'recommended', { ...E.EMPTY_FILTERS, topicIds: [topicId], count: ids.length }); },
  });
  /** Desafio de acertos: tela própria, sem pausa nem retomada. */
  const challenge = createChallengeScreen({ E, getAccount: () => account, save, onExit: () => { if (!root.hidden && ['questoes', 'progresso', 'historico'].includes(page)) mount(page, { enter: false }); onChange(); } });
  // Tentativa interrompida por recarregamento ou fechamento: registrada como abandono.
  challenge.settleOrphan();

  /* ---------------------------------------------------------------- */
  /* Revisar: questões erradas ainda não superadas                    */
  /* ---------------------------------------------------------------- */
  /**
   * Uma questão entra na fila quando é respondida incorretamente e só sai quando
   * a tentativa mais recente dela for um acerto. O erro original continua nos
   * registros (Histórico). Mesma regra da aba "Erradas" do Histórico, sem duplicatas.
   */
  function reviewQueue() {
    const latest = new Map();
    for (const r of records()) { const prev = latest.get(r.questionId); if (!prev || r.answeredAt > prev.answeredAt) latest.set(r.questionId, r); }
    return [...latest.values()].filter(r => !r.correct && E.questionRepository.getById(r.questionId)).sort((a, b) => b.answeredAt - a.answeredAt).map(r => r.questionId);
  }
  const activeReview = () => account.practiceSessions.filter(x => x.status === 'in_progress' && x.review).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null;
  function reviewOverview() {
    const pending = reviewQueue().length;
    const s = activeReview();
    if (!s) return { pending, active: null };
    const done = s.questionIds.filter(id => s.answers[id]?.confirmed);
    return { pending, active: { id: s.id, initial: s.reviewInitial ?? s.questionIds.length, reviewed: done.length, correct: done.filter(id => s.answers[id].correct).length, total: s.questionIds.length } };
  }
  function startReviewMode() {
    const s = activeReview();
    if (s) { openSession(s); return s; }
    const ids = reviewQueue();
    if (!ids.length) { toast('Tudo revisado por enquanto!'); return null; }
    const created = { ...E.createPracticeSession({ title: 'Revisão de erros', questionIds: ids, mode: 'retry', filters: { ...E.EMPTY_FILTERS, count: ids.length }, timerVisible: false, now: Date.now() }), review: true, reviewInitial: ids.length };
    account.practiceSessions.push(created);
    save();
    openSession(created);
    return created;
  }

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
  /**
   * Prova no formato ENEM (regras do front anterior, factory.ts):
   * - dia completo: 90 questões, 5h30 (Dia 1) ou 5h (Dia 2), numeração 1–90 ou 91–180;
   * - uma área do dia: 45 questões e exatamente metade do tempo (2h45 ou 2h30),
   *   com a numeração oficial da área (ex.: Humanas 46–90).
   */
  function startOfficial({ day, areaId = null, foreignLanguage = 'ingles', timerHidden = false, edition = null }) {
    const now = Date.now();
    const base = { edition, foreignLanguage, criteria: 'balanced' };
    let created;
    if (!areaId) {
      created = E.createSimulationSession({ config: { ...base, mode: 'official', day, areaIds: [], size: 90 }, records: records(), difficultSubjects: account.onboarding.difficultSubjects, now, timerHidden });
      created.title = `ENEM · Dia ${day} · Prova completa`;
    } else {
      const area = E.AREA_BY_ID[areaId];
      if (area.day !== day) return null; // área precisa ser do dia escolhido
      const half = E.simulationDuration({ mode: 'official', day, size: 45 });
      created = E.createSimulationSession({ config: { ...base, mode: 'custom', day: null, areaIds: [areaId], size: 45, durationMs: half }, records: records(), difficultSubjects: account.onboarding.difficultSubjects, now, timerHidden });
      created.sections = created.sections.map(sec => ({ ...sec, firstNumber: area.officialRange[0] + sec.start }));
      created.config = { ...created.config, mode: 'official', day, areaIds: [areaId], durationMs: half, includesEssay: false };
      created.title = `ENEM · Dia ${day} · ${area.name}`;
    }
    if (!created.questionIds.length) { toast('Não há questões suficientes no acervo para essa prova.'); return null; }
    if (edition) {
      // Edição escolhida: as questões desse ano entram primeiro (fora as de língua estrangeira);
      // o acervo demonstrativo completa a prova com outras edições.
      const ids = created.questionIds.slice();
      const used = new Set(ids);
      for (const sec of created.sections) {
        const pool = E.questionRepository.query({ areaIds: [sec.areaId], years: [edition] }).filter(q => !used.has(q.id) && !q.foreignLanguage);
        for (let i = sec.start; i < sec.end && pool.length; i++) {
          const q = E.questionRepository.getById(ids[i]);
          if (q.year === edition || q.foreignLanguage) continue;
          const next = pool.shift(); used.add(next.id); ids[i] = next.id;
        }
      }
      created.questionIds = ids;
      created.answers = Object.fromEntries(ids.map(id => [id, { ...(Object.values(created.answers)[0] || {}), questionId: id }]));
      created.title += ` · ref. ${edition}`;
    }
    account.simulations.push(created);
    save();
    exam.open(created);
    return created;
  }
  /* ---------------------------------------------------------------- */
  /* Praticar · Recomendações para você (regras locais de demonstração) */
  /* ---------------------------------------------------------------- */
  const DAY = 86400000;
  const RECO_TITLE = 'Recomendações para você';
  /**
   * Fila de recomendações montada só com dados locais. Cada fonte tem uma
   * prioridade; a fila intercala as fontes (uma de cada, em ordem) para a
   * prática não virar um bloco só de erros ou só de um assunto.
   *  1. marcadas para revisar  2. erradas da última vez  3. pendentes em listas abertas
   *  4. assuntos com dificuldade/sem contato  5. revisão espaçada (acertou há 14+ dias)
   *  6. inéditas das matérias que você apontou como difíceis (depois, de qualquer matéria)
   */
  function recommendationSources({ exclude = new Set() } = {}) {
    const now = Date.now();
    const rs = records();
    const latest = new Map();
    rs.slice().sort((a, b) => b.answeredAt - a.answeredAt).forEach(r => { if (!latest.has(r.questionId)) latest.set(r.questionId, r); });
    const recent = id => { const r = latest.get(id); return r && now - r.answeredAt < 10 * 60000; };
    const exists = id => !!E.questionRepository.getById(id);
    const ok = id => exists(id) && !exclude.has(id) && !recent(id);
    const seen = new Set(latest.keys());
    const marked = account.reviewMarks.filter(ok).map(id => ({ id, reason: 'Você marcou para revisar', source: 'marcadas' }));
    const wrong = [...latest.values()].filter(r => !r.correct && ok(r.questionId)).map(r => ({ id: r.questionId, reason: 'Você errou da última vez', source: 'erradas' }));
    const pending = account.practiceSessions.filter(x => x.status === 'in_progress' && !x.continuous)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .flatMap(x => x.questionIds.filter(id => !x.answers[id]?.confirmed && ok(id)).map(id => ({ id, reason: `Ficou pendente em “${x.title}”`, source: 'pendentes' })));
    const topics = recs(6).flatMap(r => {
      const t = E.TOPIC_BY_ID[r.topicId];
      const label = r.kind === 'revisao' ? `Hora de revisar ${t?.name ?? 'este assunto'}` : r.kind === 'desempenho' ? `Reforço em ${t?.name ?? 'um assunto difícil'}` : r.kind === 'dificuldade' ? `Matéria que você marcou como difícil` : `Assunto novo: ${t?.name ?? ''}`;
      const pool = E.questionRepository.query({ topicIds: [r.topicId] }).filter(q => ok(q.id));
      const fresh = pool.filter(q => !seen.has(q.id));
      return (fresh.length ? fresh : pool).slice(0, 2).map(q => ({ id: q.id, reason: label, source: 'dificuldade' }));
    });
    const spaced = [...latest.values()].filter(r => r.correct && now - r.answeredAt > 14 * DAY && ok(r.questionId))
      .sort((a, b) => a.answeredAt - b.answeredAt).map(r => ({ id: r.questionId, reason: `Revisão espaçada: acertou há ${Math.floor((now - r.answeredAt) / DAY)} dias`, source: 'revisao' }));
    const hard = new Set(account.onboarding.difficultSubjects || []);
    const unseen = E.questionRepository.query({}).filter(q => !seen.has(q.id) && ok(q.id))
      .sort((a, b) => (hard.has(b.subjectId) ? 1 : 0) - (hard.has(a.subjectId) ? 1 : 0) || a.id.localeCompare(b.id))
      .map(q => ({ id: q.id, reason: hard.has(q.subjectId) ? 'Inédita de uma matéria que pede atenção' : 'Questão inédita para você', source: 'ineditas' }));
    return { marked, wrong, pending, topics, spaced, unseen };
  }
  function recommendationQueue(options = {}) {
    const src = recommendationSources(options);
    // `offset` gira a ordem das fontes: na prática contínua, cada nova questão vem da próxima fonte.
    const all = [src.marked, src.wrong, src.pending, src.topics, src.spaced, src.unseen];
    const k = (options.offset ?? 0) % all.length;
    const lists = [...all.slice(k), ...all.slice(0, k)].map(l => l.slice());
    const out = [], used = new Set();
    while (lists.some(l => l.length)) {
      for (const l of lists) {
        while (l.length && used.has(l[0].id)) l.shift();
        const item = l.shift();
        if (item) { used.add(item.id); out.push(item); }
      }
      if (out.length > 400) break;
    }
    return out;
  }
  /** Resumo para o hub Praticar: quantas questões vêm de cada fonte e as próximas da fila. */
  function recommendationOverview() {
    const src = recommendationSources();
    const queue = recommendationQueue();
    const active = account.practiceSessions.filter(x => x.status === 'in_progress' && x.continuous).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    const answered = active ? active.questionIds.filter(id => active.answers[id]?.confirmed).length : 0;
    return {
      counts: { marcadas: src.marked.length, erradas: src.wrong.length, pendentes: src.pending.length, dificuldade: src.topics.length, revisao: src.spaced.length, ineditas: src.unseen.length },
      next: queue.slice(0, 4).map(item => { const q = E.questionRepository.getById(item.id); return { ...item, subject: E.SUBJECT_BY_ID[q.subjectId]?.name, topic: E.TOPIC_BY_ID[q.topicId]?.name, areaId: q.areaId }; }),
      total: queue.length,
      active: active ? { id: active.id, answered, updatedAt: active.updatedAt } : null,
    };
  }
  /** Abre a prática contínua: retoma a que estiver aberta ou começa uma nova. */
  function startRecommended() {
    const active = account.practiceSessions.filter(x => x.status === 'in_progress' && x.continuous).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    if (active) { openSession(active); return active; }
    const first = recommendationQueue()[0];
    if (!first) { toast('Nenhuma questão para recomendar agora.'); return null; }
    const created = { ...E.createPracticeSession({ title: RECO_TITLE, questionIds: [first.id], mode: 'custom', filters: { ...E.EMPTY_FILTERS, count: 1 }, timerVisible: account.study.practiceTimer, now: Date.now() }), continuous: true, reasons: { [first.id]: first.reason } };
    account.practiceSessions.push(created);
    save();
    openSession(created);
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

  /** Abre uma lista na tela de resolução em tela cheia. */
  function openSession(value, options) { if (value) practiceScreen.open(value, options); }
  function openById(kind, id) { if (kind === 'simulation') { const sim = account.simulations.find(x => x.id === id); if (!sim) return false; if (sim.status === 'completed') openSimulationResult(sim, { kicker: 'RESULTADO DO SIMULADO' }); else openExam(sim); return true; } const ps = account.practiceSessions.find(x => x.id === id); if (ps) openSession(ps); return !!ps; }

  /** Cria e abre uma lista a partir de assuntos (usada pelas atividades do plano). */
  function startTopics({ title, topicIds, areaId, count = 5, onComplete }) {
    const topics = topicIds?.length ? topicIds : E.TOPICS.filter(t => E.SUBJECT_BY_ID[t.subjectId].areaId === areaId).map(t => t.id);
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
    const rs=records();const now=Date.now();const overall=E.summarize(rs);const {series,comparison,cfg}=periodData(rs,performance.period,now);const subjects=E.subjectStats(rs).filter(s=>s.answered).sort((a,b)=>b.accuracy-a.accuracy);const areas=E.areaStats(rs);const ranks=E.rankTopics(rs);const calendar=E.activityCalendar(rs,now,20);const goals=account.goals.filter(g=>g.enabled).map(g=>E.goalProgress(g,rs,account,now));
    const delta=comparison.accuracyDelta===null?'Sem período anterior':`${comparison.accuracyDelta>=0?'+':''}${Math.round(comparison.accuracyDelta*100)} p.p. ${performance.period==='all'?'vs. o início':'no período'}`;
    const stat=(cls,icon,label,value,detail)=>`<article class="metric-card ${cls}"><div><span>${label}</span>${icons(icon)}</div><strong>${value}</strong><p>${detail}</p></article>`;
    root.innerHTML=`<div class="learning-shell performance-shell">${pageHeader('PROGRESSO · CADA PASSO CONTA','Análise da sua evolução','Acompanhe seus acertos, seu ritmo de estudo e os assuntos que pedem atenção.',segmented('period',performance.period,[{value:'week',label:'Semanal'},{value:'month',label:'Mensal'},{value:'all',label:'Todo o período'}],'Período da análise'))}${notice()}
      <div class="metrics-grid">${stat('metric-blue','target','Taxa geral de acertos',pct(overall.accuracy),delta)}${stat('metric-green','layers','Questões no período',num(cfg.periodAnswered ?? comparison.current.answered),`${num(overall.answered)} respostas no total`)}${stat('metric-orange','clock','Tempo total de estudo',duration(E.totalStudyTime(account,now)),'Soma dos cronômetros das sessões')}${stat('metric-red','focus','Tempo médio por questão',shortTime(overall.avgTimeMs),'Tempo das respostas registradas')}</div>
      <div class="performance-grid">
        ${panel('Evolução da taxa de acerto',cfg.subtitle,accuracyChart(series),'span-8')}
        ${panel('Comparação',`Período atual vs. ${cfg.compareLabel}`,comparisonPanel(comparison),'span-4')}
        ${panel('Volume de questões',`Questões respondidas por ${cfg.unit}`,volumeChart(series),'span-6')}
        ${panel('Distribuição por área','Respostas e acertos nas quatro áreas do ENEM',distribution(areas,overall.answered),'span-6')}
        ${panel('Acerto por matéria','Ordenado do maior para o menor acerto',subjectPerformance(subjects),'span-7',segmented('subject-view',performance.subjectView,[{value:'barras',label:'Barras'},{value:'tabela',label:'Tabela'}],'Visualização por matéria'))}
        ${panel('Assuntos','Pelo menos 4 respostas para identificar um padrão.',topicRankings(ranks),'span-5')}
        ${panel('Calendário de atividades','Questões respondidas por dia nas últimas 20 semanas.',calendarHTML(calendar),'span-12')}
        ${panel('Metas pessoais','Seu progresso acompanha as respostas e as sessões.',goalsHTML(goals),'span-7',`<button class="small-button" id="edit-goals">Editar metas ${icons('target')}</button>`)}
        ${panel('Recomendações de revisão','Pontos de atenção, dificuldades e tempo sem revisar.',`<ul class="review-recommendations">${recs(4).map((r,i)=>`<li style="--i:${i}"><button data-start-topic="${r.topicId}"><span class="rr-copy"><span class="rr-title"><strong>${esc(r.topicName)}</strong><span class="rr-badge tone-${r.kind==='desempenho'?'coral':r.kind==='revisao'?'sage':'gold'}">${REC_LABEL[r.kind]||'Recomendado'}</span></span><small>${esc(r.reason)}</small></span>${icons('arrow')}</button></li>`).join('')}</ul>`,'span-5')}
      </div></div>`;
    $$('[data-period]').forEach(b=>b.onclick=()=>{if(performance.period===b.dataset.period)return;performance.period=b.dataset.period;performance.fadeChart=true;renderPerformance();});
    $$('[data-subject-view]').forEach(b=>b.onclick=()=>{performance.subjectView=b.dataset.subjectView;renderPerformance();});
    $$('[data-start-topic]').forEach(b=>b.onclick=()=>startTopic(b.dataset.startTopic));
    $$('[data-calendar-day]').forEach(b=>b.onclick=()=>toast(b.getAttribute('aria-label')));
    $('#edit-goals').onclick=editGoals;
    bindAccuracyChart(series, { fade: !!performance.fadeChart });
    performance.fadeChart = false;
    $$('.personal-goals article').forEach((el,i)=>el.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:420,delay:100+i*70,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}));
    $$('.goal-ring').forEach(el=>{const to=el.style.getPropertyValue('--goal-progress');el.animate([{'--goal-progress':'0deg'},{'--goal-progress':to}],{duration:900,easing:'cubic-bezier(.22,1,.36,1)'});});
  }
  /* ---------------------------------------------------------------- */
  /* Evolução da taxa de acerto (modelo do gráfico antigo)             */
  /* ---------------------------------------------------------------- */
  const REC_LABEL = { desempenho:'Ponto de atenção', dificuldade:'Sua dificuldade', revisao:'Hora de revisar', novo:'Para explorar', manter:'Manter o ritmo' };
  const WEEK = 7 * 86400000;
  const sow = t => { const d = new Date(t); d.setHours(0,0,0,0); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return d; };
  const som = t => { const d = new Date(t); d.setHours(0,0,0,0); d.setDate(1); return d; };
  /** Séries por semana ou mês desde a primeira resposta (sem limite de janelas). */
  function allTimeSeries(rs, now) {
    if (!rs.length) return { series: E.buildSeries(rs, 'month', now), unit: 'mês', gran: 'month' };
    const first = Math.min(...rs.map(r => r.answeredAt));
    const weekly = (now - sow(first).getTime()) / WEEK <= 16;
    const ranges = [];
    const fmtWeek = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });
    const fmtMonth = new Intl.DateTimeFormat('pt-BR', { month: 'short' });
    const multiYear = new Date(first).getFullYear() !== new Date(now).getFullYear();
    let cur = weekly ? sow(first) : som(first);
    while (cur.getTime() <= now) {
      const next = new Date(cur); if (weekly) next.setDate(next.getDate() + 7); else next.setMonth(next.getMonth() + 1);
      const m = fmtMonth.format(cur).replace('.', '');
      ranges.push({ start: cur.getTime(), end: next.getTime(), key: cur.toISOString(), label: weekly ? fmtWeek.format(cur) : (multiYear ? `${m}/${String(cur.getFullYear()).slice(2)}` : m) });
      cur = next;
    }
    const series = ranges.map(r => { const sm = E.summarize(rs.filter(x => x.answeredAt >= r.start && x.answeredAt < r.end)); return { ...r, answered: sm.answered, correct: sm.correct, accuracy: sm.answered ? sm.accuracy : null, timeMs: sm.timeMs }; });
    return { series, unit: weekly ? 'semana' : 'mês', gran: weekly ? 'week' : 'month' };
  }
  function periodData(rs, period, now) {
    if (period !== 'all') {
      const c = E.GRANULARITY_CONFIG[period];
      return { series: E.buildSeries(rs, period, now), comparison: E.comparePeriods(rs, period, now), cfg: { ...c, unit: period === 'week' ? 'semana' : 'mês', subtitle: `${c.label} · ${period === 'week' ? 'últimas' : 'últimos'} ${c.buckets} ${period === 'week' ? 'semanas' : 'meses'}` } };
    }
    const { series, unit } = allTimeSeries(rs, now);
    // Comparação: segunda metade do seu histórico vs. primeira metade.
    const first = rs.length ? Math.min(...rs.map(r => r.answeredAt)) : now;
    const mid = first + (now - first) / 2;
    const current = E.summarize(rs.filter(r => r.answeredAt >= mid));
    const previous = E.summarize(rs.filter(r => r.answeredAt < mid));
    const comparison = { current: E.summarize(rs), previous, accuracyDelta: previous.answered && current.answered ? current.accuracy - previous.accuracy : null, answeredDelta: previous.answered ? (current.answered - previous.answered) / previous.answered : null, half: current };
    return { series, comparison: { ...comparison, current }, cfg: { label: 'Todo o período', periodAnswered: rs.length, buckets: series.length, unit, compareLabel: 'primeira metade do seu histórico', subtitle: `Todo o período · ${series.length} ${unit === 'semana' ? (series.length === 1 ? 'semana' : 'semanas') : (series.length === 1 ? 'mês' : 'meses')} desde a primeira resposta` } };
  }
  /** Curva monotônica (mesma interpolação "monotone" do gráfico antigo). */
  function monotonePath(pts) {
    if (!pts.length) return '';
    if (pts.length === 1) return `M${pts[0][0]},${pts[0][1]}`;
    const n = pts.length, t = new Array(n).fill(0), sgn = v => (v > 0) - (v < 0);
    const sl = k => (pts[k + 1][1] - pts[k][1]) / (pts[k + 1][0] - pts[k][0] || 1);
    for (let k = 1; k < n - 1; k++) {
      const h0 = pts[k][0] - pts[k - 1][0], h1 = pts[k + 1][0] - pts[k][0], s0 = sl(k - 1), s1 = sl(k), q = (s0 * h1 + s1 * h0) / (h0 + h1);
      t[k] = (sgn(s0) + sgn(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(q)) || 0;
    }
    t[0] = n > 2 ? (3 * sl(0) - t[1]) / 2 : sl(0);
    t[n - 1] = n > 2 ? (3 * sl(n - 2) - t[n - 2]) / 2 : sl(0);
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let k = 0; k < n - 1; k++) {
      const [x0, y0] = pts[k], [x1, y1] = pts[k + 1], dx = (x1 - x0) / 3;
      d += `C${x0 + dx},${y0 + dx * t[k]},${x1 - dx},${y1 - dx * t[k + 1]},${x1},${y1}`;
    }
    return d;
  }
  function accuracyChart(series) {
    return `<div class="acc-chart" role="img" aria-label="Evolução da taxa de acerto. Os valores também estão disponíveis na tabela abaixo."><svg class="acc-svg" aria-hidden="true"></svg><div class="acc-tip" hidden></div></div>${dataTable(series)}`;
  }
  /** Desenha o gráfico com a largura real do painel e liga o tooltip. */
  function bindAccuracyChart(series, { fade = false } = {}) {
    const box = $('.acc-chart');
    if (!box) return;
    const svg = box.querySelector('.acc-svg'), tip = box.querySelector('.acc-tip');
    const H = 240, L = 44, R = 12, T = 12, B = 30;
    let geo = null;
    const draw = (reveal) => {
      const W = Math.max(280, box.clientWidth);
      const x = i => L + (series.length > 1 ? i * (W - L - R) / (series.length - 1) : (W - L - R) / 2);
      const y = v => T + (1 - v) * (H - T - B);
      const pts = series.map((s, i) => s.accuracy === null ? null : [x(i), y(s.accuracy), i]).filter(Boolean);
      const line = monotonePath(pts);
      const area = pts.length > 1 ? `${line}L${pts.at(-1)[0]},${y(0)}L${pts[0][0]},${y(0)}Z` : '';
      const every = Math.max(1, Math.ceil(series.length / Math.max(2, Math.floor((W - L) / 64))));
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      svg.setAttribute('width', W); svg.setAttribute('height', H);
      svg.innerHTML = `<defs><linearGradient id="acc-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#a98220" stop-opacity=".32"/><stop offset="100%" stop-color="#a98220" stop-opacity="0"/></linearGradient><clipPath id="acc-clip"><rect class="acc-clip-rect" x="0" y="0" width="${reveal ? 0 : W}" height="${H}"/></clipPath></defs>
        ${[0, .25, .5, .75, 1].map(v => `<line class="acc-grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text class="acc-tick" x="${L - 10}" y="${y(v) + 4}" text-anchor="end">${Math.round(v * 100)}%</text>`).join('')}
        ${series.map((s, i) => (i === series.length - 1 || (i % every === 0 && series.length - 1 - i >= every * 0.6)) ? `<text class="acc-tick" x="${x(i)}" y="${H - 8}" text-anchor="middle">${esc(s.label)}</text>` : '').join('')}
        <line class="acc-cursor" x1="0" x2="0" y1="${T}" y2="${y(0)}" visibility="hidden"/>
        <g clip-path="url(#acc-clip)">${area ? `<path d="${area}" fill="url(#acc-fill)"/>` : ''}${pts.length > 1 ? `<path class="acc-line" d="${line}"/>` : ''}</g>
        ${pts.length === 1 ? `<circle cx="${pts[0][0]}" cy="${pts[0][1]}" r="4" fill="#a98220"/>` : ''}
        <circle class="acc-active" r="5" visibility="hidden"/>`;
      geo = { pts, W };
      if (reveal) {
        const rect = svg.querySelector('.acc-clip-rect');
        rect.animate([{ width: '0px' }, { width: `${W}px` }], { duration: 900, easing: 'cubic-bezier(0,0,.58,1)' }).finished.catch(() => {}).finally(() => rect.setAttribute('width', W));
        setTimeout(() => rect.setAttribute('width', W), 950);
      }
    };
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    draw(!reduce);
    if (fade && !reduce) box.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: 'ease-out' });
    const hide = () => { svg.querySelector('.acc-cursor')?.setAttribute('visibility', 'hidden'); svg.querySelector('.acc-active')?.setAttribute('visibility', 'hidden'); tip.hidden = true; tip.dataset.i = ''; };
    box.addEventListener('pointermove', e => {
      if (!geo?.pts.length) return;
      const r = box.getBoundingClientRect();
      const px = (e.clientX - r.left) * (geo.W / r.width);
      const p = geo.pts.reduce((a, b) => Math.abs(b[0] - px) < Math.abs(a[0] - px) ? b : a);
      const s = series[p[2]];
      const cur = svg.querySelector('.acc-cursor'), dot = svg.querySelector('.acc-active');
      cur.setAttribute('x1', p[0]); cur.setAttribute('x2', p[0]); cur.setAttribute('visibility', 'visible');
      dot.setAttribute('cx', p[0]); dot.setAttribute('cy', p[1]); dot.setAttribute('visibility', 'visible');
      if (tip.dataset.i !== String(p[2])) {
        const wasHidden = tip.hidden;
        tip.dataset.i = String(p[2]);
        tip.innerHTML = `<p class="acc-tip-title">${esc(s.label)}</p><p class="acc-tip-row"><span><i></i>Acerto</span><b>${pct(s.accuracy)}</b></p><p class="acc-tip-row"><span>Questões</span><b>${s.answered}</b></p>`;
        tip.hidden = false;
        if (wasHidden && !reduce) tip.animate([{ opacity: 0, transform: 'translateY(4px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 160, easing: 'ease-out' });
      }
      const sx = p[0] * (r.width / geo.W), tw = tip.offsetWidth;
      tip.style.left = `${Math.min(r.width - tw, Math.max(0, sx + 14 + tw > r.width ? sx - tw - 14 : sx + 14))}px`;
      tip.style.top = `${Math.max(0, p[1] - 30)}px`;
    });
    box.addEventListener('pointerleave', hide);
    if (window.ResizeObserver) { let w = box.clientWidth; new ResizeObserver(() => { if (Math.abs(box.clientWidth - w) > 2 && document.contains(box)) { w = box.clientWidth; draw(false); hide(); } }).observe(box); }
  }
  function dataTable(series) { return `<details class="chart-data"><summary>Ver dados em tabela</summary><div class="table-scroll"><table><caption>Respostas e acertos por período</caption><thead><tr><th>Período</th><th>Respondidas</th><th>Acertos</th><th>Taxa</th></tr></thead><tbody>${series.map(s=>`<tr><th scope="row">${esc(s.label)}</th><td>${s.answered}</td><td>${s.correct}</td><td>${s.accuracy===null?'Sem dados':pct(s.accuracy)}</td></tr>`).join('')}</tbody></table></div></details>`; }
  function volumeChart(series) { const max=Math.max(1,...series.map(s=>s.answered));return `<div class="volume-chart" role="img" aria-label="Volume de questões por período. Consulte também a tabela abaixo.">${series.map(s=>`<div class="volume-column"><div class="volume-space"><div class="volume-bar" style="--bar-height:${s.answered/max*100}%" title="${esc(s.label)}: ${s.answered} questões"><span>${s.answered||''}</span></div></div><span>${esc(s.label)}</span></div>`).join('')}</div>${dataTable(series)}`; }
  function comparisonPanel(cmp) { return `<div class="comparison-groups">${[{label:'Taxa de acerto',cur:cmp.current.accuracy,prev:cmp.previous.accuracy,max:1,format:pct},{label:'Questões respondidas',cur:cmp.current.answered,prev:cmp.previous.answered,max:Math.max(1,cmp.current.answered,cmp.previous.answered),format:num}].map(row=>`<div><h3>${row.label}</h3><div class="comparison-row"><span>Atual</span>${bar(row.cur/row.max,'#2856b6',`${row.label} no período atual`)}<b>${row.format(row.cur)}</b></div><div class="comparison-row"><span>Anterior</span>${bar(row.prev/row.max,'#6db589',`${row.label} no período anterior`)}<b>${cmp.previous.answered?row.format(row.prev):'—'}</b></div></div>`).join('')}${!cmp.previous.answered?'<p class="field-hint">Sem atividades no período anterior para comparar.</p>':''}</div>`; }
  function distribution(areas,total) { let start=0;const gradient=areas.map(a=>{const end=start+(total?a.answered/total*100:0);const piece=`${colors[a.areaId]} ${start}% ${end}%`;start=end;return piece;}).join(',');return `<div class="distribution-layout"><div class="distribution-donut" style="background:${total?`conic-gradient(${gradient})`:'#edf0eb'}" aria-hidden="true"><div><strong>${num(total)}</strong><span>questões</span></div></div><ul class="distribution-legend">${areas.map(a=>`<li><i style="background:${colors[a.areaId]}"></i><span>${esc(E.AREA_BY_ID[a.areaId].name)}<small>${a.answered} respostas · ${pct(a.accuracy)} de acerto</small></span></li>`).join('')}</ul></div>`; }
  const subjectTile = s => `<span class="subject-tile" aria-hidden="true">${icons(SUBJECT_ICON[s.subjectId] || 'book')}</span>`;
  function subjectPerformance(subjects) { if(performance.subjectView==='tabela')return `<div class="table-scroll"><table><caption>Desempenho por matéria</caption><thead><tr><th>Matéria</th><th>Respondidas</th><th>Acertos</th><th>Tempo médio</th><th>Acerto</th></tr></thead><tbody>${subjects.map(s=>`<tr><th scope="row" style="--area-ink:${inks[s.areaId]};--area-bg:var(--${s.areaId}-bg)">${subjectTile(s)}${esc(s.name)}</th><td>${s.answered}</td><td>${s.correct}</td><td>${shortTime(s.avgTimeMs)}</td><td><strong>${pct(s.accuracy)}</strong></td></tr>`).join('')}</tbody></table></div>`;return `<ul class="subject-rows">${subjects.map(s=>`<li style="--area-ink:${inks[s.areaId]};--area-bg:var(--${s.areaId}-bg)">${subjectTile(s)}<div class="subject-row-main"><div class="subject-row-top"><strong>${esc(s.name)}</strong><span>${s.correct}/${s.answered} · <b>${pct(s.accuracy)}</b></span></div>${bar(s.accuracy,colors[s.areaId],`${s.name}: ${pct(s.accuracy)}`)}</div></li>`).join('')}</ul>`; }
  function topicRankings(ranks) { return [{title:'Maior dificuldade',items:ranks.weakest.slice(0,4),weak:true},{title:'Melhor desempenho',items:ranks.strongest.slice(0,4),weak:false}].map(group=>`<div class="ranking-group"><h3>${icons(group.weak?'target':'check')}${group.title}</h3>${group.items.map(t=>`<div><span>${esc(t.name)}<small>${t.answered} questões respondidas</small></span><strong>${pct(t.accuracy)}</strong>${group.weak?`<button class="text-button" data-start-topic="${t.topicId}">Praticar ${icons('arrow')}</button>`:''}</div>`).join('')||'<p class="field-hint">Responda mais questões para identificar.</p>'}</div>`).join(''); }
  function calendarHTML(columns) { const date=new Intl.DateTimeFormat('pt-BR',{day:'numeric',month:'long'});return `<div class="activity-calendar-scroll"><div class="activity-calendar">${columns.map(col=>`<div>${col.map(cell=>{const level=!cell.count?0:cell.count<6?1:cell.count<15?2:cell.count<30?3:4;const label=`${date.format(cell.date)}: ${cell.future?'data futura':`${cell.count} questões, ${cell.correct} acertos`}`;return `<button class="calendar-cell level-${level} ${cell.future?'future':''}" data-calendar-day="${cell.key}" title="${label}" aria-label="${label}" ${cell.future?'disabled':''}></button>`;}).join('')}</div>`).join('')}</div></div><div class="calendar-legend"><span>20 semanas de pequenos passos</span><span>Menos <i class="level-0"></i><i class="level-1"></i><i class="level-2"></i><i class="level-3"></i><i class="level-4"></i> Mais</span></div>`; }
  function goalsHTML(goals) { return goals.length?`<div class="personal-goals">${goals.map((p,i)=>{const meta=E.GOAL_META[p.goal.kind];return `<article class="${p.done?'is-done':''}"><div class="goal-ring" style="--goal-progress:${Math.min(1,p.progress)*360}deg" role="img" aria-label="${meta.title}: ${p.pendingReason||`${meta.format(p.current)} de ${meta.format(p.goal.target)}`}"><span>${p.done?icons('check-circle'):p.pendingReason?'—':meta.format(p.current)}</span></div><h3>${meta.title}</h3><p>${p.pendingReason||`${meta.format(p.current)} de ${meta.format(p.goal.target)}`}</p></article>`;}).join('')}</div>`:'<p class="field-hint">Nenhuma meta ativa. Use “Editar metas” para definir seu próximo passo.</p>'; }
  function editGoals() { openDialog(`<span class="dialog-label">SEU RITMO, SUAS METAS</span><h2 id="dialog-title" class="dialog-title">Pequenos passos possíveis.</h2><p class="dialog-description">As metas são recalculadas com base nas suas práticas e no histórico demonstrativo.</p><form id="goals-form">${account.goals.map(g=>{const meta=E.GOAL_META[g.kind];return `<div class="goal-editor-row"><label class="goal-enable"><input type="checkbox" name="enabled-${g.kind}" ${g.enabled?'checked':''}><span><strong>${meta.title}</strong><small>${meta.description}</small></span></label><label class="goal-target">Meta em ${meta.unit}<input type="number" name="target-${g.kind}" value="${g.target}" min="${meta.min}" max="${meta.max}" step="${meta.step}" required></label></div>`;}).join('')}<button class="primary-button" type="submit">Salvar metas ${icons('check')}</button></form>`);document.querySelector('#goals-form').onsubmit=event=>{event.preventDefault();const data=new FormData(event.target);account.goals=account.goals.map(g=>({...g,enabled:data.has(`enabled-${g.kind}`),target:Number(data.get(`target-${g.kind}`))}));save();closeDialog();renderPerformance();toast('Metas atualizadas. Um caminho possível para você.');}; }
  return { mount, startOfficial, startRecommended, recommendationOverview, startChallenge: () => challenge.start(), challengeStore: () => challenge.store(), reviewOverview, startReviewMode, startTopics, startReview, resumeLatest, sessionInfo, latestInProgress, resumeById, startSimulation, openExam, simulationInfo, resumeTarget, pendingSessions, openById, records, account: () => account, save };
}
