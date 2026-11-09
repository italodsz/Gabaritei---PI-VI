"use client";

import { useSyncExternalStore } from "react";

/** Resultado de uma media query, reativo e seguro para hidratação (false no servidor). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Abaixo de 1024px o layout troca painéis laterais por gavetas e o menu fica recolhido. */
export const NARROW_QUERY = "(max-width: 1023px)";
