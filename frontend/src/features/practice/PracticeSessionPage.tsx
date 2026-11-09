"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Eye,
  EyeOff,
  Flag,
  Focus,
  PanelRightOpen,
  Lightbulb,
  Pause,
  Play,
  Shuffle,
  SkipForward,
  Sparkles,
  Star,
  XCircle,
} from "@/components/icons";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PracticeSession } from "@/types";
import { LogoMark } from "@/components/brand/Logo";
import { Button, IconButton } from "@/components/ui/Button";
import { Badge, Kbd } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/Modal";
import { Collapse, EmptyState } from "@/components/ui/Feedback";
import { IconTile } from "@/components/ui/Card";
import { IllustrationFlag } from "@/components/brand/Illustrations";
import { AlternativeList, QuestionBody, QuestionMeta } from "@/components/questions/QuestionView";
import { useActiveAccount } from "@/hooks/useAccount";
import { useNow } from "@/hooks/useNow";
import { useHotkeys } from "@/hooks/useHotkeys";
import { useShake } from "@/hooks/useShake";
import { useAppStore } from "@/stores/appStore";
import { practice } from "@/lib/sessions/reducers";
import { clockElapsed } from "@/lib/sessions/clock";
import { questionRepository } from "@/lib/repositories/questionRepository";
import { pickQuestions } from "@/lib/recommendations/engine";
import { collectAnswerRecords } from "@/lib/calculations/records";
import { createRng } from "@/lib/random";
import { formatClock } from "@/lib/format";
import { directionalSlide, spring } from "@/lib/animations";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils/cn";
import { NARROW_QUERY, useMediaQuery } from "@/hooks/useMediaQuery";

/** Registro da última pausa automática (para distinguir remontagens de saídas reais). */
let autoPause = { id: "", at: 0 };

export function PracticeSessionPage() {
  const { id } = useParams<{ id: string }>();
  const account = useActiveAccount();
  const session = account.practiceSessions.find((s) => s.id === id);
  if (!session) {
    return (
      <div className="grid min-h-dvh place-items-center px-6">
        <EmptyState
          illustration={<IllustrationFlag />}
          title="Lista não encontrada"
          description="Ela pode ter sido removida ou criada em outro navegador."
          action={
            <Link href="/questoes" className="inline-flex h-11 items-center rounded-2xl bg-primary px-5 text-sm font-semibold text-on-primary">
              Montar nova lista
            </Link>
          }
        />
      </div>
    );
  }
  return <Session session={session} />;
}

