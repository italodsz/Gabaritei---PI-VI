import { describe, expect, it } from "vitest";
import { createDemoAccount, createEmptyAccount } from "@/data/seeds/accounts";
import { QUESTION_BY_ID } from "@/data/fixtures/questions";
import { collectAnswerRecords } from "./records";
import { buildSeries, comparePeriods, computeStreak, summarize } from "./stats";
import { practiceResult, simulationResult, estimateDemoScore } from "./results";
import { evaluateAchievements } from "./achievements";
import { goalProgress } from "./goals";
import { clockElapsed, pauseClock, resumeClock, createClock, clockRemaining } from "@/lib/sessions/clock";
import { createPracticeSession, createSimulationSession, selectPracticeQuestions } from "@/lib/sessions/factory";
import { buildAutoSelection, recommendTopics } from "@/lib/recommendations/engine";

const NOW = new Date("2026-10-09T15:00:00").getTime();
const DAY = 86400000;

describe("cronômetro de sessão", () => {
  it("acumula apenas o tempo em execução", () => {
    let c = createClock(true, 0);
    expect(clockElapsed(c, 5000)).toBe(5000);
    c = pauseClock(c, 5000);
    expect(clockElapsed(c, 60000)).toBe(5000);
    c = resumeClock(c, 60000);
    expect(clockElapsed(c, 61000)).toBe(6000);
    expect(clockRemaining(c, 10000, 61000)).toBe(4000);
    expect(clockRemaining(c, 10000, 999999)).toBe(0);
  });

  it("pausar duas vezes não altera o tempo", () => {
    const c = pauseClock(pauseClock(createClock(true, 0), 1000), 9000);
    expect(c.elapsedMs).toBe(1000);
  });
});

describe("sequência de estudos", () => {
  const rec = (t: number) => ({ questionId: "x", sessionId: "s", source: "practice" as const, correct: true, answeredAt: t, timeSpentMs: 1, areaId: "matematica" as const, subjectId: "matematica" as const, topicId: "mat-funcoes" });

  it("conta dias consecutivos até hoje", () => {
    const s = computeStreak([rec(NOW), rec(NOW - DAY), rec(NOW - 2 * DAY), rec(NOW - 5 * DAY)], NOW);
    expect(s.current).toBe(3);
    expect(s.activeToday).toBe(true);
  });

  it("mantém a sequência se o último estudo foi ontem", () => {
    const s = computeStreak([rec(NOW - DAY), rec(NOW - 2 * DAY)], NOW);
    expect(s.current).toBe(2);
    expect(s.activeToday).toBe(false);
  });

  it("zera após um dia sem estudo", () => {
    expect(computeStreak([rec(NOW - 2 * DAY)], NOW).current).toBe(0);
  });
});

describe("estudante demonstrativo", () => {
  const demo = createDemoAccount(NOW);
  const records = collectAnswerRecords(demo);

  it("é determinístico", () => {
    const again = createDemoAccount(NOW);
    expect(collectAnswerRecords(again).length).toBe(records.length);
  });

  it("tem histórico plausível e coerente", () => {
    const s = summarize(records);
    expect(s.answered).toBeGreaterThan(500);
    expect(s.accuracy).toBeGreaterThan(0.45);
    expect(s.accuracy).toBeLessThan(0.8);
    expect(records.every((r) => r.answeredAt <= NOW)).toBe(true);
    expect(computeStreak(records, NOW).current).toBeGreaterThanOrEqual(12);
  });

  it("tem sessões interrompidas recuperáveis", () => {
    expect(demo.practiceSessions.filter((s) => s.status === "in_progress")).toHaveLength(1);
    expect(demo.simulations.filter((s) => s.status === "in_progress")).toHaveLength(1);
  });

  it("marca como celebradas as conquistas já desbloqueadas", () => {
    const unlocked = evaluateAchievements({ records, account: demo, now: NOW }).filter((a) => a.unlocked);
    expect(unlocked.length).toBeGreaterThan(5);
    expect(new Set(demo.celebratedAchievements)).toEqual(new Set(unlocked.map((a) => a.id)));
  });

  it("gera séries e comparações", () => {
    const daily = buildSeries(records, "day", NOW);
    expect(daily).toHaveLength(14);
    expect(daily.reduce((n, p) => n + p.answered, 0)).toBeGreaterThan(0);
    const cmp = comparePeriods(records, "week", NOW);
    expect(cmp.current.answered).toBeGreaterThan(0);
  });

  it("calcula metas a partir dos registros", () => {
    const g = goalProgress({ kind: "monthly_simulations", target: 3, enabled: true }, records, demo, NOW);
    expect(g.current).toBeGreaterThanOrEqual(1);
  });
});

