"use client";

import { useCallback, useEffect, useState } from "react";
import type { Preferencias } from "@/lib/api/types";
import { atualizarThemeColor } from "@/lib/paletas";

export type Tema = Preferencias["tema"];

const CHAVE = "gabaritei:tema";

export function lerTemaSalvo(): Tema {
  if (typeof window === "undefined") return "sistema";
  try {
    const valor = window.localStorage.getItem(CHAVE);
    if (valor === "claro" || valor === "escuro" || valor === "sistema") return valor;
  } catch {
    // ignora: sem storage, usa o padrão
  }
  return "sistema";
}

// tokens.css (seção 6) usa os valores em inglês "light"/"dark" no atributo
// data-theme (é o literal do prompt). A preferência em si, na API e no
// localStorage, fica em português ("claro"/"escuro"/"sistema") — este mapa
// é só a tradução na hora de aplicar no DOM.
const ATRIBUTO_POR_TEMA: Record<Exclude<Tema, "sistema">, "light" | "dark"> = {
  claro: "light",
  escuro: "dark",
};

export function aplicarTema(tema: Tema): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (tema === "sistema") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", ATRIBUTO_POR_TEMA[tema]);
  requestAnimationFrame(atualizarThemeColor);
}

/** Script para rodar antes da hidratação (ver layout.tsx) e evitar flash de tema errado. */
export const SCRIPT_TEMA_INICIAL = `(function(){try{var t=window.localStorage.getItem('${CHAVE}');if(t==='claro'){document.documentElement.setAttribute('data-theme','light');}else if(t==='escuro'){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();`;

export function useTema() {
  const [tema, setTema] = useState<Tema>("sistema");

  useEffect(() => {
    // Lê localStorage, que só existe no navegador: precisa ser depois da
    // hidratação para o SSR não divergir do cliente (script inline já evita o flash visual).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTema(lerTemaSalvo());
    atualizarThemeColor();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", atualizarThemeColor);
    return () => media.removeEventListener("change", atualizarThemeColor);
  }, []);

  const definirTema = useCallback((novo: Tema) => {
    setTema(novo);
    aplicarTema(novo);
    try {
      window.localStorage.setItem(CHAVE, novo);
    } catch {
      // modo privado ou storage bloqueado: aplica mesmo assim, só não persiste
    }
  }, []);

  return { tema, definirTema };
}
