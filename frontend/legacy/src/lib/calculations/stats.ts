import type { AccountData, AreaId, SubjectId } from "@/types";
import { AREAS, SUBJECTS, TOPIC_BY_ID } from "@/data/fixtures/taxonomy";
import { dayKey, startOfDay } from "@/lib/format";
import { clockElapsed } from "@/lib/sessions/clock";
import type { AnswerRecord } from "./records";

const DAY = 86400000;

export interface Summary {
  answered: number;
  correct: number;
  wrong: number;
  accuracy: number;
  timeMs: number;
  avgTimeMs: number;
}

export function summarize(records: AnswerRecord[]): Summary {
  const answered = records.length;
  const correct = records.reduce((n, r) => n + (r.correct ? 1 : 0), 0);
  const timeMs = records.reduce((n, r) => n + r.timeSpentMs, 0);
  return {
    answered,
    correct,
    wrong: answered - correct,
    accuracy: answered ? correct / answered : 0,
    timeMs,
    avgTimeMs: answered ? timeMs / answered : 0,
  };
}

export function groupSummary<K extends string>(records: AnswerRecord[], key: (r: AnswerRecord) => K): Map<K, Summary> {
  const buckets = new Map<K, AnswerRecord[]>();
  for (const r of records) {
    const k = key(r);
    const list = buckets.get(k);
    if (list) list.push(r);
    else buckets.set(k, [r]);
  }
  const out = new Map<K, Summary>();
  for (const [k, list] of buckets) out.set(k, summarize(list));
  return out;
}

export interface SubjectStat extends Summary {
  subjectId: SubjectId;
  name: string;
  areaId: AreaId;
}

export function subjectStats(records: AnswerRecord[]): SubjectStat[] {
  const map = groupSummary(records, (r) => r.subjectId);
  return SUBJECTS.map((s) => ({
    subjectId: s.id,
    name: s.name,
    areaId: s.areaId,
    ...(map.get(s.id) ?? summarize([])),
  }));
}

export interface AreaStat extends Summary {
  areaId: AreaId;
  name: string;
}

export function areaStats(records: AnswerRecord[]): AreaStat[] {
  const map = groupSummary(records, (r) => r.areaId);
  return AREAS.map((a) => ({ areaId: a.id, name: a.shortName, ...(map.get(a.id) ?? summarize([])) }));
}

export interface TopicStat extends Summary {
  topicId: string;
  name: string;
  subjectId: SubjectId;
  lastAnsweredAt: number;
  /** acerto suavizado (Laplace) — evita conclusões com poucas respostas */
  smoothed: number;
}

export function topicStats(records: AnswerRecord[]): TopicStat[] {
  const map = new Map<string, AnswerRecord[]>();
  for (const r of records) {
    const list = map.get(r.topicId);
    if (list) list.push(r);
    else map.set(r.topicId, [r]);
  }
  const out: TopicStat[] = [];
  for (const [topicId, list] of map) {
    const topic = TOPIC_BY_ID[topicId];
    if (!topic) continue;
    const s = summarize(list);
    out.push({
      ...s,
      topicId,
      name: topic.name,
      subjectId: topic.subjectId,
      lastAnsweredAt: Math.max(...list.map((r) => r.answeredAt)),
      smoothed: (s.correct + 1) / (s.answered + 2),
    });
  }
  return out;
}

/** Assuntos com maior dificuldade e melhor desempenho (mínimo de respostas). */
export function rankTopics(records: AnswerRecord[], minAnswered = 4) {
  const eligible = topicStats(records).filter((t) => t.answered >= minAnswered);
  const weakest = eligible.slice().sort((a, b) => a.smoothed - b.smoothed);
  const strongest = eligible.slice().sort((a, b) => b.smoothed - a.smoothed);
  return { weakest, strongest };
}

/* ------------------------------------------------------------------ */
/* Séries temporais                                                    */
/* ------------------------------------------------------------------ */

export type Granularity = "day" | "week" | "month";

export interface SeriesPoint {
  key: string;
  label: string;
  start: number;
  end: number;
  answered: number;
  correct: number;
  /** null quando não há respostas no período (evita linhas falsas em 0%) */
  accuracy: number | null;
  timeMs: number;
}

export const GRANULARITY_CONFIG: Record<Granularity, { buckets: number; label: string; compareLabel: string }> = {
  day: { buckets: 14, label: "Diário", compareLabel: "14 dias anteriores" },
  week: { buckets: 8, label: "Semanal", compareLabel: "8 semanas anteriores" },
  month: { buckets: 6, label: "Mensal", compareLabel: "6 meses anteriores" },
};

export function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  const day = (d.getDay() + 6) % 7; // segunda = 0
  d.setDate(d.getDate() - day);
  return d;
}

function startOfMonth(date: Date): Date {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
}

const monthShort = new Intl.DateTimeFormat("pt-BR", { month: "short" });
const dayShort = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

function bucketRanges(granularity: Granularity, now: number, count: number, offset = 0) {
  const ranges: { start: number; end: number; label: string; key: string }[] = [];
  const ref = new Date(now);
  for (let i = count - 1 + offset; i >= offset; i--) {
    let start: Date;
    let end: Date;
    let label: string;
    if (granularity === "day") {
      start = startOfDay(ref);
      start.setDate(start.getDate() - i);
      end = new Date(start);
      end.setDate(end.getDate() + 1);
      label = dayShort.format(start);
    } else if (granularity === "week") {
      start = startOfWeek(ref);
      start.setDate(start.getDate() - i * 7);
      end = new Date(start);
      end.setDate(end.getDate() + 7);
      label = dayShort.format(start);
    } else {
      start = startOfMonth(ref);
      start.setMonth(start.getMonth() - i);
      end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      label = monthShort.format(start).replace(".", "");
    }
    ranges.push({ start: start.getTime(), end: end.getTime(), label, key: `${granularity}-${dayKey(start)}` });
  }
  return ranges;
}

