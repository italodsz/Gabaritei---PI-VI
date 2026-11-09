/**
 * Paletas de cores do Gabaritei.
 *
 * A paleta padrão ("gabaritei") vive em `globals.css`. As demais sobrescrevem
 * os mesmos tokens semânticos — o nome do token descreve o PAPEL da cor
 * (ex.: `gold` = cor de destaque/ação), não a cor em si. Assim nenhum
 * componente precisa saber qual paleta está ativa.
 *
 * As cores das áreas do ENEM e a paleta categórica dos gráficos NÃO mudam
 * entre paletas: elas identificam conteúdo e foram validadas para daltonismo.
 */

export type PaletteId = "gabaritei" | "oceano" | "ameixa" | "terracota" | "neon" | "editorial";

export const PALETTE_IDS: PaletteId[] = ["gabaritei", "oceano", "ameixa", "terracota", "neon", "editorial"];

/** Tokens sobrescritos por cada paleta (nomes sem o prefixo `--`). */
export interface PaletteTokens {
  bg: string;
  "bg-deep": string;
  surface: string;
  "surface-2": string;
  "surface-3": string;
  border: string;
  "border-strong": string;
  fg: string;
  "fg-muted": string;
  "fg-subtle": string;
  ink: string;
  "ink-2": string;
  "ink-3": string;
  "on-ink": string;
  "on-ink-muted": string;
  primary: string;
  "primary-hover": string;
  "on-primary": string;
  /** cor de destaque (ações, progresso, conquistas) */
  gold: string;
  "gold-strong": string;
  "gold-soft": string;
  "gold-fg": string;
  "on-gold": string;
  /** apoio 1 */
  sage: string;
  "sage-strong": string;
  "sage-soft": string;
  /** apoio 2 */
  coral: string;
  "coral-strong": string;
  "coral-soft": string;
  focus: string;
  "chart-accent": string;
  "chart-primary": string;
  "chart-grid": string;
  "chart-seq": string;
}

export interface PaletteDefinition {
  id: PaletteId;
  name: string;
  description: string;
  /** Tokens do tema claro e do escuro (a paleta padrão usa o globals.css). */
  light: PaletteTokens;
  dark: PaletteTokens;
}


/* ------------------------------------------------------------------ */
/* Padrão: Grafite & Dourado (valores espelham o globals.css)          */
/* ------------------------------------------------------------------ */

const GABARITEI: PaletteDefinition = {
  id: "gabaritei",
  name: "Grafite & Dourado",
  description: "A identidade original: grafite estrutural, dourado para conquistas, sálvia e coral de apoio.",
  light: {
    bg: "#f7f5ee", "bg-deep": "#efece2", surface: "#fffefb", "surface-2": "#f3f0e7", "surface-3": "#e9e5d8",
    border: "#e5e0d2", "border-strong": "#cdc6b3", fg: "#29332f", "fg-muted": "#57615b", "fg-subtle": "#7f877f",
    ink: "#29332f", "ink-2": "#34413b", "ink-3": "#43514a", "on-ink": "#f7f5ee", "on-ink-muted": "#b9c2bb",
    primary: "#29332f", "primary-hover": "#34413b", "on-primary": "#f7f5ee",
    gold: "#ddb54d", "gold-strong": "#b98f22", "gold-soft": "#f5e9c4", "gold-fg": "#7a5a10", "on-gold": "#29332f",
    sage: "#86a58c", "sage-strong": "#41684b", "sage-soft": "#e0eae0",
    coral: "#df967d", "coral-strong": "#9b4c33", "coral-soft": "#f8e1d7", focus: "#c99a2e",
    "chart-accent": "#a98220", "chart-primary": "#29332f", "chart-grid": "#e9e5d8", "chart-seq": "#36684a",
  },
  dark: {
    bg: "#141917", "bg-deep": "#101412", surface: "#1c2320", "surface-2": "#232b27", "surface-3": "#2c3631",
    border: "#2e3833", "border-strong": "#44514a", fg: "#eeebe2", "fg-muted": "#a9b1ab", "fg-subtle": "#7d8780",
    ink: "#26302c", "ink-2": "#2f3b35", "ink-3": "#3a4841", "on-ink": "#f7f5ee", "on-ink-muted": "#aab4ad",
    primary: "#efe9d8", "primary-hover": "#fffaf0", "on-primary": "#1c2320",
    gold: "#e0bb58", "gold-strong": "#ecca6e", "gold-soft": "#3a331d", "gold-fg": "#ecca6e", "on-gold": "#1c2320",
    sage: "#8fb095", "sage-strong": "#a7c8ad", "sage-soft": "#24342a",
    coral: "#e3a08a", "coral-strong": "#eeb29e", "coral-soft": "#3c2a24", focus: "#e0bb58",
    "chart-accent": "#e0bb58", "chart-primary": "#efe9d8", "chart-grid": "#2a332f", "chart-seq": "#8cc49c",
  },
};

