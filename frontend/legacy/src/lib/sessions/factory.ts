import type {
  AreaId,
  ExperienceLevel,
  PracticeFilters,
  PracticeMode,
  PracticeSession,
  Question,
  SimulationConfig,
  SimulationSection,
  SimulationSession,
  SubjectId,
} from "@/types";
import { AREAS, AREA_BY_ID, SUBJECTS } from "@/data/fixtures/taxonomy";
import { questionRepository } from "@/lib/repositories/questionRepository";
import { pickQuestions, recommendTopics } from "@/lib/recommendations/engine";
import type { AnswerRecord } from "@/lib/calculations/records";
import { createId, createRng, shuffle, type Rng } from "@/lib/random";
import { createClock } from "./clock";

/* ------------------------------------------------------------------ */
/* Listas de prática                                                   */
/* ------------------------------------------------------------------ */

export const PRACTICE_COUNTS = [5, 10, 15, 20, 30];

export const EMPTY_FILTERS: PracticeFilters = {
  subjectId: null,
  topicIds: [],
  subtopicIds: [],
  years: [],
  count: 10,
};

export function filtersToQuery(filters: PracticeFilters) {
  return {
    subjectId: filters.subjectId,
    topicIds: filters.topicIds,
    subtopicIds: filters.subtopicIds,
    years: filters.years,
  };
}

export function availableForFilters(filters: PracticeFilters): Question[] {
  return questionRepository.query(filtersToQuery(filters));
}

interface CreatePracticeInput {
  mode: PracticeMode;
  title: string;
  questionIds: string[];
  filters: PracticeFilters;
  timerVisible: boolean;
  now: number;
  id?: string;
}

export function createPracticeSession(input: CreatePracticeInput): PracticeSession {
  const iso = new Date(input.now).toISOString();
  return {
    id: input.id ?? createId("lista"),
    kind: "practice",
    mode: input.mode,
    title: input.title,
    createdAt: iso,
    updatedAt: iso,
    status: "in_progress",
    completedAt: null,
    filters: { ...input.filters, count: input.questionIds.length },
    questionIds: input.questionIds,
    answers: Object.fromEntries(
      input.questionIds.map((qid) => [
        qid,
        { questionId: qid, selected: null, confirmed: false, correct: null, answeredAt: null, timeSpentMs: 0 },
      ]),
    ),
    currentIndex: 0,
    clock: createClock(true, input.now),
    cursorElapsedMs: 0,
    timerVisible: input.timerVisible,
  };
}

export function selectPracticeQuestions(
  filters: PracticeFilters,
  records: AnswerRecord[],
  seed: string | number,
  level: ExperienceLevel | null,
): string[] {
  const pool = availableForFilters(filters);
  return pickQuestions(pool, filters.count, records, createRng(seed), level).map((q) => q.id);
}

/* ------------------------------------------------------------------ */
/* Simulados                                                           */
/* ------------------------------------------------------------------ */

export const FULL_DAY_DURATION: Record<1 | 2, number> = {
  1: 5.5 * 3600000, // 5h30
  2: 5 * 3600000, // 5h
};

export const SIMULATION_SIZES = [10, 20, 30, 45, 60, 90];
export const MINUTES_PER_QUESTION = 3;

export function simulationDuration(config: Pick<SimulationConfig, "mode" | "day" | "size">): number {
  if (config.mode === "official" && config.day) {
    return Math.round((FULL_DAY_DURATION[config.day] * config.size) / 90);
  }
  return config.size * MINUTES_PER_QUESTION * 60000;
}

function subjectOrder(q: Question): number {
  return SUBJECTS.findIndex((s) => s.id === q.subjectId);
}

/** Seleciona `n` questões de uma área, agrupadas por matéria (como na prova). */
function pickFromArea(
  areaId: AreaId,
  n: number,
  config: SimulationConfig,
  records: AnswerRecord[],
  rng: Rng,
  excluded: Set<string>,
  weakTopicIds: string[],
): Question[] {
  if (n <= 0) return [];
  const foreign = config.foreignLanguage;
  let pool = questionRepository
    .query({ areaIds: [areaId], foreignLanguage: areaId === "linguagens" ? "none" : undefined })
    .filter((q) => !excluded.has(q.id));

  let selected: Question[] = [];

  if (areaId === "linguagens") {
    const foreignCount = n >= 90 / 2 ? 5 : Math.max(1, Math.round(n / 9));
    const foreignPool = questionRepository
      .query({ subjectId: foreign })
      .filter((q) => q.foreignLanguage === foreign && !excluded.has(q.id));
    selected = shuffle(foreignPool, rng).slice(0, Math.min(foreignCount, n));
  }

  const remaining = n - selected.length;
  if (config.criteria === "weak" && weakTopicIds.length) {
    const weakPool = pool.filter((q) => weakTopicIds.includes(q.topicId));
    const weakPick = pickQuestions(weakPool, Math.ceil(remaining * 0.6), records, rng);
    selected.push(...weakPick);
    const picked = new Set(weakPick.map((q) => q.id));
    pool = pool.filter((q) => !picked.has(q.id));
  }

  const rest = n - selected.length;
  const restPick =
    config.criteria === "random" ? shuffle(pool, rng).slice(0, rest) : pickQuestions(pool, rest, records, rng);
  selected.push(...restPick);

  const foreignFirst = selected.filter((q) => q.foreignLanguage);
  const others = selected.filter((q) => !q.foreignLanguage).sort((a, b) => subjectOrder(a) - subjectOrder(b));
  return [...foreignFirst, ...others];
}

