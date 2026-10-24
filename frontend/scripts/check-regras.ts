/**
 * Varredura automatizada das regras 4 a 9 (docs/FRONTEND_PROMPT.md, seção 2) em todo
 * `src/`. Versão programática da varredura manual feita na paridade (ver
 * docs/PENDENCIAS.md) — mesmas checagens, repetíveis a cada etapa.
 *
 * Uso: npx tsx scripts/check-regras.ts
 * Não depende do servidor de dev rodando (varredura estática de arquivos).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const RAIZ_SRC = join(__dirname, "..", "src");

interface Falha {
  arquivo: string;
  linha: number;
  trecho: string;
  regra: string;
}

function listarArquivos(dir: string, extensoes: string[]): string[] {
  const resultado: string[] = [];
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    const info = statSync(caminho);
    if (info.isDirectory()) {
      resultado.push(...listarArquivos(caminho, extensoes));
    } else if (extensoes.some((ext) => nome.endsWith(ext))) {
      resultado.push(caminho);
    }
  }
  return resultado;
}

/**
 * Marca cada linha como "dentro de comentário de bloco" (`/* ... *\/`, com ou sem o
 * `{` do JSX na frente) rastreando o estado entre linhas — um heurística de uma
 * linha só não pega uma linha de continuação de um comentário de várias linhas.
 */
function linhasDeComentario(linhas: string[]): boolean[] {
  const marcado: boolean[] = [];
  let dentro = false;
  for (const linha of linhas) {
    const comecouDentro = dentro;
    let resto = linha;
    let tocouComentario = comecouDentro;
    for (;;) {
      if (dentro) {
        const fim = resto.indexOf("*/");
        if (fim === -1) break;
        resto = resto.slice(fim + 2);
        dentro = false;
      } else {
        const inicio = resto.indexOf("/*");
        const linhaUnica = resto.trimStart().startsWith("//");
        if (linhaUnica) {
          tocouComentario = true;
          break;
        }
        if (inicio === -1) break;
        resto = resto.slice(inicio + 2);
        dentro = true;
        tocouComentario = true;
      }
    }
    marcado.push(tocouComentario || comecouDentro);
  }
  return marcado;
}

const ARQUIVOS_TODOS = listarArquivos(RAIZ_SRC, [".ts", ".tsx", ".css"]);
const ARQUIVOS_TSX = ARQUIVOS_TODOS.filter((a) => a.endsWith(".tsx"));

const falhas: Falha[] = [];

function varrer(arquivos: string[], padrao: RegExp, regra: string, pularComentarios = false) {
  for (const arquivo of arquivos) {
    const linhas = readFileSync(arquivo, "utf-8").split("\n");
    const comentario = pularComentarios ? linhasDeComentario(linhas) : null;
    linhas.forEach((linha, i) => {
      if (comentario?.[i]) return;
      // Marcador tipo eslint-disable-next-line: comentário na linha anterior ou na
      // própria linha, pra casos revisados e aceitos conscientemente (ver PENDENCIAS.md).
      if (linha.includes("check-regras: ignore")) return;
      if (i > 0 && linhas[i - 1].includes("check-regras: ignore")) return;
      if (padrao.test(linha)) {
        falhas.push({ arquivo: relative(RAIZ_SRC, arquivo), linha: i + 1, trecho: linha.trim().slice(0, 120), regra });
      }
      padrao.lastIndex = 0; // padrão tem /g em algum caso: zera entre linhas
    });
  }
}

// Regra 4/5: nada de gradiente, brilho/vidro, roxo/violeta.
varrer(ARQUIVOS_TODOS, /\bgradient\b/i, "sem gradiente (regra 4)");
varrer(ARQUIVOS_TODOS, /\bbackdrop(-|\s)?blur\b|(?<!motion-safe-)\bblur-/i, "sem vidro/desfoque (regra 4)");
varrer(ARQUIVOS_TODOS, /\bpurple\b|\bviolet\b|\broxo\b|\blilás\b|\blilas\b/i, "sem roxo/violeta (regra 4)");

// Regra: nada de caixa alta com tracking como estilo de rótulo.
varrer(ARQUIVOS_TODOS, /\buppercase\b/, "sem caixa alta com tracking (regra 6)");
varrer(ARQUIVOS_TODOS, /\btracking-(wide|wider|widest)\b/, "sem caixa alta com tracking (regra 6)");

// Regra 9: âmbar exclusivo de conteúdo de IA. Lista de arquivos autorizados a
// usar --amber/amber-*: os tokens em si, o CriterioRecomendacao (o selo de IA)
// e o comentário no FoguinhoBadge que documenta a proibição.
const ARQUIVOS_AMBER_PERMITIDOS = new Set([
  "styles/tokens.css",
  "styles/globals.css",
  "components/dominio/criterio-recomendacao.tsx",
  "components/dominio/foguinho-badge.tsx", // só no comentário "Nunca --amber"
]);
for (const arquivo of ARQUIVOS_TODOS) {
  const relativo = relative(RAIZ_SRC, arquivo).replace(/\\/g, "/");
  if (ARQUIVOS_AMBER_PERMITIDOS.has(relativo)) continue;
  const linhas = readFileSync(arquivo, "utf-8").split("\n");
  linhas.forEach((linha, i) => {
    if (/amber/i.test(linha)) {
      falhas.push({ arquivo: relativo, linha: i + 1, trecho: linha.trim().slice(0, 120), regra: "âmbar exclusivo de IA (regra 9)" });
    }
  });
}

// Gamificação fora de escopo: nota ENEM estimada, conquistas/medalhas/XP/nível de jogo.
varrer(ARQUIVOS_TODOS, /nota\s+enem|conquista|medalha|\bXP\b|\bachievement\b/i, "sem gamificação fora de escopo (seção 2)");

// Regra 6: nunca travessão nem meio-ponto como separador em texto visível.
// Heurística: só .tsx, pulando linhas de comentário (não é 100% preciso, mas
// cobre o grosso — revisão humana continua valendo pra casos de borda, como
// um travessão isolado usado de placeholder de valor vazio, não como separador).
varrer(ARQUIVOS_TSX, / · |—/, "sem travessão/meio-ponto como separador (regra 6)", true);

if (falhas.length === 0) {
  console.log("check:regras: zero falhas.");
} else {
  console.log(`check:regras: ${falhas.length} falha(s):\n`);
  for (const f of falhas) {
    console.log(`  [${f.regra}] src/${f.arquivo}:${f.linha}\n    ${f.trecho}`);
  }
  process.exitCode = 1;
}
