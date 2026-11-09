"use client";

import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, BarChart3, ChevronLeft, ChevronRight, Lightbulb, Sparkles } from "@/components/icons";
import { useState } from "react";
import type { SimulationSession } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Feedback";
import { SegmentedControl } from "@/components/ui/Form";
import { IllustrationClock } from "@/components/brand/Illustrations";
import { AlternativeList, QuestionBody, QuestionMeta } from "@/components/questions/QuestionView";
import { useActiveAccount } from "@/hooks/useAccount";
import { useHotkeys } from "@/hooks/useHotkeys";
import { questionNumber } from "@/lib/sessions/factory";
import { questionRepository } from "@/lib/repositories/questionRepository";
import { directionalSlide, spring } from "@/lib/animations";
import { cn } from "@/lib/utils/cn";

type Filter = "todas" | "erradas" | "branco" | "certas";

export function SimulationReviewPage() {
  const { id } = useParams<{ id: string }>();
  const account = useActiveAccount();
  const session = account.simulations.find((s) => s.id === id);
  if (!session || session.status !== "completed") {
    return <EmptyState illustration={<IllustrationClock />} title="Revisão indisponível" description="A revisão fica disponível depois que o simulado é finalizado." action={<ButtonLink href="/simulados">Ver simulados</ButtonLink>} />;
  }
  return <Review session={session} />;
}

