// Linguagem de movimento do Gabaritei, portada de lib/animations/tokens.ts e
// variants.ts do front anterior. Usa a biblioteca Motion (versão para JavaScript
// puro, em assets/vendor/motion.js) para molas reais; sem ela, cai para a Web
// Animations API com curvas equivalentes. Respeita prefers-reduced-motion.

const M = globalThis.Motion;

/** Durações em segundos (tokens.ts). */
export const duration = { instant: 0.1, micro: 0.16, fast: 0.22, base: 0.28, slow: 0.36, page: 0.34, chart: 0.75, celebrate: 0.9 };
/** Intervalos de cascata em segundos. */
export const stagger = { tight: 0.04, base: 0.06, relaxed: 0.09 };
/** Curvas cúbicas. */
export const ease = { out: [0.22, 1, 0.36, 1], emphasized: [0.2, 0, 0, 1], inOut: [0.65, 0, 0.35, 1], in: [0.4, 0, 1, 1] };
export const cssEase = Object.fromEntries(Object.entries(ease).map(([k, v]) => [k, `cubic-bezier(${v.join(',')})`]));
/** Molas nomeadas por intenção. */
export const spring = {
  snappy: { type: 'spring', stiffness: 520, damping: 34, mass: 0.8 },
  layout: { type: 'spring', stiffness: 380, damping: 36, mass: 0.9 },
  soft: { type: 'spring', stiffness: 260, damping: 30 },
  bouncy: { type: 'spring', stiffness: 420, damping: 16 },
  sidebar: { type: 'spring', stiffness: 340, damping: 38, mass: 0.9 },
};

export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Anima um elemento. `keyframes` no formato do Motion ({ opacity: [0, 1], x: [10, 0] }).
 * `transition` aceita { duration, ease, delay } ou uma mola (spring.*).
 *
 * As molas são as do Motion (Motion.spring gera a curva física) convertidas em
 * easing linear() e executadas pela Web Animations API: rodam no compositor,
 * não dependem de requestAnimationFrame e não travam com a aba ocupada.
 * x/y/scale/rotate usam as propriedades individuais translate/scale/rotate,
 * então não apagam transformações estáticas do CSS (ex.: card inclinado).
 */
export function animate(el, keyframes, transition = {}) {
  if (!el || !el.animate) return Promise.resolve();
  if (typeof transition === 'string') transition = spring[transition];
  const frames = toFrames(keyframes);
  const last = frames[frames.length - 1];
  if (reduced()) { commit(el, last); return Promise.resolve(); }
  const { ms, easing } = timing(transition);
  // Interrompível: a animação anterior das mesmas propriedades para onde está,
  // e a nova parte do valor atual (como no Motion).
  const props = new Set(frames.flatMap(f => Object.keys(f)));
  for (const a of el.getAnimations?.() ?? []) {
    if (a.id !== 'kit') continue;
    const kf = a.effect?.getKeyframes?.() ?? [];
    if (!kf.some(f => Object.keys(f).some(k => props.has(k)))) continue;
    try { a.commitStyles(); } catch { /* elemento fora do DOM */ }
    a.cancel();
  }
  const anim = el.animate(frames, { duration: ms, easing, delay: (transition.delay ?? 0) * 1000, fill: 'both' });
  anim.id = 'kit';
  // Prazo de segurança: o fluxo segue mesmo se o navegador pausar a animação
  // (aba em segundo plano, elemento removido do documento).
  let done = false;
  const settle = () => { if (done) return; done = true; commit(el, last); try { anim.cancel(); } catch { /* já cancelada */ } };
  const deadline = new Promise(r => setTimeout(r, ms + (transition.delay ?? 0) * 1000 + 150));
  return Promise.race([anim.finished, deadline]).then(settle).catch(() => {});
}

const springCache = new Map();
function timing(t) {
  if (t.type === 'spring') {
    const key = `${t.stiffness}/${t.damping}/${t.mass ?? 1}`;
    if (!springCache.has(key)) {
      let ms = 450, easing = cssEase.out;
      try {
        const str = String(M.spring({ stiffness: t.stiffness, damping: t.damping, mass: t.mass ?? 1, keyframes: [0, 1] }));
        const m = str.match(/^(\d+(?:\.\d+)?)ms\s+(linear\(.*\))$/s);
        if (m && CSS.supports('animation-timing-function', m[2])) { ms = Number(m[1]); easing = m[2]; }
      } catch { /* Motion indisponível: curva de reserva */ }
      springCache.set(key, { ms, easing });
    }
    return springCache.get(key);
  }
  return { ms: (t.duration ?? 0.3) * 1000, easing: t.ease ? `cubic-bezier(${t.ease.join(',')})` : cssEase.out };
}

