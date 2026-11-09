"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "@/components/icons";
import { useEffect, useId, useRef, useState } from "react";
import { popoverVariants, spring } from "@/lib/animations";
import { cn } from "@/lib/utils/cn";

export interface SelectOption<T extends string | number> {
  value: T;
  label: string;
  description?: string;
  leading?: React.ReactNode;
}

/** Seletor personalizado com lista acessível (role=listbox) e navegação por teclado. */
export function Select<T extends string | number>({
  value,
  onChange,
  options,
  placeholder = "Selecione",
  id,
  className,
  ariaLabel,
  invalid,
}: {
  value: T | null;
  onChange: (v: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  id?: string;
  className?: string;
  ariaLabel?: string;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const openList = () => {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      openList();
      return;
    }
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const o = options[active];
      if (o) onChange(o.value);
      setOpen(false);
    } else if (e.key === "Tab") setOpen(false);
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={cn(
          "flex h-12 w-full items-center gap-3 rounded-2xl border bg-surface pr-3 pl-4 text-left text-[15px] transition-[border-color,box-shadow] duration-200 outline-none focus-visible:border-gold-strong focus-visible:shadow-[0_0_0_4px_var(--gold-soft)]",
          open ? "border-gold-strong shadow-[0_0_0_4px_var(--gold-soft)]" : invalid ? "border-danger" : "border-border hover:border-border-strong",
        )}
      >
        {selected?.leading}
        <span className={cn("min-w-0 flex-1 truncate", !selected && "text-fg-subtle")}>{selected?.label ?? placeholder}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={spring.snappy} className="text-fg-subtle">
          <ChevronDown className="size-4" aria-hidden />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            id={listId}
            role="listbox"
            variants={popoverVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            style={{ transformOrigin: "top" }}
            className="absolute inset-x-0 top-[calc(100%+6px)] z-50 max-h-72 overflow-y-auto rounded-2xl border border-border bg-surface p-1.5 shadow-lg"
          >
            {options.map((o, i) => {
              const isSel = o.value === value;
              return (
                <li
                  key={String(o.value)}
                  role="option"
                  data-index={i}
                  aria-selected={isSel}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    i === active ? "bg-surface-2" : "",
                    isSel ? "font-semibold text-fg" : "text-fg-muted",
                  )}
                >
                  {o.leading}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{o.label}</span>
                    {o.description && <span className="block text-xs font-normal text-fg-subtle">{o.description}</span>}
                  </span>
                  {isSel && <Check className="size-4 text-gold-fg" aria-hidden />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
