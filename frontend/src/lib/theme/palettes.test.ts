import { describe, expect, it } from "vitest";
import { PALETTES, paletteCss, type PaletteTokens } from "./palettes";

function luminance(hex: string): number {
  const n = parseInt(hex.replace("#", ""), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

export function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** Pares texto/fundo usados na interface e o contraste mínimo exigido (WCAG). */
const PAIRS: [keyof PaletteTokens, keyof PaletteTokens, number][] = [
  ["fg", "bg", 7],
  ["fg", "surface", 7],
  ["fg-muted", "surface", 4.5],
  ["fg-muted", "bg", 4.5],
  ["fg-subtle", "surface", 3],
  ["on-primary", "primary", 4.5],
  ["on-gold", "gold", 4.5],
  ["gold-fg", "surface", 4.5],
  ["gold-fg", "gold-soft", 4.5],
  ["on-ink", "ink", 7],
  ["on-ink-muted", "ink", 4.5],
  ["sage-strong", "sage-soft", 4.5],
  ["coral-strong", "coral-soft", 4.5],
  ["chart-accent", "surface", 3],
];

describe.each(PALETTES)("paleta $name", (palette) => {
  it.each(["light", "dark"] as const)("tem contraste acessível no tema %s", (mode) => {
    const t = palette[mode];
    const failures = PAIRS.filter(([fg, bg, min]) => contrast(t[fg], t[bg]) < min).map(
      ([fg, bg, min]) => `${fg} sobre ${bg}: ${contrast(t[fg], t[bg]).toFixed(2)} < ${min}`,
    );
    expect(failures).toEqual([]);
  });
});

describe("CSS das paletas", () => {
  it("gera blocos claro e escuro para as 5 paletas alternativas", () => {
    const css = paletteCss();
    for (const p of PALETTES.filter((x) => x.id !== "gabaritei")) {
      expect(css).toContain(`html:not(.dark)[data-palette="${p.id}"]`);
      expect(css).toContain(`html.dark[data-palette="${p.id}"]`);
    }
    expect(css).not.toContain('data-palette="gabaritei"');
  });
});
