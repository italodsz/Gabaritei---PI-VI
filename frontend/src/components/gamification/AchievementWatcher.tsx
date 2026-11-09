"use client";

import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ParticleBurst } from "@/components/animations/Celebration";
import { Medal, TIER_LABEL } from "./Medal";
import { useActiveAccount, useRecords } from "@/hooks/useAccount";
import { useNow } from "@/hooks/useNow";
import { useAppStore } from "@/stores/appStore";
import { evaluateAchievements } from "@/lib/calculations/achievements";
import { medalReveal } from "@/lib/animations";

/**
 * Observa as conquistas derivadas das atividades e celebra, uma de cada vez,
 * as recém-desbloqueadas (ainda não exibidas).
 */
export function AchievementWatcher() {
  const account = useActiveAccount();
  const records = useRecords(account);
  const now = useNow(60000);
  const markCelebrated = useAppStore((s) => s.markCelebrated);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const pending = useMemo(
    () =>
      evaluateAchievements({ records, account, now }).filter(
        (a) => a.unlocked && !account.celebratedAchievements.includes(a.id) && !dismissed.includes(a.id),
      ),
    [records, account, now, dismissed],
  );

  const current = pending[0];
  const close = () => {
    if (!current) return;
    setDismissed((d) => [...d, current.id]);
    markCelebrated([current.id]);
  };

  return (
    <Modal open={!!current} onClose={close} size="sm" hideClose>
      {current && (
        <div key={current.id} className="relative flex flex-col items-center pt-2 text-center">
          <div className="relative grid h-40 w-full place-items-center">
            <ParticleBurst count={22} radius={120} seed={current.id.length} />
            <motion.div
              aria-hidden
              className="absolute size-36 rounded-full bg-gold-soft"
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
            />
            <motion.div variants={medalReveal} initial="hidden" animate="show" className="relative">
              <Medal icon={current.icon} tier={current.tier} size={92} shine />
            </motion.div>
          </div>
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-3 text-xs font-bold tracking-[0.12em] text-gold-fg uppercase">
            Conquista desbloqueada · {TIER_LABEL[current.tier]}
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }} className="mt-1.5 font-display text-2xl font-bold tracking-tight">
            {current.title}
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-2 max-w-xs text-sm text-fg-muted">
            {current.description}
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6 w-full">
            <Button variant="accent" fullWidth onClick={close} data-autofocus>
              {pending.length > 1 ? `Continuar (${pending.length - 1} nova${pending.length > 2 ? "s" : ""})` : "Continuar estudando"}
            </Button>
          </motion.div>
        </div>
      )}
    </Modal>
  );
}
