"use client";

import { Flame } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export interface FoguinhoBadgeProps {
  atual: number;
  melhor?: number;
  hojeContou: boolean;
  emRisco: boolean;
  className?: string;
}

type EstadoFoguinho = "acesa" | "em-espera" | "zerada";

function estadoDoFoguinho(atual: number, hojeContou: boolean): EstadoFoguinho {
  if (atual === 0) return "zerada";
  return hojeContou ? "acesa" : "em-espera";
}

/**
 * Nunca --amber (regra 9). Informativo, nunca punitivo (seção 9): 3 estados derivados de
 * `atual`/`hojeContou`/`emRisco` (etapa V, item 4) — nunca um texto de "quebrou" ou "apagou".
 */
export function FoguinhoBadge({ atual, melhor, hojeContou, emRisco, className }: FoguinhoBadgeProps) {
  const estado = estadoDoFoguinho(atual, hojeContou);

  // Anima só a transição "ainda não contou hoje" → "já conta", nunca ao montar
  // (senão toda carga de página piscaria a chama) nem de "zerada" pra "acesa" direto.
  const anteriorRef = useRef(hojeContou);
  const [acendendoAgora, setAcendendoAgora] = useState(false);

  useEffect(() => {
    if (!anteriorRef.current && hojeContou) {
      setAcendendoAgora(true);
      const id = setTimeout(() => setAcendendoAgora(false), 420);
      anteriorRef.current = hojeContou;
      return () => clearTimeout(id);
    }
    anteriorRef.current = hojeContou;
  }, [hojeContou]);

  const corIcone = estado === "acesa" ? "text-brand" : estado === "em-espera" ? "text-ink" : "text-ink-2";
  const corNumero = estado === "zerada" ? "text-ink-2" : "text-ink";

  const texto =
    estado === "acesa"
      ? "Hoje já conta."
      : estado === "zerada"
        ? "Comece sua sequência hoje."
        : emRisco
          ? "Responda uma questão hoje para manter o Foguinho."
          : "Ainda não contou hoje.";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center gap-2">
        <Flame
          className={cn(
            "size-5 motion-safe-transition",
            corIcone,
            estado === "acesa" && "fill-current",
            acendendoAgora && "scale-125",
          )}
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <span className={cn("font-display text-xl", corNumero)}>{atual}</span>
        <span className="text-sm text-ink-2">{atual === 1 ? "dia" : "dias"}</span>
      </div>
      {typeof melhor === "number" ? <span className="text-sm text-ink-2">Melhor: {melhor}</span> : null}
      <span className="text-sm text-ink-2">{texto}</span>
    </div>
  );
}
