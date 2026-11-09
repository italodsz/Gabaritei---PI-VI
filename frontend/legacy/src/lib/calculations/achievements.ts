import type { AccountData } from "@/types";
import { QUESTION_BY_ID } from "@/data/fixtures/questions";
import type { AnswerRecord } from "./records";
import { computeStreak } from "./stats";
import { dayKey } from "@/lib/format";

export type MedalTier = "bronze" | "prata" | "ouro";

export type AchievementIcon =
  | "footprints"
  | "flame"
  | "target"
  | "trophy"
  | "mountain"
  | "compass"
  | "crosshair"
  | "rotate"
  | "sparkles"
  | "calendar"
  | "medal"
  | "zap";

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  rule: string;
  icon: AchievementIcon;
  tier: MedalTier;
}

export interface AchievementState extends AchievementDefinition {
  current: number;
  target: number;
  progress: number;
  unlocked: boolean;
  unlockedAt: number | null;
}

interface Context {
  records: AnswerRecord[];
  account: Pick<AccountData, "practiceSessions" | "simulations">;
  now: number;
}

interface Evaluated {
  current: number;
  target: number;
  unlockedAt: number | null;
}

/** Momento em que a contagem cumulativa atingiu `target`. */
function countMilestone(records: AnswerRecord[], target: number): Evaluated {
  return {
    current: Math.min(records.length, target),
    target,
    unlockedAt: records.length >= target ? records[target - 1].answeredAt : null,
  };
}

/** Maior sequência de dias e a data em que `target` foi atingido. */
function streakMilestone(records: AnswerRecord[], target: number, now: number): Evaluated {
  const firstOfDay = new Map<string, number>();
  for (const r of records) {
    const k = dayKey(r.answeredAt);
    if (!firstOfDay.has(k)) firstOfDay.set(k, r.answeredAt);
  }
  const days = Array.from(firstOfDay.entries()).sort((a, b) => a[1] - b[1]);
  let run = 0;
  let prev: Date | null = null;
  let reachedAt: number | null = null;
  for (const [, ts] of days) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    if (prev) {
      const next = new Date(prev);
      next.setDate(next.getDate() + 1);
      run = next.getTime() === d.getTime() ? run + 1 : 1;
    } else run = 1;
    prev = d;
    if (run >= target && reachedAt === null) reachedAt = ts;
  }
  const best = computeStreak(records, now).best;
  return { current: Math.min(best, target), target, unlockedAt: reachedAt };
}

