// Página Perfil: réplica de features/profile/ProfilePage.tsx do front anterior
// (cabeçalho grafite com avatar e indicadores, informações pessoais editáveis,
// conquistas com medalhas, filtro e detalhe, e o card de metas pessoais de
// features/performance/GoalsCard.tsx). Componentes em legacy-ui.js.
import { animate, spring, duration, ease, countTo, reduced, snapshot, flipList } from './motion-kit.js';
import { THEME_OPTIONS, getThemePref, setThemePref, onThemeChange } from './theme.js';
import { esc, hi, pct, tile, cardHeader, card, badge, btn, seg, switchRow, progress, rerender, playBars, playReveal, animateSwitch } from './legacy-ui.js';

const ACH_ICON = { footprints: 'Footprints', flame: 'CalendarRange', target: 'Target', trophy: 'Trophy', mountain: 'Mountain', compass: 'Compass', crosshair: 'Crosshair', rotate: 'RotateCcw', sparkles: 'Sparkles', calendar: 'Calendar', medal: 'Medal', zap: 'Zap' };
const TIER_LABEL = { bronze: 'Bronze', prata: 'Prata', ouro: 'Ouro' };
// Cores de cada nível: aro (luz → sombra), face (centro → borda), ícone gravado e fita.
const TIER = {
  bronze: { rim: ['#f3c29f', '#9a5332'], face: ['#f8d3b6', '#c47a4e'], ink: '#5b2b14', ribbon: ['#e0714a', '#a9442a'], glow: '#c47a4e' },
  prata: { rim: ['#ffffff', '#8592a0'], face: ['#ffffff', '#b8c2cc'], ink: '#2f3a46', ribbon: ['#6584e6', '#3a54b4'], glow: '#9aa6b2' },
  ouro: { rim: ['#ffe8a3', '#b07d12'], face: ['#fff4c8', '#e2ab2c'], ink: '#5a3f06', ribbon: ['#3c9a62', '#226a41'], glow: '#e2ab2c' },
  locked: { rim: ['#f1f0ec', '#cfcdc6'], face: ['#fafaf8', '#e4e2dc'], ink: '#a3a39b', ribbon: ['#dcdad4', '#c5c3bc'], glow: 'transparent' },
};
const initials = name => name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';
const dateLong = iso => new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
let medalSeq = 0;

/** Medalha ilustrada (SVG) com faixa, disco metálico e ícone da conquista. */
/** Medalha ilustrada (SVG): fita dobrada, aro em relevo, face metálica e ícone gravado. */
export function medalHTML(a, size = 56, { shine = false } = {}) {
  const id = `m${++medalSeq}`;
  const locked = !a.unlocked;
  const t = TIER[locked ? 'locked' : a.tier];
  return `<div class="pf-medal ${locked ? 'is-locked' : `tier-${a.tier}`}" style="width:${size}px;height:${size * 1.25}px;--glow:${t.glow}">
    <svg viewBox="0 0 64 80" aria-hidden="true">
      <defs>
        <linearGradient id="${id}r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.rim[0]}"/><stop offset="1" stop-color="${t.rim[1]}"/></linearGradient>
        <radialGradient id="${id}f" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="${t.face[0]}"/><stop offset="1" stop-color="${t.face[1]}"/></radialGradient>
        <linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.ribbon[0]}"/><stop offset="1" stop-color="${t.ribbon[1]}"/></linearGradient>
      </defs>
      <!-- fita: duas tiras cruzadas com dobra sombreada -->
      <path d="M17 2h11l9 30-9 4z" fill="url(#${id}l)"/>
      <path d="M47 2H36l-9 30 9 4z" fill="${t.ribbon[1]}"/>
      <path d="M36 2h-3l-6 24 3 1z" fill="#000" opacity=".12"/>
      <!-- sombra projetada -->
      <ellipse cx="32" cy="76" rx="15" ry="2.6" fill="#000" opacity="${locked ? 0.05 : 0.12}"/>
      <!-- aro em relevo -->
      <circle cx="32" cy="50" r="23" fill="url(#${id}r)"/>
      <circle cx="32" cy="50" r="23" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1"/>
      <!-- face -->
      <circle cx="32" cy="50" r="18" fill="url(#${id}f)"/>
      <circle cx="32" cy="50" r="18" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="1"/>
      <circle cx="32" cy="50" r="15.2" fill="none" stroke="${locked ? '#d3d1ca' : '#fff'}" stroke-opacity="${locked ? 1 : 0.55}" stroke-width=".9" stroke-dasharray="${locked ? '2.2 2.2' : '0'}"/>
      <!-- brilho -->
      ${locked ? '' : '<path d="M19.5 43a13.5 13.5 0 0 1 11-9" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="2.2" stroke-linecap="round"/>'}
    </svg>
    <span class="pf-medal-icon" style="top:${size * 0.78125 - size * 0.15}px;--s:${size * 0.3}px;color:${t.ink}">${hi(locked ? 'Lock' : ACH_ICON[a.icon] || 'Medal')}</span>
    ${shine && !locked ? `<span class="pf-medal-shine" style="top:${size * 0.5}px;width:${size * 0.5625}px;height:${size * 0.5625}px;left:${size * 0.21875}px"><i></i></span>` : ''}
  </div>`;
}

