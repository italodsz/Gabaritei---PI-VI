"use client";

import { motion } from "motion/react";
import { CheckCircle2, Pencil, Target } from "@/components/icons";
import { useMemo, useState } from "react";
import type { PersonalGoal } from "@/types";
import { Card, CardHeader, IconTile } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ProgressRing } from "@/components/ui/Progress";
import { Stepper, Switch } from "@/components/ui/Form";
import { ParticleBurst } from "@/components/animations/Celebration";
import { useActiveAccount, useRecords } from "@/hooks/useAccount";
import { useNow } from "@/hooks/useNow";
import { useAppStore } from "@/stores/appStore";
import { GOAL_META, goalProgress } from "@/lib/calculations/goals";
import { toast } from "@/components/ui/Toast";
import { spring } from "@/lib/animations";

/** Metas pessoais com progresso derivado das atividades e edição em modal. */
export function GoalsCard({ className }: { className?: string }) {
  const account = useActiveAccount();
  const records = useRecords(account);
  const now = useNow(60000);
  const setGoals = useAppStore((s) => s.setGoals);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<PersonalGoal[]>(account.goals);

  const progress = useMemo(() => account.goals.filter((g) => g.enabled).map((g) => goalProgress(g, records, account, now)), [account, records, now]);

  return (
    <Card className={className}>
      <CardHeader
        title="Metas pessoais"
        description="Progresso calculado a partir das suas atividades"
        icon={
          <IconTile tone="gold">
            <Target />
          </IconTile>
        }
        action={
          <Button
            variant="ghost"
            size="sm"
            icon={Pencil}
            onClick={() => {
              setDraft(account.goals.map((g) => ({ ...g })));
              setEditing(true);
            }}
          >
            Editar
          </Button>
        }
      />
      {progress.length === 0 ? (
        <p className="rounded-2xl bg-surface-2 p-4 text-sm text-fg-muted">Nenhuma meta ativa. Use “Editar” para definir suas metas.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {progress.map((p, i) => {
            const meta = GOAL_META[p.goal.kind];
            return (
              <motion.div key={p.goal.kind} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }} className="relative flex flex-col items-center rounded-3xl bg-surface-2/70 p-4 text-center">
                {p.done && <ParticleBurst count={10} radius={60} seed={i + 3} />}
                <ProgressRing value={p.progress} size={88} stroke={8} tone={p.done ? "sage" : "gold"} label={`${meta.title}: ${meta.format(p.current)} de ${meta.format(p.goal.target)}`}>
                  {p.done ? (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring.bouncy}>
                      <CheckCircle2 className="size-7 text-sage-strong" />
                    </motion.span>
                  ) : (
                    <span className="font-display text-lg font-bold tabular">{p.pendingReason ? "—" : meta.format(p.current)}</span>
                  )}
                </ProgressRing>
                <p className="mt-3 text-sm leading-tight font-semibold">{meta.title}</p>
                <p className="mt-1 text-xs text-fg-subtle">{p.pendingReason ?? `${meta.format(p.current)} de ${meta.format(p.goal.target)}`}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title="Editar metas"
        description="Defina metas realistas. O progresso é recalculado automaticamente com base nas suas atividades."
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
            <Button
              variant="accent"
              onClick={() => {
                setGoals(draft);
                setEditing(false);
                toast.success("Metas atualizadas");
              }}
            >
              Salvar metas
            </Button>
          </>
        }
      >
        <ul className="divide-y divide-border">
          {draft.map((g, i) => {
            const meta = GOAL_META[g.kind];
            return (
              <li key={g.kind} className="space-y-3 py-4">
                <Switch checked={g.enabled} onChange={(v) => setDraft(draft.map((d, j) => (j === i ? { ...d, enabled: v } : d)))} label={meta.title} description={meta.description} />
                {g.enabled && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-fg-muted">Meta</span>
                    <Stepper
                      label={meta.title}
                      value={g.target}
                      min={meta.min}
                      max={meta.max}
                      step={meta.step}
                      format={meta.format}
                      onChange={(target) => setDraft(draft.map((d, j) => (j === i ? { ...d, target } : d)))}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Modal>
    </Card>
  );
}
