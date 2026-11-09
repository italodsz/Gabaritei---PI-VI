"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils/cn";

/**
 * Marca do Gabaritei: um "G" aberto cujo traço é completado por um check
 * dourado que escapa pela abertura — acerto e evolução.
 */
export function LogoMark({
  size = 40,
  variant = "badge",
  animated = false,
  className,
}: {
  size?: number;
  /** badge: fundo grafite · plain-dark: para superfícies escuras · plain-light: para superfícies claras */
  variant?: "badge" | "plain-dark" | "plain-light";
  animated?: boolean;
  className?: string;
}) {
  const ring = variant === "plain-light" ? "var(--ink)" : "var(--on-ink)";
  const draw = animated
    ? { initial: { pathLength: 0, opacity: 0 }, animate: { pathLength: 1, opacity: 1 } }
    : { initial: false as const };
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={cn("shrink-0", className)} aria-hidden>
      {variant === "badge" && (
        <>
          <defs>
            <linearGradient id="gb-badge" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" style={{ stopColor: "var(--ink-3)" }} />
              <stop offset="1" style={{ stopColor: "var(--ink)" }} />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="14" fill="url(#gb-badge)" />
          <rect x="0.5" y="0.5" width="47" height="47" rx="13.5" fill="none" style={{ stroke: "var(--on-ink)" }} strokeOpacity="0.08" />
        </>
      )}
      <motion.path
        d="M 32.4 13.6 A 13 13 0 1 0 37 25.5"
        fill="none"
        style={{ stroke: ring }}
        strokeWidth="4.6"
        strokeLinecap="round"
        {...draw}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d="M 18.2 23.6 L 23.2 28.6 L 37.6 13.4"
        fill="none"
        style={{ stroke: "var(--gold)" }}
        strokeWidth="4.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...draw}
        transition={{ duration: 0.55, delay: animated ? 0.45 : 0, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

export function Logo({
  size = 36,
  tone = "auto",
  className,
  animated,
}: {
  size?: number;
  tone?: "auto" | "light" | "dark";
  className?: string;
  animated?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} animated={animated} />
      <span className="sr-only">Gabaritei</span>
      <span
        aria-hidden
        className={cn(
          "font-display text-[1.35rem] leading-none font-bold tracking-[-0.03em]",
          tone === "light" && "text-on-ink",
          tone === "dark" && "text-ink",
          tone === "auto" && "text-fg",
        )}
      >
        Gabarite<span className="relative">ı<span className="absolute -top-[0.02em] left-1/2 size-[0.2em] -translate-x-1/2 rounded-full bg-gold" aria-hidden /></span>
      </span>
    </span>
  );
}
