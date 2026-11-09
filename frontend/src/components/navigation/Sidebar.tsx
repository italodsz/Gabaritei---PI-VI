"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, Flame, Play } from "@/components/icons";
import { useMemo } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { NAV_ITEMS, isActive } from "./navItems";
import { useAppStore } from "@/stores/appStore";
import { useActiveAccount, useRecords } from "@/hooks/useAccount";
import { useNow } from "@/hooks/useNow";
import { computeStreak } from "@/lib/calculations/stats";
import { spring } from "@/lib/animations";
import { cn } from "@/lib/utils/cn";
import { NARROW_QUERY, useMediaQuery } from "@/hooks/useMediaQuery";

const EXPANDED = 256;
const COLLAPSED = 84;

const labelMotion = {
  initial: { opacity: 0, x: -6 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.2, delay: 0.06 } },
  exit: { opacity: 0, x: -4, transition: { duration: 0.1 } },
};

/** Menu lateral retrátil em grafite, com indicador ativo compartilhado. */
export function Sidebar() {
  const pathname = usePathname();
  const storedCollapsed = useAppStore((s) => s.device.sidebarCollapsed);
  // Em telas estreitas o menu fica sempre recolhido (rail), sem roubar a largura do conteúdo.
  const narrow = useMediaQuery(NARROW_QUERY);
  const collapsed = storedCollapsed || narrow;
  const setCollapsed = useAppStore((s) => s.setSidebarCollapsed);
  const account = useActiveAccount();
  const records = useRecords(account);
  const now = useNow(60000);
  const streak = useMemo(() => computeStreak(records, now), [records, now]);

  const resume = useMemo(() => {
    const p = account.practiceSessions
      .filter((s) => s.status === "in_progress")
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    const sim = account.simulations
      .filter((s) => s.status === "in_progress")
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    const latest = [p, sim].filter(Boolean).sort((a, b) => b!.updatedAt.localeCompare(a!.updatedAt))[0];
    if (!latest) return null;
    return latest.kind === "practice"
      ? { href: `/questoes/sessao/${latest.id}`, label: "Lista em andamento", title: latest.title }
      : { href: `/simulados/prova/${latest.id}`, label: "Simulado em andamento", title: latest.title };
  }, [account.practiceSessions, account.simulations]);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? COLLAPSED : EXPANDED }}
      transition={spring.sidebar}
      className="sticky top-0 z-30 flex h-dvh shrink-0 flex-col bg-ink text-on-ink"
      aria-label="Navegação principal"
    >
      {/* Marca */}
      <div className={cn("flex h-20 items-center", collapsed ? "justify-center px-0" : "px-6")}>
        <Link href="/inicio" className="flex items-center gap-2.5 rounded-xl outline-offset-4" aria-label="Gabaritei — ir para o Início">
          <span className="rounded-[14px] shadow-md">
            <LogoMark size={40} />
          </span>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span {...labelMotion} className="font-display text-[1.3rem] font-bold tracking-[-0.03em] whitespace-nowrap">
                Gabaritei
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Controle de recolhimento integrado à borda */}
      <motion.button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        hidden={narrow}
        whileTap={{ scale: 0.92 }}
        className="absolute top-[30px] -right-3.5 z-10 grid size-7 place-items-center rounded-full border border-border bg-surface text-fg shadow-md outline-none transition-colors hover:border-border-strong hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-focus"
        aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        aria-expanded={!collapsed}
        title={collapsed ? "Expandir menu" : "Recolher menu"}
      >
        <motion.span animate={{ rotate: collapsed ? 180 : 0 }} transition={spring.snappy}>
          <ChevronLeft className="size-4" />
        </motion.span>
      </motion.button>

      <nav className={cn("mt-2 flex flex-col gap-1", collapsed ? "px-3" : "px-4")}>
        {!collapsed && <p className="mb-1 px-3 text-[11px] font-bold tracking-[0.1em] text-on-ink-muted/70 uppercase">Estudar</p>}
        {NAV_ITEMS.map((item) => {
          const active = isActive(item, pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex h-12 items-center rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-gold",
                collapsed ? "justify-center" : "gap-3 px-3.5",
                active ? "text-on-ink" : "text-on-ink-muted hover:text-on-ink",
              )}
            >
              {active && (
                <motion.span layoutId="sidebar-active" transition={spring.layout} className="absolute inset-0 rounded-2xl bg-ink-raised-strong ring-1 ring-ink-line">
                  <span className="absolute top-1/2 -left-px h-5 w-[3px] -translate-y-1/2 rounded-full bg-gold" />
                </motion.span>
              )}
              <span className="absolute inset-0 rounded-2xl bg-transparent transition-colors duration-200 group-hover:bg-ink-raised" />
              <span className="relative">
                <Icon className={cn("size-[20px] transition-colors", active && "text-gold")} strokeWidth={active ? 2.2 : 1.9} aria-hidden />
              </span>
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span {...labelMotion} className="relative text-[14.5px] font-semibold whitespace-nowrap">
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {collapsed && (
                <span className="pointer-events-none absolute left-[calc(100%+14px)] z-50 w-max max-w-[220px] rounded-xl bg-ink px-3 py-1.5 text-xs font-semibold text-on-ink opacity-0 shadow-lg ring-1 ring-ink-line transition-[opacity,transform] duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:opacity-100 -translate-x-1">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 p-4">
        {/* Atalho para retomar atividade */}
        {resume && (
          <Link
            href={resume.href}
            className={cn(
              "group relative flex items-center overflow-hidden rounded-2xl bg-ink-raised ring-1 ring-ink-line transition-colors hover:bg-ink-raised-strong outline-none focus-visible:ring-2 focus-visible:ring-gold",
              collapsed ? "size-[52px] justify-center self-center" : "gap-3 p-3",
            )}
            title={collapsed ? `Retomar: ${resume.title}` : undefined}
            aria-label={`Retomar ${resume.label.toLowerCase()}: ${resume.title}`}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gold text-on-gold shadow-sm transition-shadow duration-150 group-hover:shadow-md">
              <Play className="size-4 fill-current" aria-hidden />
            </span>
            {!collapsed && (
              <motion.span {...labelMotion} className="min-w-0">
                <span className="block text-[11px] font-semibold tracking-wide text-gold uppercase">{resume.label}</span>
                <span className="block truncate text-[13px] font-medium text-on-ink">{resume.title}</span>
              </motion.span>
            )}
          </Link>
        )}

        {/* Sequência */}
        <div
          className={cn("flex items-center rounded-2xl", collapsed ? "flex-col gap-0.5 py-2" : "gap-3 bg-ink-raised px-3 py-3")}
          title={collapsed ? `Sequência de ${streak.current} dias` : undefined}
        >
          <motion.span
            animate={streak.activeToday ? { scale: [1, 1.12, 1] } : undefined}
            transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2.4 }}
            className={cn("grid size-9 place-items-center rounded-xl", streak.current > 0 ? "bg-coral/20 text-coral" : "bg-ink-raised text-on-ink-muted")}
          >
            <Flame className="size-[18px]" aria-hidden />
          </motion.span>
          {collapsed ? (
            <span className="text-xs font-bold tabular">{streak.current}</span>
          ) : (
            <motion.div {...labelMotion} className="min-w-0">
              <p className="text-sm font-bold tabular">
                {streak.current} {streak.current === 1 ? "dia" : "dias"} seguidos
              </p>
              <p className="text-xs text-on-ink-muted">{streak.activeToday ? "Você já estudou hoje" : streak.current ? "Estude hoje para manter" : "Comece sua sequência hoje"}</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
