"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { PracticeFilters, PracticeMode } from "@/types";
import { useAppStore } from "@/stores/appStore";
import { createPracticeSession, EMPTY_FILTERS } from "@/lib/sessions/factory";

/** Cria uma lista de prática na conta ativa e navega para a resolução. */
export function useStartPractice() {
  const router = useRouter();
  const addPractice = useAppStore((s) => s.addPractice);

  return useCallback(
    (input: { mode: PracticeMode; title: string; questionIds: string[]; filters?: Partial<PracticeFilters> }) => {
      if (!input.questionIds.length) return null;
      const state = useAppStore.getState();
      const account = state.activeAccountId ? state.accounts[state.activeAccountId] : null;
      const session = createPracticeSession({
        mode: input.mode,
        title: input.title,
        questionIds: input.questionIds,
        filters: { ...EMPTY_FILTERS, ...input.filters, count: input.questionIds.length },
        timerVisible: account?.study.practiceTimer ?? true,
        now: Date.now(),
      });
      addPractice(session);
      router.push(`/questoes/sessao/${session.id}`);
      return session.id;
    },
    [addPractice, router],
  );
}
