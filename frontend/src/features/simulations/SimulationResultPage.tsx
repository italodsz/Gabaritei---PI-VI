"use client";

import { useParams } from "next/navigation";
import { ArrowRight, CheckCircle2, CircleDashed, Clock, Eye, Info, ListRestart, Plus, RotateCcw, Timer, TrendingDown, TrendingUp, XCircle } from "@/components/icons";
import { useMemo, useState } from "react";
import type { SimulationSession } from "@/types";
import { Card, CardHeader, IconTile } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AnimatedNumber, ProgressBar, ProgressRing } from "@/components/ui/Progress";
import { EmptyState } from "@/components/ui/Feedback";
import { SegmentedControl } from "@/components/ui/Form";
import { ParticleBurst } from "@/components/animations/Celebration";
import { Stagger, Reveal } from "@/components/animations/Motion";
import { IllustrationClock } from "@/components/brand/Illustrations";
import { CategoryBarChart, ChartLegend, SparkLine } from "@/components/charts/Charts";
import { AREA_COLOR } from "@/components/questions/subjectMeta";
import { useActiveAccount, useRecords } from "@/hooks/useAccount";
import { useNow } from "@/hooks/useNow";
import { useStartPractice } from "@/features/practice/useStartPractice";
import { simulationResult } from "@/lib/calculations/results";
import { questionRepository } from "@/lib/repositories/questionRepository";
import { pickQuestions } from "@/lib/recommendations/engine";
import { createRng, freshSeed } from "@/lib/random";
import { formatDateLong, formatDuration, formatPercent, formatShortSeconds } from "@/lib/format";

export function SimulationResultPage() {
  const { id } = useParams<{ id: string }>();
  const account = useActiveAccount();
  const session = account.simulations.find((s) => s.id === id);
  if (!session || session.status !== "completed") {
    return (
      <EmptyState
        illustration={<IllustrationClock />}
        title={session ? "Simulado ainda em andamento" : "Resultado não encontrado"}
        description={session ? "Finalize o simulado para ver o resultado." : "Este simulado não existe neste navegador."}
        action={session ? <ButtonLink href={`/simulados/prova/${session.id}`}>Continuar simulado</ButtonLink> : <ButtonLink href="/simulados">Ver simulados</ButtonLink>}
      />
    );
  }
  return <Result session={session} />;
}

