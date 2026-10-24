import { Info } from "lucide-react";

/** Fixo no topo enquanto API_MODE=mock (seção 7.3, regra 8 da seção 2). */
export function DemoBanner() {
  return (
    <div
      role="region"
      aria-label="Aviso de dados de demonstração"
      className="flex items-center justify-center gap-2 bg-paper-2 px-4 py-2 text-sm text-ink-2"
    >
      <Info className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
      Dados de demonstração: nenhuma informação aqui vem de uma prova real.
    </div>
  );
}