function Review({ session }: { session: SimulationSession }) {
  const [filter, setFilter] = useState<Filter>("todas");
  const [[index, dir], setIndex] = useState<[number, number]>([0, 1]);

  const statusOf = (qid: string) => {
    const a = session.answers[qid];
    if (!a?.selected) return "branco" as const;
    return a.selected === questionRepository.getById(qid)?.correct ? ("certas" as const) : ("erradas" as const);
  };
  const visible = session.questionIds.map((q, i) => ({ q, i, st: statusOf(q) })).filter((x) => filter === "todas" || x.st === filter);
  const pos = Math.max(0, visible.findIndex((v) => v.i === index));
  const current = visible[pos] ?? visible[0];

  const go = (p: number) => {
    const target = visible[p];
    if (target) setIndex([target.i, p > pos ? 1 : -1]);
  };
  useHotkeys({ arrowright: () => go(pos + 1), arrowleft: () => go(pos - 1) });

  const counts = {
    todas: session.questionIds.length,
    certas: session.questionIds.filter((q) => statusOf(q) === "certas").length,
    erradas: session.questionIds.filter((q) => statusOf(q) === "erradas").length,
    branco: session.questionIds.filter((q) => statusOf(q) === "branco").length,
  };

  const q = current ? questionRepository.getById(current.q) : undefined;
  const a = current ? session.answers[current.q] : undefined;

  return (
    <div>
      <PageHeader
        eyebrow="Revisão do simulado"
        title={session.title}
        description="Navegue pela prova finalizada com o gabarito, sua resposta e a explicação de cada questão."
        actions={
          <>
            <ButtonLink href="/simulados" variant="ghost" icon={ArrowLeft}>
              Simulados
            </ButtonLink>
            <ButtonLink href={`/simulados/resultado/${session.id}`} variant="secondary" icon={BarChart3}>
              Resultado
            </ButtonLink>
          </>
        }
      />

      <SegmentedControl<Filter>
        ariaLabel="Filtrar questões"
        layoutId="review-filter"
        value={filter}
        onChange={(f) => {
          setFilter(f);
          const first = session.questionIds.findIndex((qq) => f === "todas" || statusOf(qq) === f);
          if (first >= 0) setIndex([first, 1]);
        }}
        options={[
          { value: "todas", label: `Todas · ${counts.todas}` },
          { value: "erradas", label: `Erradas · ${counts.erradas}` },
          { value: "branco", label: `Em branco · ${counts.branco}` },
          { value: "certas", label: `Certas · ${counts.certas}` },
        ]}
        className="mb-6"
      />

      {!q || !current ? (
        <EmptyState compact title="Nenhuma questão neste filtro" description="Escolha outro filtro para continuar a revisão." />
      ) : (
        <div className="grid grid-cols-12 items-start gap-6">
          <div className="col-span-12 lg:col-span-8">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.article key={current.q} custom={dir} variants={directionalSlide} initial="enter" animate="center" exit="exit" className="rounded-[var(--radius-panel)] border border-border bg-surface p-8 shadow-sm">
                <QuestionMeta question={q} number={`${questionNumber(session, current.i)}.`} />
                <div className="mt-6">
                  <QuestionBody question={q} />
                </div>
                <div className="mt-7">
                  <AlternativeList question={q} selected={a?.selected ?? null} revealed mode="review" disabled />
                </div>
                {!a?.selected && <p className="mt-4 rounded-2xl bg-surface-2 p-3 text-sm text-fg-muted">Você deixou esta questão em branco.</p>}
                <div className="mt-6 space-y-3 rounded-3xl bg-surface-2 p-6">
                  <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-fg-subtle uppercase">
                    <Lightbulb className="size-4 text-gold-fg" /> Explicação
                  </p>
                  <p className="text-[15px] leading-relaxed">{q.explanation}</p>
                  <p className="flex items-start gap-2 border-t border-border pt-3 text-sm text-fg-muted">
                    <Sparkles className="mt-0.5 size-4 shrink-0 text-gold-fg" /> <span><strong className="text-fg">Habilidade:</strong> {q.skill}</span>
                  </p>
                </div>
              </motion.article>
            </AnimatePresence>
            <div className="mt-5 flex items-center justify-between">
              <Button variant="ghost" icon={ChevronLeft} onClick={() => go(pos - 1)} disabled={pos === 0}>
                Anterior
              </Button>
              <span className="text-sm text-fg-muted tabular">
                {pos + 1} de {visible.length}
              </span>
              <Button iconRight={ChevronRight} onClick={() => go(pos + 1)} disabled={pos >= visible.length - 1}>
                Próxima
              </Button>
            </div>
          </div>

          <aside className="col-span-12 rounded-[var(--radius-card)] border border-border bg-surface p-5 lg:sticky lg:top-24 lg:col-span-4">
            <p className="text-sm font-semibold">Gabarito</p>
            {session.sections.map((sec) => (
              <div key={sec.areaId} className="mt-4">
                <p className="mb-2 text-[11px] font-bold tracking-[0.08em] text-fg-subtle uppercase">{sec.label}</p>
                <div className="grid grid-cols-6 gap-1.5">
                  {session.questionIds.slice(sec.start, sec.end).map((qid, j) => {
                    const i = sec.start + j;
                    const st = statusOf(qid);
                    const hidden = filter !== "todas" && st !== filter;
                    return (
                      <button
                        key={qid}
                        type="button"
                        disabled={hidden}
                        onClick={() => setIndex([i, i > index ? 1 : -1])}
                        aria-label={`Questão ${sec.firstNumber + j}: ${st === "certas" ? "correta" : st === "erradas" ? "errada" : "em branco"}`}
                        className={cn(
                          "relative grid h-9 place-items-center rounded-lg text-xs font-bold tabular transition-opacity",
                          st === "certas" && "bg-success-soft text-success",
                          st === "erradas" && "bg-danger-soft text-danger",
                          st === "branco" && "border border-dashed border-border-strong text-fg-subtle",
                          hidden && "opacity-25",
                        )}
                      >
                        {i === current.i && <motion.span layoutId="review-current" className="absolute -inset-[3px] rounded-[10px] ring-2 ring-primary" transition={spring.layout} />}
                        {sec.firstNumber + j}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
              <Badge tone="success" size="sm">Correta</Badge>
              <Badge tone="danger" size="sm">Errada</Badge>
              <Badge tone="outline" size="sm">Em branco</Badge>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
