import type { AccountData, AreaId, Question, SubjectId } from "@/types";
import { QUESTION_BY_ID } from "@/lib/repositories/questionRepository";

/**
 * Registro de resposta corrigida. É derivado das sessões — a única fonte
 * de verdade — e nunca armazenado separadamente, evitando contadores divergentes.
 */
export interface AnswerRecord {
  questionId: string;
  sessionId: string;
  source: "practice" | "simulation";
  correct: boolean;
  answeredAt: number;
  timeSpentMs: number;
  areaId: AreaId;
  subjectId: SubjectId;
  topicId: string;
}

export function collectAnswerRecords(
  account: Pick<AccountData, "practiceSessions" | "simulations">,
  bank: Record<string, Question> = QUESTION_BY_ID,
): AnswerRecord[] {
  const out: AnswerRecord[] = [];

  for (const s of account.practiceSessions) {
    for (const qid of s.questionIds) {
      const a = s.answers[qid];
      const q = bank[qid];
      if (!a || !q || !a.confirmed || a.correct === null || !a.answeredAt) continue;
      out.push({
        questionId: qid,
        sessionId: s.id,
        source: "practice",
        correct: a.correct,
        answeredAt: new Date(a.answeredAt).getTime(),
        timeSpentMs: a.timeSpentMs,
        areaId: q.areaId,
        subjectId: q.subjectId,
        topicId: q.topicId,
      });
    }
  }

  for (const s of account.simulations) {
    if (s.status !== "completed" || !s.completedAt) continue;
    const at = new Date(s.completedAt).getTime();
    for (const qid of s.questionIds) {
      const a = s.answers[qid];
      const q = bank[qid];
      if (!q || !a || !a.selected) continue;
      out.push({
        questionId: qid,
        sessionId: s.id,
        source: "simulation",
        correct: a.selected === q.correct,
        answeredAt: at,
        timeSpentMs: a.timeSpentMs,
        areaId: q.areaId,
        subjectId: q.subjectId,
        topicId: q.topicId,
      });
    }
  }

  return out.sort((a, b) => a.answeredAt - b.answeredAt);
}

/** Último resultado de cada questão (para "questões erradas"). */
export function latestByQuestion(records: AnswerRecord[]): Map<string, AnswerRecord> {
  const map = new Map<string, AnswerRecord>();
  for (const r of records) {
    const prev = map.get(r.questionId);
    if (!prev || prev.answeredAt <= r.answeredAt) map.set(r.questionId, r);
  }
  return map;
}

export function wrongQuestionIds(records: AnswerRecord[]): AnswerRecord[] {
  return Array.from(latestByQuestion(records).values())
    .filter((r) => !r.correct)
    .sort((a, b) => b.answeredAt - a.answeredAt);
}
