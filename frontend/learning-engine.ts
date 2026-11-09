// Reaproveita as regras e o acervo do front-end anterior, sem seus componentes visuais.
export { AREAS, AREA_BY_ID, SUBJECTS, SUBJECT_BY_ID, TOPICS, TOPIC_BY_ID, REFERENCE_YEARS, subjectsOfArea } from './legacy/src/data/fixtures/taxonomy';
export { questionRepository } from './legacy/src/lib/repositories/questionRepository';
export { createDemoAccount, createEmptyAccount } from './legacy/src/data/seeds/accounts';
export { collectAnswerRecords } from './legacy/src/lib/calculations/records';
export * from './legacy/src/lib/calculations/stats';
export { goalProgress, GOAL_META } from './legacy/src/lib/calculations/goals';
export { recommendTopics, buildAutoSelection, RECOMMENDATION_LABEL } from './legacy/src/lib/recommendations/engine';
export { EMPTY_FILTERS, PRACTICE_COUNTS, availableForFilters, selectPracticeQuestions, createPracticeSession } from './legacy/src/lib/sessions/factory';
export { practice } from './legacy/src/lib/sessions/reducers';
export { clockElapsed } from './legacy/src/lib/sessions/clock';

// Simulados (prova sem correção imediata), reaproveitando as regras do front anterior.
export { simulation } from './legacy/src/lib/sessions/reducers';
export { createSimulationSession, simulationDuration, distributeAcrossAreas, questionNumber, SIMULATION_SIZES, MINUTES_PER_QUESTION } from './legacy/src/lib/sessions/factory';
export { simulationResult, practiceResult, estimateDemoScore } from './legacy/src/lib/calculations/results';
export { pickQuestions, prioritizeQuestions } from './legacy/src/lib/recommendations/engine';
export { createRng, shuffle, freshSeed } from './legacy/src/lib/random';

import type { AreaId, SimulationConfig, SimulationSession, SimulationSection } from './legacy/src/types';
import { AREAS as _AREAS, AREA_BY_ID as _AREA_BY_ID } from './legacy/src/data/fixtures/taxonomy';
import { questionRepository as _repo } from './legacy/src/lib/repositories/questionRepository';
import { createClock as _createClock } from './legacy/src/lib/sessions/clock';
import { createId as _createId } from './legacy/src/lib/random';

/**
 * Cria um simulado a partir de questões já escolhidas (simulado por área com
 * ano de referência, ou simulado personalizado). Mantém o formato de
 * SimulationSession: questões agrupadas por área, na ordem da prova.
 */
export function createSimulationFromQuestions(input: {
  title: string;
  questionIds: string[];
  config: Partial<SimulationConfig> & { durationMs: number };
  now: number;
  timerHidden?: boolean;
}): SimulationSession {
  const qs = _repo.getMany(input.questionIds);
  const order = _AREAS.map(a => a.id);
  const sorted = [...qs].sort((a, b) => order.indexOf(a.areaId) - order.indexOf(b.areaId));
  const sections: SimulationSection[] = [];
  const questionIds: string[] = [];
  for (const areaId of order as AreaId[]) {
    const group = sorted.filter(q => q.areaId === areaId);
    if (!group.length) continue;
    sections.push({ areaId, label: _AREA_BY_ID[areaId].shortName, start: questionIds.length, end: questionIds.length + group.length, firstNumber: questionIds.length + 1 });
    questionIds.push(...group.map(q => q.id));
  }
  const iso = new Date(input.now).toISOString();
  const config: SimulationConfig = {
    mode: 'custom', edition: null, day: null, foreignLanguage: 'ingles', criteria: 'balanced', includesEssay: false,
    ...input.config,
    areaIds: sections.map(s => s.areaId),
    size: questionIds.length,
  } as SimulationConfig;
  return {
    id: _createId('simulado'),
    kind: 'simulation',
    title: input.title,
    createdAt: iso,
    updatedAt: iso,
    status: 'in_progress',
    completedAt: null,
    finishReason: null,
    config,
    questionIds,
    sections,
    answers: Object.fromEntries(questionIds.map(qid => [qid, { questionId: qid, selected: null, answeredAt: null, timeSpentMs: 0 }])),
    marked: [],
    currentIndex: 0,
    clock: _createClock(true, input.now),
    cursorElapsedMs: 0,
    timerHidden: !!input.timerHidden,
  };
}

// Perfil e conquistas (ProfilePage.tsx do front anterior).
export { evaluateAchievements, ACHIEVEMENT_DEFINITIONS } from './legacy/src/lib/calculations/achievements';
