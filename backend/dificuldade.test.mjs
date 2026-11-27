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
  const troca = T.ordenarSemelhantes(ids, id => (id === 'q0' ? 0.05 : 0.75), 0.75, cfg);
  assert.equal(troca[0], 'q1', 'a 2ª pode subir quando a 1ª está muito fora do alvo');
  assert.ok(T.ordenarSemelhantes(ids, id => (['q8', 'q9', 'q10'].includes(id) ? 0.75 : 0.05), 0.75, cfg).indexOf('q8') > 0, 'uma questão distante na lista nunca vira a 1ª');
  const semChance = T.ordenarSemelhantes(ids, () => null, 0.75, cfg);
  assert.deepEqual(semChance, ids);
});

test('detalharSemelhantes: chance, A e escore de cada linha batem com a fórmula, e a ordem bate com ordenarSemelhantes', () => {
  const ids = ['a', 'b', 'c', 'd', 'e'];
  const chances = { a: 0.9, b: 0.6, c: 0.75, d: 0.3, e: null }; // "e" sem TRI do INEP
  const chanceDe = id => chances[id];
  const alvo = 0.75;
  const { linhas, alvoEf, base, peso, restante } = T.detalharSemelhantes(ids, chanceDe, alvo, cfg);

  assert.equal(linhas.length, 5);
  assert.deepEqual(restante, []);
  assert.deepEqual(linhas.map(l => l.id), ids);
  assert.deepEqual(linhas.map(l => l.posicao), [0, 1, 2, 3, 4]);
  assert.equal(base, cfg.semelhante.base);
  assert.equal(peso, cfg.semelhante.peso);

  for (const linha of linhas) {
    assert.equal(linha.chance, chances[linha.id]);
    const R = 1 / Math.log2(linha.posicao + 2);
    const A = Number.isFinite(linha.chance) ? T.adequacao(linha.chance, alvoEf, cfg) : 0.5;
    assert.equal(linha.A, A);
    assert.ok(Math.abs(linha.escore - R * (base + peso * A)) < 1e-12);
  }
  // "e" não tem TRI do INEP: adequação neutra, como o código já faz em outros lugares.
  assert.equal(linhas.find(l => l.id === 'e').A, 0.5);

  const ordem = T.ordenarSemelhantes(ids, chanceDe, alvo, cfg);
  const esperada = [...linhas].sort((x, y) => y.escore - x.escore).map(l => l.id);
  assert.deepEqual(ordem, esperada);
});

test('detalharSemelhantes: meta alcançável menor que a meta quando nenhuma candidata chega perto', () => {
  const ids = ['a', 'b', 'c', 'd', 'e'];
  const chances = { a: 0.3, b: 0.2, c: 0.25, d: 0.1, e: 0.15 };
  const alvo = 0.75;
  const { alvoEf } = T.detalharSemelhantes(ids, id => chances[id], alvo, cfg);
  assert.ok(alvoEf < alvo, `meta alcançável (${alvoEf}) deveria ser menor que a meta (${alvo})`);
  assert.equal(alvoEf, T.metaAlcancavel(alvo, Object.values(chances), cfg));
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

test('regras do que conta para θ', () => {
  const it = { a: 1, b: 0, c: 0.2 };
  assert.equal(T.contaParaTheta({ it, primeira: true, tempoMs: 30000 }, cfg).peso, 0.8);
  assert.equal(T.contaParaTheta({ it, primeira: false }, cfg).motivo, 'repeticao');
  assert.equal(T.contaParaTheta({ it, primeira: true, tempoMs: 3000 }, cfg).motivo, 'resposta_muito_rapida');
  assert.equal(T.contaParaTheta({ it: null, primeira: true }, cfg).motivo, 'parametros_fora_da_triagem');
});

test('aprendizado do sistema: δ corrige a calibração da área e encolhe com poucos dados', () => {
  let s = 7; const rnd = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
  const sig = x => 1 / (1 + Math.exp(-x)), lg = p => Math.log(p / (1 - p));
  // alunos acertam mais do que o previsto: verdade = previsto deslocado +0,4 em logit
  const ev = Array.from({ length: 3000 }, () => { const p = 0.15 + 0.7 * rnd(); return { p, y: rnd() < sig(lg(p) + 0.4) ? 1 : 0 }; });
  const a = T.estimarAjuste(ev, cfg);
  assert.ok(a.ativo && Math.abs(a.delta - 0.4) < 0.1, `δ = ${a.delta}`);
  assert.equal(T.estimarAjuste(ev.slice(0, 10), cfg).ativo, false, 'abaixo do mínimo não ajusta');
  const pouco = T.estimarAjuste(ev.slice(0, 40), cfg).delta;
  assert.ok(Math.abs(pouco) <= cfg.aprendizado_sistema.limite);
  assert.ok(T.ajustarChance(0.5, 0.4) > 0.59 && T.ajustarChance(0.5, 0) === 0.5);
  // calibrado: δ perto de zero
  const ok = Array.from({ length: 3000 }, () => { const p = 0.15 + 0.7 * rnd(); return { p, y: rnd() < p ? 1 : 0 }; });
  assert.ok(Math.abs(T.estimarAjuste(ok, cfg).delta) < 0.1);
});
