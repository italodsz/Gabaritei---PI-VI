"use client";

import { motion } from "motion/react";
import { ArrowRight, Award, CalendarDays, Clock, Flame, Gauge, ListChecks, Target, ThumbsUp, TrendingDown } from "@/components/icons";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, IconTile } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/Form";
import { ProgressBar } from "@/components/ui/Progress";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/Feedback";
import { Stagger, Reveal, InView } from "@/components/animations/Motion";
import { IllustrationChart } from "@/components/brand/Illustrations";
import { AccuracyAreaChart, ChartLegend, DonutChart, VolumeBarChart } from "@/components/charts/Charts";
import { ActivityCalendar } from "@/components/charts/ActivityCalendar";
import { AREA_COLOR, SUBJECT_ICON } from "@/components/questions/subjectMeta";
import { useActiveAccount, useRecords } from "@/hooks/useAccount";
import { useNow } from "@/hooks/useNow";
import { useStartPractice } from "@/features/practice/useStartPractice";
import { GoalsCard } from "./GoalsCard";
import {
  GRANULARITY_CONFIG,
  activityCalendar,
  areaStats,
  buildSeries,
  comparePeriods,
  computeStreak,
  rankTopics,
  subjectStats,
  summarize,
  totalStudyTime,
  type Granularity,
} from "@/lib/calculations/stats";
import { RECOMMENDATION_LABEL, pickQuestions, recommendTopics } from "@/lib/recommendations/engine";
import { questionRepository } from "@/lib/repositories/questionRepository";
import { createRng } from "@/lib/random";
import { formatDuration, formatNumber, formatPercent, formatShortSeconds } from "@/lib/format";
import { cn } from "@/lib/utils/cn";

