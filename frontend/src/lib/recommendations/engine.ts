import type { AccountData, AreaId, Difficulty, ExperienceLevel, Question, SubjectId } from "@/types";
import { SUBJECT_BY_ID, TOPICS } from "@/data/fixtures/taxonomy";
import { questionRepository } from "@/lib/repositories/questionRepository";
import { latestByQuestion, type AnswerRecord } from "@/lib/calculations/records";
import { topicStats } from "@/lib/calculations/stats";
import { createRng, shuffle, type Rng } from "@/lib/random";

/**
 * Motor de recomendação LOCAL e demonstrativo.
 * Usa regras simples e transparentes (desempenho suavizado, dificuldades
 * declaradas no onboarding e tempo desde o último contato). Não é um modelo
 * preditivo: as justificativas exibidas descrevem exatamente essas regras.
 */

const DAY = 86400000;

export type RecommendationKind = "desempenho" | "dificuldade" | "revisao" | "novo" | "manter";

export interface TopicRecommendation {
  topicId: string;
  topicName: string;
  subjectId: SubjectId;
  subjectName: string;
  areaId: AreaId;
  kind: RecommendationKind;
  reason: string;
  score: number;
  accuracy: number | null;
  answered: number;
  available: number;
}

export const RECOMMENDATION_LABEL: Record<RecommendationKind, string> = {
  desempenho: "Ponto de atenção",
  dificuldade: "Sua dificuldade",
  revisao: "Hora de revisar",
  novo: "Para explorar",
  manter: "Manter o ritmo",
};

interface Input {
  records: AnswerRecord[];
  difficultSubjects: SubjectId[];
  now: number;
  limit?: number;
  maxPerSubject?: number;
}

