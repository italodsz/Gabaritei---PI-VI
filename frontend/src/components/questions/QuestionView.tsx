"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Expand, Minus, Plus, X } from "@/components/icons";
import { useState } from "react";
import type { AlternativeLetter, Question } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { SUBJECT_BY_ID, TOPIC_BY_ID, SUBTOPIC_NAME, AREA_BY_ID } from "@/data/fixtures/taxonomy";
import { DIFFICULTY_LABEL, SUBJECT_ICON } from "./subjectMeta";
import { pop, spring } from "@/lib/animations";
import { cn } from "@/lib/utils/cn";

/* ------------------------------------------------------------------ */
/* Cabeçalho com origem, matéria e assunto                             */
/* ------------------------------------------------------------------ */

export function QuestionMeta({ question, number, compact }: { question: Question; number?: string; compact?: boolean }) {
  const Icon = SUBJECT_ICON[question.subjectId];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {number && <span className="mr-1 font-display text-lg font-bold tabular">{number}</span>}
      <Badge tone={question.areaId} icon={<Icon />}>
        {SUBJECT_BY_ID[question.subjectId].name}
      </Badge>
      {!compact && (
        <Badge tone="neutral">
          {TOPIC_BY_ID[question.topicId]?.name}
          {question.subtopicId && SUBTOPIC_NAME[question.subtopicId] ? ` · ${SUBTOPIC_NAME[question.subtopicId]}` : ""}
        </Badge>
      )}
      <Badge tone="outline" className="ml-auto" size="sm">
        Questão demonstrativa · ref. {question.year}
      </Badge>
      {!compact && (
        <Badge tone="outline" size="sm">
          {DIFFICULTY_LABEL[question.difficulty]}
        </Badge>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Enunciado                                                           */
/* ------------------------------------------------------------------ */

export function QuestionBody({ question, large }: { question: Question; large?: boolean }) {
  const [zoom, setZoom] = useState(false);
  return (
    <div className={cn("space-y-5", large ? "text-[19px] leading-[1.75]" : "text-[16.5px] leading-[1.7]")}>
      {question.support && (
        <div className="space-y-3 text-fg">
          {question.support.paragraphs.map((p, i) => (
            <p key={i} className="text-pretty whitespace-pre-line">
              {p}
            </p>
          ))}
          {question.support.credit && <p className="text-xs text-fg-subtle italic">{question.support.credit}</p>}
        </div>
      )}
      {question.image && (
        <figure className="overflow-hidden rounded-3xl border border-border bg-figure">
          <button type="button" onClick={() => setZoom(true)} className="group relative block w-full cursor-zoom-in" aria-label={`Ampliar imagem: ${question.image.alt}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={question.image.src} alt={question.image.alt} width={question.image.width} height={question.image.height} className="mx-auto h-auto max-h-[340px] w-auto" />
            <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-xl bg-ink px-2.5 py-1.5 text-xs font-semibold text-on-ink opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <Expand className="size-3.5" /> Ampliar
            </span>
          </button>
          {question.image.caption && <figcaption className="border-t border-border bg-surface px-4 py-2.5 text-xs text-fg-muted">{question.image.caption}</figcaption>}
          <ImageLightbox open={zoom} onClose={() => setZoom(false)} image={question.image} />
        </figure>
      )}
      <p className="font-semibold text-fg text-pretty">{question.prompt}</p>
    </div>
  );
}

function ImageLightbox({ open, onClose, image }: { open: boolean; onClose: () => void; image: NonNullable<Question["image"]> }) {
  const [scale, setScale] = useState(1);
  return (
    <Modal open={open} onClose={() => { setScale(1); onClose(); }} size="xl" title="Imagem da questão" description={image.caption}>
      <div className="relative overflow-hidden rounded-3xl border border-border bg-figure">
        <motion.div
          drag={scale > 1}
          dragConstraints={{ left: -300, right: 300, top: -200, bottom: 200 }}
          dragElastic={0.1}
          animate={{ scale }}
          transition={spring.soft}
          className={cn("origin-center", scale > 1 ? "cursor-grab active:cursor-grabbing" : "")}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.src} alt={image.alt} className="mx-auto h-auto max-h-[64vh] w-full object-contain" draggable={false} />
        </motion.div>
        <div className="absolute right-3 bottom-3 flex items-center gap-1 rounded-2xl bg-surface p-1 shadow-md">
          <button type="button" className="grid size-9 place-items-center rounded-xl hover:bg-surface-2 disabled:opacity-40" onClick={() => setScale((s) => Math.max(1, s - 0.5))} disabled={scale <= 1} aria-label="Diminuir zoom">
            <Minus className="size-4" />
          </button>
          <span className="w-12 text-center text-xs font-bold tabular">{Math.round(scale * 100)}%</span>
          <button type="button" className="grid size-9 place-items-center rounded-xl hover:bg-surface-2 disabled:opacity-40" onClick={() => setScale((s) => Math.min(3, s + 0.5))} disabled={scale >= 3} aria-label="Aumentar zoom">
            <Plus className="size-4" />
          </button>
        </div>
      </div>
      <p className="mt-3 text-xs text-fg-subtle">{image.alt}</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Alternativas                                                        */
/* ------------------------------------------------------------------ */

export type AlternativeMode = "practice" | "exam" | "review";

export function AlternativeList({
  question,
  selected,
  revealed,
  onSelect,
  mode,
  disabled,
  large,
}: {
  question: Question;
  selected: AlternativeLetter | null;
  /** quando true, mostra a correta e diferencia a seleção errada */
  revealed: boolean;
  onSelect?: (l: AlternativeLetter) => void;
  mode: AlternativeMode;
  disabled?: boolean;
  large?: boolean;
}) {
  const quiet = mode === "exam";
  return (
    <div role="radiogroup" aria-label="Alternativas" className="space-y-2.5">
      {question.alternatives.map((alt, i) => {
        const isSel = selected === alt.letter;
        const isCorrect = revealed && alt.letter === question.correct;
        const isWrong = revealed && isSel && !isCorrect;
        const dim = revealed && !isCorrect && !isWrong;
        const state = isCorrect ? "correct" : isWrong ? "wrong" : isSel ? "selected" : "idle";
        return (
          <motion.button
            key={alt.letter}
            type="button"
            role="radio"
            aria-checked={isSel}
            aria-describedby={isCorrect ? `alt-state-${alt.letter}` : undefined}
            disabled={disabled}
            onClick={() => onSelect?.(alt.letter)}
            initial={quiet ? false : { opacity: 0, y: 10 }}
            animate={{
              opacity: dim ? 0.55 : 1,
              y: 0,
              ...(isCorrect && mode === "practice" ? pop : {}),
            }}
            transition={quiet ? { duration: 0.15 } : { delay: revealed ? 0 : 0.04 * i, ...spring.soft }}
            whileHover={disabled || revealed ? undefined : { x: quiet ? 0 : 3 }}
            whileTap={disabled || revealed ? undefined : { scale: 0.99 }}
            className={cn(
              "group relative flex w-full items-start gap-4 rounded-3xl border-2 text-left transition-[border-color,background-color,box-shadow] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-default",
              large ? "p-5" : "p-4",
              state === "idle" && "border-border bg-surface hover:border-border-strong hover:shadow-sm",
              state === "selected" && (quiet ? "border-primary bg-surface-2" : "border-gold-strong bg-gold-soft/70 shadow-sm"),
              state === "correct" && "border-success bg-success-soft",
              state === "wrong" && "border-danger bg-danger-soft",
            )}
          >
            <span
              className={cn(
                "relative grid size-9 shrink-0 place-items-center rounded-2xl text-sm font-bold transition-colors duration-200",
                state === "idle" && "bg-surface-2 text-fg-muted group-hover:bg-surface-3 group-hover:text-fg",
                state === "selected" && (quiet ? "bg-primary text-on-primary" : "bg-gold text-on-gold"),
                state === "correct" && "bg-success text-on-status",
                state === "wrong" && "bg-danger text-on-status",
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={state === "correct" ? "c" : state === "wrong" ? "w" : "l"} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={spring.snappy}>
                  {state === "correct" ? <Check className="size-4" strokeWidth={3} /> : state === "wrong" ? <X className="size-4" strokeWidth={3} /> : alt.letter}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className={cn("flex-1 pt-1.5 text-fg", large ? "text-[18px] leading-relaxed" : "text-[15.5px] leading-relaxed")}>{alt.text}</span>
            {(isCorrect || isWrong || (revealed && isSel)) && (
              <span id={`alt-state-${alt.letter}`} className={cn("shrink-0 self-center rounded-full px-2.5 py-1 text-xs font-bold", isCorrect ? "bg-success text-on-status" : "bg-danger text-on-status")}>
                {isCorrect ? (isSel ? "Sua resposta · correta" : "Correta") : "Sua resposta"}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export function areaLabel(question: Question) {
  return AREA_BY_ID[question.areaId].shortName;
}