export function PerformancePage() {
  const account = useActiveAccount();
  const records = useRecords(account);
  const now = useNow(60000);
  const startPractice = useStartPractice();
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [subjectView, setSubjectView] = useState<"barras" | "tabela">("barras");

  const data = useMemo(() => {
    const overall = summarize(records);
    const series = buildSeries(records, granularity, now);
    const cmp = comparePeriods(records, granularity, now);
    const subjects = subjectStats(records).filter((s) => s.answered > 0).sort((a, b) => b.accuracy - a.accuracy);
    const areas = areaStats(records);
    const ranks = rankTopics(records);
    const streak = computeStreak(records, now);
    const calendar = activityCalendar(records, now, 20);
    const studyMs = totalStudyTime(account, now);
    const recs = recommendTopics({ records, difficultSubjects: account.onboarding.difficultSubjects, now, limit: 4 });
    return { overall, series, cmp, subjects, areas, ranks, streak, calendar, studyMs, recs };
  }, [records, granularity, now, account]);

  const empty = records.length === 0;
  const cfg = GRANULARITY_CONFIG[granularity];

  const practiceTopic = (topicId: string, name: string) => {
    const ids = pickQuestions(questionRepository.query({ topicIds: [topicId] }), account.study.defaultQuestionCount, records, createRng(Date.now()), account.onboarding.level).map((q) => q.id);
    startPractice({ mode: "recommended", title: name, questionIds: ids, filters: { topicIds: [topicId] } });
  };

  if (empty) {
    return (
      <div>
        <PageHeader eyebrow="Desempenho" title="Análise da sua evolução" />
        <Card>
          <EmptyState
            illustration={<IllustrationChart size={170} />}
            title="Ainda não há dados para analisar"
            description="Assim que você responder questões, este painel mostra taxa de acerto, evolução, matérias fortes e fracas, calendário e metas."
            action={
              <>
                <ButtonLink href="/questoes" icon={ListChecks}>
                  Praticar questões
                </ButtonLink>
                <ButtonLink href="/simulados/novo" variant="secondary">
                  Fazer um simulado
                </ButtonLink>
              </>
            }
          />
        </Card>
        <GoalsCard className="mt-6" />
      </div>
    );
  }

  const deltaLabel = (d: number | null, kind: "pp" | "pct") =>
    d === null ? undefined : kind === "pp" ? `${d >= 0 ? "+" : ""}${Math.round(d * 100)} p.p.` : `${d >= 0 ? "+" : ""}${Math.round(d * 100)}%`;

  return (
    <div>
      <PageHeader
        eyebrow="Desempenho"
        title="Análise da sua evolução"
        description="Todos os números são calculados a partir das respostas registradas nas suas listas e simulados."
        actions={
          <SegmentedControl<Granularity>
            ariaLabel="Período"
            layoutId="perf-granularity"
            value={granularity}
            onChange={setGranularity}
            options={(Object.keys(GRANULARITY_CONFIG) as Granularity[]).map((g) => ({ value: g, label: GRANULARITY_CONFIG[g].label }))}
          />
        }
      />

      <Stagger gap={0.06} className="grid grid-cols-12 gap-6">
        <Reveal className="col-span-6 xl:col-span-3">
          <StatCard
            icon={<Target />}
            tone="gold"
            label="Taxa geral de acertos"
            value={data.overall.accuracy * 100}
            format={(n) => `${Math.round(n)}%`}
            delta={data.cmp.accuracyDelta}
            deltaLabel={deltaLabel(data.cmp.accuracyDelta, "pp")}
            hint={`${formatPercent(data.cmp.current.accuracy)} no período · vs. ${cfg.compareLabel}`}
            className="h-full"
          />
        </Reveal>
        <Reveal className="col-span-6 xl:col-span-3">
          <StatCard
            icon={<ListChecks />}
            tone="sage"
            label="Questões no período"
            value={data.cmp.current.answered}
            delta={data.cmp.answeredDelta}
            deltaLabel={deltaLabel(data.cmp.answeredDelta, "pct")}
            hint={`${formatNumber(data.overall.answered)} no total`}
            className="h-full"
          />
        </Reveal>
        <Reveal className="col-span-6 xl:col-span-3">
          <StatCard icon={<Clock />} tone="coral" label="Tempo total de estudo" value={Math.round(data.studyMs / 60000)} format={(n) => formatDuration(n * 60000, { compact: true })} hint="Soma dos cronômetros das sessões" className="h-full" />
        </Reveal>
        <Reveal className="col-span-6 xl:col-span-3">
          <StatCard icon={<Gauge />} tone="matematica" label="Tempo médio por questão" value={Math.round(data.overall.avgTimeMs / 1000)} format={(n) => formatShortSeconds(n * 1000)} hint="Referência ENEM: cerca de 3 min" className="h-full" />
        </Reveal>

        <Reveal className="col-span-12 xl:col-span-8">
          <Card className="h-full">
            <CardHeader title="Evolução da taxa de acerto" description={`${cfg.label} · últimos ${cfg.buckets} ${granularity === "day" ? "dias" : granularity === "week" ? "semanas" : "meses"}`} />
            <motion.div key={granularity} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <AccuracyAreaChart data={data.series} height={280} />
            </motion.div>
          </Card>
        </Reveal>

        <Reveal className="col-span-12 xl:col-span-4">
          <Card className="h-full">
            <CardHeader title="Comparação" description={`Período atual vs. ${cfg.compareLabel}`} />
            <div className="space-y-6">
              {[
                { label: "Taxa de acerto", cur: data.cmp.current.accuracy, prev: data.cmp.previous.accuracy, fmt: (n: number) => formatPercent(n), max: 1 },
                {
                  label: "Questões respondidas",
                  cur: data.cmp.current.answered,
                  prev: data.cmp.previous.answered,
                  fmt: (n: number) => formatNumber(n),
                  max: Math.max(1, data.cmp.current.answered, data.cmp.previous.answered),
                },
              ].map((row) => (
                <div key={row.label}>
                  <p className="mb-3 text-sm font-semibold">{row.label}</p>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <span className="w-16 text-xs text-fg-subtle">Atual</span>
                      <ProgressBar value={row.cur / row.max} tone="ink" height="h-3" className="flex-1" />
                      <span className="w-14 text-right text-sm font-bold tabular">{row.fmt(row.cur)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-16 text-xs text-fg-subtle">Anterior</span>
                      <ProgressBar value={row.prev / row.max} tone="gold" height="h-3" className="flex-1" delay={0.1} />
                      <span className="w-14 text-right text-sm font-semibold text-fg-muted tabular">{data.cmp.previous.answered ? row.fmt(row.prev) : "—"}</span>
                    </div>
                  </div>
                </div>
              ))}
              {!data.cmp.previous.answered && <p className="rounded-2xl bg-surface-2 p-3 text-xs text-fg-muted">Sem atividades no período anterior para comparar.</p>}
            </div>
          </Card>
        </Reveal>

        <Reveal className="col-span-12 lg:col-span-6">
          <Card className="h-full">
            <CardHeader title="Volume de questões" description={`Questões respondidas por ${granularity === "day" ? "dia" : granularity === "week" ? "semana" : "mês"}`} />
            <motion.div key={granularity} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <VolumeBarChart data={data.series} height={230} />
            </motion.div>
          </Card>
        </Reveal>

        <Reveal className="col-span-12 lg:col-span-6">
          <Card className="h-full">
            <CardHeader title="Distribuição por área" description="Questões respondidas e acerto em cada área do ENEM" />
            <div className="flex flex-wrap items-center gap-8">
              <DonutChart
                size={200}
                centerValue={formatNumber(data.overall.answered)}
                centerLabel="questões"
                data={data.areas.map((a) => ({ key: a.areaId, label: a.name, value: a.answered, color: AREA_COLOR[a.areaId] }))}
              />
              <ChartLegend
                className="flex min-w-[220px] flex-1 flex-col gap-3"
                items={data.areas.map((a) => ({ label: a.name, color: AREA_COLOR[a.areaId], value: `${a.answered} · ${formatPercent(a.accuracy)}` }))}
              />
            </div>
          </Card>
        </Reveal>

        <Reveal className="col-span-12 lg:col-span-7">
          <Card className="h-full">
            <CardHeader
              title="Acerto por matéria"
              description="Ordenado do maior para o menor acerto"
              action={
                <SegmentedControl
                  size="sm"
                  ariaLabel="Visualização"
                  layoutId="subject-view"
                  value={subjectView}
                  onChange={setSubjectView}
                  options={[
                    { value: "barras", label: "Barras" },
                    { value: "tabela", label: "Tabela" },
                  ]}
                />
              }
            />
            {subjectView === "barras" ? (
              <ul className="space-y-4">
                {data.subjects.map((s, i) => {
                  const Icon = SUBJECT_ICON[s.subjectId];
                  return (
                    <li key={s.subjectId} className="flex items-center gap-3">
                      <IconTile tone={s.areaId} size="sm">
                        <Icon />
                      </IconTile>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="font-semibold">{s.name}</span>
                          <span className="text-fg-muted tabular">
                            {s.correct}/{s.answered} · <strong className="text-fg">{formatPercent(s.accuracy)}</strong>
                          </span>
                        </div>
                        <ProgressBar value={s.accuracy} tone={s.areaId} delay={0.05 * i} label={`${s.name}: ${formatPercent(s.accuracy)}`} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="text-left text-xs text-fg-subtle">
                  <tr className="border-b border-border">
                    <th className="py-2 font-semibold">Matéria</th>
                    <th className="py-2 font-semibold">Respondidas</th>
                    <th className="py-2 font-semibold">Acertos</th>
                    <th className="py-2 font-semibold">Tempo médio</th>
                    <th className="py-2 text-right font-semibold">Acerto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.subjects.map((s) => (
                    <tr key={s.subjectId}>
                      <td className="py-2.5 font-semibold">{s.name}</td>
                      <td className="py-2.5 tabular">{s.answered}</td>
                      <td className="py-2.5 tabular">{s.correct}</td>
                      <td className="py-2.5 tabular">{formatShortSeconds(s.avgTimeMs)}</td>
                      <td className="py-2.5 text-right font-bold tabular">{formatPercent(s.accuracy)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </Card>
        </Reveal>

        <Reveal className="col-span-12 lg:col-span-5">
          <Card className="h-full">
            <CardHeader title="Assuntos" description="Com pelo menos 4 questões respondidas" />
            <TopicList title="Maior dificuldade" icon={<TrendingDown />} tone="coral" items={data.ranks.weakest.slice(0, 4)} onPractice={practiceTopic} />
            <div className="my-5 h-px bg-border" />
            <TopicList title="Melhor desempenho" icon={<ThumbsUp />} tone="sage" items={data.ranks.strongest.slice(0, 4)} />
          </Card>
        </Reveal>
      </Stagger>

      <InView className="mt-6 grid grid-cols-12 gap-6">
        <Card className="col-span-12 xl:col-span-8">
          <CardHeader
            title="Calendário de atividades"
            description="Questões respondidas por dia nas últimas 20 semanas"
            icon={
              <IconTile tone="sage">
                <CalendarDays />
              </IconTile>
            }
          />
          <ActivityCalendar columns={data.calendar} />
        </Card>
        <Card surface="ink" className="col-span-12 xl:col-span-4">
          <IconTile tone="coral" size="lg" className="bg-coral/20">
            <Flame />
          </IconTile>
          <p className="mt-6 text-sm text-on-ink-muted">Sequência atual</p>
          <p className="font-display text-5xl font-bold tabular">
            {data.streak.current} <span className="text-xl font-semibold text-on-ink-muted">{data.streak.current === 1 ? "dia" : "dias"}</span>
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-ink-raised p-4">
              <Award className="size-4 text-gold" />
              <p className="mt-2 text-xs text-on-ink-muted">Melhor sequência</p>
              <p className="font-display text-2xl font-bold tabular">{data.streak.best} dias</p>
            </div>
            <div className="rounded-2xl bg-ink-raised p-4">
              <CalendarDays className="size-4 text-gold" />
              <p className="mt-2 text-xs text-on-ink-muted">Hoje</p>
              <p className="font-display text-lg font-bold">{data.streak.activeToday ? "Estudou ✓" : "Pendente"}</p>
            </div>
          </div>
        </Card>
      </InView>

      <InView className="mt-6 grid grid-cols-12 gap-6">
        <GoalsCard className="col-span-12 xl:col-span-7" />
        <Card className="col-span-12 xl:col-span-5">
          <CardHeader title="Recomendações de revisão" description="Regras locais: acerto suavizado, dificuldades declaradas e tempo sem revisar" />
          <ul className="space-y-2.5">
            {data.recs.map((r) => (
              <li key={r.topicId}>
                <button type="button" onClick={() => practiceTopic(r.topicId, r.topicName)} className="group flex w-full items-center gap-3 rounded-2xl border border-border p-3.5 text-left transition-colors hover:bg-surface-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">{r.topicName}</span>
                      <Badge size="sm" tone={r.kind === "desempenho" ? "coral" : r.kind === "revisao" ? "sage" : "gold"}>
                        {RECOMMENDATION_LABEL[r.kind]}
                      </Badge>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-fg-muted">{r.reason}</p>
                  </div>
                  <ArrowRight className="size-4 text-fg-subtle transition-transform group-hover:translate-x-1" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </InView>
    </div>
  );
}

function TopicList({
  title,
  icon,
  tone,
  items,
  onPractice,
}: {
  title: string;
  icon: React.ReactNode;
  tone: "coral" | "sage";
  items: { topicId: string; name: string; accuracy: number; answered: number }[];
  onPractice?: (id: string, name: string) => void;
}) {
  return (
    <div>
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <IconTile tone={tone} size="sm">
          {icon}
        </IconTile>
        {title}
      </p>
      {items.length === 0 ? (
        <p className="text-sm text-fg-subtle">Responda mais questões para identificar.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((t) => (
            <li key={t.topicId} className={cn("flex items-center gap-3 rounded-2xl px-3 py-2", onPractice && "transition-colors hover:bg-surface-2")}>
              <span className="min-w-0 flex-1 truncate text-sm">{t.name}</span>
              <span className="text-xs text-fg-subtle tabular">{t.answered} q.</span>
              <span className={cn("w-12 text-right text-sm font-bold tabular", tone === "coral" ? "text-coral-strong" : "text-sage-strong")}>{formatPercent(t.accuracy)}</span>
              {onPractice && (
                <button type="button" onClick={() => onPractice(t.topicId, t.name)} className="rounded-lg px-2 py-1 text-xs font-semibold text-fg-muted hover:bg-surface-3 hover:text-fg">
                  Praticar
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
