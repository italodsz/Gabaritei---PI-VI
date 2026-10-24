import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * @a11y — axe em toda rota pública, nos dois temas (seção 11). Cresce a cada
 * etapa que adiciona telas novas; rotas que exigem sessão entram quando a
 * tela correspondente existir (ex.: /perfil na Etapa 5).
 */
const ROTAS = ["/entrar", "/cadastrar", "/termos", "/privacidade", "/dev/componentes"];

async function checarRota(page: import("@playwright/test").Page, rota: string) {
  await page.goto(rota);
  await page.waitForLoadState("networkidle");
  // Deixa a entrada escalonada das bolhas do cartão-resposta terminar
  // (até ~900ms, seção 6) antes de medir contraste — senão o axe pode
  // flagar um quadro intermediário da transição de opacidade.
  await page.waitForTimeout(1100);

  const resultados = await new AxeBuilder({ page }).analyze();
  expect(resultados.violations, JSON.stringify(resultados.violations, null, 2)).toEqual([]);
}

test.describe("@a11y rotas públicas", () => {
  for (const rota of ROTAS) {
    for (const tema of ["claro", "escuro"] as const) {
      test(`${rota} sem violações no tema ${tema}`, async ({ page }) => {
        await page.addInitScript((valor) => {
          window.localStorage.setItem("gabaritei:tema", valor);
        }, tema);
        await checarRota(page, rota);
      });
    }
  }
});

const ROTAS_AUTENTICADAS = ["/inicio", "/questoes", "/questoes/demo-003", "/treino", "/simulados", "/perfil"];

test.describe("@a11y rotas autenticadas", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    const tema = testInfo.title.includes("escuro") ? "escuro" : "claro";
    await page.addInitScript((valor) => {
      window.localStorage.setItem("gabaritei:tema", valor);
    }, tema);

    await page.goto("/entrar");
    await page.getByLabel("E-mail").fill("aluno@teste.com");
    await page.getByLabel("Senha", { exact: true }).fill("senha123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL("**/inicio");
  });

  for (const rota of ROTAS_AUTENTICADAS) {
    for (const tema of ["claro", "escuro"] as const) {
      test(`${rota} sem violações no tema ${tema}`, async ({ page }) => {
        await checarRota(page, rota);
      });
    }
  }
});

test.describe("@a11y sessão de treino (rotas dinâmicas)", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    const tema = testInfo.title.includes("escuro") ? "escuro" : "claro";
    await page.addInitScript((valor) => {
      window.localStorage.setItem("gabaritei:tema", valor);
    }, tema);

    await page.goto("/entrar");
    await page.getByLabel("E-mail").fill("aluno@teste.com");
    await page.getByLabel("Senha", { exact: true }).fill("senha123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL("**/inicio");

    await page.goto("/treino");
    await page.getByRole("radio", { name: "5", exact: true }).click();
    await page.getByRole("button", { name: "Começar treino" }).click();
    await page.waitForURL(/\/treino\/[^/]+$/);
  });

  for (const tema of ["claro", "escuro"] as const) {
    test(`/treino/[sessaoId] sem violações no tema ${tema}`, async ({ page }) => {
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(300);
      const resultados = await new AxeBuilder({ page }).analyze();
      expect(resultados.violations, JSON.stringify(resultados.violations, null, 2)).toEqual([]);
    });

    test(`/treino/[sessaoId]/resumo sem violações no tema ${tema}`, async ({ page }) => {
      for (let i = 0; i < 5; i++) {
        await page.locator('[role="radio"]').first().click();
        await page.getByRole("button", { name: "Enviar resposta" }).click();
        await expect(page.getByText(/Você (acertou|errou)/).first()).toBeVisible();
        const resumo = page.getByRole("button", { name: "Ver resumo" });
        if (await resumo.isVisible().catch(() => false)) {
          await resumo.click();
        } else {
          await page.getByRole("button", { name: "Próxima questão" }).click();
        }
      }
      await page.waitForURL(/\/resumo$/);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(300);

      const resultados = await new AxeBuilder({ page }).analyze();
      expect(resultados.violations, JSON.stringify(resultados.violations, null, 2)).toEqual([]);
    });
  }
});

test.describe("@a11y simulado (rotas dinâmicas)", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    const tema = testInfo.title.includes("escuro") ? "escuro" : "claro";
    await page.addInitScript((valor) => {
      window.localStorage.setItem("gabaritei:tema", valor);
    }, tema);

    await page.goto("/entrar");
    await page.getByLabel("E-mail").fill("aluno@teste.com");
    await page.getByLabel("Senha", { exact: true }).fill("senha123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL("**/inicio");

    await page.goto("/simulados");
    await page.getByRole("button", { name: "Iniciar simulado" }).click();
    await page.waitForURL(/\/simulados\/[^/]+$/);
  });

  for (const tema of ["claro", "escuro"] as const) {
    test(`/simulados/[id] sem violações no tema ${tema}`, async ({ page }) => {
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(300);
      const resultados = await new AxeBuilder({ page }).analyze();
      expect(resultados.violations, JSON.stringify(resultados.violations, null, 2)).toEqual([]);
    });

    test(`/simulados/[id]/resultado sem violações no tema ${tema}`, async ({ page }) => {
      await page.getByRole("radio", { name: "Alternativa A" }).click();
      await expect(page.getByText("Salvo")).toBeVisible();
      await page.getByRole("button", { name: "Finalizar" }).click();
      await page.getByRole("button", { name: "Finalizar e ver resultado" }).click();
      await page.waitForURL(/\/resultado$/);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1100);

      const resultados = await new AxeBuilder({ page }).analyze();
      expect(resultados.violations, JSON.stringify(resultados.violations, null, 2)).toEqual([]);
    });

    test(`/simulados/[id]/questao/[n] sem violações no tema ${tema}`, async ({ page }) => {
      await page.getByRole("radio", { name: "Alternativa A" }).click();
      await expect(page.getByText("Salvo")).toBeVisible();
      await page.getByRole("button", { name: "Finalizar" }).click();
      await page.getByRole("button", { name: "Finalizar e ver resultado" }).click();
      await page.waitForURL(/\/resultado$/);

      await page.locator('a[href*="/questao/1"]').first().click();
      await page.waitForURL(/\/questao\/1$/);
      // 3 consultas encadeadas (resultado → questão → tentativa), cada uma com
      // até ~900ms de latência simulada (seção 7.3): esperar texto de verdade
      // em vez de um tempo fixo, senão o axe pode pegar o estado de Skeleton
      // (sem h1) sob carga.
      await expect(page.getByText(/Gabarito oficial:/)).toBeVisible({ timeout: 10000 });
      await page.waitForLoadState("networkidle");

      const resultados = await new AxeBuilder({ page }).analyze();
      expect(resultados.violations, JSON.stringify(resultados.violations, null, 2)).toEqual([]);
    });
  }
});
