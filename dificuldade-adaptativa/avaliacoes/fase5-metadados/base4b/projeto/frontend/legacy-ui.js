// Construtores de HTML dos componentes do front anterior (Card, IconTile, Badge,
// Chip, Button, SegmentedControl, Tabs, Switch, Checkbox, Select, ProgressBar,
// EmptyState, ilustrações) e o comportamento animado deles (indicadores com
// layoutId, Select com listbox, Chip com check que entra, barras por scaleX).
import { animate, spring, duration, ease, captureIndicators, playIndicators, popoverIn, reduced } from './motion-kit.js';

export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const hi = name => `<svg class="hi" aria-hidden="true"><use href="assets/legacy-icons.svg#h-${name}"/></svg>`;
export const SUBJECT_ICON = { portugues: 'PenLine', literatura: 'BookOpen', ingles: 'Languages', espanhol: 'Languages', artes: 'Palette', 'educacao-fisica': 'Target', tecnologias: 'Layers', historia: 'ScrollText', geografia: 'Globe', filosofia: 'Brain', sociologia: 'Users', fisica: 'Atom', quimica: 'FlaskConical', biologia: 'Leaf', matematica: 'Sigma' };
export const pct = v => `${Math.round((v || 0) * 100)}%`;
const attrs = obj => Object.entries(obj || {}).filter(([, v]) => v !== undefined && v !== false && v !== null).map(([k, v]) => (v === true ? k : `${k}="${esc(v)}"`)).join(' ');

export const pageHeader = (eyebrow, title, desc, actions = '') => `<header class="lg-page-header" data-reveal-group><div>${eyebrow ? `<p class="lg-eyebrow" data-reveal>${eyebrow}</p>` : ''}<h1 data-reveal>${title}</h1>${desc ? `<p class="lg-desc" data-reveal>${desc}</p>` : ''}</div>${actions ? `<div class="lg-page-actions" data-reveal>${actions}</div>` : ''}</header>`;
export const tile = (icon, tone = 'neutral', size = 'md', cls = '') => `<span class="lg-tile tone-${tone} ${size === 'md' ? '' : `is-${size}`} ${cls}">${hi(icon)}</span>`;
export const cardHeader = (title, desc, icon = '', action = '') => `<div class="lg-card-header"><div>${icon}<div><h2>${title}</h2>${desc ? `<p>${desc}</p>` : ''}</div></div>${action ? `<div>${action}</div>` : ''}</div>`;
export const card = (inner, { surface = 'default', padded = 'md', cls = '', tag = 'div', extra = {} } = {}) => `<${tag} class="lg-card ${surface !== 'default' ? `surface-${surface}` : ''} ${padded === 'md' ? '' : `is-${padded}`} ${cls}" ${attrs(extra)}>${inner}</${tag}>`;
export const badge = (text, tone = 'neutral', icon = '', size = 'md') => `<span class="lg-badge tone-${tone} ${size === 'sm' ? 'is-sm' : ''}">${icon ? hi(icon) : ''}<span>${text}</span></span>`;
export const chip = (label, selected, extra = {}, { tone = 'gold', icon = '' } = {}) => `<button type="button" role="checkbox" class="lg-chip tone-${tone}" aria-checked="${selected}" data-press="0.95" ${attrs(extra)}>${selected ? `<span class="lg-chip-check">${hi('Check')}</span>` : icon}${label}</button>`;
export function btn(label, { variant = 'primary', size = 'md', icon = '', iconRight = '', full = false, extra = {}, cls = '' } = {}) {
  return `<button type="button" class="lg-btn lg-btn-${variant} ${size !== 'md' ? `lg-btn-${size}` : ''} ${full ? 'lg-btn-full' : ''} ${cls}" data-press ${attrs(extra)}>${icon ? hi(icon) : ''}${label}${iconRight ? hi(iconRight) : ''}</button>`;
}
export const iconBtn = (icon, label, extra = {}, { size = 'md', cls = '' } = {}) => `<button type="button" class="lg-icon-btn ${size === 'sm' ? 'is-sm' : ''} ${cls}" aria-label="${esc(label)}" title="${esc(label)}" data-press="0.92" ${attrs(extra)}>${hi(icon)}</button>`;

