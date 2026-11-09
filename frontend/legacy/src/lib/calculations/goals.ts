import type { AccountData, GoalKind, PersonalGoal } from "@/types";
import { activityDays, recordsThisWeek, summarize } from "./stats";
import type { AnswerRecord } from "./records";

export const GOAL_META: Record<
  GoalKind,
  { title: string; unit: string; description: string; min: number; max: number; step: number; format: (n: number) => string }
> = {
  weekly_questions: {
    title: "Questões na semana",
    unit: "questões",
    description: "Quantidade de questões corrigidas de segunda a domingo.",
    min: 10,
    max: 400,
    step: 10,
    format: (n) => `${n}`,
  },
  weekly_accuracy: {
    title: "Acerto na semana",
    unit: "%",
    description: "Percentual de acerto nas questões da semana (mínimo de 10 respostas).",
    min: 40,
    max: 95,
    step: 5,
    format: (n) => `${Math.round(n)}%`,
  },
  weekly_study_days: {
    title: "Dias de estudo",
    unit: "dias",
    description: "Dias com pelo menos uma questão corrigida na semana.",
    min: 1,
    max: 7,
    step: 1,
    format: (n) => `${n}`,
  },
  monthly_simulations: {
    title: "Simulados no mês",
    unit: "simulados",
    description: "Simulados concluídos no mês corrente.",
    min: 1,
    max: 12,
    step: 1,
    format: (n) => `${n}`,
  },
};

export const DEFAULT_GOALS: PersonalGoal[] = [
  { kind: "weekly_questions", target: 60, enabled: true },
  { kind: "weekly_accuracy", target: 70, enabled: true },
  { kind: "weekly_study_days", target: 5, enabled: true },
  { kind: "monthly_simulations", target: 2, enabled: true },
];

export interface GoalProgress {
  goal: PersonalGoal;
  current: number;
  progress: number;
  done: boolean;
  /** quando a meta depende de um mínimo de dados ainda não atingido */
  pendingReason: string | null;
}

export function goalProgress(
  goal: PersonalGoal,
  records: AnswerRecord[],
  account: Pick<AccountData, "simulations">,
  now: number,
): GoalProgress {
  let current = 0;
  let pendingReason: string | null = null;
  const week = recordsThisWeek(records, now);
  switch (goal.kind) {
    case "weekly_questions":
      current = week.length;
      break;
    case "weekly_accuracy": {
      const s = summarize(week);
      current = Math.round(s.accuracy * 100);
      if (s.answered < 10) pendingReason = `Responda mais ${10 - s.answered} para medir`;
      break;
    }
    case "weekly_study_days":
      current = activityDays(week).size;
      break;
    case "monthly_simulations": {
      const ref = new Date(now);
      const monthStart = new Date(ref.getFullYear(), ref.getMonth(), 1).getTime();
      current = account.simulations.filter(
        (s) => s.status === "completed" && s.completedAt && new Date(s.completedAt).getTime() >= monthStart,
      ).length;
      break;
    }
  }
  const progress = pendingReason ? 0 : Math.min(1, current / goal.target);
  return { goal, current, progress, done: !pendingReason && current >= goal.target, pendingReason };
}
