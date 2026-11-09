import type {
  AccountData,
  AccountKind,
  AlternativeLetter,
  PracticeSession,
  Question,
  SimulationSession,
  SubjectId,
} from "@/types";
import { LETTERS } from "@/types";
import { QUESTION_BANK, QUESTION_BY_ID } from "@/data/fixtures/questions";
import { SUBJECTS, TOPIC_BY_ID } from "@/data/fixtures/taxonomy";
import { DEFAULT_GOALS } from "@/lib/calculations/goals";
import { collectAnswerRecords } from "@/lib/calculations/records";
import { evaluateAchievements } from "@/lib/calculations/achievements";
import { createPracticeSession, createSimulationSession } from "@/lib/sessions/factory";
import { createRng, pick, sample, shuffle, type Rng } from "@/lib/random";

export const ACCOUNT_SCHEMA_VERSION = 1;
export const DEMO_ACCOUNT_ID = "demo-marina";
export const DEMO_EMAIL = "demo@gabaritei.app";

const MIN = 60000;
const DAY = 86400000;

interface EmptyAccountInput {
  id: string;
  kind: AccountKind;
  name: string;
  email: string;
  now: number;
}

export function createEmptyAccount({ id, kind, name, email, now }: EmptyAccountInput): AccountData {
  return {
    schemaVersion: ACCOUNT_SCHEMA_VERSION,
    profile: {
      id,
      kind,
      name,
      nickname: name.trim().split(/\s+/)[0] ?? name,
      email,
      school: "",
      city: "",
      bio: "",
      createdAt: new Date(now).toISOString(),
    },
    onboarding: { status: "pending", goal: null, edition: null, difficultSubjects: [], level: null, finishedAt: null },
    study: { practiceTimer: true, simulationTimer: true, defaultQuestionCount: 10 },
    practiceSessions: [],
    simulations: [],
    favorites: [],
    reviewMarks: [],
    goals: DEFAULT_GOALS.map((g) => ({ ...g })),
    celebratedAchievements: [],
  };
}

/* ------------------------------------------------------------------ */
/* Estudante demonstrativo                                             */
/* ------------------------------------------------------------------ */

/** Probabilidade base de acerto por matéria (perfil com pontos fortes e fracos). */
const STRENGTH: Record<SubjectId, number> = {
  portugues: 0.72,
  literatura: 0.66,
  ingles: 0.74,
  espanhol: 0.64,
  artes: 0.64,
  historia: 0.68,
  geografia: 0.63,
  filosofia: 0.58,
  sociologia: 0.65,
  biologia: 0.60,
  fisica: 0.38,
  quimica: 0.34,
  matematica: 0.44,
};

const DIFFICULTY_ADJ = { facil: 0.12, media: 0, dificil: -0.14 } as const;

function answerFor(q: Question, rng: Rng, progress: number, bias = 0): { letter: AlternativeLetter; correct: boolean } {
  const p = Math.min(0.96, Math.max(0.08, STRENGTH[q.subjectId] + DIFFICULTY_ADJ[q.difficulty] + progress * 0.12 + bias));
  const correct = rng() < p;
  if (correct) return { letter: q.correct, correct };
  const wrong = LETTERS.filter((l) => l !== q.correct);
  return { letter: pick(wrong, rng), correct };
}

function timeFor(q: Question, rng: Rng): number {
  const base = q.difficulty === "facil" ? 70 : q.difficulty === "media" ? 120 : 170;
  return Math.round((base + rng() * 90) * 1000);
}

const PRACTICE_SUBJECT_WEIGHTS: [SubjectId, number][] = [
  ["matematica", 5],
  ["quimica", 3],
  ["fisica", 3],
  ["biologia", 2],
  ["portugues", 3],
  ["historia", 2],
  ["geografia", 2],
  ["literatura", 1],
  ["filosofia", 1],
  ["sociologia", 1],
  ["artes", 1],
];

function weightedSubject(rng: Rng): SubjectId {
  const total = PRACTICE_SUBJECT_WEIGHTS.reduce((n, [, w]) => n + w, 0);
  let r = rng() * total;
  for (const [s, w] of PRACTICE_SUBJECT_WEIGHTS) {
    r -= w;
    if (r <= 0) return s;
  }
  return "matematica";
}

