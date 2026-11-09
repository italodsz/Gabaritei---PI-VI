"use client";

import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, Flame, MapPin, Save, School, Target, Trophy, CheckCircle2 } from "@/components/icons";
import { useMemo, useState } from "react";
import { Card, CardHeader, IconTile } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Feedback";
import { Field, Input, SegmentedControl, Textarea } from "@/components/ui/Form";
import { AnimatedNumber, ProgressBar } from "@/components/ui/Progress";
import { Modal } from "@/components/ui/Modal";
import { Stagger, Reveal } from "@/components/animations/Motion";
import { Medal, TIER_LABEL } from "@/components/gamification/Medal";
import { useActiveAccount, useRecords } from "@/hooks/useAccount";
import { useNow } from "@/hooks/useNow";
import { useAppStore } from "@/stores/appStore";
import { GoalsCard } from "@/features/performance/GoalsCard";
import { computeStreak, summarize } from "@/lib/calculations/stats";
import { evaluateAchievements, type AchievementState } from "@/lib/calculations/achievements";
import { formatDateLong, formatPercent } from "@/lib/format";
import { toast } from "@/components/ui/Toast";
import { medalReveal, spring } from "@/lib/animations";
import { cn } from "@/lib/utils/cn";

type AchFilter = "todas" | "desbloqueadas" | "bloqueadas";

