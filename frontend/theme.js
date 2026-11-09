/**
 * Tema do Gabaritei: claro, escuro ou automático (segue o sistema).
 *
 * O tema efetivo vai em <html data-theme="light|dark">; todas as cores do
 * modo noturno estão centralizadas em theme.css (tokens semânticos + ajustes
 * por componente). Nenhum componente precisa verificar o tema.
 * A primeira aplicação acontece num script inline no <head> (sem flash).
 */
const KEY = 'gabaritei:tema:v1';
const media = matchMedia('(prefers-color-scheme: dark)');
const listeners = new Set();
export const THEME_OPTIONS = [
  { value: 'light', label: 'Claro', icon: 'sun' },
  { value: 'dark', label: 'Escuro', icon: 'moon' },
  { value: 'auto', label: 'Automático', icon: 'monitor' },
];

export function getThemePref() {
  try { const v = localStorage.getItem(KEY); return ['light', 'dark', 'auto'].includes(v) ? v : 'light'; } catch { return 'light'; }
}
export const resolveTheme = pref => (pref === 'auto' ? (media.matches ? 'dark' : 'light') : pref);
export const currentTheme = () => document.documentElement.dataset.theme || 'light';

function paint(theme) {
  const html = document.documentElement;
  html.dataset.theme = theme;
  html.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#141615' : '#dff7fa');
}

/** Troca de tema com transição curta (View Transitions quando houver; senão, CSS). */
function transition(theme) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (theme === currentTheme()) return;
  if (reduce) { paint(theme); return; }
  if (document.startViewTransition) {
    document.documentElement.classList.add('theme-switching');
    const vt = document.startViewTransition(() => paint(theme));
    vt.finished.finally(() => document.documentElement.classList.remove('theme-switching'));
    return;
  }
  const html = document.documentElement;
  html.classList.add('theme-fade');
  paint(theme);
  setTimeout(() => html.classList.remove('theme-fade'), 420);
}

export function setThemePref(pref) {
  try { localStorage.setItem(KEY, pref); } catch { /* só nesta sessão */ }
  transition(resolveTheme(pref));
  listeners.forEach(fn => fn(pref, resolveTheme(pref)));
}
export const onThemeChange = fn => { listeners.add(fn); return () => listeners.delete(fn); };

media.addEventListener('change', () => {
  if (getThemePref() !== 'auto') return;
  transition(resolveTheme('auto'));
  listeners.forEach(fn => fn('auto', resolveTheme('auto')));
});
paint(resolveTheme(getThemePref()));
