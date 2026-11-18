// Módulos do front-end sem DOM: lista livre (lotes) e leitura do card "O que o recomendador aprendeu".
import test from 'node:test';
import assert from 'node:assert/strict';
import * as Livre from '../frontend/lista-livre.js';
import { leitura, linhas } from '../frontend/aprendizado-ui.js';

// Acervo falso: 2 matérias, 60 questões cada; pickQuestions devolve na ordem recebida.
const qs = ['mat', 'fis'].flatMap(s => Array.from({ length: 60 }, (_, i) => ({ id: `${s}${i}`, subjectId: s, topicId: `${s}-t${i % 3}`, year: 2010 + (i % 5) })));
const E = {
  SUBJECTS: [{ id: 'mat', topics: [0, 1, 2].map(k => ({ id: `mat-t${k}` })) }, { id: 'fis', topics: [0, 1, 2].map(k => ({ id: `fis-t${k}` })) }],
  get SUBJECT_BY_ID() { return Object.fromEntries(this.SUBJECTS.map(s => [s.id, s])); },
  questionRepository: { query: f => qs.filter(q => (!f.subjectId || q.subjectId === f.subjectId) && (!f.topicIds?.length || f.topicIds.includes(q.topicId)) && (!f.years?.length || f.years.includes(q.year))) },
  createRng: () => Math.random,
  pickQuestions: (pool, n) => pool.slice(0, n),
};

test('lista livre: o filtro é o mesmo da tela Montar lista', () => {
  assert.equal(Livre.poolLivre(E, {}).length, 120);
  assert.equal(Livre.poolLivre(E, { subjectIds: ['mat'] }).length, 60);
  assert.equal(Livre.poolLivre(E, { subjectIds: ['mat'], topicIds: ['mat-t1'], years: [2011] }).length, 4);
});

test('lista livre: lotes de 20, sem repetir, inéditas primeiro e fim quando o filtro acaba', () => {
  const pool = Livre.poolLivre(E, { subjectIds: ['mat'] });
  const primeiro = Livre.primeiroLote(E, pool, [], null);
  assert.equal(primeiro.length, Livre.LOTE);
  let s = { livre: { subjectIds: ['mat'] }, questionIds: primeiro };
  assert.equal(Livre.restantes(E, s).length, 40);
  const records = [{ questionId: 'mat20' }, { questionId: 'mat21' }];
  const segundo = Livre.proximoLote(E, s, records, null);
  assert.equal(segundo.length, 20);
  assert.ok(segundo.every(id => !primeiro.includes(id)));
  assert.ok(!segundo.includes('mat20') && !segundo.includes('mat21'), 'as já respondidas ficam para depois');
  s = { ...s, questionIds: [...primeiro, ...segundo] };
  for (let lote; (lote = Livre.proximoLote(E, s, records, null)).length;) s = { ...s, questionIds: [...s.questionIds, ...lote] };
  assert.equal(s.questionIds.length, 60, 'as já respondidas entram por último');
  assert.equal(new Set(s.questionIds).size, 60);
  assert.deepEqual(Livre.proximoLote(E, s, records, null), []);
});

test('card de aprendizado: explica o que a resposta mudou', () => {
  const foto = (theta, nota, n) => ({ theta, dp: 0.5, nota, faixa: null, status: 'calibrando', n, pstar: 0.75 });
  const base = { conta: true, chanceAntes: 0.25, chanceDepois: 0.4, antes: foto(0, 500, 3), depois: foto(0.4, 540, 4), delta: 0 };
  assert.match(leitura({ ...base, acertou: true }), /difícil/);
  assert.match(leitura({ ...base, acertou: false, chanceAntes: 0.85 }), /tranquila/);
  assert.match(leitura({ ...base, conta: false, motivo: 'com_apoio' }), /apoio/);
  const l = linhas({ ...base, acertou: true });
  assert.equal(l[0].valor, '0,00 → 0,40');
  assert.ok(l.some(x => x.rotulo.startsWith('Nota TRI') && x.valor === '500 → 540'));
});
