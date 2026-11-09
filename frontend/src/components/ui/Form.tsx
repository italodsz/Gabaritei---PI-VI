"use client";

import { AnimatePresence, motion } from "motion/react";
import { CircleAlert, Eye, EyeOff, type Icon } from "@/components/icons";
import { forwardRef, useId, useState } from "react";
import { spring } from "@/lib/animations";
import { cn } from "@/lib/utils/cn";

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => React.ReactNode;
  className?: string;
  optional?: boolean;
}

export function Field({ label, hint, error, children, className, optional }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="flex items-center justify-between text-[13px] font-semibold text-fg">
        {label}
        {optional && <span className="text-xs font-normal text-fg-subtle">opcional</span>}
      </label>
      {children({ id, describedBy, invalid: !!error })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-fg-subtle">
          {hint}
        </p>
      )}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={errorId}
            role="alert"
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-1.5 overflow-hidden text-xs font-medium text-danger"
          >
            <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputBase =
  "w-full rounded-2xl border bg-surface text-[15px] text-fg placeholder:text-fg-subtle outline-none transition-[border-color,box-shadow,background-color] duration-200 focus:border-gold-strong focus:shadow-[0_0_0_4px_var(--gold-soft)] disabled:opacity-60";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: Icon;
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ icon: Icon, invalid, className, type, ...rest }, ref) {
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="group relative">
      {Icon && (
        <Icon
          className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-fg-subtle transition-colors group-focus-within:text-gold-fg"
          aria-hidden
        />
      )}
      <input
        ref={ref}
        type={isPassword && reveal ? "text" : type}
        aria-invalid={invalid || undefined}
        className={cn(
          inputBase,
          "h-12",
          Icon ? "pl-11" : "pl-4",
          isPassword ? "pr-12" : "pr-4",
          invalid ? "border-danger focus:border-danger focus:shadow-[0_0_0_4px_var(--danger-soft)]" : "border-border hover:border-border-strong",
          className,
        )}
        {...rest}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setReveal((v) => !v)}
          className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center rounded-xl text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
          aria-label={reveal ? "Ocultar senha" : "Mostrar senha"}
        >
          {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      )}
    </div>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  function Textarea({ invalid, className, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(inputBase, "min-h-24 resize-y px-4 py-3 leading-relaxed", invalid ? "border-danger" : "border-border hover:border-border-strong", className)}
        {...rest}
      />
    );
  },
);

/* ------------------------------------------------------------------ */

export interface SegmentOption<T extends string | number> {
  value: T;
  label: React.ReactNode;
  icon?: Icon;
  disabled?: boolean;
}

/** Controle segmentado com indicador compartilhado (layoutId). */
export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  layoutId,
  size = "md",
  className,
  ariaLabel,
  fullWidth,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
  layoutId: string;
  size?: "sm" | "md";
  className?: string;
  ariaLabel: string;
  fullWidth?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("inline-flex max-w-full overflow-x-auto rounded-2xl border border-border bg-surface-2 p-1 no-scrollbar", fullWidth && "flex w-full", className)}
    >
      {options.map((o) => {
        const active = o.value === value;
        const Icon = o.icon;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={o.disabled}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative flex shrink-0 items-center justify-center gap-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors duration-200 disabled:opacity-40",
              size === "sm" ? "h-8 px-3 text-xs" : "h-9 px-4 text-[13px]",
              fullWidth && "flex-1",
              active ? "text-fg" : "text-fg-muted hover:text-fg",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-xl bg-surface shadow-sm ring-1 ring-border"
                transition={spring.layout}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {Icon && <Icon className="size-4" aria-hidden />}
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Abas com sublinhado deslizante. */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  layoutId,
  className,
}: {
  tabs: { value: T; label: string; count?: number; icon?: Icon }[];
  value: T;
  onChange: (v: T) => void;
  layoutId: string;
  className?: string;
}) {
  return (
    <div role="tablist" className={cn("flex gap-1 overflow-x-auto border-b border-border no-scrollbar", className)}>
      {tabs.map((t) => {
        const active = t.value === value;
        const Icon = t.icon;
        return (
          <button
            key={t.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn(
              "relative flex h-11 shrink-0 items-center gap-2 rounded-t-xl px-4 text-sm font-semibold transition-colors",
              active ? "text-fg" : "text-fg-muted hover:text-fg",
            )}
          >
            {Icon && <Icon className="size-4" aria-hidden />}
            {t.label}
            {t.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular transition-colors",
                  active ? "bg-gold-soft text-gold-fg" : "bg-surface-2 text-fg-subtle",
                )}
              >
                {t.count}
              </span>
            )}
            {active && (
              <motion.span layoutId={layoutId} className="absolute inset-x-2 -bottom-px h-[3px] rounded-full bg-gold" transition={spring.layout} />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-semibold text-fg">
          {label}
        </label>
        {description && <p className="mt-0.5 text-[13px] text-fg-muted">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors duration-200 disabled:opacity-50",
          checked ? "bg-sage-strong justify-end" : "bg-surface-3 justify-start",
        )}
      >
        <motion.span layout transition={spring.snappy} className="size-5 rounded-full bg-knob shadow-sm" />
        <span className="sr-only">{checked ? "Ativado" : "Desativado"}</span>
      </button>
    </div>
  );
}

export function Checkbox({ checked, onChange, label, className }: { checked: boolean; onChange: (v: boolean) => void; label: React.ReactNode; className?: string }) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-2.5 text-sm text-fg", className)}>
      <span className="relative grid size-5 place-items-center">
        <input type="checkbox" className="peer absolute inset-0 cursor-pointer opacity-0" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span
          className={cn(
            "size-5 rounded-md border-2 transition-colors duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-focus",
            checked ? "border-primary bg-primary" : "border-border-strong bg-surface",
          )}
        />
        {/* EXCEÇÃO ao killer/svg-desenhado: o check é traçado com pathLength (motion), e o ícone do Lucide não expõe o path para animar. */}
        <svg viewBox="0 0 16 16" className="pointer-events-none absolute size-3.5 text-on-primary" aria-hidden>
          <motion.path
            d="M3 8.5 6.5 12 13 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          />
        </svg>
      </span>
      {label}
    </label>
  );
}

export function Stepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  format = (n) => String(n),
}: {
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step?: number;
  label: string;
  format?: (n: number) => string;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-2xl border border-border bg-surface p-1" role="group" aria-label={label}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - step))}
        className="grid size-9 place-items-center rounded-xl text-lg font-semibold text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-30"
        aria-label={`Diminuir ${label}`}
      >
        −
      </motion.button>
      <span className="relative min-w-14 overflow-hidden text-center text-sm font-bold tabular" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={spring.snappy}
            className="inline-block"
          >
            {format(value)}
          </motion.span>
        </AnimatePresence>
      </span>
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + step))}
        className="grid size-9 place-items-center rounded-xl text-lg font-semibold text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-30"
        aria-label={`Aumentar ${label}`}
      >
        +
      </motion.button>
    </div>
  );
}
