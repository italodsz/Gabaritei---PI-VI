import { Check, Circle, Flag, Minus, X } from "lucide-react";
import { cn } from "@/lib/cn";

export type StatusChipValor = "acertou" | "errou" | "em_branco" | "nao_respondida" | "marcada";

const CONFIG: Record<StatusChipValor, { rotulo: string; icone: typeof Check; classe: string }> = {
  acertou: { rotulo: "Acertou", icone: Check, classe: "text-brand-ink" },
  errou: { rotulo: "Errou", icone: X, classe: "text-err" },
  em_branco: { rotulo: "Em branco", icone: Minus, classe: "text-ink-2" },
  nao_respondida: { rotulo: "Não respondida", icone: Circle, classe: "text-ink-2" },
  // Nunca âmbar aqui: âmbar é exclusivo de "decidido por IA" (seção 2, regra 9).
  marcada: { rotulo: "Marcada para revisar", icone: Flag, classe: "text-ink" },
};

export interface StatusChipProps {
  status: StatusChipValor;
  className?: string;
}

export function StatusChip({ status, className }: StatusChipProps) {
  const { rotulo, icone: Icone, classe } = CONFIG[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", classe, className)}>
      <Icone className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
      {rotulo}
    </span>
  );
}
