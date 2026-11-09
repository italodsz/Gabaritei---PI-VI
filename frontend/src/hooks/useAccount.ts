"use client";

import { useMemo } from "react";
import type { AccountData } from "@/types";
import { useAppStore } from "@/stores/appStore";
import { collectAnswerRecords, type AnswerRecord } from "@/lib/calculations/records";

export function useHydrated(): boolean {
  return useAppStore((s) => s.hydrated);
}

export function useAccount(): AccountData | null {
  return useAppStore((s) => (s.activeAccountId ? (s.accounts[s.activeAccountId] ?? null) : null));
}

/** Para telas protegidas pelo AuthGate: a conta sempre existe. */
export function useActiveAccount(): AccountData {
  const account = useAccount();
  if (!account) throw new Error("Conta ativa ausente — a tela deve estar dentro do AuthGate.");
  return account;
}

/** Registros de respostas derivados das sessões (memoizados). */
export function useRecords(account: Pick<AccountData, "practiceSessions" | "simulations"> | null): AnswerRecord[] {
  const practice = account?.practiceSessions;
  const sims = account?.simulations;
  return useMemo(
    () => (practice && sims ? collectAnswerRecords({ practiceSessions: practice, simulations: sims }) : []),
    [practice, sims],
  );
}
