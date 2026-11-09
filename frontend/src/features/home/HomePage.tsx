"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  Bookmark,
  History as HistoryIcon,
  ArrowUpRight,
  BookOpenCheck,
  Brain,
  Play,
  RotateCcw,
  Sparkles,
  Timer,
  Wand2,
  Zap,
} from "@/components/icons";
import { useMemo } from "react";
import type { SubjectId } from "@/types";
import { SUBJECT_BY_ID } from "@/data/fixtures/taxonomy";
import { Card, CardHeader, IconTile } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar, ProgressRing } from "@/components/ui/Progress";
import { EmptyState } from "@/components/ui/Feedback";
import { IllustrationChart } from "@/components/brand/Illustrations";
import { AccuracyAreaChart } from "@/components/charts/Charts";
import { Stagger, Reveal } from "@/components/animations/Motion";
import { SUBJECT_ICON } from "@/components/questions/subjectMeta";
import { useActiveAccount } from "@/hooks/useAccount";
import { useNow } from "@/hooks/useNow";
import { useStartPractice } from "@/features/practice/useStartPractice";
import { useHomeData } from "./useHomeData";
import { RECOMMENDATION_LABEL, buildAutoSelection, pickQuestions, type TopicRecommendation } from "@/lib/recommendations/engine";
import { questionRepository } from "@/lib/repositories/questionRepository";
import { createRng } from "@/lib/random";
import { firstName, formatClock, formatPercent, formatRelativeDay, pluralize } from "@/lib/format";
import { clockElapsed } from "@/lib/sessions/clock";
import { spring } from "@/lib/animations";
import { cn } from "@/lib/utils/cn";

