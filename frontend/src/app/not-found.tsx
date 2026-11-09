import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-6 text-center">
      <div className="flex max-w-md flex-col items-center gap-4">
        <LogoMark size={56} />
        <p className="font-display text-6xl font-bold tracking-tight text-gold-fg">404</p>
        <h1 className="font-display text-2xl font-semibold">Página não encontrada</h1>
        <p className="text-fg-muted">O endereço pode ter mudado ou a atividade não existe mais neste navegador.</p>
        <Link href="/" className="mt-2 inline-flex h-11 items-center rounded-2xl bg-primary px-5 text-sm font-semibold text-on-primary">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
