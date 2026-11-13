import type { AlternativeLetter, PracticeSession, SimulationSession } from "@/types";
import { QUESTION_BY_ID } from "@/lib/repositories/questionRepository";
import { clockElapsed, clockRemaining, pauseClock, resumeClock } from "./clock";

/**
 * Reducers puros das sessões. Toda mudança passa por aqui, o que mantém
 * o tempo por questão consistente com o cronômetro (pausas não contam).
 */

const iso = (now: number) => new Date(now).toISOString();

/* ------------------------------------------------------------------ */
/* Prática                                                             */
/* ------------------------------------------------------------------ */

/** Contabiliza o tempo gasto na questão atual até `now`. */
function settlePractice(s: PracticeSession, now: number): PracticeSession {
  const elapsed = clockElapsed(s.clock, now);
  const delta = Math.max(0, elapsed - s.cursorElapsedMs);
  const qid = s.questionIds[s.currentIndex];
  const a = qid ? s.answers[qid] : undefined;
  if (!a || a.confirmed || delta === 0) return { ...s, cursorElapsedMs: elapsed };
  return {
    ...s,
    cursorElapsedMs: elapsed,
    answers: { ...s.answers, [qid]: { ...a, timeSpentMs: a.timeSpentMs + delta } },
  };
}

export const practice = {
  select(s: PracticeSession, letter: AlternativeLetter, now: number): PracticeSession {
    const qid = s.questionIds[s.currentIndex];
    const a = s.answers[qid];
    if (!a || a.confirmed || s.status === "completed") return s;
    return { ...s, updatedAt: iso(now), answers: { ...s.answers, [qid]: { ...a, selected: a.selected === letter ? null : letter } } };
  },

  confirm(s: PracticeSession, now: number): PracticeSession {
    const settled = settlePractice(s, now);
    const qid = settled.questionIds[settled.currentIndex];
    const a = settled.answers[qid];
    const q = QUESTION_BY_ID[qid];
    if (!a || !q || a.confirmed || !a.selected) return s;
    return {
      ...settled,
      updatedAt: iso(now),
      answers: {
        ...settled.answers,
        [qid]: { ...a, confirmed: true, correct: a.selected === q.correct, answeredAt: iso(now) },
      },
    };
  },

  goTo(s: PracticeSession, index: number, now: number): PracticeSession {
    if (index < 0 || index >= s.questionIds.length || index === s.currentIndex) return s;
    return { ...settlePractice(s, now), currentIndex: index, updatedAt: iso(now) };
  },

  pause(s: PracticeSession, now: number): PracticeSession {
    if (s.clock.runningSince === null) return s;
    const settled = settlePractice(s, now);
    return { ...settled, clock: pauseClock(settled.clock, now), updatedAt: iso(now) };
  },

  resume(s: PracticeSession, now: number): PracticeSession {
    if (s.clock.runningSince !== null || s.status === "completed") return s;
    return { ...s, clock: resumeClock(s.clock, now), cursorElapsedMs: s.clock.elapsedMs, updatedAt: iso(now) };
  },

  finish(s: PracticeSession, now: number): PracticeSession {
    const settled = settlePractice(s, now);
    return { ...settled, clock: pauseClock(settled.clock, now), status: "completed", completedAt: iso(now), updatedAt: iso(now) };
  },

  /** Acrescenta uma questão (semelhante ou aleatória) logo após a atual. */
  insertNext(s: PracticeSession, questionId: string, now: number): PracticeSession {
    if (s.questionIds.includes(questionId)) return s;
    const ids = s.questionIds.slice();
    ids.splice(s.currentIndex + 1, 0, questionId);
    return {
      ...settlePractice(s, now),
      questionIds: ids,
      currentIndex: s.currentIndex + 1,
      filters: { ...s.filters, count: ids.length },
      answers: {
        ...s.answers,
        [questionId]: { questionId, selected: null, confirmed: false, correct: null, answeredAt: null, timeSpentMs: 0 },
      },
      updatedAt: iso(now),
    };
  },

  setTimerVisible(s: PracticeSession, visible: boolean): PracticeSession {
    return { ...s, timerVisible: visible };
  },

  heartbeat(s: PracticeSession, now: number): PracticeSession {
    return { ...s, updatedAt: iso(now) };
  },

  /** Recupera uma sessão cujo cronômetro ficou ativo (ex.: aba fechada sem pausa). */
  recover(s: PracticeSession, now: number): PracticeSession {
    if (s.clock.runningSince === null) return s;
    if (now - new Date(s.updatedAt).getTime() < 20000) return s;
    const lastSeen = Math.min(now, new Date(s.updatedAt).getTime() + 20000);
    return practice.pause(s, Math.max(lastSeen, s.clock.runningSince));
  },
};

