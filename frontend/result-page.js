// Resultado da lista: réplica de features/practice/PracticeResultPage.tsx
// (card grafite com anel de acerto, partículas quando ≥ 80%, contadores
// animados, desempenho por assunto, tempo e recomendações, revisão questão a
// questão com Collapse). Também mostra o resultado de simulados, com o
// desempenho por área e a nota estimada ILUSTRATIVA (não é TRI).
import { animate, spring, duration, ease, countTo, collapse, reduced } from './motion-kit.js';
import { esc, hi, pct, SUBJECT_ICON, tile, cardHeader, card, badge, btn, progress, playBars, rotateChevron } from './legacy-ui.js';
import { questionTextHTML, descriptionsHTML } from './question-text.js';

const DIFFICULTY = { facil: 'Fácil', media: 'Média', dificil: 'Difícil' };
const clock = ms => { const t = Math.max(0, Math.floor(ms / 1000)); const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60; const p = n => String(n).padStart(2, '0'); return h ? `${h}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`; };
const shortSeconds = ms => { const s = Math.round(ms / 1000); return s < 60 ? `${s}s` : `${Math.floor(s / 60)}min ${String(s % 60).padStart(2, '0')}s`; };
const dateLong = iso => new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
const time = iso => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
function verdict(acc) {
  if (acc >= 0.85) return { title: 'Excelente!', text: 'Domínio claro do conteúdo. Que tal subir a dificuldade?' };
  if (acc >= 0.65) return { title: 'Bom trabalho!', text: 'Você está no caminho. Revise os erros para consolidar.' };
  if (acc >= 0.4) return { title: 'Continue praticando', text: 'Cada erro revisado vira acerto na prova. Vamos revisar?' };
  return { title: 'Hora de revisar a base', text: 'Releia as explicações com calma e tente novamente em seguida.' };
}

