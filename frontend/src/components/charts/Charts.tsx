"use client";

import { motion } from "motion/react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useId } from "react";
import { useShouldReduceMotion } from "@/hooks/useMotionPreference";
import { formatNumber } from "@/lib/format";
import type { SeriesPoint } from "@/lib/calculations/stats";

/* ------------------------------------------------------------------ */
/* Tooltip                                                             */
/* ------------------------------------------------------------------ */

interface TooltipRow {
  label: string;
  value: string;
  color?: string;
}

export function ChartTooltipCard({ title, rows }: { title?: string; rows: TooltipRow[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.16 }}
      className="min-w-36 rounded-2xl border border-border bg-surface px-3.5 py-2.5 text-xs shadow-lg"
    >
      {title && <p className="mb-1.5 font-semibold text-fg">{title}</p>}
      <div className="space-y-1">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-fg-muted">
              {r.color && <span className="size-2.5 rounded-full" style={{ background: r.color }} />}
              {r.label}
            </span>
            <span className="font-bold text-fg tabular">{r.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fontSize: 12, fill: "var(--fg-subtle)" },
} as const;

/* ------------------------------------------------------------------ */
/* Evolução da taxa de acerto (uma série, um eixo)                     */
/* ------------------------------------------------------------------ */

export function AccuracyAreaChart({ data, height = 240, compact }: { data: SeriesPoint[]; height?: number; compact?: boolean }) {
  const reduce = useShouldReduceMotion();
  const gid = useId().replace(/:/g, "");
  const rows = data.map((d) => ({ ...d, pct: d.accuracy === null ? null : Math.round(d.accuracy * 100) }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={rows} margin={{ top: 8, right: 8, left: compact ? -8 : -4, bottom: 0 }}>
        <defs>
          <linearGradient id={`acc-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-accent)" stopOpacity={0.32} />
            <stop offset="100%" stopColor="var(--chart-accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 6" />
        <XAxis dataKey="label" {...axisProps} interval={compact ? 2 : "preserveStartEnd"} minTickGap={12} />
        <YAxis {...axisProps} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} width={48} />
        <Tooltip
          cursor={{ stroke: "var(--border-strong)", strokeDasharray: "4 4" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0].payload as (typeof rows)[number];
            return (
              <ChartTooltipCard
                title={p.label}
                rows={[
                  { label: "Acerto", value: p.pct === null ? "—" : `${p.pct}%`, color: "var(--chart-accent)" },
                  { label: "Questões", value: formatNumber(p.answered) },
                ]}
              />
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="pct"
          connectNulls
          stroke="var(--chart-accent)"
          strokeWidth={2.5}
          fill={`url(#acc-${gid})`}
          dot={false}
          activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--surface)", fill: "var(--chart-accent)" }}
          isAnimationActive={!reduce}
          animationDuration={900}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Volume de questões por período (barras, eixo próprio — nunca eixo duplo). */
export function VolumeBarChart({ data, height = 200 }: { data: SeriesPoint[]; height?: number }) {
  const reduce = useShouldReduceMotion();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="28%">
        <CartesianGrid vertical={false} strokeDasharray="3 6" />
        <XAxis dataKey="label" {...axisProps} minTickGap={8} />
        <YAxis {...axisProps} allowDecimals={false} width={44} />
        <Tooltip
          cursor={{ fill: "var(--surface-2)", radius: 8 }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0].payload as SeriesPoint;
            return (
              <ChartTooltipCard
                title={p.label}
                rows={[
                  { label: "Questões", value: formatNumber(p.answered), color: "var(--chart-primary)" },
                  { label: "Acertos", value: formatNumber(p.correct) },
                ]}
              />
            );
          }}
        />
        <Bar dataKey="answered" fill="var(--chart-primary)" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={!reduce} animationDuration={700} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Linha comparativa (período atual) — usada no resultado e no perfil. */
export function SparkLine({ values, color = "var(--chart-accent)", height = 48 }: { values: number[]; color?: string; height?: number }) {
  const reduce = useShouldReduceMotion();
  const data = values.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} isAnimationActive={!reduce} animationDuration={900} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------------ */
/* Barras categóricas (ex.: acerto por área)                           */
/* ------------------------------------------------------------------ */

export interface CategoryDatum {
  key: string;
  label: string;
  value: number;
  color: string;
  detail?: string;
}

export function CategoryBarChart({ data, height = 240, valueFormat = (v: number) => `${Math.round(v)}%`, max = 100 }: { data: CategoryDatum[]; height?: number; valueFormat?: (v: number) => string; max?: number }) {
  const reduce = useShouldReduceMotion();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 22, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid vertical={false} strokeDasharray="3 6" />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} domain={[0, max]} tickFormatter={(v) => valueFormat(v)} width={48} />
        <Tooltip
          cursor={{ fill: "var(--surface-2)", radius: 8 }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0].payload as CategoryDatum;
            return <ChartTooltipCard title={p.label} rows={[{ label: "Acerto", value: valueFormat(p.value), color: p.color }, ...(p.detail ? [{ label: "Detalhe", value: p.detail }] : [])]} />;
          }}
        />
        <Bar
          dataKey="value"
          radius={[4, 4, 0, 0]}
          maxBarSize={56}
          isAnimationActive={!reduce}
          animationDuration={800}
          label={{ position: "top", fontSize: 12, fontWeight: 700, fill: "var(--fg)", formatter: (v: unknown) => valueFormat(Number(v)) }}
        >
          {data.map((d) => (
            <Cell key={d.key} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------------ */
/* Rosca de distribuição                                               */
/* ------------------------------------------------------------------ */

export function DonutChart({ data, size = 200, centerLabel, centerValue }: { data: CategoryDatum[]; size?: number; centerLabel: string; centerValue: string }) {
  const reduce = useShouldReduceMotion();
  const total = data.reduce((n, d) => n + d.value, 0);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as CategoryDatum;
              return <ChartTooltipCard title={p.label} rows={[{ label: "Questões", value: formatNumber(p.value), color: p.color }, { label: "Participação", value: `${total ? Math.round((p.value / total) * 100) : 0}%` }]} />;
            }}
          />
          <Pie
            data={data.filter((d) => d.value > 0)}
            dataKey="value"
            nameKey="label"
            innerRadius="68%"
            outerRadius="100%"
            paddingAngle={2}
            stroke="var(--surface)"
            strokeWidth={2}
            cornerRadius={4}
            isAnimationActive={!reduce}
            animationDuration={900}
            startAngle={90}
            endAngle={-270}
          >
            {data
              .filter((d) => d.value > 0)
              .map((d) => (
                <Cell key={d.key} fill={d.color} />
              ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="font-display text-2xl font-bold tabular">{centerValue}</p>
          <p className="text-xs text-fg-subtle">{centerLabel}</p>
        </div>
      </div>
    </div>
  );
}

/** Legenda com marcador e valor (identidade nunca só pela cor). */
export function ChartLegend({ items, className }: { items: { label: string; color: string; value?: string }[]; className?: string }) {
  return (
    <ul className={className ?? "flex flex-wrap gap-x-5 gap-y-2"}>
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-2 text-sm">
          <span className="size-3 shrink-0 rounded-[4px]" style={{ background: i.color }} aria-hidden />
          <span className="text-fg-muted">{i.label}</span>
          {i.value && <span className="ml-auto pl-2 font-semibold text-fg tabular">{i.value}</span>}
        </li>
      ))}
    </ul>
  );
}
