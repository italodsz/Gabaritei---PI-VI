"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, CircleAlert, Info, Sparkles, X } from "@/components/icons";
import { useEffect } from "react";
import { create } from "zustand";
import { toastVariants } from "@/lib/animations";
import { cn } from "@/lib/utils/cn";

export type ToastTone = "success" | "error" | "info" | "celebrate";

export interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
  duration: number;
}

interface ToastStore {
  toasts: ToastItem[];
  push: (t: Omit<ToastItem, "id" | "duration" | "tone"> & { tone?: ToastTone; duration?: number }) => void;
  dismiss: (id: number) => void;
}

let counter = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (t) =>
    set((s) => ({
      toasts: [...s.toasts.slice(-3), { id: ++counter, tone: t.tone ?? "info", duration: t.duration ?? 4200, ...t }],
    })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (title: string, description?: string) => useToastStore.getState().push({ title, description, tone: "success" }),
  error: (title: string, description?: string) => useToastStore.getState().push({ title, description, tone: "error" }),
  info: (title: string, description?: string) => useToastStore.getState().push({ title, description, tone: "info" }),
  celebrate: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, tone: "celebrate", duration: 5200 }),
};

const ICONS = { success: CheckCircle2, error: CircleAlert, info: Info, celebrate: Sparkles };
const TONE = {
  success: "text-success bg-success-soft",
  error: "text-danger bg-danger-soft",
  info: "text-fg bg-surface-2",
  celebrate: "text-on-gold bg-gold",
};

function ToastCard({ item }: { item: ToastItem }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const Icon = ICONS[item.tone];
  useEffect(() => {
    const id = window.setTimeout(() => dismiss(item.id), item.duration);
    return () => window.clearTimeout(id);
  }, [dismiss, item.id, item.duration]);

  return (
    <motion.div
      layout
      variants={toastVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      role={item.tone === "error" ? "alert" : "status"}
      className="pointer-events-auto relative flex w-[360px] max-w-[calc(100vw-2rem)] items-start gap-3 rounded-2xl border border-border bg-surface p-3.5 pr-2.5 shadow-lg"
    >
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", TONE[item.tone])}>
        <Icon className="size-[18px]" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-semibold text-fg">{item.title}</p>
        {item.description && <p className="mt-0.5 text-[13px] leading-snug text-fg-muted">{item.description}</p>}
      </div>
      <button
        type="button"
        onClick={() => dismiss(item.id)}
        className="grid size-7 shrink-0 place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
        aria-label="Fechar notificação"
      >
        <X className="size-4" />
      </button>
      <motion.span
        aria-hidden
        className="absolute inset-x-4 bottom-0 h-0.5 origin-left rounded-full bg-gold/60"
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: item.duration / 1000, ease: "linear" }}
      />
    </motion.div>
  );
}

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div aria-live="polite" className="pointer-events-none fixed right-4 bottom-4 z-[80] flex flex-col items-end gap-2.5">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastCard key={t.id} item={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