export function resultHTML(E, session, { simulation = null } = {}) {
  const r = E.practiceResult(session, Date.now());
  const sim = simulation ? E.simulationResult(simulation, Date.now()) : null;
  const acc = sim ? sim.accuracy : r.accuracy;
  const v = verdict(sim ? sim.accuracy : r.accuracyAnswered);
  const inProgress = session.status !== 'completed';
  const R = 77, C = 2 * Math.PI * R;
  const stats = [
    { icon: 'Target', tone: 'neutral', label: 'Total', value: r.total },
    { icon: 'CheckCircle2', tone: 'success', label: 'Acertos', value: r.correct },
    { icon: 'XCircle', tone: 'danger', label: 'Erros', value: sim ? sim.wrong : r.wrong },
    { icon: 'Hourglass', tone: 'neutral', label: sim ? 'Em branco' : 'Não respondidas', value: sim ? sim.blank : r.unanswered },
  ];
  const topics = r.byTopic.length ? `<ul class="rs-topics">${r.byTopic.map((t, i) => `<li><div><span>${esc(t.name)}</span><span>${t.correct}/${t.total} · <strong>${pct(t.accuracy)}</strong></span></div>${progress(t.accuracy, t.accuracy >= 0.7 ? 'sage' : t.accuracy >= 0.5 ? 'gold' : 'coral', { delay: 0.2 + i * 0.08, label: `${t.name}: ${pct(t.accuracy)}` })}</li>`).join('')}</ul>` : '<p class="rs-muted">Responda ao menos uma questão para ver o desempenho por assunto.</p>';
  const weak = r.byTopic.filter(t => t.accuracy < 0.7).slice(0, 3);
  const review = session.questionIds.map((qid, i) => {
    const q = E.questionRepository.getById(qid);
    if (!q) return '';
    const a = session.answers[qid];
    const st = !a?.confirmed ? 'pending' : a.correct ? 'correct' : 'wrong';
    return `<div class="rs-q" data-rq="${esc(qid)}"><button type="button" class="rs-q-head" data-rq-toggle="${esc(qid)}" aria-expanded="false"><span class="rs-q-n is-${st}">${i + 1}</span><span class="rs-q-main"><span>${esc(q.support?.paragraphs[0] ?? q.prompt)}</span><small>${esc(q.skill)}</small></span>${badge(st === 'correct' ? 'Acertou' : st === 'wrong' ? 'Errou' : 'Não respondida', st === 'correct' ? 'success' : st === 'wrong' ? 'danger' : 'neutral', '', 'sm')}<span class="rs-chev">${hi('ChevronDown')}</span></button></div>`;
  }).join('');
  return `<div class="lg-page rs">
    <div class="rs-grid" data-rs-stagger>
      ${card(`<div class="cfg-dots" aria-hidden="true"></div><div class="rs-hero">
        <div class="rs-ring-wrap"><div class="rs-burst" id="rs-burst" aria-hidden="true"></div>
          <div class="rs-ring" role="img" aria-label="Acerto de ${pct(acc)}"><svg width="168" height="168" viewBox="0 0 168 168"><circle cx="84" cy="84" r="${R}" fill="none" stroke="var(--lg-ink-raised-strong)" stroke-width="14"/><circle id="rs-ring-arc" cx="84" cy="84" r="${R}" fill="none" stroke="var(--lg-gold)" stroke-width="14" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - acc)}" data-full="${C}" data-target="${C * (1 - acc)}" transform="rotate(-90 84 84)" style="${acc === 0 ? 'opacity:0' : ''}"/></svg>
            <div class="rs-ring-label"><p><span id="rs-acc" data-to="${Math.round(acc * 100)}">${Math.round(acc * 100)}%</span></p><small>de acerto</small></div></div></div>
        <div class="rs-hero-copy"><p class="rs-kicker">${simulation ? (inProgress ? 'Simulado em andamento' : 'Simulado finalizado') : inProgress ? 'Resultado parcial' : 'Lista concluída'}</p>
          <h1>${v.title}</h1><p class="rs-verdict">${v.text}</p>
          <p class="rs-meta">${esc(session.title)} · ${dateLong(session.completedAt ?? session.updatedAt)} às ${time(session.completedAt ?? session.updatedAt)}</p>
          <div class="rs-actions">${r.wrongIds.length ? btn(`Refazer ${r.wrongIds.length} ${r.wrongIds.length === 1 ? 'erro' : 'erros'}`, { variant: 'accent', icon: 'RotateCcw', extra: { id: 'rs-retry' } }) : ''}${btn(simulation ? 'Novo simulado' : 'Nova lista', { variant: 'on-ink', icon: 'Plus', extra: { id: 'rs-new' } })}${btn('Início', { variant: 'on-ink', icon: 'House', extra: { id: 'rs-home' } })}${btn('Salvar nas notas', { variant: 'on-ink', icon: 'NotebookPen', extra: { id: 'rs-note' } })}</div></div>
      </div>`, { surface: 'ink', padded: 'lg', cls: 'rs-span-12 rs-hero-card' })}
      ${stats.map(s => card(`${tile(s.icon, s.tone, 'lg')}<div><p class="rs-stat-label">${s.label}</p><p class="rs-stat-value" data-count="${s.value}">${s.value}</p></div>`, { cls: 'rs-span-3 rs-stat' })).join('')}
      ${sim ? card(`${cardHeader('Desempenho por área', 'Acertos nas questões respondidas. Não há cálculo de nota TRI.')}<ul class="rs-areas">${sim.byArea.map((a, i) => `<li>${tile(['BookOpen', 'Globe', 'Leaf', 'Sigma'][['linguagens', 'humanas', 'natureza', 'matematica'].indexOf(a.areaId)] || 'BookOpen', a.areaId, 'sm')}<div><div><span>${esc(a.name)}</span><span>${a.correct}/${a.total}${a.blank ? ` · ${a.blank} em branco` : ''} · <strong>${pct(a.accuracy)}</strong></span></div>${progress(a.accuracy, a.areaId, { delay: 0.2 + i * 0.08 })}</div></li>`).join('')}</ul>`, { cls: 'rs-span-12' }) : ''}
      ${card(`${cardHeader('Desempenho por assunto', 'Ordenado do menor para o maior acerto')}${topics}`, { cls: 'rs-span-7' })}
      ${card(`${cardHeader('Tempo e revisão')}<div class="rs-time"><div>${hi('Clock')}<p>Tempo utilizado</p><strong>${clock(sim ? sim.timeMs : r.timeMs)}</strong></div><div>${hi('Gauge')}<p>Média por questão</p><strong>${shortSeconds(sim ? sim.avgTimeMs : r.avgTimeMs)}</strong></div></div>
        <p class="rs-sub">Recomendações de revisão</p><ul class="rs-recs">${weak.map(t => `<li><button type="button" data-rs-topic="${esc(t.topicId)}">${hi('RotateCcw')}<span>Praticar mais <strong>${esc(t.name)}</strong></span>${hi('ArrowRight')}</button></li>`).join('')}${r.byTopic.length && r.byTopic.every(t => t.accuracy >= 0.7) ? '<li class="rs-ok">Nenhum assunto abaixo de 70% nesta lista. Excelente consistência!</li>' : ''}</ul>`, { cls: 'rs-span-5' })}
    </div>
    <section aria-labelledby="rs-review-title" class="rs-review"><h2 id="rs-review-title">Revisão das questões</h2><div class="rs-qs">${review}</div></section>
    ${inProgress && !simulation ? `<div class="rs-center">${btn('Voltar para a lista em andamento', { icon: 'ArrowRight', extra: { id: 'rs-back-list' } })}</div>` : ''}
    <p class="rs-foot">Veja todas as atividades em <button type="button" id="rs-history">Histórico</button>.</p>
  </div>`;
}