function Result({ session }: { session: SimulationSession }) {
  const account = useActiveAccount();
  const records = useRecords(account);
  const now = useNow(60000);
  const startPractice = useStartPractice();
  const [view, setView] = useState<"grafico" | "tabela">("grafico");
  const r = useMemo(() => simulationResult(session, now), [session, now]);

  const history = useMemo(
    () =>
      account.simulations
        .filter((s) => s.status === "completed" && s.completedAt)
        .sort((a, b) => a.completedAt!.localeCompare(b.completedAt!))
        .map((s) => ({ id: s.id, acc: simulationResult(s, now).accuracy })),
    [account.simulations, now],
  );
  const pos = history.findIndex((h) => h.id === session.id);
  const previous = pos > 0 ? history[pos - 1] : null;
  const delta = previous ? r.accuracy - previous.acc : null;

  const wrongIds = session.questionIds.filter((q) => {
    const a = session.answers[q];
    return !a?.selected || a.selected !== questionRepository.getById(q)?.correct;
  });

  const practiceTopic = (topicId: string, name: string) => {
    const ids = pickQuestions(questionRepository.query({ topicIds: [topicId] }), 10, records, createRng(freshSeed()), account.onboarding.level).map((q) => q.id);
    startPractice({ mode: "recommended", title: name, questionIds: ids, filters: { topicIds: [topicId] } });
  };

  return (
    <div className="space-y-6">
      <Stagger gap={0.07} className="grid grid-cols-12 gap-6">
        <Reveal className="col-span-12">
          <Card surface="ink" padded="lg" className="overflow-hidden">
            <div className="bg-dots pointer-events-none absolute inset-0 opacity-50" aria-hidden />
            <div className="relative grid items-center gap-10 lg:grid-cols-[auto_1fr_auto]">
              <div className="relative">
                {r.accuracy >= 0.7 && <ParticleBurst count={22} radius={130} />}
                <ProgressRing value={r.accuracy} size={172} stroke={14} tone="on-ink" track="var(--ink-track)" label={`Acerto de ${formatPercent(r.accuracy)}`}>
                  <div>
                    <p className="font-display text-4xl font-bold">
                      <AnimatedNumber value={r.correct} />
                      <span className="text-xl text-on-ink-muted">/{r.total}</span>
                    </p>
                    <p className="text-xs text-on-ink-muted">acertos</p>
                  </div>
                </ProgressRing>
              </div>
              <div>
                <p className="text-xs font-bold tracking-[0.1em] text-gold uppercase">Simulado concluído{session.finishReason === "timeout" ? " · tempo esgotado" : ""}</p>
                <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">{session.title}</h1>
                <p className="mt-1 text-on-ink-muted">{formatDateLong(session.completedAt!)}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge tone="ink" className="bg-ink-raised-strong" icon={<CheckCircle2 />}>
                    {formatPercent(r.accuracy)} de acerto
                  </Badge>
                  <Badge tone="ink" className="bg-ink-raised-strong" icon={<Clock />}>
                    {formatDuration(r.timeMs, { compact: true })} de {formatDuration(session.config.durationMs, { compact: true })}
                  </Badge>
                  {delta !== null && (
                    <Badge tone={delta >= 0 ? "success" : "danger"} icon={delta >= 0 ? <TrendingUp /> : <TrendingDown />}>
                      {delta >= 0 ? "+" : ""}
                      {Math.round(delta * 100)} p.p. vs. simulado anterior
                    </Badge>
                  )}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <ButtonLink href={`/simulados/revisao/${session.id}`} variant="accent" icon={Eye}>
                    Revisão completa
                  </ButtonLink>
                  {wrongIds.length > 0 && (
                    <Button variant="on-ink" icon={RotateCcw} onClick={() => startPractice({ mode: "retry", title: "Erros do simulado", questionIds: wrongIds.slice(0, 30) })}>
                      Praticar erros ({Math.min(30, wrongIds.length)})
                    </Button>
                  )}
                  <ButtonLink href="/simulados/novo" variant="on-ink" icon={Plus}>
                    Novo simulado
                  </ButtonLink>
                </div>
              </div>
              <div className="rounded-3xl bg-ink-raised p-6 text-center ring-1 ring-ink-line">
                <p className="text-xs text-on-ink-muted">Nota estimada</p>
                <p className="mt-1 font-display text-5xl font-bold text-gold tabular">
                  <AnimatedNumber value={r.estimatedScore} />
                </p>
                <p className="mx-auto mt-2 max-w-[180px] text-[11px] leading-snug text-on-ink-muted">Estimativa demonstrativa pelo % de acerto — não é o cálculo da TRI.</p>
              </div>
            </div>
          </Card>
        </Reveal>

        {[
          { icon: <CheckCircle2 />, tone: "success" as const, label: "Acertos", value: r.correct },
          { icon: <XCircle />, tone: "danger" as const, label: "Erros", value: r.wrong },
          { icon: <CircleDashed />, tone: "neutral" as const, label: "Em branco", value: r.blank },
          { icon: <Timer />, tone: "gold" as const, label: "Média por questão", value: Math.round(r.avgTimeMs / 1000), format: (n: number) => formatShortSeconds(n * 1000) },
        ].map((s) => (
          <Reveal key={s.label} className="col-span-6 lg:col-span-3">
            <Card className="flex items-start gap-3 max-sm:flex-col sm:items-center sm:gap-4">
              <IconTile tone={s.tone} size="lg">
                {s.icon}
              </IconTile>
              <div className="min-w-0">
                <p className="text-sm text-fg-muted">{s.label}</p>
                <p className="font-display text-3xl font-bold">
                  <AnimatedNumber value={s.value} format={s.format} />
                </p>
              </div>
            </Card>
          </Reveal>
        ))}

        <Reveal className="col-span-12 lg:col-span-7">
          <Card className="h-full">
            <CardHeader
              title="Resultado por área"
              description="Percentual de acerto em cada área"
              action={
                <SegmentedControl
                  size="sm"
                  ariaLabel="Visualização"
                  layoutId="result-view"
                  value={view}
                  onChange={setView}
                  options={[
                    { value: "grafico", label: "Gráfico" },
                    { value: "tabela", label: "Tabela" },
                  ]}
                />
              }
            />
            {view === "grafico" ? (
              <>
                <CategoryBarChart
                  height={250}
                  data={r.byArea.map((a) => ({ key: a.areaId, label: a.name, value: Math.round(a.accuracy * 100), color: AREA_COLOR[a.areaId], detail: `${a.correct}/${a.total}` }))}
                />
                <ChartLegend className="mt-4 flex flex-wrap gap-x-5 gap-y-2" items={r.byArea.map((a) => ({ label: a.name, color: AREA_COLOR[a.areaId] }))} />
              </>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="text-left text-xs text-fg-subtle">
                  <tr className="border-b border-border">
                    <th className="py-2 font-semibold">Área</th>
                    <th className="py-2 font-semibold">Acertos</th>
                    <th className="py-2 font-semibold">Em branco</th>
                    <th className="py-2 font-semibold">%</th>
                    <th className="py-2 text-right font-semibold">Nota est.*</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {r.byArea.map((a) => (
                    <tr key={a.areaId}>
                      <td className="py-3 font-semibold">{a.name}</td>
                      <td className="py-3 tabular">
                        {a.correct}/{a.total}
                      </td>
                      <td className="py-3 tabular">{a.blank}</td>
                      <td className="py-3 tabular">{formatPercent(a.accuracy)}</td>
                      <td className="py-3 text-right font-bold tabular">{a.estimatedScore}</td>
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
            <CardHeader title="Recomendações" description="Assuntos com menor acerto neste simulado" />
            <ul className="space-y-3">
              {r.byTopic
                .filter((t) => t.total >= 2 && t.accuracy < 0.7)
                .slice(0, 4)
                .map((t, i) => (
                  <li key={t.topicId}>
                    <button type="button" onClick={() => practiceTopic(t.topicId, t.name)} className="group w-full rounded-2xl border border-border p-3.5 text-left transition-colors hover:bg-surface-2">
                      <div className="flex items-center gap-3 text-sm">
                        <ListRestart className="size-4 text-coral-strong" />
                        <span className="flex-1 font-semibold">{t.name}</span>
                        <span className="text-xs text-fg-subtle tabular">
                          {t.correct}/{t.total}
                        </span>
                        <ArrowRight className="size-4 text-fg-subtle transition-transform group-hover:translate-x-1" />
                      </div>
                      <ProgressBar value={t.accuracy} tone="coral" height="h-1.5" className="mt-2.5" delay={0.2 + i * 0.07} />
                    </button>
                  </li>
                ))}
              {r.byTopic.filter((t) => t.total >= 2 && t.accuracy < 0.7).length === 0 && (
                <li className="rounded-2xl bg-success-soft p-4 text-sm text-success">Nenhum assunto com acerto abaixo de 70% (com 2+ questões). Ótimo equilíbrio!</li>
              )}
            </ul>
            {history.length > 1 && (
              <div className="mt-6 border-t border-border pt-5">
                <p className="text-sm font-semibold">Evolução nos simulados</p>
                <p className="text-xs text-fg-subtle">Acerto dos {history.length} simulados concluídos, do mais antigo ao mais recente</p>
                <SparkLine values={history.map((h) => Math.round(h.acc * 100))} height={56} />
              </div>
            )}
            <p className="mt-4 flex items-start gap-2 text-xs text-fg-subtle">
              <Info className="mt-px size-3.5 shrink-0" /> *A nota estimada é ilustrativa e serve apenas para acompanhar sua evolução nesta demonstração.
            </p>
          </Card>
        </Reveal>
      </Stagger>
    </div>
  );
}