/* ------------------------------------------------------------------ */
/* Oceano: azul-petróleo profundo com turquesa e areia                 */
/* ------------------------------------------------------------------ */

const OCEANO: PaletteDefinition = {
  id: "oceano",
  name: "Oceano",
  description: "Azul-petróleo profundo, destaque turquesa e toques de areia. Calmo e concentrado.",
  light: {
    bg: "#f2f6f8", "bg-deep": "#e6eef2", surface: "#ffffff", "surface-2": "#eaf1f4", "surface-3": "#dce7ec",
    border: "#d6e2e8", "border-strong": "#b4c7d1", fg: "#0f2a3a", "fg-muted": "#42606f", "fg-subtle": "#6a8592",
    ink: "#0f2a3a", "ink-2": "#173a4f", "ink-3": "#22506a", "on-ink": "#eaf6fa", "on-ink-muted": "#a3c3d1",
    primary: "#0f2a3a", "primary-hover": "#173a4f", "on-primary": "#eaf6fa",
    gold: "#2ec4c6", "gold-strong": "#138f91", "gold-soft": "#d3f3f3", "gold-fg": "#0b6b6d", "on-gold": "#05252a",
    sage: "#7fb6e0", "sage-strong": "#2b6a99", "sage-soft": "#ddebf7",
    coral: "#efb478", "coral-strong": "#9c5a17", "coral-soft": "#fbebd9", focus: "#138f91",
    "chart-accent": "#138f91", "chart-primary": "#0f2a3a", "chart-grid": "#dce7ec", "chart-seq": "#138f91",
  },
  dark: {
    bg: "#0a1820", "bg-deep": "#07121a", surface: "#102430", "surface-2": "#15303e", "surface-3": "#1c3b4b",
    border: "#1f4050", "border-strong": "#2e5567", fg: "#e6f2f6", "fg-muted": "#9db8c4", "fg-subtle": "#7593a0",
    ink: "#0f2c3a", "ink-2": "#153848", "ink-3": "#1e4859", "on-ink": "#eaf6fa", "on-ink-muted": "#a3c3d1",
    primary: "#ddf4f6", "primary-hover": "#ffffff", "on-primary": "#0a1820",
    gold: "#3fd3d4", "gold-strong": "#6be3e3", "gold-soft": "#0f3b40", "gold-fg": "#6be3e3", "on-gold": "#052226",
    sage: "#8fc2ea", "sage-strong": "#b4d8f3", "sage-soft": "#15324a",
    coral: "#f2b880", "coral-strong": "#f7cfa6", "coral-soft": "#3a2a18", focus: "#3fd3d4",
    "chart-accent": "#3fd3d4", "chart-primary": "#e6f2f6", "chart-grid": "#1c3b4b", "chart-seq": "#3fd3d4",
  },
};

/* ------------------------------------------------------------------ */
/* Ameixa: roxo-ameixa intenso com magenta e lavanda                   */
/* ------------------------------------------------------------------ */

