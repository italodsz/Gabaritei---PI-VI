"use client";

import { motion } from "motion/react";
import { useMemo } from "react";
import { useShouldReduceMotion } from "@/hooks/useMotionPreference";
import { createRng } from "@/lib/random";

const COLORS = ["var(--gold)", "var(--sage)", "var(--coral)", "var(--on-ink)", "var(--gold-strong)"];

/**
 * Explosão discreta de partículas (somente transform/opacity).
 * Desativada com movimento reduzido — o feedback permanece no conteúdo.
 */
export function ParticleBurst({ count = 18, radius = 110, seed = 1, className }: { count?: number; radius?: number; seed?: number; className?: string }) {
  const reduce = useShouldReduceMotion();
  const particles = useMemo(() => {
    const rng = createRng(seed);
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + rng() * 0.4;
      const dist = radius * (0.55 + rng() * 0.5);
      return {
        id: i,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        size: 5 + rng() * 6,
        color: COLORS[i % COLORS.length],
        rotate: rng() * 260 - 130,
        delay: rng() * 0.08,
        shape: i % 3 === 0 ? "rounded-sm" : "rounded-full",
      };
    });
  }, [count, radius, seed]);

  if (reduce) return null;

  return (
    <div className={`pointer-events-none absolute inset-0 grid place-items-center ${className ?? ""}`} aria-hidden>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className={`absolute ${p.shape}`}
          style={{ width: p.size, height: p.size, background: p.color }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.4, rotate: 0 }}
          animate={{ x: p.x, y: p.y, opacity: [0, 1, 1, 0], scale: [0.4, 1, 0.9, 0.6], rotate: p.rotate }}
          transition={{ duration: 0.95, delay: 0.12 + p.delay, ease: [0.16, 1, 0.3, 1], times: [0, 0.15, 0.7, 1] }}
        />
      ))}
    </div>
  );
}

/** Check desenhado progressivamente (confirmações e conclusões). */
export function AnimatedCheck({ size = 56, className, color = "currentColor", delay = 0 }: { size?: number; className?: string; color?: string; delay?: number }) {
  return (
    // EXCEÇÃO ao killer/svg-desenhado: o check é traçado com pathLength (motion), e o ícone do Lucide não expõe o path para animar.
    <svg width={size} height={size} viewBox="0 0 52 52" className={className} aria-hidden>
      <motion.circle
        cx="26"
        cy="26"
        r="23"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeOpacity={0.25}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d="M15 27 L23 34 L38 18"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: delay + 0.35, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}
