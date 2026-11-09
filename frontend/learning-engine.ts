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