const AMEIXA: PaletteDefinition = {
  id: "ameixa",
  name: "Ameixa",
  description: "Roxo-ameixa intenso com magenta vibrante, lavanda e pêssego. Criativo e ousado.",
  light: {
    bg: "#f7f3f8", "bg-deep": "#eee6f1", surface: "#fffdff", "surface-2": "#f1eaf4", "surface-3": "#e5daeb",
    border: "#e3d7e9", "border-strong": "#c7b3d1", fg: "#2d1838", "fg-muted": "#5c4768", "fg-subtle": "#857291",
    ink: "#2d1838", "ink-2": "#3c2249", "ink-3": "#4e2e5e", "on-ink": "#f8eefb", "on-ink-muted": "#cdb4d8",
    primary: "#2d1838", "primary-hover": "#3c2249", "on-primary": "#f8eefb",
    gold: "#e0559a", "gold-strong": "#b8327a", "gold-soft": "#fadceb", "gold-fg": "#972160", "on-gold": "#2a0a1c",
    sage: "#a78bd6", "sage-strong": "#6446a3", "sage-soft": "#ece4f8",
    coral: "#f4a27e", "coral-strong": "#9a4626", "coral-soft": "#fce4d9", focus: "#b8327a",
    "chart-accent": "#b8327a", "chart-primary": "#2d1838", "chart-grid": "#e5daeb", "chart-seq": "#b8327a",
  },
  dark: {
    bg: "#170d1c", "bg-deep": "#110915", surface: "#20132a", "surface-2": "#2a1936", "surface-3": "#352142",
    border: "#3a2447", "border-strong": "#553a68", fg: "#f3eaf6", "fg-muted": "#bba7c6", "fg-subtle": "#937f9f",
    ink: "#2a1735", "ink-2": "#351e43", "ink-3": "#432753", "on-ink": "#f8eefb", "on-ink-muted": "#c9b1d6",
    primary: "#f5e6f8", "primary-hover": "#ffffff", "on-primary": "#170d1c",
    gold: "#f06daa", "gold-strong": "#f59bc6", "gold-soft": "#4a1a33", "gold-fg": "#f59bc6", "on-gold": "#2a0a1c",
    sage: "#b9a0e3", "sage-strong": "#d2c2f0", "sage-soft": "#2e2147",
    coral: "#f6b096", "coral-strong": "#f9cbb8", "coral-soft": "#3e231a", focus: "#f06daa",
    "chart-accent": "#f06daa", "chart-primary": "#f3eaf6", "chart-grid": "#352142", "chart-seq": "#f06daa",
  },
};

/* ------------------------------------------------------------------ */
/* Terracota: café, laranja queimado e oliva                           */
/* ------------------------------------------------------------------ */

const TERRACOTA: PaletteDefinition = {
  id: "terracota",
  name: "Terracota",
  description: "Tons terrosos: café escuro, laranja queimado, oliva e rosa antigo. Quente e acolhedor.",
  light: {
    bg: "#faf4ee", "bg-deep": "#f1e6da", surface: "#fffcf8", "surface-2": "#f4eadf", "surface-3": "#eadbcb",
    border: "#e8d9c8", "border-strong": "#cfb9a1", fg: "#3b2418", "fg-muted": "#6b5141", "fg-subtle": "#917766",
    ink: "#3b2418", "ink-2": "#4c2f20", "ink-3": "#5e3b29", "on-ink": "#fbf1e8", "on-ink-muted": "#d8bfae",
    primary: "#3b2418", "primary-hover": "#4c2f20", "on-primary": "#fbf1e8",
    gold: "#e07a3f", "gold-strong": "#b85a22", "gold-soft": "#fbe3d2", "gold-fg": "#934413", "on-gold": "#2b1206",
    sage: "#a3a85c", "sage-strong": "#5c6220", "sage-soft": "#eef0da",
    coral: "#d58c8c", "coral-strong": "#9a4a49", "coral-soft": "#f7e1e0", focus: "#b85a22",
    "chart-accent": "#b85a22", "chart-primary": "#3b2418", "chart-grid": "#eadbcb", "chart-seq": "#b85a22",
  },
  dark: {
    bg: "#1a110c", "bg-deep": "#140d09", surface: "#241811", "surface-2": "#2e1f16", "surface-3": "#3a281d",
    border: "#3e2b20", "border-strong": "#594233", fg: "#f6ece4", "fg-muted": "#c4ae9f", "fg-subtle": "#9b8576",
    ink: "#2f1e15", "ink-2": "#3b261b", "ink-3": "#4a3022", "on-ink": "#fbf1e8", "on-ink-muted": "#d3bbaa",
    primary: "#f7e7da", "primary-hover": "#ffffff", "on-primary": "#1a110c",
    gold: "#f08c50", "gold-strong": "#f6ae80", "gold-soft": "#4a2614", "gold-fg": "#f6ae80", "on-gold": "#2b1206",
    sage: "#bcc174", "sage-strong": "#d3d79a", "sage-soft": "#2f311a",
    coral: "#e3a3a3", "coral-strong": "#eec2c2", "coral-soft": "#3d2222", focus: "#f08c50",
    "chart-accent": "#f08c50", "chart-primary": "#f6ece4", "chart-grid": "#3a281d", "chart-seq": "#f08c50",
  },
};

