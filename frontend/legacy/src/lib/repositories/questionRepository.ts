import type { AreaId, Question, SubjectId } from "@/types";
import { QUESTION_BANK, QUESTION_BY_ID } from "@/data/fixtures/questions";
import { SUBJECT_BY_ID, TOPIC_BY_ID } from "@/data/fixtures/taxonomy";
import { normalizeText } from "@/lib/format";

export interface QuestionQuery {
  areaIds?: AreaId[];
  subjectId?: SubjectId | null;
  topicIds?: string[];
  subtopicIds?: string[];
  years?: number[];
  /** exclui questões de língua estrangeira de um idioma específico */
  foreignLanguage?: "ingles" | "espanhol" | "none";
}

/**
 * Contrato de acesso ao acervo. A implementação local lê os fixtures;
 * uma futura implementação (ex.: Supabase/FastAPI) pode expor o mesmo
 * contrato sem alterar as telas, que acessam o acervo apenas por aqui.
 */
export interface QuestionRepository {
  all(): Question[];
  getById(id: string): Question | undefined;
  getMany(ids: string[]): Question[];
  query(query: QuestionQuery): Question[];
  search(text: string, limit?: number): Question[];
}

function matches(q: Question, query: QuestionQuery): boolean {
  if (query.areaIds?.length && !query.areaIds.includes(q.areaId)) return false;
  if (query.subjectId && q.subjectId !== query.subjectId) return false;
  if (query.subtopicIds?.length) {
    // subtópicos refinam os assuntos: um assunto selecionado sem subtópicos marcados entra inteiro
    const selectedTopicsWithSub = new Set(query.subtopicIds.map((s) => s.split(".")[0]));
    if (query.topicIds?.length && !query.topicIds.includes(q.topicId)) return false;
    if (selectedTopicsWithSub.has(q.topicId) && !query.subtopicIds.includes(q.subtopicId ?? "")) return false;
  } else if (query.topicIds?.length && !query.topicIds.includes(q.topicId)) return false;
  if (query.years?.length && !query.years.includes(q.year)) return false;
  if (query.foreignLanguage === "none" && q.foreignLanguage) return false;
  if ((query.foreignLanguage === "ingles" || query.foreignLanguage === "espanhol") && q.foreignLanguage && q.foreignLanguage !== query.foreignLanguage)
    return false;
  return true;
}

export const localQuestionRepository: QuestionRepository = {
  all: () => QUESTION_BANK,
  getById: (id) => QUESTION_BY_ID[id],
  getMany: (ids) => ids.map((id) => QUESTION_BY_ID[id]).filter((q): q is Question => !!q),
  query: (query) => QUESTION_BANK.filter((q) => matches(q, query)),
  search: (text, limit = 8) => {
    const needle = normalizeText(text.trim());
    if (needle.length < 2) return [];
    const out: Question[] = [];
    for (const q of QUESTION_BANK) {
      const hay = normalizeText(
        [q.prompt, ...(q.support?.paragraphs ?? []), q.skill, TOPIC_BY_ID[q.topicId]?.name, SUBJECT_BY_ID[q.subjectId].name].join(" "),
      );
      if (hay.includes(needle)) out.push(q);
      if (out.length >= limit) break;
    }
    return out;
  },
};

/** Repositório ativo — ponto único de troca para uma integração real. */
export const questionRepository: QuestionRepository = localQuestionRepository;
