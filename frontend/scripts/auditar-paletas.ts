import paletas from "../src/styles/paletas.json";

type Cor = [number, number, number];
type Tema = (typeof paletas)[keyof typeof paletas]["light"];

const fixas = {
  light: { err: "#A8321F", amberInk: "#6B4A10", amberSoft: "#F3E7CC" },
  dark: { err: "#EE8F7F", amberInk: "#E5B85A", amberSoft: "#323324" },
} as const;

function rgb(hex: string): Cor {
  const valor = hex.slice(1);
  return [0, 2, 4].map((inicio) => Number.parseInt(valor.slice(inicio, inicio + 2), 16)) as Cor;
}

function luminancia(hex: string): number {
  const canais = rgb(hex).map((valor) => {
    const canal = valor / 255;
    return canal <= 0.03928 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * canais[0] + 0.7152 * canais[1] + 0.0722 * canais[2];
}

function contraste(a: string, b: string): number {
  const [maior, menor] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (maior + 0.05) / (menor + 0.05);
}

function pares(tema: Tema, modo: "light" | "dark") {
  const superficies = ["paper", "paper-2", "card"] as const;
  const lista: Array<[string, string, string, number]> = [];
  for (const tinta of ["ink", "ink-2"] as const) for (const fundo of superficies) lista.push([tinta, fundo, tema[tinta], 4.5]);
  for (const fundo of ["paper", "card", "brand-soft"] as const) lista.push(["brand-ink", fundo, tema["brand-ink"], 4.5]);
  for (const fundo of ["brand", "brand-hover"] as const) lista.push(["on-brand", fundo, tema["on-brand"], 4.5]);
  for (const fundo of ["paper", "card"] as const) {
    lista.push(["rule-strong", fundo, tema["rule-strong"], 3]);
    lista.push(["brand", fundo, tema.brand, 3]);
    lista.push(["accent", fundo, tema.accent, 3]);
    lista.push(["err", fundo, fixas[modo].err, 4.5]);
  }
  lista.push(["accent-ink", "accent-soft", tema["accent-ink"], 4.5]);
  lista.push(["accent-ink", "paper", tema["accent-ink"], 4.5]);
  lista.push(["amber-ink", "amber-soft", fixas[modo].amberInk, 4.5]);
  if (modo === "light") {
    lista.push(["faixa:on-brand", "brand-hover", tema["on-brand"], 4.5]);
    lista.push(["faixa:ink", "paper", tema.ink, 4.5]);
    lista.push(["faixa:paper", "brand-hover", tema.paper, 3]);
  } else {
    lista.push(["faixa:ink", "brand-soft", tema.ink, 4.5]);
    lista.push(["faixa:ink-2", "brand-soft", tema["ink-2"], 4.5]);
    lista.push(["faixa:on-brand", "brand", tema["on-brand"], 4.5]);
    lista.push(["faixa:brand", "brand-soft", tema.brand, 3]);
    lista.push(["faixa:accent-ink", "brand-soft", tema["accent-ink"], 4.5]);
  }
  return lista.map(([nome, fundo, frente, minimo]) => ({ nome, fundo, frente, minimo }));
}

let falhas = 0;
for (const [nome, modos] of Object.entries(paletas)) {
  for (const modo of ["light", "dark"] as const) {
    const tema = modos[modo];
    for (const par of pares(tema, modo)) {
      const fundo = par.fundo === "amber-soft" ? fixas[modo].amberSoft : tema[par.fundo as keyof Tema];
      const razao = contraste(par.frente, fundo);
      if (razao + 0.005 < par.minimo) {
        falhas += 1;
        console.error(`${nome}/${modo}: ${par.nome} sobre ${par.fundo} = ${razao.toFixed(2)}:1 (mínimo ${par.minimo}:1)`);
      }
    }
  }
}

if (falhas > 0) {
  console.error(`audit:paletas: ${falhas} falha(s).`);
  process.exitCode = 1;
} else {
  console.log("audit:paletas: zero falhas em 5 paletas × 2 temas.");
}
