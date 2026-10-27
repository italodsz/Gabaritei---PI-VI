import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import "@/styles/globals.css";
import { SCRIPT_TEMA_INICIAL } from "@/lib/hooks/use-tema";
import { Providers } from "./providers";

const serif = Source_Serif_4({
  variable: "--font-source-serif-4",
  subsets: ["latin"],
  display: "swap",
});

const sans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Gabaritei",
    template: "%s | Gabaritei",
  },
  description:
    "Gabaritei: recomendação adaptativa de questões do ENEM, sempre dizendo o critério da recomendação.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Valor inicial da Floresta. O cliente sincroniza este meta com --paper quando
  // tema ou paleta mudam (src/lib/paletas.ts).
  themeColor: "#f4f2ec", // check-regras: ignore
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA_INICIAL }} />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
