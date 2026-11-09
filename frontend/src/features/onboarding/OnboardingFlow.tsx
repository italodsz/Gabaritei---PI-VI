"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Play, Sparkles } from "@/components/icons";
import { useEffect, useMemo, useState } from "react";
import type { ExperienceLevel, StudyGoalId, SubjectId } from "@/types";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { SelectableCard } from "@/components/ui/SelectableCard";
import { IconTile } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/Progress";
import { AnimatedCheck, ParticleBurst } from "@/components/animations/Celebration";
import { SplashScreen } from "@/components/layout/AuthGate";
import { SUBJECT_ICON } from "@/components/questions/subjectMeta";
import { AREAS, SUBJECT_BY_ID, subjectsOfArea } from "@/data/fixtures/taxonomy";
import { useAccount, useHydrated } from "@/hooks/useAccount";
import { useAppStore } from "@/stores/appStore";
import { useStartPractice } from "@/features/practice/useStartPractice";
import { recommendTopics, pickQuestions } from "@/lib/recommendations/engine";
import { questionRepository } from "@/lib/repositories/questionRepository";
import { createRng } from "@/lib/random";
import { directionalSlide, fadeUp, spring, staggerContainer } from "@/lib/animations";
import { GOAL_LABEL, GOAL_OPTIONS, LEVEL_LABEL, LEVEL_OPTIONS, upcomingEditions } from "./options";
import { cn } from "@/lib/utils/cn";

type StepId = "nome" | "objetivo" | "edicao" | "materias" | "nivel";

interface Draft {
  name: string;
  goal: StudyGoalId | null;
  edition: number | null;
  difficultSubjects: SubjectId[];
  level: ExperienceLevel | null;
}

const STEP_COPY: Record<StepId, { title: string; subtitle: string }> = {
  nome: { title: "Como podemos te chamar?", subtitle: "Vamos usar seu nome para personalizar a plataforma." },
  objetivo: { title: "Qual é o seu principal objetivo?", subtitle: "Isso nos ajuda a priorizar o que mais importa para você." },
  edicao: { title: "Qual edição do ENEM você vai fazer?", subtitle: "Organizamos sua preparação de acordo com o tempo até a prova." },
  materias: { title: "Em quais matérias você sente mais dificuldade?", subtitle: "Escolha quantas quiser. Elas terão prioridade nas recomendações." },
  nivel: { title: "Como está sua preparação hoje?", subtitle: "Ajustamos a dificuldade inicial das questões sugeridas." },
};