/* ------------------------------------------------------------------ */
/* Neon: preto absoluto com verde-limão elétrico e violeta             */
/* ------------------------------------------------------------------ */

const NEON: PaletteDefinition = {
  id: "neon",
  name: "Neon",
  description: "Preto profundo com verde-limão elétrico, violeta e laranja. Energia máxima.",
  light: {
    bg: "#f4f5f2", "bg-deep": "#e9ebe5", surface: "#ffffff", "surface-2": "#eef0ea", "surface-3": "#e1e4db",
    border: "#dde0d6", "border-strong": "#b9bfae", fg: "#121411", "fg-muted": "#4a5046", "fg-subtle": "#71776c",
    ink: "#121411", "ink-2": "#1c1f1a", "ink-3": "#2a2e27", "on-ink": "#f2ffe0", "on-ink-muted": "#a9b39f",
    primary: "#121411", "primary-hover": "#22261f", "on-primary": "#f2ffe0",
    gold: "#c6f432", "gold-strong": "#7da00c", "gold-soft": "#eefbc8", "gold-fg": "#4a6206", "on-gold": "#121411",
    sage: "#9b7bff", "sage-strong": "#5537cc", "sage-soft": "#ece6ff",
    coral: "#ff7a45", "coral-strong": "#b43f12", "coral-soft": "#ffe5da", focus: "#7da00c",
    "chart-accent": "#6c8a0a", "chart-primary": "#121411", "chart-grid": "#e1e4db", "chart-seq": "#6c8a0a",
  },
  dark: {
    bg: "#0b0c0a", "bg-deep": "#070806", surface: "#141613", "surface-2": "#1b1e19", "surface-3": "#242820",
    border: "#262a23", "border-strong": "#3c4237", fg: "#f1f5ec", "fg-muted": "#a8b0a0", "fg-subtle": "#80877a",
    ink: "#151813", "ink-2": "#1c2019", "ink-3": "#262b22", "on-ink": "#f2ffe0", "on-ink-muted": "#a9b39f",
    primary: "#f1f5ec", "primary-hover": "#ffffff", "on-primary": "#0b0c0a",
    gold: "#d4ff3f", "gold-strong": "#e3ff7a", "gold-soft": "#29340c", "gold-fg": "#d4ff3f", "on-gold": "#0b0c0a",
    sage: "#a98dff", "sage-strong": "#c6b5ff", "sage-soft": "#231c40",
    coral: "#ff8a57", "coral-strong": "#ffad8a", "coral-soft": "#3a1c10", focus: "#d4ff3f",
    "chart-accent": "#d4ff3f", "chart-primary": "#f1f5ec", "chart-grid": "#242820", "chart-seq": "#d4ff3f",
  },
};

