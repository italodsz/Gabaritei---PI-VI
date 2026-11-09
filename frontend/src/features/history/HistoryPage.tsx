"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  BarChart3,
  Bookmark,
  BookOpenCheck,
  ChevronDown,
  Eye,
  History as HistoryIcon,
  Play,
  RotateCcw,
  Star,
  Timer,
  Trash2,
  XCircle,
} from "@/components/icons";
import { useMemo, useState } from "react";
import type { AreaId, PracticeSession, Question, SimulationSession, SubjectId } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, IconTile } from "@/components/ui/Card";
import { Button, ButtonLink, IconButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Checkbox, SegmentedControl, Tabs } from "@/components/ui/Form";
import { Select } from "@/components/ui/Select";
import { ProgressBar } from "@/components/ui/Progress";
import { Collapse, EmptyState } from "@/components/ui/Feedback";
import { ConfirmDialog } from "@/components/ui/Modal";
import { IllustrationFlag, IllustrationStack, IllustrationStar } from "@/components/brand/Illustrations";
import { SUBJECT_ICON } from "@/components/questions/subjectMeta";
import { SUBJECTS, SUBJECT_BY_ID, TOPIC_BY_ID } from "@/data/fixtures/taxonomy";
import { useActiveAccount, useRecords } from "@/hooks/useAccount";
import { useNow } from "@/hooks/useNow";
import { useAppStore } from "@/stores/appStore";
import { useStartPractice } from "@/features/practice/useStartPractice";
import { practiceResult, simulationResult } from "@/lib/calculations/results";
import { wrongQuestionIds } from "@/lib/calculations/records";
import { questionRepository } from "@/lib/repositories/questionRepository";
import { formatDate, formatDuration, formatPercent, formatRelativeDay, formatTime } from "@/lib/format";
import { spring } from "@/lib/animations";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils/cn";

type Tab = "atividades" | "erradas" | "favoritas" | "revisar";
type Kind = "todas" | "listas" | "simulados";
type Status = "todos" | "concluidas" | "interrompidas";
type Period = "7" | "30" | "90" | "tudo";
type ResultFilter = "todos" | "alto" | "medio" | "baixo";

interface ActivityItem {
  id: string;
  kind: "practice" | "simulation";
  title: string;
  date: string;
  status: "in_progress" | "completed";
  total: number;
  answered: number;
  correct: number;
  accuracy: number;
  timeMs: number;
  subjects: SubjectId[];
  areas: AreaId[];
  session: PracticeSession | SimulationSession;
}

const PAGE = 12;

