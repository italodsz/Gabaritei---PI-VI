import type { Variants } from "motion/react";
import { duration, ease, spring, stagger } from "./tokens";

/** Entrada da área principal ao trocar de página. */
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 14 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.page, ease: ease.emphasized },
  },
  exit: { opacity: 0, y: -8, transition: { duration: duration.fast, ease: ease.in } },
};

/** Container que escalona os filhos. */
export const staggerContainer = (gap: number = stagger.base, delay = 0.04): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.out } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: duration.base, ease: ease.out } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: spring.soft },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  show: { opacity: 1, x: 0, transition: { duration: duration.slow, ease: ease.out } },
};

/** Etapas direcionais (onboarding, questões): `custom` = direção (1 ou -1). */
export const directionalSlide: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 48 }),
  center: { opacity: 1, x: 0, transition: { duration: duration.slow, ease: ease.emphasized } },
  exit: (dir: number) => ({ opacity: 0, x: dir * -36, transition: { duration: duration.fast, ease: ease.in } }),
};

/** Variante contida usada durante simulados (preserva concentração). */
export const quietSlide: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 14 }),
  center: { opacity: 1, x: 0, transition: { duration: duration.fast, ease: ease.out } },
  exit: (dir: number) => ({ opacity: 0, x: dir * -10, transition: { duration: duration.micro, ease: ease.in } }),
};

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: duration.base, ease: ease.out } },
  exit: { opacity: 0, transition: { duration: duration.fast, ease: ease.in } },
};

export const modalVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: spring.soft },
  exit: { opacity: 0, y: 10, scale: 0.98, transition: { duration: duration.fast, ease: ease.in } },
};

export const popoverVariants: Variants = {
  hidden: { opacity: 0, y: -6, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: duration.fast, ease: ease.out } },
  exit: { opacity: 0, y: -4, scale: 0.98, transition: { duration: duration.micro, ease: ease.in } },
};

export const toastVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: spring.soft },
  exit: { opacity: 0, x: 40, transition: { duration: duration.fast, ease: ease.in } },
};

/** Feedback de erro: tremor horizontal curto. */
export const shake = {
  x: [0, -7, 6, -4, 3, 0],
  transition: { duration: 0.42, ease: ease.out },
};

/** Feedback de acerto: pulso de escala. */
export const pop = {
  scale: [1, 1.035, 1],
  transition: { duration: 0.38, ease: ease.out },
};

/** Medalhas e conquistas. */
export const medalReveal: Variants = {
  hidden: { opacity: 0, scale: 0.4, rotate: -24 },
  show: { opacity: 1, scale: 1, rotate: 0, transition: { ...spring.bouncy, delay: 0.1 } },
};

/** Hover/press padrão de cards interativos. */
export const cardHover = { y: -3, transition: spring.snappy };
export const cardPress = { scale: 0.985, transition: spring.snappy };
export const buttonPress = { scale: 0.97 };