export function createProfilePage({ E, root, getAccount, save, records, toast, onProfileChange }) {
  const $ = s => root.querySelector(s);
  const $$ = s => [...root.querySelectorAll(s)];
  const account = () => getAccount();
  const state = { filter: 'todas', error: null };

  function render() {
    const p = account().profile;
    const now = Date.now();
    const rs = records();
    const summary = E.summarize(rs);
    const studyDays = new Set(rs.map(r => new Date(r.answeredAt).toDateString())).size;
    const ach = E.evaluateAchievements({ records: rs, account: account(), now });
    const unlocked = ach.filter(a => a.unlocked);
    const stats = [
      { icon: 'CheckCircle2', label: 'Questões', value: summary.answered, fmt: 'n' },
      { icon: 'Target', label: 'Acerto', value: Math.round(summary.accuracy * 100), fmt: '%' },
      { icon: 'CalendarDays', label: 'Dias de estudo', value: studyDays, fmt: 'n' },
      { icon: 'Trophy', label: 'Conquistas', value: unlocked.length, fmt: `/${ach.length}` },
    ];
    root.innerHTML = `<div class="lg-page pf"><div class="pf-grid" data-stagger="0.07">
      ${card(`<div class="cfg-dots" aria-hidden="true"></div><div class="pf-hero">
        <span class="pf-avatar" id="pf-avatar" aria-hidden="true">${esc(initials(p.name))}</span>
        <div class="pf-id"><div class="pf-name"><h1>${esc(p.name)}</h1>${badge(p.kind === 'demo' ? 'Perfil demonstrativo' : p.kind === 'new' ? 'Estudante novo' : 'Conta local', 'gold')}</div>
          <p class="pf-sub">“${esc(p.nickname)}” · ${esc(p.email)}</p>
          <div class="pf-meta">${p.school ? `<span>${hi('School')}${esc(p.school)}</span>` : ''}${p.city ? `<span>${hi('MapPin')}${esc(p.city)}</span>` : ''}<span>${hi('CalendarDays')}Desde ${dateLong(p.createdAt)}</span></div></div>
        <div class="pf-stats">${stats.map(s => `<div>${hi(s.icon)}<p data-count="${s.value}" data-fmt="${s.fmt}">${s.value}</p><small>${s.label}</small></div>`).join('')}</div>
      </div>`, { surface: 'ink', padded: 'lg', cls: 'pf-span-12 pf-hero-card' })}
      ${card(`${cardHeader('Informações pessoais', 'Visíveis apenas para você nesta demonstração')}
        <form id="pf-form" novalidate><div class="pf-fields">
          ${field('name', 'Nome', p.name, { error: state.error })}${field('nickname', 'Apelido', p.nickname, { placeholder: 'Como prefere ser chamado' })}
          ${field('school', 'Escola', p.school, { optional: true })}${field('city', 'Cidade', p.city, { optional: true })}</div>
          <div class="pf-field"><label for="pf-bio">Sobre você <span>opcional</span></label><textarea id="pf-bio" name="bio" maxlength="280" aria-describedby="pf-bio-hint">${esc(p.bio)}</textarea><p id="pf-bio-hint" class="pf-hint">Ex.: série, curso desejado, objetivos.</p></div>
          <p class="pf-hint">Foto e avatar personalizados não estão disponíveis nesta versão — usamos suas iniciais.</p>
          <div class="pf-actions">${btn('Salvar alterações', { icon: 'Save', extra: { type: 'submit', id: 'pf-save', disabled: true } })}</div>
        </form>`, { cls: 'pf-span-5' })}
      ${card(`${cardHeader('Conquistas', `${unlocked.length} de ${ach.length} desbloqueadas`, tile('Trophy', 'gold'), seg('ach', state.filter, [{ value: 'todas', label: 'Todas' }, { value: 'desbloqueadas', label: 'Obtidas' }, { value: 'bloqueadas', label: 'Bloqueadas' }], { aria: 'Filtrar conquistas', size: 'sm' }))}
        <div class="pf-ach-bar">${progress(unlocked.length / ach.length, 'gold', { label: 'Conquistas desbloqueadas' })}</div>
        <div class="pf-ach" id="pf-ach">${achGrid(ach)}</div>`, { cls: 'pf-span-7' })}
    </div>${goalsHTML()}${appearanceHTML()}</div>`;
    bind(ach);
    bindAppearance();
    playReveal(root);
    playBars(root);
    $$('[data-count]').forEach(el => { el.dataset.value = '0'; const f = el.dataset.fmt; countTo(el, Number(el.dataset.count), { seconds: 0.9, format: n => (f === '%' ? `${Math.round(n)}%` : f === 'd' ? `${Math.round(n)}d` : f.startsWith('/') ? `${Math.round(n)}${f}` : Math.round(n).toLocaleString('pt-BR')) }); });
    animate($('#pf-avatar'), { scale: [0.8, 1], rotate: [-6, 0] }, spring.bouncy);
    $$('.pf-ach-item').forEach((el, i) => animate(el, { opacity: [0, 1], scale: [0.85, 1] }, { ...spring.soft, delay: i * 0.03 }));
    $$('.pf-goal').forEach((el, i) => animate(el, { opacity: [0, 1], y: [10, 0] }, { duration: duration.slow, ease: ease.out, delay: 0.1 + i * 0.07 }));
    $$('.pf-ring-arc').forEach(arc => { if (!reduced()) arc.animate([{ strokeDashoffset: arc.dataset.full }, { strokeDashoffset: arc.dataset.target }], { duration: 900, easing: 'cubic-bezier(0.2,0,0,1)', fill: 'both' }); });
  }

  function field(name, label, value, { optional = false, placeholder = '', error = null } = {}) {
    return `<div class="pf-field"><label for="pf-${name}">${label}${optional ? ' <span>opcional</span>' : ''}</label><input id="pf-${name}" name="${name}" value="${esc(value)}" placeholder="${esc(placeholder)}" ${error ? 'aria-invalid="true" aria-describedby="pf-name-error"' : ''}>${error ? `<p class="pf-error" id="pf-name-error" role="alert">${hi('AlertTriangle')}${esc(error)}</p>` : ''}</div>`;
  }

  function achGrid(ach) {
    const shown = ach.filter(a => (state.filter === 'todas' ? true : state.filter === 'desbloqueadas' ? a.unlocked : !a.unlocked));
    if (!shown.length) return `<p class="pf-empty">${state.filter === 'desbloqueadas' ? 'Nenhuma conquista obtida ainda.' : 'Todas as conquistas já foram obtidas!'}</p>`;
    return shown.map(a => `<button type="button" class="pf-ach-item ${a.unlocked ? 'is-on' : ''}" data-key="${a.id}" data-ach="${a.id}" aria-label="${esc(a.title)}: ${a.unlocked ? 'desbloqueada' : `bloqueada, ${Math.round(a.progress * 100)}% concluída`}">
      ${medalHTML(a, 56)}<p class="pf-ach-title">${esc(a.title)}</p>
      ${a.unlocked ? `<p class="pf-ach-sub">${TIER_LABEL[a.tier]} · ${a.unlockedAt ? new Date(a.unlockedAt).toLocaleDateString('pt-BR') : ''}</p>` : `<div class="pf-ach-prog">${progress(a.progress, 'ink', { thin: true })}<p class="pf-ach-sub">${a.current}/${a.target}</p></div>`}
    </button>`).join('');
  }

  /* Aparência: tema claro, escuro ou automático (preferência salva em gabaritei:tema:v1). */
  function appearanceHTML() {
    const pref = getThemePref();
    return card(`${cardHeader('Aparência', 'O tema vale para todas as páginas e fica salvo neste navegador', tile('Eye', 'sage'))}
      <div class="theme-seg" role="radiogroup" aria-label="Tema" id="pf-theme">${THEME_OPTIONS.map(o => `<button type="button" role="radio" aria-checked="${pref === o.value}" data-theme-pref="${o.value}">${pref === o.value ? '<i class="theme-seg-ind" data-ind="theme"></i>' : ''}<svg aria-hidden="true"><use href="#i-${o.icon}"/></svg><span>${o.label}</span></button>`).join('')}</div>
      <p class="pf-hint" id="pf-theme-hint">${pref === 'auto' ? 'Automático: acompanha o modo claro ou escuro do seu sistema.' : 'Você também pode alternar pelo botão de tema no menu lateral.'}</p>`, { cls: 'pf-theme-card' });
  }
  let offTheme = null;
  function bindAppearance() {
    const paintSeg = pref => {
      const box = root.querySelector('#pf-theme');
      if (!box) return;
      const old = box.querySelector('.theme-seg-ind');
      const from = old?.getBoundingClientRect();
      old?.remove();
      box.querySelectorAll('[data-theme-pref]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.themePref === pref)));
      const target = box.querySelector(`[data-theme-pref="${pref}"]`);
      const ind = document.createElement('i');
      ind.className = 'theme-seg-ind';
      target.prepend(ind);
      // Indicador desliza até a nova opção (layout animation).
      if (from && !reduced()) { const to = ind.getBoundingClientRect(); animate(ind, { x: [from.left - to.left, 0], width: [`${from.width}px`, `${to.width}px`] }, spring.layout); }
      const hint = root.querySelector('#pf-theme-hint');
      if (hint) hint.textContent = pref === 'auto' ? 'Automático: acompanha o modo claro ou escuro do seu sistema.' : 'Você também pode alternar pelo botão de tema no menu lateral.';
    };
    root.querySelectorAll('[data-theme-pref]').forEach(b => b.onclick = () => { if (b.getAttribute('aria-checked') === 'true') return; setThemePref(b.dataset.themePref); });
    offTheme?.();
    offTheme = onThemeChange(pref => paintSeg(pref));
  }

  /* Metas pessoais (GoalsCard.tsx) */
  function goalsHTML() {
    const now = Date.now();
    const rs = records();
    const list = account().goals.filter(g => g.enabled).map(g => E.goalProgress(g, rs, account(), now));
    const R = 40, C = 2 * Math.PI * R;
    return card(`${cardHeader('Metas pessoais', 'Progresso calculado a partir das suas atividades', tile('Target', 'gold'), btn('Editar', { variant: 'ghost', size: 'sm', icon: 'Pencil', extra: { id: 'pf-goals-edit' } }))}
      ${!list.length ? '<p class="pf-empty">Nenhuma meta ativa. Use “Editar” para definir suas metas.</p>' : `<div class="pf-goals">${list.map(p => { const meta = E.GOAL_META[p.goal.kind]; const v = Math.max(0, Math.min(1, p.progress)); return `<div class="pf-goal ${p.done ? 'is-done' : ''}">
        <div class="pf-ring" role="img" aria-label="${esc(meta.title)}: ${meta.format(p.current)} de ${meta.format(p.goal.target)}"><svg width="88" height="88" viewBox="0 0 88 88"><circle cx="44" cy="44" r="${R}" fill="none" stroke="var(--lg-surface-3)" stroke-width="8"/><circle class="pf-ring-arc" cx="44" cy="44" r="${R}" fill="none" stroke="${p.done ? 'var(--lg-sage-strong)' : 'var(--lg-gold)'}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - v)}" data-full="${C}" data-target="${C * (1 - v)}" transform="rotate(-90 44 44)" ${v === 0 ? 'opacity="0"' : ''}/></svg>
          <span>${p.done ? `<i class="pf-goal-check">${hi('CheckCircle2')}</i>` : p.pendingReason ? '—' : meta.format(p.current)}</span></div>
        <p class="pf-goal-title">${esc(meta.title)}</p><p class="pf-goal-sub">${esc(p.pendingReason ?? `${meta.format(p.current)} de ${meta.format(p.goal.target)}`)}</p></div>`; }).join('')}</div>`}`, { cls: 'pf-goals-card' });
  }

  function bind(ach) {
    const form = $('#pf-form');
    const p = account().profile;
    const dirty = () => { const d = new FormData(form); return ['name', 'nickname', 'school', 'city', 'bio'].some(k => (d.get(k) ?? '') !== (p[k] ?? '')); };
    form.addEventListener('input', () => { $('#pf-save').disabled = !dirty(); });
    form.onsubmit = e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(form));
      if (d.name.trim().length < 2) { state.error = 'Informe seu nome (mínimo de 2 letras).'; const old = $('#pf-name').closest('.pf-field'); old.outerHTML = field('name', 'Nome', d.name, { error: state.error }); const err = $('#pf-error, .pf-error'); if (err) animate(err, { opacity: [0, 1], y: [-4, 0] }, { duration: duration.fast }); $('#pf-name').focus(); return; }
      state.error = null;
      Object.assign(account().profile, { name: d.name.trim(), nickname: d.nickname.trim() || d.name.trim().split(/\s+/)[0], school: d.school.trim(), city: d.city.trim(), bio: d.bio.trim() });
      save();
      onProfileChange(account().profile);
      toast('Perfil atualizado. Suas informações foram salvas neste navegador.');
      render();
    };
    $$('[data-seg="ach"]').forEach(b => b.onclick = () => {
      if (state.filter === b.dataset.value) return;
      const grid = $('#pf-ach');
      const before = snapshot(grid, '.pf-ach-item', 'data-key');
      const prevKeys = new Set(before.keys());
      state.filter = b.dataset.value;
      rerender(root, () => {
        root.querySelector('.lg-seg').outerHTML = seg('ach', state.filter, [{ value: 'todas', label: 'Todas' }, { value: 'desbloqueadas', label: 'Obtidas' }, { value: 'bloqueadas', label: 'Bloqueadas' }], { aria: 'Filtrar conquistas', size: 'sm' });
        grid.innerHTML = achGrid(ach);
        bind(ach);
      });
      flipList(grid, before);
      $$('.pf-ach-item').forEach(el => { if (!prevKeys.has(el.dataset.key)) animate(el, { opacity: [0, 1], scale: [0.85, 1] }, spring.soft); });
      playBars(grid);
    });
    $$('[data-ach]').forEach(b => b.onclick = () => openDetail(ach.find(a => a.id === b.dataset.ach)));
    $('#pf-goals-edit').onclick = editGoals;
  }

  function modal(inner, { onClose } = {}) {
    const layer = document.createElement('div');
    layer.className = 'lg-scrim legacy-ui';
    layer.innerHTML = `<div class="lg-modal pf-modal" role="dialog" aria-modal="true">${inner}</div>`;
    document.body.append(layer);
    animate(layer, { opacity: [0, 1] }, { duration: duration.base, ease: ease.out });
    animate(layer.firstElementChild, { opacity: [0, 1], y: [18, 0], scale: [0.97, 1] }, spring.soft);
    const close = () => { animate(layer.firstElementChild, { opacity: [1, 0], y: [0, 10], scale: [1, 0.98] }, { duration: duration.fast, ease: ease.in }); animate(layer, { opacity: [1, 0] }, { duration: duration.fast, ease: ease.in }).then(() => { layer.remove(); onClose?.(); }); };
    layer.addEventListener('mousedown', e => { if (e.target === layer) close(); });
    layer.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); close(); } });
    return { layer, close };
  }

  function openDetail(a) {
    if (!a) return;
    const { layer, close } = modal(`<button type="button" class="lg-icon-btn pf-close" aria-label="Fechar">${hi('X')}</button>
      <div class="pf-detail"><div class="pf-detail-medal">${medalHTML(a, 96, { shine: true })}</div>
      ${badge(a.unlocked ? `Medalha de ${TIER_LABEL[a.tier].toLowerCase()}` : 'Bloqueada', a.unlocked ? 'gold' : 'neutral')}
      <h2>${esc(a.title)}</h2><p class="pf-detail-desc">${esc(a.description)}</p>
      <div class="pf-rule"><p>Regra</p><strong>${esc(a.rule)}</strong>${progress(a.progress, a.unlocked ? 'sage' : 'gold')}<small>${a.unlocked && a.unlockedAt ? `Desbloqueada em ${dateLong(a.unlockedAt)}.` : `Progresso: ${a.current} de ${a.target} (${pct(a.progress)}).`}</small></div></div>`);
    layer.querySelector('.pf-close').onclick = close;
    // Revelação da medalha (medalReveal) e brilho.
    animate(layer.querySelector('.pf-detail-medal'), { opacity: [0, 1], scale: [0.4, 1], rotate: [-24, 0] }, { ...spring.bouncy, delay: 0.1 });
    playBars(layer);
    layer.querySelector('.pf-close').focus();
  }

  function editGoals() {
    const draft = account().goals.map(g => ({ ...g }));
    const rows = () => draft.map((g, i) => { const meta = E.GOAL_META[g.kind]; return `<li>${switchRow(`pf-goal-${i}`, g.enabled, meta.title, meta.description)}${g.enabled ? `<div class="pf-step-row"><span>Meta</span><div class="pf-stepper" role="group" aria-label="${esc(meta.title)}"><button type="button" data-step="${i}" data-d="-1" aria-label="Diminuir ${esc(meta.title)}" ${g.target <= meta.min ? 'disabled' : ''}>−</button><span aria-live="polite"><b>${meta.format(g.target)}</b></span><button type="button" data-step="${i}" data-d="1" aria-label="Aumentar ${esc(meta.title)}" ${g.target >= meta.max ? 'disabled' : ''}>+</button></div></div>` : ''}</li>`; }).join('');
    const { layer, close } = modal(`<div class="pf-goals-modal"><h2>Editar metas</h2><p class="pf-detail-desc">Defina metas realistas. O progresso é recalculado automaticamente com base nas suas atividades.</p><ul class="pf-goal-list" id="pf-goal-list">${rows()}</ul>
      <div class="lg-modal-actions">${btn('Cancelar', { variant: 'ghost', extra: { id: 'pf-goals-cancel' } })}${btn('Salvar metas', { variant: 'accent', extra: { id: 'pf-goals-save' } })}</div></div>`);
    const list = layer.querySelector('#pf-goal-list');
    const bindRows = () => {
      draft.forEach((g, i) => { const sw = layer.querySelector(`#pf-goal-${i}`); if (sw) sw.onclick = () => { g.enabled = !g.enabled; animateSwitch(sw, g.enabled); setTimeout(() => { list.innerHTML = rows(); bindRows(); }, 180); }; });
      layer.querySelectorAll('[data-step]').forEach(b => b.onclick = () => {
        const g = draft[Number(b.dataset.step)]; const meta = E.GOAL_META[g.kind];
        const dir = Number(b.dataset.d);
        g.target = Math.min(meta.max, Math.max(meta.min, +(g.target + dir * meta.step).toFixed(2)));
        const cell = b.parentElement.querySelector('span');
        cell.innerHTML = `<b>${meta.format(g.target)}</b>`;
        animate(cell.firstElementChild, { y: [dir * 12, 0], opacity: [0, 1] }, spring.snappy);
        b.parentElement.querySelector('[data-d="-1"]').disabled = g.target <= meta.min;
        b.parentElement.querySelector('[data-d="1"]').disabled = g.target >= meta.max;
      });
    };
    bindRows();
    layer.querySelector('#pf-goals-cancel').onclick = close;
    layer.querySelector('#pf-goals-save').onclick = () => { account().goals = draft; save(); toast('Metas atualizadas'); close(); render(); };
  }

  return { render };
}
