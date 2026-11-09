"use client";

import { AnimatePresence, motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  Brain,
  CalendarRange,
  ChevronDown,
  Layers,
  ListChecks,
  Play,
  Settings2,
  Shuffle,
  Sparkles,
  Timer,
  Wand2,
} from "@/components/icons";
import { useMemo, useState } from "react";
import type { PracticeFilters, SubjectId } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, IconTile } from "@/components/ui/Card";
import { Badge, Chip } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Checkbox, SegmentedControl, Switch, Tabs } from "@/components/ui/Form";
import { AnimatedNumber, ProgressBar } from "@/components/ui/Progress";
import { Collapse, SectionLabel } from "@/components/ui/Feedback";
import { Stagger, Reveal } from "@/components/animations/Motion";
import { SUBJECT_ICON } from "@/components/questions/subjectMeta";
import { AREAS, REFERENCE_YEARS, SUBJECT_BY_ID, TOPIC_BY_ID, subjectsOfArea } from "@/data/fixtures/taxonomy";
import { useActiveAccount, useRecords } from "@/hooks/useAccount";
import { useNow } from "@/hooks/useNow";
import { useStartPractice } from "./useStartPractice";
import { freshSeed } from "@/lib/random";
import { EMPTY_FILTERS, PRACTICE_COUNTS, availableForFilters, selectPracticeQuestions } from "@/lib/sessions/factory";
import { RECOMMENDATION_LABEL, buildAutoSelection, recommendTopics } from "@/lib/recommendations/engine";
import { rankTopics, topicStats } from "@/lib/calculations/stats";
import { questionRepository } from "@/lib/repositories/questionRepository";
import { formatPercent } from "@/lib/format";
import { useAppStore } from "@/stores/appStore";
import { spring } from "@/lib/animations";
import { cn } from "@/lib/utils/cn";

type Tab = "montar" | "recomendadas" | "ia";

