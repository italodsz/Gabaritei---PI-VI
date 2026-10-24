import { Flame } from "lucide-react";
import { cn } from "@/lib/cn";

export interface FoguinhoBadgeProps {
  atual: number;
  melhor?: number;
  hojeContou: boolean;
  emRisco: boolean;
  className?: string;
}

/** Nunca --amber (regra 9). Informativo, nunca punitivo (seção 9). */
export function FoguinhoBadge({ atual, melhor, hojeContou, emRisco, className }: FoguinhoBadgeProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center gap-2">
        <Flame className={cn("size-5", hojeContou ? "text-forest" : "text-ink")} strokeWidth={1.75} aria-hidden="true" />
        <span className="font-serif text-xl text-ink">{atual}</span>
        <span className="text-sm text-ink-2">{atual === 1 ? "dia" : "dias"}</span>
      </div>
      {typeof melhor === "number" ? <span className="text-sm text-ink-2">Melhor: {melhor}</span> : null}
      <span className="text-sm text-ink-2">
        {hojeContou ? "Hoje já conta." : emRisco ? "Responda uma questão hoje para manter o Foguinho." : null}
      </span>
    </div>
  );
}
