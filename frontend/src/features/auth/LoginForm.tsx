"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Info, Lock, Mail, Sparkles, UserPlus } from "@/components/icons";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { Collapse } from "@/components/ui/Feedback";
import { useAppStore } from "@/stores/appStore";
import { simulateLatency, validateCredentials, type Credentials, type FieldErrors } from "@/lib/services/authService";
import { DEMO_EMAIL } from "@/data/seeds/accounts";
import { useShake } from "@/hooks/useShake";
import { resolveHome } from "@/components/layout/AuthGate";

export function LoginForm() {
  const router = useRouter();
  const signInWithEmail = useAppStore((s) => s.signInWithEmail);
  const signInDemo = useAppStore((s) => s.signInDemo);
  const startNewStudent = useAppStore((s) => s.startNewStudent);
  const [data, setData] = useState<Credentials>({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<Credentials>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"login" | "demo" | "new" | null>(null);
  const [formRef, shakeForm] = useShake<HTMLFormElement>();

  const goHome = () => {
    const s = useAppStore.getState();
    router.replace(resolveHome(s.activeAccountId ? s.accounts[s.activeAccountId] : null));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validateCredentials(data);
    setErrors(v);
    setFormError(null);
    if (Object.keys(v).length) {
      shakeForm();
      return;
    }
    setLoading("login");
    await simulateLatency();
    const result = signInWithEmail(data.email);
    if (result === "not_found") {
      setLoading(null);
      setFormError("Não encontramos uma conta local com este e-mail neste navegador. Crie uma conta ou explore a demonstração.");
      shakeForm();
      return;
    }
    goHome();
  };

  const demo = async () => {
    setLoading("demo");
    await simulateLatency(500);
    signInDemo(Date.now());
    goHome();
  };

  const fresh = async () => {
    setLoading("new");
    await simulateLatency(400);
    startNewStudent(Date.now());
    goHome();
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">Boas-vindas de volta</h1>
      <p className="mt-2 text-fg-muted">Entre para continuar de onde parou.</p>

      <div className="mt-8 space-y-3">
        <Button variant="accent" size="lg" fullWidth icon={Sparkles} iconRight={ArrowRight} loading={loading === "demo"} disabled={!!loading} onClick={demo}>
          Explorar demonstração
        </Button>
        <Button variant="secondary" size="lg" fullWidth icon={UserPlus} loading={loading === "new"} disabled={!!loading} onClick={fresh}>
          Experimentar como estudante novo
        </Button>
      </div>

      <div className="my-7 flex items-center gap-3 text-xs font-medium text-fg-subtle">
        <span className="h-px flex-1 bg-border" />
        ou entre com e-mail
        <span className="h-px flex-1 bg-border" />
      </div>

      <form ref={formRef} onSubmit={submit} noValidate className="space-y-4">
        <Field label="E-mail" error={errors.email}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="email"
              icon={Mail}
              autoComplete="email"
              placeholder="voce@email.com"
              aria-describedby={describedBy}
              invalid={invalid}
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
            />
          )}
        </Field>
        <Field label="Senha" error={errors.password}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="password"
              icon={Lock}
              autoComplete="current-password"
              placeholder="Mínimo de 6 caracteres"
              aria-describedby={describedBy}
              invalid={invalid}
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
            />
          )}
        </Field>
        <div className="flex justify-end">
          <Link href="/recuperar-senha" className="text-sm font-semibold text-fg-muted underline-offset-4 hover:text-fg hover:underline">
            Esqueci minha senha
          </Link>
        </div>
        <Collapse open={!!formError}>
          <p role="alert" className="rounded-2xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
            {formError}
          </p>
        </Collapse>
        <Button type="submit" size="lg" fullWidth loading={loading === "login"} disabled={!!loading && loading !== "login"}>
          Entrar
        </Button>
      </form>

      <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-border bg-surface-2/60 p-3.5 text-xs leading-relaxed text-fg-muted">
        <Info className="mt-px size-4 shrink-0 text-gold-fg" aria-hidden />
        <p>
          Autenticação demonstrativa: nenhuma senha é armazenada. Use <strong className="text-fg">{DEMO_EMAIL}</strong> (qualquer senha com 6+ caracteres) ou uma conta criada neste navegador.
        </p>
      </div>

      <p className="mt-6 text-center text-sm text-fg-muted">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-semibold text-fg underline-offset-4 hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
