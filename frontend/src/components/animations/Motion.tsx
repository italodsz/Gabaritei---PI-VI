"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { fadeUp, pageVariants, staggerContainer } from "@/lib/animations";

/** Envolve o conteúdo principal de cada página (montado via template.tsx). */
export function PageTransition({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="enter" className={className}>
      {children}
    </motion.div>
  );
}

/** Container que revela os filhos (<Reveal>) em sequência. */
export function Stagger({
  children,
  gap,
  delay,
  className,
  as = "div",
  ...rest
}: { children: React.ReactNode; gap?: number; delay?: number; className?: string; as?: "div" | "ul" | "section" } & Omit<
  HTMLMotionProps<"div">,
  "children"
>) {
  const Comp = as === "ul" ? motion.ul : as === "section" ? motion.section : motion.div;
  return (
    <Comp variants={staggerContainer(gap, delay)} initial="hidden" animate="show" className={className} {...(rest as object)}>
      {children}
    </Comp>
  );
}

export function Reveal({ children, className, as = "div", ...rest }: { children: React.ReactNode; className?: string; as?: "div" | "li" } & Omit<HTMLMotionProps<"div">, "children">) {
  const Comp = as === "li" ? motion.li : motion.div;
  return (
    <Comp variants={fadeUp} className={className} {...(rest as object)}>
      {children}
    </Comp>
  );
}

/** Revela ao entrar na viewport (seções abaixo da dobra). */
export function InView({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
