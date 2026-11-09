import type {
  AreaId,
  Difficulty,
  Question,
  QuestionImage,
  SubjectId,
  SupportText,
} from "@/types";
import { LETTERS } from "@/types";
import { REFERENCE_YEARS, TOPIC_BY_ID } from "../taxonomy";
import { createRng, shuffle, type Rng } from "@/lib/random";

export interface QuestionDraft {
  id: string;
  topicId: string;
  /** sufixo do subtópico (ex.: "juros") — completado com o id do assunto */
  subtopic?: string;
  difficulty: Difficulty;
  skill: string;
  support?: SupportText;
  image?: QuestionImage;
  prompt: string;
  correct: string;
  distractors: string[];
  explanation: string;
  year?: number;
  /** Mantém a ordem numérica crescente das alternativas (comum em questões de cálculo). */
  numeric?: boolean;
  foreignLanguage?: "ingles" | "espanhol";
}

const AREA_OF_SUBJECT: Record<SubjectId, AreaId> = {
  portugues: "linguagens",
  literatura: "linguagens",
  ingles: "linguagens",
  espanhol: "linguagens",
  artes: "linguagens",
  historia: "humanas",
  geografia: "humanas",
  filosofia: "humanas",
  sociologia: "humanas",
  fisica: "natureza",
  quimica: "natureza",
  biologia: "natureza",
  matematica: "matematica",
};

function parseLeadingNumber(text: string): number {
  const match = text.replace(/\./g, "").replace(",", ".").match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : Number.NaN;
}

/**
 * Monta uma questão a partir de um rascunho: garante cinco alternativas
 * distintas, embaralha com seed estável e calcula a letra correta.
 */
export function buildQuestion(draft: QuestionDraft): Question {
  const topic = TOPIC_BY_ID[draft.topicId];
  if (!topic) throw new Error(`Assunto inexistente: ${draft.topicId}`);
  const rng = createRng(draft.id);

  const options: string[] = [draft.correct];
  for (const d of draft.distractors) {
    if (options.length === 5) break;
    if (!options.includes(d)) options.push(d);
  }
  if (options.length < 5) {
    throw new Error(`Questão ${draft.id} precisa de 5 alternativas distintas (tem ${options.length}).`);
  }

  let ordered = shuffle(options, rng);
  if (draft.numeric) {
    const nums = options.map(parseLeadingNumber);
    if (nums.every((n) => !Number.isNaN(n))) {
      ordered = options.slice().sort((a, b) => parseLeadingNumber(a) - parseLeadingNumber(b));
    }
  }

  const alternatives = ordered.map((text, i) => ({ letter: LETTERS[i], text }));
  const correct = alternatives.find((a) => a.text === draft.correct)!.letter;
  const subtopicId = draft.subtopic ? `${draft.topicId}.${draft.subtopic}` : topic.subtopics[0]?.id;

  return {
    id: draft.id,
    areaId: AREA_OF_SUBJECT[topic.subjectId],
    subjectId: topic.subjectId,
    topicId: draft.topicId,
    subtopicId,
    year: draft.year ?? REFERENCE_YEARS[Math.floor(rng() * REFERENCE_YEARS.length)],
    origin: "demonstrativa",
    difficulty: draft.difficulty,
    skill: draft.skill,
    support: draft.support,
    image: draft.image,
    prompt: draft.prompt,
    alternatives,
    correct,
    explanation: draft.explanation,
    foreignLanguage: draft.foreignLanguage,
  };
}

/* ------------------------------------------------------------------ */
/* Banco de conceitos: gera questões de associação com distratores      */
/* retirados do próprio banco.                                         */
/* ------------------------------------------------------------------ */

export interface ConceptItem {
  key: string;
  answer: string;
  clue: string;
  why: string;
  difficulty?: Difficulty;
  subtopic?: string;
  /** Distratores específicos (usados antes dos sorteados no banco). */
  near?: string[];
}

export interface ConceptBankOptions {
  prefix: string;
  topicId: string;
  skill: string;
  prompt: string;
  /** Monta o texto de apoio a partir da pista. */
  support?: (clue: string) => SupportText;
  /** Alternativa extra plausível para completar o banco quando necessário. */
  extraDistractors?: string[];
  items: ConceptItem[];
}

export function conceptQuestions(opts: ConceptBankOptions): Question[] {
  const pool = Array.from(new Set([...opts.items.map((i) => i.answer), ...(opts.extraDistractors ?? [])]));
  return opts.items.map((item) => {
    const rng: Rng = createRng(`${opts.prefix}-${item.key}-distractors`);
    const others = shuffle(
      pool.filter((p) => p !== item.answer && !(item.near ?? []).includes(p)),
      rng,
    );
    return buildQuestion({
      id: `${opts.prefix}-${item.key}`,
      topicId: opts.topicId,
      subtopic: item.subtopic,
      difficulty: item.difficulty ?? "media",
      skill: opts.skill,
      support: opts.support ? opts.support(item.clue) : { paragraphs: [item.clue] },
      prompt: opts.prompt,
      correct: item.answer,
      distractors: [...(item.near ?? []), ...others],
      explanation: item.why,
    });
  });
}

/* ------------------------------------------------------------------ */
/* Utilidades numéricas para geradores                                  */
/* ------------------------------------------------------------------ */

/** Gera distratores numéricos distintos, completando com variações do valor correto. */
export function numericOptions(
  correct: number,
  candidates: number[],
  format: (n: number) => string,
): { correct: string; distractors: string[] } {
  const c = format(correct);
  const seen = new Set([c]);
  const out: string[] = [];
  const push = (n: number) => {
    if (!Number.isFinite(n) || n < 0) return;
    const f = format(n);
    if (!seen.has(f)) {
      seen.add(f);
      out.push(f);
    }
  };
  candidates.forEach(push);
  const factors = [1.25, 0.8, 1.5, 0.5, 2, 1.1, 0.9, 3];
  for (const k of factors) {
    if (out.length >= 4) break;
    push(correct * k);
  }
  return { correct: c, distractors: out };
}