function seededId(prefix: string, n: number) {
  return `${prefix}-${n.toString().padStart(3, "0")}`;
}

interface PracticeBuild {
  id: string;
  questions: Question[];
  start: number;
  progress: number;
  rng: Rng;
  title: string;
  mode?: PracticeSession["mode"];
  answeredCount?: number;
  bias?: number;
  allCorrect?: boolean;
  subjectId?: SubjectId | null;
  now: number;
}

function buildPractice(b: PracticeBuild): PracticeSession {
  const session = createPracticeSession({
    id: b.id,
    mode: b.mode ?? "custom",
    title: b.title,
    questionIds: b.questions.map((q) => q.id),
    filters: {
      subjectId: b.subjectId ?? null,
      topicIds: Array.from(new Set(b.questions.map((q) => q.topicId))),
      subtopicIds: [],
      years: [],
      count: b.questions.length,
    },
    timerVisible: true,
    now: b.start,
  });

  const answeredCount = b.answeredCount ?? b.questions.length;
  let t = b.start;
  let elapsed = 0;
  b.questions.forEach((q, i) => {
    if (i >= answeredCount) return;
    const spent = timeFor(q, b.rng);
    t = Math.min(t + spent, b.now - 1000);
    elapsed += spent;
    const ans = b.allCorrect ? { letter: q.correct, correct: true } : answerFor(q, b.rng, b.progress, b.bias);
    session.answers[q.id] = {
      questionId: q.id,
      selected: ans.letter,
      confirmed: true,
      correct: ans.correct,
      answeredAt: new Date(t).toISOString(),
      timeSpentMs: spent,
    };
  });

  const finished = answeredCount >= b.questions.length;
  session.clock = { elapsedMs: elapsed + Math.round(elapsed * 0.08), runningSince: null };
  session.cursorElapsedMs = session.clock.elapsedMs;
  session.currentIndex = finished ? b.questions.length - 1 : answeredCount;
  session.status = finished ? "completed" : "in_progress";
  session.completedAt = finished ? new Date(t).toISOString() : null;
  session.updatedAt = new Date(t).toISOString();
  return session;
}

function questionsForSubject(subjectId: SubjectId, count: number, rng: Rng): Question[] {
  const subject = SUBJECTS.find((s) => s.id === subjectId)!;
  const topics = sample(
    subject.topics.map((t) => t.id),
    Math.min(subject.topics.length, 1 + Math.floor(rng() * 2)),
    rng,
  );
  let pool = QUESTION_BANK.filter((q) => topics.includes(q.topicId));
  if (pool.length < count) pool = QUESTION_BANK.filter((q) => q.subjectId === subjectId);
  return shuffle(pool, rng).slice(0, count);
}

function practiceTitle(qs: Question[]): string {
  const topics = Array.from(new Set(qs.map((q) => TOPIC_BY_ID[q.topicId]?.name)));
  return topics.length === 1 ? topics[0]! : topics.length === 2 ? `${topics[0]} e ${topics[1]}` : `${topics[0]} e mais ${topics.length - 1}`;
}

interface SimBuild {
  id: string;
  config: Parameters<typeof createSimulationSession>[0]["config"];
  at: number;
  progress: number;
  rng: Rng;
  answeredCount?: number;
  completed: boolean;
  usage: number;
  now: number;
}

