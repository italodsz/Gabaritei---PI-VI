"use client";

import { motion } from "motion/react";
import { Check } from "@/components/icons";
import { useSyncExternalStore } from "react";
import { SelectableCard } from "@/components/ui/SelectableCard";
import { PALETTES, type PaletteDefinition, type PaletteId, type PaletteTokens } from "@/lib/theme/palettes";
import { spring } from "@/lib/animations";
import { cn } from "@/lib/utils/cn";

function subscribe(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => obs.disconnect();
}

/** true quando o tema escuro está aplicado no <html>. */
export function useIsDarkApplied(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );
}

/** Miniatura da interface desenhada com os tokens da paleta. */
export function PalettePreview({ tokens, className }: { tokens: PaletteTokens; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border", className)} style={{ background: tokens.bg, borderColor: tokens.border }} aria-hidden>
      <div className="flex h-[92px] gap-2 p-2">
        <div className="flex w-7 flex-col items-center gap-1.5 rounded-lg pt-2" style={{ background: tokens.ink }}>
          <span className="size-3 rounded-[4px]" style={{ background: tokens.gold }} />
          <span className="h-1 w-3 rounded-full" style={{ background: tokens["on-ink-muted"], opacity: 0.6 }} />
          <span className="h-1 w-3 rounded-full" style={{ background: tokens["on-ink-muted"], opacity: 0.6 }} />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="h-2 w-1/2 rounded-full" style={{ background: tokens.fg, opacity: 0.85 }} />
          <div className="flex flex-1 gap-1.5">
            <div className="flex flex-1 flex-col justify-end gap-1 rounded-lg p-1.5" style={{ background: tokens.ink }}>
              <span className="h-1 w-2/3 rounded-full" style={{ background: tokens["on-ink"], opacity: 0.8 }} />
              <span className="h-2.5 w-1/2 rounded-md" style={{ background: tokens.gold }} />
            </div>
            <div className="flex w-[38%] flex-col gap-1">
              <span className="flex-1 rounded-md border" style={{ background: tokens.surface, borderColor: tokens.border }} />
              <span className="flex-1 rounded-md" style={{ background: tokens["sage-soft"] }} />
              <span className="flex-1 rounded-md" style={{ background: tokens["coral-soft"] }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Swatches({ tokens }: { tokens: PaletteTokens }) {
  return (
    <span className="flex -space-x-1.5" aria-hidden>
      {[tokens.ink, tokens.gold, tokens.sage, tokens.coral, tokens.bg].map((c, i) => (
        <span key={i} className="size-4 rounded-full ring-2 ring-surface" style={{ background: c }} />
      ))}
    </span>
  );
}

/** Grade de paletas para a página de configurações. */
export function PalettePicker({ value, onChange }: { value: PaletteId; onChange: (id: PaletteId) => void }) {
  const dark = useIsDarkApplied();
  return (
    <div role="radiogroup" aria-label="Paleta de cores" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {PALETTES.map((p, i) => {
        const tokens = dark ? p.dark : p.light;
        return (
          <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i, ...spring.soft }}>
            <SelectableCard selected={value === p.id} onSelect={() => onChange(p.id)} className="h-full p-3">
              <PalettePreview tokens={tokens} />
              <div className="mt-3 flex items-center justify-between gap-2 px-1">
                <p className="text-sm font-semibold">{p.name}</p>
                <Swatches tokens={tokens} />
              </div>
              <p className="mt-1 px-1 pr-2 text-xs leading-snug text-fg-muted">{p.description}</p>
              {p.id === "gabaritei" && <p className="mt-1.5 px-1 text-[11px] font-semibold text-gold-fg">Padrão</p>}
            </SelectableCard>
          </motion.div>
        );
      })}
    </div>
  );
}

/** Seletor compacto (bolinhas) para o menu do usuário. */
export function PaletteDots({ value, onChange }: { value: PaletteId; onChange: (id: PaletteId) => void }) {
  const dark = useIsDarkApplied();
  return (
    <div role="radiogroup" aria-label="Paleta de cores" className="flex items-center justify-between gap-1.5">
      {PALETTES.map((p: PaletteDefinition) => {
        const t = dark ? p.dark : p.light;
        const active = value === p.id;
        return (
          <motion.button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={p.name}
            title={p.name}
            onClick={() => onChange(p.id)}
            whileTap={{ scale: 0.9 }}
            transition={spring.snappy}
            className="relative grid size-8 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            {active && <motion.span layoutId="palette-dot-ring" className="absolute -inset-[3px] rounded-full ring-2 ring-fg" transition={spring.layout} />}
            <span className="size-8 overflow-hidden rounded-full ring-1 ring-border transition-shadow duration-150 hover:ring-2 hover:ring-border-strong" style={{ background: `linear-gradient(135deg, ${t.ink} 0 50%, ${t.gold} 50% 100%)` }} />
            {active && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring.bouncy} className="absolute grid size-4 place-items-center rounded-full bg-surface text-fg shadow-sm">
                <Check className="size-2.5" strokeWidth={4} />
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
