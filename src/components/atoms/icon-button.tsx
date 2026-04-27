"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { LoadingSpinner } from "./loading-spinner";

type IconButtonAppearance = "overlay" | "subtle";
type IconButtonTone = "neutral" | "amber" | "red";
type IconButtonSize = "sm" | "md";

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: ReactNode;
  appearance?: IconButtonAppearance;
  tone?: IconButtonTone;
  size?: IconButtonSize;
  isLoading?: boolean;
  label?: string;
}

const APPEARANCE: Record<IconButtonAppearance, string> = {
  overlay:
    "rounded-full bg-white/80 backdrop-blur-sm transition-all hover:bg-white hover:scale-110",
  subtle: "rounded-lg transition-colors",
};

const TONE: Record<IconButtonAppearance, Record<IconButtonTone, string>> = {
  overlay: {
    neutral: "text-slate-400 hover:text-slate-600",
    amber: "text-amber-500",
    red: "text-red-500",
  },
  subtle: {
    neutral: "text-slate-400 hover:bg-slate-100 hover:text-slate-600",
    amber: "text-slate-400 hover:bg-amber-50 hover:text-amber-600",
    red: "text-slate-400 hover:bg-red-50 hover:text-red-500",
  },
};

const SIZE: Record<IconButtonSize, { padding: string; icon: string }> = {
  sm: { padding: "p-1", icon: "h-4 w-4" },
  md: { padding: "p-1.5", icon: "h-5 w-5" },
};

export function IconButton({
  icon,
  appearance = "subtle",
  tone = "neutral",
  size = "md",
  isLoading,
  disabled,
  label,
  className = "",
  ...props
}: IconButtonProps) {
  const sizing = SIZE[size];

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={isLoading || disabled}
      className={`${APPEARANCE[appearance]} ${TONE[appearance][tone]} ${sizing.padding} disabled:cursor-default disabled:opacity-60 ${className}`}
      {...props}
    >
      <span className={`flex items-center justify-center ${sizing.icon}`}>
        {isLoading ? <LoadingSpinner size="sm" /> : icon}
      </span>
    </button>
  );
}