export function PracticeConfigPage() {
  const params = useSearchParams();
  const account = useActiveAccount();
  const records = useRecords(account);
  const now = useNow(60000);
  const startPractice = useStartPractice();
  const updateStudy = useAppStore((s) => s.updateStudy);

  const initialSubject = (params.get("materia") as SubjectId | null) ?? null;
  const initialTopic = params.get("assunto");
  const [tab, setTab] = useState<Tab>(params.get("modo") === "ia" ? "ia" : "montar");
  const [filters, setFilters] = useState<PracticeFilters>(() => ({
    ...EMPTY_FILTERS,
    subjectId: initialSubject && SUBJECT_BY_ID[initialSubject] ? initialSubject : null,
    topicIds: initialTopic && TOPIC_BY_ID[initialTopic] ? [initialTopic] : [],
    count: account.study.defaultQuestionCount,
  }));
  const [timer, setTimer] = useState(account.study.practiceTimer);
  const [expanded, setExpanded] = useState<string | null>(initialTopic);
  const [aiCount, setAiCount] = useState(account.study.defaultQuestionCount);

  const available = useMemo(() => availableForFilters(filters).length, [filters]);
  const stats = useMemo(() => new Map(topicStats(records).map((t) => [t.topicId, t])), [records]);
  const weakest = useMemo(() => rankTopics(records).weakest.slice(0, 6), [records]);
  const recs = useMemo(() => recommendTopics({ records, difficultSubjects: account.onboarding.difficultSubjects, now, limit: 6 }), [records, account.onboarding.difficultSubjects, now]);
  const aiPreview = useMemo(() => buildAutoSelection(account, records, aiCount, now, "preview"), [account, records, aiCount, now]);

  const subject = filters.subjectId ? SUBJECT_BY_ID[filters.subjectId] : null;
  const finalCount = Math.min(filters.count, available);

  const setSubject = (id: SubjectId | null) => setFilters((f) => ({ ...f, subjectId: f.subjectId === id ? null : id, topicIds: [], subtopicIds: [] }));
  const toggleTopic = (id: string) =>
    setFilters((f) => {
      const on = f.topicIds.includes(id);
      return {
        ...f,
        topicIds: on ? f.topicIds.filter((t) => t !== id) : [...f.topicIds, id],
        subtopicIds: on ? f.subtopicIds.filter((s) => !s.startsWith(`${id}.`)) : f.subtopicIds,
      };
    });
  const toggleSubtopic = (topicId: string, subId: string) =>
    setFilters((f) => {
      const on = f.subtopicIds.includes(subId);
      return {
        ...f,
        topicIds: f.topicIds.includes(topicId) ? f.topicIds : [...f.topicIds, topicId],
        subtopicIds: on ? f.subtopicIds.filter((s) => s !== subId) : [...f.subtopicIds, subId],
      };
    });
  const toggleYear = (y: number) => setFilters((f) => ({ ...f, years: f.years.includes(y) ? f.years.filter((x) => x !== y) : [...f.years, y] }));

  const start = () => {
    const ids = selectPracticeQuestions({ ...filters, count: finalCount }, records, Date.now(), account.onboarding.level);
    const topicNames = filters.topicIds.map((t) => TOPIC_BY_ID[t]?.name).filter(Boolean);
    const title = topicNames.length === 1 ? topicNames[0]! : subject ? (topicNames.length ? `${subject.name} · ${topicNames.length} assuntos` : subject.name) : "Lista personalizada";
    updateStudy({ practiceTimer: timer });
    startPractice({ mode: "custom", title, questionIds: ids, filters });
  };

  const startRec = (topicId: string, n: number) => {
    const t = TOPIC_BY_ID[topicId];
    const ids = selectPracticeQuestions({ ...EMPTY_FILTERS, subjectId: t.subjectId, topicIds: [topicId], count: n }, records, freshSeed(), account.onboarding.level);
    startPractice({ mode: "recommended", title: t.name, questionIds: ids, filters: { subjectId: t.subjectId, topicIds: [topicId] } });
  };

  const startAi = () => {
    const sel = buildAutoSelection(account, records, aiCount, Date.now(), Date.now());
    startPractice({ mode: "auto", title: "Seleção automática", questionIds: sel.questionIds });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Prática"
        title="Monte sua lista de questões"
        description="Escolha matéria, assuntos e quantidade — ou deixe as recomendações decidirem por você."
      />

      <Tabs<Tab>
        layoutId="practice-tabs"
        value={tab}
        onChange={setTab}
        className="mb-6"
        tabs={[
          { value: "montar", label: "Montar lista", icon: Settings2 },
          { value: "recomendadas", label: "Recomendadas", icon: Brain, count: recs.length },
          { value: "ia", label: "IA escolhe por mim", icon: Wand2 },
        ]}
      />

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
          {tab === "montar" && (
            <div className="grid grid-cols-12 items-start gap-6">
              <Stagger gap={0.06} className="col-span-12 space-y-6 lg:col-span-8">
                {/* Matéria */}
                <Reveal>
                  <Card>
                    <CardHeader
                      title="1. Matéria"
                      description="Selecione uma matéria ou deixe em branco para misturar todas."
                      icon={
                        <IconTile tone="gold">
                          <BookOpenCheck />
                        </IconTile>
                      }
                    />
                    <div className="space-y-4">
                      {AREAS.map((area) => (
                        <div key={area.id}>
                          <SectionLabel className="mb-2">{area.shortName}</SectionLabel>
                          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={area.shortName}>
                            {subjectsOfArea(area.id).map((s) => {
                              const Icon = SUBJECT_ICON[s.id];
                              const on = filters.subjectId === s.id;
                              const st = stats.size ? s.topics.reduce((n, t) => n + (stats.get(t.id)?.answered ?? 0), 0) : 0;
                              return (
                                <motion.button
                                  key={s.id}
                                  type="button"
                                  role="radio"
                                  aria-checked={on}
                                  onClick={() => setSubject(s.id)}
                                  whileTap={{ scale: 0.95 }}
                                  transition={spring.snappy}
                                  className={cn(
                                    "relative flex h-11 items-center gap-2 rounded-2xl border px-3.5 text-sm font-semibold transition-colors",
                                    on ? "border-transparent text-on-primary" : "border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg",
                                  )}
                                >
                                  {on && <motion.span layoutId="subject-pill" className="absolute inset-0 rounded-2xl bg-primary" transition={spring.layout} />}
                                  <Icon className="relative size-4" aria-hidden />
                                  <span className="relative">{s.name}</span>
                                  {st > 0 && <span className={cn("relative text-[11px] font-bold tabular", on ? "text-on-primary/70" : "text-fg-subtle")}>{st}</span>}
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </Reveal>

                {/* Assuntos */}
                <Reveal>
                  <Card>
                    <CardHeader
                      title="2. Assuntos e subtópicos"
                      description={subject ? `Marque um ou mais assuntos de ${subject.name}. Sem marcação, todos entram.` : "Escolha uma matéria para ver os assuntos."}
                      icon={
                        <IconTile tone="sage">
                          <Layers />
                        </IconTile>
                      }
                    />
                    {!subject ? (
                      <div className="space-y-3">
                        <p className="text-sm text-fg-muted">Ou comece pelos assuntos em que você tem mais dificuldade:</p>
                        {weakest.length ? (
                          <div className="flex flex-wrap gap-2">
                            {weakest.map((t) => (
                              <Chip
                                key={t.topicId}
                                selected={false}
                                onToggle={() => {
                                  setFilters((f) => ({ ...f, subjectId: t.subjectId, topicIds: [t.topicId], subtopicIds: [] }));
                                  setExpanded(t.topicId);
                                }}
                                icon={<AlertTriangle className="size-3.5 text-coral-strong" />}
                              >
                                {t.name} <span className="text-xs text-fg-subtle tabular">{formatPercent(t.accuracy)}</span>
                              </Chip>
                            ))}
                          </div>
                        ) : (
                          <p className="rounded-2xl bg-surface-2 p-4 text-sm text-fg-muted">Ainda não há dados suficientes. Responda algumas questões para descobrir seus pontos de atenção.</p>
                        )}
                      </div>
                    ) : (
                      <ul className="divide-y divide-border rounded-2xl border border-border">
                        {subject.topics.map((topic) => {
                          const on = filters.topicIds.includes(topic.id);
                          const open = expanded === topic.id;
                          const st = stats.get(topic.id);
                          const count = questionRepository.query({ topicIds: [topic.id] }).length;
                          const weak = st && st.answered >= 4 && st.smoothed < 0.55;
                          return (
                            <li key={topic.id}>
                              <div className="flex items-center gap-3 px-4 py-3">
                                <Checkbox checked={on} onChange={() => toggleTopic(topic.id)} label={<span className="font-semibold">{topic.name}</span>} />
                                {weak && (
                                  <Badge size="sm" tone="coral" icon={<AlertTriangle />}>
                                    Maior dificuldade
                                  </Badge>
                                )}
                                <span className="ml-auto text-xs text-fg-subtle tabular">
                                  {count} {count === 1 ? "questão" : "questões"}
                                  {st ? ` · ${formatPercent(st.accuracy)} de acerto` : ""}
                                </span>
                                {topic.subtopics.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => setExpanded(open ? null : topic.id)}
                                    aria-expanded={open}
                                    aria-label={`${open ? "Ocultar" : "Mostrar"} subtópicos de ${topic.name}`}
                                    className="grid size-8 place-items-center rounded-xl text-fg-muted hover:bg-surface-2"
                                  >
                                    <motion.span animate={{ rotate: open ? 180 : 0 }} transition={spring.snappy}>
                                      <ChevronDown className="size-4" />
                                    </motion.span>
                                  </button>
                                )}
                              </div>
                              <Collapse open={open && topic.subtopics.length > 1}>
                                <div className="flex flex-wrap gap-2 px-4 pb-4 pl-12">
                                  {topic.subtopics.map((sub) => (
                                    <Chip key={sub.id} selected={filters.subtopicIds.includes(sub.id)} onToggle={() => toggleSubtopic(topic.id, sub.id)}>
                                      {sub.name}
                                    </Chip>
                                  ))}
                                </div>
                              </Collapse>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </Card>
                </Reveal>

                {/* Quantidade e anos */}
                <Reveal>
                  <Card>
                    <div className="grid gap-8 md:grid-cols-2">
                      <div>
                        <CardHeader
                          title="3. Quantidade"
                          description="Número de questões da lista."
                          icon={
                            <IconTile tone="coral">
                              <ListChecks />
                            </IconTile>
                          }
                        />
                        <SegmentedControl<number>
                          ariaLabel="Quantidade de questões"
                          layoutId="count-seg"
                          value={filters.count}
                          onChange={(count) => setFilters((f) => ({ ...f, count }))}
                          options={PRACTICE_COUNTS.map((c) => ({ value: c, label: String(c) }))}
                        />
                      </div>
                      <div>
                        <CardHeader
                          title="4. Ano de referência"
                          description="Filtro opcional. Sem seleção, todos os anos."
                          icon={
                            <IconTile tone="matematica">
                              <CalendarRange />
                            </IconTile>
                          }
                        />
                        <div className="flex flex-wrap gap-2">
                          {REFERENCE_YEARS.map((y) => (
                            <Chip key={y} selected={filters.years.includes(y)} onToggle={() => toggleYear(y)} tone="ink">
                              {y}
                            </Chip>
                          ))}
                        </div>
                        <p className="mt-3 text-xs text-fg-subtle">No acervo demonstrativo, o ano é apenas uma etiqueta de referência — as questões não são provas oficiais.</p>
                      </div>
                    </div>
                  </Card>
                </Reveal>
              </Stagger>

              {/* Resumo */}
              <motion.aside
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring.soft, delay: 0.15 }}
                className="col-span-12 lg:sticky lg:top-[96px] lg:col-span-4"
              >
                <Card surface="cream" padded="lg">
                  <p className="text-xs font-bold tracking-[0.1em] text-fg-subtle uppercase">Resumo da lista</p>
                  <p className="mt-3 font-display text-5xl font-bold tracking-tight">
                    <AnimatedNumber value={finalCount} durationS={0.4} />
                    <span className="ml-2 text-base font-semibold text-fg-muted">questões</span>
                  </p>
                  <dl className="mt-6 space-y-3 text-sm">
                    <SummaryRow label="Matéria" value={subject?.name ?? "Todas"} />
                    <SummaryRow
                      label="Assuntos"
                      value={filters.topicIds.length ? filters.topicIds.map((t) => TOPIC_BY_ID[t]?.name).join(", ") : "Todos"}
                    />
                    {filters.subtopicIds.length > 0 && <SummaryRow label="Subtópicos" value={`${filters.subtopicIds.length} selecionados`} />}
                    <SummaryRow label="Anos" value={filters.years.length ? [...filters.years].sort((a, b) => b - a).join(", ") : "Todos"} />
                    <SummaryRow label="Disponíveis" value={`${available} no acervo`} />
                  </dl>
                  <Collapse open={available < filters.count}>
                    <p className="mt-4 flex gap-2 rounded-2xl bg-warning-soft p-3 text-xs font-medium text-warning">
                      <AlertTriangle className="size-4 shrink-0" />
                      {available === 0
                        ? "Nenhuma questão com esses filtros. Remova algum filtro para continuar."
                        : `Há apenas ${available} questões com esses filtros. A lista terá ${available}.`}
                    </p>
                  </Collapse>
                  <div className="mt-6 border-t border-border pt-5">
                    <Switch checked={timer} onChange={setTimer} label="Cronômetro visível" description="Você pode ocultá-lo durante a lista." />
                  </div>
                  <Button variant="accent" size="lg" fullWidth icon={Play} className="mt-6" disabled={available === 0} onClick={start}>
                    Começar lista
                  </Button>
                </Card>
              </motion.aside>
            </div>
          )}

          {tab === "recomendadas" && (
            <div>
              <Stagger gap={0.06} className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {recs.map((rec) => {
                  const Icon = SUBJECT_ICON[rec.subjectId];
                  return (
                    <Reveal key={rec.topicId}>
                      <Card interactive className="flex h-full flex-col" onClick={() => startRec(rec.topicId, account.study.defaultQuestionCount)}>
                        <div className="flex items-start justify-between gap-3">
                          <IconTile tone={rec.areaId} size="lg">
                            <Icon />
                          </IconTile>
                          <Badge tone={rec.kind === "desempenho" ? "coral" : rec.kind === "dificuldade" ? "gold" : rec.kind === "revisao" ? "sage" : "neutral"}>
                            {RECOMMENDATION_LABEL[rec.kind]}
                          </Badge>
                        </div>
                        <p className="mt-5 text-xs font-semibold text-fg-subtle">{rec.subjectName}</p>
                        <h3 className="font-display text-lg font-semibold tracking-tight">{rec.topicName}</h3>
                        <p className="mt-1.5 flex-1 text-sm text-fg-muted">{rec.reason}</p>
                        {rec.accuracy !== null && (
                          <div className="mt-4">
                            <div className="mb-1.5 flex justify-between text-xs text-fg-subtle">
                              <span>Seu acerto</span>
                              <span className="font-bold tabular">{formatPercent(rec.accuracy)}</span>
                            </div>
                            <ProgressBar value={rec.accuracy} tone={rec.accuracy < 0.5 ? "coral" : "sage"} height="h-1.5" />
                          </div>
                        )}
                        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                          <span className="text-xs text-fg-subtle">{rec.available} questões disponíveis</span>
                          <span className="inline-flex items-center gap-1 text-sm font-semibold">
                            Praticar {Math.min(account.study.defaultQuestionCount, rec.available)} <ArrowRight className="size-4" />
                          </span>
                        </div>
                      </Card>
                    </Reveal>
                  );
                })}
              </Stagger>
              <p className="mt-6 text-sm text-fg-subtle">
                As recomendações combinam seu acerto por assunto (com suavização para poucos dados), as matérias marcadas como dificuldade e o tempo desde o último contato.
              </p>
            </div>
          )}

          {tab === "ia" && (
            <div className="grid grid-cols-12 gap-6">
              <Card surface="ink" padded="lg" className="col-span-12 overflow-hidden lg:col-span-7">
                <div className="bg-dots pointer-events-none absolute inset-0 opacity-50" aria-hidden />
                <div className="relative">
                  <motion.span
                    className="grid size-14 place-items-center rounded-2xl bg-gold text-on-gold"
                    animate={{ rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Sparkles className="size-6" />
                  </motion.span>
                  <h2 className="mt-6 font-display text-3xl font-bold tracking-tight">Deixe a seleção com a gente</h2>
                  <p className="mt-3 max-w-lg text-on-ink-muted">
                    Montamos uma lista equilibrando seus pontos de atenção, as matérias que você marcou como difíceis e assuntos que precisam de revisão.
                  </p>
                  <div className="mt-8">
                    <p className="mb-3 text-sm font-semibold">Quantas questões?</p>
                    <div className="inline-flex rounded-2xl bg-ink-raised p-1 ring-1 ring-ink-line" role="radiogroup" aria-label="Quantidade">
                      {PRACTICE_COUNTS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          role="radio"
                          aria-checked={aiCount === c}
                          onClick={() => setAiCount(c)}
                          className={cn("relative h-10 w-14 rounded-xl text-sm font-bold transition-colors", aiCount === c ? "text-on-gold" : "text-on-ink-muted hover:text-on-ink")}
                        >
                          {aiCount === c && <motion.span layoutId="ai-count" className="absolute inset-0 rounded-xl bg-gold" transition={spring.layout} />}
                          <span className="relative">{c}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button variant="accent" size="lg" icon={Wand2} onClick={startAi}>
                      Gerar e começar
                    </Button>
                  </div>
                  <p className="mt-6 text-xs text-on-ink-muted">
                    Demonstração local: a seleção usa regras simples no próprio navegador, sem modelos de IA ou serviços externos.
                  </p>
                </div>
              </Card>
              <Card className="col-span-12 lg:col-span-5">
                <CardHeader
                  title="Como a lista seria composta"
                  description={aiPreview.summary}
                  icon={
                    <IconTile tone="sage">
                      <Shuffle />
                    </IconTile>
                  }
                />
                <ul className="space-y-4">
                  {aiPreview.topics.map((t, i) => {
                    const n = aiPreview.questionIds.filter((id) => questionRepository.getById(id)?.topicId === t.topicId).length;
                    return (
                      <motion.li key={t.topicId} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.06 }}>
                        <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                          <span className="truncate font-semibold">
                            {t.topicName} <span className="font-normal text-fg-subtle">· {t.subjectName}</span>
                          </span>
                          <span className="shrink-0 text-xs font-bold text-fg-muted tabular">{n} q.</span>
                        </div>
                        <ProgressBar value={aiCount ? n / aiCount : 0} tone={t.areaId} height="h-1.5" delay={0.1 + i * 0.06} />
                        <p className="mt-1 text-xs text-fg-subtle">{RECOMMENDATION_LABEL[t.kind]}</p>
                      </motion.li>
                    );
                  })}
                </ul>
                <p className="mt-5 flex items-center gap-2 text-xs text-fg-subtle">
                  <Timer className="size-3.5" /> Prioriza questões inéditas e, depois, as que você errou.
                </p>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-fg-muted">{label}</dt>
      <dd className="max-w-[60%] text-right font-semibold">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={value} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }} className="block">
            {value}
          </motion.span>
        </AnimatePresence>
      </dd>
    </div>
  );
}