function Session({ session }: { session: PracticeSession }) {
  const router = useRouter();
  const account = useActiveAccount();
  const updatePractice = useAppStore((s) => s.updatePractice);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const toggleReviewMark = useAppStore((s) => s.toggleReviewMark);
  const running = session.clock.runningSince !== null;
  const now = useNow(1000, running);
  const [focusMode, setFocusMode] = useState(false);
  // Abaixo de 1024px o painel vira gaveta sobreposta, aberta sob demanda.
  const narrow = useMediaQuery(NARROW_QUERY);
  const [drawer, setDrawer] = useState(false);
  const showPanel = narrow ? drawer : !focusMode;
  const [dir, setDir] = useState(1);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [showExplanation, setShowExplanation] = useState(true);
  const [feedbackRef, shakeFeedback] = useShake<HTMLDivElement>();
  const [welcomeBack, setWelcomeBack] = useState(() => session.status === "in_progress" && session.clock.runningSince === null && session.clock.elapsedMs > 0);

  const update = useCallback((fn: (s: PracticeSession) => PracticeSession) => updatePractice(session.id, fn), [updatePractice, session.id]);

  const index = session.currentIndex;
  const qid = session.questionIds[index];
  const question = questionRepository.getById(qid)!;
  const answer = session.answers[qid];
  const confirmed = !!answer?.confirmed;
  const total = session.questionIds.length;
  const answeredCount = session.questionIds.filter((q) => session.answers[q]?.confirmed).length;
  const isLast = index === total - 1;
  const completed = session.status === "completed";

  /* Ciclo de vida do cronômetro: recupera, pausa ao sair e envia "batimentos". */
  const sessionIdRef = useRef(session.id);
  useEffect(() => {
    const sid = sessionIdRef.current;
    const store = useAppStore.getState();
    // Remontagem imediata (ex.: StrictMode em desenvolvimento) não deve pausar a sessão.
    if (autoPause.id === sid && Date.now() - autoPause.at < 1200) {
      store.updatePractice(sid, (s) => practice.resume(s, Date.now()));
    } else {
      store.updatePractice(sid, (s) => practice.recover(s, Date.now()));
    }
    const pauseNow = () => {
      const s = useAppStore.getState();
      const cur = s.activeAccountId ? s.accounts[s.activeAccountId]?.practiceSessions.find((x) => x.id === sid) : null;
      if (cur?.clock.runningSince !== null && cur?.clock.runningSince !== undefined) autoPause = { id: sid, at: Date.now() };
      s.updatePractice(sid, (x) => practice.pause(x, Date.now()));
    };
    const beat = window.setInterval(() => {
      useAppStore.getState().updatePractice(sid, (s) => (s.clock.runningSince !== null ? practice.heartbeat(s, Date.now()) : s));
    }, 15000);
    window.addEventListener("pagehide", pauseNow);
    return () => {
      window.clearInterval(beat);
      window.removeEventListener("pagehide", pauseNow);
      pauseNow();
    };
  }, []);

  useEffect(() => {
    if (completed) router.replace(`/questoes/resultado/${session.id}`);
  }, [completed, router, session.id]);

  const go = (target: number) => {
    if (target < 0 || target >= total) return;
    setDir(target > (latest()?.currentIndex ?? index) ? 1 : -1);
    setShowExplanation(true);
    update((s) => practice.goTo(s, target, Date.now()));
  };

  const select = (letter: Parameters<typeof practice.select>[1]) => {
    if (!running) return;
    update((s) => practice.select(s, letter, Date.now()));
  };

  /** Lê o estado mais recente do armazenamento (atalhos podem disparar antes do re-render). */
  const latest = () => {
    const st = useAppStore.getState();
    return st.activeAccountId ? st.accounts[st.activeAccountId]?.practiceSessions.find((x) => x.id === session.id) : undefined;
  };

  const confirm = () => {
    const cur = latest();
    if (!cur || cur.clock.runningSince === null) return;
    const curId = cur.questionIds[cur.currentIndex];
    const a = cur.answers[curId];
    if (!a?.selected || a.confirmed) return;
    const correct = a.selected === questionRepository.getById(curId)?.correct;
    update((s) => practice.confirm(s, Date.now()));
    setShowExplanation(true);
    if (!correct) requestAnimationFrame(() => shakeFeedback());
  };

  const pause = () => update((s) => practice.pause(s, Date.now()));
  const resume = () => {
    setWelcomeBack(false);
    update((s) => practice.resume(s, Date.now()));
  };

  const next = () => {
    const cur = latest() ?? session;
    const i = cur.currentIndex;
    const done = cur.questionIds.filter((q) => cur.answers[q]?.confirmed).length;
    const pending = cur.questionIds.findIndex((q) => !cur.answers[q]?.confirmed);
    if (i < cur.questionIds.length - 1) go(i + 1);
    else if (done === cur.questionIds.length) finish();
    else if (pending >= 0) go(pending);
    else setConfirmFinish(true);
  };

  const finish = () => {
    setConfirmFinish(false);
    update((s) => practice.finish(s, Date.now()));
  };

  const addSimilar = (kind: "similar" | "random") => {
    const records = collectAnswerRecords(account);
    const pool = questionRepository
      .query(kind === "similar" ? { topicIds: [question.topicId] } : { subjectId: question.subjectId })
      .filter((q) => !session.questionIds.includes(q.id));
    const fallback = kind === "similar" ? questionRepository.query({ subjectId: question.subjectId }).filter((q) => !session.questionIds.includes(q.id)) : [];
    const [pick] = pickQuestions(pool.length ? pool : fallback, 1, records, createRng(Date.now()), account.onboarding.level);
    if (!pick) {
      toast.info("Sem novas questões", "Você já incluiu todas as questões disponíveis deste assunto.");
      return;
    }
    setDir(1);
    setShowExplanation(true);
    update((s) => practice.insertNext(s, pick.id, Date.now()));
    toast.success(kind === "similar" ? "Questão semelhante adicionada" : "Nova questão adicionada", "Ela entrou logo após a atual na sua lista.");
  };

  const favorite = account.favorites.includes(qid);
  const marked = account.reviewMarks.includes(qid);

  useHotkeys(
    {
      a: () => select("A"),
      b: () => select("B"),
      c: () => select("C"),
      d: () => select("D"),
      e: () => select("E"),
      enter: () => {
        const cur = latest();
        if (cur && cur.answers[cur.questionIds[cur.currentIndex]]?.confirmed) next();
        else confirm();
      },
      arrowright: () => go(index + 1),
      arrowleft: () => go(index - 1),
      p: () => (running ? pause() : resume()),
      m: () => toggleReviewMark(qid),
      f: () => setFocusMode((v) => !v),
    },
    !confirmFinish,
  );

  const elapsed = clockElapsed(session.clock, now);
  const progress = answeredCount / total;
  const correctSoFar = session.questionIds.filter((q) => session.answers[q]?.correct).length;

  return (
    <div className="min-h-dvh bg-bg">
      {/* Barra superior */}
      <header className="sticky top-0 z-30 border-b border-border bg-bg">
        <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
          <Link href="/questoes" className="flex items-center gap-3 rounded-xl pr-2 text-sm font-semibold text-fg-muted hover:text-fg" aria-label="Sair da lista (o progresso fica salvo)">
            <ArrowLeft className="size-[18px]" />
            <LogoMark size={30} className="max-sm:hidden" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{session.title}</p>
            <p className="text-xs text-fg-subtle">
              Questão {index + 1} de {total} · {answeredCount} respondidas
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            {session.timerVisible ? (
              <motion.div layout className={cn("mr-1 flex h-10 items-center gap-2 rounded-2xl px-3.5 text-sm font-bold tabular", running ? "bg-surface-2 text-fg" : "bg-warning-soft text-warning")}>
                <Clock className="size-4" aria-hidden />
                <span aria-label={`Tempo: ${formatClock(elapsed)}`}>{formatClock(elapsed)}</span>
                {!running && <span className="text-xs font-semibold">pausado</span>}
              </motion.div>
            ) : null}
            <IconButton className="max-sm:hidden" icon={session.timerVisible ? EyeOff : Eye} label={session.timerVisible ? "Ocultar cronômetro" : "Mostrar cronômetro"} onClick={() => update((s) => practice.setTimerVisible(s, !s.timerVisible))} />
            <IconButton icon={running ? Pause : Play} label={running ? "Pausar (P)" : "Retomar (P)"} onClick={running ? pause : resume} variant={running ? "ghost" : "active"} />
            <IconButton className="max-lg:hidden" icon={Focus} label={focusMode ? "Sair do modo leitura (F)" : "Modo leitura concentrada (F)"} onClick={() => setFocusMode((v) => !v)} variant={focusMode ? "active" : "ghost"} />
            <IconButton className="lg:hidden" icon={PanelRightOpen} label="Painel da lista" onClick={() => setDrawer((v) => !v)} variant={drawer ? "active" : "ghost"} aria-expanded={drawer} />
            <Button variant="secondary" size="sm" className="ml-1" icon={Flag} onClick={() => setConfirmFinish(true)} aria-label="Finalizar lista">
              <span className="max-sm:sr-only">Finalizar</span>
            </Button>
          </div>
        </div>
        <div className="h-1 w-full bg-surface-3">
          <motion.div className="h-full origin-left bg-gold" animate={{ scaleX: progress }} transition={spring.soft} />
        </div>
      </header>

      <div className={cn("mx-auto flex gap-8 px-4 py-6 lg:px-6 lg:py-8", focusMode ? "max-w-4xl" : "max-w-[1240px]")}>
        {/* Questão */}
        <main className="relative min-w-0 flex-1">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.article key={qid} custom={dir} variants={directionalSlide} initial="enter" animate="center" exit="exit" aria-live="polite">
              <div className={cn("rounded-[var(--radius-panel)] border border-border bg-surface shadow-sm", focusMode ? "p-6 sm:p-10" : "p-5 sm:p-8")}>
                {!focusMode && <QuestionMeta question={question} number={`${index + 1}.`} />}
                <div className={cn(!focusMode && "mt-6")}>
                  <QuestionBody question={question} large={focusMode} />
                </div>
                <div className="mt-7">
                  <AlternativeList question={question} selected={answer?.selected ?? null} revealed={confirmed} onSelect={select} mode="practice" disabled={confirmed || !running} large={focusMode} />
                </div>
              </div>

              {/* Feedback e explicação */}
              <AnimatePresence>
                {confirmed && (
                  <motion.div ref={feedbackRef} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring.soft} className="mt-5">
                    <div className={cn("rounded-[var(--radius-card)] border p-5", answer.correct ? "border-success/30 bg-success-soft" : "border-danger/30 bg-danger-soft")}>
                      <div className="flex items-center gap-3">
                        <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={spring.bouncy} className={answer.correct ? "text-success" : "text-danger"}>
                          {answer.correct ? <CheckCircle2 className="size-7" /> : <XCircle className="size-7" />}
                        </motion.span>
                        <div className="flex-1">
                          <p className="font-display text-lg font-semibold">{answer.correct ? "Resposta correta!" : "Resposta incorreta"}</p>
                          <p className="text-sm text-fg-muted">
                            {answer.correct ? "Muito bem. Confira a explicação para fixar o raciocínio." : `A alternativa correta é a ${question.correct}. Veja a explicação abaixo.`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowExplanation((v) => !v)}
                          aria-expanded={showExplanation}
                          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-fg-muted hover:bg-surface/60 hover:text-fg"
                        >
                          <Lightbulb className="size-4" /> {showExplanation ? "Ocultar explicação" : "Ver explicação"}
                        </button>
                      </div>
                      <Collapse open={showExplanation}>
                        <div className="mt-4 space-y-3 rounded-2xl bg-surface p-5">
                          <p className="text-[15px] leading-relaxed text-fg">{question.explanation}</p>
                          <p className="flex items-start gap-2 border-t border-border pt-3 text-sm text-fg-muted">
                            <Sparkles className="mt-0.5 size-4 shrink-0 text-gold-fg" />
                            <span>
                              <strong className="font-semibold text-fg">Habilidade avaliada:</strong> {question.skill}
                            </span>
                          </p>
                        </div>
                      </Collapse>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.article>
          </AnimatePresence>

          {/* Ações */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button variant="ghost" icon={ChevronLeft} onClick={() => go(index - 1)} disabled={index === 0}>
              Anterior
            </Button>
            <div className="ml-auto flex flex-wrap items-center gap-2.5">
              {!confirmed ? (
                <>
                  <Button variant="ghost" icon={SkipForward} onClick={() => (isLast ? next() : go(index + 1))}>
                    Pular
                  </Button>
                  <Button size="lg" icon={CheckCircle2} disabled={!answer?.selected || !running} onClick={confirm}>
                    Confirmar resposta
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" icon={Sparkles} onClick={() => addSimilar("similar")}>
                    Semelhante
                  </Button>
                  <Button variant="secondary" icon={Shuffle} onClick={() => addSimilar("random")}>
                    Aleatória
                  </Button>
                  <Button size="lg" iconRight={answeredCount === total ? Flag : ArrowRight} onClick={next} variant={answeredCount === total ? "accent" : "primary"}>
                    {answeredCount === total ? "Ver resultado" : isLast ? "Próxima pendente" : "Próxima questão"}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Pausa / retomada */}
          <AnimatePresence>
            {!running && !completed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 grid place-items-start justify-center rounded-[var(--radius-panel)] bg-bg/70 pt-24 backdrop-blur-md" /* EXCEÇÃO ao noise/backdrop-blur: scrim de pausa funciona como diálogo e o desfoque esconde a questão enquanto o tempo está parado */
              >
                <motion.div initial={{ y: 20, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 10, opacity: 0 }} transition={spring.soft} className="mx-4 w-full max-w-[380px] rounded-[var(--radius-panel)] border border-border bg-surface p-6 text-center shadow-lg sm:p-8">
                  <IconTile tone="gold" size="lg" className="mx-auto">
                    {welcomeBack ? <Play /> : <Pause />}
                  </IconTile>
                  <h2 className="mt-5 font-display text-2xl font-bold">{welcomeBack ? "Bem-vindo de volta!" : "Lista pausada"}</h2>
                  <p className="mt-2 text-sm text-fg-muted">
                    {welcomeBack
                      ? `Seu progresso foi salvo: ${answeredCount} de ${total} respondidas em ${formatClock(elapsed)}.`
                      : "O cronômetro está parado e a questão fica oculta até você retomar."}
                  </p>
                  <Button variant="accent" size="lg" icon={Play} fullWidth className="mt-6" onClick={resume} data-autofocus>
                    {welcomeBack ? "Continuar lista" : "Retomar"}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Painel auxiliar */}
        <AnimatePresence initial={false}>
          {showPanel && narrow && (
            <motion.div key="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-overlay" onClick={() => setDrawer(false)} aria-hidden />
          )}
          {showPanel && (
            <motion.aside
              key="panel"
              initial={narrow ? { x: 340 } : { opacity: 0, x: 24, width: 0 }}
              animate={narrow ? { x: 0 } : { opacity: 1, x: 0, width: 300 }}
              exit={narrow ? { x: 340 } : { opacity: 0, x: 24, width: 0 }}
              transition={spring.soft}
              className={cn("shrink-0", narrow && "fixed inset-y-0 right-0 z-50 w-[320px] max-w-[calc(100vw-48px)] overflow-y-auto border-l border-border bg-bg p-4")}
              aria-label="Painel da lista"
            >
              <div className={cn("w-full space-y-4 lg:sticky lg:top-24 lg:w-[300px]")}>
                <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Navegação</p>
                    <Badge size="sm" tone="sage">
                      {correctSoFar}/{answeredCount} acertos
                    </Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-5 gap-2">
                    {session.questionIds.map((q, i) => {
                      const a = session.answers[q];
                      const isCur = i === index;
                      const isMarked = account.reviewMarks.includes(q);
                      return (
                        <motion.button
                          key={q}
                          type="button"
                          layout
                          whileTap={{ scale: 0.9 }}
                          onClick={() => go(i)}
                          aria-label={`Questão ${i + 1}: ${a?.confirmed ? (a.correct ? "acertou" : "errou") : "não respondida"}${isMarked ? ", marcada para revisão" : ""}`}
                          aria-current={isCur ? "step" : undefined}
                          className={cn(
                            "relative grid h-10 place-items-center rounded-xl text-sm font-bold tabular transition-colors",
                            a?.confirmed ? (a.correct ? "bg-success-soft text-success" : "bg-danger-soft text-danger") : "bg-surface-2 text-fg-muted hover:bg-surface-3",
                          )}
                        >
                          {isCur && <motion.span layoutId="practice-current" className="absolute inset-0 rounded-xl ring-2 ring-primary" transition={spring.layout} />}
                          {i + 1}
                          {isMarked && <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-gold ring-2 ring-surface" />}
                        </motion.button>
                      );
                    })}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-fg-subtle">
                    <span className="flex items-center gap-1.5"><span className="size-2.5 rounded bg-success-soft ring-1 ring-success/40" /> Acerto</span>
                    <span className="flex items-center gap-1.5"><span className="size-2.5 rounded bg-danger-soft ring-1 ring-danger/40" /> Erro</span>
                    <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-gold" /> Revisar</span>
                  </div>
                </div>

                <div className="space-y-2 rounded-[var(--radius-card)] border border-border bg-surface p-3 shadow-sm">
                  <ToggleRow
                    active={marked}
                    onClick={() => {
                      const added = toggleReviewMark(qid);
                      toast.info(added ? "Marcada para revisão" : "Marcação removida", added ? "Encontre-a em Histórico › Para revisar." : undefined);
                    }}
                    icon={marked ? BookmarkCheck : Bookmark}
                    label={marked ? "Marcada para revisão" : "Marcar para revisão"}
                    kbd="M"
                  />
                  <ToggleRow
                    active={favorite}
                    onClick={() => {
                      const added = toggleFavorite(qid);
                      if (added) toast.success("Adicionada às favoritas");
                    }}
                    icon={Star}
                    label={favorite ? "Nas favoritas" : "Favoritar questão"}
                  />
                </div>

                <div className="rounded-[var(--radius-card)] border border-border bg-surface-2/60 p-4 text-xs text-fg-muted">
                  <p className="mb-2 font-semibold text-fg">Atalhos</p>
                  <ul className="space-y-1.5">
                    <li className="flex justify-between"><span>Escolher alternativa</span><span className="flex gap-1"><Kbd>A</Kbd>–<Kbd>E</Kbd></span></li>
                    <li className="flex justify-between"><span>Confirmar / avançar</span><Kbd>Enter</Kbd></li>
                    <li className="flex justify-between"><span>Navegar</span><span className="flex gap-1"><Kbd aria-label="seta para a esquerda"><ArrowLeft className="size-3" aria-hidden /></Kbd><Kbd aria-label="seta para a direita"><ArrowRight className="size-3" aria-hidden /></Kbd></span></li>
                    <li className="flex justify-between"><span>Pausar</span><Kbd>P</Kbd></li>
                  </ul>
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
        title="Finalizar a lista?"
        icon={
          <IconTile tone="gold" size="lg">
            <Flag />
          </IconTile>
        }
        description={
          answeredCount < total
            ? `Você respondeu ${answeredCount} de ${total} questões. As ${total - answeredCount} restantes aparecerão como não respondidas no resultado.`
            : "Todas as questões foram respondidas. Vamos ver seu resultado!"
        }
        confirmLabel="Finalizar e ver resultado"
        cancelLabel="Continuar respondendo"
      />
    </div>
  );
}

function ToggleRow({ active, onClick, icon: Icon, label, kbd }: { active: boolean; onClick: () => void; icon: typeof Star; label: string; kbd?: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      aria-pressed={active}
      className={cn("flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors", active ? "bg-gold-soft text-fg" : "text-fg-muted hover:bg-surface-2 hover:text-fg")}
    >
      <motion.span key={String(active)} initial={{ scale: 0.6, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={spring.bouncy}>
        <Icon className={cn("size-[18px]", active && "fill-gold text-gold-strong")} />
      </motion.span>
      <span className="flex-1 text-left">{label}</span>
      {kbd && <Kbd>{kbd}</Kbd>}
    </motion.button>
  );
}

