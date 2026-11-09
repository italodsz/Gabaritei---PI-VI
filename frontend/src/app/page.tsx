"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SplashScreen, resolveHome } from "@/components/layout/AuthGate";
import { useAccount, useHydrated } from "@/hooks/useAccount";

/** Ponto de entrada: decide entre autenticação, onboarding e Início. */
export default function RootPage() {
  const hydrated = useHydrated();
  const account = useAccount();
  const router = useRouter();
  useEffect(() => {
    if (hydrated) router.replace(resolveHome(account));
  }, [hydrated, account, router]);
  return <SplashScreen />;
}
