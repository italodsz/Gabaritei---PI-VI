import type { SessionClock } from "@/types";

/**
 * Cronômetro serializável: tempo acumulado + instante da última retomada.
 * Funciona corretamente ao pausar, retomar, trocar de página e restaurar
 * a sessão do armazenamento local.
 */

export const createClock = (running: boolean, now: number): SessionClock => ({
  elapsedMs: 0,
  runningSince: running ? now : null,
});

export function clockElapsed(clock: SessionClock, now: number): number {
  return clock.elapsedMs + (clock.runningSince !== null ? Math.max(0, now - clock.runningSince) : 0);
}

export function pauseClock(clock: SessionClock, now: number): SessionClock {
  if (clock.runningSince === null) return clock;
  return { elapsedMs: clockElapsed(clock, now), runningSince: null };
}

export function resumeClock(clock: SessionClock, now: number): SessionClock {
  if (clock.runningSince !== null) return clock;
  return { ...clock, runningSince: now };
}

export const isRunning = (clock: SessionClock) => clock.runningSince !== null;

/** Tempo restante em sessões com limite (simulados). */
export function clockRemaining(clock: SessionClock, durationMs: number, now: number): number {
  return Math.max(0, durationMs - clockElapsed(clock, now));
}
