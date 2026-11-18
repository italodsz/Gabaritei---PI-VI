// Lista livre (Montar lista sem quantidade fixa): em vez de colocar todas as questões do filtro de
// uma vez (até 2.657), a lista começa com um lote e ganha o próximo quando o aluno chega ao fim.
// A ordem segue o recomendador de dificuldade: o primeiro lote começa pela mais acessível; os
// seguintes continuam pela adequação ao desafio, sem repetir as que já estão na lista.
import * as Dif from './dificuldade-cliente.js';

export const LOTE = 20;

/** Questões do filtro (mesma regra da tela Montar lista). criterios: { subjectIds, topicIds, subtopicIds, years } */
export function poolLivre(E, c) {
  const subjects = c.subjectIds?.length ? c.subjectIds : E.SUBJECTS.map(x => x.id);
  const out = [];
  for (const sid of subjects) {
    const subject = E.SUBJECT_BY_ID[sid];
    if (!subject) continue;
    const topicIds = (c.topicIds || []).filter(t => subject.topics.some(x => x.id === t));
    const subtopicIds = (c.subtopicIds || []).filter(sub => topicIds.some(t => sub.startsWith(`${t}.`)));
    out.push(...E.questionRepository.query({ subjectId: sid, topicIds, subtopicIds, years: c.years || [] }));
  }
  return [...new Map(out.map(q => [q.id, q])).values()];
}

/** Primeiro lote, a partir do pool já calculado. */
export function primeiroLote(E, pool, records, level) {
  const rng = E.createRng(Date.now());
  return Dif.pronto() ? Dif.montarLista(pool, Math.min(LOTE, pool.length), records, rng) : E.pickQuestions(pool, Math.min(LOTE, pool.length), records, rng, level).map(q => q.id);
}

/** Questões do filtro que ainda não estão na lista. */
export function restantes(E, session) {
  const na = new Set(session.questionIds);
  return poolLivre(E, session.livre).filter(q => !na.has(q.id));
}

/** Próximo lote: inéditas primeiro, na ordem da adequação ao desafio. */
export function proximoLote(E, session, records, level) {
  const resto = restantes(E, session);
  if (!resto.length) return [];
  const vistas = new Set(records.map(r => r.questionId));
  const ineditas = resto.filter(q => !vistas.has(q.id)), base = ineditas.length ? ineditas : resto;
  if (!Dif.pronto()) return E.pickQuestions(base, Math.min(LOTE, base.length), records, E.createRng(Date.now()), level).map(q => q.id);
  return Dif.porAdequacao(base).slice(0, LOTE).map(q => q.id);
}