export function distributeAcrossAreas(size: number, areaIds: AreaId[]): Record<AreaId, number> {
  const ordered = AREAS.filter((a) => areaIds.includes(a.id)).map((a) => a.id);
  const base = Math.floor(size / ordered.length);
  let rem = size - base * ordered.length;
  const out = {} as Record<AreaId, number>;
  for (const id of ordered) {
    out[id] = base + (rem > 0 ? 1 : 0);
    if (rem > 0) rem--;
  }
  return out;
}

/** Áreas incluídas por configuração. */
export function areasForConfig(config: Pick<SimulationConfig, "mode" | "day" | "areaIds">): AreaId[] {
  if (config.mode === "official") {
    return AREAS.filter((a) => a.day === (config.day ?? 1)).map((a) => a.id);
  }
  return AREAS.filter((a) => config.areaIds.includes(a.id)).map((a) => a.id);
}

export function simulationTitle(config: SimulationConfig): string {
  if (config.mode === "official") {
    const full = config.size === 90;
    return `ENEM ${config.edition ?? ""} · Dia ${config.day}${full ? "" : ` · ${config.size} questões`}`.replace("  ", " ");
  }
  const names = areasForConfig(config).map((id) => AREA_BY_ID[id].shortName);
  return names.length === 4 ? `Simulado geral · ${config.size} questões` : `Simulado · ${names.join(" + ")}`;
}

interface CreateSimulationInput {
  config: Omit<SimulationConfig, "durationMs" | "includesEssay"> & { durationMs?: number };
  records: AnswerRecord[];
  difficultSubjects: SubjectId[];
  now: number;
  timerHidden: boolean;
  seed?: string | number;
  id?: string;
}

export function createSimulationSession(input: CreateSimulationInput): SimulationSession {
  const areaIds = areasForConfig(input.config);
  const config: SimulationConfig = {
    ...input.config,
    areaIds,
    durationMs: input.config.durationMs ?? simulationDuration(input.config),
    includesEssay: input.config.mode === "official" && input.config.day === 1,
  };
  const rng = createRng(input.seed ?? input.now);
  const perArea = distributeAcrossAreas(config.size, areaIds);
  const weakTopicIds = recommendTopics({
    records: input.records,
    difficultSubjects: input.difficultSubjects,
    now: input.now,
    limit: 10,
    maxPerSubject: 3,
  }).map((t) => t.topicId);

  const excluded = new Set<string>();
  const sections: SimulationSection[] = [];
  const questionIds: string[] = [];
  const baseNumber = config.mode === "official" && config.day === 2 ? 91 : 1;

  for (const areaId of areaIds) {
    const qs = pickFromArea(areaId, perArea[areaId], config, input.records, rng, excluded, weakTopicIds);
    qs.forEach((q) => excluded.add(q.id));
    if (!qs.length) continue;
    sections.push({
      areaId,
      label: AREA_BY_ID[areaId].shortName,
      start: questionIds.length,
      end: questionIds.length + qs.length,
      firstNumber: baseNumber + questionIds.length,
    });
    questionIds.push(...qs.map((q) => q.id));
  }

  const iso = new Date(input.now).toISOString();
  return {
    id: input.id ?? createId("simulado"),
    kind: "simulation",
    title: simulationTitle(config),
    createdAt: iso,
    updatedAt: iso,
    status: "in_progress",
    completedAt: null,
    finishReason: null,
    config: { ...config, size: questionIds.length },
    questionIds,
    sections,
    answers: Object.fromEntries(
      questionIds.map((qid) => [qid, { questionId: qid, selected: null, answeredAt: null, timeSpentMs: 0 }]),
    ),
    marked: [],
    currentIndex: 0,
    clock: createClock(false, input.now),
    cursorElapsedMs: 0,
    timerHidden: input.timerHidden,
  };
}

/** Número exibido para a questão no índice `i` do simulado. */
export function questionNumber(session: Pick<SimulationSession, "sections">, index: number): number {
  const sec = session.sections.find((s) => index >= s.start && index < s.end);
  return sec ? sec.firstNumber + (index - sec.start) : index + 1;
}
