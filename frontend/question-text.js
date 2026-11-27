// Renderização limitada ao texto da prova: todo HTML de origem é escapado.
const escape = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const inline = text => escape(text).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
const cells = line => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
const separator = line => line.includes('|') && cells(line).every(c => /^:?-{3,}:?$/.test(c));

// Marcadores de posição de imagem vindos da base: "[imagem]" (a maioria das fontes) e
// "[[placeholder]]" (fonte Maritaca, ENEM 2022-2024). Nenhum dos dois é conteúdo para o aluno.
const MARCADOR_IMAGEM = /\[\[placeholder\]\]|\[imagem\]/i;
const MARCADOR_IMAGEM_G = /\[\[placeholder\]\]|\[imagem\]/gi;

/** Tira os marcadores de imagem de prévias em texto corrido. */
export const semMarcadorImagem = text => String(text ?? '').replace(MARCADOR_IMAGEM_G, ' ').replace(/\s+/g, ' ').trim();

/** Tira o(s) marcador(es) de uma linha; null quando a linha só tinha marcador (linha some). */
function semMarcadorNaLinha(line) {
  if (!MARCADOR_IMAGEM.test(line)) return line;
  const limpa = line.replace(MARCADOR_IMAGEM_G, ' ').replace(/[ \t]+/g, ' ');
  return limpa.trim() ? limpa : null;
}

export function questionTextHTML(value) {
  // A figura aparece abaixo do texto: linha só com marcador(es) some; no meio de uma linha, só o
  // marcador sai e o resto do texto fica.
  const lines = String(value ?? '').split('\n').map(semMarcadorNaLinha).filter(line => line !== null);
  const output = [];
  let paragraph = [];
  const flush = () => { if (paragraph.length) { output.push(`<p>${paragraph.map(inline).join('<br>')}</p>`); paragraph = []; } };
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('|') && i + 1 < lines.length && separator(lines[i + 1])) {
      flush();
      const header = cells(lines[i]); i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) { rows.push(cells(lines[i])); i++; }
      i--;
      output.push(`<div class="qs-table-wrap"><table><thead><tr>${header.map(c => `<th scope="col">${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
    } else if (!lines[i].trim()) flush();
    else paragraph.push(lines[i]);
  }
  flush();
  return output.join('');
}

export function descriptionsHTML(descriptions = []) {
  return descriptions.map(d => `<div class="qs-source-description"><strong>Descrição fornecida na base</strong>${questionTextHTML(d)}</div>`).join('');
}

export function questionMediaHTML({ images = [], descriptions = [] }) {
  const figures = images.filter(({ src, width, height }) =>
    /^\/media\/[a-f0-9]{64}\.(?:png|jpg|bmp)$/.test(src) && Number.isInteger(width) && width > 0
    && Number.isInteger(height) && height > 0);
  // Com a figura na tela, a descrição da base vira só texto alternativo (leitores de tela);
  // ela só aparece visível quando a imagem não está disponível.
  const plain = d => String(d ?? '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  return figures.map(({ src, width, height }, index) => {
    const fallback = figures.length === 1 ? 'Imagem da questão' : `Imagem ${index + 1} da questão`;
    const desc = plain(figures.length === descriptions.length ? descriptions[index] : figures.length === 1 ? descriptions.join(' ') : '');
    const alt = escape(desc || fallback);
    return `<figure class="qs-figure qs-source-image"><a href="${src}" target="_blank" rel="noopener" aria-label="Abrir ${fallback.toLowerCase()}"><img src="${src}" width="${width}" height="${height}" alt="${alt}" loading="lazy" decoding="async"></a></figure>`;
  }).join('') + (figures.length ? '' : descriptionsHTML(descriptions));
}
