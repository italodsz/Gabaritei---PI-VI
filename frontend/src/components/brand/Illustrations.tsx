"use client";

import { motion } from "motion/react";

/**
 * Ilustrações próprias, desenhadas com os tokens de cor do tema
 * (funcionam no claro e no escuro). Movimentos sutis em loop lento
 * são feitos apenas com transform.
 */

const float = (delay = 0) => ({
  animate: { y: [0, -5, 0] },
  transition: { duration: 4.2, repeat: Infinity, ease: "easeInOut" as const, delay },
});

export function IllustrationStack({ size = 140 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 160 128" aria-hidden>
      <ellipse cx="80" cy="118" rx="54" ry="6" fill="var(--surface-3)" />
      <motion.g {...float(0.4)}>
        <rect x="38" y="30" width="84" height="66" rx="14" fill="var(--sage-soft)" stroke="var(--sage)" strokeWidth="2" transform="rotate(-8 80 63)" />
      </motion.g>
      <motion.g {...float(0)}>
        <rect x="34" y="34" width="92" height="70" rx="14" fill="var(--surface)" stroke="var(--border-strong)" strokeWidth="2" />
        <rect x="48" y="50" width="44" height="7" rx="3.5" fill="var(--surface-3)" />
        <rect x="48" y="64" width="64" height="6" rx="3" fill="var(--surface-2)" />
        <rect x="48" y="76" width="54" height="6" rx="3" fill="var(--surface-2)" />
        <circle cx="110" cy="53" r="8" fill="var(--gold)" />
        <path d="M106.5 53 L109 55.5 L113.5 50.5" stroke="var(--ink)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
    </svg>
  );
}

export function IllustrationChart({ size = 140 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 160 128" aria-hidden>
      <ellipse cx="80" cy="118" rx="54" ry="6" fill="var(--surface-3)" />
      <rect x="28" y="22" width="104" height="84" rx="16" fill="var(--surface)" stroke="var(--border-strong)" strokeWidth="2" />
      {[0, 1, 2, 3].map((i) => (
        <motion.rect
          key={i}
          x={44 + i * 20}
          width="12"
          rx="4"
          fill={i === 3 ? "var(--gold)" : "var(--surface-3)"}
          initial={{ y: 92, height: 0 }}
          animate={{ y: 92 - (14 + i * 12), height: 14 + i * 12 }}
          transition={{ duration: 0.7, delay: 0.2 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
      <motion.path
        d="M40 70 C60 66, 70 52, 90 50 S 116 36, 122 34"
        fill="none"
        stroke="var(--sage-strong)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="4 5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
    </svg>
  );
}

export function IllustrationClock({ size = 140 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 160 128" aria-hidden>
      <ellipse cx="80" cy="118" rx="54" ry="6" fill="var(--surface-3)" />
      <motion.g {...float(0.2)}>
        <rect x="30" y="28" width="66" height="80" rx="12" fill="var(--surface)" stroke="var(--border-strong)" strokeWidth="2" />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <circle cx="44" cy={44 + i * 13} r="4" fill={i < 2 ? "var(--ink)" : "none"} stroke="var(--border-strong)" strokeWidth="1.5" />
            <rect x="54" y={41 + i * 13} width={i % 2 ? 26 : 32} height="6" rx="3" fill="var(--surface-2)" />
          </g>
        ))}
      </motion.g>
      <motion.g {...float(0)}>
        <circle cx="108" cy="52" r="26" fill="var(--gold-soft)" stroke="var(--gold)" strokeWidth="2.5" />
        <motion.line
          x1="108"
          y1="52"
          x2="108"
          y2="36"
          stroke="var(--ink)"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ originX: "108px", originY: "52px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
        <line x1="108" y1="52" x2="118" y2="58" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="108" cy="52" r="3" fill="var(--ink)" />
      </motion.g>
    </svg>
  );
}

export function IllustrationStar({ size = 140 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 160 128" aria-hidden>
      <ellipse cx="80" cy="118" rx="54" ry="6" fill="var(--surface-3)" />
      <motion.g {...float(0)}>
        <rect x="40" y="26" width="80" height="80" rx="20" fill="var(--surface)" stroke="var(--border-strong)" strokeWidth="2" />
        <motion.path
          d="M80 44 l8.2 16.6 18.3 2.7 -13.2 12.9 3.1 18.2 -16.4 -8.6 -16.4 8.6 3.1 -18.2 -13.2 -12.9 18.3 -2.7z"
          fill="var(--gold)"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.2 }}
          style={{ originX: "80px", originY: "68px" }}
        />
      </motion.g>
      <motion.circle cx="128" cy="30" r="4" fill="var(--coral)" {...float(0.6)} />
      <motion.circle cx="30" cy="48" r="3" fill="var(--sage)" {...float(1)} />
    </svg>
  );
}

export function IllustrationFlag({ size = 140 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 160 128" aria-hidden>
      <ellipse cx="80" cy="118" rx="54" ry="6" fill="var(--surface-3)" />
      <rect x="62" y="24" width="4" height="92" rx="2" fill="var(--ink)" />
      <motion.path
        d="M66 28 C 84 22, 96 36, 116 30 L 116 66 C 96 72, 84 58, 66 64 Z"
        fill="var(--coral)"
        animate={{ d: ["M66 28 C 84 22, 96 36, 116 30 L 116 66 C 96 72, 84 58, 66 64 Z", "M66 28 C 84 34, 96 24, 116 32 L 116 68 C 96 60, 84 70, 66 64 Z", "M66 28 C 84 22, 96 36, 116 30 L 116 66 C 96 72, 84 58, 66 64 Z"] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

/** Ilustração de boas-vindas usada no onboarding e nas telas de autenticação. */
export function IllustrationLaunch({ size = 220 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 240 180" aria-hidden>
      <motion.circle cx="120" cy="96" r="70" fill="var(--gold-soft)" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.7 }} />
      <motion.g initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.15 }}>
        <rect x="70" y="70" width="100" height="70" rx="14" fill="var(--surface)" stroke="var(--border-strong)" strokeWidth="2" />
        <rect x="84" y="86" width="50" height="8" rx="4" fill="var(--surface-3)" />
        <rect x="84" y="102" width="72" height="6" rx="3" fill="var(--surface-2)" />
        <rect x="84" y="116" width="60" height="6" rx="3" fill="var(--surface-2)" />
      </motion.g>
      <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 380, damping: 14, delay: 0.5 }} style={{ originX: "170px", originY: "68px" }}>
        <circle cx="170" cy="68" r="20" fill="var(--ink)" />
        <path d="M161 68 L167 74 L180 61" stroke="var(--gold)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
      <motion.circle cx="58" cy="52" r="6" fill="var(--sage)" {...float(0.3)} />
      <motion.circle cx="196" cy="128" r="5" fill="var(--coral)" {...float(0.9)} />
    </svg>
  );
}