/** Animações de entrada e interações do resultado. */
export function bindResultPage(root, E, session, handlers) {
  const $ = s => root.querySelector(s);
  const grid = $('[data-rs-stagger]');
  if (grid && !reduced()) [...grid.children].forEach((el, i) => animate(el, { opacity: [0, 1], y: [16, 0] }, { duration: duration.slow, ease: ease.out, delay: 0.04 + i * 0.07 }));
  playBars(root);
  // Anel desenhado progressivamente e número animado.
  const arc = $('#rs-ring-arc');
  if (arc && !reduced()) arc.animate([{ strokeDashoffset: arc.dataset.full }, { strokeDashoffset: arc.dataset.target }], { duration: 900, easing: 'cubic-bezier(0.2,0,0,1)', fill: 'both' });
  const accEl = $('#rs-acc');
  if (accEl) { accEl.dataset.value = '0'; countTo(accEl, Number(accEl.dataset.to), { seconds: 0.9, format: n => `${Math.round(n)}%` }); }
  root.querySelectorAll('[data-count]').forEach(el => { el.dataset.value = '0'; countTo(el, Number(el.dataset.count), { seconds: 0.9 }); });
  // Partículas de celebração quando o acerto passa de 80%.
  const answered = session.questionIds.filter(id => session.answers[id]?.confirmed);
  const accAnswered = answered.length ? answered.filter(id => session.answers[id].correct).length / answered.length : 0;
  if (accAnswered >= 0.8 && !reduced()) burst($('#rs-burst'));
  // Revisão questão a questão (Collapse + chevron).
  root.querySelectorAll('[data-rq-toggle]').forEach(b => b.onclick = () => {
    const wrap = b.closest('.rs-q');
    const open = b.getAttribute('aria-expanded') !== 'true';
    root.querySelectorAll('.rs-q-head[aria-expanded="true"]').forEach(other => { if (other !== b) closeQ(other); });
    if (!open) { closeQ(b); return; }
    b.setAttribute('aria-expanded', 'true');
    rotateChevron(b.querySelector('.rs-chev'), true);
    wrap.insertAdjacentHTML('beforeend', reviewBody(E, session, b.dataset.rqToggle));
    collapse(wrap.querySelector('.rs-q-body'), true);
  });
  function closeQ(b) {
    b.setAttribute('aria-expanded', 'false');
    rotateChevron(b.querySelector('.rs-chev'), false);
    const body = b.closest('.rs-q').querySelector('.rs-q-body');
    if (body) collapse(body, false).then(() => body.remove());
  }
  const on = (sel, fn) => { const el = $(sel); if (el) el.onclick = fn; };
  on('#rs-retry', handlers.retry);
  on('#rs-new', handlers.newList);
  on('#rs-home', handlers.home);
  on('#rs-history', handlers.history);
  on('#rs-back-list', handlers.backToList);
  on('#rs-note', e => handlers.saveNote(e.currentTarget));
  root.querySelectorAll('[data-rs-topic]').forEach(b => b.onclick = () => handlers.reviewTopic(b.dataset.rsTopic));
}

