/**
 * Seletor de cenário do mock (seção 7.3). Troca por `?cenario=` na URL ou
 * pelo `ScenarioSwitcher` (só em desenvolvimento). Cada cenário ajusta os
 * dados semeados e o comportamento de latência/erro das chamadas.
 */
import { ApiError, type Letra, type Tentativa } from "../types";
import { BANCO_DEMO, MOCK_MIN_RESPOSTAS } from "./dados";
import { atualizarEstado, lerEstado } from "./estado";

export type CenarioId = "novo" | "ativo" | "parcial" | "esgotado" | "lento" | "erro" | "sem-permissao";

export const CENARIOS: { id: CenarioId; rotulo: string; descricao: string }[] = [
  { id: "novo", rotulo: "Novo", descricao: "Conta sem histórico nenhum." },
  { id: "ativo", rotulo: "Ativo", descricao: "Histórico e proficiência ok em todas as áreas." },
  { id: "parcial", rotulo: "Parcial", descricao: "Algumas áreas com dados insuficientes." },
  { id: "esgotado", rotulo: "Esgotado", descricao: "Poucas questões elegíveis sobrando." },
  { id: "lento", rotulo: "Lento", descricao: "Respostas da API em ~4 s." },
  { id: "erro", rotulo: "Erro", descricao: "30 % das chamadas falham." },
  { id: "sem-permissao", rotulo: "Sem permissão", descricao: "Toda chamada volta 401/403." },
];

const CHAVE_CENARIO = "gabaritei:mock:cenario";
const PADRAO: CenarioId = "ativo";

export function lerCenarioDaUrl(): CenarioId | null {
  if (typeof window === "undefined") return null;
  const valor = new URLSearchParams(window.location.search).get("cenario");
  return CENARIOS.some((c) => c.id === valor) ? (valor as CenarioId) : null;
}

function lerCenarioSalvo(): CenarioId | null {
  if (typeof window === "undefined") return null;
  try {
    const valor = window.localStorage.getItem(CHAVE_CENARIO);
    return CENARIOS.some((c) => c.id === valor) ? (valor as CenarioId) : null;
  } catch {
    return null;
  }
}

export function cenarioAtual(): CenarioId {
  return lerCenarioDaUrl() ?? lerCenarioSalvo() ?? PADRAO;
}

function gerarTentativasSinteticas(
  taxaAcertoAlvo: number,
  quantidadePorArea: number,
  diasAtras: number,
): Tentativa[] {
  const tentativas: Tentativa[] = [];
  const areas = ["LC", "CH", "CN", "MT"] as const;
  for (const area of areas) {
    const daArea = BANCO_DEMO.filter((q) => q.questao.area === area);
    for (let i = 0; i < Math.min(quantidadePorArea, daArea.length); i += 1) {
      const q = daArea[i];
      const correta = Math.random() < taxaAcertoAlvo;
      const letras: Letra[] = ["A", "B", "C", "D", "E"];
      const resposta = correta ? q.gabarito : letras.filter((l) => l !== q.gabarito)[0];
      const diasAtrasAleatorio = Math.floor(Math.random() * diasAtras);
      const data = new Date();
      data.setDate(data.getDate() - diasAtrasAleatorio);
      tentativas.push({
        id: `seed-${area}-${i}`,
        questaoId: q.questao.id,
        resposta,
        correcao: {
          tentativaId: `seed-${area}-${i}`,
          correta,
          gabarito: q.gabarito,
          resolucao: q.resolucao,
          respondidaEm: data.toISOString(),
        },
        modo: "tema",
        versaoModelo: "0.0.0",
        sessaoId: null,
      });
    }
  }
  return tentativas;
}

function diasConsecutivos(quantidade: number): string[] {
  const dias: string[] = [];
  const base = new Date();
  for (let i = 0; i < quantidade; i += 1) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    dias.push(d.toISOString().slice(0, 10));
  }
  return dias;
}

/** Semeia o estado local com dados coerentes para o cenário escolhido. */
export function semearCenario(cenario: CenarioId): void {
  atualizarEstado((estado) => {
    if (cenario === "novo" || cenario === "lento" || cenario === "erro" || cenario === "sem-permissao") {
      estado.tentativas = [];
      estado.diasComAtividade = [];
      estado.melhorFoguinho = 0;
      return;
    }
    if (cenario === "ativo") {
      estado.tentativas = gerarTentativasSinteticas(0.68, MOCK_MIN_RESPOSTAS + 8, 45);
      estado.diasComAtividade = diasConsecutivos(5);
      estado.melhorFoguinho = 9;
      return;
    }
    if (cenario === "parcial") {
      const completas = gerarTentativasSinteticas(0.62, MOCK_MIN_RESPOSTAS + 5, 45).filter(
        (t) => BANCO_DEMO.find((q) => q.questao.id === t.questaoId)?.questao.area === "MT",
      );
      const parciais = gerarTentativasSinteticas(0.5, 6, 20).filter(
        (t) => BANCO_DEMO.find((q) => q.questao.id === t.questaoId)?.questao.area === "LC",
      );
      estado.tentativas = [...completas, ...parciais];
      estado.diasComAtividade = diasConsecutivos(2);
      estado.melhorFoguinho = 4;
      return;
    }
    if (cenario === "esgotado") {
      // Marca quase todo o banco de uma área como respondido, para a elegibilidade esgotar rápido.
      const todasMT = BANCO_DEMO.filter((q) => q.questao.area === "MT");
      estado.tentativas = todasMT.slice(0, Math.max(0, todasMT.length - 2)).map((q, i) => ({
        id: `seed-esgotado-${i}`,
        questaoId: q.questao.id,
        resposta: q.gabarito,
        correcao: {
          tentativaId: `seed-esgotado-${i}`,
          correta: true,
          gabarito: q.gabarito,
          resolucao: q.resolucao,
          respondidaEm: new Date().toISOString(),
        },
        modo: "nivel",
        versaoModelo: "0.0.0",
        sessaoId: null,
      }));
      estado.diasComAtividade = diasConsecutivos(3);
      estado.melhorFoguinho = 3;
      return;
    }
  });
}

export function definirCenario(cenario: CenarioId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAVE_CENARIO, cenario);
  } catch {
    // ignora
  }
  semearCenario(cenario);
}

/** Garante que o cenário atual já foi semeado (chamado uma vez por sessão do navegador). */
let semeadoNestaSessao = false;
export function garantirCenarioSemeado(): void {
  if (semeadoNestaSessao) return;
  const estado = lerEstado();
  const cenario = cenarioAtual();
  if (estado.tentativas.length === 0 && (cenario === "ativo" || cenario === "parcial" || cenario === "esgotado")) {
    semearCenario(cenario);
  }
  semeadoNestaSessao = true;
}

/* ------------------------------- latência/erro ------------------------------ */

function atraso(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Envolve toda chamada do mock: latência simulada e, conforme o cenário, erro ou negação de acesso. */
export async function comLatenciaECenario<T>(executar: () => T | Promise<T>): Promise<T> {
  const cenario = cenarioAtual();

  if (cenario === "sem-permissao") {
    await atraso(300);
    throw new ApiError("nao_autenticado", "Entre para continuar.");
  }

  const ms = cenario === "lento" ? 4000 : 300 + Math.random() * 600;
  await atraso(ms);

  if (cenario === "erro" && Math.random() < 0.3) {
    throw new ApiError("indisponivel", "Não conseguimos completar a ação agora. Tente de novo.");
  }

  return executar();
}

export const DEMO_AVISO_FIXO = "Dados de demonstração";
