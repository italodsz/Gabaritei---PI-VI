"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle2, ChevronDown, Clock, Gauge, House, ListRestart, Plus, RotateCcw, Target, XCircle, CircleDashed } from "@/components/icons";
import { useMemo, useState } from "react";
import type { PracticeSession } from "@/types";
import { Card, CardHeader, IconTile } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AnimatedNumber, ProgressBar, ProgressRing } from "@/components/ui/Progress";
import { Collapse, EmptyState } from "@/components/ui/Feedback";
import { ParticleBurst } from "@/components/animations/Celebration";
import { Stagger, Reveal } from "@/components/animations/Motion";
import { IllustrationFlag } from "@/components/brand/Illustrations";
import { AlternativeList, QuestionBody, QuestionMeta } from "@/components/questions/QuestionView";
import { useActiveAccount, useRecords } from "@/hooks/useAccount";
import { useNow } from "@/hooks/useNow";
import { useStartPractice } from "./useStartPractice";
import { practiceResult } from "@/lib/calculations/results";
import { questionRepository } from "@/lib/repositories/questionRepository";
import { pickQuestions } from "@/lib/recommendations/engine";
import { createRng, freshSeed } from "@/lib/random";
import { formatClock, formatDateLong, formatPercent, formatShortSeconds, formatTime } from "@/lib/format";
import { spring } from "@/lib/animations";
import { cn } from "@/lib/utils/cn";

export function PracticeResultPage() {
  const { id } = useParams<{ id: string }>();
  const account = useActiveAccount();
  const session = account.practiceSessions.find((s) => s.id === id);
  if (!session) {
    return (
      <EmptyState
        illustration={<IllustrationFlag />}
        title="Resultado não encontrado"
        description="Esta lista não existe mais neste navegador."
        action={<ButtonLink href="/questoes">Montar nova lista</ButtonLink>}
      />
    );
  }
  return <Result session={session} />;
}

function verdict(acc: number) {
  if (acc >= 0.85) return { title: "Excelente!", text: "Domínio claro do conteúdo. Que tal subir a dificuldade?" };
  if (acc >= 0.65) return { title: "Bom trabalho!", text: "Você está no caminho. Revise os erros para consolidar." };
  if (acc >= 0.4) return { title: "Continue praticando", text: "Cada erro revisado vira acerto na prova. Vamos revisar?" };
  return { title: "Hora de revisar a base", text: "Releia as explicações com calma e tente novamente em seguida." };
}