function greeting(now: number) {
  const h = new Date(now).getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

export function HomePage() {
  const account = useActiveAccount();
  const now = useNow(60000);
  const data = useHomeData(account, now);
  const startPractice = useStartPractice();
  const name = firstName(account.profile.nickname || account.profile.name);
  const isNew = data.summary.answered === 0;
  const count = account.study.defaultQuestionCount;

  const startTopic = (rec: TopicRecommendation, n = count) => {
    const pool = questionRepository.query({ topicIds: [rec.topicId] });
    const ids = pickQuestions(pool, n, data.records, createRng(`${rec.topicId}-${Date.now()}`), account.onboarding.level).map((q) => q.id);
    startPractice({ mode: "recommended", title: rec.topicName, questionIds: ids, filters: { subjectId: rec.subjectId, topicIds: [rec.topicId] } });
  };

  const startAuto = () => {
    const sel = buildAutoSelection(account, data.records, count, Date.now(), Date.now());
    startPractice({ mode: "auto", title: "Seleção automática", questionIds: sel.questionIds });
  };

  const resumePractice = data.inProgressPractice[0];
  const resumeSim = data.inProgressSims[0];
  const top = data.recommendations[0];

  const hero = useMemo(() => {
    if (resumePractice) {
      const answered = Object.values(resumePractice.answers).filter((a) => a.confirmed).length;
      return {
        kicker: "Seu próximo passo",
        title: `Retome “${resumePractice.title}”`,
        text: `Você parou na questão ${resumePractice.currentIndex + 1} de ${resumePractice.questionIds.length}. ${pluralize(answered, "resposta já corrigida", "respostas já corrigidas")}.`,
        action: { label: "Retomar lista", href: `/questoes/sessao/${resumePractice.id}` },
      };
    }
    if (resumeSim) {
      return {
        kicker: "Seu próximo passo",
        title: `Continue o simulado “${resumeSim.title}”`,
        text: "O cronômetro está pausado e suas respostas foram salvas.",
        action: { label: "Continuar simulado", href: `/simulados/prova/${resumeSim.id}` },
      };
    }
    if (top) {
      return {
        kicker: isNew ? "Para começar" : "Recomendado para hoje",
        title: `${isNew ? "Comece com" : "Pratique"} ${top.topicName}`,
        text: top.reason,
        action: null,
      };
    }
    return { kicker: "Para começar", title: "Monte sua primeira lista", text: "Escolha matérias e assuntos para praticar.", action: { label: "Montar lista", href: "/questoes" } };
  }, [resumePractice, resumeSim, top, isNew]);

  return (
    <div className="space-y-6">
      <Stagger gap={0.07} className="grid grid-cols-12 gap-6">
        {/* Hero */}
        <Reveal className="col-span-12 xl:col-span-8">
          <Card surface="ink" padded="lg" className="relative h-full overflow-hidden">
            <div className="bg-dots pointer-events-none absolute inset-0 opacity-50" aria-hidden />
            <div className="relative flex h-full flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div className="max-w-xl">
                <p className="text-sm font-medium text-on-ink-muted">
                  {greeting(now)}, <span className="text-on-ink">{name}</span>
                </p>
                <p className="mt-6 flex items-center gap-2 text-xs font-bold tracking-[0.1em] text-gold uppercase">
                  <Sparkles className="size-4" aria-hidden /> {hero.kicker}
                </p>
                <h1 className="mt-2 font-display text-[2.1rem] leading-[1.1] font-bold tracking-[-0.025em] text-balance">{hero.title}</h1>
                <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-on-ink-muted">{hero.text}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  {hero.action ? (
                    <ButtonLink href={hero.action.href} variant="accent" size="lg" icon={Play}>
                      {hero.action.label}
                    </ButtonLink>
                  ) : (
                    top && (
                      <Button variant="accent" size="lg" icon={Play} onClick={() => startTopic(top, isNew ? 5 : count)}>
                        Praticar {isNew ? 5 : count} questões
                      </Button>
                    )
                  )}
                  <Button variant="on-ink" size="lg" icon={Wand2} onClick={startAuto}>
                    IA escolhe por mim
                  </Button>
                </div>
              </div>
              {data.goal && (
                <div className="flex shrink-0 flex-col items-center gap-3 rounded-3xl bg-ink-raised p-5 ring-1 ring-ink-line">
                  <ProgressRing value={data.goal.progress} size={124} stroke={11} tone="on-ink" track="var(--ink-track)" label={`Meta semanal: ${data.goal.current} de ${data.goal.goal.target} questões`}>
                    <div>
                      <p className="font-display text-2xl font-bold tabular">{data.goal.current}</p>
                      <p className="text-[11px] text-on-ink-muted">de {data.goal.goal.target}</p>
                    </div>
                  </ProgressRing>
                  <p className="text-xs font-semibold text-on-ink-muted">{data.goal.done ? "Meta semanal batida!" : "Meta da semana"}</p>
                </div>
              )}
            </div>
          </Card>
        </Reveal>

        {/* Retomar / continuar */}
        <Reveal className="col-span-12 xl:col-span-4">
          <Card className="flex h-full flex-col">
            <CardHeader
              title="Continue de onde parou"
              description={resumePractice || resumeSim ? "Suas atividades interrompidas" : "Nenhuma atividade pendente"}
              icon={
                <IconTile tone="gold">
                  <RotateCcw />
                </IconTile>
              }
            />
            <div className="flex flex-1 flex-col gap-3">
              {resumePractice && (
                <ResumeItem
                  href={`/questoes/sessao/${resumePractice.id}`}
                  icon={<BookOpenCheck />}
                  label="Lista de questões"
                  title={resumePractice.title}
                  progress={Object.values(resumePractice.answers).filter((a) => a.confirmed).length / resumePractice.questionIds.length}
                  meta={`${formatRelativeDay(resumePractice.updatedAt, now)} · ${formatClock(clockElapsed(resumePractice.clock, now))}`}
                />
              )}
              {resumeSim && (
                <ResumeItem
                  href={`/simulados/prova/${resumeSim.id}`}
                  icon={<Timer />}
                  label="Simulado"
                  title={resumeSim.title}
                  progress={Object.values(resumeSim.answers).filter((a) => a.selected).length / resumeSim.questionIds.length}
                  meta={`${formatRelativeDay(resumeSim.updatedAt, now)} · ${Object.values(resumeSim.answers).filter((a) => a.selected).length}/${resumeSim.questionIds.length} respondidas`}
                />
              )}
              {!resumePractice && !resumeSim && (
                <div className="flex flex-1 flex-col justify-center gap-3 rounded-3xl bg-surface-2 p-5">
                  <p className="text-sm text-fg-muted">Tudo em dia: nenhuma lista ou simulado ficou pela metade.</p>
                  <ButtonLink href="/historico" variant="secondary" icon={HistoryIcon}>
                    Ver atividades
                  </ButtonLink>
                </div>
              )}
            </div>
          </Card>
        </Reveal>

        {/* Evolução */}
        <Reveal className="col-span-12 lg:col-span-7">
          <Card className="h-full">
            <CardHeader
              title="Sua evolução"
              description="Taxa de acerto nos últimos 14 dias"
              action={
                <Link href="/desempenho" className="group inline-flex items-center gap-1 text-sm font-semibold text-fg-muted hover:text-fg">
                  Ver desempenho <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              }
            />
            {isNew ? (
              <EmptyState
                compact
                illustration={<IllustrationChart size={120} />}
                title="Seu gráfico começa na primeira lista"
                description="Responda algumas questões e acompanhe aqui como sua taxa de acerto evolui dia após dia."
              />
            ) : (
              <AccuracyAreaChart data={data.series} height={230} compact />
            )}
          </Card>
        </Reveal>

        {/* Recomendações */}
        <Reveal className="col-span-12 lg:col-span-5">
          <Card className="h-full">
            <CardHeader
              title="Recomendações para você"
              description="Baseadas no onboarding e nas suas respostas"
              icon={
                <IconTile tone="sage">
                  <Brain />
                </IconTile>
              }
            />
            <ul className="space-y-2.5">
              {data.recommendations.slice(0, 3).map((rec, i) => {
                const Icon = SUBJECT_ICON[rec.subjectId];
                return (
                  <motion.li
                    key={rec.topicId}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.07, ...spring.soft }}
                  >
                    <button
                      type="button"
                      onClick={() => startTopic(rec)}
                      className="group flex w-full items-center gap-3.5 rounded-2xl border border-border p-3.5 text-left transition-[border-color,background-color,box-shadow] hover:border-border-strong hover:bg-surface-2/60 hover:shadow-sm"
                    >
                      <IconTile tone={rec.areaId} size="md">
                        <Icon />
                      </IconTile>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold">{rec.topicName}</span>
                          <Badge size="sm" tone={rec.kind === "desempenho" ? "coral" : rec.kind === "dificuldade" ? "gold" : "neutral"}>
                            {RECOMMENDATION_LABEL[rec.kind]}
                          </Badge>
                        </span>
                        <span className="mt-0.5 line-clamp-1 block text-xs text-fg-muted">{rec.reason}</span>
                      </span>
                      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-surface-2 text-fg-muted transition-colors group-hover:bg-primary group-hover:text-on-primary">
                        <ArrowRight className="size-4" />
                      </span>
                    </button>
                  </motion.li>
                );
              })}
            </ul>
            <p className="mt-4 text-xs text-fg-subtle">Sugestões geradas por regras locais e transparentes — não são previsões de nota.</p>
          </Card>
        </Reveal>

        {/* Acessos rápidos */}
        <Reveal className="col-span-12 md:col-span-6 lg:col-span-4">
          <QuickCard
            href="/questoes"
            surface="sage"
            icon={<BookOpenCheck />}
            tone="sage"
            title="Praticar questões"
            text="Monte listas por matéria, assunto e ano, ou deixe a seleção automática decidir."
          />
        </Reveal>
        <Reveal className="col-span-12 md:col-span-6 lg:col-span-4">
          <QuickCard
            href="/simulados"
            surface="coral"
            icon={<Timer />}
            tone="coral"
            title="Fazer um simulado"
            text="Treine com a estrutura dos dois dias de prova, com cronômetro e revisão completa."
          />
        </Reveal>
        <Reveal className="col-span-12 lg:col-span-4">
          <Card className="h-full">
            <CardHeader title={isNew ? "Comece por suas dificuldades" : "Suas matérias frequentes"} description={isNew ? "Escolhidas no onboarding" : "Atalhos para praticar de novo"} />
            <div className="flex flex-wrap gap-2">
              {(isNew
                ? account.onboarding.difficultSubjects.map((s) => ({ subjectId: s, label: "" }))
                : data.frequent.map((f) => ({ subjectId: f.subjectId, label: formatPercent(f.accuracy) }))
              ).map((f) => {
                const Icon = SUBJECT_ICON[f.subjectId];
                return (
                  <Link
                    key={f.subjectId}
                    href={`/questoes?materia=${f.subjectId}`}
                    className="group inline-flex h-10 items-center gap-2 rounded-2xl border border-border bg-surface px-3 text-sm font-semibold transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-sm"
                  >
                    <Icon className="size-4 text-fg-muted" aria-hidden />
                    {subjectName(f.subjectId)}
                    {f.label && <span className="text-xs font-bold text-fg-subtle tabular">{f.label}</span>}
                  </Link>
                );
              })}
              {isNew && account.onboarding.difficultSubjects.length === 0 && (
                <p className="text-sm text-fg-muted">Escolha matérias de dificuldade em Configurações para receber atalhos aqui.</p>
              )}
            </div>
          </Card>
        </Reveal>
      </Stagger>

      {/* Sugestões de estudo */}
      <section aria-labelledby="sugestoes">
        <h2 id="sugestoes" className="mb-4 font-display text-xl font-semibold tracking-tight">
          Sugestões de estudo
        </h2>
        <Stagger gap={0.08} delay={0.3} className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Reveal>
            <SuggestionCard
              icon={<RotateCcw />}
              tone="coral"
              title="Revise seus erros"
              text={data.wrong.length ? `${pluralize(data.wrong.length, "questão errada aguarda", "questões erradas aguardam")} uma nova tentativa.` : "Quando errar uma questão, ela aparecerá aqui para revisão."}
              href="/historico?aba=erradas"
              cta={data.wrong.length ? "Refazer erradas" : "Ver histórico"}
            />
          </Reveal>
          <Reveal>
            <SuggestionCard
              icon={<Zap />}
              tone="gold"
              title="Simulado relâmpago"
              text="10 questões das quatro áreas em 30 minutos para aquecer o ritmo de prova."
              href="/simulados/novo?modo=relampago"
              cta="Configurar"
            />
          </Reveal>
          <Reveal>
            <SuggestionCard
              icon={<Bookmark />}
              tone="sage"
              title="Questões para revisar"
              text={
                account.reviewMarks.length
                  ? `${pluralize(account.reviewMarks.length, "questão marcada espera", "questões marcadas esperam")} sua revisão.`
                  : "Marque questões durante a prática (tecla M) para revisá-las aqui."
              }
              href="/historico?aba=revisar"
              cta={account.reviewMarks.length ? "Revisar marcadas" : "Ver histórico"}
            />
          </Reveal>
        </Stagger>
      </section>
    </div>
  );
}

