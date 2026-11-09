"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eraser,
  Eye,
  EyeOff,
  Flag,
  Hourglass,
  PanelRightClose,
  PanelRightOpen,
  Pause,
  Play,
  Send,
} from "@/components/icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SimulationSession } from "@/types";
import { LogoMark } from "@/components/brand/Logo";
import { Button, IconButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/Feedback";
import { IconTile } from "@/components/ui/Card";
import { IllustrationClock } from "@/components/brand/Illustrations";
import { AlternativeList, QuestionBody, QuestionMeta } from "@/components/questions/QuestionView";
import { useActiveAccount } from "@/hooks/useAccount";
import { useNow } from "@/hooks/useNow";
import { useHotkeys } from "@/hooks/useHotkeys";
import { useAppStore } from "@/stores/appStore";
import { simulation } from "@/lib/sessions/reducers";
import { questionNumber } from "@/lib/sessions/factory";
import { questionRepository } from "@/lib/repositories/questionRepository";
import { formatClock } from "@/lib/format";
import { quietSlide, spring } from "@/lib/animations";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils/cn";
import { NARROW_QUERY, useMediaQuery } from "@/hooks/useMediaQuery";

const WARNING_MS = 15 * 60000;
let autoPause = { id: "", at: 0 };

export function ExamPage() {
  const { id } = useParams<{ id: string }>();
  const account = useActiveAccount();
  const session = account.simulations.find((s) => s.id === id);
  if (!session) {
    return (
      <div className="grid min-h-dvh place-items-center px-6">
        <EmptyState
          illustration={<IllustrationClock />}
          title="Simulado não encontrado"
          description="Ele pode ter sido descartado ou criado em outro navegador."
          action={
            <Link href="/simulados" className="inline-flex h-11 items-center rounded-2xl bg-primary px-5 text-sm font-semibold text-on-primary">
              Ver simulados
            </Link>
          }
        />
      </div>
    );
  }
  return <Exam session={session} />;
}

function Exam({ session }: { session: SimulationSession }) {
  const router = useRouter();
  const updateSimulation = useAppStore((s) => s.updateSimulation);
  const running = session.clock.runningSince !== null;
  const completed = session.status === "completed";
  const now = useNow(1000, running);
  const [dir, setDir] = useState(1);
  // Abaixo de 1024px a grade vira gaveta, fechada por padrão.
  const narrow = useMediaQuery(NARROW_QUERY);
  const [panelOpen, setPanelOpen] = useState(() => !window.matchMedia(NARROW_QUERY).matches);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [restored] = useState(() => session.status === "in_progress" && session.clock.runningSince === null && session.clock.elapsedMs > 0);
  const [showRestore, setShowRestore] = useState(restored);
  const warnedRef = useRef(false);

  const update = useCallback((fn: (s: SimulationSession) => SimulationSession) => updateSimulation(session.id, fn), [updateSimulation, session.id]);

  /* Ciclo de vida: inicia na primeira abertura, recupera, pausa ao sair. */
  const sidRef = useRef(session.id);
  useEffect(() => {
    const sid = sidRef.current;
    const store = useAppStore.getState();
    const find = () => {
      const st = useAppStore.getState();
      return st.activeAccountId ? st.accounts[st.activeAccountId]?.simulations.find((x) => x.id === sid) : undefined;
    };
    const cur = find();
    if (autoPause.id === sid && Date.now() - autoPause.at < 1200) {
      store.updateSimulation(sid, (s) => simulation.resume(s, Date.now()));
    } else if (cur && cur.status === "in_progress") {
      if (cur.clock.elapsedMs === 0 && cur.clock.runningSince === null) store.updateSimulation(sid, (s) => simulation.resume(s, Date.now()));
      else store.updateSimulation(sid, (s) => simulation.recover(s, Date.now()));
    }
    const pauseNow = () => {
      const c = find();
      if (c?.clock.runningSince !== null && c?.clock.runningSince !== undefined) autoPause = { id: sid, at: Date.now() };
      useAppStore.getState().updateSimulation(sid, (s) => simulation.pause(s, Date.now()));
    };
    const beat = window.setInterval(() => {
      useAppStore.getState().updateSimulation(sid, (s) => (s.clock.runningSince !== null ? simulation.heartbeat(s, Date.now()) : s));
    }, 15000);
    window.addEventListener("pagehide", pauseNow);
    return () => {
      window.clearInterval(beat);
      window.removeEventListener("pagehide", pauseNow);
      pauseNow();
    };
  }, []);

  const remaining = simulation.remaining(session, now);

  // Encerramento automático pelo tempo (inclusive ao restaurar uma sessão esgotada).
  useEffect(() => {
    if (completed || remaining > 0) return;
    update((s) => simulation.finish(s, "timeout", Date.now()));
    toast.info("Tempo esgotado", "O simulado foi encerrado automaticamente. Questões em branco contam como erro.");
  }, [remaining, completed, update]);

  useEffect(() => {
    if (completed) router.replace(`/simulados/resultado/${session.id}`);
  }, [completed, router, session.id]);

  useEffect(() => {
    if (!running || warnedRef.current || remaining > WARNING_MS || remaining <= 0) return;
    warnedRef.current = true;
    if (session.timerHidden) toast.info("Faltam 15 minutos", "Reserve um tempo para revisar as questões marcadas.");
  }, [running, remaining, session.timerHidden]);

  const index = session.currentIndex;
  const qid = session.questionIds[index];
  const question = questionRepository.getById(qid)!;
  const answer = session.answers[qid];
  const total = session.questionIds.length;
  const answered = useMemo(() => session.questionIds.filter((q) => session.answers[q]?.selected).length, [session]);
  const isMarked = session.marked.includes(qid);
  const number = questionNumber(session, index);
  const warning = remaining <= WARNING_MS;
  const section = session.sections.find((s) => index >= s.start && index < s.end);

  const go = (target: number) => {
    if (target < 0 || target >= total) return;
    setDir(target > index ? 1 : -1);
    update((s) => simulation.goTo(s, target, Date.now()));
  };
  const select = (l: Parameters<typeof simulation.select>[1]) => running && update((s) => simulation.select(s, l, Date.now()));
  const pause = () => update((s) => simulation.pause(s, Date.now()));
  const resume = () => {
    setShowRestore(false);
    update((s) => simulation.resume(s, Date.now()));
  };
  const finish = () => {
    setConfirmFinish(false);
    update((s) => simulation.finish(s, "manual", Date.now()));
  };
  const toggleMark = () => update((s) => simulation.toggleMark(s, qid, Date.now()));

  useHotkeys(
    {
      a: () => select("A"),
      b: () => select("B"),
      c: () => select("C"),
      d: () => select("D"),
      e: () => select("E"),
      arrowright: () => go(index + 1),
      arrowleft: () => go(index - 1),
      m: toggleMark,
      p: () => (running ? pause() : resume()),
    },
    !confirmFinish,
  );

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-30 border-b border-border bg-surface">
        <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
          <Link href="/simulados" className="flex items-center gap-3 rounded-xl pr-2 text-fg-muted hover:text-fg" aria-label="Sair do simulado (fica pausado e salvo)">
            <ArrowLeft className="size-[18px]" />
            <LogoMark size={30} className="max-sm:hidden" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{session.title}</p>
            <p className="text-xs text-fg-subtle">
              {answered} de {total} respondidas · {session.marked.length} marcadas
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <AnimatePresence initial={false}>
              {!session.timerHidden && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <motion.div
                    key={warning ? "warn" : "ok"}
                    animate={warning ? { scale: [1, 1.06, 1] } : undefined}
                    transition={{ duration: 0.6 }}
                    className={cn(
                      "mr-1 flex h-10 items-center gap-2 rounded-2xl px-3.5 text-sm font-bold whitespace-nowrap tabular transition-colors duration-200",
                      !running ? "bg-warning-soft text-warning" : warning ? "bg-coral-soft text-coral-strong" : "bg-surface-2 text-fg",
                    )}
                    role="timer"
                    aria-label={`Tempo restante: ${formatClock(remaining)}`}
                  >
                    <Hourglass className="size-4" aria-hidden />
                    {formatClock(remaining)}
                    {!running && <span className="text-xs font-semibold">pausado</span>}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            <IconButton className="max-sm:hidden" icon={session.timerHidden ? Eye : EyeOff} label={session.timerHidden ? "Mostrar cronômetro" : "Ocultar cronômetro"} onClick={() => update((s) => simulation.setTimerHidden(s, !s.timerHidden))} />
            <IconButton icon={running ? Pause : Play} label={running ? "Pausar (P)" : "Retomar (P)"} onClick={running ? pause : resume} variant={running ? "ghost" : "active"} />
            <IconButton icon={panelOpen ? PanelRightClose : PanelRightOpen} label={panelOpen ? "Recolher painel" : "Mostrar painel"} onClick={() => setPanelOpen((v) => !v)} />
            <Button size="sm" className="ml-1" icon={Send} onClick={() => setConfirmFinish(true)} aria-label="Finalizar simulado">
              <span className="max-sm:sr-only">Finalizar</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1320px] gap-6 px-4 py-6 lg:px-6 lg:py-7">
        <main className="relative min-w-0 flex-1">
          <div className="mb-4 flex items-center gap-2 text-sm text-fg-muted">
            {section && <Badge tone={section.areaId}>{section.label}</Badge>}
            <span>
              Questão <strong className="text-fg tabular">{number}</strong>
            </span>
          </div>
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.article key={qid} custom={dir} variants={quietSlide} initial="enter" animate="center" exit="exit" className="rounded-[var(--radius-panel)] border border-border bg-surface p-8 shadow-xs">
              <QuestionMeta question={question} number={`${number}.`} compact />
              <div className="mt-6">
                <QuestionBody question={question} />
              </div>
              <div className="mt-7">
                <AlternativeList question={question} selected={answer?.selected ?? null} revealed={false} onSelect={select} mode="exam" disabled={!running} />
              </div>
            </motion.article>
          </AnimatePresence>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <Button variant="ghost" icon={ChevronLeft} onClick={() => go(index - 1)} disabled={index === 0}>
              Anterior
            </Button>
            <Button variant={isMarked ? "soft" : "ghost"} icon={Flag} onClick={toggleMark} aria-pressed={isMarked} className={cn(isMarked && "text-gold-fg")}>
              {isMarked ? "Marcada" : "Marcar para revisar"}
            </Button>
            {answer?.selected && (
              <Button variant="ghost" icon={Eraser} onClick={() => update((s) => simulation.select(s, null, Date.now()))}>
                Limpar resposta
              </Button>
            )}
            <div className="ml-auto">
              {index < total - 1 ? (
                <Button iconRight={ChevronRight} onClick={() => go(index + 1)}>
                  Próxima
                </Button>
              ) : (
                <Button variant="accent" icon={Send} onClick={() => setConfirmFinish(true)}>
                  Finalizar simulado
                </Button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {!running && !completed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 grid place-items-start justify-center rounded-[var(--radius-panel)] bg-bg/75 pt-24 backdrop-blur-md" /* EXCEÇÃO ao noise/backdrop-blur: scrim de pausa funciona como diálogo e o desfoque esconde a questão enquanto o tempo está parado */>
                <motion.div initial={{ y: 16 }} animate={{ y: 0 }} transition={spring.soft} className="mx-4 w-full max-w-[400px] rounded-[var(--radius-panel)] border border-border bg-surface p-6 text-center shadow-lg sm:p-8">
                  <IconTile tone="gold" size="lg" className="mx-auto">
                    {showRestore ? <Play /> : <Pause />}
                  </IconTile>
                  <h2 className="mt-5 font-display text-2xl font-bold">{showRestore ? "Simulado salvo" : "Simulado pausado"}</h2>
                  <p className="mt-2 text-sm text-fg-muted">
                    {answered} de {total} respondidas · restam <strong className="text-fg tabular">{formatClock(remaining)}</strong>. As questões ficam ocultas enquanto o tempo está parado.
                  </p>
                  <Button variant="accent" size="lg" icon={Play} fullWidth className="mt-6" onClick={resume}>
                    {showRestore ? "Continuar simulado" : "Retomar"}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <AnimatePresence initial={false}>
          {panelOpen && narrow && (
            <motion.div key="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-overlay" onClick={() => setPanelOpen(false)} aria-hidden />
          )}
          {panelOpen && (
            <motion.aside
              key="panel"
              initial={narrow ? { x: 360 } : { opacity: 0, width: 0 }}
              animate={narrow ? { x: 0 } : { opacity: 1, width: 320 }}
              exit={narrow ? { x: 360 } : { opacity: 0, width: 0 }}
              transition={spring.soft}
              className={cn("shrink-0 overflow-hidden", narrow && "fixed inset-y-0 right-0 z-50 w-[340px] max-w-[calc(100vw-48px)] bg-bg p-3")}
              aria-label="Grade de questões"
            >
              <div className={cn("overflow-y-auto rounded-[var(--radius-card)] border border-border bg-surface p-5", narrow ? "h-full" : "sticky top-24 max-h-[calc(100dvh-7rem)] w-[320px]")}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Questões</p>
                  <span className="text-xs text-fg-subtle tabular">
                    {answered}/{total}
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-3">
                  <motion.div className="h-full origin-left bg-primary" animate={{ scaleX: answered / total }} transition={spring.soft} />
                </div>
                {session.sections.map((sec) => (
                  <div key={sec.areaId} className="mt-5">
                    <p className="mb-2 text-[11px] font-bold tracking-[0.08em] text-fg-subtle uppercase">{sec.label}</p>
                    <div className="grid grid-cols-6 gap-1.5">
                      {session.questionIds.slice(sec.start, sec.end).map((q, j) => {
                        const i = sec.start + j;
                        const a = session.answers[q];
                        const cur = i === index;
                        const mk = session.marked.includes(q);
                        return (
                          <button
                            key={q}
                            type="button"
                            onClick={() => go(i)}
                            aria-current={cur ? "step" : undefined}
                            aria-label={`Questão ${sec.firstNumber + j}: ${a?.selected ? `respondida (${a.selected})` : "em branco"}${mk ? ", marcada" : ""}`}
                            className={cn(
                              "relative grid h-9 place-items-center rounded-lg text-xs font-bold tabular transition-colors duration-200",
                              a?.selected ? "bg-primary text-on-primary" : "border border-border text-fg-muted hover:border-border-strong hover:text-fg",
                            )}
                          >
                            {cur && <motion.span layoutId="exam-current" className="absolute -inset-[3px] rounded-[10px] ring-2 ring-gold-strong" transition={spring.layout} />}
                            {sec.firstNumber + j}
                            {mk && <Flag className="absolute -top-1 -right-1 size-3 fill-gold text-gold-strong" aria-hidden />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-4 text-[11px] text-fg-subtle">
                  <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-primary" /> Respondida</span>
                  <span className="flex items-center gap-1.5"><span className="size-3 rounded border border-border-strong" /> Em branco</span>
                  <span className="flex items-center gap-1.5"><Flag className="size-3 fill-gold text-gold-strong" /> Marcada</span>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <ConfirmDialog
        open={confirmFinish}
        onClose={() => setConfirmFinish(false)}
        onConfirm={finish}
        icon={
          <IconTile tone={total - answered > 0 ? "coral" : "sage"} size="lg">
            {total - answered > 0 ? <AlertTriangle /> : <Send />}
          </IconTile>
        }
        title="Finalizar o simulado?"
        description={
          <span className="block space-y-2">
            {total - answered > 0 ? (
              <span className="block">
                Você deixou <strong className="text-fg">{total - answered} {total - answered === 1 ? "questão em branco" : "questões em branco"}</strong>. Elas serão contadas como erro.
              </span>
            ) : (
              <span className="block">Todas as {total} questões foram respondidas.</span>
            )}
            {session.marked.length > 0 && (
              <span className="block">
                Há {session.marked.length} {session.marked.length === 1 ? "questão marcada" : "questões marcadas"} para revisar.
              </span>
            )}
            <span className="block">Depois de finalizar, não será possível alterar as respostas.</span>
          </span>
        }
        confirmLabel="Finalizar e ver resultado"
        cancelLabel="Voltar à prova"
      />
    </div>
  );
}