export function HistoryPage() {
  const params = useSearchParams();
  const router = useRouter();
  const initialTab = (params.get("aba") as Tab) || "atividades";
  const [tab, setTab] = useState<Tab>(["atividades", "erradas", "favoritas", "revisar"].includes(initialTab) ? initialTab : "atividades");
  const account = useActiveAccount();
  const records = useRecords(account);
  const wrong = useMemo(() => wrongQuestionIds(records), [records]);

  const changeTab = (t: Tab) => {
    setTab(t);
    router.replace(`/historico?aba=${t}`, { scroll: false });
  };

  return (
    <div>
      <PageHeader eyebrow="Histórico" title="Suas atividades" description="Listas e simulados, concluídos ou interrompidos, além das questões para revisar." />
      <Tabs<Tab>
        layoutId="history-tabs"
        value={tab}
        onChange={changeTab}
        className="mb-6"
        tabs={[
          { value: "atividades", label: "Atividades", icon: HistoryIcon, count: account.practiceSessions.length + account.simulations.length },
          { value: "erradas", label: "Erradas", icon: XCircle, count: wrong.length },
          { value: "favoritas", label: "Favoritas", icon: Star, count: account.favorites.length },
          { value: "revisar", label: "Para revisar", icon: Bookmark, count: account.reviewMarks.length },
        ]}
      />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
          {tab === "atividades" && <Activities initialKind={params.get("tipo") === "simulados" ? "simulados" : "todas"} />}
          {tab === "erradas" && (
            <QuestionCollection
              ids={wrong.map((w) => w.questionId)}
              meta={(id) => {
                const w = wrong.find((x) => x.questionId === id);
                return w ? `Último erro: ${formatDate(w.answeredAt)}` : "";
              }}
              mode="retry"
              title="Refazer questões erradas"
              emptyTitle="Nenhuma questão errada pendente"
              emptyText="Quando você errar uma questão, ela aparece aqui até que você acerte numa nova tentativa."
              illustration={<IllustrationFlag />}
              note="Ao refazer, sua resposta anterior não é exibida — você começa do zero."
            />
          )}
          {tab === "favoritas" && (
            <QuestionCollection
              ids={account.favorites}
              mode="favorites"
              title="Praticar favoritas"
              emptyTitle="Nenhuma questão favorita"
              emptyText="Use a estrela durante a resolução para guardar questões que você quer rever."
              illustration={<IllustrationStar />}
            />
          )}
          {tab === "revisar" && (
            <QuestionCollection
              ids={account.reviewMarks}
              mode="marks"
              title="Praticar marcadas"
              emptyTitle="Nada marcado para revisão"
              emptyText="Marque questões durante a prática (tecla M) para encontrá-las aqui."
              illustration={<IllustrationStack />}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Activities({ initialKind }: { initialKind: Kind }) {
  const account = useActiveAccount();
  const now = useNow(60000);
  const removePractice = useAppStore((s) => s.removePractice);
  const removeSimulation = useAppStore((s) => s.removeSimulation);
  const [kind, setKind] = useState<Kind>(initialKind);
  const [status, setStatus] = useState<Status>("todos");
  const [subject, setSubject] = useState<SubjectId | "todas">("todas");
  const [period, setPeriod] = useState<Period>("30");
  const [result, setResult] = useState<ResultFilter>("todos");
  const [open, setOpen] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE);
  const [toDelete, setToDelete] = useState<ActivityItem | null>(null);

  const items = useMemo<ActivityItem[]>(() => {
    const p: ActivityItem[] = account.practiceSessions.map((s) => {
      const r = practiceResult(s, now);
      const qs = questionRepository.getMany(s.questionIds);
      return {
        id: s.id,
        kind: "practice",
        title: s.title,
        date: s.completedAt ?? s.updatedAt,
        status: s.status,
        total: r.total,
        answered: r.answered,
        correct: r.correct,
        accuracy: r.accuracyAnswered,
        timeMs: r.timeMs,
        subjects: Array.from(new Set(qs.map((q) => q.subjectId))),
        areas: Array.from(new Set(qs.map((q) => q.areaId))),
        session: s,
      };
    });
    const sims: ActivityItem[] = account.simulations.map((s) => {
      const r = simulationResult(s, now);
      const qs = questionRepository.getMany(s.questionIds);
      return {
        id: s.id,
        kind: "simulation",
        title: s.title,
        date: s.completedAt ?? s.updatedAt,
        status: s.status,
        total: r.total,
        answered: r.answered,
        correct: s.status === "completed" ? r.correct : 0,
        accuracy: s.status === "completed" ? r.accuracy : 0,
        timeMs: r.timeMs,
        subjects: Array.from(new Set(qs.map((q) => q.subjectId))),
        areas: Array.from(new Set(qs.map((q) => q.areaId))),
        session: s,
      };
    });
    return [...p, ...sims].sort((a, b) => b.date.localeCompare(a.date));
  }, [account.practiceSessions, account.simulations, now]);

  const filtered = items.filter((it) => {
    if (kind === "listas" && it.kind !== "practice") return false;
    if (kind === "simulados" && it.kind !== "simulation") return false;
    if (status === "concluidas" && it.status !== "completed") return false;
    if (status === "interrompidas" && it.status !== "in_progress") return false;
    if (subject !== "todas" && !it.subjects.includes(subject)) return false;
    if (period !== "tudo" && now - new Date(it.date).getTime() > Number(period) * 86400000) return false;
    if (result !== "todos") {
      if (it.status !== "completed" || it.answered === 0) return false;
      if (result === "alto" && it.accuracy < 0.7) return false;
      if (result === "medio" && (it.accuracy < 0.5 || it.accuracy >= 0.7)) return false;
      if (result === "baixo" && it.accuracy >= 0.5) return false;
    }
    return true;
  });

  const shown = filtered.slice(0, limit);

  return (
    <div>
      <Card padded="sm" className="mb-5">
        <div className="flex flex-wrap items-end gap-4 p-1">
          <FilterBlock label="Tipo">
            <SegmentedControl<Kind>
              ariaLabel="Tipo de atividade"
              layoutId="h-kind"
              size="sm"
              value={kind}
              onChange={setKind}
              options={[
                { value: "todas", label: "Todas" },
                { value: "listas", label: "Listas" },
                { value: "simulados", label: "Simulados" },
              ]}
            />
          </FilterBlock>
          <FilterBlock label="Situação">
            <SegmentedControl<Status>
              ariaLabel="Situação"
              layoutId="h-status"
              size="sm"
              value={status}
              onChange={setStatus}
              options={[
                { value: "todos", label: "Todas" },
                { value: "concluidas", label: "Concluídas" },
                { value: "interrompidas", label: "Interrompidas" },
              ]}
            />
          </FilterBlock>
          <FilterBlock label="Matéria" className="w-52">
            <Select<SubjectId | "todas">
              ariaLabel="Matéria"
              value={subject}
              onChange={setSubject}
              options={[{ value: "todas", label: "Todas as matérias" }, ...SUBJECTS.map((s) => ({ value: s.id, label: s.name }))]}
            />
          </FilterBlock>
          <FilterBlock label="Período" className="w-44">
            <Select<Period>
              ariaLabel="Período"
              value={period}
              onChange={setPeriod}
              options={[
                { value: "7", label: "Últimos 7 dias" },
                { value: "30", label: "Últimos 30 dias" },
                { value: "90", label: "Últimos 90 dias" },
                { value: "tudo", label: "Todo o período" },
              ]}
            />
          </FilterBlock>
          <FilterBlock label="Resultado" className="w-48">
            <Select<ResultFilter>
              ariaLabel="Resultado"
              value={result}
              onChange={setResult}
              options={[
                { value: "todos", label: "Qualquer resultado" },
                { value: "alto", label: "70% ou mais" },
                { value: "medio", label: "Entre 50% e 69%" },
                { value: "baixo", label: "Abaixo de 50%" },
              ]}
            />
          </FilterBlock>
        </div>
      </Card>

      <p className="mb-3 text-sm text-fg-muted" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "atividade encontrada" : "atividades encontradas"}
      </p>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            illustration={<IllustrationStack />}
            title="Nenhuma atividade com esses filtros"
            description="Ajuste os filtros acima ou comece uma nova lista de questões."
            action={
              <ButtonLink href="/questoes" icon={BookOpenCheck}>
                Praticar agora
              </ButtonLink>
            }
          />
        </Card>
      ) : (
        <motion.ul layout className="space-y-3">
          <AnimatePresence initial={false}>
            {shown.map((it, i) => {
              const isOpen = open === it.id;
              const href =
                it.kind === "practice"
                  ? it.status === "completed"
                    ? `/questoes/resultado/${it.id}`
                    : `/questoes/sessao/${it.id}`
                  : it.status === "completed"
                    ? `/simulados/resultado/${it.id}`
                    : `/simulados/prova/${it.id}`;
              return (
                <motion.li
                  key={it.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 8) * 0.035 } }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-xs transition-shadow hover:shadow-sm"
                >
                  <button type="button" onClick={() => setOpen(isOpen ? null : it.id)} aria-expanded={isOpen} className="flex w-full items-center gap-4 p-4 text-left">
                    <IconTile tone={it.kind === "practice" ? "sage" : "coral"}>{it.kind === "practice" ? <BookOpenCheck /> : <Timer />}</IconTile>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold">{it.title}</p>
                        <Badge size="sm" tone={it.status === "completed" ? "sage" : "warning"}>
                          {it.status === "completed" ? "Concluída" : "Interrompida"}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-fg-subtle">
                        {it.kind === "practice" ? "Lista de questões" : "Simulado"} · {formatRelativeDay(it.date, now)} às {formatTime(it.date)} · {formatDuration(it.timeMs, { compact: true })}
                      </p>
                    </div>
                    <div className="hidden w-40 sm:block">
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-fg-subtle tabular">
                          {it.status === "completed" || it.kind === "practice" ? `${it.correct}/${it.answered || it.total}` : `${it.answered}/${it.total} resp.`}
                        </span>
                        <span className="font-bold tabular">{it.status === "completed" || it.kind === "practice" ? formatPercent(it.accuracy) : "—"}</span>
                      </div>
                      <ProgressBar
                        value={it.status === "completed" || it.kind === "practice" ? it.accuracy : it.answered / it.total}
                        tone={it.status !== "completed" && it.kind === "simulation" ? "ink" : it.accuracy >= 0.7 ? "sage" : it.accuracy >= 0.5 ? "gold" : "coral"}
                        height="h-1.5"
                      />
                    </div>
                    <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={spring.snappy}>
                      <ChevronDown className="size-4 text-fg-subtle" />
                    </motion.span>
                  </button>
                  <Collapse open={isOpen}>
                    <div className="border-t border-border bg-surface-2/40 p-5">
                      <div className="flex flex-wrap gap-2">
                        {it.subjects.map((s) => {
                          const Icon = SUBJECT_ICON[s];
                          return (
                            <Badge key={s} tone={SUBJECT_BY_ID[s].areaId} icon={<Icon />}>
                              {SUBJECT_BY_ID[s].name}
                            </Badge>
                          );
                        })}
                      </div>
                      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                        <Stat label="Questões" value={String(it.total)} />
                        <Stat label="Respondidas" value={String(it.answered)} />
                        <Stat label="Acertos" value={it.kind === "simulation" && it.status !== "completed" ? "após finalizar" : String(it.correct)} />
                        <Stat label="Data" value={formatDate(it.date)} />
                      </dl>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {it.status === "completed" ? (
                          <>
                            <ButtonLink href={href} size="sm" icon={BarChart3}>
                              Ver resultado
                            </ButtonLink>
                            {it.kind === "simulation" && (
                              <ButtonLink href={`/simulados/revisao/${it.id}`} size="sm" variant="secondary" icon={Eye}>
                                Revisão
                              </ButtonLink>
                            )}
                          </>
                        ) : (
                          <>
                            <ButtonLink href={href} size="sm" variant="accent" icon={Play}>
                              Continuar
                            </ButtonLink>
                            <Button size="sm" variant="ghost" icon={Trash2} onClick={() => setToDelete(it)}>
                              Excluir
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Collapse>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      )}
      {filtered.length > limit && (
        <div className="mt-6 flex justify-center">
          <Button variant="secondary" onClick={() => setLimit((l) => l + PAGE)}>
            Mostrar mais ({filtered.length - limit} restantes)
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) (toDelete.kind === "practice" ? removePractice : removeSimulation)(toDelete.id);
          setToDelete(null);
          toast.info("Atividade excluída");
        }}
        tone="danger"
        title="Excluir atividade interrompida?"
        description="As respostas já corrigidas desta atividade deixarão de contar nas suas estatísticas."
        confirmLabel="Excluir"
        icon={
          <IconTile tone="danger" size="lg">
            <Trash2 />
          </IconTile>
        }
      />
    </div>
  );
}

function FilterBlock({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="mb-1.5 text-xs font-semibold text-fg-subtle">{label}</p>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface p-3">
      <dt className="text-xs text-fg-subtle">{label}</dt>
      <dd className="mt-0.5 font-semibold tabular">{value}</dd>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function QuestionCollection({
  ids,
  mode,
  title,
  emptyTitle,
  emptyText,
  illustration,
  meta,
  note,
}: {
  ids: string[];
  mode: "retry" | "favorites" | "marks";
  title: string;
  emptyTitle: string;
  emptyText: string;
  illustration: React.ReactNode;
  meta?: (id: string) => string;
  note?: string;
}) {
  const startPractice = useStartPractice();
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const toggleReviewMark = useAppStore((s) => s.toggleReviewMark);
  const [subject, setSubject] = useState<SubjectId | "todas">("todas");
  const [selected, setSelected] = useState<string[]>([]);

  const questions = questionRepository.getMany(ids).filter((q) => subject === "todas" || q.subjectId === subject);
  const subjectsPresent = Array.from(new Set(questionRepository.getMany(ids).map((q) => q.subjectId)));
  const target = selected.length ? selected.filter((s) => questions.some((q) => q.id === s)) : questions.map((q) => q.id);

  const start = () => {
    const chosen = target.slice(0, 30);
    startPractice({ mode: mode === "retry" ? "retry" : "custom", title: mode === "retry" ? "Revisão de erros" : mode === "favorites" ? "Questões favoritas" : "Questões marcadas", questionIds: chosen });
  };

  if (ids.length === 0) {
    return (
      <Card>
        <EmptyState illustration={illustration} title={emptyTitle} description={emptyText} action={<ButtonLink href="/questoes">Praticar questões</ButtonLink>} />
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-12 items-start gap-6">
      <div className="col-span-12 lg:col-span-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="w-56">
            <Select<SubjectId | "todas">
              ariaLabel="Filtrar por matéria"
              value={subject}
              onChange={(v) => {
                setSubject(v);
                setSelected([]);
              }}
              options={[{ value: "todas", label: "Todas as matérias" }, ...subjectsPresent.map((s) => ({ value: s, label: SUBJECT_BY_ID[s].name }))]}
            />
          </div>
          <Checkbox
            checked={selected.length > 0 && selected.length === questions.length}
            onChange={(v) => setSelected(v ? questions.map((q) => q.id) : [])}
            label={<span className="text-sm text-fg-muted">Selecionar todas ({questions.length})</span>}
          />
        </div>
        <motion.ul layout className="space-y-2.5">
          <AnimatePresence initial={false}>
            {questions.map((q, i) => (
              <QuestionRow
                key={q.id}
                q={q}
                index={i}
                meta={meta?.(q.id)}
                checked={selected.includes(q.id)}
                onCheck={(v) => setSelected((s) => (v ? [...s, q.id] : s.filter((x) => x !== q.id)))}
                onRemove={
                  mode === "favorites"
                    ? () => {
                        toggleFavorite(q.id);
                        toast.info("Removida das favoritas");
                      }
                    : mode === "marks"
                      ? () => {
                          toggleReviewMark(q.id);
                          toast.info("Marcação removida");
                        }
                      : undefined
                }
                onPractice={() => startPractice({ mode: mode === "retry" ? "retry" : "single", title: TOPIC_BY_ID[q.topicId]?.name ?? "Questão", questionIds: [q.id] })}
              />
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>
      <Card surface="ink" className="col-span-12 lg:sticky lg:top-24 lg:col-span-4">
        <IconTile tone="gold" size="lg">
          <RotateCcw />
        </IconTile>
        <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
        <p className="mt-1.5 text-sm text-on-ink-muted">
          {selected.length ? `${Math.min(30, target.length)} questões selecionadas.` : `Todas as ${Math.min(30, target.length)} questões${target.length > 30 ? " (máximo de 30 por lista)" : ""} do filtro atual.`}
        </p>
        {note && <p className="mt-3 text-xs text-on-ink-muted">{note}</p>}
        <Button variant="accent" fullWidth className="mt-6" icon={Play} onClick={start} disabled={target.length === 0}>
          Começar
        </Button>
      </Card>
    </div>
  );
}

function QuestionRow({
  q,
  index,
  meta,
  checked,
  onCheck,
  onRemove,
  onPractice,
}: {
  q: Question;
  index: number;
  meta?: string;
  checked: boolean;
  onCheck: (v: boolean) => void;
  onRemove?: () => void;
  onPractice: () => void;
}) {
  const Icon = SUBJECT_ICON[q.subjectId];
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { delay: Math.min(index, 8) * 0.03 } }}
      exit={{ opacity: 0, x: -24, transition: { duration: 0.18 } }}
      className={cn("flex items-start gap-4 rounded-[var(--radius-card)] border bg-surface p-4 transition-colors", checked ? "border-gold-strong/50 bg-gold-soft/30" : "border-border")}
    >
      <div className="pt-1">
        <Checkbox checked={checked} onChange={onCheck} label={<span className="sr-only">Selecionar questão</span>} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge size="sm" tone={q.areaId} icon={<Icon />}>
            {SUBJECT_BY_ID[q.subjectId].name}
          </Badge>
          <span className="text-xs text-fg-subtle">{TOPIC_BY_ID[q.topicId]?.name}</span>
          {meta && <span className="text-xs text-fg-subtle">· {meta}</span>}
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-fg">{q.support?.paragraphs[0] ?? q.prompt}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {onRemove && <IconButton icon={Trash2} label="Remover da lista" size="sm" onClick={onRemove} />}
        <Button size="sm" variant="secondary" icon={Play} onClick={onPractice}>
          Praticar
        </Button>
      </div>
    </motion.li>
  );
}

