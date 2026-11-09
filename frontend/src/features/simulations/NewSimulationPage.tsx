"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookCopy,
  CheckCircle2,
  Clock,
  Info,
  ListOrdered,
  NotebookPen,
  Pause,
  Play,
  SlidersHorizontal,
  Timer,
} from "@/components/icons";
import { useMemo, useState } from "react";
import type { AreaId, ExamDay, SimulationCriteria } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, IconTile } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, Chip } from "@/components/ui/Badge";
import { SegmentedControl, Switch, Field } from "@/components/ui/Form";
import { Select } from "@/components/ui/Select";
import { SelectableCard } from "@/components/ui/SelectableCard";
import { AREA_ICON } from "@/components/questions/subjectMeta";
import { AREAS, AREA_BY_ID, ENEM_EDITIONS } from "@/data/fixtures/taxonomy";
import { useActiveAccount, useRecords } from "@/hooks/useAccount";
import { useAppStore } from "@/stores/appStore";
import { SIMULATION_SIZES, areasForConfig, createSimulationSession, distributeAcrossAreas, simulationDuration } from "@/lib/sessions/factory";
import { formatDuration } from "@/lib/format";
import { directionalSlide, spring } from "@/lib/animations";
import { cn } from "@/lib/utils/cn";

type Mode = "official" | "custom";

interface Draft {
  mode: Mode;
  edition: number;
  day: ExamDay;
  officialSize: number;
  areaIds: AreaId[];
  size: number;
  criteria: SimulationCriteria;
  foreignLanguage: "ingles" | "espanhol";
}