export function buildSeries(records: AnswerRecord[], granularity: Granularity, now: number, offset = 0): SeriesPoint[] {
  const count = GRANULARITY_CONFIG[granularity].buckets;
  return bucketRanges(granularity, now, count, offset).map((r) => {
    const inRange = records.filter((rec) => rec.answeredAt >= r.start && rec.answeredAt < r.end);
    const s = summarize(inRange);
    return {
      ...r,
      answered: s.answered,
      correct: s.correct,
      accuracy: s.answered ? s.accuracy : null,
      timeMs: s.timeMs,
    };
  });
}

export interface PeriodComparison {
  current: Summary;
  previous: Summary;
  /** variação de acerto em pontos percentuais (null sem dados anteriores) */
  accuracyDelta: number | null;
  answeredDelta: number | null;
}

export function comparePeriods(records: AnswerRecord[], granularity: Granularity, now: number): PeriodComparison {
  const cur = buildSeries(records, granularity, now, 0);
  const prev = buildSeries(records, granularity, now, GRANULARITY_CONFIG[granularity].buckets);
  const within = (start: number, end: number) => records.filter((r) => r.answeredAt >= start && r.answeredAt < end);
  const current = summarize(within(cur[0].start, cur[cur.length - 1].end));
  const previous = summarize(within(prev[0].start, prev[prev.length - 1].end));
  return {
    current,
    previous,
    accuracyDelta: previous.answered && current.answered ? current.accuracy - previous.accuracy : null,
    answeredDelta: previous.answered ? (current.answered - previous.answered) / previous.answered : null,
  };
}

/* ------------------------------------------------------------------ */
/* Sequência e calendário                                              */
/* ------------------------------------------------------------------ */

export function activityDays(records: AnswerRecord[]): Set<string> {
  return new Set(records.map((r) => dayKey(r.answeredAt)));
}

export interface Streak {
  current: number;
  best: number;
  activeToday: boolean;
}

export function computeStreak(records: AnswerRecord[], now: number): Streak {
  const days = activityDays(records);
  const today = startOfDay(new Date(now));
  const activeToday = days.has(dayKey(today));
  let current = 0;
  const cursor = new Date(today);
  if (!activeToday) cursor.setDate(cursor.getDate() - 1);
  while (days.has(dayKey(cursor))) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const sorted = Array.from(days).sort();
  let best = 0;
  let run = 0;
  let prev: number | null = null;
  for (const key of sorted) {
    const [y, m, d] = key.split("-").map(Number);
    const t = new Date(y, m - 1, d).getTime();
    run = prev !== null && Math.round((t - prev) / DAY) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = t;
  }
  return { current, best: Math.max(best, current), activeToday };
}

export interface CalendarCell {
  key: string;
  date: number;
  count: number;
  correct: number;
  future: boolean;
}

/** Grade de atividade (colunas = semanas, linhas = dias de segunda a domingo). */
export function activityCalendar(records: AnswerRecord[], now: number, weeks = 18): CalendarCell[][] {
  const counts = new Map<string, { count: number; correct: number }>();
  for (const r of records) {
    const k = dayKey(r.answeredAt);
    const c = counts.get(k) ?? { count: 0, correct: 0 };
    c.count++;
    if (r.correct) c.correct++;
    counts.set(k, c);
  }
  const firstWeek = startOfWeek(new Date(now));
  firstWeek.setDate(firstWeek.getDate() - (weeks - 1) * 7);
  const todayEnd = startOfDay(new Date(now)).getTime() + DAY;
  const cols: CalendarCell[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: CalendarCell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(firstWeek);
      date.setDate(date.getDate() + w * 7 + d);
      const k = dayKey(date);
      const c = counts.get(k);
      col.push({ key: k, date: date.getTime(), count: c?.count ?? 0, correct: c?.correct ?? 0, future: date.getTime() >= todayEnd });
    }
    cols.push(col);
  }
  return cols;
}

/* ------------------------------------------------------------------ */
/* Tempo de estudo                                                     */
/* ------------------------------------------------------------------ */

/** Tempo total de estudo, somando os cronômetros de todas as sessões. */
export function totalStudyTime(account: Pick<AccountData, "practiceSessions" | "simulations">, now: number): number {
  const sessions = [...account.practiceSessions, ...account.simulations];
  return sessions.reduce((sum, s) => sum + clockElapsed(s.clock, now), 0);
}

/** Respostas na semana corrente (segunda a domingo). */
export function recordsThisWeek(records: AnswerRecord[], now: number): AnswerRecord[] {
  const start = startOfWeek(new Date(now)).getTime();
  return records.filter((r) => r.answeredAt >= start);
}

export function recordsThisMonth(records: AnswerRecord[], now: number): AnswerRecord[] {
  const start = startOfMonth(new Date(now)).getTime();
  return records.filter((r) => r.answeredAt >= start);
}

/** Matérias mais praticadas (atividades frequentes). */
export function frequentSubjects(records: AnswerRecord[], limit = 4) {
  return subjectStats(records)
    .filter((s) => s.answered > 0)
    .sort((a, b) => b.answered - a.answered)
    .slice(0, limit);
}
