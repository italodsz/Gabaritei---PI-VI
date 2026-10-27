import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

type Tema = Record<string, string>;
type Paletas = Record<string, { light: Tema; dark: Tema }>;

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origem = path.join(raiz, "src", "styles", "paletas.json");
const destino = path.join(raiz, "src", "styles", "paletas.generated.css");

function declaracoes(tema: Tema, paleta: string, modo: "light" | "dark"): string {
  const rule = paleta === "floresta" ? (modo === "light" ? "#D9D5C8" : "#2C3530") : `color-mix(in srgb, var(--ink) ${modo === "light" ? 16 : 14}%, var(--paper))`;
  return [
    `  color-scheme: ${modo};`,
    ...Object.entries(tema).map(([nome, valor]) => `  --${nome}: ${valor.toLowerCase()};`),
    `  --rule: ${rule};`,
  ].join("\n");
}

function bloco(seletores: string[], corpo: string): string {
  return `${seletores.join(",\n")} {\n${corpo}\n}`;
}

async function main() {
  const paletas = JSON.parse(await readFile(origem, "utf8")) as Paletas;
  const nomes = Object.keys(paletas);
  if (nomes[0] !== "floresta") throw new Error("Floresta precisa ser a primeira paleta e o padrão.");

  const claro: string[] = [];
  const escuroExplicito: string[] = [];
  const escuroSistema: string[] = [];

  for (const [nome, temas] of Object.entries(paletas)) {
    const seletorClaro = nome === "floresta" ? [":root", 'html[data-palette="floresta"]'] : [`html[data-palette="${nome}"]`];
    claro.push(bloco(seletorClaro, declaracoes(temas.light, nome, "light")));
    const seletorEscuroExplicito = nome === "floresta"
      ? [':root[data-theme="dark"]', 'html[data-palette="floresta"][data-theme="dark"]']
      : [`html[data-palette="${nome}"][data-theme="dark"]`];
    escuroExplicito.push(bloco(seletorEscuroExplicito, declaracoes(temas.dark, nome, "dark")));
    const seletorSistema = nome === "floresta"
      ? [':root:not([data-theme="light"])', 'html[data-palette="floresta"]:not([data-theme="light"])']
      : [`html[data-palette="${nome}"]:not([data-theme="light"])`];
    escuroSistema.push(bloco(seletorSistema, declaracoes(temas.dark, nome, "dark")));
  }

  const css = `/* Arquivo gerado por scripts/gerar-paletas.ts. Não edite manualmente. */\n\n${claro.join("\n\n")}\n\n${escuroExplicito.join("\n\n")}\n\n@media (prefers-color-scheme: dark) {\n${escuroSistema.map((item) => item.split("\n").map((linha) => `  ${linha}`).join("\n")).join("\n\n")}\n}\n`;
  await writeFile(destino, css, "utf8");
  console.log(`gerar:paletas: ${nomes.length} paletas escritas em ${path.relative(raiz, destino)}.`);
}

main().catch((erro) => {
  console.error(erro);
  process.exitCode = 1;
});
