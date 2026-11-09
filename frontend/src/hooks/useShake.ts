"use client";

import { useAnimate } from "motion/react";
import { useCallback } from "react";
import { shake } from "@/lib/animations";

/** Tremor horizontal para feedback de erro (sem remontar o elemento). */
export function useShake<T extends Element = HTMLDivElement>() {
  const [scope, animate] = useAnimate<T>();
  const trigger = useCallback(() => {
    if (scope.current) animate(scope.current, { x: shake.x }, shake.transition);
  }, [animate, scope]);
  return [scope, trigger] as const;
}
