import type { AlternativeLetter, AreaId, ExamDay, SubjectId } from "./content";
import type { PaletteId } from "@/lib/theme/palettes";

export type { PaletteId };

/* ------------------------------------------------------------------ */
/* Perfil e preferências                                               */
/* ------------------------------------------------------------------ */

export type AccountKind = "demo" | "new" | "registered";

export interface UserProfile {
  id: string;
  kind: AccountKind;
  name: string;
  nickname: string;
  email: string;
  school: string;
  city: string;
  bio: string;
  createdAt: string;
}

export type StudyGoalId =
  | "universidade_publica"
  | "bolsa_prouni"
  | "curso_especifico"
  | "treinar"
  | "reforcar_base";

export type ExperienceLevel = "iniciante" | "intermediario" | "avancado" | "treineiro";

export interface OnboardingPreferences {
  status: "pending" | "completed" | "skipped";
  goal: StudyGoalId | null;
  edition: number | null;
  difficultSubjects: SubjectId[];
  level: ExperienceLevel | null;
  finishedAt: string | null;
}

export interface StudyPreferences {
  /** Cronômetro visível ao iniciar listas de questões. */
  practiceTimer: boolean;
  /** Cronômetro visível ao iniciar simulados. */
  simulationTimer: boolean;
  /** Quantidade habitual de questões nas listas. */
  defaultQuestionCount: number;
}

export type GoalKind =
  | "weekly_questions"
  | "weekly_accuracy"
  | "weekly_study_days"
  | "monthly_simulations";

export interface PersonalGoal {
  kind: GoalKind;
  target: number;
  enabled: boolean;
}

/* ------------------------------------------------------------------ */
/* Sessões                                                             */
/* ------------------------------------------------------------------ */

/** Cronômetro baseado em tempo acumulado + instante da última retomada. */
export interface SessionClock {
  elapsedMs: number;
  /** epoch ms da última retomada; null quando pausado. */
  runningSince: number | null;
}

export interface PracticeAnswer {
  questionId: string;
  selected: AlternativeLetter | null;
  confirmed: boolean;
  correct: boolean | null;
  answeredAt: string | null;
  timeSpentMs: number;
}

export type PracticeMode = "custom" | "recommended" | "auto" | "retry" | "single" | "onboarding";

export interface PracticeFilters {
  subjectId: SubjectId | null;
  topicIds: string[];
  subtopicIds: string[];
  years: number[];
  count: number;
}

export interface PracticeSession {
  id: string;
  kind: "practice";
  mode: PracticeMode;
  title: string;
  createdAt: string;
  updatedAt: string;
  status: "in_progress" | "completed";
  completedAt: string | null;
  filters: PracticeFilters;
  questionIds: string[];
  answers: Record<string, PracticeAnswer>;
  currentIndex: number;
  clock: SessionClock;
  /** valor do cronômetro quando a questão atual passou a ser contabilizada */
  cursorElapsedMs: number;
  timerVisible: boolean;
}

export interface SimulationAnswer {
  questionId: string;
  selected: AlternativeLetter | null;
  answeredAt: string | null;
  timeSpentMs: number;
}

export type SimulationMode = "official" | "custom";
export type SimulationCriteria = "balanced" | "weak" | "random";

export interface SimulationSection {
  areaId: AreaId;
  label: string;
  /** índice inicial (inclusivo) e final (exclusivo) em questionIds */
  start: number;
  end: number;
  /** número exibido para a primeira questão da seção */
  firstNumber: number;
}

export interface SimulationConfig {
  mode: SimulationMode;
  edition: number | null;
  day: ExamDay | null;
  areaIds: AreaId[];
  size: number;
  foreignLanguage: "ingles" | "espanhol";
  criteria: SimulationCriteria;
  durationMs: number;
  includesEssay: boolean;
}

export interface SimulationSession {
  id: string;
  kind: "simulation";
  title: string;
  createdAt: string;
  updatedAt: string;
  status: "in_progress" | "completed";
  completedAt: string | null;
  finishReason: "manual" | "timeout" | null;
  config: SimulationConfig;
  questionIds: string[];
  sections: SimulationSection[];
  answers: Record<string, SimulationAnswer>;
  marked: string[];
  currentIndex: number;
  clock: SessionClock;
  /** valor do cronômetro quando a questão atual passou a ser contabilizada */
  cursorElapsedMs: number;
  timerHidden: boolean;
}

export type StudySession = PracticeSession | SimulationSession;

/* ------------------------------------------------------------------ */
/* Conta (todos os dados locais de um estudante)                       */
/* ------------------------------------------------------------------ */

export interface AccountData {
  schemaVersion: number;
  profile: UserProfile;
  onboarding: OnboardingPreferences;
  study: StudyPreferences;
  practiceSessions: PracticeSession[];
  simulations: SimulationSession[];
  favorites: string[];
  reviewMarks: string[];
  goals: PersonalGoal[];
  /** Conquistas cuja celebração já foi exibida. As conquistas em si são derivadas. */
  celebratedAchievements: string[];
}

export type ThemePreference = "light" | "dark" | "system";
export type MotionPreference = "system" | "reduced" | "full";

export interface DeviceSettings {
  theme: ThemePreference;
  motion: MotionPreference;
  palette: PaletteId;
  sidebarCollapsed: boolean;
}