export function OnboardingFlow() {
  const router = useRouter();
  const hydrated = useHydrated();
  const account = useAccount();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const skipOnboarding = useAppStore((s) => s.skipOnboarding);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const startPractice = useStartPractice();
  const [finished, setFinished] = useState(false);
  const [[index, dir], setStep] = useState<[number, number]>([0, 1]);
  const [now] = useState(() => Date.now());

  const steps = useMemo<StepId[]>(
    () => (account?.profile.kind === "new" ? ["nome", "objetivo", "edicao", "materias", "nivel"] : ["objetivo", "edicao", "materias", "nivel"]),
    [account?.profile.kind],
  );

  const [draft, setDraft] = useState<Draft>({ name: "", goal: null, edition: null, difficultSubjects: [], level: null });

  // Guarda de rota própria: permite exibir a tela final após concluir.
  useEffect(() => {
    if (!hydrated) return;
    if (!account) router.replace("/entrar");
    else if (account.onboarding.status !== "pending" && !finished) router.replace("/inicio");
  }, [hydrated, account, finished, router]);

  if (!hydrated || !account || (account.onboarding.status !== "pending" && !finished)) return <SplashScreen />;

  const step = steps[index];
  const canNext =
    step === "nome" ? draft.name.trim().length >= 2 : step === "objetivo" ? !!draft.goal : step === "edicao" ? draft.edition !== null : step === "nivel" ? !!draft.level : true;

  const go = (delta: number) => setStep([Math.max(0, Math.min(steps.length - 1, index + delta)), delta]);

  const finish = () => {
    if (step === "nivel" && !draft.level) return;
    if (draft.name.trim()) updateProfile({ name: draft.name.trim(), nickname: draft.name.trim().split(/\s+/)[0] });
    setFinished(true);
    completeOnboarding({ goal: draft.goal, edition: draft.edition, difficultSubjects: draft.difficultSubjects, level: draft.level }, Date.now());
  };

  const skip = () => {
    skipOnboarding(Date.now());
    router.replace("/inicio");
  };

  if (finished) return <WelcomeSummary draft={draft} onStart={startPractice} onHome={() => router.replace("/inicio")} />;

  const progress = (index + 1) / (steps.length + 1);

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-8 pt-8">
        <Logo size={36} />
        <Button variant="ghost" size="sm" onClick={skip}>
          Pular por enquanto
        </Button>
      </header>

      <div className="mx-auto w-full max-w-3xl px-8 pt-10">
        <div className="flex items-center justify-between text-xs font-semibold text-fg-subtle">
          <span>
            Etapa {index + 1} de {steps.length}
          </span>
          <span className="tabular">{Math.round(progress * 100)}%</span>
        </div>
        <ProgressBar value={progress} className="mt-2" height="h-1.5" label="Progresso do onboarding" />
        <div className="mt-3 flex gap-2" aria-hidden>
          {steps.map((s, i) => (
            <motion.span
              key={s}
              className="h-1.5 rounded-full"
              animate={{ width: i === index ? 28 : 8, backgroundColor: i <= index ? "var(--gold-strong)" : "var(--surface-3)" }}
              transition={spring.snappy}
            />
          ))}
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-8 pt-10 pb-10">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.section key={step} custom={dir} variants={directionalSlide} initial="enter" animate="center" exit="exit" className="flex-1">
            <motion.div variants={staggerContainer(0.07, 0.08)} initial="hidden" animate="show">
              <motion.h1 variants={fadeUp} className="font-display text-[2rem] leading-tight font-bold tracking-tight text-balance">
                {STEP_COPY[step].title}
              </motion.h1>
              <motion.p variants={fadeUp} className="mt-2 text-fg-muted">
                {STEP_COPY[step].subtitle}
              </motion.p>

              <motion.div variants={fadeUp} className="mt-8">
                {step === "nome" && (
                  <Field label="Seu nome">
                    {({ id }) => (
                      <Input
                        id={id}
                        autoFocus
                        placeholder="Ex.: Ana Souza"
                        value={draft.name}
                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && canNext && go(1)}
                      />
                    )}
                  </Field>
                )}

                {step === "objetivo" && (
                  <div role="radiogroup" aria-label="Objetivo" className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
                    {GOAL_OPTIONS.map((g, i) => (
                      <motion.div key={g.value} variants={fadeUp} transition={{ delay: i * 0.05 }} className={cn(i === GOAL_OPTIONS.length - 1 && "col-span-2 max-sm:col-span-1")}>
                        <SelectableCard selected={draft.goal === g.value} onSelect={() => setDraft({ ...draft, goal: g.value })}>
                          <div className="flex items-start gap-4 pr-8">
                            <IconTile tone={draft.goal === g.value ? "gold" : "neutral"}>
                              <g.icon />
                            </IconTile>
                            <div>
                              <p className="font-semibold">{g.title}</p>
                              <p className="mt-0.5 text-sm text-fg-muted">{g.description}</p>
                            </div>
                          </div>
                        </SelectableCard>
                      </motion.div>
                    ))}
                  </div>
                )}

                {step === "edicao" && (
                  <div role="radiogroup" aria-label="Edição do ENEM" className="grid grid-cols-3 gap-3.5 max-sm:grid-cols-1">
                    {upcomingEditions(now).map((year, i) => (
                      <SelectableCard key={year} selected={draft.edition === year} onSelect={() => setDraft({ ...draft, edition: year })}>
                        <CalendarDays className="size-5 text-fg-subtle" aria-hidden />
                        <p className="mt-6 font-display text-3xl font-bold tracking-tight">{year}</p>
                        <p className="mt-1 text-sm text-fg-muted">{i === 0 ? "Próxima edição" : i === 1 ? "No próximo ano" : "Com mais tempo"}</p>
                      </SelectableCard>
                    ))}
                    <SelectableCard className="col-span-3 max-sm:col-span-1" selected={draft.edition === 0} onSelect={() => setDraft({ ...draft, edition: 0 })}>
                      <p className="font-semibold">Ainda não sei</p>
                      <p className="mt-0.5 text-sm text-fg-muted">Tudo bem — você pode definir depois nas configurações.</p>
                    </SelectableCard>
                  </div>
                )}

                {step === "materias" && (
                  <div className="space-y-6">
                    {AREAS.map((area) => (
                      <div key={area.id}>
                        <p className="mb-2.5 text-xs font-bold tracking-[0.08em] text-fg-subtle uppercase">{area.shortName}</p>
                        <div className="flex flex-wrap gap-2.5">
                          {subjectsOfArea(area.id).map((s) => {
                            const selected = draft.difficultSubjects.includes(s.id);
                            const Icon = SUBJECT_ICON[s.id];
                            return (
                              <motion.button
                                key={s.id}
                                type="button"
                                role="checkbox"
                                aria-checked={selected}
                                whileTap={{ scale: 0.95 }}
                                whileHover={{ y: -2 }}
                                transition={spring.snappy}
                                onClick={() =>
                                  setDraft({
                                    ...draft,
                                    difficultSubjects: selected ? draft.difficultSubjects.filter((x) => x !== s.id) : [...draft.difficultSubjects, s.id],
                                  })
                                }
                                className={cn(
                                  "flex h-12 items-center gap-2.5 rounded-2xl border-2 px-4 text-sm font-semibold transition-colors",
                                  selected ? "border-gold-strong bg-gold-soft text-fg" : "border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg",
                                )}
                              >
                                <span className={cn("grid size-6 place-items-center rounded-lg transition-colors", selected ? "bg-gold text-on-gold" : "bg-surface-2")}>
                                  {selected ? (
                                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring.bouncy}>
                                      <Check className="size-3.5" strokeWidth={3.5} />
                                    </motion.span>
                                  ) : (
                                    <Icon className="size-3.5" />
                                  )}
                                </span>
                                {s.name}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    <p className="text-sm text-fg-subtle" aria-live="polite">
                      {draft.difficultSubjects.length
                        ? `${draft.difficultSubjects.length} ${draft.difficultSubjects.length === 1 ? "matéria selecionada" : "matérias selecionadas"}`
                        : "Nenhuma selecionada — você também pode seguir sem escolher."}
                    </p>
                  </div>
                )}

                {step === "nivel" && (
                  <div role="radiogroup" aria-label="Nível de preparação" className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
                    {LEVEL_OPTIONS.map((l) => (
                      <SelectableCard key={l.value} selected={draft.level === l.value} onSelect={() => setDraft({ ...draft, level: l.value })}>
                        <div className="flex h-6 items-end gap-1" aria-hidden>
                          {[1, 2, 3].map((b) => (
                            <motion.span
                              key={b}
                              className="w-2 rounded-full"
                              style={{ height: 8 + b * 5 }}
                              animate={{ backgroundColor: b <= l.bars ? (draft.level === l.value ? "var(--gold-strong)" : "var(--fg-muted)") : "var(--surface-3)" }}
                            />
                          ))}
                        </div>
                        <p className="mt-4 font-semibold">{l.title}</p>
                        <p className="mt-0.5 pr-6 text-sm text-fg-muted">{l.description}</p>
                      </SelectableCard>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          </motion.section>
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
          <Button variant="ghost" icon={ArrowLeft} onClick={() => go(-1)} disabled={index === 0}>
            Voltar
          </Button>
          {index < steps.length - 1 ? (
            <Button iconRight={ArrowRight} onClick={() => go(1)} disabled={!canNext}>
              Continuar
            </Button>
          ) : (
            <Button variant="accent" icon={Check} onClick={finish} disabled={!canNext}>
              Concluir
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

function WelcomeSummary({
  draft,
  onStart,
  onHome,
}: {
  draft: Draft;
  onStart: ReturnType<typeof useStartPractice>;
  onHome: () => void;
}) {
  const [now] = useState(() => Date.now());
  const suggestion = useMemo(() => {
    const [top] = recommendTopics({ records: [], difficultSubjects: draft.difficultSubjects, now, limit: 1 });
    if (!top) return null;
    const pool = questionRepository.query({ topicIds: [top.topicId] });
    const ids = pickQuestions(pool, 5, [], createRng(now), draft.level).map((q) => q.id);
    return { topic: top, ids };
  }, [draft.difficultSubjects, draft.level, now]);

  const rows = [
    { label: "Objetivo", value: draft.goal ? GOAL_LABEL[draft.goal] : "Não informado" },
    { label: "Edição", value: draft.edition ? `ENEM ${draft.edition}` : "Ainda não definida" },
    { label: "Dificuldades", value: draft.difficultSubjects.length ? draft.difficultSubjects.map((s) => SUBJECT_BY_ID[s].name).join(", ") : "Nenhuma em especial" },
    { label: "Preparação", value: draft.level ? LEVEL_LABEL[draft.level] : "Não informada" },
  ];

  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-6 py-12">
      <motion.div variants={staggerContainer(0.08, 0.1)} initial="hidden" animate="show" className="flex w-full max-w-xl flex-col items-center text-center">
        <motion.div variants={fadeUp} className="relative grid size-28 place-items-center">
          <ParticleBurst count={20} radius={110} />
          <span className="absolute inset-0 rounded-full bg-sage-soft" />
          <AnimatedCheck size={72} className="relative text-sage-strong" />
        </motion.div>
        <motion.h1 variants={fadeUp} className="mt-6 font-display text-4xl font-bold tracking-tight">
          Tudo pronto!
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-3 max-w-md text-fg-muted">
          Personalizamos o Gabaritei com base nas suas respostas. Você pode ajustar tudo depois em Configurações.
        </motion.p>

        <motion.dl variants={fadeUp} className="mt-8 w-full divide-y divide-border rounded-3xl border border-border bg-surface text-left shadow-sm">
          {rows.map((r) => (
            <div key={r.label} className="flex items-start justify-between gap-6 px-5 py-3.5">
              <dt className="text-sm text-fg-muted">{r.label}</dt>
              <dd className="text-right text-sm font-semibold">{r.value}</dd>
            </div>
          ))}
        </motion.dl>

        {suggestion && (
          <motion.div variants={fadeUp} className="mt-5 w-full rounded-3xl bg-ink p-6 text-left text-on-ink shadow-lg">
            <div className="flex items-center gap-2 text-xs font-bold tracking-[0.08em] text-gold uppercase">
              <Sparkles className="size-4" aria-hidden /> Primeira atividade sugerida
            </div>
            <p className="mt-2 font-display text-xl font-semibold">
              5 questões de {suggestion.topic.topicName} <span className="text-on-ink-muted">· {suggestion.topic.subjectName}</span>
            </p>
            <p className="mt-1 text-sm text-on-ink-muted">{suggestion.topic.reason}</p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Button
                variant="accent"
                icon={Play}
                onClick={() =>
                  onStart({
                    mode: "onboarding",
                    title: `Primeiros passos · ${suggestion.topic.topicName}`,
                    questionIds: suggestion.ids,
                    filters: { subjectId: suggestion.topic.subjectId, topicIds: [suggestion.topic.topicId] },
                  })
                }
              >
                Começar agora
              </Button>
              <Button variant="on-ink" onClick={onHome}>
                Ir para o Início
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