export function ProfilePage() {
  const account = useActiveAccount();
  const records = useRecords(account);
  const now = useNow(60000);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const p = account.profile;
  const [form, setForm] = useState({ name: p.name, nickname: p.nickname, school: p.school, city: p.city, bio: p.bio });
  const [error, setError] = useState<string | undefined>();
  const [filter, setFilter] = useState<AchFilter>("todas");
  const [detail, setDetail] = useState<AchievementState | null>(null);

  const summary = useMemo(() => summarize(records), [records]);
  const streak = useMemo(() => computeStreak(records, now), [records, now]);
  const achievements = useMemo(() => evaluateAchievements({ records, account, now }), [records, account, now]);
  const unlocked = achievements.filter((a) => a.unlocked);
  const shown = achievements.filter((a) => (filter === "todas" ? true : filter === "desbloqueadas" ? a.unlocked : !a.unlocked));
  const dirty = form.name !== p.name || form.nickname !== p.nickname || form.school !== p.school || form.city !== p.city || form.bio !== p.bio;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 2) {
      setError("Informe seu nome (mínimo de 2 letras).");
      return;
    }
    setError(undefined);
    updateProfile({ name: form.name.trim(), nickname: form.nickname.trim() || form.name.trim().split(/\s+/)[0], school: form.school.trim(), city: form.city.trim(), bio: form.bio.trim() });
    toast.success("Perfil atualizado", "Suas informações foram salvas neste navegador.");
  };

  return (
    <div className="space-y-6">
      <Stagger gap={0.07} className="grid grid-cols-12 gap-6">
        <Reveal className="col-span-12">
          <Card surface="ink" padded="lg" className="overflow-hidden">
            <div className="bg-dots pointer-events-none absolute inset-0 opacity-50" aria-hidden />
            <div className="relative flex flex-wrap items-center gap-8">
              <motion.div initial={{ scale: 0.8, rotate: -6 }} animate={{ scale: 1, rotate: 0 }} transition={spring.bouncy}>
                <Avatar name={p.name} size={104} className="ring-4 ring-ink-line" />
              </motion.div>
              <div className="min-w-0 basis-full sm:basis-0 sm:min-w-[260px] sm:flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-3xl font-bold tracking-tight break-words">{p.name}</h1>
                  <Badge tone="gold">{p.kind === "demo" ? "Perfil demonstrativo" : p.kind === "new" ? "Estudante novo" : "Conta local"}</Badge>
                </div>
                <p className="mt-1 text-on-ink-muted">“{p.nickname}” · {p.email}</p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-on-ink-muted">
                  {p.school && (
                    <span className="flex items-center gap-1.5">
                      <School className="size-4" /> {p.school}
                    </span>
                  )}
                  {p.city && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-4" /> {p.city}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="size-4" /> Desde {formatDateLong(p.createdAt)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: <CheckCircle2 />, label: "Questões", value: summary.answered, fmt: undefined },
                  { icon: <Target />, label: "Acerto", value: summary.accuracy * 100, fmt: (n: number) => `${Math.round(n)}%` },
                  { icon: <Flame />, label: "Sequência", value: streak.current, fmt: (n: number) => `${Math.round(n)}d` },
                  { icon: <Trophy />, label: "Conquistas", value: unlocked.length, fmt: (n: number) => `${Math.round(n)}/${achievements.length}` },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl bg-ink-raised px-4 py-3 ring-1 ring-ink-line">
                    <span className="text-gold [&_svg]:size-4">{s.icon}</span>
                    <p className="mt-1.5 font-display text-2xl font-bold">
                      <AnimatedNumber value={s.value} format={s.fmt} />
                    </p>
                    <p className="text-xs text-on-ink-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Reveal>

        <Reveal className="col-span-12 xl:col-span-5">
          <Card className="h-full">
            <CardHeader title="Informações pessoais" description="Visíveis apenas para você nesta demonstração" />
            <form onSubmit={save} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nome" error={error}>
                  {({ id, describedBy, invalid }) => <Input id={id} aria-describedby={describedBy} invalid={invalid} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
                </Field>
                <Field label="Apelido">
                  {({ id }) => <Input id={id} value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} placeholder="Como prefere ser chamado" />}
                </Field>
                <Field label="Escola" optional>
                  {({ id }) => <Input id={id} value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} />}
                </Field>
                <Field label="Cidade" optional>
                  {({ id }) => <Input id={id} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />}
                </Field>
              </div>
              <Field label="Sobre você" optional hint="Ex.: série, curso desejado, objetivos.">
                {({ id, describedBy }) => <Textarea id={id} aria-describedby={describedBy} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={280} />}
              </Field>
              <p className="text-xs text-fg-subtle">Foto e avatar personalizados não estão disponíveis nesta versão — usamos suas iniciais.</p>
              <div className="flex justify-end">
                <Button type="submit" icon={Save} disabled={!dirty}>
                  Salvar alterações
                </Button>
              </div>
            </form>
          </Card>
        </Reveal>

        <Reveal className="col-span-12 xl:col-span-7">
          <Card className="h-full">
            <CardHeader
              title="Conquistas"
              description={`${unlocked.length} de ${achievements.length} desbloqueadas`}
              icon={
                <IconTile tone="gold">
                  <Trophy />
                </IconTile>
              }
              action={
                <SegmentedControl<AchFilter>
                  size="sm"
                  ariaLabel="Filtrar conquistas"
                  layoutId="ach-filter"
                  value={filter}
                  onChange={setFilter}
                  options={[
                    { value: "todas", label: "Todas" },
                    { value: "desbloqueadas", label: "Obtidas" },
                    { value: "bloqueadas", label: "Bloqueadas" },
                  ]}
                />
              }
            />
            <ProgressBar value={unlocked.length / achievements.length} className="mb-6" label="Conquistas desbloqueadas" />
            <motion.div layout className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {shown.map((a, i) => (
                  <motion.button
                    key={a.id}
                    layout
                    type="button"
                    onClick={() => setDetail(a)}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.03, ...spring.soft } }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    whileHover={{ y: -4 }}
                    className={cn(
                      "flex flex-col items-center rounded-3xl border p-4 text-center transition-colors",
                      a.unlocked ? "border-gold-strong/30 bg-gold-soft/40 hover:bg-gold-soft/70" : "border-border bg-surface-2/50 hover:bg-surface-2",
                    )}
                    aria-label={`${a.title}: ${a.unlocked ? "desbloqueada" : `bloqueada, ${Math.round(a.progress * 100)}% concluída`}`}
                  >
                    <Medal icon={a.icon} tier={a.tier} locked={!a.unlocked} size={56} />
                    <p className="mt-2 text-sm leading-tight font-semibold">{a.title}</p>
                    {a.unlocked ? (
                      <p className="mt-1 text-[11px] text-fg-subtle">{TIER_LABEL[a.tier]} · {a.unlockedAt ? new Date(a.unlockedAt).toLocaleDateString("pt-BR") : ""}</p>
                    ) : (
                      <div className="mt-2 w-full">
                        <ProgressBar value={a.progress} height="h-1" tone="ink" />
                        <p className="mt-1 text-[11px] text-fg-subtle tabular">
                          {a.current}/{a.target}
                        </p>
                      </div>
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
            </motion.div>
          </Card>
        </Reveal>
      </Stagger>

      <GoalsCard />

      <Modal open={!!detail} onClose={() => setDetail(null)} size="sm">
        {detail && (
          <div className="flex flex-col items-center text-center">
            <motion.div variants={medalReveal} initial="hidden" animate="show">
              <Medal icon={detail.icon} tier={detail.tier} locked={!detail.unlocked} size={96} shine={detail.unlocked} />
            </motion.div>
            <Badge tone={detail.unlocked ? "gold" : "neutral"} className="mt-4">
              {detail.unlocked ? `Medalha de ${TIER_LABEL[detail.tier].toLowerCase()}` : "Bloqueada"}
            </Badge>
            <h2 className="mt-3 font-display text-2xl font-bold">{detail.title}</h2>
            <p className="mt-2 text-sm text-fg-muted">{detail.description}</p>
            <div className="mt-5 w-full rounded-2xl bg-surface-2 p-4 text-left text-sm">
              <p className="text-xs font-bold tracking-wide text-fg-subtle uppercase">Regra</p>
              <p className="mt-1 font-semibold">{detail.rule}</p>
              <ProgressBar value={detail.progress} className="mt-3" tone={detail.unlocked ? "sage" : "gold"} />
              <p className="mt-2 text-xs text-fg-muted">
                {detail.unlocked && detail.unlockedAt ? `Desbloqueada em ${formatDateLong(detail.unlockedAt)}.` : `Progresso: ${detail.current} de ${detail.target} (${formatPercent(detail.progress)}).`}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
