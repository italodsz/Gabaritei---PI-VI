import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../frontend/dificuldade.js';

const cfg = JSON.parse(readFileSync(new URL('./config/dificuldade_v1.json', import.meta.url)));
const casos = JSON.parse(readFileSync(new URL('./testdata/tri_paridade.json', import.meta.url)));

export function executar() {
  const { agoraMs, dias, item, respostas, candidatos } = casos;
  const areas = T.AREAS.map(area => {
    let perfil = T.perfilInicial(area, cfg, { nota: 600 });
    for (const [i, acerto] of respostas.entries()) {
      perfil = T.atualizar(perfil, item, acerto, cfg, { agoraMs: agoraMs + i, peso: 0.8 });
      perfil = T.registrarAcerto(perfil, acerto, cfg, 0.75);
    }
    const deriva = T.alargar(perfil, agoraMs + dias * 86400000, cfg);
    return { perfil, deriva, chance: T.chance(deriva, item, cfg),
      momentos: T.momentos(deriva, cfg), resumo: T.resumoNota(deriva, cfg),
      informacao: T.informacao(deriva, item, cfg) };
  });
  const ids = candidatos.map(c => c.id);
  const chanceDe = id => candidatos.find(c => c.id === id).p;
  const eventos = Array.from({length: 40}, (_, i) => ({p: 0.5, y: Number(i < 30)}));
  return { areas, ajuste: T.estimarAjuste(eventos, cfg),
    semelhantes: T.ordenarSemelhantes(ids, chanceDe, 0.75, cfg),
    lista: T.montarLista(candidatos, 5, 0.75, cfg, () => 0.25) };
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(executar()));
} else if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  test('o cenário compartilhado atualiza as quatro áreas e calibra a dificuldade', () => {
    const resultado = executar();
    assert.equal(resultado.areas.length, 4);
    for (const area of resultado.areas) {
      assert.equal(area.perfil.n, casos.respostas.length);
      assert.ok(area.chance > 0 && area.chance < 1);
      assert.ok(T.momentos(area.perfil, cfg).dp < area.momentos.dp);
    }
    assert.ok(resultado.ajuste.delta > 0);
    assert.equal(resultado.lista[0], 'e');
  });
}