describe("estudante novo", () => {
  const fresh = createEmptyAccount({ id: "u1", kind: "new", name: "João Lima", email: "joao@ex.com", now: NOW });
  it("começa vazio", () => {
    expect(collectAnswerRecords(fresh)).toHaveLength(0);
    expect(evaluateAchievements({ records: [], account: fresh, now: NOW }).every((a) => !a.unlocked)).toBe(true);
  });
  it("recebe recomendações a partir do onboarding", () => {
    const recs = recommendTopics({ records: [], difficultSubjects: ["quimica"], now: NOW });
    expect(recs[0].subjectId).toBe("quimica");
    expect(recs[0].kind).toBe("dificuldade");
  });
});

describe("criação de sessões", () => {
  it("lista tem exatamente a quantidade configurada", () => {
    const ids = selectPracticeQuestions({ subjectId: "matematica", topicIds: [], subtopicIds: [], years: [], count: 15 }, [], 1, null);
    expect(ids).toHaveLength(15);
    expect(new Set(ids).size).toBe(15);
    const s = createPracticeSession({ mode: "custom", title: "t", questionIds: ids, filters: { subjectId: "matematica", topicIds: [], subtopicIds: [], years: [], count: 15 }, timerVisible: true, now: NOW });
    expect(s.questionIds).toHaveLength(15);
    expect(Object.keys(s.answers)).toHaveLength(15);
  });

  it("IA escolhe por mim respeita a quantidade", () => {
    const fresh = createEmptyAccount({ id: "u1", kind: "new", name: "A", email: "a@a.com", now: NOW });
    fresh.onboarding.difficultSubjects = ["fisica", "matematica"];
    const sel = buildAutoSelection(fresh, [], 20, NOW, 7);
    expect(sel.questionIds).toHaveLength(20);
    expect(new Set(sel.questionIds).size).toBe(20);
  });

  it.each([1, 2] as const)("simulado oficial completo do dia %i tem 90 questões únicas", (day) => {
    const sim = createSimulationSession({
      config: { mode: "official", edition: 2023, day, areaIds: [], size: 90, foreignLanguage: "espanhol", criteria: "balanced" },
      records: [], difficultSubjects: [], now: NOW, timerHidden: false, seed: 3,
    });
    expect(sim.questionIds).toHaveLength(90);
    expect(new Set(sim.questionIds).size).toBe(90);
    expect(sim.sections).toHaveLength(2);
    expect(sim.sections[0].end - sim.sections[0].start).toBe(45);
    expect(sim.sections[0].firstNumber).toBe(day === 1 ? 1 : 91);
    expect(sim.sections[1].firstNumber).toBe(day === 1 ? 46 : 136);
    if (day === 1) {
      const first5 = sim.questionIds.slice(0, 5).map((id) => QUESTION_BY_ID[id]);
      expect(first5.every((q) => q.foreignLanguage === "espanhol")).toBe(true);
      expect(sim.config.includesEssay).toBe(true);
      expect(sim.config.durationMs).toBe(5.5 * 3600000);
    }
  });

  it("simulado personalizado respeita o tamanho", () => {
    const sim = createSimulationSession({
      config: { mode: "custom", edition: null, day: null, areaIds: ["matematica", "natureza", "humanas"], size: 20, foreignLanguage: "ingles", criteria: "weak" },
      records: [], difficultSubjects: ["fisica"], now: NOW, timerHidden: false, seed: 9,
    });
    expect(sim.questionIds).toHaveLength(20);
    expect(sim.config.durationMs).toBe(20 * 3 * 60000);
  });
});

describe("resultados", () => {
  it("resultado do simulado considera brancos como não acertos", () => {
    const sim = createSimulationSession({
      config: { mode: "custom", edition: null, day: null, areaIds: ["matematica"], size: 10, foreignLanguage: "ingles", criteria: "random" },
      records: [], difficultSubjects: [], now: NOW, timerHidden: false, seed: 1,
    });
    sim.questionIds.slice(0, 4).forEach((id) => (sim.answers[id].selected = QUESTION_BY_ID[id].correct));
    const r = simulationResult(sim, NOW);
    expect(r.correct).toBe(4);
    expect(r.blank).toBe(6);
    expect(r.accuracy).toBeCloseTo(0.4);
  });

  it("nota demonstrativa é monotônica e limitada", () => {
    expect(estimateDemoScore(0)).toBeLessThan(estimateDemoScore(0.5));
    expect(estimateDemoScore(1)).toBeLessThanOrEqual(850);
  });

  it("resultado da lista separa não respondidas", () => {
    const demo = createDemoAccount(NOW);
    const paused = demo.practiceSessions.find((s) => s.status === "in_progress")!;
    const r = practiceResult(paused, NOW);
    expect(r.answered).toBe(4);
    expect(r.unanswered).toBe(6);
  });
});
