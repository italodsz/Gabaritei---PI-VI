"use client";

import { motion } from "motion/react";
import {
  Calendar,
  Compass,
  Crosshair,
  Flame,
  Footprints,
  Lock,
  Medal as MedalIcon,
  Mountain,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  Zap,
  type Icon,
} from "@/components/icons";
import { useId } from "react";
import type { AchievementIcon, MedalTier } from "@/lib/calculations/achievements";
import { cn } from "@/lib/utils/cn";

export const ACHIEVEMENT_ICONS: Record<AchievementIcon, Icon> = {
  footprints: Footprints,
  flame: Flame,
  target: Target,
  trophy: Trophy,
  mountain: Mountain,
  compass: Compass,
  crosshair: Crosshair,
  rotate: RotateCcw,
  sparkles: Sparkles,
  calendar: Calendar,
  medal: MedalIcon,
  zap: Zap,
};

const TIER: Record<MedalTier, { from: string; to: string; ring: string; ribbon: [string, string]; label: string }> = {
  bronze: { from: "var(--medal-bronze-from)", to: "var(--medal-bronze-to)", ring: "var(--medal-bronze-ring)", ribbon: ["var(--sage)", "var(--sage-strong)"], label: "Bronze" },
  prata: { from: "var(--medal-prata-from)", to: "var(--medal-prata-to)", ring: "var(--medal-prata-ring)", ribbon: ["var(--coral)", "var(--coral-strong)"], label: "Prata" },
  ouro: { from: "var(--medal-ouro-from)", to: "var(--medal-ouro-to)", ring: "var(--medal-ouro-ring)", ribbon: ["var(--ink)", "var(--ink-3)"], label: "Ouro" },
};

export const TIER_LABEL: Record<MedalTier, string> = { bronze: "Bronze", prata: "Prata", ouro: "Ouro" };

/** Medalha ilustrada (SVG) com faixa, disco metálico e ícone da conquista. */
export function Medal({
  icon,
  tier,
  locked,
  size = 72,
  className,
  shine,
}: {
  icon: AchievementIcon;
  tier: MedalTier;
  locked?: boolean;
  size?: number;
  className?: string;
  shine?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const t = TIER[tier];
  const Icon = locked ? Lock : ACHIEVEMENT_ICONS[icon];
  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size * 1.18 }}>
      <svg viewBox="0 0 64 76" width={size} height={size * 1.18} className={cn(locked && "opacity-90 grayscale")} aria-hidden>
        <defs>
          <linearGradient id={`m-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: locked ? "var(--surface-3)" : t.from }} />
            <stop offset="1" style={{ stopColor: locked ? "var(--border-strong)" : t.to }} />
          </linearGradient>
        </defs>
        {/* faixa */}
        <path d="M20 2 L30 2 L36 26 L26 30 Z" style={{ fill: locked ? "var(--border-strong)" : t.ribbon[0] }} />
        <path d="M44 2 L34 2 L28 26 L38 30 Z" style={{ fill: locked ? "var(--border)" : t.ribbon[1] }} />
        {/* disco */}
        <circle cx="32" cy="46" r="26" fill={`url(#m-${id})`} />
        <circle cx="32" cy="46" r="20.5" fill="none" style={{ stroke: locked ? "var(--surface-2)" : t.ring }} strokeOpacity="0.85" strokeWidth="1.6" strokeDasharray="2 3" />
        <path d="M14 36 A 22 22 0 0 1 40 23" fill="none" style={{ stroke: "var(--knob)" }} strokeOpacity={locked ? 0.15 : 0.45} strokeWidth="3" strokeLinecap="round" />
      </svg>
      <div className="absolute inset-x-0 bottom-0 grid place-items-center" style={{ height: size * 0.88 }}>
        <Icon className={cn(locked ? "text-fg-subtle" : "text-ink")} style={{ width: size * 0.3, height: size * 0.3 }} strokeWidth={2.2} aria-hidden />
      </div>
      {shine && !locked && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
          style={{ top: size * 0.3, height: size * 0.88 }}
        >
          <motion.span
            className="absolute top-0 -left-1/2 h-full w-1/3 rotate-12 bg-[var(--medal-shine)] blur-[2px]"
            initial={{ x: "-120%" }}
            animate={{ x: "420%" }}
            transition={{ duration: 1.1, delay: 0.5, ease: "easeInOut" }}
          />
        </motion.span>
      )}
    </div>
  );
}
