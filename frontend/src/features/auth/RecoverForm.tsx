"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Mail, MailQuestion } from "@/components/icons";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { IconTile } from "@/components/ui/Card";
import { EMAIL_PATTERN, simulateLatency } from "@/lib/services/authService";
import { useShake } from "@/hooks/useShake";
import { spring } from "@/lib/animations";

export function RecoverForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [formRef, shakeForm] = useShake<HTMLFormElement>();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError("Informe um e-mail válido (ex.: nome@email.com).");
      shakeForm();
      return;
    }
    setError(undefined);
    setLoading(true);
    await simulateLatency();
    setLoading(false);
    setDone(true);
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!done ? (
        <motion.div key="form" exit={{ opacity: 0, y: -10 }}>
          <Link href="/entrar" className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-fg-muted hover:text-fg">
            <ArrowLeft className="size-4" /> Voltar para entrar
          </Link>
          <h1 className="font-display text-3xl font-bold tracking-tight">Recuperar senha</h1>
          <p className="mt-2 text-fg-muted">Informe o e-mail da sua conta para receber as instruções de redefinição.</p>
          <form ref={formRef} onSubmit={submit} noValidate className="mt-8 space-y-4">
            <Field label="E-mail" error={error}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="email" icon={Mail} placeholder="voce@email.com" aria-describedby={describedBy} invalid={invalid} value={email} onChange={(e) => setEmail(e.target.value)} />
              )}
            </Field>
            <Button type="submit" size="lg" fullWidth loading={loading}>
              Continuar
            </Button>
          </form>
        </motion.div>
      ) : (
        <motion.div key="done" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <motion.div initial={{ scale: 0.6, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={spring.bouncy} className="mx-auto w-fit">
            <IconTile tone="gold" size="lg" className="size-16 rounded-3xl [&_svg]:size-7">
              <MailQuestion />
            </IconTile>
          </motion.div>
          <h1 className="mt-6 font-display text-2xl font-bold tracking-tight">Fluxo demonstrativo concluído</h1>
          <p className="mt-3 text-fg-muted">
            Em uma versão integrada, enviaríamos um link de redefinição para <strong className="text-fg">{email}</strong>.
          </p>
          <p className="mt-3 rounded-2xl bg-surface-2 p-4 text-sm text-fg-muted">
            Nesta demonstração, <strong className="text-fg">nenhum e-mail foi enviado</strong> e nenhuma senha é armazenada. Você pode entrar novamente pela demonstração ou com uma conta local.
          </p>
          <ButtonLink href="/entrar" size="lg" fullWidth className="mt-8" icon={ArrowLeft}>
            Voltar para entrar
          </ButtonLink>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
