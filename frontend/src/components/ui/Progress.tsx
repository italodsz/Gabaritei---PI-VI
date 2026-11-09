"use client";

import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { duration, ease } from "@/lib/animations";
import { useShouldReduceMotion } from "@/hooks/useMotionPreference";
import { cn } from "@/lib/utils/cn";

type Tone = "gold" | "sage" | "coral" | "ink" | "success" | "danger" | "linguagens" | "humanas" | "natureza" | "matematica" | "on-ink";

const BAR_TONE: Record<Tone, string> = {
  gold: "bg-gold",
  sage: "bg-sage-strong",
  coral: "bg-coral",
  ink: "bg-primary",
  success: "bg-success",
  danger: "bg-danger",
  linguagens: "bg-linguagens",
  humanas: "bg-humanas",
  natureza: "bg-natureza",
  matematica: "bg-matematica",
  "on-ink": "bg-gold",
};

const STROKE: Record<Tone, string> = {
  gold: "var(--gold)",
  sage: "var(--sage-strong)",
  coral: "var(--coral)",
  ink: "var(--primary)",
  success: "var(--success)",
  danger: "var(--danger)",
  linguagens: "var(--area-linguagens)",
  humanas: "var(--area-humanas)",
  natureza: "var(--area-natureza)",
  matematica: "var(--area-matematica)",
  "on-ink": "var(--gold)",
};

/** Barra de progresso animada por scaleX (transform — não provoca layout). */
export function ProgressBar({
  value,
  tone = "gold",
  className,
  height = "h-2",
  label,
  delay = 0,
}: {
  value: number;
  tone?: Tone;
  className?: string;
  height?: string;
  label?: string;
  delay?: number;
}) {
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
      className={cn("w-full overflow-hidden rounded-full", tone === "on-ink" ? "bg-ink-raised-strong" : "bg-surface-3", height, className)}
    >
      <motion.div
        className={cn("h-full w-full origin-left rounded-full", BAR_TONE[tone])}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: clamped }}
        transition={{ duration: duration.chart, ease: ease.emphasized, delay }}
      />
    </div>
  );
}

/** Anel de progresso com traço desenhado progressivamente. */
export function ProgressRing({
  value,
  size = 120,
  stroke = 10,
  tone = "gold",
  track = "var(--surface-3)",
  children,
  className,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: Tone;
  track?: string;
  children?: React.ReactNode;
  className?: string;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <div
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? `${Math.round(clamped * 100)}%`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={STROKE[tone]}
          strokeWidth={stroke}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: clamped, opacity: clamped === 0 ? 0 : 1 }}
          transition={{ duration: duration.chart + 0.15, ease: ease.emphasized }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

/** Contador animado que respeita o movimento reduzido. */
export function AnimatedNumber({
  value,
  format = (n) => Math.round(n).toLocaleString("pt-BR"),
  className,
  durationS = 0.9,
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
  durationS?: number;
}) {
  const reduce = useShouldReduceMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => format(v));

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    if (!inView) return;
    const controls = animate(mv, value, { duration: durationS, ease: ease.emphasized });
    return () => controls.stop();
  }, [value, inView, reduce, mv, durationS]);

  // A contagem só começa ao entrar na tela; leitores de tela recebem o valor final desde já.
  return (
    <span className={cn("tabular", className)}>
      <motion.span ref={ref} aria-hidden>
        {text}
      </motion.span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}
