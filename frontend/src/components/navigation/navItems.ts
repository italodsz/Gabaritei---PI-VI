import { BookOpenCheck, ChartNoAxesCombined, History, House, Timer, type Icon } from "@/components/icons";

export interface NavItem {
  href: string;
  label: string;
  icon: Icon;
  description: string;
  /** prefixos de rota que mantêm o item ativo */
  match: string[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/inicio", label: "Início", icon: House, description: "Seu painel de estudos", match: ["/inicio"] },
  { href: "/questoes", label: "Questões", icon: BookOpenCheck, description: "Monte listas e pratique", match: ["/questoes"] },
  { href: "/simulados", label: "Simulados", icon: Timer, description: "Provas no formato ENEM", match: ["/simulados"] },
  { href: "/historico", label: "Histórico", icon: History, description: "Atividades e revisões", match: ["/historico"] },
  { href: "/desempenho", label: "Desempenho", icon: ChartNoAxesCombined, description: "Análise da sua evolução", match: ["/desempenho"] },
];

export function isActive(item: NavItem, pathname: string): boolean {
  return item.match.some((m) => pathname === m || pathname.startsWith(`${m}/`));
}
