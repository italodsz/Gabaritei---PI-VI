"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { useAccount, useHydrated } from "@/hooks/useAccount";
import type { AccountData } from "@/types";

export type GateMode = "guest" | "onboarding" | "app";

/** Destino adequado para o estado atual da sessão demonstrativa. */
export function resolveHome(account: AccountData | null): string {
  if (!account) return "/entrar";
  if (account.onboarding.status === "pending") return "/onboarding";
  return "/inicio";
}

function allowed(mode: GateMode, account: AccountData | null): boolean {
  if (mode === "guest") return !account;
  if (!account) return false;
  if (mode === "onboarding") return account.onboarding.status === "pending";
  return account.onboarding.status !== "pending";
}

/**
 * Protege rotas no cliente após a hidratação do armazenamento local.
 * Enquanto decide, exibe uma tela de carregamento com a marca.
 */
export function AuthGate({ mode, children, fallback }: { mode: GateMode; children: React.ReactNode; fallback?: React.ReactNode }) {
  const hydrated = useHydrated();
  const account = useAccount();
  const router = useRouter();
  const ok = hydrated && allowed(mode, account);

  useEffect(() => {
    if (!hydrated || allowed(mode, account)) return;
    router.replace(resolveHome(account));
  }, [hydrated, mode, account, router]);

  if (!ok) return <>{fallback ?? <SplashScreen />}</>;
  return <>{children}</>;
}

export function SplashScreen({ label = "Carregando seus estudos…" }: { label?: string }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-5">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="rounded-[18px] shadow-lg"
        >
          <LogoMark size={64} animated />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm font-medium text-fg-muted"
        >
          {label}
        </motion.p>
      </div>
    </div>
  );
}
