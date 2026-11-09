"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "@/components/icons";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { modalVariants, overlayVariants } from "@/lib/animations";
import { cn } from "@/lib/utils/cn";
import { Button, type ButtonVariant } from "./Button";

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  /** impede fechar clicando fora (ex.: confirmações críticas) */
  dismissible?: boolean;
  className?: string;
  hideClose?: boolean;
}

/** Modal acessível: foco preso, Esc para fechar, retorno de foco, rolagem bloqueada. */
export function Modal({ open, onClose, title, description, children, footer, size = "md", dismissible = true, className, hideClose }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const raf = requestAnimationFrame(() => {
      const first = panelRef.current?.querySelector<HTMLElement>("[data-autofocus]") ?? panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? panelRef.current)?.focus();
    });
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissible) {
        e.stopPropagation();
        onCloseRef.current();
      }
      if (e.key === "Tab" && panelRef.current) {
        const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prevOverflow;
      previous?.focus?.();
    };
  }, [open, dismissible]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="absolute inset-0 bg-overlay backdrop-blur-[3px]"
            onClick={dismissible ? onClose : undefined}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            variants={modalVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className={cn(
              "relative max-h-[calc(100dvh-2rem)] w-full overflow-y-auto rounded-[var(--radius-panel)] border border-border bg-surface p-7 shadow-lg outline-none",
              size === "sm" && "max-w-md",
              size === "md" && "max-w-lg",
              size === "lg" && "max-w-2xl",
              size === "xl" && "max-w-4xl",
              className,
            )}
          >
            {!hideClose && dismissible && (
              <button
                type="button"
                onClick={onClose}
                className="absolute top-5 right-5 grid size-9 place-items-center rounded-xl text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
                aria-label="Fechar"
              >
                <X className="size-[18px]" />
              </button>
            )}
            {title && (
              <h2 id={titleId} className="pr-10 font-display text-xl font-semibold tracking-tight text-balance">
                {title}
              </h2>
            )}
            {description && (
              <div id={descId} className="mt-1.5 text-sm leading-relaxed text-fg-muted">
                {description}
              </div>
            )}
            {children && <div className={cn(title || description ? "mt-5" : "")}>{children}</div>}
            {footer && <div className="mt-7 flex flex-wrap items-center justify-end gap-2.5">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "primary",
  icon,
  children,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ButtonVariant;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={
        <span className="flex flex-col gap-4">
          {icon}
          {title}
        </span>
      }
      description={description}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} data-autofocus>
            {cancelLabel}
          </Button>
          <Button variant={tone} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
