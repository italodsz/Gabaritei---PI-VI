"use client";

import { useEffect, useRef } from "react";

type Handler = (event: KeyboardEvent) => void;

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

/** Atalhos de teclado simples, ignorados enquanto o usuário digita. */
export function useHotkeys(map: Record<string, Handler>, enabled = true) {
  const ref = useRef(map);
  useEffect(() => {
    ref.current = map;
  });
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const combo = [e.ctrlKey || e.metaKey ? "mod" : "", e.shiftKey ? "shift" : "", e.key.toLowerCase()].filter(Boolean).join("+");
      const handler = ref.current[combo] ?? (!e.ctrlKey && !e.metaKey && !e.altKey ? ref.current[e.key.toLowerCase()] : undefined);
      if (!handler) return;
      if (!combo.startsWith("mod") && isTyping(e.target)) return;
      handler(e);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);
}
