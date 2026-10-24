"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** O App Router não move o foco sozinho ao trocar de rota (seção 8). */
export function FocoNoH1() {
  const pathname = usePathname();

  useEffect(() => {
    const h1 = document.querySelector("h1");
    if (!h1) return;
    if (!h1.hasAttribute("tabindex")) h1.setAttribute("tabindex", "-1");
    h1.focus();
  }, [pathname]);

  return null;
}
