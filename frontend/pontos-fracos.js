// Treino dos pontos fracos ("Erros para superar"): prática contínua, uma questão por vez, sempre
// no título da árvore em que o aluno está pior.
//   - Nível: TRI por título (dificuldade-cliente.js). Cada título começa no nível da área e se
//     separa conforme o aluno responde. O titulo_area só agrupa as questões.
//   - Ponto fraco: o título com o menor θ entre os já respondidos. Fica nele por cerca de 5
//     questões; depois troca, alternando entre os piores (não repete o anterior se houver outro).
//   - Questão: sempre inédita (nunca respondida e fora da sessão), com a chance mais perto de 75%.
//     Se nenhuma chega a 75%, usa a meta possível, mais baixa. Não refaz erradas.
//   - Acabaram as inéditas do título: passa para o próximo ponto fraco.
//   - Aluno novo (nenhum título respondido): começa pela matéria marcada como difícil no cadastro;
//     sem nenhuma marcada, pela área com o nível mais baixo.
import * as Dif from './dificuldade-cliente.js';

export const TITULO = 'Treino dos pontos fracos';
export const META = 0.75;
export const POR_TITULO = 5;
const pct = p => (Number.isFinite(p) ? `${Math.round(p * 100)}%` : '—');

/** Inéditas de um título: nunca respondidas e fora da sessão atual. */
function ineditas(E, topicId, bloqueadas) {
  return E.questionRepository.query({ topicIds: [topicId] }).filter(q => !bloqueadas.has(q.id));
}

/** Questão do título com a chance mais perto da meta (ou da meta possível, se nenhuma chega a 75%). */
export function escolherQuestao(pool) {
  if (!pool.length) return null;
  const comChance = pool.map(q => ({ q, p: Dif.chanceTitulo(q) }));
  const validas = comChance.filter(x => Number.isFinite(x.p));
  if (!validas.length) return { q: pool[Math.floor(Math.random() * pool.length)], p: null };
  const maior = Math.max(...validas.map(x => x.p));
  const alvo = Math.min(META, maior);
  return validas.reduce((a, b) => (Math.abs(b.p - alvo) < Math.abs(a.p - alvo) ? b : a));
}

/** Títulos ordenados do pior para o melhor (só os que já têm respostas e ainda têm inéditas). */
export function rankingFracos(E, bloqueadas) {
  return E.TOPICS
    .map(t => {
      const area = Dif.areaDe({ areaId: E.SUBJECT_BY_ID[t.subjectId]?.areaId });
      const nv = area ? Dif.nivelTitulo(t.id, area) : null;
      return { t, nv };
    })
    .filter(x => x.nv && x.nv.n > 0 && ineditas(E, x.t.id, bloqueadas).length)
    .sort((a, b) => a.nv.theta - b.nv.theta)
    .map(x => x.t.id);
}

/** Aluno novo: título de partida pela matéria difícil do cadastro ou pela área mais fraca. */
export function tituloInicial(E, account, bloqueadas, evitar = null) {
  const dificeis = account.onboarding?.difficultSubjects ?? [];
  const usavel = t => t.id !== evitar && ineditas(E, t.id, bloqueadas).length;
  let topicos = E.TOPICS.filter(t => dificeis.includes(t.subjectId));
  if (!topicos.some(usavel)) {
    const INEP = { matematica: 'MT', natureza: 'CN', humanas: 'CH', linguagens: 'LC' };
    const areas = Object.entries(INEP).map(([id, sigla]) => ({ id, theta: Dif.thetaArea(sigla) ?? 0 })).sort((a, b) => a.theta - b.theta);
    for (const a of areas) {
      topicos = E.TOPICS.filter(t => E.SUBJECT_BY_ID[t.subjectId]?.areaId === a.id);
      if (topicos.some(usavel)) break;
    }
  }
  topicos = topicos.filter(t => t.id !== evitar);
  // Dentro da matéria/área: o título com mais inéditas (todos começam no mesmo nível).
  const com = topicos.map(t => ({ id: t.id, n: ineditas(E, t.id, bloqueadas).length })).filter(x => x.n).sort((a, b) => b.n - a.n);
  return com[0]?.id ?? null;
}

/**
 * Decide o título e a questão seguintes.
 * session.fraco = { topicId, feitas } guarda o título atual e quantas questões já saíram dele.
 */
export function proxima(session, { E, records, account }) {
  const bloqueadas = new Set([...records.map(r => r.questionId), ...(session?.questionIds ?? [])]);
  const atual = session?.fraco;
  const ranking = rankingFracos(E, bloqueadas);
  let topicId = null;
  const aindaTem = id => id && ineditas(E, id, bloqueadas).length > 0;
  if (atual && atual.feitas < POR_TITULO && aindaTem(atual.topicId)) topicId = atual.topicId;
  else topicId = ranking.find(id => id !== atual?.topicId) ?? null;
  // Nenhum outro título respondido: o próximo título da matéria difícil (ou da área mais fraca).
  if (!aindaTem(topicId)) topicId = tituloInicial(E, account, bloqueadas, atual?.topicId) ?? (aindaTem(atual?.topicId) ? atual.topicId : null);
  if (!topicId) return null;
  const pick = escolherQuestao(ineditas(E, topicId, bloqueadas));
  if (!pick) return null;
  const feitas = topicId === atual?.topicId ? atual.feitas + 1 : 1;
  const nome = E.TOPIC_BY_ID[topicId]?.name ?? 'este título';
  Dif.anotarDecisao({ fonte: 'ponto_fraco', sessao: session?.id, escolhida: pick.q.id, chance: pick.p, titulo: topicId, candidatas: ineditas(E, topicId, bloqueadas).length });
  return { id: pick.q.id, reason: `Ponto fraco: ${nome} · chance ${pct(pick.p)}`, fraco: { topicId, feitas } };
}
