// Renderização limitada ao texto da prova: todo HTML de origem é escapado.
const escape = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const inline = text => escape(text).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
const cells = line => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
const separator = line => line.includes('|') && cells(line).every(c => /^:?-{3,}:?$/.test(c));

export function questionTextHTML(value) {
  const lines = String(value ?? '').split('\n');
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
  return figures.map(({ src, width, height }, index) => {
    const alt = figures.length === 1 ? 'Imagem da questão' : `Imagem ${index + 1} da questão`;
    return `<figure class="qs-figure qs-source-image"><a href="${src}" target="_blank" rel="noopener" aria-label="Abrir ${alt.toLowerCase()}"><img src="${src}" width="${width}" height="${height}" alt="${alt}" loading="lazy" decoding="async"></a></figure>`;
  }).join('') + descriptionsHTML(descriptions);
}