/* ------------------------------------------------------------------ */
/* Editorial: preto e branco de jornal com vermelho e azul             */
/* ------------------------------------------------------------------ */

const EDITORIAL: PaletteDefinition = {
  id: "editorial",
  name: "Editorial",
  description: "Preto e branco de jornal, vermelho de destaque, azul e âmbar de apoio. Máximo contraste.",
  light: {
    bg: "#fafaf7", "bg-deep": "#efefea", surface: "#ffffff", "surface-2": "#f2f2ee", "surface-3": "#e4e4de",
    border: "#e0e0da", "border-strong": "#b9b9b1", fg: "#111111", "fg-muted": "#474743", "fg-subtle": "#6f6f69",
    ink: "#111111", "ink-2": "#1e1e1e", "ink-3": "#2e2e2e", "on-ink": "#fafaf7", "on-ink-muted": "#b5b5ae",
    primary: "#111111", "primary-hover": "#2a2a2a", "on-primary": "#ffffff",
    gold: "#d62839", "gold-strong": "#a81d2a", "gold-soft": "#fbe0e2", "gold-fg": "#a81d2a", "on-gold": "#ffffff",
    sage: "#3a6fd8", "sage-strong": "#1e4fb0", "sage-soft": "#e1eafb",
    coral: "#f2b134", "coral-strong": "#8a5d00", "coral-soft": "#fcefd1", focus: "#d62839",
    "chart-accent": "#d62839", "chart-primary": "#111111", "chart-grid": "#e4e4de", "chart-seq": "#d62839",
  },
  dark: {
    bg: "#0e0e0e", "bg-deep": "#080808", surface: "#171717", "surface-2": "#1f1f1f", "surface-3": "#2a2a2a",
    border: "#2c2c2c", "border-strong": "#474747", fg: "#f5f5f2", "fg-muted": "#b0b0aa", "fg-subtle": "#86867f",
    ink: "#1a1a1a", "ink-2": "#222222", "ink-3": "#2e2e2e", "on-ink": "#f5f5f2", "on-ink-muted": "#b0b0aa",
    primary: "#f5f5f2", "primary-hover": "#ffffff", "on-primary": "#0e0e0e",
    gold: "#ff4d5e", "gold-strong": "#ff8a95", "gold-soft": "#3d1418", "gold-fg": "#ff8a95", "on-gold": "#0e0e0e",
    sage: "#6e9bf0", "sage-strong": "#a3c0f6", "sage-soft": "#16243f",
    coral: "#f5c15a", "coral-strong": "#f8d58e", "coral-soft": "#3a2d10", focus: "#ff4d5e",
    "chart-accent": "#ff4d5e", "chart-primary": "#f5f5f2", "chart-grid": "#2a2a2a", "chart-seq": "#ff4d5e",
  },
};

export const PALETTES: PaletteDefinition[] = [GABARITEI, OCEANO, AMEIXA, TERRACOTA, NEON, EDITORIAL];

export const PALETTE_BY_ID: Record<PaletteId, PaletteDefinition> = Object.fromEntries(PALETTES.map((p) => [p.id, p])) as Record<
  PaletteId,
  PaletteDefinition
>;

export function isPaletteId(value: unknown): value is PaletteId {
  return typeof value === "string" && (PALETTE_IDS as string[]).includes(value);
}

function block(selector: string, tokens: PaletteTokens): string {
  const body = Object.entries(tokens)
    .map(([k, v]) => `  --${k}: ${v};`)
    .join("\n");
  return `${selector} {\n${body}\n}`;
}

/**
 * CSS das paletas alternativas. A paleta padrão já está no globals.css.
 * `:not(.dark)` evita que os tokens claros vazem para o tema escuro.
 */
export function paletteCss(): string {
  return PALETTES.filter((p) => p.id !== "gabaritei")
    .flatMap((p) => [block(`html:not(.dark)[data-palette="${p.id}"]`, p.light), block(`html.dark[data-palette="${p.id}"]`, p.dark)])
    .join("\n");
}