function buildSimulation(b: SimBuild): SimulationSession {
  const sim = createSimulationSession({
    id: b.id,
    config: b.config,
    records: [],
    difficultSubjects: [],
    now: b.at,
    timerHidden: false,
    seed: b.id,
  });
  const limit = b.answeredCount ?? sim.questionIds.length;
  const elapsed = Math.round(sim.config.durationMs * b.usage);
  const per = Math.round(elapsed / Math.max(1, limit));
  sim.questionIds.forEach((qid, i) => {
    if (i >= limit) return;
    const q = QUESTION_BY_ID[qid];
    const blank = b.completed && b.rng() < 0.04;
    const ans = answerFor(q, b.rng, b.progress, -0.03);
    sim.answers[qid] = {
      questionId: qid,
      selected: blank ? null : ans.letter,
      answeredAt: blank ? null : new Date(b.at + per * (i + 1)).toISOString(),
      timeSpentMs: per,
    };
  });
  sim.marked = b.completed ? [] : sample(sim.questionIds.slice(0, limit), 2, b.rng);
  sim.clock = { elapsedMs: elapsed, runningSince: null };
  sim.cursorElapsedMs = elapsed;
  sim.currentIndex = b.completed ? 0 : limit;
  const endAt = Math.min(b.at + elapsed, b.now - 1000);
  sim.updatedAt = new Date(endAt).toISOString();
  if (b.completed) {
    sim.status = "completed";
    sim.completedAt = new Date(endAt).toISOString();
    sim.finishReason = "manual";
  }
  return sim;
}

/**
 * Gera o histórico do estudante demonstrativo de forma determinística
 * (mesma seed ⇒ mesmos dados), relativo ao instante `now`.
 */