export function recommendTopics({ records, difficultSubjects, now, limit = 6, maxPerSubject = 2 }: Input): TopicRecommendation[] {
  const stats = new Map(topicStats(records).map((t) => [t.topicId, t]));
  const all: TopicRecommendation[] = [];

  for (const topic of TOPICS) {
    const subject = SUBJECT_BY_ID[topic.subjectId];
    const available = questionRepository.query({ topicIds: [topic.id] }).length;
    if (!available) continue;
    const s = stats.get(topic.id);
    const difficult = difficultSubjects.includes(topic.subjectId);
    let score: number;
    let kind: RecommendationKind;
    let reason: string;

    if (!s || s.answered < 4) {
      score = 0.32 + (difficult ? 0.38 : 0) + (s ? 0 : 0.04);
      kind = difficult ? "dificuldade" : "novo";
      reason = difficult
        ? `Você indicou ${subject.name} como uma dificuldade — comece por aqui com questões graduais.`
        : s
          ? `Apenas ${s.answered} ${s.answered === 1 ? "questão respondida" : "questões respondidas"} até agora.`
          : "Assunto ainda não explorado por você.";
    } else {
      const weakness = 1 - s.smoothed;
      const daysSince = (now - s.lastAnsweredAt) / DAY;
      score = weakness + (difficult ? 0.1 : 0) + (daysSince > 10 ? 0.15 : 0);
      const pct = Math.round(s.accuracy * 100);
      if (s.smoothed < 0.6) {
        kind = "desempenho";
        reason = `Acerto de ${pct}% em ${s.answered} questões deste assunto.`;
      } else if (daysSince > 10) {
        kind = "revisao";
        reason = `Último contato há ${Math.floor(daysSince)} dias — uma revisão ajuda a fixar.`;
      } else {
        kind = "manter";
        reason = `Bom desempenho (${pct}%) — vale manter o ritmo com questões mais difíceis.`;
      }
    }

    all.push({
      topicId: topic.id,
      topicName: topic.name,
      subjectId: topic.subjectId,
      subjectName: subject.name,
      areaId: subject.areaId,
      kind,
      reason,
      score,
      accuracy: s && s.answered ? s.accuracy : null,
      answered: s?.answered ?? 0,
      available,
    });
  }

  all.sort((a, b) => b.score - a.score || a.topicName.localeCompare(b.topicName));
  const perSubject = new Map<SubjectId, number>();
  const out: TopicRecommendation[] = [];
  for (const rec of all) {
    const n = perSubject.get(rec.subjectId) ?? 0;
    if (n >= maxPerSubject) continue;
    perSubject.set(rec.subjectId, n + 1);
    out.push(rec);
    if (out.length >= limit) break;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Seleção de questões                                                 */
/* ------------------------------------------------------------------ */

const LEVEL_PREFERENCE: Record<ExperienceLevel, Difficulty[]> = {
  iniciante: ["facil", "media", "dificil"],
  treineiro: ["facil", "media", "dificil"],
  intermediario: ["media", "facil", "dificil"],
  avancado: ["dificil", "media", "facil"],
};

/**
 * Ordena um conjunto de questões priorizando: inéditas, depois erradas
 * na última tentativa, depois já acertadas. Dentro de cada grupo,
 * favorece a dificuldade adequada ao nível declarado.
 */
export function prioritizeQuestions(
  pool: Question[],
  records: AnswerRecord[],
  rng: Rng,
  level: ExperienceLevel | null = null,
): Question[] {
  const latest = latestByQuestion(records);
  const pref = level ? LEVEL_PREFERENCE[level] : null;
  const rank = (q: Question) => {
    const last = latest.get(q.id);
    const seen = !last ? 0 : last.correct ? 2 : 1;
    const diff = pref ? pref.indexOf(q.difficulty) * 0.3 : 0;
    return seen + diff + rng() * 0.25;
  };
  return pool
    .map((q) => ({ q, r: rank(q) }))
    .sort((a, b) => a.r - b.r)
    .map((x) => x.q);
}

export function pickQuestions(
  pool: Question[],
  count: number,
  records: AnswerRecord[],
  rng: Rng,
  level: ExperienceLevel | null = null,
): Question[] {
  return shuffle(prioritizeQuestions(pool, records, rng, level).slice(0, count), rng);
}

export interface AutoSelection {
  questionIds: string[];
  topics: TopicRecommendation[];
  summary: string;
}

/** “IA escolhe por mim”: distribuição proporcional ao score das recomendações. */
export function buildAutoSelection(
  account: Pick<AccountData, "onboarding">,
  records: AnswerRecord[],
  count: number,
  now: number,
  seed: string | number = now,
): AutoSelection {
  const rng = createRng(seed);
  const topics = recommendTopics({ records, difficultSubjects: account.onboarding.difficultSubjects, now, limit: 5 });
  const totalScore = topics.reduce((n, t) => n + t.score, 0) || 1;
  const chosen = new Set<string>();
  const ids: string[] = [];

  topics.forEach((t, i) => {
    const want = i === topics.length - 1 ? count - ids.length : Math.max(1, Math.round((t.score / totalScore) * count));
    const quota = Math.min(want, count - ids.length);
    const pool = questionRepository.query({ topicIds: [t.topicId] }).filter((q) => !chosen.has(q.id));
    for (const q of pickQuestions(pool, quota, records, rng, account.onboarding.level)) {
      if (ids.length >= count) break;
      chosen.add(q.id);
      ids.push(q.id);
    }
  });

  // completa com questões de qualquer assunto caso algum tenha poucas opções
  if (ids.length < count) {
    const rest = questionRepository.all().filter((q) => !chosen.has(q.id) && !q.foreignLanguage);
    for (const q of pickQuestions(rest, count - ids.length, records, rng, account.onboarding.level)) {
      ids.push(q.id);
    }
  }

  const names = topics.slice(0, 3).map((t) => t.topicName.toLowerCase());
  return {
    questionIds: shuffle(ids, rng),
    topics,
    summary: names.length ? `Foco em ${names.join(", ")} e assuntos relacionados.` : "Seleção equilibrada entre as áreas.",
  };
}
