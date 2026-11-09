"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowRight, ArrowUp, CornerDownLeft, FileQuestion, Search, Settings, User } from "@/components/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SUBJECTS, TOPICS, SUBJECT_BY_ID } from "@/data/fixtures/taxonomy";
import { questionRepository } from "@/lib/repositories/questionRepository";
import { normalizeText } from "@/lib/format";
import { modalVariants, overlayVariants } from "@/lib/animations";
import { NAV_ITEMS } from "./navItems";
import { SUBJECT_ICON } from "@/components/questions/subjectMeta";
import { useStartPractice } from "@/features/practice/useStartPractice";
import { Kbd } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";

interface ResultItem {
  id: string;
  group: "Páginas" | "Matérias" | "Assuntos" | "Questões";
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  run: () => void;
}

/** Busca global (Ctrl/⌘ + K): páginas, matérias, assuntos e questões. */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const startPractice = useStartPractice();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo<ResultItem[]>(() => {
    const q = normalizeText(query.trim());
    const go = (href: string) => () => {
      onClose();
      router.push(href);
    };
    const pages: ResultItem[] = [
      ...NAV_ITEMS.map((n) => ({ id: `p-${n.href}`, group: "Páginas" as const, title: n.label, subtitle: n.description, icon: n.icon, run: go(n.href) })),
      { id: "p-perfil", group: "Páginas", title: "Perfil", subtitle: "Dados pessoais e conquistas", icon: User, run: go("/perfil") },
      { id: "p-config", group: "Páginas", title: "Configurações", subtitle: "Tema, cronômetro e preferências", icon: Settings, run: go("/configuracoes") },
    ];
    if (!q) return pages;
    const subjects: ResultItem[] = SUBJECTS.filter((s) => normalizeText(s.name).includes(q)).map((s) => ({
      id: `s-${s.id}`,
      group: "Matérias",
      title: s.name,
      subtitle: `${s.topics.length} assuntos · praticar questões`,
      icon: SUBJECT_ICON[s.id],
      run: go(`/questoes?materia=${s.id}`),
    }));
    const topics: ResultItem[] = TOPICS.filter(
      (t) => normalizeText(t.name).includes(q) || t.subtopics.some((s) => normalizeText(s.name).includes(q)),
    )
      .slice(0, 6)
      .map((t) => ({
        id: `t-${t.id}`,
        group: "Assuntos",
        title: t.name,
        subtitle: SUBJECT_BY_ID[t.subjectId].name,
        icon: SUBJECT_ICON[t.subjectId],
        run: go(`/questoes?materia=${t.subjectId}&assunto=${t.id}`),
      }));
    const questions: ResultItem[] = questionRepository.search(query, 5).map((qq) => ({
      id: `q-${qq.id}`,
      group: "Questões",
      title: (qq.support?.paragraphs[0] ?? qq.prompt).slice(0, 90) + "…",
      subtitle: `${SUBJECT_BY_ID[qq.subjectId].name} · praticar esta questão`,
      icon: FileQuestion,
      run: () => {
        onClose();
        startPractice({ mode: "single", title: "Questão avulsa", questionIds: [qq.id], filters: { subjectId: qq.subjectId } });
      },
    }));
    return [...pages.filter((p) => normalizeText(p.title).includes(q)), ...subjects, ...topics, ...questions];
  }, [query, onClose, router, startPractice]);

  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      results[active]?.run();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (typeof document === "undefined") return null;

  let lastGroup = "";
  return createPortal(
    <AnimatePresence onExitComplete={() => setQuery("")}>
      {open && (
        <div className="fixed inset-0 z-[75] flex items-start justify-center px-4 pt-[12vh]">
          <motion.div variants={overlayVariants} initial="hidden" animate="show" exit="exit" className="absolute inset-0 bg-overlay backdrop-blur-[3px]" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Busca global"
            variants={modalVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-border bg-surface shadow-lg"
          >
            <div className="flex items-center gap-3 border-b border-border px-5">
              <Search className="size-5 text-fg-subtle" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Buscar matérias, assuntos e questões…"
                className="h-16 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-fg-subtle"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-results"
                aria-activedescendant={results[active] ? `palette-${results[active].id}` : undefined}
              />
              <Kbd>Esc</Kbd>
            </div>
            <div ref={listRef} id="palette-results" role="listbox" className="max-h-[52vh] overflow-y-auto p-2">
              {results.length === 0 && (
                <div className="px-4 py-12 text-center">
                  <p className="font-semibold">Nada encontrado para “{query}”</p>
                  <p className="mt-1 text-sm text-fg-muted">Tente o nome de uma matéria (ex.: Química) ou de um assunto (ex.: porcentagem).</p>
                </div>
              )}
              {results.map((r, i) => {
                const header = r.group !== lastGroup ? r.group : null;
                lastGroup = r.group;
                const Icon = r.icon;
                return (
                  <div key={r.id}>
                    {header && <p className="px-3 pt-3 pb-1.5 text-[11px] font-bold tracking-[0.08em] text-fg-subtle uppercase">{header}</p>}
                    <motion.button
                      type="button"
                      id={`palette-${r.id}`}
                      role="option"
                      aria-selected={i === active}
                      data-index={i}
                      onMouseMove={() => setActive(i)}
                      onClick={r.run}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i, 8) * 0.02 }}
                      className={cn("relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left", i === active ? "text-fg" : "text-fg-muted")}
                    >
                      {i === active && <motion.span layoutId="palette-active" className="absolute inset-0 rounded-2xl bg-surface-2" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                      <span className="relative grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-surface">
                        <Icon className="size-4" />
                      </span>
                      <span className="relative min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{r.title}</span>
                        <span className="block truncate text-xs text-fg-subtle">{r.subtitle}</span>
                      </span>
                      {i === active ? <CornerDownLeft className="relative size-4 text-fg-subtle" /> : <ArrowRight className="relative size-4 opacity-0" />}
                    </motion.button>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 border-t border-border bg-surface-2/60 px-5 py-2.5 text-xs text-fg-subtle">
              <span className="flex items-center gap-1.5">
                <Kbd aria-label="seta para cima"><ArrowUp className="size-3" aria-hidden /></Kbd>
                <Kbd aria-label="seta para baixo"><ArrowDown className="size-3" aria-hidden /></Kbd> navegar
              </span>
              <span className="flex items-center gap-1.5">
                <Kbd>Enter</Kbd> abrir
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
