"use client";

import Link from "next/link";
import { motion, type HTMLMotionProps } from "motion/react";
import { Loader2, type Icon } from "@/components/icons";
import { forwardRef } from "react";
import { spring } from "@/lib/animations";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "accent" | "secondary" | "ghost" | "danger" | "soft" | "on-ink";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary shadow-sm hover:bg-primary-hover hover:shadow-md disabled:bg-surface-3 disabled:text-fg-subtle disabled:shadow-none",
  accent:
    "bg-gold text-on-gold shadow-sm hover:brightness-[1.04] disabled:bg-surface-3 disabled:text-fg-subtle disabled:shadow-none",
  secondary:
    "bg-surface text-fg border border-border shadow-xs hover:border-border-strong hover:bg-surface-2 disabled:text-fg-subtle",
  soft: "bg-surface-2 text-fg hover:bg-surface-3 disabled:text-fg-subtle",
  ghost: "text-fg-muted hover:text-fg hover:bg-surface-2 disabled:text-fg-subtle",
  danger: "bg-danger text-on-status shadow-sm hover:brightness-110 disabled:opacity-50",
  "on-ink": "bg-ink-raised-strong text-on-ink border border-ink-line hover:bg-ink-raised-hover",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5 rounded-xl",
  md: "h-11 px-5 text-sm gap-2 rounded-2xl",
  lg: "h-13 px-6 text-[15px] gap-2.5 rounded-2xl",
};

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    "relative inline-flex select-none items-center justify-center font-semibold whitespace-nowrap transition-[background-color,box-shadow,color,border-color,filter] duration-200 ease-out-soft outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: Icon;
  iconRight?: Icon;
  loading?: boolean;
  fullWidth?: boolean;
}

export type ButtonProps = CommonProps & Omit<HTMLMotionProps<"button">, "children"> & { children?: React.ReactNode };

function Content({ icon: Icon, iconRight: IconRight, loading, children, size }: CommonProps & { children?: React.ReactNode }) {
  const iconSize = size === "sm" ? "size-4" : "size-[18px]";
  return (
    <>
      {loading ? (
        <Loader2 className={cn(iconSize, "animate-spin")} aria-hidden />
      ) : (
        Icon && <Icon className={iconSize} aria-hidden />
      )}
      {children}
      {IconRight && !loading && <IconRight className={iconSize} aria-hidden />}
    </>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", icon, iconRight, loading, fullWidth, className, children, disabled, type = "button", ...rest },
  ref,
) {
  const inactive = disabled || loading;
  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={inactive}
      aria-busy={loading || undefined}
      whileHover={inactive ? undefined : { y: -1 }}
      whileTap={inactive ? undefined : { scale: 0.97 }}
      transition={spring.snappy}
      className={buttonClasses(variant, size, cn(fullWidth && "w-full", className))}
      {...rest}
    >
      <Content icon={icon} iconRight={iconRight} loading={loading} size={size}>
        {children}
      </Content>
    </motion.button>
  );
});

const MotionLink = motion.create(Link);

export interface ButtonLinkProps extends CommonProps {
  href: string;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  "aria-label"?: string;
}

export function ButtonLink({ href, variant = "primary", size = "md", icon, iconRight, fullWidth, className, children, ...rest }: ButtonLinkProps) {
  return (
    <MotionLink
      href={href}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={spring.snappy}
      className={buttonClasses(variant, size, cn(fullWidth && "w-full", className))}
      {...rest}
    >
      <Content icon={icon} iconRight={iconRight} size={size}>
        {children}
      </Content>
    </MotionLink>
  );
}

interface IconButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  icon: Icon;
  label: string;
  variant?: "ghost" | "soft" | "secondary" | "on-ink" | "active";
  size?: "sm" | "md";
  showTooltip?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon: Icon, label, variant = "ghost", size = "md", className, showTooltip = true, ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type="button"
      aria-label={label}
      title={showTooltip ? label : undefined}
      whileTap={{ scale: 0.92 }}
      transition={spring.snappy}
      className={cn(
        "relative grid shrink-0 place-items-center rounded-xl transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-40",
        size === "sm" ? "size-8" : "size-10",
        variant === "ghost" && "text-fg-muted hover:bg-surface-2 hover:text-fg",
        variant === "soft" && "bg-surface-2 text-fg hover:bg-surface-3",
        variant === "secondary" && "border border-border bg-surface text-fg hover:bg-surface-2",
        variant === "on-ink" && "text-on-ink-muted hover:bg-ink-raised-strong hover:text-on-ink",
        variant === "active" && "bg-gold-soft text-gold-fg",
        className,
      )}
      {...rest}
    >
      <Icon className={size === "sm" ? "size-4" : "size-[18px]"} aria-hidden />
    </motion.button>
  );
});
