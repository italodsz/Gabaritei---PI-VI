import { GraduationCap, HandCoins, Medal, Target, Telescope, type Icon } from "@/components/icons";
import type { ExperienceLevel, StudyGoalId } from "@/types";

export const GOAL_OPTIONS: { value: StudyGoalId; title: string; description: string; icon: Icon }[] = [
  { value: "universidade_publica", title: "Universidade pública", description: "Conquistar uma vaga pelo Sisu.", icon: GraduationCap },
  { value: "curso_especifico", title: "Curso concorrido", description: "Alcançar a nota de corte de um curso específico.", icon: Target },
  { value: "bolsa_prouni", title: "Bolsa ou financiamento", description: "Conseguir bolsa pelo ProUni ou acesso ao Fies.", icon: HandCoins },
  { value: "reforcar_base", title: "Reforçar a base", description: "Revisar o ensino médio com mais segurança.", icon: Medal },
  { value: "treinar", title: "Conhecer a prova", description: "Treinar o formato e o ritmo do ENEM.", icon: Telescope },
];

export const GOAL_LABEL: Record<StudyGoalId, string> = Object.fromEntries(GOAL_OPTIONS.map((g) => [g.value, g.title])) as Record<
  StudyGoalId,
  string
>;

export const LEVEL_OPTIONS: { value: ExperienceLevel; title: string; description: string; bars: number }[] = [
  { value: "iniciante", title: "Começando agora", description: "Vou montar minha rotina de estudos para o ENEM.", bars: 1 },
  { value: "intermediario", title: "Já estudo há um tempo", description: "Conheço a prova, mas ainda tenho lacunas.", bars: 2 },
  { value: "avancado", title: "Preparação avançada", description: "Domino boa parte do conteúdo e quero refinar.", bars: 3 },
  { value: "treineiro", title: "Treineiro", description: "Ainda não concluí o ensino médio e quero experimentar.", bars: 0 },
];

export const LEVEL_LABEL: Record<ExperienceLevel, string> = Object.fromEntries(LEVEL_OPTIONS.map((l) => [l.value, l.title])) as Record<
  ExperienceLevel,
  string
>;

/** Próximas edições do ENEM a partir de uma data (a prova ocorre em novembro). */
export function upcomingEditions(now: number): number[] {
  const d = new Date(now);
  const first = d.getMonth() >= 11 ? d.getFullYear() + 1 : d.getFullYear();
  return [first, first + 1, first + 2];
}
