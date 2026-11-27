import test from 'node:test';
import assert from 'node:assert/strict';
import { questionTextHTML, descriptionsHTML, semMarcadorImagem } from '../frontend/question-text.js';

test('texto oficial vira tabela legível sem alterar os valores e sem executar HTML de origem', () => {
  const html = questionTextHTML('**Quadro**\n\n| Dia | Valor |\n|:---|---:|\n| Segunda | 1,5 |\n| Terça | 2 |\n\nQual é o total? <img src=x onerror=alert(1)>');
  assert(html.includes('<strong>Quadro</strong>')); assert(html.includes('<table>'));
  assert(html.includes('<td>1,5</td>')); assert(html.includes('<td>2</td>'));
  assert(html.includes('&lt;img')); assert(!html.includes('<img'));
  assert.equal((html.match(/<th scope=/g) || []).length, 2);
  assert.equal(descriptionsHTML([]), '');
  assert(descriptionsHTML(['A < B']).includes('A &lt; B'));
});

test('marcador de imagem sozinho na linha some, tanto "[imagem]" quanto "[[placeholder]]"', () => {
  const html1 = questionTextHTML('Título do mapa\n[imagem]\nTexto depois da figura.');
  assert(!html1.includes('[imagem]'));
  assert(html1.includes('Título do mapa<br>Texto depois da figura.'));

  const html2 = questionTextHTML('Título do mapa\n[[placeholder]]\nTexto depois da figura.');
  assert(!html2.includes('[[placeholder]]'));
  assert(html2.includes('Título do mapa<br>Texto depois da figura.'));
});

test('marcador de imagem no meio de uma linha some e o resto do texto fica', () => {
  const html = questionTextHTML('Observe a imagem [[placeholder]] a seguir e responda.');
  assert(!html.includes('[[placeholder]]'));
  assert(html.includes('Observe a imagem a seguir e responda.'));
});

test('duas ocorrências de marcador na mesma questão (uma por linha) somem as duas', () => {
  const html = questionTextHTML('Primeira figura:\n[[placeholder]]\nSegunda figura:\n[[placeholder]]\nFim.');
  assert(!html.includes('[[placeholder]]'));
  assert(html.includes('Primeira figura:<br>Segunda figura:<br>Fim.'));
});

test('semMarcadorImagem tira os dois marcadores de uma prévia em texto corrido', () => {
  assert.equal(semMarcadorImagem('Observe [imagem] a seguir.'), 'Observe a seguir.');
  assert.equal(semMarcadorImagem('Observe [[placeholder]] a seguir.'), 'Observe a seguir.');
  assert.equal(semMarcadorImagem('[[placeholder]]'), '');
});