/** SegmentedControl com indicador compartilhado (data-indicator = layoutId). */
export function seg(name, value, options, { aria, size = 'md', full = false } = {}) {
  return `<div class="lg-seg ${size === 'sm' ? 'is-sm' : ''} ${full ? 'is-full' : ''}" role="radiogroup" aria-label="${esc(aria)}">${options.map(o => {
    const on = String(o.value) === String(value);
    return `<button type="button" role="radio" aria-checked="${on}" data-seg="${name}" data-value="${esc(o.value)}" data-focus="seg-${name}-${esc(o.value)}" ${o.disabled ? 'disabled' : ''}>${on ? `<span class="lg-seg-ind" data-indicator="seg-${name}"></span>` : ''}<span>${o.icon ? hi(o.icon) : ''}${o.label}</span></button>`;
  }).join('')}</div>`;
}
/** Abas com sublinhado deslizante (data-indicator = layoutId). */
export function tabs(name, value, list) {
  return `<div class="lg-tabs" role="tablist">${list.map(t => {
    const on = t.value === value;
    return `<button type="button" role="tab" id="tab-${name}-${t.value}" aria-selected="${on}" tabindex="${on ? 0 : -1}" data-tab-group="${name}" data-tab="${t.value}" data-focus="tab-${name}-${t.value}">${t.icon ? hi(t.icon) : ''}${t.label}${t.count !== undefined ? `<span class="lg-count">${t.count}</span>` : ''}${on ? `<span class="lg-tab-ind" data-indicator="tabs-${name}"></span>` : ''}</button>`;
  }).join('')}</div>`;
}
export const switchRow = (id, checked, label, desc) => `<div class="lg-switch-row"><div><label for="${id}">${label}</label>${desc ? `<p>${desc}</p>` : ''}</div><button type="button" role="switch" class="lg-switch" id="${id}" aria-checked="${checked}"><span class="lg-knob"></span><span class="sr-only">${checked ? 'Ativado' : 'Desativado'}</span></button></div>`;
export const checkbox = (checked, label, extra = {}) => `<label class="lg-check"><span class="lg-check-box"><input type="checkbox" ${checked ? 'checked' : ''} ${attrs(extra)}><i></i><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5 6.5 12 13 4.5"/></svg></span>${label}</label>`;
/** Select personalizado (combobox + listbox). Comportamento em bindSelects. */
export function select(name, value, options, aria) {
  const sel = options.find(o => String(o.value) === String(value));
  return `<div class="lg-select" data-select="${name}" data-value="${esc(value)}"><button type="button" class="lg-select-btn" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-label="${esc(aria)}" data-focus="select-${name}"><span>${esc(sel?.label ?? 'Selecione')}</span><span class="lg-chev">${hi('ChevronDown')}</span></button><script type="application/json">${JSON.stringify(options).replace(/</g, '\\u003c')}</script></div>`;
}
export const progress = (value, tone = 'gold', { thin = false, label = '', delay = 0 } = {}) => `<div class="lg-progress tone-${tone} ${thin ? 'is-thin' : ''}" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(Math.max(0, Math.min(1, value)) * 100)}"><div data-bar="${Math.max(0, Math.min(1, value))}" data-delay="${delay}"></div></div>`;
export const empty = (illus, title, desc, actions = '') => `<div class="lg-empty" data-empty>${illus ? `<div data-empty-illus>${illus}</div>` : ''}<div><h3>${title}</h3>${desc ? `<p>${desc}</p>` : ''}</div>${actions ? `<div class="lg-empty-actions">${actions}</div>` : ''}</div>`;

