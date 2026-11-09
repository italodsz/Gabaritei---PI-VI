"use client";

import { useMemo } from "react";
import type { AccountData } from "@/types";
import { useRecords } from "@/hooks/useAccount";
import {
  buildSeries,
  computeStreak,
  frequentSubjects,
  goalProgress,
  summarize,
  wrongQuestionIds,
} from "@/lib/calculations";
import { recommendTopics } from "@/lib/recommendations/engine";

/** Dados derivados da página Início — tudo calculado a partir das sessões. */
export function useHomeData(account: AccountData, now: number) {
  const records = useRecords(account);
  return useMemo(() => {
    const summary = summarize(records);
    const streak = computeStreak(records, now);
    const series = buildSeries(records, "day", now);
    const recommendations = recommendTopics({ records, difficultSubjects: account.onboarding.difficultSubjects, now, limit: 4 });
    const weeklyGoal = account.goals.find((g) => g.kind === "weekly_questions" && g.enabled);
    const goal = weeklyGoal ? goalProgress(weeklyGoal, records, account, now) : null;
    const inProgressPractice = account.practiceSessions
      .filter((s) => s.status === "in_progress")
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const inProgressSims = account.simulations.filter((s) => s.status === "in_progress").sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const wrong = wrongQuestionIds(records);
    const frequent = frequentSubjects(records, 4);
    return { records, summary, streak, series, recommendations, goal, inProgressPractice, inProgressSims, wrong, frequent };
  }, [records, account, now]);
}
