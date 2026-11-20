import test from 'node:test';
import assert from 'node:assert/strict';
import { questionTextHTML, descriptionsHTML } from '../frontend/question-text.js';

test('texto oficial vira tabela legível sem alterar os valores e sem executar HTML de origem', () => {
  const html = questionTextHTML('**Quadro**\n\n| Dia | Valor |\n|:---|---:|\n| Segunda | 1,5 |\n| Terça | 2 |\n\nQual é o total? <img src=x onerror=alert(1)>');
  assert(html.includes('<strong>Quadro</strong>')); assert(html.includes('<table>'));
  assert(html.includes('<td>1,5</td>')); assert(html.includes('<td>2</td>'));
  assert(html.includes('&lt;img')); assert(!html.includes('<img'));
  assert.equal((html.match(/<th scope=/g) || []).length, 2);
  assert.equal(descriptionsHTML([]), '');
  assert(descriptionsHTML(['A < B']).includes('A &lt; B'));
});
