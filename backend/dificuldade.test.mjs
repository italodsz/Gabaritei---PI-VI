import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as T from '../frontend/dificuldade.js';

const cfg = JSON.parse(readFileSync(new URL('./config/dificuldade_v1.json', import.meta.url)));
const fx = JSON.parse(readFileSync(new URL('./testdata/microdados_2024_amostra.json', import.meta.url)));

test('reproduz a nota oficial do ENEM 2024 a partir das respostas (microdados)', () => {
  for (const area of T.AREAS) {
    const erros = [];
    for (const prova of fx.provas[area]) {
      for (const caso of prova.casos) {
        let p = T.perfilInicial(area, cfg);
        [...caso.y].forEach((ch, j) => { p = T.atualizar(p, { a: prova.a[j], b: prova.b[j], c: prova.c[j] }, ch === '1', cfg, { agoraMs: 1, peso: 1 }); });
        erros.push(Math.abs(T.notaDeTheta(area, T.momentos(p, cfg).media, cfg) - caso.nota));
      }
    }
    const mae = erros.reduce((a, b) => a + b, 0) / erros.length;
    assert.ok(mae <= (area === 'MT' ? 10 : 8), `${area}: erro médio ${mae.toFixed(1)} pontos`);
  }
});

test('o tempo sem praticar alarga a incerteza sem mudar a média', () => {
  let p = T.perfilInicial('MT', cfg);
  const it = { a: 2, b: 1, c: 0.15 };
  for (let i = 0; i < 20; i++) p = T.atualizar(p, it, i % 3 !== 0, cfg, { agoraMs: 1000 + i });
  const antes = T.momentos(p, cfg), depois = T.momentos(T.alargar(p, p.atualizadoEm + 90 * 864e5, cfg), cfg);
  assert.ok(Math.abs(antes.media - depois.media) < 0.02);
  assert.ok(depois.dp > antes.dp + 0.03, `${antes.dp} -> ${depois.dp}`);
});

test('chance, nota e faixa coerentes', () => {
  const p = T.perfilInicial('LC', cfg, { nota: 650 });
  assert.ok(Math.abs(T.notaDeTheta('LC', T.thetaDeNota('LC', 650, cfg), cfg) - 650) < 0.5);
  assert.ok(T.chance(p, { a: 2, b: -1, c: 0.2 }, cfg) > T.chance(p, { a: 2, b: 3, c: 0.2 }, cfg));
  assert.equal(T.resumoNota(p, cfg).status, 'calibrando');
  assert.equal(T.resumoNota({ ...p, n: 30 }, cfg).status, 'larga');
});

test('triagem recusa parâmetros absurdos', () => {
  assert.equal(T.triar({ a: 1.2, b: 17.6, c: 0.2 }, cfg), null);
  assert.equal(T.triar({ a: 0.1, b: 1, c: 0.2 }, cfg), null);
  assert.deepEqual(T.triar({ a: 1.2, b: 1, c: 0.2 }, cfg), { a: 1.2, b: 1, c: 0.2 });
});

test('controlador: acima da meta fica mais difícil, abaixo mais fácil, dentro dos limites', () => {
  let p = { respostas: [], pstar: null };
  for (let i = 0; i < 40; i++) p = T.registrarAcerto(p, true, cfg, 0.75);
  assert.ok(p.pstar < 0.75 && p.pstar >= 0.65 - 1e-9);
  p = { respostas: [], pstar: null };
  for (let i = 0; i < 40; i++) p = T.registrarAcerto(p, false, cfg, 0.75);
  assert.ok(p.pstar > 0.75 && p.pstar <= 0.85 + 1e-9);
});

test('semelhante: a dificuldade só mexe pouco na ordem do titulo_area', () => {
  const ids = Array.from({ length: 20 }, (_, i) => `q${i}`);
  const ord = T.ordenarSemelhantes(ids, id => (['q5', 'q6', 'q7'].includes(id) ? 0.75 : 0.2), 0.75, cfg);
  assert.equal(ord[0], 'q0');
  assert.ok(ord.indexOf('q5') < 5 && ord.indexOf('q5') >= 1);
  const semChance = T.ordenarSemelhantes(ids, () => null, 0.75, cfg);
  assert.deepEqual(semChance, ids);
});

test('lista: inéditas adequadas, revisão limitada a 20% e aquecimento pela mais acessível', () => {
  const c = [
    ...Array.from({ length: 30 }, (_, i) => ({ id: `n${i}`, p: 0.2 + i * 0.02, estado: 'inedita' })),
    ...Array.from({ length: 10 }, (_, i) => ({ id: `r${i}`, p: 0.5, estado: 'revisao' })),
  ];
  const l = T.montarLista(c, 10, 0.75, cfg, () => 0.5);
  assert.equal(l.length, 10);
  assert.equal(l.filter(id => id.startsWith('r')).length, 2);
  assert.equal(l[0], 'n29');
  assert.ok(l.slice(1).filter(id => id.startsWith('n')).every(id => Number(id.slice(1)) >= 20));
});

test('meta alcançável: sem questões no alvo, prefere as mais acessíveis', () => {
  assert.equal(T.metaAlcancavel(0.75, [0.3, 0.25, 0.4, 0.2], cfg), 0.25);
  assert.equal(T.metaAlcancavel(0.75, [0.9, 0.8, 0.85, 0.6], cfg), 0.75);
});

test('apoio e regras do que conta para θ', () => {
  assert.ok(T.apoioDisponivel(0.3, cfg)); assert.ok(!T.apoioDisponivel(0.6, cfg));
  const e = T.eliminarAlternativas(['A', 'B', 'C', 'D', 'E'], 'C', 'sessao1:q1', cfg);
  assert.equal(e.length, 2); assert.ok(!e.includes('C'));
  assert.deepEqual(e, T.eliminarAlternativas(['A', 'B', 'C', 'D', 'E'], 'C', 'sessao1:q1', cfg));
  const it = { a: 1, b: 0, c: 0.2 };
  assert.equal(T.contaParaTheta({ it, primeira: true, apoio: false, tempoMs: 30000 }, cfg).peso, 0.8);
  assert.equal(T.contaParaTheta({ it, primeira: true, apoio: true }, cfg).motivo, 'com_apoio');
  assert.equal(T.contaParaTheta({ it, primeira: false }, cfg).motivo, 'repeticao');
  assert.equal(T.contaParaTheta({ it, primeira: true, tempoMs: 3000 }, cfg).motivo, 'resposta_muito_rapida');
  assert.equal(T.contaParaTheta({ it: null, primeira: true }, cfg).motivo, 'parametros_fora_da_triagem');
});