function reviewBody(E, session, qid) {
  const q = E.questionRepository.getById(qid);
  const a = session.answers[qid];
  const subject = E.SUBJECT_BY_ID[q.subjectId];
  const topic = E.TOPIC_BY_ID[q.topicId];
  return `<div class="rs-q-body"><div class="rs-q-inner">
    <div class="lg-qmeta"><span class="lg-badge tone-${q.areaId}">${hi(SUBJECT_ICON[q.subjectId] || 'BookOpen')}<span>${esc(subject.name)}</span></span><span class="lg-badge"><span>${esc(topic?.name ?? '')}</span></span><span class="lg-badge tone-outline is-sm lg-push"><span>ENEM ${q.year}</span></span><span class="lg-badge tone-outline is-sm"><span>${q.difficultyKnown === false ? 'Dificuldade não informada' : DIFFICULTY[q.difficulty] ?? ''}</span></span></div>
    <div class="rs-q-text"><div class="qs-prompt">${questionTextHTML(q.prompt)}</div>${descriptionsHTML(q.descriptions)}</div>
    <ul class="rs-alts">${q.alternatives.map(alt => { const correct = alt.letter === q.correct; const mine = a?.confirmed && a.selected === alt.letter; return `<li class="${correct ? 'is-correct' : mine ? 'is-wrong' : 'is-dim'}"><span>${correct ? hi('Check') : mine ? hi('X') : alt.letter}</span><p>${esc(alt.text)}</p>${correct ? `<em>${mine ? 'Sua resposta · correta' : 'Correta'}</em>` : mine ? '<em>Sua resposta</em>' : ''}</li>`; }).join('')}</ul>
    <div class="rs-explain"><p>Gabarito oficial</p>${esc(q.explanation)}</div>
  </div></div>`;
}

function burst(host) {
  if (!host) return;
  const colors = ['var(--lg-gold)', 'var(--lg-sage)', 'var(--lg-coral)', 'var(--lg-on-ink)', 'var(--lg-gold-strong)'];
  for (let i = 0; i < 22; i++) {
    const angle = (i / 22) * Math.PI * 2 + Math.random() * 0.4;
    const dist = 130 * (0.55 + Math.random() * 0.5);
    const size = 5 + Math.random() * 6;
    const p = document.createElement('span');
    p.style.cssText = `position:absolute;left:50%;top:50%;width:${size}px;height:${size}px;margin:${-size / 2}px;border-radius:${i % 3 === 0 ? '2px' : '50%'};background:${colors[i % colors.length]}`;
    host.append(p);
    p.animate([
      { transform: 'translate(0,0) scale(.4) rotate(0deg)', opacity: 0 },
      { transform: `translate(${Math.cos(angle) * dist * 0.4}px,${Math.sin(angle) * dist * 0.4}px) scale(1)`, opacity: 1, offset: 0.15 },
      { transform: `translate(${Math.cos(angle) * dist * 0.85}px,${Math.sin(angle) * dist * 0.85}px) scale(.9)`, opacity: 1, offset: 0.7 },
      { transform: `translate(${Math.cos(angle) * dist}px,${Math.sin(angle) * dist}px) scale(.6) rotate(${Math.random() * 260 - 130}deg)`, opacity: 0 },
    ], { duration: 950, delay: 120 + Math.random() * 80, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' }).finished.then(() => p.remove());
  }
}
