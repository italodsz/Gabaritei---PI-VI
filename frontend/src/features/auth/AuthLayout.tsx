"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { CheckCircle2, Flame, TrendingUp } from "@/components/icons";
import { Logo } from "@/components/brand/Logo";
import { AuthGate } from "@/components/layout/AuthGate";
import { ease, spring } from "@/lib/animations";

function FloatingCard({ children, className, delay, drift }: { children: React.ReactNode; className: string; delay: number; drift: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...spring.soft, delay }}
      className={`absolute ${className}`}
    >
      <motion.div
        animate={{ y: [0, drift, 0] }}
        transition={{ duration: 6 + delay * 2, repeat: Infinity, ease: "easeInOut" }}
        className="rounded-3xl border border-ink-line bg-ink-raised-strong p-4 shadow-lg"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function BrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-ink text-on-ink lg:flex lg:w-[46%] lg:flex-col lg:justify-between lg:p-12 xl:p-14">
      <div className="bg-dots absolute inset-0 opacity-60" aria-hidden />

      <Logo tone="light" size={42} animated className="relative" />

      <div className="relative">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: ease.emphasized, delay: 0.15 }}
          className="max-w-md font-display text-[2.6rem] leading-[1.05] font-bold tracking-[-0.03em] text-balance xl:text-5xl"
        >
          Estude com clareza.{" "}
          <span className="relative whitespace-nowrap text-gold">
            Evolua
            <motion.svg viewBox="0 0 200 12" className="absolute -bottom-2 left-0 w-full" aria-hidden>
              <motion.path
                d="M2 9 C 50 2, 120 2, 198 7"
                fill="none"
                stroke="var(--gold)"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.7, ease: ease.out }}
              />
            </motion.svg>
          </span>{" "}
          com constância.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-5 max-w-sm text-[15px] leading-relaxed text-on-ink-muted"
        >
          Questões, simulados e recomendações para você chegar ao ENEM sabendo exatamente onde concentrar seus esforços.
        </motion.p>
      </div>

      <div className="relative h-56" aria-hidden>
        <FloatingCard className="top-2 left-0" delay={0.4} drift={-8}>
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-sage/25 text-sage">
              <CheckCircle2 className="size-5" />
            </span>
            <div>
              <p className="text-xs text-on-ink-muted">Questão 12 de 15</p>
              <p className="text-sm font-semibold">Resposta correta!</p>
            </div>
          </div>
        </FloatingCard>
        <FloatingCard className="top-20 right-0" delay={0.55} drift={7}>
          <div className="w-48">
            <div className="flex items-center justify-between">
              <p className="text-xs text-on-ink-muted">Acerto semanal</p>
              <TrendingUp className="size-4 text-gold" />
            </div>
            <p className="mt-1 font-display text-2xl font-bold">72%</p>
            <div className="mt-2 flex h-10 items-end gap-1.5">
              {[40, 55, 48, 62, 58, 70, 72].map((h, i) => (
                <motion.span
                  key={i}
                  className="w-full origin-bottom rounded-md bg-gold/70"
                  style={{ height: `${h}%` }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.9 + i * 0.06, ...spring.soft }}
                />
              ))}
            </div>
          </div>
        </FloatingCard>
        <FloatingCard className="bottom-0 left-12" delay={0.7} drift={-6}>
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-coral/25 text-coral">
              <Flame className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">14 dias seguidos</p>
              <p className="text-xs text-on-ink-muted">Sua melhor sequência</p>
            </div>
          </div>
        </FloatingCard>
      </div>
    </div>
  );
}

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AuthGate mode="guest">
      <div className="flex min-h-dvh bg-bg">
        <BrandPanel />
        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between p-6 lg:hidden">
            <Logo size={34} />
          </div>
          <div className="flex flex-1 items-center justify-center px-6 py-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: ease.emphasized } }}
                exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
                className="w-full max-w-[420px]"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
          <p className="px-6 pb-6 text-center text-xs text-fg-subtle">
            Versão demonstrativa · os dados ficam apenas neste navegador.
          </p>
        </div>
      </div>
    </AuthGate>
  );
}
