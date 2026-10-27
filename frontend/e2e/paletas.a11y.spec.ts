import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import paletas from "../src/styles/paletas.json";

const NOMES = Object.keys(paletas) as Array<keyof typeof paletas>;

test.describe("@a11y matriz básica de paletas", () => {
  for (const paleta of NOMES) {
    for (const tema of ["claro", "escuro"] as const) {
      test(`${paleta} no tema ${tema}`, async ({ page }) => {
        await page.goto("/entrar");
        await page.waitForLoadState("networkidle");
        await page.waitForSelector("h1");
        await page.evaluate(
          ({ paletaInicial, temaInicial }) => {
            document.documentElement.dataset.palette = paletaInicial;
            document.documentElement.dataset.theme = temaInicial === "claro" ? "light" : "dark";
          },
          { paletaInicial: paleta, temaInicial: tema },
        );

        const esperado = paletas[paleta][tema === "claro" ? "light" : "dark"];
        const calculado = await page.evaluate(() => {
          const estilo = getComputedStyle(document.documentElement);
          return {
            paper: estilo.getPropertyValue("--paper").trim().toLowerCase(),
            brand: estilo.getPropertyValue("--brand").trim().toLowerCase(),
            accent: estilo.getPropertyValue("--accent").trim().toLowerCase(),
          };
        });
        expect(calculado).toEqual({
          paper: esperado.paper.toLowerCase(),
          brand: esperado.brand.toLowerCase(),
          accent: esperado.accent.toLowerCase(),
        });

        const resultados = await new AxeBuilder({ page }).analyze();
        expect(resultados.violations, JSON.stringify(resultados.violations, null, 2)).toEqual([]);
      });
    }
  }
});
