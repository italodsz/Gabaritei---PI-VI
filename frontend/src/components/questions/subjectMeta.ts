import {
  Atom,
  BookOpen,
  Brain,
  FlaskConical,
  Globe,
  Landmark,
  Languages,
  Leaf,
  Palette,
  PenLine,
  ScrollText,
  Sigma,
  Users,
  type Icon,
} from "@/components/icons";
import type { AreaId, SubjectId } from "@/types";

export const SUBJECT_ICON: Record<SubjectId, Icon> = {
  portugues: PenLine,
  literatura: BookOpen,
  ingles: Languages,
  espanhol: Languages,
  artes: Palette,
  historia: ScrollText,
  geografia: Globe,
  filosofia: Brain,
  sociologia: Users,
  fisica: Atom,
  quimica: FlaskConical,
  biologia: Leaf,
  matematica: Sigma,
};

export const AREA_ICON: Record<AreaId, Icon> = {
  linguagens: PenLine,
  humanas: Landmark,
  natureza: Leaf,
  matematica: Sigma,
};

/** Cor de gráfico por área (paleta validada; a cor segue a área, nunca a posição). */
export const AREA_COLOR: Record<AreaId, string> = {
  linguagens: "var(--chart-linguagens)",
  humanas: "var(--chart-humanas)",
  natureza: "var(--chart-natureza)",
  matematica: "var(--chart-matematica)",
};

export const AREA_COLOR_STRONG: Record<AreaId, string> = {
  linguagens: "var(--area-linguagens-strong)",
  humanas: "var(--area-humanas-strong)",
  natureza: "var(--area-natureza-strong)",
  matematica: "var(--area-matematica-strong)",
};

export const DIFFICULTY_LABEL = { facil: "Fácil", media: "Média", dificil: "Difícil" } as const;