/* Ilustrações próprias (brand/Illustrations.tsx). */
const floatAnim = 'class="lg-float"';
export const illus = {
  stack: `<svg class="lg-illus" viewBox="0 0 160 128" aria-hidden="true"><ellipse cx="80" cy="118" rx="54" ry="6" fill="var(--lg-surface-3)"/><g class="lg-float" style="animation-delay:.4s"><rect x="38" y="30" width="84" height="66" rx="14" fill="var(--lg-sage-soft)" stroke="var(--lg-sage)" stroke-width="2" transform="rotate(-8 80 63)"/></g><g ${floatAnim}><rect x="34" y="34" width="92" height="70" rx="14" fill="var(--lg-surface)" stroke="var(--lg-border-strong)" stroke-width="2"/><rect x="48" y="50" width="44" height="7" rx="3.5" fill="var(--lg-surface-3)"/><rect x="48" y="64" width="64" height="6" rx="3" fill="var(--lg-surface-2)"/><rect x="48" y="76" width="54" height="6" rx="3" fill="var(--lg-surface-2)"/><circle cx="110" cy="53" r="8" fill="var(--lg-gold)"/><path d="M106.5 53 L109 55.5 L113.5 50.5" stroke="var(--lg-ink)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`,
  star: `<svg class="lg-illus" viewBox="0 0 160 128" aria-hidden="true"><ellipse cx="80" cy="118" rx="54" ry="6" fill="var(--lg-surface-3)"/><g ${floatAnim}><rect x="40" y="26" width="80" height="80" rx="20" fill="var(--lg-surface)" stroke="var(--lg-border-strong)" stroke-width="2"/><path class="lg-pop" d="M80 44 l8.2 16.6 18.3 2.7 -13.2 12.9 3.1 18.2 -16.4 -8.6 -16.4 8.6 3.1 -18.2 -13.2 -12.9 18.3 -2.7z" fill="var(--lg-gold)"/></g><circle class="lg-float" style="animation-delay:.6s" cx="128" cy="30" r="4" fill="var(--lg-coral)"/><circle class="lg-float" style="animation-delay:1s" cx="30" cy="48" r="3" fill="var(--lg-sage)"/></svg>`,
  flag: `<svg class="lg-illus" viewBox="0 0 160 128" aria-hidden="true"><ellipse cx="80" cy="118" rx="54" ry="6" fill="var(--lg-surface-3)"/><rect x="62" y="24" width="4" height="92" rx="2" fill="var(--lg-ink)"/><path fill="var(--lg-coral)" d="M66 28 C 84 22, 96 36, 116 30 L 116 66 C 96 72, 84 58, 66 64 Z"><animate attributeName="d" dur="3.6s" repeatCount="indefinite" calcMode="spline" keySplines=".42 0 .58 1;.42 0 .58 1" values="M66 28 C 84 22, 96 36, 116 30 L 116 66 C 96 72, 84 58, 66 64 Z;M66 28 C 84 34, 96 24, 116 32 L 116 68 C 96 60, 84 70, 66 64 Z;M66 28 C 84 22, 96 36, 116 30 L 116 66 C 96 72, 84 58, 66 64 Z"/></path></svg>`,
  clock: `<svg class="lg-illus" viewBox="0 0 160 128" aria-hidden="true"><ellipse cx="80" cy="118" rx="54" ry="6" fill="var(--lg-surface-3)"/><g class="lg-float" style="animation-delay:.2s"><rect x="30" y="28" width="66" height="80" rx="12" fill="var(--lg-surface)" stroke="var(--lg-border-strong)" stroke-width="2"/>${[0, 1, 2, 3, 4].map(i => `<circle cx="44" cy="${44 + i * 13}" r="4" fill="${i < 2 ? 'var(--lg-ink)' : 'none'}" stroke="var(--lg-border-strong)" stroke-width="1.5"/><rect x="54" y="${41 + i * 13}" width="${i % 2 ? 26 : 32}" height="6" rx="3" fill="var(--lg-surface-2)"/>`).join('')}</g><g ${floatAnim}><circle cx="108" cy="52" r="26" fill="var(--lg-gold-soft)" stroke="var(--lg-gold)" stroke-width="2.5"/><line class="lg-spin" x1="108" y1="52" x2="108" y2="36" stroke="var(--lg-ink)" stroke-width="3" stroke-linecap="round"/><line x1="108" y1="52" x2="118" y2="58" stroke="var(--lg-ink)" stroke-width="3" stroke-linecap="round"/><circle cx="108" cy="52" r="3" fill="var(--lg-ink)"/></g></svg>`,
};

/* ------------------------------------------------------------------ */
/* Comportamento                                                       */
/* ------------------------------------------------------------------ */

/**
 * Re-render com animações de layout: captura indicadores (layoutId) antes de
 * trocar o HTML e anima depois, como o Motion faz com layoutId compartilhado.
 */
export function rerender(root, renderFn) {
  const before = captureIndicators(root);
  const focused = document.activeElement?.getAttribute?.('data-focus');
  const scrollY = root.closest('.secondary-page') ? null : null;
  renderFn();
  playIndicators(root, before);
  if (focused) root.querySelector(`[data-focus="${CSS.escape(focused)}"]`)?.focus({ preventScroll: true });
  return scrollY;
}

/** Entrada das barras de progresso (scaleX de 0 até o valor). */
export function playBars(root, { from = 0 } = {}) {
  root.querySelectorAll('[data-bar]').forEach(el => {
    const v = Number(el.dataset.bar);
    const prev = el.dataset.prev !== undefined ? Number(el.dataset.prev) : from;
    if (reduced()) { el.style.setProperty('--v', v); return; }
    el.style.setProperty('--v', v);
    animate(el, { scaleX: [prev, v] }, { duration: duration.chart, ease: ease.emphasized, delay: Number(el.dataset.delay || 0) });
  });
}

/** PageHeader + Stagger/Reveal: entrada em cascata. */
export function playReveal(root) {
  root.querySelectorAll('[data-reveal-group]').forEach(g => {
    [...g.querySelectorAll('[data-reveal]')].forEach((el, i) => animate(el, { opacity: [0, 1], y: [16, 0] }, { duration: duration.slow, ease: ease.out, delay: 0.04 + i * 0.06 }));
  });
  root.querySelectorAll('[data-stagger]').forEach(g => {
    const gap = Number(g.dataset.stagger) || 0.06;
    [...g.children].forEach((el, i) => animate(el, { opacity: [0, 1], y: [16, 0] }, { duration: duration.slow, ease: ease.out, delay: 0.04 + i * gap }));
  });
  root.querySelectorAll('[data-empty]').forEach(el => {
    animate(el, { opacity: [0, 1], y: [16, 0] }, { duration: duration.slow, ease: ease.out });
    const ill = el.querySelector('[data-empty-illus]');
    if (ill) animate(ill, { opacity: [0, 1], scale: [0.9, 1] }, { ...spring.soft, delay: 0.08 });
  });
}

