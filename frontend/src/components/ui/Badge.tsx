"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check } from "@/components/icons";
import type { AreaId } from "@/types";
import { spring } from "@/lib/animations";
import { cn } from "@/lib/utils/cn";

export type BadgeTone = "neutral" | "gold" | "sage" | "coral" | "success" | "danger" | "warning" | "ink" | "outline" | AreaId;

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-fg-muted",
  gold: "bg-gold-soft text-gold-fg",
  sage: "bg-sage-soft text-sage-strong",
  coral: "bg-coral-soft text-coral-strong",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  ink: "bg-ink text-on-ink",
  outline: "border border-border text-fg-muted",
  linguagens: "bg-linguagens-soft text-linguagens-strong",
  humanas: "bg-humanas-soft text-humanas-strong",
  natureza: "bg-natureza-soft text-natureza-strong",
  matematica: "bg-matematica-soft text-matematica-strong",
};

export function Badge({
  tone = "neutral",
  icon,
  children,
  className,
  size = "md",
}: {
  tone?: BadgeTone;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full min-w-0 items-center gap-1 rounded-full font-semibold whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0",
        size === "md" ? "h-7 px-2.5 text-xs" : "h-6 px-2 text-[11px]",
        TONES[tone],
        className,
      )}
    >
      {icon}
      <span className="truncate">{children}</span>
    </span>
  );
}

/** Chip selecionável (filtros, matérias, opções). */
export function Chip({
  selected,
  onToggle,
  children,
  disabled,
  tone = "gold",
  className,
  icon,
}: {
  selected: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  tone?: "gold" | "ink";
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={selected}
      disabled={disabled}
      onClick={onToggle}
      whileTap={{ scale: 0.95 }}
      transition={spring.snappy}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-colors duration-200 disabled:opacity-40",
        selected
          ? tone === "gold"
            ? "border-gold-strong/40 bg-gold-soft text-fg"
            : "border-primary bg-primary text-on-primary"
          : "border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg",
        className,
      )}
    >
      <AnimatePresence initial={false}>
        {selected && (
          <motion.span
            initial={{ width: 0, opacity: 0, scale: 0.5 }}
            animate={{ width: "auto", opacity: 1, scale: 1 }}
            exit={{ width: 0, opacity: 0, scale: 0.5 }}
            transition={spring.snappy}
            className="inline-flex overflow-hidden"
          >
            <Check className="size-3.5" strokeWidth={3} aria-hidden />
          </motion.span>
        )}
      </AnimatePresence>
      {!selected && icon}
      {children}
    </motion.button>
  );
}

export function Kbd({ children, className, ...rest }: { children: React.ReactNode; className?: string; "aria-label"?: string }) {
  return (
    <kbd
      {...rest}
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-border bg-surface px-1 font-sans text-[11px] font-semibold text-fg-subtle shadow-xs",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