/* ------------------------------------------------------------------ */
/* Simulado                                                            */
/* ------------------------------------------------------------------ */

function settleSimulation(s: SimulationSession, now: number): SimulationSession {
  const elapsed = Math.min(clockElapsed(s.clock, now), s.config.durationMs);
  const delta = Math.max(0, elapsed - s.cursorElapsedMs);
  const qid = s.questionIds[s.currentIndex];
  const a = qid ? s.answers[qid] : undefined;
  if (!a || delta === 0) return { ...s, cursorElapsedMs: elapsed };
  return {
    ...s,
    cursorElapsedMs: elapsed,
    answers: { ...s.answers, [qid]: { ...a, timeSpentMs: a.timeSpentMs + delta } },
  };
}

export const simulation = {
  select(s: SimulationSession, letter: AlternativeLetter | null, now: number): SimulationSession {
    if (s.status === "completed") return s;
    const qid = s.questionIds[s.currentIndex];
    const a = s.answers[qid];
    if (!a) return s;
    return {
      ...s,
      updatedAt: iso(now),
      answers: { ...s.answers, [qid]: { ...a, selected: letter, answeredAt: letter ? iso(now) : null } },
    };
  },

  goTo(s: SimulationSession, index: number, now: number): SimulationSession {
    if (index < 0 || index >= s.questionIds.length || index === s.currentIndex) return s;
    return { ...settleSimulation(s, now), currentIndex: index, updatedAt: iso(now) };
  },

  toggleMark(s: SimulationSession, questionId: string, now: number): SimulationSession {
    const marked = s.marked.includes(questionId) ? s.marked.filter((m) => m !== questionId) : [...s.marked, questionId];
    return { ...s, marked, updatedAt: iso(now) };
  },

  pause(s: SimulationSession, now: number): SimulationSession {
    if (s.clock.runningSince === null) return s;
    const settled = settleSimulation(s, now);
    const clock = pauseClock(settled.clock, now);
    return { ...settled, clock: { ...clock, elapsedMs: Math.min(clock.elapsedMs, s.config.durationMs) }, updatedAt: iso(now) };
  },

  resume(s: SimulationSession, now: number): SimulationSession {
    if (s.clock.runningSince !== null || s.status === "completed") return s;
    return { ...s, clock: resumeClock(s.clock, now), cursorElapsedMs: s.clock.elapsedMs, updatedAt: iso(now) };
  },

  finish(s: SimulationSession, reason: "manual" | "timeout", now: number): SimulationSession {
    if (s.status === "completed") return s;
    const settled = settleSimulation(s, now);
    const clock = pauseClock(settled.clock, now);
    return {
      ...settled,
      clock: { ...clock, elapsedMs: Math.min(clock.elapsedMs, s.config.durationMs) },
      status: "completed",
      finishReason: reason,
      completedAt: iso(now),
      updatedAt: iso(now),
      currentIndex: 0,
    };
  },

  setTimerHidden(s: SimulationSession, hidden: boolean): SimulationSession {
    return { ...s, timerHidden: hidden };
  },

  heartbeat(s: SimulationSession, now: number): SimulationSession {
    return { ...s, updatedAt: iso(now) };
  },

  recover(s: SimulationSession, now: number): SimulationSession {
    if (s.clock.runningSince === null) return s;
    if (now - new Date(s.updatedAt).getTime() < 20000) return s;
    const lastSeen = Math.min(now, new Date(s.updatedAt).getTime() + 20000);
    return simulation.pause(s, Math.max(lastSeen, s.clock.runningSince));
  },

  remaining(s: SimulationSession, now: number): number {
    return clockRemaining(s.clock, s.config.durationMs, now);
  },
};
