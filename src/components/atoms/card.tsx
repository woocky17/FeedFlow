import { HTMLAttributes } from "react";

export type CardVariant = "default" | "dashed" | "interactive" | "link";
export type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
}

const VARIANTS: Record<CardVariant, string> = {
  default: "border border-slate-200",
  dashed: "border border-dashed border-slate-200",
  interactive: "border border-slate-200 transition-colors hover:border-amber-200",
  link: "border border-slate-200 transition-all hover:border-amber-300 hover:shadow-lg hover:shadow-slate-200/50",
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
  extra = "",
}: { variant?: CardVariant; padding?: CardPadding; extra?: string } = {}): string {
  return `rounded-2xl bg-white ${VARIANTS[variant]} ${PADDINGS[padding]} ${extra}`.trim();
}

export function Card({
  variant = "default",
  padding = "md",
  className = "",
  ...rest
}: CardProps) {
  return <div className={cardClassName({ variant, padding, extra: className })} {...rest} />;
}
