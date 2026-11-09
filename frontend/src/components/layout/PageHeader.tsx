"use client";

import { motion } from "motion/react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils/cn";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.header
      variants={staggerContainer(0.06)}
      initial="hidden"
      animate="show"
      className={cn("mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4", className)}
    >
      <div className="min-w-0 max-w-2xl">
        {eyebrow && (
          <motion.p variants={fadeUp} className="mb-2 text-xs font-bold tracking-[0.1em] text-gold-fg uppercase">
            {eyebrow}
          </motion.p>
        )}
        <motion.h1 variants={fadeUp} className="font-display text-[2rem] leading-tight font-bold tracking-[-0.025em] text-balance">
          {title}
        </motion.h1>
        {description && (
          <motion.p variants={fadeUp} className="mt-2 text-[15px] leading-relaxed text-fg-muted">
            {description}
          </motion.p>
        )}
      </div>
      {actions && (
        <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2.5">
          {actions}
        </motion.div>
      )}
    </motion.header>
  );
}
