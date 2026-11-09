import type { Question } from "@/types";
import { MATEMATICA_QUESTIONS } from "./matematica";
import { NATUREZA_QUESTIONS } from "./natureza";
import { HUMANAS_QUESTIONS } from "./humanas";
import { LINGUAGENS_QUESTIONS } from "./linguagens";

/**
 * Acervo demonstrativo. Todas as questões são autorais, no formato do ENEM,
 * e NÃO são provas oficiais do INEP.
 */
export const QUESTION_BANK: Question[] = [
  ...LINGUAGENS_QUESTIONS,
  ...HUMANAS_QUESTIONS,
  ...NATUREZA_QUESTIONS,
  ...MATEMATICA_QUESTIONS,
];

export const QUESTION_BY_ID: Record<string, Question> = Object.fromEntries(QUESTION_BANK.map((q) => [q.id, q]));
