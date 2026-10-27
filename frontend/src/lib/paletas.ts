import paletas from "@/styles/paletas.json";

export const IDS_PALETAS = ["floresta", "oceano", "terracota", "brasa", "sol"] as const;
export type Paleta = (typeof IDS_PALETAS)[number];

export const NOMES_PALETAS: Record<Paleta, string> = {
  floresta: "Floresta",
  oceano: "Oceano",
  terracota: "Terracota",
  brasa: "Brasa",
  sol: "Sol",
};

export function ehPaleta(valor: unknown): valor is Paleta {
  return typeof valor === "string" && IDS_PALETAS.includes(valor as Paleta);
}

export function paletasDisponiveis(configuracao = process.env.NEXT_PUBLIC_PALETAS): Paleta[] {
  if (!configuracao?.trim()) return [...IDS_PALETAS];
  const habilitadas = configuracao.split(",").map((item) => item.trim().toLowerCase()).filter(ehPaleta);
  const unicas = IDS_PALETAS.filter((paleta) => habilitadas.includes(paleta));
  return unicas.includes("floresta") ? unicas : ["floresta", ...unicas];
}

export function normalizarPaleta(valor: unknown, disponiveis = paletasDisponiveis()): Paleta {
  return ehPaleta(valor) && disponiveis.includes(valor) ? valor : "floresta";
}

export function atualizarThemeColor(): void {
  if (typeof document === "undefined") return;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) return;
  const paper = getComputedStyle(document.documentElement).getPropertyValue("--paper").trim();
  if (paper) meta.content = paper;
}

export function aplicarPaleta(valor: unknown): Paleta {
  const paleta = normalizarPaleta(valor);
  if (typeof document !== "undefined") {
    document.documentElement.dataset.palette = paleta;
    requestAnimationFrame(atualizarThemeColor);
  }
  return paleta;
}

export const AMOSTRAS_PALETAS = paletas;
