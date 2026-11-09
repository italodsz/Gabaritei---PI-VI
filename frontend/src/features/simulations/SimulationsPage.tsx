"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, BarChart3, CalendarDays, ClipboardCheck, Eye, NotebookPen, Play, Plus, Timer, Trash2, Zap } from "@/components/icons";
import { useMemo, useState } from "react";
import type { SimulationSession } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, IconTile } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar, ProgressRing } from "@/components/ui/Progress";
import { ConfirmDialog } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/Feedback";
import { IllustrationClock } from "@/components/brand/Illustrations";
import { Stagger, Reveal } from "@/components/animations/Motion";
import { AREA_ICON } from "@/components/questions/subjectMeta";
import { useActiveAccount } from "@/hooks/useAccount";
import { useNow } from "@/hooks/useNow";
import { useAppStore } from "@/stores/appStore";
import { simulationResult } from "@/lib/calculations/results";
import { clockRemaining } from "@/lib/sessions/clock";
import { AREAS } from "@/data/fixtures/taxonomy";
import { formatClock, formatDate, formatDuration, formatPercent, formatRelativeDay } from "@/lib/format";
import { toast } from "@/components/ui/Toast";

export function SimulationsPage() {
  const account = useActiveAccount();
  const now = useNow(60000);
  const removeSimulation = useAppStore((s) => s.removeSimulation);
  const [discard, setDiscard] = useState<SimulationSession | null>(null);

  const inProgress = account.simulations.filter((s) => s.status === "in_progress").sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const completed = useMemo(
    () =>
      account.simulations
        .filter((s) => s.status === "completed")
        .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))
        .map((s) => ({ session: s, result: simulationResult(s, now) })),
    [account.simulations, now],
  );

  return (
    <div>
      <PageHeader
        eyebrow="Simulados"
        title="Treine no ritmo da prova"
        description="Simulados com a estrutura dos dois dias do ENEM, cronômetro e revisão completa ao final."
        actions={
          <>
            <ButtonLink href="/simulados/novo?modo=relampago" variant="secondary" icon={Zap}>
              Relâmpago (10 questões)
            </ButtonLink>
            <ButtonLink href="/simulados/novo" variant="accent" icon={Plus}>
              Novo simulado
            </ButtonLink>
          </>
        }
      />

      <Stagger gap={0.07} className="grid grid-cols-12 gap-6">
        {/* Em andamento */}
        <Reveal className="col-span-12 lg:col-span-8">
          <Card className="h-full">
            <CardHeader
              title="Em andamento"
              description="Simulados interrompidos ficam salvos com o tempo pausado."
              icon={
                <IconTile tone="gold">
                  <Timer />
                </IconTile>
              }
            />
            <AnimatePresence initial={false}>
              {inProgress.length === 0 ? (
                <EmptyState
                  compact
                  illustration={<IllustrationClock size={110} />}
                  title="Nenhum simulado em andamento"
                  description="Comece um novo simulado — você pode pausar e continuar depois."
                  action={
                    <ButtonLink href="/simulados/novo" icon={Plus}>
                      Criar simulado
                    </ButtonLink>
                  }
                />
              ) : (
                <ul className="space-y-3">
                  {inProgress.map((s) => {
                    const answered = Object.values(s.answers).filter((a) => a.selected).length;
                    return (
                      <motion.li key={s.id} layout exit={{ opacity: 0, x: -20, height: 0 }} className="rounded-3xl border border-border p-5">
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate font-semibold">{s.title}</p>
                              <Badge size="sm" tone="warning">
                                Pausado
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-fg-muted">
                              {answered} de {s.questionIds.length} respondidas · restam {formatClock(clockRemaining(s.clock, s.config.durationMs, now))} · {formatRelativeDay(s.updatedAt, now)}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setDiscard(s)}>
                            Descartar
                          </Button>
                          <ButtonLink href={`/simulados/prova/${s.id}`} icon={Play}>
                            Continuar
                          </ButtonLink>
                        </div>
                        <ProgressBar value={answered / s.questionIds.length} className="mt-4" height="h-1.5" label="Progresso do simulado" />
                      </motion.li>
                    );
                  })}
                </ul>
              )}
            </AnimatePresence>
          </Card>
        </Reveal>

        {/* Estrutura da prova */}
        <Reveal className="col-span-12 lg:col-span-4">
          <Card surface="ink" className="h-full">
            <p className="text-xs font-bold tracking-[0.1em] text-gold uppercase">Estrutura do ENEM</p>
            {[1, 2].map((day) => (
              <div key={day} className="mt-5">
                <div className="flex items-center justify-between">
                  <p className="font-display text-lg font-semibold">Dia {day}</p>
                  <span className="text-xs text-on-ink-muted">{day === 1 ? "5h30" : "5h"} · 90 questões</span>
                </div>
                <ul className="mt-2.5 space-y-2">
                  {AREAS.filter((a) => a.day === day).map((a) => {
                    const Icon = AREA_ICON[a.id];
                    return (
                      <li key={a.id} className="flex items-center gap-2.5 text-sm text-on-ink-muted">
                        <Icon className="size-4 text-gold" aria-hidden /> {a.shortName}
                        <span className="ml-auto text-xs tabular">
                          {a.officialRange[0]}–{a.officialRange[1]}
                        </span>
                      </li>
                    );
                  })}
                  {day === 1 && (
                    <li className="flex items-center gap-2.5 text-sm text-on-ink-muted">
                      <NotebookPen className="size-4 text-gold" aria-hidden /> Redação
                      <span className="ml-auto rounded-full bg-ink-raised-strong px-2 py-0.5 text-[11px]">fora do escopo</span>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </Card>
        </Reveal>

        {/* Concluídos */}
        <Reveal className="col-span-12">
          <Card>
            <CardHeader
              title="Simulados concluídos"
              description="Resultados, revisão e histórico das suas provas"
              icon={
                <IconTile tone="sage">
                  <ClipboardCheck />
                </IconTile>
              }
              action={
                completed.length > 0 && (
                  <Link href="/historico?aba=atividades&tipo=simulados" className="inline-flex items-center gap-1 text-sm font-semibold text-fg-muted hover:text-fg">
                    Ver histórico <ArrowRight className="size-4" />
                  </Link>
                )
              }
            />
            {completed.length === 0 ? (
              <EmptyState compact illustration={<IllustrationClock size={110} />} title="Nenhum simulado concluído ainda" description="Ao finalizar um simulado, o resultado e a revisão aparecem aqui." />
            ) : (
              <div className="overflow-hidden rounded-3xl border border-border">
                <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead className="bg-surface-2/70 text-left text-xs text-fg-subtle">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Simulado</th>
                      <th className="px-3 py-3 font-semibold">Data</th>
                      <th className="px-3 py-3 font-semibold">Acertos</th>
                      <th className="px-3 py-3 font-semibold">Tempo</th>
                      <th className="px-3 py-3 font-semibold">Nota estimada*</th>
                      <th className="px-5 py-3 text-right font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {completed.map(({ session: s, result: r }, i) => (
                      <motion.tr key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }} className="transition-colors hover:bg-surface-2/50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <ProgressRing value={r.accuracy} size={40} stroke={5} tone={r.accuracy >= 0.7 ? "sage" : r.accuracy >= 0.5 ? "gold" : "coral"} label={`Acerto ${formatPercent(r.accuracy)}`} />
                            <div>
                              <p className="font-semibold">{s.title}</p>
                              <p className="text-xs text-fg-subtle">
                                {s.config.mode === "official" ? "Estrutura oficial · conteúdo demonstrativo" : "Personalizado"}
                                {s.finishReason === "timeout" ? " · encerrado por tempo" : ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-fg-muted">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="size-3.5" /> {formatDate(s.completedAt!)}
                          </span>
                        </td>
                        <td className="px-3 py-4 font-semibold tabular">
                          {r.correct}/{r.total} <span className="font-normal text-fg-subtle">({formatPercent(r.accuracy)})</span>
                        </td>
                        <td className="px-3 py-4 text-fg-muted tabular">{formatDuration(r.timeMs, { compact: true })}</td>
                        <td className="px-3 py-4 font-display text-base font-bold tabular">{r.estimatedScore}</td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <ButtonLink href={`/simulados/revisao/${s.id}`} variant="ghost" size="sm" icon={Eye}>
                              Revisão
                            </ButtonLink>
                            <ButtonLink href={`/simulados/resultado/${s.id}`} variant="secondary" size="sm" icon={BarChart3}>
                              Resultado
                            </ButtonLink>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}
            <p className="mt-4 text-xs text-fg-subtle">*Nota estimada demonstrativa, proporcional ao percentual de acerto. Não é o cálculo da TRI utilizado pelo INEP.</p>
          </Card>
        </Reveal>
      </Stagger>

      <ConfirmDialog
        open={!!discard}
        onClose={() => setDiscard(null)}
        onConfirm={() => {
          if (discard) removeSimulation(discard.id);
          setDiscard(null);
          toast.info("Simulado descartado", "As respostas desse simulado foram removidas.");
        }}
        tone="danger"
        icon={
          <IconTile tone="danger" size="lg">
            <Trash2 />
          </IconTile>
        }
        title="Descartar simulado?"
        description="As respostas marcadas até agora serão apagadas. Essa ação não pode ser desfeita."
        confirmLabel="Descartar"
      />
    </div>
  );
}
