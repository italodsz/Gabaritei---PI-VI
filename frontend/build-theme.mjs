// Gera theme-dark.css: a versão noturna de todas as cores fixas dos CSS do app.
//
// Os CSS do Gabaritei foram escritos com cores literais (sem tokens). Em vez de
// espalhar verificações de tema, este script lê cada regra com propriedades de
// cor e emite a mesma regra sob html[data-theme="dark"], com a cor convertida
// pela paleta noturna (grafite, superfícies diferenciadas, dourado e sálvia).
// Regras com cores via var() também são repetidas, para manter a mesma ordem de
// especificidade entre os estados (hover, selecionado…). Ajustes finos e tokens
// semânticos ficam em theme.css, carregado depois.
//
// Uso: npm run build:theme
import { readFileSync, writeFileSync } from 'node:fs';

const FILES = ['styles.css', 'areas.css', 'learning-pages.css', 'sidebar.css', 'practice-screen.css', 'question-screen.css', 'history-page.css', 'cards.css', 'legacy-ui.css', 'shell.css', 'notes.css', 'simulados.css', 'config-studio.css', 'result-page.css', 'profile-page.css'];
// Componentes que já são escuros por design (menu lateral, card de recomendações, resumos).
const KEEP = [/\.side-/, /\.side-nav/, /--nav-/, /\.ph-main/, /\.ph-start/, /\.ph-chip/, /\.ph-queue/, /\.ph-kicker/, /\.ph-dot/, /\.ph-next/, /\.sim-summary/, /\.sim-start/, /\.sim-mix/, /\.sim-fine/, /\.dock-button/, /\.quick-dots/, /\.dock-divider/, /\.topbar/, /\.presentation-label/];
const PREFIX = 'html[data-theme="dark"]';
// Tokens do menu lateral (já escuro por design) não mudam.
const KEEP_PROPS = /^--nav-/;
const COLOR_PROPS = /^(color|background|background-color|background-image|border|border-(top|right|bottom|left)(-color)?|border-color|outline|outline-color|box-shadow|text-shadow|fill|stroke|caret-color|text-decoration-color|accent-color|column-rule-color|--[\w-]+)$/;

/* ------------------------------ cores ------------------------------ */
const NAMED = { white: [255, 255, 255, 1], black: [0, 0, 0, 1] };
function parseColor(str) {
  str = str.trim().toLowerCase();
  if (NAMED[str]) return [...NAMED[str]];
  let m = str.match(/^#([0-9a-f]{3,8})$/);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map(c => c + c).join('');
    const n = i => parseInt(h.slice(i, i + 2), 16);
    return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
  }
  m = str.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[,/]\s*([\d.]+%?))?\s*\)$/);
  if (m) { const a = m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]); return [+m[1], +m[2], +m[3], a]; }
  return null;
}
function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min, s = l > .5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
const fmt = (h, s, l, a) => `hsl(${Math.round(h)} ${Math.round(Math.max(0, Math.min(1, s)) * 100)}% ${Math.round(Math.max(0, Math.min(1, l)) * 1000) / 10}%${a < 1 ? ` / ${Math.round(a * 1000) / 1000}` : ''})`;

/** Converte uma cor conforme o papel dela (fundo, texto, borda, sombra, destaque). */
function darkColor(rgba, role) {
  const [h, s0, l] = rgbToHsl(rgba);
  const a = rgba[3];
  const s = s0;
  if (role === 'shadow') return l > 0.7 && a < 1 ? fmt(h, s * .4, 1, a * .25) : fmt(h, s * .3, .02, Math.min(.7, a * 1.8 + .05));
  if (role === 'fg') {
    if (l >= 0.62) return fmt(h, s, l, a);                              // texto claro (ex.: branco em botão) continua
    if (s > 0.45 && l > 0.28) return fmt(h, Math.min(s, .75), Math.max(l + .22, .68), a); // destaque colorido: mais claro
    return fmt(h, Math.min(s, .45) * .85, .93 - l * .5, a);             // texto escuro vira claro
  }
  if (role === 'border') {
    if (a < 1 && l > 0.8) return fmt(h, s * .3, 1, Math.min(.16, a * .2 + .04));
    if (s > 0.45 && l > 0.3 && l < 0.7) return fmt(h, Math.min(s, .7), Math.max(l, .5), a);
    if (l >= 0.55) return fmt(h, s * .3, .17 + (1 - l) * .9, a);
    return fmt(h, s * .4, .45 + l * .4, a);
  }
  // fundo
  if (a < 1) {
    if (l > 0.8) return fmt(h, s * .4, 1, Math.min(.18, a * .14 + .035));    // véu branco → véu claro discreto
    if (l < 0.2) return fmt(h, s, l, a);                                       // véu escuro continua
    return fmt(h, Math.min(s, .7), Math.min(.62, l + .08), Math.min(1, a * 1.4)); // tinta colorida
  }
  if (s > 0.42 && l >= 0.3 && l <= 0.66) return fmt(h, Math.min(s, .75), l * .96, a); // destaque sólido (botões, barras)
  if (l >= 0.55) {
    // superfícies claras → grafite; pastéis viram tons escuros da mesma cor
    const sat = s > .25 ? Math.min(.42, s * .5) : s * .35;
    const lum = s > .25 ? .2 + (1 - l) * .35 : .118 + (1 - l) * .85;
    return fmt(h, sat, Math.min(lum, .3), a);
  }
  if (l < 0.25) return fmt(h, s * .6, .155 + l * .35, a);                       // fundos já escuros: sobem um degrau
  return fmt(h, s * .6, Math.max(.22, l * .7), a);
}
function roleFor(prop, selector) {
  if (prop.startsWith('--')) {
    if (/shadow/.test(prop)) return 'shadow';
    if (/(ink|fg|text|strong|muted|subtle|on-|accent-fg)/.test(prop)) return 'fg';
    if (/(border|line)/.test(prop)) return 'border';
    return 'bg';
  }
  if (/shadow/.test(prop)) return 'shadow';
  if (/^(color|caret-color|text-decoration-color)$/.test(prop)) return 'fg';
  if (/^(fill)$/.test(prop)) return /text|tick|label|axis/.test(selector) ? 'fg' : 'bg';
  if (/^(stroke)$/.test(prop)) return 'border';
  if (/border|outline|column-rule/.test(prop)) return 'border';
  return 'bg';
}
const COLOR_RE = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|\b(?:white|black)\b/g;
const HAS_COLOR = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|\b(?:white|black)\b/;
function convertValue(value, prop, selector) {
  const role = roleFor(prop, selector);
  return value.replace(COLOR_RE, m => { const c = parseColor(m); return c ? darkColor(c, role) : m; });
}