const px = v => (typeof v === 'number' ? `${v}px` : v);
const deg = v => (typeof v === 'number' ? `${v}deg` : v);
function toFrames(keyframes) {
  const keys = Object.keys(keyframes);
  const len = Math.max(2, ...keys.map(k => (Array.isArray(keyframes[k]) ? keyframes[k].length : 1)));
  const at = (k, i) => { const arr = Array.isArray(keyframes[k]) ? keyframes[k] : [keyframes[k]]; return arr.length === 1 ? (i === 0 && len > 1 ? undefined : arr[0]) : arr[Math.min(i, arr.length - 1)]; };
  return Array.from({ length: len }, (_, i) => {
    const f = {};
    const x = at('x', i), y = at('y', i);
    if (keys.includes('x') || keys.includes('y')) { if (x !== undefined || y !== undefined) f.translate = `${px(x ?? 0)} ${px(y ?? 0)}`; }
    const sc = at('scale', i), sx = at('scaleX', i), sy = at('scaleY', i);
    if (sc !== undefined) f.scale = String(sc);
    else if (sx !== undefined || sy !== undefined) f.scale = `${sx ?? 1} ${sy ?? 1}`;
    const r = at('rotate', i); if (r !== undefined) f.rotate = deg(r);
    for (const k of keys) {
      if (['x', 'y', 'scale', 'scaleX', 'scaleY', 'rotate'].includes(k)) continue;
      const v = at(k, i);
      if (v === undefined) continue;
      f[k] = typeof v === 'number' && ['width', 'height', 'top', 'left'].includes(k) ? `${v}px` : v;
    }
    return f;
  }).filter(f => Object.keys(f).length);
}
/** Grava o estado final; transformações neutras (0, 1) voltam ao CSS. */
function commit(el, f) {
  if (!f) return;
  for (const [k, v] of Object.entries(f)) {
    const neutral = (k === 'translate' && /^0(px)? 0(px)?$/.test(v)) || (k === 'scale' && /^1( 1)?$/.test(v)) || (k === 'rotate' && /^0(deg)?$/.test(v));
    el.style[k] = neutral ? '' : v;
  }
}

/* ------------------------------------------------------------------ */
/* Variantes (variants.ts)                                             */
/* ------------------------------------------------------------------ */

/** Entrada da área principal ao trocar de página (pageVariants). */
export const pageEnter = el => animate(el, { opacity: [0, 1], y: [14, 0] }, { duration: duration.page, ease: ease.emphasized });
/** fadeUp em cascata (Stagger + Reveal). */
export function revealAll(elements, { gap = stagger.base, delay = 0.04, y = 16 } = {}) {
  return Promise.all([...elements].map((el, i) => animate(el, { opacity: [0, 1], y: [y, 0] }, { duration: duration.slow, ease: ease.out, delay: delay + i * gap })));
}
export const fadeIn = el => animate(el, { opacity: [0, 1] }, { duration: duration.base, ease: ease.out });
export const scaleIn = el => animate(el, { opacity: [0, 1], scale: [0.94, 1] }, spring.soft);
export const modalIn = el => animate(el, { opacity: [0, 1], y: [18, 0], scale: [0.97, 1] }, spring.soft);
export const popoverIn = el => animate(el, { opacity: [0, 1], y: [-6, 0], scale: [0.97, 1] }, { duration: duration.fast, ease: ease.out });
export const shake = el => animate(el, { x: [0, -7, 6, -4, 3, 0] }, { duration: 0.42, ease: ease.out });
export const pop = el => animate(el, { scale: [1, 1.035, 1] }, { duration: 0.38, ease: ease.out });
/** Troca de conteúdo de aba (AnimatePresence mode="wait": entra subindo 10px). */
export const tabContentIn = el => animate(el, { opacity: [0, 1], y: [10, 0] }, { duration: duration.fast });

/* ------------------------------------------------------------------ */
/* Layout (equivalente ao layoutId / layout do Motion)                 */
/* ------------------------------------------------------------------ */

/** Lê a posição de elementos (por chave) antes de um re-render. */
export function snapshot(root, selector, keyAttr) {
  const map = new Map();
  root.querySelectorAll(selector).forEach(el => map.set(el.getAttribute(keyAttr) ?? el.dataset.key ?? '', el.getBoundingClientRect()));
  return map;
}

/**
 * Indicador compartilhado (layoutId): depois de um re-render, anima o indicador
 * a partir da posição anterior. `prev` é o retângulo antigo do indicador.
 */