function Result({ session }: { session: PracticeSession }) {
  const account = useActiveAccount();
  const records = useRecords(account);
  const now = useNow(60000);
  const startPractice = useStartPractice();
  const r = useMemo(() => practiceResult(session, now), [session, now]);
  const [open, setOpen] = useState<string | null>(null);
  const v = verdict(r.accuracyAnswered);
  const inProgress = session.status !== "completed";

  const retryWrong = () => startPractice({ mode: "retry", title: "Revisão de erros", questionIds: r.wrongIds, filters: session.filters });
  const reviewTopic = (topicId: string) => {
    const ids = pickQuestions(questionRepository.query({ topicIds: [topicId] }), account.study.defaultQuestionCount, records, createRng(freshSeed()), account.onboarding.level).map((q) => q.id);
    startPractice({ mode: "recommended", title: r.byTopic.find((t) => t.topicId === topicId)?.name ?? "Revisão", questionIds: ids, filters: { topicIds: [topicId] } });
  };

  return (
    <div className="space-y-6">
      <Stagger gap={0.07} className="grid grid-cols-12 gap-6">
        <Reveal className="col-span-12">
          <Card surface="ink" padded="lg" className="overflow-hidden">
            <div className="bg-dots pointer-events-none absolute inset-0 opacity-50" aria-hidden />
            <div className="relative flex flex-wrap items-center gap-10">
              <div className="relative">
                {r.accuracyAnswered >= 0.8 && <ParticleBurst count={22} radius={130} />}
                <ProgressRing value={r.accuracy} size={168} stroke={14} tone="on-ink" track="var(--ink-track)" label={`Acerto de ${formatPercent(r.accuracy)}`}>
                  <div>
                    <p className="font-display text-4xl font-bold tabular">
                      <AnimatedNumber value={r.accuracy * 100} format={(n) => `${Math.round(n)}%`} />
                    </p>
                    <p className="text-xs text-on-ink-muted">de acerto</p>
                  </div>
                </ProgressRing>
              </div>
              <div className="min-w-0 flex-1 sm:min-w-[280px]">
                <p className="text-xs font-bold tracking-[0.1em] text-gold uppercase">{inProgress ? "Resultado parcial" : "Lista concluída"}</p>
                <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">{v.title}</h1>
                <p className="mt-2 max-w-lg text-on-ink-muted">{v.text}</p>
                <p className="mt-3 text-sm text-on-ink-muted">
                  {session.title} · {formatDateLong(session.completedAt ?? session.updatedAt)} às {formatTime(session.completedAt ?? session.updatedAt)}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {r.wrongIds.length > 0 && (
                    <Button variant="accent" icon={RotateCcw} onClick={retryWrong}>
                      Refazer {r.wrongIds.length} {r.wrongIds.length === 1 ? "erro" : "erros"}
                    </Button>
                  )}
                  <ButtonLink href="/questoes" variant="on-ink" icon={Plus}>
                    Nova lista
                  </ButtonLink>
                  <ButtonLink href="/inicio" variant="on-ink" icon={House}>
                    Início
                  </ButtonLink>
                </div>
              </div>
            </div>
          </Card>
        </Reveal>

        {[
          { icon: <Target />, tone: "neutral" as const, label: "Total", value: r.total },
          { icon: <CheckCircle2 />, tone: "success" as const, label: "Acertos", value: r.correct },
          { icon: <XCircle />, tone: "danger" as const, label: "Erros", value: r.wrong },
          { icon: <CircleDashed />, tone: "neutral" as const, label: "Não respondidas", value: r.unanswered },
        ].map((s) => (
          <Reveal key={s.label} className="col-span-6 lg:col-span-3">
            <Card className="flex items-start gap-3 max-sm:flex-col sm:items-center sm:gap-4">
              <IconTile tone={s.tone} size="lg">
                {s.icon}
              </IconTile>
              <div className="min-w-0">
                <p className="text-sm text-fg-muted">{s.label}</p>
                <p className="font-display text-3xl font-bold">
                  <AnimatedNumber value={s.value} />
                </p>
              </div>
            </Card>
          </Reveal>
        ))}

        <Reveal className="col-span-12 lg:col-span-7">
          <Card className="h-full">
            <CardHeader title="Desempenho por assunto" description="Ordenado do menor para o maior acerto" />
            {r.byTopic.length ? (
              <ul className="space-y-5">
                {r.byTopic.map((t, i) => (
                  <li key={t.topicId}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold">{t.name}</span>
                      <span className="text-fg-muted tabular">
                        {t.correct}/{t.total} · <strong className="text-fg">{formatPercent(t.accuracy)}</strong>
                      </span>
                    </div>
                    <ProgressBar value={t.accuracy} tone={t.accuracy >= 0.7 ? "sage" : t.accuracy >= 0.5 ? "gold" : "coral"} delay={0.2 + i * 0.08} label={`${t.name}: ${formatPercent(t.accuracy)}`} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-fg-muted">Responda ao menos uma questão para ver o desempenho por assunto.</p>
            )}
          </Card>
        </Reveal>

        <Reveal className="col-span-12 lg:col-span-5">
          <Card className="h-full">
            <CardHeader title="Tempo e revisão" />
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-surface-2 p-4">
                <Clock className="size-4 text-fg-subtle" />
                <p className="mt-2 text-xs text-fg-muted">Tempo utilizado</p>
                <p className="font-display text-2xl font-bold tabular">{formatClock(r.timeMs)}</p>
              </div>
              <div className="rounded-2xl bg-surface-2 p-4">
                <Gauge className="size-4 text-fg-subtle" />
                <p className="mt-2 text-xs text-fg-muted">Média por questão</p>
                <p className="font-display text-2xl font-bold tabular">{formatShortSeconds(r.avgTimeMs)}</p>
              </div>
            </div>
            <p className="mt-6 mb-3 text-sm font-semibold">Recomendações de revisão</p>
            <ul className="space-y-2">
              {r.byTopic
                .filter((t) => t.accuracy < 0.7)
                .slice(0, 3)
                .map((t) => (
                  <li key={t.topicId}>
                    <button type="button" onClick={() => reviewTopic(t.topicId)} className="group flex w-full items-center gap-3 rounded-2xl border border-border p-3 text-left transition-colors hover:bg-surface-2">
                      <ListRestart className="size-4 text-coral-strong" />
                      <span className="flex-1 text-sm">
                        Praticar mais <strong>{t.name}</strong>
                      </span>
                      <ArrowRight className="size-4 text-fg-subtle transition-transform group-hover:translate-x-1" />
                    </button>
                  </li>
                ))}
              {r.byTopic.every((t) => t.accuracy >= 0.7) && <li className="rounded-2xl bg-success-soft p-3 text-sm text-success">Nenhum assunto abaixo de 70% nesta lista. Excelente consistência!</li>}
            </ul>
          </Card>
        </Reveal>
      </Stagger>

      {/* Revisão questão a questão */}
      <section aria-labelledby="revisao">
        <h2 id="revisao" className="mb-4 font-display text-xl font-semibold">
          Revisão das questões
        </h2>
        <div className="space-y-3">
          {session.questionIds.map((qid, i) => {
            const q = questionRepository.getById(qid);
            const a = session.answers[qid];
            if (!q) return null;
            const isOpen = open === qid;
            const status = !a?.confirmed ? "pending" : a.correct ? "correct" : "wrong";
            return (
              <motion.div key={qid} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 10) * 0.03 }} className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface">
                <button type="button" onClick={() => setOpen(isOpen ? null : qid)} aria-expanded={isOpen} className="flex w-full items-center gap-4 p-4 text-left hover:bg-surface-2/50">
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl text-sm font-bold", status === "correct" ? "bg-success-soft text-success" : status === "wrong" ? "bg-danger-soft text-danger" : "bg-surface-2 text-fg-subtle")}>{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-sm font-medium">{q.support?.paragraphs[0] ?? q.prompt}</span>
                    <span className="text-xs text-fg-subtle">{q.skill}</span>
                  </span>
                  <Badge size="sm" tone={status === "correct" ? "success" : status === "wrong" ? "danger" : "neutral"}>
                    {status === "correct" ? "Acertou" : status === "wrong" ? "Errou" : "Não respondida"}
                  </Badge>
                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={spring.snappy}>
                    <ChevronDown className="size-4 text-fg-subtle" />
                  </motion.span>
                </button>
                <Collapse open={isOpen}>
                  <div className="border-t border-border p-6">
                    <QuestionMeta question={q} />
                    <div className="mt-5">
                      <QuestionBody question={q} />
                    </div>
                    <div className="mt-5">
                      <AlternativeList question={q} selected={a?.confirmed ? a.selected : null} revealed mode="review" disabled />
                    </div>
                    <div className="mt-5 rounded-2xl bg-surface-2 p-5 text-[15px] leading-relaxed">
                      <p className="mb-1 text-xs font-bold tracking-wide text-fg-subtle uppercase">Explicação</p>
                      {q.explanation}
                    </div>
                  </div>
                </Collapse>
              </motion.div>
            );
          })}
        </div>
      </section>

      {inProgress && (
        <div className="flex justify-center">
          <ButtonLink href={`/questoes/sessao/${session.id}`} icon={ArrowRight}>
            Voltar para a lista em andamento
          </ButtonLink>
        </div>
      )}
      <p className="text-center text-xs text-fg-subtle">
        Veja todas as atividades em{" "}
        <Link href="/historico" className="font-semibold underline-offset-4 hover:underline">
          Histórico
        </Link>
        .
      </p>
    </div>
  );
}
