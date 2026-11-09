"use client";

import { MotionConfig } from "motion/react";
import { useAppStore } from "@/stores/appStore";
import { transition } from "@/lib/animations";

/**
 * Configuração global do Motion. Com movimento reduzido, o Motion desativa
 * animações de transform/layout e mantém opacidade e cores — o feedback de
 * estado continua visível.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const pref = useAppStore((s) => s.device.motion);
  const reducedMotion = pref === "reduced" ? "always" : pref === "full" ? "never" : "user";
  return (
    <MotionConfig reducedMotion={reducedMotion} transition={transition.base}>
      {children}
    </MotionConfig>
  );
}
