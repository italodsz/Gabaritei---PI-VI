"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import type { ButtonVariante } from "./button";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: ButtonVariante;
  "aria-label": string;
}

const CLASSES_VARIANTE: Record<ButtonVariante, string> = {
  primario: "bg-forest text-on-forest hover:bg-forest-hover",
  secundario: "bg-transparent text-ink border border-rule-strong hover:bg-paper-2",
  discreto: "bg-transparent text-ink-2 hover:bg-paper-2 hover:text-ink",
  perigoso: "bg-err text-on-err hover:opacity-90",
};

/** Botão só de ícone. `aria-label` é obrigatório (seção 9: nunca sem nome acessível). */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { variante = "discreto", className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={props.type ?? "button"}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-sm",
        "motion-safe-transition disabled:opacity-60",
        CLASSES_VARIANTE[variante],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
