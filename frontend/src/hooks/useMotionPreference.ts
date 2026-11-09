"use client";

import { useReducedMotion } from "motion/react";
import { useAppStore } from "@/stores/appStore";

/**
 * true quando o movimento deve ser reduzido: preferência interna
 * ("reduzir") ou configuração do sistema (no modo "sistema").
 */
export function useShouldReduceMotion(): boolean {
  const pref = useAppStore((s) => s.device.motion);
  const system = useReducedMotion();
  if (pref === "reduced") return true;
  if (pref === "full") return false;
  return !!system;
}
