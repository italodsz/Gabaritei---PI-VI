/** Utilitários de aleatoriedade determinística (seeds estáveis entre execuções). */

export type Rng = () => number;

export function hashString(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 — PRNG pequeno e rápido, suficiente para dados demonstrativos. */
export function createRng(seed: number | string): Rng {
  let a = typeof seed === "string" ? hashString(seed) : seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pick<T>(items: readonly T[], rng: Rng): T {
  return items[Math.floor(rng() * items.length)];
}

export function sample<T>(items: readonly T[], n: number, rng: Rng): T[] {
  return shuffle(items, rng).slice(0, Math.max(0, n));
}

export function randomInt(min: number, max: number, rng: Rng): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Identificador curto para sessões (não criptográfico). */
export function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}

/** Seed nova a cada chamada (para sorteios disparados por ações do usuário). */
export function freshSeed(): number {
  return Date.now();
}
