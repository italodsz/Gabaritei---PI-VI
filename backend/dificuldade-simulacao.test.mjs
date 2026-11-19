// Regressão por simulação (critérios da fase 2): alunos sintéticos respondem pelo próprio 3PL.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { carregarAcervo } from './testdata/acervo.mjs';
import * as T from '../frontend/dificuldade.js';

const cfg = JSON.parse(readFileSync(new URL('./config/dificuldade_v1.json', import.meta.url)));
const acervo = carregarAcervo();
let s = 42; const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32);

function lista(area, notaReal, { listas = 12, tam = 10, desafio = 'ponto', usar = true } = {}) {
  const th = (notaReal - 500) / 100, qs = acervo.questions.filter(q => q.sourceArea === area && q.tri);
  const topicos = [...new Set(qs.map(q => q.topicId))];
  let p = T.perfilInicial(area, cfg); const meta = T.metaDe(desafio, cfg); const vistas = new Set(), ys = [];
  for (let l = 0; l < listas; l++) {
    const topico = topicos[Math.floor(rnd() * topicos.length)];
    const pool = qs.filter(q => q.topicId === topico && !vistas.has(q.id));
    const ids = !usar ? pool.map(q => q.id).sort(() => rnd() - 0.5).slice(0, tam) : T.montarLista(pool.map(q => ({ id: q.id, p: T.chance(p, q.tri, cfg), estado: 'inedita' })), tam, p.pstar ?? T.metaDe(desafio, cfg), cfg, rnd);
    for (const id of ids) {
      const it = acervo.byId.get(id).tri, y = rnd() < T.p3pl(th, it, 1);
      vistas.add(id); ys.push(y); p = T.registrarAcerto(T.atualizar(p, it, y, cfg, { agoraMs: 1, peso: 0.8 }), y, cfg, T.metaDe(desafio, cfg));
    }
  }
  return ys.slice(30).filter(Boolean).length / (ys.length - 30);
}

const media = (f, n = 16) => Array.from({ length: n }, f).reduce((x, y) => x + y, 0) / n;

test('listas de um título: a dificuldade sobe o acerto em relação à ordem sem dificuldade e chega perto da meta na zona viável', () => {
  for (const [area, nota] of [['CH', 600], ['LC', 600], ['MT', 700]]) {
    const com = media(() => lista(area, nota)), sem = media(() => lista(area, nota, { usar: false }));
    assert.ok(com > sem + 0.03, `${area} ${nota}: com ${com.toFixed(2)} x sem ${sem.toFixed(2)}`);
    assert.ok(com > 0.6 && com < 0.85, `${area} ${nota}: ${com.toFixed(2)}`);
  }
});

test('nível leve pede questões mais fáceis que o puxado', () => {
  const leve = media(() => lista('CH', 650, { desafio: 'leve' }));
  const puxado = media(() => lista('CH', 650, { desafio: 'puxado' }));
  assert.ok(leve > puxado + 0.05, `${leve.toFixed(2)} x ${puxado.toFixed(2)}`);
});

test('semelhante: a dificuldade muda pouco a posição escolhida na lista do titulo_area', () => {
  const p = T.perfilInicial('CN', cfg, { nota: 600 });
  const refs = acervo.questions.filter(q => q.sourceArea === 'CN' && acervo.catalogo.recomendacoes[q.id].length >= 20).slice(0, 200);
  let soma = 0, mudou = 0;
  for (const r of refs) {
    const base = acervo.catalogo.recomendacoes[r.id].slice(0, 50);
    const ord = T.ordenarSemelhantes(base, id => { const it = acervo.byId.get(id)?.tri; return it ? T.chance(p, it, cfg) : null; }, 0.75, cfg);
    soma += base.indexOf(ord[0]); mudou += ord[0] !== base[0];
  }
  assert.ok(soma / refs.length < 0.5, `posição média ${(soma / refs.length).toFixed(2)}`);
  assert.ok(mudou > 0 && mudou / refs.length < 0.15, `trocou a 1ª em ${mudou} de ${refs.length}`);
});

test('apoio de eliminar 2 alternativas aumenta a chance real nas questões difíceis', () => {
  const th = -0.2, qs = acervo.questions.filter(q => q.sourceArea === 'MT' && q.tri && T.p3pl(th, q.tri, 1) < 0.45);
  const sem = qs.reduce((a, q) => a + T.p3pl(th, q.tri, 1), 0) / qs.length;
  const com = qs.reduce((a, q) => { const sab = (T.p3pl(th, q.tri, 1) - q.tri.c) / (1 - q.tri.c); return a + sab + (1 - sab) / 3; }, 0) / qs.length;
  assert.ok(com - sem > 0.1, `${sem.toFixed(2)} -> ${com.toFixed(2)}`);
});
