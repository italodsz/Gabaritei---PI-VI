import { describe, expect, it } from "vitest";
import { practice, simulation } from "./reducers";
import { createPracticeSession, createSimulationSession } from "./factory";
import { QUESTION_BY_ID } from "@/data/fixtures/questions";

const T0 = new Date("2026-10-09T10:00:00").getTime();

function newPractice() {
  return createPracticeSession({
    mode: "custom",
    title: "Teste",
    questionIds: ["mat-variacao-1", "mat-juros-1", "mat-escala-1"],
    filters: { subjectId: "matematica", topicIds: [], subtopicIds: [], years: [], count: 3 },
    timerVisible: true,
    now: T0,
  });
}

describe("reducers de prática", () => {
  it("tempo por questão ignora pausas", () => {
    let s = newPractice();
    s = practice.pause(s, T0 + 10_000);
    s = practice.resume(s, T0 + 70_000);
    s = practice.select(s, QUESTION_BY_ID["mat-variacao-1"].correct, T0 + 75_000);
    s = practice.confirm(s, T0 + 80_000);
    expect(s.answers["mat-variacao-1"].timeSpentMs).toBe(20_000);
    expect(s.answers["mat-variacao-1"].correct).toBe(true);
  });

  it("não permite alterar resposta após confirmar e não duplica confirmação", () => {
    let s = newPractice();
    s = practice.select(s, "A", T0 + 1000);
    s = practice.confirm(s, T0 + 2000);
    const answeredAt = s.answers["mat-variacao-1"].answeredAt;
    s = practice.select(s, "B", T0 + 3000);
    s = practice.confirm(s, T0 + 4000);
    expect(s.answers["mat-variacao-1"].selected).toBe("A");
    expect(s.answers["mat-variacao-1"].answeredAt).toBe(answeredAt);
  });

  it("recupera sessão com cronômetro ativo sem contar o tempo fechado", () => {
    let s = newPractice();
    s = practice.heartbeat(s, T0 + 30_000);
    const recovered = practice.recover(s, T0 + 3_600_000);
    expect(recovered.clock.runningSince).toBeNull();
    expect(recovered.clock.elapsedMs).toBe(50_000);
  });

  it("inserir questão semelhante atualiza a contagem", () => {
    const s = practice.insertNext(newPractice(), "mat-pa-1", T0 + 1000);
    expect(s.questionIds).toHaveLength(4);
    expect(s.questionIds[1]).toBe("mat-pa-1");
    expect(s.currentIndex).toBe(1);
  });
});

describe("reducers de simulado", () => {
  const sim = () =>
    createSimulationSession({
      config: { mode: "custom", edition: null, day: null, areaIds: ["matematica"], size: 10, foreignLanguage: "ingles", criteria: "random" },
      records: [],
      difficultSubjects: [],
      now: T0,
      timerHidden: false,
      seed: 4,
    });

  it("permite alterar respostas até finalizar", () => {
    let s = simulation.resume(sim(), T0);
    s = simulation.select(s, "A", T0 + 1000);
    s = simulation.select(s, "C", T0 + 2000);
    expect(s.answers[s.questionIds[0]].selected).toBe("C");
    s = simulation.finish(s, "manual", T0 + 3000);
    s = simulation.select(s, "D", T0 + 4000);
    expect(s.answers[s.questionIds[0]].selected).toBe("C");
    expect(s.status).toBe("completed");
  });

  it("tempo restante respeita pausas e limita ao fim", () => {
    let s = simulation.resume(sim(), T0);
    s = simulation.pause(s, T0 + 60_000);
    expect(simulation.remaining(s, T0 + 999_999)).toBe(s.config.durationMs - 60_000);
    s = simulation.resume(s, T0 + 100_000);
    expect(simulation.remaining(s, T0 + 100_000 + s.config.durationMs)).toBe(0);
    s = simulation.finish(s, "timeout", T0 + 100_000 + s.config.durationMs + 5000);
    expect(s.finishReason).toBe("timeout");
    expect(s.clock.elapsedMs).toBe(s.config.durationMs);
  });
});