/* ------------------------------ parser ------------------------------ */
function stripComments(css) { return css.replace(/\/\*[\s\S]*?\*\//g, ''); }
/** Divide um bloco CSS em itens { prelude, body } respeitando chaves aninhadas. */
function blocks(css) {
  const out = [];
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open < 0) break;
    const prelude = css.slice(i, open).trim();
    let depth = 1, j = open + 1;
    while (j < css.length && depth) { if (css[j] === '{') depth++; else if (css[j] === '}') depth--; j++; }
    out.push({ prelude, body: css.slice(open + 1, j - 1) });
    i = j;
  }
  return out;
}
function splitDecls(body) {
  const out = []; let depth = 0, cur = '';
  for (const ch of body) {
    if (ch === '(') depth++; else if (ch === ')') depth--;
    if (ch === ';' && !depth) { out.push(cur); cur = ''; } else cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out.map(d => { const k = d.indexOf(':'); return k < 0 ? null : { prop: d.slice(0, k).trim().toLowerCase(), value: d.slice(k + 1).trim() }; }).filter(Boolean);
}
function splitSelectors(sel) {
  const out = []; let depth = 0, cur = '';
  for (const ch of sel) { if (ch === '(') depth++; else if (ch === ')') depth--; if (ch === ',' && !depth) { out.push(cur.trim()); cur = ''; } else cur += ch; }
  if (cur.trim()) out.push(cur.trim());
  return out;
}
function prefixSelector(sel) {
  if (/^:root\b/.test(sel)) return sel.replace(/^:root/, PREFIX);
  if (/^html\b/.test(sel)) return sel.replace(/^html/, PREFIX);
  return `${PREFIX} ${sel}`;
}
function convertRules(css, file) {
  let out = '';
  for (const { prelude, body } of blocks(css)) {
    if (/^@(keyframes|-webkit-keyframes|property|font-face|import)/.test(prelude)) continue;
    if (/^@(media|supports|container|layer)/.test(prelude)) { const inner = convertRules(body, file); if (inner.trim()) out += `${prelude} {\n${inner}}\n`; continue; }
    if (prelude.startsWith('@')) continue;
    const selectors = splitSelectors(prelude).filter(sel => !KEEP.some(re => re.test(sel)));
    if (!selectors.length) continue;
    const decls = splitDecls(body).filter(d => COLOR_PROPS.test(d.prop) && (HAS_COLOR.test(d.value) || /var\(/.test(d.value) || /color-mix|gradient/.test(d.value)));
    const kept = decls.filter(d => !(d.prop.startsWith('--') && !HAS_COLOR.test(d.value)) && !KEEP_PROPS.test(d.prop));
    if (!kept.length) continue;
    const sel = selectors.map(prefixSelector).join(',\n');
    out += `${sel} { ${kept.map(d => `${d.prop}: ${convertValue(d.value, d.prop, prelude)}`).join('; ')}; }\n`;
  }
  return out;
}

let result = `/* GERADO por build-theme.mjs — não edite à mão. Ajustes em theme.css. */\n`;
for (const f of FILES) {
  const css = stripComments(readFileSync(new URL(f, import.meta.url), 'utf8'));
  const rules = convertRules(css, f);
  if (rules.trim()) result += `\n/* ${f} */\n${rules}`;
}
writeFileSync(new URL('theme-dark.css', import.meta.url), result);
console.log(`theme-dark.css: ${result.split('\n').length} linhas`);
