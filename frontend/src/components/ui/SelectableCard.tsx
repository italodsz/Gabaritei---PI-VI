"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check } from "@/components/icons";
import { spring } from "@/lib/animations";
import { cn } from "@/lib/utils/cn";

/** Card de opção (rádio ou checkbox) com resposta animada à seleção. */
export function SelectableCard({
  selected,
  onSelect,
  children,
  role = "radio",
  className,
  disabled,
  indicator = "check",
}: {
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
  role?: "radio" | "checkbox";
  className?: string;
  disabled?: boolean;
  indicator?: "check" | "none";
}) {
  return (
    <motion.button
      type="button"
      role={role}
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={spring.snappy}
      className={cn(
        "relative w-full rounded-3xl border-2 p-5 text-left transition-[border-color,background-color,box-shadow] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50",
        selected ? "border-gold-strong bg-gold-soft/60 shadow-sm" : "border-border bg-surface hover:border-border-strong hover:shadow-sm",
        className,
      )}
    >
      {children}
      {indicator === "check" && (
        <span
          className={cn(
            "absolute top-4 right-4 grid size-6 place-items-center rounded-full border-2 transition-colors duration-200",
            selected ? "border-gold-strong bg-gold text-on-gold" : "border-border-strong",
          )}
          aria-hidden
        >
          <AnimatePresence>
            {selected && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={spring.bouncy}>
                <Check className="size-3.5" strokeWidth={3.5} />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      )}
    </motion.button>
  );
}
