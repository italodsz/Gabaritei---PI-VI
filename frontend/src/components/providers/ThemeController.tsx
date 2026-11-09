"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/stores/appStore";

/** Suaviza a troca de cores (tema/paleta), exceto com movimento reduzido. */
function crossfadeColors() {
  const root = document.documentElement;
  const reduced =
    root.dataset.motion === "reduced" || (root.dataset.motion !== "full" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  if (reduced) return;
  root.classList.add("palette-transition");
  window.setTimeout(() => root.classList.remove("palette-transition"), 450);
}

/** Sincroniza tema (claro/escuro/sistema), paleta e preferência de movimento com o <html>. */
export function ThemeController() {
  const theme = useAppStore((s) => s.device.theme);
  const motion = useAppStore((s) => s.device.motion);
  const palette = useAppStore((s) => s.device.palette);
  const hydrated = useAppStore((s) => s.hydrated);
  const applied = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && media.matches);
      if (applied.current && (root.classList.contains("dark") !== dark || root.dataset.palette !== palette)) crossfadeColors();
      root.classList.toggle("dark", dark);
      root.dataset.palette = palette;
      applied.current = true;
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme, palette, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.dataset.motion = motion;
  }, [motion, hydrated]);

  return null;
}
