/**
 * Tipos do acervo de conteúdo (áreas, matérias, assuntos e questões).
 * Estruturados para que um acervo real (ex.: microdados do INEP via API)
 * possa substituir o acervo demonstrativo sem mudanças nas telas.
 */

export type AreaId = "linguagens" | "humanas" | "natureza" | "matematica";

export type SubjectId =
  | "portugues"
  | "literatura"
  | "ingles"
  | "espanhol"
  | "artes"
  | "historia"
  | "geografia"
  | "filosofia"
  | "sociologia"
  | "fisica"
  | "quimica"
  | "biologia"
  | "matematica";

export type ExamDay = 1 | 2;

export interface Area {
  id: AreaId;
  name: string;
  shortName: string;
  description: string;
  day: ExamDay;
  /** Intervalo de numeração na prova oficial (ex.: Linguagens 1–45). */
  officialRange: [number, number];
}

export interface Subtopic {
  id: string;
  name: string;
}

export interface Topic {
  id: string;
  subjectId: SubjectId;
  name: string;
  subtopics: Subtopic[];
}

export interface Subject {
  id: SubjectId;
  areaId: AreaId;
  name: string;
  topics: Topic[];
}

export type AlternativeLetter = "A" | "B" | "C" | "D" | "E";

export const LETTERS: AlternativeLetter[] = ["A", "B", "C", "D", "E"];

export interface Alternative {
  letter: AlternativeLetter;
  text: string;
}

export interface QuestionImage {
  src: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
}

export type Difficulty = "facil" | "media" | "dificil";

export interface SupportText {
  /** Parágrafos do texto-base. */
  paragraphs: string[];
  credit?: string;
}

export interface Question {
  id: string;
  areaId: AreaId;
  subjectId: SubjectId;
  topicId: string;
  subtopicId?: string;
  /** Ano de referência para filtros. No acervo demonstrativo NÃO indica prova oficial. */
  year: number;
  /** Origem: no acervo atual, sempre conteúdo demonstrativo e autoral. */
  origin: "demonstrativa" | "oficial";
  difficulty: Difficulty;
  /** Conteúdo ou habilidade avaliada, em linguagem clara. */
  skill: string;
  support?: SupportText;
  image?: QuestionImage;
  /** Comando da questão. */
  prompt: string;
  alternatives: Alternative[];
  correct: AlternativeLetter;
  explanation: string;
  /** Questões de língua estrangeira (Dia 1, 1–5). */
  foreignLanguage?: "ingles" | "espanhol";
}
