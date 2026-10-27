import { describe, expect, it } from "vitest";
import { normalizarPaleta, paletasDisponiveis } from "./paletas";

describe("paletas", () => {
  it("mantém apenas ids conhecidos e sempre oferece Floresta", () => {
    expect(paletasDisponiveis("sol,oceano,inexistente,sol")).toEqual(["floresta", "oceano", "sol"]);
  });

  it("cai em Floresta quando o valor salvo não está na lista", () => {
    expect(normalizarPaleta("brasa", ["floresta", "oceano"])).toBe("floresta");
    expect(normalizarPaleta("oceano", ["floresta", "oceano"])).toBe("oceano");
  });
});
