"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Icon } from "@/components/icons";
import { useEffect, useId, useRef, useState } from "react";
import { popoverVariants } from "@/lib/animations";
import { cn } from "@/lib/utils/cn";

/** Menu suspenso acessível (role=menu) com navegação por setas. */
export function Menu({
  trigger,
  children,
  align = "end",
  side = "bottom",
  className,
  label,
}: {
  trigger: (props: { open: boolean; toggle: () => void; id: string; ref: React.Ref<HTMLButtonElement> }) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  align?: "start" | "end";
  side?: "bottom" | "top";
  className?: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const close = () => {
    setOpen(false);
    document.getElementById(id)?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? []);
        const idx = items.indexOf(document.activeElement as HTMLElement);
        const next = e.key === "ArrowDown" ? (idx + 1) % items.length : (idx - 1 + items.length) % items.length;
        items[next]?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    const raf = requestAnimationFrame(() => menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus());
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      {trigger({ open, toggle: () => setOpen((v) => !v), id, ref: triggerRef })}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            role="menu"
            aria-label={label}
            aria-labelledby={id}
            variants={popoverVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            style={{ transformOrigin: `${side === "bottom" ? "top" : "bottom"} ${align === "end" ? "right" : "left"}` }}
            className={cn(
              "absolute z-50 min-w-60 rounded-2xl border border-border bg-surface p-1.5 shadow-lg",
              side === "bottom" ? "top-[calc(100%+8px)]" : "bottom-[calc(100%+8px)]",
              align === "end" ? "right-0" : "left-0",
              className,
            )}
          >
            {children(close)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MenuItem({
  icon: Icon,
  children,
  onSelect,
  tone = "default",
  hint,
}: {
  icon?: Icon;
  children: React.ReactNode;
  onSelect: () => void;
  tone?: "default" | "danger";
  hint?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium outline-none transition-colors focus-visible:bg-surface-2",
        tone === "danger" ? "text-danger hover:bg-danger-soft" : "text-fg hover:bg-surface-2",
      )}
    >
      {Icon && (
        <Icon
          className={cn("size-[18px] transition-colors duration-150 group-hover:text-fg", tone === "danger" ? "" : "text-fg-muted")}
          aria-hidden
        />
      )}
      <span className="flex-1">{children}</span>
      {hint}
    </button>
  );
}

export function MenuSeparator() {
  return <div className="my-1.5 h-px bg-border" role="separator" />;
}