/** Chip/Switch: check que entra e bolinha que desliza (spring.snappy). */
export function playToggles(root, changedKey) {
  if (!changedKey) return;
  const el = root.querySelector(`[data-focus="${CSS.escape(changedKey)}"]`);
  if (!el) return;
  const check = el.querySelector('.lg-chip-check');
  if (check) animate(check, { width: [0, 14], opacity: [0, 1], scale: [0.5, 1] }, spring.snappy);
}

/** Select personalizado: abre listbox animado, teclado completo, onChange(name, value). */
export function bindSelects(root, onChange) {
  root.querySelectorAll('.lg-select').forEach(wrap => {
    const btnEl = wrap.querySelector('.lg-select-btn');
    const options = JSON.parse(wrap.querySelector('script').textContent);
    let list = null;
    let active = 0;
    const close = () => {
      if (!list) return;
      const l = list; list = null;
      btnEl.setAttribute('aria-expanded', 'false');
      animate(l, { opacity: [1, 0], y: [0, -4], scale: [1, 0.98] }, { duration: duration.micro, ease: ease.in }).then(() => l.remove());
      document.removeEventListener('mousedown', outside, true);
    };
    const outside = e => { if (!wrap.contains(e.target)) close(); };
    const paintActive = () => list?.querySelectorAll('li').forEach((li, i) => { li.classList.toggle('is-active', i === active); if (i === active) li.scrollIntoView({ block: 'nearest' }); });
    const choose = i => { const o = options[i]; close(); if (o && String(o.value) !== wrap.dataset.value) onChange(wrap.dataset.select, String(o.value)); btnEl.focus(); };
    const openList = () => {
      active = Math.max(0, options.findIndex(o => String(o.value) === wrap.dataset.value));
      list = document.createElement('ul');
      list.className = 'lg-listbox';
      list.setAttribute('role', 'listbox');
      list.innerHTML = options.map((o, i) => `<li role="option" data-index="${i}" aria-selected="${String(o.value) === wrap.dataset.value}"><span>${esc(o.label)}</span>${String(o.value) === wrap.dataset.value ? hi('Check') : ''}</li>`).join('');
      wrap.append(list);
      btnEl.setAttribute('aria-expanded', 'true');
      paintActive();
      popoverIn(list);
      list.addEventListener('mousedown', e => e.preventDefault());
      list.addEventListener('click', e => { const li = e.target.closest('li'); if (li) choose(Number(li.dataset.index)); });
      list.addEventListener('mousemove', e => { const li = e.target.closest('li'); if (li && Number(li.dataset.index) !== active) { active = Number(li.dataset.index); paintActive(); } });
      document.addEventListener('mousedown', outside, true);
    };
    btnEl.addEventListener('click', () => (list ? close() : openList()));
    btnEl.addEventListener('keydown', e => {
      if (!list && ['ArrowDown', 'Enter', ' '].includes(e.key)) { e.preventDefault(); openList(); return; }
      if (!list) return;
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(options.length - 1, active + 1); paintActive(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(0, active - 1); paintActive(); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(active); }
      else if (e.key === 'Tab') close();
    });
  });
}

/** Rotação do chevron (spring.snappy) para botões com aria-expanded. */
export function rotateChevron(el, open) {
  if (!el) return;
  animate(el, { rotate: open ? 180 : 0 }, spring.snappy);
}

/** Switch: anima a bolinha (layout spring.snappy). */
export function animateSwitch(el, on) {
  const knob = el?.querySelector('.lg-knob');
  if (!knob) return;
  el.setAttribute('aria-checked', String(on));
  el.querySelector('.sr-only').textContent = on ? 'Ativado' : 'Desativado';
  animate(knob, { x: on ? [0, 20] : [20, 0] }, spring.snappy);
}

/** Navegação por setas entre abas (tablist). */
export function bindTabKeys(root, group, onChange) {
  const list = root.querySelector(`[data-tab-group="${group}"]`)?.parentElement;
  if (!list) return;
  list.addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    const btns = [...list.querySelectorAll('[role="tab"]')];
    const i = btns.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    const j = e.key === 'Home' ? 0 : e.key === 'End' ? btns.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : btns.length - 1)) % btns.length;
    onChange(btns[j].dataset.tab);
  });
}
