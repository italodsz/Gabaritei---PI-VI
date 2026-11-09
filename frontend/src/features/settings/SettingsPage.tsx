"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Accessibility, Database, GraduationCap, LogOut, Monitor, Moon, Palette, RefreshCcw, Sun, Timer } from "@/components/icons";
import { useState } from "react";
import type { ExperienceLevel, MotionPreference, StudyGoalId, SubjectId, ThemePreference } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, IconTile } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Badge";
import { Field, SegmentedControl, Switch } from "@/components/ui/Form";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/Modal";
import { SelectableCard } from "@/components/ui/SelectableCard";
import { Stagger, Reveal } from "@/components/animations/Motion";
import { useActiveAccount } from "@/hooks/useAccount";
import { useShouldReduceMotion } from "@/hooks/useMotionPreference";
import { useAppStore } from "@/stores/appStore";
import { GOAL_OPTIONS, LEVEL_OPTIONS, upcomingEditions } from "@/features/onboarding/options";
import { SUBJECTS } from "@/data/fixtures/taxonomy";
import { PRACTICE_COUNTS } from "@/lib/sessions/factory";
import { toast } from "@/components/ui/Toast";
import { PalettePicker } from "@/components/theme/PalettePicker";
import { PALETTE_BY_ID } from "@/lib/theme/palettes";

const THEMES: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Automático", icon: Monitor },
];