const subjectName = (id: SubjectId) => SUBJECT_BY_ID[id].name;

function ResumeItem({ href, icon, label, title, progress, meta }: { href: string; icon: React.ReactNode; label: string; title: string; progress: number; meta: string }) {
  return (
    <Link href={href} className="group block rounded-3xl border border-border p-4 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md">
      <div className="flex items-center gap-3">
        <IconTile tone="neutral" size="sm">
          {icon}
        </IconTile>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold tracking-wide text-fg-subtle uppercase">{label}</p>
          <p className="truncate text-sm font-semibold">{title}</p>
        </div>
        <span className="grid size-9 place-items-center rounded-xl bg-gold text-on-gold shadow-sm transition-shadow duration-150 group-hover:shadow-md">
          <Play className="size-4 fill-current" aria-hidden />
        </span>
      </div>
      <ProgressBar value={progress} className="mt-3.5" height="h-1.5" label={`Progresso de ${title}`} />
      <p className="mt-2 text-xs text-fg-subtle">{meta}</p>
    </Link>
  );
}

function QuickCard({ href, surface, icon, tone, title, text }: { href: string; surface: "sage" | "coral"; icon: React.ReactNode; tone: "sage" | "coral"; title: string; text: string }) {
  return (
    <Link href={href} className="group block h-full rounded-[var(--radius-card)] outline-none focus-visible:ring-2 focus-visible:ring-focus">
      <Card surface={surface} interactive className="flex h-full flex-col">
        <div className="flex items-center justify-between">
          <IconTile tone={tone} size="lg" className="bg-surface/70">
            {icon}
          </IconTile>
          <span className="grid size-10 place-items-center rounded-full bg-surface/70 transition-transform duration-200 group-hover:rotate-[-45deg]">
            <ArrowRight className="size-[18px]" />
          </span>
        </div>
        <h3 className="mt-8 font-display text-xl font-semibold tracking-tight">{title}</h3>
        <p className="mt-1.5 text-sm text-fg-muted">{text}</p>
      </Card>
    </Link>
  );
}

function SuggestionCard({
  icon,
  tone,
  title,
  text,
  href,
  onClick,
  cta,
}: {
  icon: React.ReactNode;
  tone: "coral" | "gold" | "sage";
  title: string;
  text: string;
  href?: string;
  onClick?: () => void;
  cta: string;
}) {
  return (
    <Card interactive={false} className={cn("flex h-full flex-col")}>
      <IconTile tone={tone}>{icon}</IconTile>
      <h3 className="mt-5 font-semibold">{title}</h3>
      <p className="mt-1 flex-1 text-sm text-fg-muted">{text}</p>
      <div className="mt-5">
        {href ? (
          <ButtonLink href={href} variant="secondary" size="sm" iconRight={ArrowRight}>
            {cta}
          </ButtonLink>
        ) : (
          <Button variant="secondary" size="sm" iconRight={ArrowRight} onClick={onClick}>
            {cta}
          </Button>
        )}
      </div>
    </Card>
  );
}
