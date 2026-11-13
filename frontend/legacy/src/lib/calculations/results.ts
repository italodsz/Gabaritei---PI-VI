import type { AreaId, PracticeSession, Question, SimulationSession } from "@/types";
import { AREA_BY_ID, TOPIC_BY_ID } from "@/data/fixtures/taxonomy";
import { QUESTION_BY_ID } from "@/lib/repositories/questionRepository";
import { clockElapsed } from "@/lib/sessions/clock";

export interface TopicResult {
  topicId: string;
  name: string;
  total: number;
  correct: number;
  accuracy: number;
}

export interface PracticeResult {
  total: number;
  answered: number;
  correct: number;
  wrong: number;
  unanswered: number;
  accuracy: number;
  /** acerto sobre as respondidas */
  accuracyAnswered: number;
  timeMs: number;
  avgTimeMs: number;
  byTopic: TopicResult[];
  wrongIds: string[];
}

function topicBreakdown(entries: { q: Question; correct: boolean }[]): TopicResult[] {
  const map = new Map<string, { total: number; correct: number }>();
  for (const { q, correct } of entries) {
    const v = map.get(q.topicId) ?? { total: 0, correct: 0 };
    v.total++;
    if (correct) v.correct++;
    map.set(q.topicId, v);
  }
  return Array.from(map.entries())
    .map(([topicId, v]) => ({
      topicId,
      name: TOPIC_BY_ID[topicId]?.name ?? topicId,
      total: v.total,
      correct: v.correct,
      accuracy: v.total ? v.correct / v.total : 0,
    }))
    .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total);
}

export function practiceResult(session: PracticeSession, now: number): PracticeResult {
  const entries: { q: Question; correct: boolean; answered: boolean }[] = session.questionIds
    .map((id) => {
      const q = QUESTION_BY_ID[id];
      const a = session.answers[id];
      return q ? { q, answered: !!a?.confirmed, correct: !!a?.correct } : null;
    })
    .filter((e): e is { q: Question; correct: boolean; answered: boolean } => e !== null);

  const answered = entries.filter((e) => e.answered);
  const correct = answered.filter((e) => e.correct).length;
  const timeMs = clockElapsed(session.clock, now);
  return {
    total: entries.length,
    answered: answered.length,
    correct,
    wrong: answered.length - correct,
    unanswered: entries.length - answered.length,
    accuracy: entries.length ? correct / entries.length : 0,
    accuracyAnswered: answered.length ? correct / answered.length : 0,
    timeMs,
    avgTimeMs: answered.length ? answered.reduce((n, e) => n + (session.answers[e.q.id]?.timeSpentMs ?? 0), 0) / answered.length : 0,
    byTopic: topicBreakdown(answered),
    wrongIds: answered.filter((e) => !e.correct).map((e) => e.q.id),
  };
}

export interface AreaResult {
  areaId: AreaId;
  name: string;
  total: number;
  correct: number;
  blank: number;
  accuracy: number;
  /** Nota estimada DEMONSTRATIVA — não é cálculo da TRI. */
  estimatedScore: number;
}

export interface SimulationResult {
  total: number;
  answered: number;
  correct: number;
  wrong: number;
  blank: number;
  accuracy: number;
  timeMs: number;
  avgTimeMs: number;
  byArea: AreaResult[];
  byTopic: TopicResult[];
  estimatedScore: number;
}

/**
 * Estimativa ilustrativa: mapeia o percentual de acerto para a faixa
 * aproximada de 300–850 pontos. NÃO reproduz a Teoria de Resposta ao Item.
 */
export function estimateDemoScore(accuracy: number): number {
  const clamped = Math.min(1, Math.max(0, accuracy));
  return Math.round(320 + 530 * Math.pow(clamped, 1.15));
}

export function simulationResult(session: SimulationSession, now: number): SimulationResult {
  const entries = session.questionIds
    .map((id) => ({ q: QUESTION_BY_ID[id], a: session.answers[id] }))
    .filter((e) => !!e.q);
  const rows = entries.map(({ q, a }) => ({
    q,
    answered: !!a?.selected,
    correct: !!a?.selected && a.selected === q.correct,
  }));
  const answered = rows.filter((r) => r.answered);
  const correct = rows.filter((r) => r.correct).length;

  const byArea: AreaResult[] = session.sections.map((sec) => {
    const slice = rows.filter((r) => r.q.areaId === sec.areaId);
    const c = slice.filter((r) => r.correct).length;
    const acc = slice.length ? c / slice.length : 0;
    return {
      areaId: sec.areaId,
      name: AREA_BY_ID[sec.areaId].shortName,
      total: slice.length,
      correct: c,
      blank: slice.filter((r) => !r.answered).length,
      accuracy: acc,
      estimatedScore: estimateDemoScore(acc),
    };
  });

  const timeMs = Math.min(clockElapsed(session.clock, now), session.config.durationMs);
  const acc = rows.length ? correct / rows.length : 0;
  return {
    total: rows.length,
    answered: answered.length,
    correct,
    wrong: answered.length - correct,
    blank: rows.length - answered.length,
    accuracy: acc,
    timeMs,
    avgTimeMs: answered.length ? timeMs / answered.length : 0,
    byArea,
    byTopic: topicBreakdown(rows),
    estimatedScore: byArea.length
      ? Math.round(byArea.reduce((n, a) => n + a.estimatedScore, 0) / byArea.length)
      : estimateDemoScore(acc),
  };
}
