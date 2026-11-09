import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/bricolage-grotesque";
import "@/styles/globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { STORAGE_KEY } from "@/stores/appStore";
import { PALETTE_IDS, paletteCss } from "@/lib/theme/palettes";

export const metadata: Metadata = {
  title: { default: "Gabaritei", template: "%s · Gabaritei" },
  description: "Preparação para o ENEM com prática de questões, simulados e acompanhamento da sua evolução.",
  icons: { icon: "/icon.svg" },
};

// EXCEÇÃO ao token/hex: a meta theme-color é lida pelo navegador antes do CSS carregar e não aceita var().
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F5EE" },
    { media: "(prefers-color-scheme: dark)", color: "#141917" },
  ],
};

/** Aplica tema e preferência de movimento antes da pintura (evita flash). */
const bootScript = `(function(){try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)})||"{}");var d=(s.state&&s.state.device)||{};var t=d.theme||"system";var dark=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;if(dark)r.classList.add("dark");r.dataset.motion=d.motion||"system";var p=d.palette;r.dataset.palette=${JSON.stringify(PALETTE_IDS)}.indexOf(p)>=0?p:"gabaritei";}catch(e){}})();`;

/** Tokens das paletas alternativas, gerados a partir de lib/theme/palettes.ts. */
const PALETTE_CSS = paletteCss();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning data-motion="system" data-palette="gabaritei">
      <head>
        <style id="gabaritei-palettes" dangerouslySetInnerHTML={{ __html: PALETTE_CSS }} />
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="min-h-dvh">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
