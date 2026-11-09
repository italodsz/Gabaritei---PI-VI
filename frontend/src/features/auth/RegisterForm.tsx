"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Lock, Mail, User } from "@/components/icons";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { Collapse } from "@/components/ui/Feedback";
import { useAppStore } from "@/stores/appStore";
import { passwordStrength, simulateLatency, validateRegistration, type FieldErrors, type RegistrationData } from "@/lib/services/authService";
import { useShake } from "@/hooks/useShake";
import { spring } from "@/lib/animations";
import { cn } from "@/lib/utils/cn";

const STRENGTH_COLOR = ["bg-danger", "bg-danger", "bg-coral", "bg-gold", "bg-sage-strong"];

export function RegisterForm() {
  const router = useRouter();
  const register = useAppStore((s) => s.register);
  const [data, setData] = useState<RegistrationData>({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<FieldErrors<RegistrationData>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formRef, shakeForm] = useShake<HTMLFormElement>();
  const strength = passwordStrength(data.password);

  const set = (k: keyof RegistrationData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [k]: e.target.value });
    if (errors[k]) setErrors({ ...errors, [k]: undefined });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validateRegistration(data);
    setErrors(v);
    setFormError(null);
    if (Object.values(v).some(Boolean)) {
      shakeForm();
      return;
    }
    setLoading(true);
    await simulateLatency();
    const result = register({ name: data.name, email: data.email }, Date.now());
    if (result === "exists") {
      setLoading(false);
      setFormError("Já existe uma conta com este e-mail neste navegador. Entre com ela ou use outro e-mail.");
      shakeForm();
      return;
    }
    router.replace("/onboarding");
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">Crie sua conta</h1>
      <p className="mt-2 text-fg-muted">Leva menos de um minuto. Depois, vamos personalizar seus estudos.</p>

      <form ref={formRef} onSubmit={submit} noValidate className="mt-8 space-y-4">
        <Field label="Nome completo" error={errors.name}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} icon={User} autoComplete="name" placeholder="Como você se chama?" aria-describedby={describedBy} invalid={invalid} value={data.name} onChange={set("name")} />
          )}
        </Field>
        <Field label="E-mail" error={errors.email}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} type="email" icon={Mail} autoComplete="email" placeholder="voce@email.com" aria-describedby={describedBy} invalid={invalid} value={data.email} onChange={set("email")} />
          )}
        </Field>
        <Field label="Senha" error={errors.password} hint="Use pelo menos 6 caracteres, com letras e números.">
          {({ id, describedBy, invalid }) => (
            <div className="space-y-2">
              <Input id={id} type="password" icon={Lock} autoComplete="new-password" placeholder="Crie uma senha" aria-describedby={describedBy} invalid={invalid} value={data.password} onChange={set("password")} />
              {data.password && (
                <div className="flex items-center gap-3" aria-live="polite">
                  <div className="flex flex-1 gap-1.5">
                    {[0, 1, 2, 3].map((i) => (
                      <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
                        <motion.span
                          className={cn("block h-full origin-left rounded-full", STRENGTH_COLOR[strength.score])}
                          initial={false}
                          animate={{ scaleX: i < strength.score ? 1 : 0 }}
                          transition={spring.soft}
                        />
                      </span>
                    ))}
                  </div>
                  <span className="w-20 text-right text-xs font-semibold text-fg-muted">{strength.label}</span>
                </div>
              )}
            </div>
          )}
        </Field>
        <Field label="Confirmar senha" error={errors.confirm}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} type="password" icon={Lock} autoComplete="new-password" placeholder="Repita a senha" aria-describedby={describedBy} invalid={invalid} value={data.confirm} onChange={set("confirm")} />
          )}
        </Field>
        <Collapse open={!!formError}>
          <p role="alert" className="rounded-2xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
            {formError}
          </p>
        </Collapse>
        <Button type="submit" size="lg" fullWidth loading={loading}>
          Criar conta
        </Button>
        <p className="text-xs leading-relaxed text-fg-subtle">
          Cadastro demonstrativo: a conta é criada apenas neste navegador e a senha não é armazenada.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-fg-muted">
        Já tem conta?{" "}
        <Link href="/entrar" className="font-semibold text-fg underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