export function createDemoAccount(now: number): AccountData {
  const rng = createRng("gabaritei-demo-v1");
  const account = createEmptyAccount({ id: DEMO_ACCOUNT_ID, kind: "demo", name: "Marina Alves", email: DEMO_EMAIL, now: now - 120 * DAY });
  account.profile = {
    ...account.profile,
    nickname: "Mari",
    school: "Escola Estadual Professora Ana Lins",
    city: "Recife, PE",
    bio: "3º ano do ensino médio. Quero cursar Engenharia Ambiental em uma universidade pública.",
  };
  account.onboarding = {
    status: "completed",
    goal: "universidade_publica",
    edition: new Date(now).getFullYear() + (new Date(now).getMonth() >= 10 ? 1 : 0),
    difficultSubjects: ["matematica", "quimica", "fisica"],
    level: "intermediario",
    finishedAt: new Date(now - 118 * DAY).toISOString(),
  };
  account.study = { practiceTimer: true, simulationTimer: true, defaultQuestionCount: 10 };
  account.goals = [
    { kind: "weekly_questions", target: 80, enabled: true },
    { kind: "weekly_accuracy", target: 70, enabled: true },
    { kind: "weekly_study_days", target: 5, enabled: true },
    { kind: "monthly_simulations", target: 3, enabled: true },
  ];

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const startDay = 110;
  const practice: PracticeSession[] = [];
  let n = 1;

  for (let d = startDay; d >= 1; d--) {
    const active = d <= 12 || rng() < 0.6;
    if (!active) continue;
    const progress = (startDay - d) / startDay;
    const sessions = rng() < 0.3 ? 2 : 1;
    for (let s = 0; s < sessions; s++) {
      const subject = weightedSubject(rng);
      const count = 5 + Math.floor(rng() * 10);
      const qs = questionsForSubject(subject, count, rng);
      const hour = s === 0 ? 14 + Math.floor(rng() * 3) : 19 + Math.floor(rng() * 2);
      const start = today.getTime() - d * DAY + hour * 3600000 + Math.floor(rng() * 50) * MIN;
      practice.push(buildPractice({ id: seededId("demo-lista", n++), questions: qs, start, progress, rng, title: practiceTitle(qs), subjectId: subject, now }));
    }
  }

  // Lista perfeita (Gabaritou!) e listas de revisão de erros
  const perfectQs = questionsForSubject("portugues", 6, rng);
  practice.push(
    buildPractice({ id: seededId("demo-lista", n++), questions: perfectQs, start: today.getTime() - 40 * DAY + 15 * 3600000, progress: 0.6, rng, title: practiceTitle(perfectQs), allCorrect: true, subjectId: "portugues", now }),
  );

  const partialAccount = { practiceSessions: practice, simulations: [] as SimulationSession[] };
  const wrongSoFar = collectAnswerRecords(partialAccount).filter((r) => !r.correct);
  for (const [i, dAgo] of [[0, 20], [1, 6]] as const) {
    const ids = Array.from(new Set(wrongSoFar.slice(i * 40, i * 40 + 40).map((r) => r.questionId))).slice(0, 8);
    const qs = ids.map((id) => QUESTION_BY_ID[id]);
    practice.push(
      buildPractice({ id: seededId("demo-lista", n++), questions: qs, start: today.getTime() - dAgo * DAY + 20 * 3600000, progress: 0.8, rng, title: "Revisão de erros", mode: "retry", bias: 0.08, now }),
    );
  }

  // Sessão de hoje (garante sequência ativa)
  const todayQs = questionsForSubject("matematica", 8, rng);
  const todayStart = Math.min(Math.max(today.getTime() + 5 * MIN, now - 100 * MIN), now - MIN);
  practice.push(
    buildPractice({ id: seededId("demo-lista", n++), questions: todayQs, start: todayStart, progress: 1, rng, title: practiceTitle(todayQs), subjectId: "matematica", now }),
  );

  // Lista interrompida (para "Retomar")
  const pausedQs = questionsForSubject("quimica", 10, rng);
  practice.push(
    buildPractice({ id: "demo-lista-interrompida", questions: pausedQs, start: today.getTime() - 1 * DAY + 21 * 3600000, progress: 1, rng, title: practiceTitle(pausedQs), answeredCount: 4, subjectId: "quimica", now }),
  );

  const year = new Date(now).getFullYear();
  const sims: SimulationSession[] = [
    buildSimulation({
      id: "demo-simulado-001",
      config: { mode: "custom", edition: null, day: null, areaIds: ["natureza", "matematica"], size: 30, foreignLanguage: "ingles", criteria: "balanced" },
      at: today.getTime() - 82 * DAY + 9 * 3600000,
      progress: 0.25,
      rng,
      completed: true,
      usage: 0.82,
      now,
    }),
    buildSimulation({
      id: "demo-simulado-002",
      config: { mode: "official", edition: year - 3, day: 1, areaIds: [], size: 90, foreignLanguage: "ingles", criteria: "balanced" },
      at: today.getTime() - 54 * DAY + 13 * 3600000,
      progress: 0.5,
      rng,
      completed: true,
      usage: 0.93,
      now,
    }),
    buildSimulation({
      id: "demo-simulado-003",
      config: { mode: "custom", edition: null, day: null, areaIds: ["linguagens", "humanas", "natureza", "matematica"], size: 45, foreignLanguage: "ingles", criteria: "weak" },
      at: today.getTime() - 31 * DAY + 9 * 3600000,
      progress: 0.7,
      rng,
      completed: true,
      usage: 0.88,
      now,
    }),
    buildSimulation({
      id: "demo-simulado-004",
      config: { mode: "official", edition: year - 2, day: 2, areaIds: [], size: 90, foreignLanguage: "ingles", criteria: "balanced" },
      at: today.getTime() - 10 * DAY + 13 * 3600000,
      progress: 0.9,
      rng,
      completed: true,
      usage: 0.96,
      now,
    }),
    buildSimulation({
      id: "demo-simulado-005",
      config: { mode: "custom", edition: null, day: null, areaIds: ["matematica"], size: 20, foreignLanguage: "ingles", criteria: "weak" },
      at: today.getTime() - 3 * DAY + 10 * 3600000,
      progress: 1,
      rng,
      completed: true,
      usage: 0.8,
      now,
    }),
    buildSimulation({
      id: "demo-simulado-interrompido",
      config: { mode: "custom", edition: null, day: null, areaIds: ["linguagens", "humanas"], size: 30, foreignLanguage: "espanhol", criteria: "balanced" },
      at: today.getTime() - 2 * DAY + 15 * 3600000,
      progress: 1,
      rng,
      completed: false,
      answeredCount: 12,
      usage: 0.42,
      now,
    }),
  ];

  account.practiceSessions = practice.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  account.simulations = sims;

  const records = collectAnswerRecords(account);
  const answeredIds = Array.from(new Set(records.map((r) => r.questionId)));
  const wrongIds = Array.from(new Set(records.filter((r) => !r.correct).map((r) => r.questionId)));
  account.favorites = sample(answeredIds, 7, rng);
  account.reviewMarks = sample(wrongIds, 5, rng);
  account.celebratedAchievements = evaluateAchievements({ records, account, now })
    .filter((a) => a.unlocked)
    .map((a) => a.id);

  return account;
}
