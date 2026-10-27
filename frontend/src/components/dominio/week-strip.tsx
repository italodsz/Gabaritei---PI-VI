import { cn } from "@/lib/cn";

export interface WeekStripDia {
  data: string;
  questoes: number;
}

export interface WeekStripProps {
  dias: WeekStripDia[];
  className?: string;
}

const NOMES_DIA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

/** 7 dias, cada um com aria-label "segunda, 3 questões" ou "terça, sem atividade" (seção 9). */
export function WeekStrip({ dias, className }: WeekStripProps) {
  return (
    <ul className={cn("flex gap-1.5", className)}>
      {dias.map((dia) => {
        const nomeDia = NOMES_DIA[new Date(`${dia.data}T00:00:00`).getDay()];
        const rotulo =
          dia.questoes > 0
            ? `${nomeDia}, ${dia.questoes} ${dia.questoes === 1 ? "questão" : "questões"}`
            : `${nomeDia}, sem atividade`;
        // Só tons sólidos dos tokens (seção 6): modificador de opacidade (bg-brand/60)
        // sobre uma cor custom baseada em var() não compõe de forma confiável no Tailwind v4.
        const intensidade = dia.questoes === 0 ? 0 : dia.questoes < 10 ? 1 : 2;
        return (
          <li key={dia.data}>
            <span
              role="img"
              aria-label={rotulo}
              title={rotulo}
              className={cn(
                "flex size-7 items-center justify-center rounded-xs text-xs font-medium",
                intensidade === 0 && "bg-paper-2 text-ink-2",
                intensidade === 1 && "bg-brand-soft text-brand-ink",
                intensidade === 2 && "bg-brand text-on-brand",
              )}
            >
              {nomeDia.slice(0, 1).toUpperCase()}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
