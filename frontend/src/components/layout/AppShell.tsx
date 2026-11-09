"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { AuthGate } from "./AuthGate";
import { Sidebar } from "@/components/navigation/Sidebar";
import { Topbar } from "@/components/navigation/Topbar";
import { PageTransition } from "@/components/animations/Motion";
import { AchievementWatcher } from "@/components/gamification/AchievementWatcher";
import { AppShellSkeleton } from "./Skeletons";

/**
 * Layout persistente das áreas principais: o menu e a barra superior
 * permanecem montados; apenas o conteúdo principal transiciona.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate mode="app" fallback={<AppShellSkeleton />}>
      <ShellInner>{children}</ShellInner>
    </AuthGate>
  );
}

function ShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="flex min-h-dvh">
      <a href="#conteudo" className="sr-only z-[90] rounded-xl bg-primary px-4 py-2 text-on-primary focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Pular para o conteúdo
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main id="conteudo" className="flex-1">
          <PageTransition key={pathname} className="mx-auto w-full max-w-[1320px] px-4 pt-6 pb-16 sm:px-6 lg:px-8 lg:pt-8">
            {children}
          </PageTransition>
        </main>
      </div>
      <AchievementWatcher />
    </div>
  );
}