export function flipFrom(el, prev, transition = spring.layout) {
  if (!el || !prev || reduced()) return;
  const now = el.getBoundingClientRect();
  if (!now.width || !prev.width) return;
  const dx = prev.left - now.left, dy = prev.top - now.top, sx = prev.width / now.width, sy = prev.height / now.height;
  if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) return;
  el.style.transformOrigin = '0 0';
  animate(el, { x: [dx, 0], y: [dy, 0], scaleX: [sx, 1], scaleY: [sy, 1] }, transition);
}

/** Captura o retângulo do indicador ativo de cada grupo (data-indicator="nome"). */
export function captureIndicators(root) {
  const map = new Map();
  root.querySelectorAll('[data-indicator]').forEach(el => map.set(el.dataset.indicator, el.getBoundingClientRect()));
  return map;
}
/** Anima cada indicador a partir do retângulo capturado antes do re-render. */
export function playIndicators(root, before) {
  root.querySelectorAll('[data-indicator]').forEach(el => flipFrom(el, before.get(el.dataset.indicator)));
}

/** Reorganização animada (motion layout): FLIP de uma lista de elementos com data-key. */
export function flipList(container, before, transition = spring.layout) {
  if (reduced() || !before) return;
  container.querySelectorAll('[data-key]').forEach(el => {
    const prev = before.get(el.dataset.key);
    if (!prev) return;
    const now = el.getBoundingClientRect();
    const dx = prev.left - now.left, dy = prev.top - now.top;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
    animate(el, { x: [dx, 0], y: [dy, 0] }, transition);
  });
}

/** Collapse: anima a altura de 0 até auto (ou o contrário). */
export function collapse(el, open) {
  if (!el) return Promise.resolve();
  if (reduced()) { el.style.height = open ? '' : '0px'; el.style.opacity = open ? '' : '0'; return Promise.resolve(); }
  const full = el.scrollHeight;
  el.style.overflow = 'hidden';
  const p = Promise.all([
    animate(el, { height: open ? [0, full] : [el.offsetHeight, 0] }, spring.soft),
    animate(el, { opacity: open ? [0, 1] : [1, 0] }, { duration: 0.2 }),
  ]);
  return p.then(() => { if (open) { el.style.height = ''; el.style.overflow = ''; } });
}

/** Número animado (AnimatedNumber). */
export function countTo(el, to, { from, seconds = 0.4, format = n => Math.round(n).toLocaleString('pt-BR') } = {}) {
  if (!el) return;
  const start = from ?? Number(el.dataset.value ?? 0);
  el.dataset.value = String(to);
  if (reduced() || start === to) { el.textContent = format(to); return; }
  const t0 = performance.now();
  const [a, b, c, d] = ease.emphasized;
  const bez = t => { // aproximação da cúbica emphasized
    let x = t; for (let i = 0; i < 5; i++) { const cx = 3 * a * x * (1 - x) ** 2 + 3 * c * x ** 2 * (1 - x) + x ** 3 - t; const dx = 3 * a * (1 - x) ** 2 + 6 * (c - a) * x * (1 - x) + 3 * (1 - c) * x ** 2; if (Math.abs(dx) < 1e-6) break; x -= cx / dx; }
    return 3 * b * x * (1 - x) ** 2 + 3 * d * x ** 2 * (1 - x) + x ** 3;
  };
  const step = now => { const t = Math.min(1, (now - t0) / (seconds * 1000)); el.textContent = format(start + (to - start) * bez(t)); if (t < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

/**
 * Hover/press padrão (whileHover y:-1 / whileTap scale:.97) para botões
 * marcados com data-press. Delegado no documento, uma única vez.
 */
let pressBound = false;
export function bindPress() {
  if (pressBound) return; pressBound = true;
  const scaleOf = el => Number(el.dataset.press) || 0.97;
  document.addEventListener('pointerdown', e => { const el = e.target.closest?.('[data-press]'); if (!el || el.disabled || reduced()) return; animate(el, { scale: scaleOf(el) }, spring.snappy); }, true);
  const release = e => { const el = e.target.closest?.('[data-press]'); if (!el || reduced()) return; animate(el, { scale: 1 }, spring.snappy); };
  document.addEventListener('pointerup', release, true);
  document.addEventListener('pointercancel', release, true);
  document.addEventListener('pointerout', e => { const el = e.target.closest?.('[data-press]'); if (el && !el.contains(e.relatedTarget)) animate(el, { scale: 1 }, spring.snappy); }, true);
}
