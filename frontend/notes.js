// "Minhas notas": espaço pessoal de anotações (inspirado no app Notas), no estilo
// do Gabaritei. Modelo em blocos: blocos de texto formatado e blocos de atalho
// (referência a uma atividade). Textos e atalhos convivem livremente e podem
// ser reordenados. Arrastar um card para cá NÃO move o card: cria apenas um
// atalho { kind, id } para o item original. Persistência em localStorage.
import { animate, spring, duration, ease, reduced, snapshot, flipList } from './motion-kit.js';

const STORAGE_KEY = 'gabaritei:notas:v1';
const DRAG_THRESHOLD = 6;
const COLORS = [
  { value: '', label: 'Padrão', swatch: '#1b201b' },
  { value: '#3e5ac6', label: 'Azul' },
  { value: '#2c8a45', label: 'Verde' },
  { value: '#be471c', label: 'Terracota' },
  { value: '#b98f22', label: 'Mostarda' },
  { value: '#8a4fc0', label: 'Lilás' },
];
const uid = () => (crypto.randomUUID?.() ?? `n${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sameRef = (a, b) => a && b && a.kind === b.kind && String(a.id ?? '') === String(b.id ?? '');

/** Mantém só a formatação suportada (negrito, itálico, sublinhado, cor, listas). */
export function sanitize(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  const allowed = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'BR', 'DIV', 'P', 'UL', 'OL', 'LI', 'SPAN', 'FONT']);
  const walk = node => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 3) continue;
      if (child.nodeType !== 1 || !allowed.has(child.tagName)) {
        if (child.nodeType === 1) { walk(child); child.replaceWith(...child.childNodes); } else child.remove();
        continue;
      }
      let el = child;
      const color = el.tagName === 'FONT' ? el.getAttribute('color') : el.style?.color;
      // Formatação feita por estilo (colar, styleWithCSS) vira as tags simples suportadas.
      const st = el.style || {};
      const wraps = [];
      if (/^(bold|[6-9]00)$/.test(st.fontWeight || '')) wraps.push('b');
      if (st.fontStyle === 'italic') wraps.push('i');
      if (/underline/.test(st.textDecoration || st.textDecorationLine || '')) wraps.push('u');
      if (el.tagName === 'FONT' || (el.tagName === 'SPAN' && wraps.length)) { const span = document.createElement('span'); span.append(...el.childNodes); el.replaceWith(span); el = span; }
      for (const tag of wraps) { const w = document.createElement(tag); w.append(...el.childNodes); el.append(w); }
      for (const attr of [...el.attributes]) el.removeAttribute(attr.name);
      if (color && el.tagName === 'SPAN' && /^(#[0-9a-f]{3,8}|rgb\([\d\s,.]+\))$/i.test(color.trim())) el.style.color = color.trim();
      walk(el);
      if (el.tagName === 'SPAN' && !el.getAttribute('style')) el.replaceWith(...el.childNodes);
    }
  };
  walk(tpl.content);
  return tpl.innerHTML;
}

export function createNotes({ panel, resolveRef, openRef, toast, hi }) {
  let blocks = load();
  let saveTimer = 0;
  let drag = null;
  let suppressClick = false;
  let lastFocusedText = null;

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (data && Array.isArray(data.blocks)) return data.blocks.filter(b => (b.type === 'text' && typeof b.html === 'string') || (b.type === 'ref' && b.ref && typeof b.ref.kind === 'string'));
    } catch { /* sem armazenamento: começa com o exemplo */ }
    return defaults();
  }
  function defaults() {
    return [
      { id: uid(), type: 'text', html: '<b>Minhas notas</b><div>Escreva lembretes e arraste cards para cá: eles viram atalhos, e o card original continua no lugar.</div>' },
      { id: uid(), type: 'ref', ref: { kind: 'activity', id: 'ecology' } },
      { id: uid(), type: 'text', html: '<span style="color: rgb(62, 90, 198);">Antes do simulado:</span><ul><li>rever cadeias alimentares</li><li>refazer as questões erradas</li></ul>' },
    ];
  }
  const persist = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ blocks, updatedAt: new Date().toISOString() })); } catch { /* mantém em memória */ } flashSaved(); };
  const persistSoon = () => { clearTimeout(saveTimer); saveTimer = setTimeout(persist, 300); };
  function ensureTrailingText() {
    if (!blocks.length || blocks[blocks.length - 1].type !== 'text') blocks.push({ id: uid(), type: 'text', html: '' });
  }

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */
  function render() {
    ensureTrailingText();
    panel.innerHTML = `
      <header class="notes-head">
        <div class="eyebrow">ESPAÇO PARA O QUE IMPORTA</div>
        <h2 id="notes-title">Minhas notas</h2>
        <p>Escreva à vontade e arraste atividades para cá.</p>
      </header>
      <div class="notes-toolbar" role="toolbar" aria-label="Formatação do texto" id="notes-toolbar">
        <button type="button" data-cmd="bold" aria-label="Negrito (Ctrl+B)" title="Negrito"><b>B</b></button>
        <button type="button" data-cmd="italic" aria-label="Itálico (Ctrl+I)" title="Itálico"><i>I</i></button>
        <button type="button" data-cmd="underline" aria-label="Sublinhado (Ctrl+U)" title="Sublinhado"><u>U</u></button>
        <span class="notes-tool-sep"></span>
        <button type="button" data-cmd="insertUnorderedList" aria-label="Lista" title="Lista"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.2"/><circle cx="4.5" cy="12" r="1.2"/><circle cx="4.5" cy="18" r="1.2"/></svg></button>
        <div class="notes-color">
          <button type="button" id="notes-color-btn" aria-label="Cor do texto" aria-haspopup="true" aria-expanded="false" title="Cor do texto"><span class="notes-color-a">A</span><span class="notes-color-bar" id="notes-color-bar"></span></button>
          <div class="notes-palette" id="notes-palette" role="menu" hidden>${COLORS.map(c => `<button type="button" role="menuitem" data-color="${c.value}" aria-label="${c.label}" title="${c.label}" style="--sw:${c.swatch || c.value}"></button>`).join('')}</div>
        </div>
        <span class="notes-tool-sep"></span>
        <button type="button" id="notes-add-text" class="notes-add" aria-label="Novo bloco de texto" title="Novo bloco de texto">${hi('Plus')}<span>Texto</span></button>
      </div>
      <div class="notes-scroll" id="notes-scroll">
        <div class="notes-blocks" id="notes-blocks" aria-label="Blocos das notas">${blocks.map(blockHTML).join('')}<span class="notes-insert" id="notes-insert" aria-hidden="true"></span></div>
        <div class="notes-dropzone" id="notes-dropzone" aria-hidden="true">${hi('NotebookPen')}<span>Solte aqui para criar um atalho</span></div>
      </div>
      <footer class="notes-foot"><span id="notes-saved"><i></i>Salvo neste navegador</span><span>${blocks.filter(b => b.type === 'ref').length} atalhos</span></footer>`;
    bind();
  }

  function blockHTML(b) {
    const grip = `<button type="button" class="nb-grip" data-grip aria-label="Mover bloco (use as setas ↑ ↓)" title="Arraste para reordenar"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="6" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="18" r="1.4"/></svg></button>`;
    if (b.type === 'text') {
      return `<div class="nb nb-text-block" data-key="${b.id}" data-type="text">${grip}<div class="nb-text" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Texto da nota" data-placeholder="Escreva algo…" spellcheck="true">${b.html}</div><button type="button" class="nb-del" data-del aria-label="Excluir este bloco de texto" title="Excluir bloco">${hi('X')}</button></div>`;
    }
    return `<div class="nb nb-ref-block" data-key="${b.id}" data-type="ref">${grip}${miniHTML(b.ref)}<button type="button" class="nb-del" data-del aria-label="Remover atalho das notas (a atividade original não é apagada)" title="Remover atalho">${hi('X')}</button></div>`;
  }
  /** Miniatura compacta do item referenciado (usada no bloco e no fantasma do arrasto). */
  function miniHTML(ref, { ghost = false } = {}) {
    const r = resolveRef(ref);
    if (!r) return `<div class="note-mini is-missing"><span class="note-mini-tile">${hi('AlertTriangle')}</span><span class="note-mini-body"><small>ATALHO</small><strong>Item indisponível</strong><span>A atividade foi excluída ou concluída.</span></span></div>`;
    const tag = ghost ? 'div' : 'button';
    return `<${tag} ${ghost ? '' : 'type="button" data-open-ref'} class="note-mini area-${r.area}" ${ghost ? '' : `aria-label="Abrir ${esc(r.kindLabel)}: ${esc(r.title)}"`}>
      <span class="note-mini-tile">${hi(r.icon)}</span>
      <span class="note-mini-body"><small>${esc(r.kindLabel)}${r.status ? ` · ${esc(r.status)}` : ''}</small><strong>${esc(r.title)}</strong>${r.meta ? `<span>${esc(r.meta)}</span>` : ''}${r.progress !== null && r.progress !== undefined ? `<i class="note-mini-bar"><i style="transform:scaleX(${Math.max(0, Math.min(1, r.progress))})"></i></i>` : ''}</span>
      <span class="note-mini-go">${hi('ArrowUpRight')}</span>
    </${tag}>`;
  }

  /* ---------------------------------------------------------------- */
  /* Edição                                                            */
  /* ---------------------------------------------------------------- */
  function bind() {
    const list = panel.querySelector('#notes-blocks');
    list.addEventListener('input', e => {
      const el = e.target.closest('.nb-text');
      if (!el) return;
      const b = blocks.find(x => x.id === el.closest('.nb').dataset.key);
      if (b) { b.html = sanitize(el.innerHTML); persistSoon(); }
    });
    list.addEventListener('focusin', e => { if (e.target.matches('.nb-text')) { lastFocusedText = e.target; e.target.closest('.nb').classList.add('is-editing'); } });
    list.addEventListener('focusout', e => { if (e.target.matches('.nb-text')) { e.target.closest('.nb').classList.remove('is-editing'); const b = blocks.find(x => x.id === e.target.closest('.nb').dataset.key); if (b) { b.html = sanitize(e.target.innerHTML); persist(); } } });
    list.addEventListener('keydown', onEditorKey);
    list.addEventListener('paste', e => {
      if (!e.target.closest('.nb-text')) return;
      e.preventDefault();
      const html = e.clipboardData.getData('text/html');
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertHTML', false, html ? sanitize(html) : esc(text).replace(/\n/g, '<br>'));
    });
    list.addEventListener('click', e => {
      if (suppressClick) { e.preventDefault(); e.stopPropagation(); return; }
      const open = e.target.closest('[data-open-ref]');
      if (open) { const b = blocks.find(x => x.id === open.closest('.nb').dataset.key); if (b) openRef(b.ref); return; }
      const del = e.target.closest('[data-del]');
      if (del) removeBlock(del.closest('.nb').dataset.key);
    }, true);
    // Clicar no espaço vazio abaixo dos blocos foca o último texto.
    panel.querySelector('#notes-scroll').addEventListener('mousedown', e => {
      if (e.target.id !== 'notes-scroll' && e.target.id !== 'notes-blocks') return;
      e.preventDefault();
      const last = [...panel.querySelectorAll('.nb-text')].pop();
      if (last) placeCaretAtEnd(last);
    });
    // Barra de formatação: mousedown preventDefault mantém a seleção do texto.
    const toolbar = panel.querySelector('#notes-toolbar');
    toolbar.addEventListener('mousedown', e => { if (e.target.closest('button')) e.preventDefault(); });
    toolbar.querySelectorAll('[data-cmd]').forEach(b => b.onclick = () => format(b.dataset.cmd));
    const colorBtn = panel.querySelector('#notes-color-btn');
    const palette = panel.querySelector('#notes-palette');
    colorBtn.onclick = () => togglePalette(palette.hidden);
    palette.querySelectorAll('[data-color]').forEach(b => b.onclick = () => { format('foreColor', b.dataset.color || '#1b201b'); panel.querySelector('#notes-color-bar').style.background = b.dataset.color || ''; togglePalette(false); });
    panel.querySelector('#notes-add-text').onclick = () => insertText(currentIndex() + 1);
    // Reordenar pelos "pegadores".
    list.querySelectorAll('[data-grip]').forEach(g => {
      g.addEventListener('pointerdown', e => startPointer(e, { type: 'move', key: g.closest('.nb').dataset.key, source: g.closest('.nb') }));
      g.addEventListener('keydown', e => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); moveBy(g.closest('.nb').dataset.key, e.key === 'ArrowUp' ? -1 : 1); }
        if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); removeBlock(g.closest('.nb').dataset.key); }
      });
    });
    // Atalhos também podem ser arrastados pelo próprio card.
    list.querySelectorAll('.nb-ref-block .note-mini').forEach(m => m.addEventListener('pointerdown', e => startPointer(e, { type: 'move', key: m.closest('.nb').dataset.key, source: m.closest('.nb') })));
  }
  document.addEventListener('selectionchange', () => updateToolbarState());
  function togglePalette(open) {
    const palette = panel.querySelector('#notes-palette');
    const btnEl = panel.querySelector('#notes-color-btn');
    if (!palette) return;
    btnEl.setAttribute('aria-expanded', String(open));
    if (open) { palette.hidden = false; animate(palette, { opacity: [0, 1], y: [-6, 0], scale: [0.97, 1] }, { duration: duration.fast, ease: ease.out }); }
    else if (!palette.hidden) animate(palette, { opacity: [1, 0], y: [0, -4] }, { duration: duration.micro, ease: ease.in }).then(() => { palette.hidden = true; });
  }
  document.addEventListener('mousedown', e => { if (!e.target.closest?.('.notes-color')) togglePalette(false); });

  function format(cmd, value) {
    const target = document.activeElement?.closest?.('.nb-text') || lastFocusedText;
    if (!target) { toast('Clique em um texto das notas antes de formatar.'); return; }
    if (document.activeElement !== target) target.focus();
    // Cor usa estilo (span com color); negrito, itálico e sublinhado usam <b>, <i>, <u>.
    document.execCommand('styleWithCSS', false, cmd === 'foreColor');
    document.execCommand(cmd, false, value);
    const b = blocks.find(x => x.id === target.closest('.nb').dataset.key);
    if (b) { b.html = sanitize(target.innerHTML); persistSoon(); }
    updateToolbarState();
  }
  function updateToolbarState() {
    if (!panel.isConnected) return;
    const inside = document.activeElement?.closest?.('.nb-text') && panel.contains(document.activeElement);
    panel.querySelectorAll('[data-cmd]').forEach(b => {
      let on = false;
      try { on = inside && document.queryCommandState(b.dataset.cmd); } catch { on = false; }
      b.classList.toggle('is-on', !!on);
      b.setAttribute('aria-pressed', String(!!on));
    });
  }
  function placeCaretAtEnd(el) {
    el.focus();
    const r = document.createRange(); r.selectNodeContents(el); r.collapse(false);
    const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
  }
  function currentIndex() {
    const key = (document.activeElement?.closest?.('.nb') || lastFocusedText?.closest('.nb'))?.dataset.key;
    const i = blocks.findIndex(b => b.id === key);
    return i < 0 ? blocks.length - 1 : i;
  }
  function onEditorKey(e) {
    const el = e.target.closest('.nb-text');
    if (!el) return;
    const key = el.closest('.nb').dataset.key;
    const i = blocks.findIndex(b => b.id === key);
    // Backspace num texto vazio apaga o bloco e volta ao texto anterior.
    if (e.key === 'Backspace' && !el.textContent.trim() && !el.querySelector('li') && blocks.filter(b => b.type === 'text').length > 1) {
      e.preventDefault();
      const prev = [...blocks.slice(0, i)].reverse().find(b => b.type === 'text');
      removeBlock(key, { focusKey: prev?.id });
    }
  }

  /* ---------------------------------------------------------------- */
  /* Estrutura: inserir, mover, remover (com animações de layout)      */
  /* ---------------------------------------------------------------- */
  function mutate(fn, { enterKey = null, focusKey = null, caretEnd = true } = {}) {
    const list = panel.querySelector('#notes-blocks');
    const before = list ? snapshot(list, '.nb', 'data-key') : null;
    const scroll = panel.querySelector('#notes-scroll')?.scrollTop ?? 0;
    fn();
    ensureTrailingText();
    persist();
    render();
    const sc = panel.querySelector('#notes-scroll'); if (sc) sc.scrollTop = scroll;
    const after = panel.querySelector('#notes-blocks');
    if (before) flipList(after, before);
    if (enterKey) {
      const el = after.querySelector(`.nb[data-key="${enterKey}"]`);
      if (el) { animate(el, { opacity: [0, 1], scale: [0.94, 1], y: [8, 0] }, spring.soft); el.classList.add('is-new'); setTimeout(() => el.classList.remove('is-new'), 1400); }
    }
    if (focusKey) { const t = after.querySelector(`.nb[data-key="${focusKey}"] .nb-text`); if (t) caretEnd ? placeCaretAtEnd(t) : t.focus(); }
  }
  function insertText(index) {
    const b = { id: uid(), type: 'text', html: '' };
    mutate(() => blocks.splice(Math.max(0, Math.min(blocks.length, index)), 0, b), { enterKey: b.id, focusKey: b.id });
  }
  function removeBlock(key, { focusKey = null } = {}) {
    const el = panel.querySelector(`.nb[data-key="${key}"]`);
    const b = blocks.find(x => x.id === key);
    if (!b) return;
    // O estado muda na hora; a saída é animada numa cópia visual do bloco,
    // enquanto os demais blocos se reorganizam (FLIP).
    let ghost = null;
    if (el && !reduced()) {
      const r = el.getBoundingClientRect();
      ghost = el.cloneNode(true);
      Object.assign(ghost.style, { position: 'fixed', left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, margin: '0', pointerEvents: 'none', zIndex: '50' });
      document.body.append(ghost);
    }
    mutate(() => { blocks = blocks.filter(x => x.id !== key); }, { focusKey });
    if (ghost) {
      animate(ghost, { opacity: [1, 0], scale: [1, 0.96], x: [0, b.type === 'ref' ? 24 : 0] }, { duration: duration.fast, ease: ease.in });
      setTimeout(() => ghost.remove(), duration.fast * 1000 + 80);
    }
    if (b.type === 'ref') toast('Atalho removido das notas. A atividade original continua no lugar.');
  }
  function moveBy(key, delta) {
    const i = blocks.findIndex(b => b.id === key);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= blocks.length) return;
    mutate(() => { const [b] = blocks.splice(i, 1); blocks.splice(j, 0, b); });
    panel.querySelector(`.nb[data-key="${key}"] [data-grip]`)?.focus();
  }
  /** Cria um atalho; se já existir, destaca o atalho existente. */
  function addRef(ref, { index = null, fromRect = null } = {}) {
    const existing = blocks.find(b => b.type === 'ref' && sameRef(b.ref, ref));
    if (existing) {
      const el = panel.querySelector(`.nb[data-key="${existing.id}"]`);
      if (el) { el.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' }); animate(el, { scale: [1, 1.03, 1] }, { duration: 0.38, ease: ease.out }); el.classList.add('is-new'); setTimeout(() => el.classList.remove('is-new'), 1400); }
      toast('Esse atalho já está nas suas notas.');
      return false;
    }
    const b = { id: uid(), type: 'ref', ref };
    let at = index ?? Math.max(0, blocks.length - (blocks[blocks.length - 1]?.type === 'text' && !blocks[blocks.length - 1].html.trim() ? 1 : 0));
    mutate(() => blocks.splice(at, 0, b), { enterKey: fromRect ? null : b.id });
    const el = panel.querySelector(`.nb[data-key="${b.id}"]`);
    if (el && fromRect && !reduced()) {
      // A miniatura "pousa" no lugar do novo bloco.
      const to = el.getBoundingClientRect();
      animate(el, { x: [fromRect.left - to.left, 0], y: [fromRect.top - to.top, 0], scale: [fromRect.width / to.width, 1], opacity: [0.6, 1] }, spring.soft);
      el.classList.add('is-new'); setTimeout(() => el.classList.remove('is-new'), 1400);
    }
    if (el && isVisible()) el.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' });
    return true;
  }
  let savedTimer = 0;
  function flashSaved() {
    const s = panel.querySelector('#notes-saved');
    if (!s) return;
    s.classList.add('is-flash');
    clearTimeout(savedTimer);
    savedTimer = setTimeout(() => s.classList.remove('is-flash'), 900);
  }

  /* ---------------------------------------------------------------- */
  /* Arrastar e soltar                                                 */
  /* ---------------------------------------------------------------- */
  const isVisible = () => { const r = panel.getBoundingClientRect(); return r.width > 40 && r.height > 40 && getComputedStyle(panel).display !== 'none' && !panel.closest('[hidden]'); };

  /** Pointerdown em uma fonte de arrasto: card da página (type 'ref') ou bloco (type 'move'). */
  function startPointer(e, payload) {
    if (e.button !== 0 || e.pointerType === 'touch') return;
    if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    drag = { ...payload, startX: e.clientX, startY: e.clientY, active: false, pointerId: e.pointerId };
    addEventListener('pointermove', onMove);
    addEventListener('pointerup', onUp, { once: true });
    addEventListener('pointercancel', onCancel, { once: true });
  }
  function beginDrag(e) {
    drag.active = true;
    document.body.classList.add('is-note-dragging');
    getSelection()?.removeAllRanges();
    const src = drag.source;
    const rect = src.getBoundingClientRect();
    drag.offsetX = Math.min(Math.max(e.clientX - rect.left, 20), 220);
    drag.offsetY = Math.min(Math.max(e.clientY - rect.top, 16), 40);
    // Fantasma: miniatura compacta que acompanha o cursor.
    const ghost = document.createElement('div');
    ghost.className = 'note-ghost';
    const ref = drag.type === 'ref' ? drag.ref : blocks.find(b => b.id === drag.key)?.ref;
    if (drag.type === 'move' && !ref) {
      const b = blocks.find(x => x.id === drag.key);
      ghost.innerHTML = `<div class="note-ghost-text">${b?.html || '<i>Texto vazio</i>'}</div>`;
    } else ghost.innerHTML = miniHTML(ref, { ghost: true });
    document.body.append(ghost);
    drag.ghost = ghost;
    drag.x = e.clientX; drag.y = e.clientY; drag.gx = e.clientX; drag.gy = e.clientY; drag.tilt = 0;
    placeGhost();
    animate(ghost.firstElementChild, { scale: [Math.min(1, rect.width / 280), 1.04], opacity: [0.7, 1] }, spring.snappy);
    src.classList.add('is-drag-source');
    if (drag.type === 'ref') animate(src, { scale: [1, 0.97] }, spring.snappy);
    // Alvo: a coluna, se visível; senão, uma doca flutuante.
    drag.useDock = !isVisible();
    if (drag.useDock) showDock(true);
    else { panel.classList.add('is-drop-target'); const dz = panel.querySelector('#notes-dropzone'); if (drag.type === 'ref' && dz) animate(dz, { opacity: [0, 1], scale: [0.96, 1] }, spring.soft); }
    drag.raf = requestAnimationFrame(followLoop);
  }
  function placeGhost() {
    const g = drag.ghost;
    g.style.transform = `translate3d(${drag.gx - drag.offsetX}px, ${drag.gy - drag.offsetY}px, 0) rotate(${drag.tilt}deg)`;
  }
  /** Segue o cursor com leve atraso e inclinação proporcional à velocidade. */
  function followLoop() {
    if (!drag?.active) return;
    const k = reduced() ? 1 : 0.35;
    const dx = drag.x - drag.gx;
    drag.gx += dx * k; drag.gy += (drag.y - drag.gy) * k;
    drag.tilt += ((reduced() ? 0 : Math.max(-8, Math.min(8, dx * 0.25))) - drag.tilt) * 0.2;
    placeGhost();
    drag.raf = requestAnimationFrame(followLoop);
  }
  function onMove(e) {
    if (!drag) return;
    if (!drag.active) {
      if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < DRAG_THRESHOLD) return;
      beginDrag(e);
    }
    e.preventDefault();
    drag.x = e.clientX; drag.y = e.clientY;
    updateTarget();
  }
  function overRect(r) { return drag.x >= r.left && drag.x <= r.right && drag.y >= r.top && drag.y <= r.bottom; }
  function updateTarget() {
    if (drag.useDock) {
      const dock = document.getElementById('notes-dock');
      const over = dock && overRect(dock.getBoundingClientRect());
      if (over !== drag.over) { drag.over = over; dock?.classList.toggle('is-over', over); if (over && dock) animate(dock, { scale: [1, 1.06] }, spring.snappy); else if (dock) animate(dock, { scale: 1 }, spring.snappy); }
      return;
    }
    const over = overRect(panel.getBoundingClientRect());
    panel.classList.toggle('is-drop-over', over);
    drag.over = over;
    const list = panel.querySelector('#notes-blocks');
    const insert = panel.querySelector('#notes-insert');
    if (!over) { insert.classList.remove('is-visible'); drag.index = null; return; }
    // Posição de inserção: entre os blocos, pelo meio vertical de cada um.
    const items = [...list.querySelectorAll('.nb')].filter(el => el.dataset.key !== drag.key);
    // Usa a posição de layout (offsetTop), que não muda com o deslocamento visual dos blocos.
    const base = list.getBoundingClientRect();
    const local = drag.y - base.top;
    let index = items.length;
    for (let i = 0; i < items.length; i++) { if (local < items[i].offsetTop + items[i].offsetHeight / 2) { index = i; break; } }
    const y = index < items.length ? items[index].offsetTop - 5 : (items.length ? items[items.length - 1].offsetTop + items[items.length - 1].offsetHeight + 4 : 8);
    if (index !== drag.index) {
      const prevY = drag.insertY;
      drag.index = index; drag.insertY = y;
      insert.classList.add('is-visible');
      if (prevY === undefined || reduced()) insert.style.translate = `0 ${y}px`;
      else animate(insert, { y: [prevY, y] }, spring.layout);
      // Os blocos abrem espaço suavemente onde o item vai entrar.
      items.forEach((el, i) => el.classList.toggle('is-shifted', i >= index));
    }
    // Rolagem automática perto das bordas da coluna.
    const sc = panel.querySelector('#notes-scroll').getBoundingClientRect();
    if (drag.y < sc.top + 40) panel.querySelector('#notes-scroll').scrollTop -= 8;
    else if (drag.y > sc.bottom - 40) panel.querySelector('#notes-scroll').scrollTop += 8;
  }
  function blockIndexFromVisual(index) {
    // Converte o índice entre os itens visíveis (sem o arrastado) para o índice em `blocks`.
    const others = blocks.filter(b => b.id !== drag.key);
    const target = others[index];
    return target ? blocks.indexOf(target) : blocks.length;
  }
  function onUp(e) {
    removeEventListener('pointermove', onMove);
    removeEventListener('pointercancel', onCancel);
    if (!drag) return;
    if (!drag.active) { drag = null; return; }
    // O clique que encerra o arrasto não deve abrir o card.
    suppressClick = true; setTimeout(() => { suppressClick = false; }, 0);
    addEventListener('click', swallow, { capture: true, once: true });
    setTimeout(() => removeEventListener('click', swallow, { capture: true }), 50);
    const d = drag;
    cancelAnimationFrame(d.raf);
    const ghostRect = d.ghost.firstElementChild.getBoundingClientRect();
    if (d.over && d.type === 'ref') {
      let index = null;
      if (!d.useDock && d.index !== null && d.index !== undefined) index = blockIndexFromVisual(d.index);
      finishVisuals(d);
      d.ghost.remove();
      const added = addRef(d.ref, { index, fromRect: d.useDock ? null : ghostRect });
      if (added) {
        if (d.useDock) { pulseDock(); toast('Atalho salvo em Minhas notas. Veja na página Meus estudos.'); }
        else toast('Atalho criado. O card original continua no lugar.');
      }
      drag = null;
      return;
    }
    if (d.over && d.type === 'move' && d.index !== null && d.index !== undefined) {
      const from = blocks.findIndex(b => b.id === d.key);
      let to = blockIndexFromVisual(d.index);
      finishVisuals(d);
      d.ghost.remove();
      if (from >= 0) mutate(() => { const [b] = blocks.splice(from, 1); if (to > from) to -= 1; blocks.splice(to, 0, b); });
      const el = panel.querySelector(`.nb[data-key="${d.key}"]`);
      if (el && !reduced()) { const to2 = el.getBoundingClientRect(); animate(el, { x: [ghostRect.left - to2.left, 0], y: [ghostRect.top - to2.top, 0] }, spring.soft); }
      drag = null;
      return;
    }
    cancelDrag(d);
  }
  const swallow = e => { e.preventDefault(); e.stopPropagation(); };
  function onCancel() { removeEventListener('pointermove', onMove); if (drag?.active) cancelDrag(drag); drag = null; }
  /** Soltou fora: a miniatura volta para a origem e some. */
  function cancelDrag(d) {
    cancelAnimationFrame(d.raf);
    const src = d.source.getBoundingClientRect();
    const g = d.ghost;
    finishVisuals(d);
    const cur = g.getBoundingClientRect();
    g.style.transform = `translate3d(${cur.left}px, ${cur.top}px, 0)`;
    animate(g, { x: [0, src.left - cur.left], y: [0, src.top - cur.top], opacity: [1, 0], scale: [1, 0.9] }, { duration: duration.base, ease: ease.out }).then(() => g.remove());
    drag = null;
  }
  function finishVisuals(d) {
    document.body.classList.remove('is-note-dragging');
    d.source.classList.remove('is-drag-source');
    if (d.type === 'ref') animate(d.source, { scale: 1 }, spring.snappy);
    panel.classList.remove('is-drop-target', 'is-drop-over');
    panel.querySelector('#notes-insert')?.classList.remove('is-visible');
    panel.querySelectorAll('.nb.is-shifted').forEach(el => el.classList.remove('is-shifted'));
    if (d.useDock) showDock(false);
  }

  /* Doca flutuante: alvo de soltura quando a coluna não está visível. */
  function showDock(show) {
    let dock = document.getElementById('notes-dock');
    if (show) {
      if (!dock) { dock = document.createElement('div'); dock.id = 'notes-dock'; dock.className = 'notes-dock'; dock.innerHTML = `${hi('NotebookPen')}<span><strong>Minhas notas</strong><small>Solte para criar um atalho</small></span>`; document.body.append(dock); }
      animate(dock, { opacity: [0, 1], x: [40, 0] }, spring.soft);
    } else if (dock) {
      const d = dock;
      setTimeout(() => animate(d, { opacity: [1, 0], x: [0, 40] }, { duration: duration.fast, ease: ease.in }).then(() => d.remove()), 350);
    }
  }
  function pulseDock() {
    const dock = document.getElementById('notes-dock');
    if (dock) { dock.classList.add('is-done'); dock.querySelector('small').textContent = 'Atalho salvo!'; animate(dock, { scale: [1.06, 1] }, spring.bouncy); }
  }

  /** Torna arrastáveis os elementos [data-note-ref] de toda a página (cards, histórico, simulados). */
  document.addEventListener('pointerdown', e => {
    const src = e.target.closest?.('[data-note-ref]');
    if (!src || panel.contains(src) || src.closest('.focus-screen')) return;
    let ref;
    try { ref = JSON.parse(src.dataset.noteRef); } catch { return; }
    startPointer(e, { type: 'ref', ref, source: src });
  });
  addEventListener('keydown', e => { if (e.key === 'Escape' && drag?.active) { removeEventListener('pointermove', onMove); cancelDrag(drag); } });

  return {
    render,
    addRef: (ref, el) => {
      const ok = addRef(ref, {});
      if (ok && !isVisible()) {
        toast('Atalho salvo em Minhas notas. Ele aparece na página Meus estudos.');
        if (el && !reduced()) {
          // Pequena "bolha" voando do botão até o canto da tela, como feedback.
          const r = el.getBoundingClientRect();
          const dot = document.createElement('span'); dot.className = 'note-fly'; dot.innerHTML = hi('NotebookPen'); document.body.append(dot);
          dot.style.left = `${r.left + r.width / 2 - 16}px`; dot.style.top = `${r.top + r.height / 2 - 16}px`;
          animate(dot, { x: [0, innerWidth - r.left - 80], y: [0, -r.top + 20], scale: [1, 0.6], opacity: [1, 0] }, { duration: 0.6, ease: ease.emphasized }).then(() => dot.remove());
        }
      }
      return ok;
    },
    hasRef: ref => blocks.some(b => b.type === 'ref' && sameRef(b.ref, ref)),
    isVisible,
    reset: () => { blocks = defaults(); persist(); render(); },
    refresh: () => { if (!panel.contains(document.activeElement)) render(); else panel.querySelectorAll('.nb-ref-block').forEach(el => { const b = blocks.find(x => x.id === el.dataset.key); const mini = el.querySelector('.note-mini'); if (b && mini) mini.outerHTML = miniHTML(b.ref); }); },
  };
}
