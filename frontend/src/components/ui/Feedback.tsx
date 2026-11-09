"use client";

import { AnimatePresence, motion } from "motion/react";
import { fadeUp, spring } from "@/lib/animations";
import { cn } from "@/lib/utils/cn";
import { initials } from "@/lib/format";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-2xl", className)} aria-hidden />;
}

/** Estado vazio com ilustração, mensagem e próxima ação. */
export function EmptyState({
  illustration,
  title,
  description,
  action,
  className,
  compact,
}: {
  illustration?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className={cn("flex flex-col items-center text-center", compact ? "gap-3 py-8" : "gap-4 py-14", className)}
    >
      {illustration && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...spring.soft, delay: 0.08 }}>
          {illustration}
        </motion.div>
      )}
      <div className="max-w-sm">
        <h3 className="font-display text-lg font-semibold tracking-tight">{title}</h3>
        {description && <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{description}</p>}
      </div>
      {action && <div className="mt-1 flex flex-wrap justify-center gap-2.5">{action}</div>}
    </motion.div>
  );
}

/** Painel recolhível com animação de altura. */
export function Collapse({ open, children, className }: { open: boolean; children: React.ReactNode; className?: string }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ height: spring.soft, opacity: { duration: 0.2 } }}
          className={cn("overflow-hidden", className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Avatar({ name, size = 40, className }: { name: string; size?: number; className?: string }) {
  return (
    <span
      className={cn("grid shrink-0 place-items-center rounded-full bg-gold font-display font-bold text-on-gold ring-2 ring-surface", className)}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

/** Rótulo de seção com linha decorativa. */
export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-xs font-bold tracking-[0.08em] text-fg-subtle uppercase", className)}>{children}</p>;
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span className={cn("inline-block size-5 rounded-full border-2 border-current border-t-transparent", className)} style={{ animation: "spin-slow 0.8s linear infinite" }} aria-hidden />
  );
}
