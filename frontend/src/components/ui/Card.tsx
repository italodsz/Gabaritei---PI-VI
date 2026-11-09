"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { forwardRef } from "react";
import { fadeUp, spring } from "@/lib/animations";
import { cn } from "@/lib/utils/cn";

export type CardSurface = "default" | "muted" | "ink" | "gold" | "sage" | "coral" | "cream" | "outline";

const SURFACES: Record<CardSurface, string> = {
  default: "bg-surface border border-border shadow-sm",
  muted: "bg-surface-2 border border-transparent",
  ink: "bg-ink text-on-ink border border-ink-line shadow-lg",
  gold: "bg-gold text-on-gold border border-gold-strong/20",
  sage: "bg-sage-soft border border-sage/20 text-fg",
  coral: "bg-coral-soft border border-coral/20 text-fg",
  cream: "bg-surface border border-border shadow-sm",
  outline: "border border-dashed border-border-strong bg-transparent",
};

export interface CardProps extends HTMLMotionProps<"div"> {
  surface?: CardSurface;
  interactive?: boolean;
  padded?: boolean | "sm" | "lg";
  /** usa a variante fadeUp (para containers com stagger) */
  reveal?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { surface = "default", interactive, padded = true, reveal, className, children, ...rest },
  ref,
) {
  return (
    <motion.div
      ref={ref}
      variants={reveal ? fadeUp : undefined}
      whileHover={interactive ? { y: -4, transition: spring.snappy } : undefined}
      whileTap={interactive ? { scale: 0.99 } : undefined}
      className={cn(
        "relative rounded-[var(--radius-card)] transition-shadow duration-200",
        SURFACES[surface],
        padded === true && "p-6",
        padded === "sm" && "p-4",
        padded === "lg" && "p-8",
        interactive && "cursor-pointer hover:shadow-md",
        className,
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
});

export function CardHeader({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 flex items-start justify-between gap-4", className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon}
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold tracking-tight text-balance">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-fg-muted">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Ícone em "pílula" usado nos cabeçalhos dos cards. */
export function IconTile({
  children,
  tone = "neutral",
  size = "md",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "gold" | "sage" | "coral" | "ink" | "danger" | "success" | "linguagens" | "humanas" | "natureza" | "matematica";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-surface-2 text-fg",
    gold: "bg-gold-soft text-gold-fg",
    sage: "bg-sage-soft text-sage-strong",
    coral: "bg-coral-soft text-coral-strong",
    ink: "bg-ink text-on-ink",
    danger: "bg-danger-soft text-danger",
    success: "bg-success-soft text-success",
    linguagens: "bg-linguagens-soft text-linguagens-strong",
    humanas: "bg-humanas-soft text-humanas-strong",
    natureza: "bg-natureza-soft text-natureza-strong",
    matematica: "bg-matematica-soft text-matematica-strong",
  };
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center",
        size === "sm" && "size-8 rounded-xl [&_svg]:size-4",
        size === "md" && "size-10 rounded-2xl [&_svg]:size-[18px]",
        size === "lg" && "size-12 rounded-2xl [&_svg]:size-5",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