const DEFINITIONS: (AchievementDefinition & { evaluate: (c: Context) => Evaluated })[] = [
  {
    id: "primeiro-passo",
    title: "Primeiro passo",
    description: "Você corrigiu sua primeira questão.",
    rule: "Responder e confirmar 1 questão",
    icon: "footprints",
    tier: "bronze",
    evaluate: ({ records }) => countMilestone(records, 1),
  },
  {
    id: "embalo",
    title: "Embalo",
    description: "50 questões corrigidas. O ritmo está criado.",
    rule: "Corrigir 50 questões",
    icon: "zap",
    tier: "bronze",
    evaluate: ({ records }) => countMilestone(records, 50),
  },
  {
    id: "centena",
    title: "Centena",
    description: "100 questões resolvidas com dedicação.",
    rule: "Corrigir 100 questões",
    icon: "target",
    tier: "prata",
    evaluate: ({ records }) => countMilestone(records, 100),
  },
  {
    id: "maratonista",
    title: "Maratonista",
    description: "1.500 questões! Persistência de quem vai longe.",
    rule: "Corrigir 1.500 questões",
    icon: "mountain",
    tier: "ouro",
    evaluate: ({ records }) => countMilestone(records, 1500),
  },
  {
    id: "constancia",
    title: "Constância",
    description: "Três dias seguidos de estudo.",
    rule: "Estudar 3 dias consecutivos",
    icon: "flame",
    tier: "bronze",
    evaluate: ({ records, now }) => streakMilestone(records, 3, now),
  },
  {
    id: "semana-completa",
    title: "Semana completa",
    description: "Sete dias seguidos de prática.",
    rule: "Estudar 7 dias consecutivos",
    icon: "calendar",
    tier: "prata",
    evaluate: ({ records, now }) => streakMilestone(records, 7, now),
  },
  {
    id: "habito",
    title: "Hábito formado",
    description: "Trinta dias seguidos. Estudar já faz parte da rotina.",
    rule: "Estudar 30 dias consecutivos",
    icon: "sparkles",
    tier: "ouro",
    evaluate: ({ records, now }) => streakMilestone(records, 30, now),
  },
  {
    id: "estreia",
    title: "Estreia",
    description: "Primeiro simulado concluído.",
    rule: "Concluir 1 simulado",
    icon: "medal",
    tier: "bronze",
    evaluate: ({ account }) => {
      const done = account.simulations
        .filter((s) => s.status === "completed" && s.completedAt)
        .map((s) => new Date(s.completedAt!).getTime())
        .sort((a, b) => a - b);
      return { current: Math.min(done.length, 1), target: 1, unlockedAt: done[0] ?? null };
    },
  },
  {
    id: "prova-de-fogo",
    title: "Prova de fogo",
    description: "Um simulado completo de 90 questões até o fim.",
    rule: "Concluir um simulado de 90 questões",
    icon: "trophy",
    tier: "ouro",
    evaluate: ({ account }) => {
      const full = account.simulations
        .filter((s) => s.status === "completed" && s.questionIds.length >= 90 && s.completedAt)
        .map((s) => new Date(s.completedAt!).getTime())
        .sort((a, b) => a - b);
      const biggest = Math.max(0, ...account.simulations.filter((s) => s.status === "completed").map((s) => s.questionIds.length));
      return { current: Math.min(biggest, 90), target: 90, unlockedAt: full[0] ?? null };
    },
  },
  {
    id: "alta-performance",
    title: "Alta performance",
    description: "70% de acerto em um simulado com pelo menos 20 questões.",
    rule: "Acertar 70% em um simulado (20+ questões)",
    icon: "crosshair",
    tier: "prata",
    evaluate: ({ account }) => {
      let best = 0;
      let at: number | null = null;
      for (const s of account.simulations) {
        if (s.status !== "completed" || s.questionIds.length < 20 || !s.completedAt) continue;
        const correct = s.questionIds.filter((id) => s.answers[id]?.selected === QUESTION_BY_ID[id]?.correct).length;
        const acc = correct / s.questionIds.length;
        best = Math.max(best, acc);
        const t = new Date(s.completedAt).getTime();
        if (acc >= 0.7 && (at === null || t < at)) at = t;
      }
      return { current: Math.round(best * 100), target: 70, unlockedAt: at };
    },
  },
  {
    id: "gabaritou",
    title: "Gabaritou!",
    description: "Uma lista inteira sem nenhum erro.",
    rule: "Acertar 100% de uma lista com 5+ questões",
    icon: "sparkles",
    tier: "prata",
    evaluate: ({ account }) => {
      let at: number | null = null;
      for (const s of account.practiceSessions) {
        if (s.status !== "completed" || s.questionIds.length < 5 || !s.completedAt) continue;
        const allRight = s.questionIds.every((id) => s.answers[id]?.correct === true);
        const t = new Date(s.completedAt).getTime();
        if (allRight && (at === null || t < at)) at = t;
      }
      return { current: at ? 1 : 0, target: 1, unlockedAt: at };
    },
  },
  {
    id: "explorador",
    title: "Explorador",
    description: "Questões nas quatro áreas do ENEM.",
    rule: "Responder questões das 4 áreas",
    icon: "compass",
    tier: "bronze",
    evaluate: ({ records }) => {
      const seen = new Set<string>();
      let at: number | null = null;
      for (const r of records) {
        seen.add(r.areaId);
        if (seen.size === 4 && at === null) at = r.answeredAt;
      }
      return { current: seen.size, target: 4, unlockedAt: at };
    },
  },
  {
    id: "revisor",
    title: "Revisor",
    description: "Dez questões erradas refeitas — é assim que se aprende.",
    rule: "Refazer 10 questões erradas",
    icon: "rotate",
    tier: "bronze",
    evaluate: ({ account }) => {
      const times: number[] = [];
      for (const s of account.practiceSessions) {
        if (s.mode !== "retry") continue;
        for (const id of s.questionIds) {
          const a = s.answers[id];
          if (a?.confirmed && a.answeredAt) times.push(new Date(a.answeredAt).getTime());
        }
      }
      times.sort((a, b) => a - b);
      return { current: Math.min(times.length, 10), target: 10, unlockedAt: times.length >= 10 ? times[9] : null };
    },
  },
];

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = DEFINITIONS.map((d) => ({
  id: d.id,
  title: d.title,
  description: d.description,
  rule: d.rule,
  icon: d.icon,
  tier: d.tier,
}));

export function evaluateAchievements(ctx: Context): AchievementState[] {
  return DEFINITIONS.map(({ evaluate, ...def }) => {
    const e = evaluate(ctx);
    const unlocked = e.unlockedAt !== null;
    return {
      ...def,
      current: e.current,
      target: e.target,
      progress: unlocked ? 1 : Math.min(1, e.current / e.target),
      unlocked,
      unlockedAt: e.unlockedAt,
    };
  });
}
