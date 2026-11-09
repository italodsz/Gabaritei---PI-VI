"use client";

import { motion } from "motion/react";
import { useState } from "react";
import type { CalendarCell } from "@/lib/calculations/stats";
import { formatDateLong, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils/cn";

/** Escala sequencial de um único tom, derivada do token --chart-seq da paleta ativa. */
const LEVEL_BG = [
  "var(--surface-3)",
  "color-mix(in oklab, var(--chart-seq) 30%, var(--surface-3))",
  "color-mix(in oklab, var(--chart-seq) 55%, var(--surface-3))",
  "color-mix(in oklab, var(--chart-seq) 78%, var(--surface-3))",
  "var(--chart-seq)",
];

function level(count: number): number {
  if (count === 0) return 0;
  if (count < 6) return 1;
  if (count < 12) return 2;
  if (count < 20) return 3;
  return 4;
}

const WEEKDAYS = ["seg", "", "qua", "", "sex", "", "dom"];

/** Calendário de atividades (escala sequencial de um único tom). */
export function ActivityCalendar({ columns }: { columns: CalendarCell[][] }) {
  const [hover, setHover] = useState<CalendarCell | null>(null);
  const months = columns.map((col, i) => {
    const d = new Date(col[0].date);
    const prev = i > 0 ? new Date(columns[i - 1][0].date) : null;
    return !prev || prev.getMonth() !== d.getMonth() ? d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "") : "";
  });

  return (
    <div>
      <div className="flex gap-2">
        <div className="flex flex-col gap-[5px] pt-5 text-[10px] text-fg-subtle">
          {WEEKDAYS.map((w, i) => (
            <span key={i} className="h-[14px] leading-[14px]">
              {w}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1 overflow-x-auto no-scrollbar">
          <div className="flex gap-[5px]">
            {columns.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-[5px]">
                <span className="h-[15px] text-[10px] whitespace-nowrap text-fg-subtle">{months[ci]}</span>
                {col.map((cell, ri) => {
                  const lv = level(cell.count);
                  return (
                    <motion.span
                      key={cell.key}
                      role="img"
                      aria-label={cell.future ? undefined : `${formatDateLong(cell.date)}: ${cell.count} questões`}
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: cell.future ? 0.25 : 1, scale: 1 }}
                      transition={{ delay: 0.15 + ci * 0.018 + ri * 0.008, duration: 0.25 }}
                      onMouseEnter={() => !cell.future && setHover(cell)}
                      onMouseLeave={() => setHover(null)}
                      className={cn("size-[14px] rounded-[4px] transition-[outline] duration-150", hover?.key === cell.key && "outline-2 outline-offset-1 outline-fg")}
                      style={{ background: cell.future ? "transparent" : LEVEL_BG[lv], border: cell.future ? "1px dashed var(--border)" : undefined }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-fg-subtle">
        <p className="min-h-4" aria-live="polite">
          {hover ? (
            <>
              <strong className="text-fg">{formatDateLong(hover.date)}</strong> · {hover.count} {hover.count === 1 ? "questão" : "questões"}
              {hover.count > 0 && ` · ${formatPercent(hover.correct / hover.count)} de acerto`}
            </>
          ) : (
            "Passe o mouse sobre um dia para ver os detalhes."
          )}
        </p>
        <div className="flex items-center gap-1.5">
          menos
          {LEVEL_BG.map((c, i) => (
            <span key={i} className="size-3 rounded-[3px]" style={{ background: c }} />
          ))}
          mais
        </div>
      </div>
    </div>
  );
}