export function SettingsPage() {
  const router = useRouter();
  const account = useActiveAccount();
  const device = useAppStore((s) => s.device);
  const setTheme = useAppStore((s) => s.setTheme);
  const setMotion = useAppStore((s) => s.setMotion);
  const setPalette = useAppStore((s) => s.setPalette);
  const palette = PALETTE_BY_ID[device.palette];
  const updateStudy = useAppStore((s) => s.updateStudy);
  const updateOnboardingPrefs = useAppStore((s) => s.updateOnboardingPrefs);
  const resetAccountData = useAppStore((s) => s.resetAccountData);
  const signOut = useAppStore((s) => s.signOut);
  const reduced = useShouldReduceMotion();
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [now] = useState(() => Date.now());

  const ob = account.onboarding;
  const editions = Array.from(new Set([...(ob.edition ? [ob.edition] : []), ...upcomingEditions(now)])).sort();
  const isDemo = account.profile.kind === "demo";

  const saved = (msg = "Preferência salva") => toast.success(msg);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader eyebrow="Configurações" title="Preferências" description="As alterações são salvas automaticamente neste navegador." />

      <Stagger gap={0.07} className="space-y-6">
        <Reveal>
          <Card>
            <CardHeader
              title="Aparência"
              description="Tema e paleta de cores da interface"
              icon={
                <IconTile tone="gold">
                  <Palette />
                </IconTile>
              }
            />
            <p className="mb-3 text-[13px] font-semibold">Tema</p>
            <div className="grid gap-4 sm:grid-cols-3" role="radiogroup" aria-label="Tema">
              {THEMES.map((t) => {
                const light = palette.light;
                const dark = palette.dark;
                const tk = t.value === "dark" ? dark : light;
                return (
                  <SelectableCard key={t.value} selected={device.theme === t.value} onSelect={() => setTheme(t.value)} className="p-3">
                    <div
                      className="overflow-hidden rounded-2xl border border-border"
                      style={{ background: t.value === "system" ? `linear-gradient(90deg, ${light.bg} 50%, ${dark.bg} 50%)` : tk.bg }}
                      aria-hidden
                    >
                      <div className="flex h-20 gap-2 p-2">
                        <div className="w-6 rounded-lg" style={{ background: tk.ink }} />
                        <div className="flex flex-1 flex-col gap-1.5">
                          <div className="h-3 w-2/3 rounded" style={{ background: tk.gold }} />
                          <div className="flex-1 rounded-lg border border-border" style={{ background: t.value === "system" ? "transparent" : tk.surface }} />
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 flex items-center gap-2 px-1 text-sm font-semibold">
                      <t.icon className="size-4" /> {t.label}
                    </p>
                  </SelectableCard>
                );
              })}
            </div>

            <div className="mt-8 mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-[13px] font-semibold">Paleta de cores</p>
              <p className="text-xs text-fg-subtle">Funciona nos temas claro e escuro. As cores das áreas do ENEM e dos gráficos não mudam.</p>
            </div>
            <PalettePicker
              value={device.palette}
              onChange={(id) => {
                setPalette(id);
                saved(`Paleta ${PALETTE_BY_ID[id].name} aplicada`);
              }}
            />
          </Card>
        </Reveal>

        <Reveal>
          <Card>
            <CardHeader
              title="Movimento e acessibilidade"
              description="Controle a intensidade das animações da plataforma"
              icon={
                <IconTile tone="sage">
                  <Accessibility />
                </IconTile>
              }
            />
            <div className="flex flex-wrap items-center gap-6">
              <SegmentedControl<MotionPreference>
                ariaLabel="Animações"
                layoutId="motion-pref"
                value={device.motion}
                onChange={(m) => {
                  setMotion(m);
                  saved(m === "reduced" ? "Animações reduzidas" : m === "full" ? "Animações completas" : "Seguindo o sistema");
                }}
                options={[
                  { value: "system", label: "Seguir o sistema" },
                  { value: "reduced", label: "Reduzir animações" },
                  { value: "full", label: "Completas" },
                ]}
              />
              <div className="flex items-center gap-3 text-sm text-fg-muted" aria-hidden>
                <span className="relative h-8 w-28 overflow-hidden rounded-full bg-surface-2">
                  <motion.span
                    className="absolute top-1 left-1 size-6 rounded-full bg-gold"
                    animate={{ x: [0, 80, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </span>
                Prévia: {reduced ? "movimento reduzido" : "movimento completo"}
              </div>
            </div>
            <p className="mt-4 text-sm text-fg-muted">
              Com movimento reduzido, deslocamentos, escalas e partículas são desativados. O feedback continua visível por cores, ícones e textos — nenhuma informação é escondida.
            </p>
          </Card>
        </Reveal>

        <Reveal>
          <Card>
            <CardHeader
              title="Estudo"
              description="Cronômetro e quantidade habitual de questões"
              icon={
                <IconTile tone="coral">
                  <Timer />
                </IconTile>
              }
            />
            <div className="space-y-5">
              <Switch
                checked={account.study.practiceTimer}
                onChange={(v) => {
                  updateStudy({ practiceTimer: v });
                  saved();
                }}
                label="Cronômetro nas listas de questões"
                description="Exibir o tempo decorrido ao resolver listas."
              />
              <Switch
                checked={account.study.simulationTimer}
                onChange={(v) => {
                  updateStudy({ simulationTimer: v });
                  saved();
                }}
                label="Cronômetro nos simulados"
                description="Exibir o tempo restante durante a prova."
              />
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">Quantidade habitual de questões</p>
                  <p className="mt-0.5 text-[13px] text-fg-muted">Usada como padrão nas listas e recomendações.</p>
                </div>
                <SegmentedControl<number>
                  ariaLabel="Quantidade habitual"
                  layoutId="default-count"
                  value={account.study.defaultQuestionCount}
                  onChange={(n) => {
                    updateStudy({ defaultQuestionCount: n });
                    saved();
                  }}
                  options={PRACTICE_COUNTS.map((c) => ({ value: c, label: String(c) }))}
                />
              </div>
            </div>
          </Card>
        </Reveal>

        <Reveal>
          <Card>
            <CardHeader
              title="Preferências de estudo"
              description="Definidas no onboarding — usadas nas recomendações"
              icon={
                <IconTile tone="matematica">
                  <GraduationCap />
                </IconTile>
              }
            />
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Objetivo">
                {({ id }) => (
                  <Select<StudyGoalId>
                    id={id}
                    value={ob.goal}
                    placeholder="Não informado"
                    onChange={(goal) => {
                      updateOnboardingPrefs({ goal });
                      saved();
                    }}
                    options={GOAL_OPTIONS.map((g) => ({ value: g.value, label: g.title }))}
                  />
                )}
              </Field>
              <Field label="Edição do ENEM">
                {({ id }) => (
                  <Select<number>
                    id={id}
                    value={ob.edition ?? 0}
                    onChange={(edition) => {
                      updateOnboardingPrefs({ edition });
                      saved();
                    }}
                    options={[...editions.map((y) => ({ value: y, label: `ENEM ${y}` })), { value: 0, label: "Ainda não sei" }]}
                  />
                )}
              </Field>
              <Field label="Preparação">
                {({ id }) => (
                  <Select<ExperienceLevel>
                    id={id}
                    value={ob.level}
                    placeholder="Não informada"
                    onChange={(level) => {
                      updateOnboardingPrefs({ level });
                      saved();
                    }}
                    options={LEVEL_OPTIONS.map((l) => ({ value: l.value, label: l.title }))}
                  />
                )}
              </Field>
            </div>
            <p className="mt-6 mb-2.5 text-[13px] font-semibold">Matérias com dificuldade</p>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((s) => {
                const on = ob.difficultSubjects.includes(s.id);
                return (
                  <Chip
                    key={s.id}
                    selected={on}
                    onToggle={() => {
                      const next: SubjectId[] = on ? ob.difficultSubjects.filter((x) => x !== s.id) : [...ob.difficultSubjects, s.id];
                      updateOnboardingPrefs({ difficultSubjects: next });
                    }}
                  >
                    {s.name}
                  </Chip>
                );
              })}
            </div>
          </Card>
        </Reveal>

        <Reveal>
          <Card>
            <CardHeader
              title="Dados e conta"
              description="Tudo fica armazenado localmente, com chave versionada (gabaritei:v1)"
              icon={
                <IconTile tone="danger">
                  <Database />
                </IconTile>
              }
            />
            <div className="divide-y divide-border rounded-3xl border border-border">
              <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="max-w-md">
                  <p className="text-sm font-semibold">{isDemo ? "Redefinir dados demonstrativos" : "Apagar histórico de estudos"}</p>
                  <p className="mt-0.5 text-[13px] text-fg-muted">
                    {isDemo
                      ? "Restaura o histórico original da demonstração: listas, simulados, metas e conquistas."
                      : "Remove listas, simulados, favoritas e marcações desta conta. Perfil e preferências são mantidos."}
                  </p>
                </div>
                <Button variant="secondary" icon={RefreshCcw} onClick={() => setConfirmReset(true)} className="text-danger">
                  {isDemo ? "Redefinir" : "Apagar histórico"}
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-sm font-semibold">Sair da conta</p>
                  <p className="mt-0.5 text-[13px] text-fg-muted">Seus dados continuam salvos para quando você voltar.</p>
                </div>
                <Button variant="secondary" icon={LogOut} onClick={() => setConfirmExit(true)}>
                  Sair
                </Button>
              </div>
            </div>
          </Card>
        </Reveal>
      </Stagger>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          resetAccountData(Date.now());
          setConfirmReset(false);
          toast.success(isDemo ? "Demonstração redefinida" : "Histórico apagado", isDemo ? "O histórico de exemplo foi restaurado." : "Você pode começar do zero.");
          router.push("/inicio");
        }}
        tone="danger"
        icon={
          <IconTile tone="danger" size="lg">
            <RefreshCcw />
          </IconTile>
        }
        title={isDemo ? "Redefinir a demonstração?" : "Apagar todo o histórico?"}
        description={isDemo ? "Todas as atividades feitas por você nesta demonstração serão substituídas pelo histórico original." : "Essa ação não pode ser desfeita."}
        confirmLabel={isDemo ? "Redefinir dados" : "Apagar histórico"}
      />
      <ConfirmDialog
        open={confirmExit}
        onClose={() => setConfirmExit(false)}
        onConfirm={() => {
          setConfirmExit(false);
          signOut();
          router.replace("/entrar");
        }}
        icon={
          <IconTile tone="coral" size="lg">
            <LogOut />
          </IconTile>
        }
        title="Sair da conta?"
        description="Você poderá entrar novamente pela tela inicial."
        confirmLabel="Sair"
      />
    </div>
  );
}

