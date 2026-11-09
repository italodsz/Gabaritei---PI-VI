// Menu lateral retrátil (Sidebar.tsx do front anterior, em JavaScript puro).
// Novo comportamento: abre sozinho quando o cursor se aproxima e fecha ao sair,
// com tolerância (intenção de hover) para não abrir/fechar sem querer.
// Teclado: o foco dentro do menu também o expande; Esc recolhe.
import { animate, spring, reduced } from './motion-kit.js';

const COLLAPSED = 84;
const EXPANDED = 256;
const OPEN_DELAY = 90;   // ms com o cursor parado sobre o menu antes de abrir
const CLOSE_DELAY = 260; // ms depois que o cursor sai, antes de recolher

export function createSidebar({ onNavigate, getResume, icons }) {
  const nav = document.getElementById('side-nav');
  const surface = document.getElementById('side-surface');
  const indicator = document.getElementById('side-active');
  const bottom = document.getElementById('side-bottom');
  const mobile = () => matchMedia('(max-width: 760px)').matches;
  let open = false;
  let openTimer = 0;
  let closeTimer = 0;
  let active = null;
  let indicatorY = null;

  function setOpen(next) {
    clearTimeout(openTimer); clearTimeout(closeTimer);
    if (next === open || mobile()) return;
    open = next;
    nav.classList.toggle('is-open', open);
    nav.setAttribute('data-state', open ? 'open' : 'closed');
    if (reduced()) { surface.style.width = `${open ? EXPANDED : COLLAPSED}px`; return; }
    animate(surface, { width: open ? EXPANDED : COLLAPSED }, spring.sidebar);
  }

  // Intenção de hover: abrir exige uma pequena pausa; sair tem tolerância.
  nav.addEventListener('pointerenter', e => {
    if (e.pointerType === 'touch') return;
    clearTimeout(closeTimer);
    openTimer = setTimeout(() => setOpen(true), OPEN_DELAY);
  });
  nav.addEventListener('pointerleave', e => {
    if (e.pointerType === 'touch') return;
    clearTimeout(openTimer);
    if (nav.contains(document.activeElement) && document.activeElement.matches(':focus-visible')) return;
    closeTimer = setTimeout(() => setOpen(false), CLOSE_DELAY);
  });
  // Teclado: foco visível dentro do menu expande; sair do menu recolhe.
  nav.addEventListener('focusin', e => { if (e.target.matches(':focus-visible')) setOpen(true); });
  nav.addEventListener('focusout', e => { if (!nav.contains(e.relatedTarget) && !nav.matches(':hover')) closeTimer = setTimeout(() => setOpen(false), 120); });
  nav.addEventListener('keydown', e => {
    if (e.key === 'Escape') { setOpen(false); document.activeElement?.blur(); }
    if (['ArrowDown', 'ArrowUp'].includes(e.key) && e.target.matches('.side-item')) {
      e.preventDefault();
      const items = [...nav.querySelectorAll('.side-item')];
      const i = items.indexOf(e.target);
      items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus();
    }
  });
  nav.querySelectorAll('.side-item, .side-brand').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    onNavigate(a.dataset.page || 'plano');
    if (!a.matches(':focus-visible')) { setOpen(false); a.blur(); }
  }));

  /** Indicador ativo compartilhado (layoutId="sidebar-active"): desliza até o item. */
  function setActive(page) {
    const items = [...nav.querySelectorAll('.side-item')];
    items.forEach(a => {
      const on = a.dataset.page === page;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    const target = items.find(a => a.dataset.page === page);
    if (!target) { indicator.style.opacity = '0'; return; }
    const y = target.offsetTop;
    indicator.style.height = `${target.offsetHeight}px`;
    if (indicatorY === null || reduced()) {
      indicator.style.translate = `0 ${y}px`;
      indicator.style.opacity = '1';
    } else if (y !== indicatorY) {
      indicator.style.opacity = '1';
      animate(indicator, { y: [indicatorY, y] }, spring.layout);
    }
    indicatorY = y;
    active = page;
  }

  /** O rodapé do menu agora guarda as guias rápidas e o perfil (no HTML); nada a desenhar. */
  function renderBottom() {}

  addEventListener('resize', () => { if (active) { indicatorY = null; setActive(active); } if (mobile()) { open = false; nav.classList.remove('is-open'); surface.style.width = ''; } });
  return { setActive, renderBottom, close: () => setOpen(false) };
}
