import { HTMLAttributes } from "react";

type CardVariant = "default" | "dashed" | "interactive";
type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
}

const VARIANTS: Record<CardVariant, string> = {
  default: "border border-slate-200",
  dashed: "border border-dashed border-slate-200",
  interactive: "border border-slate-200 transition-colors hover:border-amber-200",
};

const PADDINGS: Record<CardPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-8",
};

export function Card({
  variant = "default",
  padding = "md",
  className = "",
  ...rest
}: CardProps) {
  return (
    <div
      className={`rounded-2xl bg-white ${VARIANTS[variant]} ${PADDINGS[padding]} ${className}`}
      {...rest}
    />
  );
}
