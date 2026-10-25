/**
 * Exporta capturas de tela de verdade (PNG) pra `e2e/capturas/etapa-v/` — linha de
 * base "antes" da paridade P1 (etapa de arrumação, item 2).
 *
 * Telas: Início (cenários novo e ativo), Treino, Questões, Simulados — cada uma nos
 * dois temas e nas duas larguras pedidas (1280 e 360px).
 *
 * Uso: npx tsx scripts/capturar-telas.ts
 * Pré-requisito: servidor de dev rodando em http://localhost:3000.
 */
import { chromium, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE_URL = process.env.AUDIT_BASE_URL ?? "http://localhost:3000";
const SAIDA = join(__dirname, "..", "e2e", "capturas", "etapa-v");
const LARGURAS = [1280, 360] as const;
const TEMAS = ["claro", "escuro"] as const;

mkdirSync(SAIDA, { recursive: true });

async function entrar(page: Page, tema: string, cenario?: string) {
  await page.addInitScript(
    ([t, c]) => {
      window.localStorage.setItem("gabaritei:tema", t);
      if (c) window.localStorage.setItem("gabaritei:mock:cenario", c);
    },
    [tema, cenario] as const,
  );
  await page.goto(`${BASE_URL}/entrar`);
  await page.fill("#email", "aluno@teste.com");
  await page.fill("#senha", "senha123");
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/inicio/);
}

async function capturar(page: Page, nome: string, largura: number) {
  await page.setViewportSize({ width: largura, height: largura <= 400 ? 1000 : 900 });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(600); // acabou de redimensionar: deixa o layout assentar
  const caminho = join(SAIDA, `${nome}-${largura}.png`);
  await page.screenshot({ path: caminho, fullPage: true });
  console.log(`  ${caminho}`);
}

async function capturarInicio(cenario: "novo" | "ativo") {
  for (const tema of TEMAS) {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await entrar(page, tema, cenario);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(600);
    for (const largura of LARGURAS) {
      await capturar(page, `inicio-${cenario}-${tema}`, largura);
    }
    await browser.close();
  }
}

async function capturarRota(rota: string, nome: string) {
  for (const tema of TEMAS) {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await entrar(page, tema, "ativo");
    await page.goto(`${BASE_URL}${rota}`);
    for (const largura of LARGURAS) {
      await capturar(page, `${nome}-${tema}`, largura);
    }
    await browser.close();
  }
}

async function main() {
  console.log("Início (novo):");
  await capturarInicio("novo");
  console.log("Início (ativo):");
  await capturarInicio("ativo");
  console.log("Treino:");
  await capturarRota("/treino", "treino");
  console.log("Questões:");
  await capturarRota("/questoes", "questoes");
  console.log("Simulados:");
  await capturarRota("/simulados", "simulados");
  console.log(`\n20 capturas salvas em ${SAIDA}`);
}

main().catch((erro) => {
  console.error(erro);
  process.exitCode = 1;
});