export function NewSimulationPage() {
  const params = useSearchParams();
  const router = useRouter();
  const account = useActiveAccount();
  const records = useRecords(account);
  const addSimulation = useAppStore((s) => s.addSimulation);
  const updateStudy = useAppStore((s) => s.updateStudy);
  const lightning = params.get("modo") === "relampago";

  const [step, setStep] = useState<[number, number]>([lightning ? 1 : 0, 1]);
  const [draft, setDraft] = useState<Draft>({
    mode: lightning ? "custom" : "official",
    edition: ENEM_EDITIONS[0],
    day: 1,
    officialSize: 90,
    areaIds: ["linguagens", "humanas", "natureza", "matematica"],
    size: lightning ? 10 : 30,
    criteria: "balanced",
    foreignLanguage: "ingles",
  });
  const [timerVisible, setTimerVisible] = useState(account.study.simulationTimer);
  const [creating, setCreating] = useState(false);

  const config = useMemo(
    () => ({
      mode: draft.mode,
      edition: draft.mode === "official" ? draft.edition : null,
      day: draft.mode === "official" ? draft.day : null,
      areaIds: draft.areaIds,
      size: draft.mode === "official" ? draft.officialSize : draft.size,
      foreignLanguage: draft.foreignLanguage,
      criteria: draft.criteria,
    }),
    [draft],
  );
  const areas = areasForConfig(config);
  const duration = simulationDuration(config);
  const distribution = distributeAcrossAreas(config.size, areas);
  const includesLinguagens = areas.includes("linguagens");

  const [index, dir] = step;
  const go = (to: number) => setStep([to, to > index ? 1 : -1]);
  const canContinue = draft.mode === "official" || draft.areaIds.length > 0;

  const start = () => {
    setCreating(true);
    updateStudy({ simulationTimer: timerVisible });
    const session = createSimulationSession({
      config,
      records,
      difficultSubjects: account.onboarding.difficultSubjects,
      now: Date.now(),
      timerHidden: !timerVisible,
    });
    addSimulation(session);
    router.push(`/simulados/prova/${session.id}`);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Novo simulado" title={index === 0 ? "Que tipo de simulado você quer fazer?" : index === 1 ? "Configure seu simulado" : "Antes de começar"} />

      <div className="mb-8 flex flex-wrap items-center gap-3" aria-label={`Etapa ${index + 1} de 3`}>
        {["Tipo", "Configuração", "Instruções"].map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <motion.span
              animate={{ backgroundColor: i <= index ? "var(--primary)" : "var(--surface-3)", color: i <= index ? "var(--on-primary)" : "var(--fg-subtle)" }}
              className="grid size-8 place-items-center rounded-full text-xs font-bold"
            >
              {i < index ? <CheckCircle2 className="size-4" /> : i + 1}
            </motion.span>
            <span className={cn("text-sm font-semibold", i === index ? "text-fg" : "text-fg-subtle")}>{label}</span>
            {i < 2 && (
              <span className="relative h-0.5 w-12 overflow-hidden rounded-full bg-surface-3 max-sm:hidden">
                <motion.span className="absolute inset-0 origin-left bg-primary" animate={{ scaleX: i < index ? 1 : 0 }} transition={spring.soft} />
              </span>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait" custom={dir} initial={false}>
        <motion.div key={index} custom={dir} variants={directionalSlide} initial="enter" animate="center" exit="exit">
          {index === 0 && (
            <div className="grid gap-5 md:grid-cols-2">
              <SelectableCard selected={draft.mode === "official"} onSelect={() => setDraft({ ...draft, mode: "official" })} className="p-7">
                <IconTile tone="gold" size="lg">
                  <BookCopy />
                </IconTile>
                <h3 className="mt-6 font-display text-xl font-semibold">Prova por edição</h3>
                <p className="mt-1.5 text-sm text-fg-muted">Escolha o ano e o dia da prova. Mantém a estrutura oficial: 90 questões por dia, na ordem das áreas.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge tone="neutral">Dia 1 ou Dia 2</Badge>
                  <Badge tone="neutral">Completo ou reduzido</Badge>
                </div>
              </SelectableCard>
              <SelectableCard selected={draft.mode === "custom"} onSelect={() => setDraft({ ...draft, mode: "custom" })} className="p-7">
                <IconTile tone="sage" size="lg">
                  <SlidersHorizontal />
                </IconTile>
                <h3 className="mt-6 font-display text-xl font-semibold">Simulado personalizado</h3>
                <p className="mt-1.5 text-sm text-fg-muted">Monte com as áreas que quiser, defina a quantidade e o critério de seleção das questões.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge tone="neutral">10 a 90 questões</Badge>
                  <Badge tone="neutral">Foco em dificuldades</Badge>
                </div>
              </SelectableCard>
              <div className="flex items-start gap-3 rounded-3xl border border-warning/30 bg-warning-soft p-5 md:col-span-2">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
                <p className="text-sm text-fg">
                  <strong>Conteúdo demonstrativo.</strong> O acervo oficial do INEP ainda não foi incorporado. Os simulados usam questões autorais no formato do ENEM e
                  preservam a estrutura e os filtros das provas oficiais para a integração futura.
                </p>
              </div>
            </div>
          )}

          {index === 1 && (
            <div className="grid grid-cols-12 items-start gap-6">
              <Card className="col-span-12 lg:col-span-8">
                {draft.mode === "official" ? (
                  <div className="space-y-7">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Edição">
                        {({ id }) => (
                          <Select<number>
                            id={id}
                            value={draft.edition}
                            onChange={(edition) => setDraft({ ...draft, edition })}
                            options={ENEM_EDITIONS.map((y) => ({ value: y, label: `ENEM ${y}` }))}
                          />
                        )}
                      </Field>
                      <div>
                        <p className="mb-1.5 text-[13px] font-semibold">Dia da prova</p>
                        <SegmentedControl<ExamDay>
                          ariaLabel="Dia da prova"
                          layoutId="sim-day"
                          fullWidth
                          value={draft.day}
                          onChange={(day) => setDraft({ ...draft, day })}
                          options={[
                            { value: 1, label: "Dia 1" },
                            { value: 2, label: "Dia 2" },
                          ]}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-[13px] font-semibold">Tamanho</p>
                      <SegmentedControl<number>
                        ariaLabel="Tamanho do simulado"
                        layoutId="sim-official-size"
                        value={draft.officialSize}
                        onChange={(officialSize) => setDraft({ ...draft, officialSize })}
                        options={[
                          { value: 90, label: "Completo · 90" },
                          { value: 60, label: "60" },
                          { value: 45, label: "45" },
                          { value: 30, label: "30" },
                        ]}
                      />
                      <p className="mt-2 text-xs text-fg-subtle">Versões reduzidas mantêm a proporção entre as áreas e o tempo médio por questão.</p>
                    </div>
                    <div className="rounded-3xl bg-surface-2 p-5">
                      <p className="text-sm font-semibold">Dia {draft.day} inclui</p>
                      <ul className="mt-3 space-y-2 text-sm">
                        {AREAS.filter((a) => a.day === draft.day).map((a) => (
                          <li key={a.id} className="flex items-center gap-2">
                            <CheckCircle2 className="size-4 text-sage-strong" /> {a.name}
                          </li>
                        ))}
                        {draft.day === 1 && (
                          <li className="flex items-center gap-2 text-fg-muted">
                            <NotebookPen className="size-4" /> Redação — faz parte do Dia 1, mas o editor e a correção estão fora do escopo desta versão
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-7">
                    <div>
                      <p className="mb-2.5 text-[13px] font-semibold">Áreas</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {AREAS.map((a) => {
                          const on = draft.areaIds.includes(a.id);
                          const Icon = AREA_ICON[a.id];
                          return (
                            <SelectableCard
                              key={a.id}
                              role="checkbox"
                              selected={on}
                              onSelect={() => setDraft({ ...draft, areaIds: on ? draft.areaIds.filter((x) => x !== a.id) : [...draft.areaIds, a.id] })}
                              className="p-4"
                            >
                              <div className="flex items-center gap-3 pr-8">
                                <IconTile tone={a.id} size="sm">
                                  <Icon />
                                </IconTile>
                                <span className="font-semibold">{a.shortName}</span>
                              </div>
                            </SelectableCard>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-[13px] font-semibold">Quantidade de questões</p>
                      <SegmentedControl<number>
                        ariaLabel="Quantidade"
                        layoutId="sim-size"
                        value={draft.size}
                        onChange={(size) => setDraft({ ...draft, size })}
                        options={SIMULATION_SIZES.map((n) => ({ value: n, label: String(n) }))}
                      />
                    </div>
                    <div>
                      <p className="mb-2 text-[13px] font-semibold">Critério de seleção</p>
                      <SegmentedControl<SimulationCriteria>
                        ariaLabel="Critério"
                        layoutId="sim-criteria"
                        value={draft.criteria}
                        onChange={(criteria) => setDraft({ ...draft, criteria })}
                        options={[
                          { value: "balanced", label: "Equilibrado" },
                          { value: "weak", label: "Foco em dificuldades" },
                          { value: "random", label: "Aleatório" },
                        ]}
                      />
                      <p className="mt-2 text-xs text-fg-subtle">
                        {draft.criteria === "weak"
                          ? "Cerca de 60% das questões virão dos assuntos com menor acerto e das matérias marcadas como difíceis."
                          : draft.criteria === "random"
                            ? "Sorteio simples dentro das áreas escolhidas."
                            : "Prioriza questões inéditas, distribuídas entre as matérias de cada área."}
                      </p>
                    </div>
                  </div>
                )}

                {includesLinguagens && (
                  <div className="mt-7 border-t border-border pt-6">
                    <p className="mb-2 text-[13px] font-semibold">Língua estrangeira</p>
                    <div className="flex gap-2">
                      {(["ingles", "espanhol"] as const).map((l) => (
                        <Chip key={l} selected={draft.foreignLanguage === l} onToggle={() => setDraft({ ...draft, foreignLanguage: l })} tone="ink">
                          {l === "ingles" ? "Inglês" : "Espanhol"}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              <SummaryCard size={config.size} duration={duration} distribution={distribution} areas={areas} />
            </div>
          )}

          {index === 2 && (
            <div className="grid grid-cols-12 items-start gap-6">
              <Card className="col-span-12 lg:col-span-8" padded="lg">
                <CardHeader
                  title="Instruções e regras"
                  icon={
                    <IconTile tone="ink">
                      <Info />
                    </IconTile>
                  }
                />
                <ol className="space-y-4">
                  {[
                    { icon: ListOrdered, t: `Você terá ${config.size} questões objetivas, numeradas como na prova${config.mode === "official" && config.day === 2 ? " (a partir da 91)" : ""}.` },
                    { icon: Clock, t: `O tempo total é de ${formatDuration(duration)}. Ao chegar a zero, o simulado é encerrado automaticamente e as questões em branco contam como erro.` },
                    { icon: CheckCircle2, t: "Você pode alterar suas respostas à vontade até finalizar. O gabarito só aparece no resultado." },
                    { icon: Pause, t: "É possível pausar. Ao sair da tela, o cronômetro é pausado e o simulado fica salvo para continuar depois." },
                    { icon: Timer, t: "Faltando 15 minutos, o cronômetro muda de cor para avisar discretamente." },
                  ].map((r, i) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.07 }} className="flex items-start gap-3.5">
                      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-surface-2 text-fg-muted">
                        <r.icon className="size-4" />
                      </span>
                      <p className="pt-1 text-[15px] leading-relaxed">{r.t}</p>
                    </motion.li>
                  ))}
                </ol>
                <div className="mt-7 border-t border-border pt-6">
                  <Switch checked={timerVisible} onChange={setTimerVisible} label="Mostrar cronômetro durante a prova" description="Você pode ocultá-lo ou exibi-lo a qualquer momento." />
                </div>
              </Card>
              <SummaryCard size={config.size} duration={duration} distribution={distribution} areas={areas} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
        <Button variant="ghost" icon={ArrowLeft} onClick={() => (index === 0 ? router.push("/simulados") : go(index - 1))}>
          {index === 0 ? "Cancelar" : "Voltar"}
        </Button>
        {index < 2 ? (
          <Button iconRight={ArrowRight} onClick={() => go(index + 1)} disabled={!canContinue}>
            Continuar
          </Button>
        ) : (
          <Button variant="accent" size="lg" icon={Play} onClick={start} loading={creating}>
            Iniciar simulado
          </Button>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ size, duration, distribution, areas }: { size: number; duration: number; distribution: Record<AreaId, number>; areas: AreaId[] }) {
  return (
    <Card surface="ink" className="col-span-12 lg:sticky lg:top-24 lg:col-span-4">
      <p className="text-xs font-bold tracking-[0.1em] text-gold uppercase">Resumo</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-ink-raised p-4">
          <p className="text-xs text-on-ink-muted">Questões</p>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p key={size} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="font-display text-3xl font-bold tabular">
              {size}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="rounded-2xl bg-ink-raised p-4">
          <p className="text-xs text-on-ink-muted">Duração</p>
          <p className="mt-1 font-display text-xl font-bold">{formatDuration(duration, { compact: true })}</p>
        </div>
      </div>
      <ul className="mt-5 space-y-3">
        {areas.map((a) => {
          const Icon = AREA_ICON[a];
          return (
            <li key={a} className="flex items-center gap-3 text-sm">
              <Icon className="size-4 text-gold" />
              <span className="flex-1 text-on-ink-muted">{AREA_BY_ID[a].shortName}</span>
              <span className="font-bold tabular">{distribution[a]}</span>
            </li>
          );
        })}
        {areas.length === 0 && <li className="text-sm text-on-ink-muted">Selecione pelo menos uma área.</li>}
      </ul>
    </Card>
  );
}
