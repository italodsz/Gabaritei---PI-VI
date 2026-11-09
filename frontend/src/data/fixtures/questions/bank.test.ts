import { describe, expect, it } from "vitest";
import { QUESTION_BANK } from "./index";
import { TOPIC_BY_ID } from "../taxonomy";

describe("acervo demonstrativo", () => {
  it("tem identificadores únicos", () => {
    const ids = QUESTION_BANK.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("tem cinco alternativas distintas e gabarito válido", () => {
    for (const q of QUESTION_BANK) {
      expect(q.alternatives).toHaveLength(5);
      expect(new Set(q.alternatives.map((a) => a.text)).size).toBe(5);
      expect(q.alternatives.some((a) => a.letter === q.correct)).toBe(true);
      expect(TOPIC_BY_ID[q.topicId]).toBeDefined();
      expect(q.origin).toBe("demonstrativa");
    }
  });

  it("comporta simulados completos de 90 questões por dia", () => {
    const count = (fn: (q: (typeof QUESTION_BANK)[number]) => boolean) => QUESTION_BANK.filter(fn).length;
    expect(count((q) => q.areaId === "linguagens" && !q.foreignLanguage)).toBeGreaterThanOrEqual(40);
    expect(count((q) => q.foreignLanguage === "ingles")).toBeGreaterThanOrEqual(5);
    expect(count((q) => q.foreignLanguage === "espanhol")).toBeGreaterThanOrEqual(5);
    expect(count((q) => q.areaId === "humanas")).toBeGreaterThanOrEqual(45);
    expect(count((q) => q.areaId === "natureza")).toBeGreaterThanOrEqual(45);
    expect(count((q) => q.areaId === "matematica")).toBeGreaterThanOrEqual(45);
  });
});
