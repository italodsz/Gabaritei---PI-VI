"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/cn";

export const RadioCardGroup = RadioGroupPrimitive.Root;

export interface RadioCardProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  titulo: string;
  descricao?: string;
  motivo?: string;
}

/** Opção grande selecionável (seção 9), usada em grupos de rádio com poucas opções importantes. */
export function RadioCard({ titulo, descricao, motivo, className, disabled, children, ...props }: RadioCardProps) {
  return (
    <RadioGroupPrimitive.Item
      disabled={disabled}
      aria-disabled={disabled || undefined}
      className={cn(
        "group flex w-full flex-col gap-1 rounded-xs border border-rule-strong bg-card p-4 text-left",
        "data-[state=checked]:border-forest data-[state=checked]:bg-forest-soft",
        // Disabled usa cores deliberadas em vez de opacity: opacity esmaeceria também o
        // texto do "motivo", que precisa continuar legível (explica por que está desabilitado).
        "motion-safe-transition disabled:cursor-not-allowed disabled:bg-paper-2",
        className,
      )}
      {...props}
    >
      <span className="flex items-center gap-2.5">
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-rule-strong group-data-[state=checked]:border-forest">
          <RadioGroupPrimitive.Indicator className="size-2.5 rounded-full bg-forest" />
        </span>
        <span className={cn("font-medium", disabled ? "text-ink-2" : "text-ink")}>{titulo}</span>
      </span>
      {descricao ? <span className="pl-[30px] text-sm text-ink-2">{descricao}</span> : null}
      {motivo ? <span className="pl-[30px] text-sm text-ink-2">{motivo}</span> : null}
      {children}
    </RadioGroupPrimitive.Item>
  );
}
