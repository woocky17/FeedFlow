import { HTMLAttributes } from "react";

export type CardVariant = "default" | "dashed" | "interactive" | "link";
export type CardPadding = "none" | "sm" | "md" | "lg";
export type CardTone = "slate" | "amber" | "red" | "indigo";
export type CardRadius = "lg" | "xl" | "2xl";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  tone?: CardTone;
  radius?: CardRadius;
}

const TONE_BG: Record<CardTone, string> = {
  slate: "bg-white",
  amber: "bg-amber-50/50",
  red: "bg-red-50/50",
  indigo: "bg-indigo-50/50",
};

const TONE_BORDER: Record<CardTone, string> = {
  slate: "border-slate-200",
  amber: "border-amber-200",
  red: "border-red-200",
  indigo: "border-indigo-200",
};

const VARIANT_EXTRA: Record<CardVariant, string> = {
  default: "",
  dashed: "border-dashed",
  interactive: "transition-colors hover:border-amber-200",
  link: "transition-all hover:border-amber-300 hover:shadow-lg hover:shadow-slate-200/50",
};

const RADIUS: Record<CardRadius, string> = {
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
};

const PADDINGS: Record<CardPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-8",
};

export function cardClassName({
  variant = "default",
  padding = "md",
  tone = "slate",
  radius = "2xl",
  extra = "",
}: {
  variant?: CardVariant;
  padding?: CardPadding;
  tone?: CardTone;
  radius?: CardRadius;
  extra?: string;
} = {}): string {
  return `${RADIUS[radius]} ${TONE_BG[tone]} border ${TONE_BORDER[tone]} ${VARIANT_EXTRA[variant]} ${PADDINGS[padding]} ${extra}`
    .replace(/\s+/g, " ")
    .trim();
}

export function Card({
  variant = "default",
  padding = "md",
  tone = "slate",
  radius = "2xl",
  className = "",
  ...rest
}: CardProps) {
  return (
    <div className={cardClassName({ variant, padding, tone, radius, extra: className })} {...rest} />
  );
}
