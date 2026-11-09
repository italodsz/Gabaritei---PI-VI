"use client";

import { useEffect, useState } from "react";

/**
 * Instante atual atualizado em intervalo — evita chamar Date.now() durante
 * a renderização e mantém relógios/estatísticas sincronizados.
 */
export function useNow(intervalMs = 60000, enabled = true): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    const tick = () => setNow(Date.now());
    const id = window.setInterval(tick, intervalMs);
    const raf = window.requestAnimationFrame(tick);
    return () => {
      window.clearInterval(id);
      window.cancelAnimationFrame(raf);
    };
  }, [intervalMs, enabled]);
  return now;
}
