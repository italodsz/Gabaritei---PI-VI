"use client";

import { Minus, TrendingDown, TrendingUp } from "@/components/icons";
import { Card, IconTile, type CardSurface } from "./Card";
import { AnimatedNumber } from "./Progress";
import { cn } from "@/lib/utils/cn";

export function StatCard({
  icon,
  tone = "neutral",
  label,
  value,
  format,
  suffix,
  hint,
  delta,
  deltaLabel,
  surface = "default",
  children,
  className,
}: {
  icon: React.ReactNode;
  tone?: React.ComponentProps<typeof IconTile>["tone"];
  label: string;
  value: number;
  format?: (n: number) => string;
  suffix?: string;
  hint?: React.ReactNode;
  /** variação (ex.: +0.04 = +4 p.p.) */
  delta?: number | null;
  deltaLabel?: string;
  surface?: CardSurface;
  children?: React.ReactNode;
  className?: string;
}) {
  const DeltaIcon = delta === null || delta === undefined ? null : delta > 0.004 ? TrendingUp : delta < -0.004 ? TrendingDown : Minus;
  return (
    <Card reveal surface={surface} className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between">
        <IconTile tone={tone}>{icon}</IconTile>
        {DeltaIcon && delta !== null && delta !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold tabular",
              delta > 0.004 ? "bg-success-soft text-success" : delta < -0.004 ? "bg-danger-soft text-danger" : "bg-surface-2 text-fg-muted",
            )}
            title={deltaLabel}
          >
            <DeltaIcon className="size-3.5" aria-hidden />
            {deltaLabel}
          </span>
        )}
      </div>
      <p className="mt-5 text-sm font-medium text-fg-muted">{label}</p>
      <p className="mt-1 font-display text-[2rem] leading-none font-bold tracking-tight">
        <AnimatedNumber value={value} format={format} />
        {suffix && <span className="ml-1 text-lg font-semibold text-fg-muted">{suffix}</span>}
      </p>
      {hint && <div className="mt-2 text-xs text-fg-subtle">{hint}</div>}
      {children}
    </Card>
  );
}
