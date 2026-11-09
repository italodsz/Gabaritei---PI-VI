/**
 * Tokens de movimento do Gabaritei.
 * Uma única fonte de durações, curvas e molas para manter a linguagem
 * de movimento consistente em toda a aplicação.
 */
import type { Transition } from "motion/react";

/** Durações em segundos. */
export const duration = {
  instant: 0.1,
  micro: 0.16,
  fast: 0.22,
  base: 0.28,
  slow: 0.36,
  page: 0.34,
  chart: 0.75,
  celebrate: 0.9,
} as const;

/** Intervalos de stagger em segundos. */
export const stagger = {
  tight: 0.04,
  base: 0.06,
  relaxed: 0.09,
} as const;

/** Curvas cúbicas. */
export const ease = {
  /** saída suave, padrão para entradas */
  out: [0.22, 1, 0.36, 1],
  /** ênfase: aceleração rápida, desaceleração longa */
  emphasized: [0.2, 0, 0, 1],
  inOut: [0.65, 0, 0.35, 1],
  in: [0.4, 0, 1, 1],
} as const satisfies Record<string, [number, number, number, number]>;

/** Molas nomeadas por intenção. */
export const spring = {
  /** pressionar, toggles, indicadores pequenos */
  snappy: { type: "spring", stiffness: 520, damping: 34, mass: 0.8 },
  /** indicadores compartilhados (layoutId) e mudanças de layout */
  layout: { type: "spring", stiffness: 380, damping: 36, mass: 0.9 },
  /** cards e painéis */
  soft: { type: "spring", stiffness: 260, damping: 30 },
  /** conquistas e celebrações — único lugar com rebote perceptível */
  bouncy: { type: "spring", stiffness: 420, damping: 16 },
  /** largura do menu lateral */
  sidebar: { type: "spring", stiffness: 340, damping: 38, mass: 0.9 },
} as const satisfies Record<string, Transition>;

export const transition = {
  micro: { duration: duration.micro, ease: ease.out },
  fast: { duration: duration.fast, ease: ease.out },
  base: { duration: duration.base, ease: ease.out },
  slow: { duration: duration.slow, ease: ease.emphasized },
  page: { duration: duration.page, ease: ease.emphasized },
} as const satisfies Record<string, Transition>;
