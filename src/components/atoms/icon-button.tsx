"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { LoadingSpinner } from "./loading-spinner";

type IconButtonVariant = "default" | "active-amber" | "active-red";
type IconButtonSize = "sm" | "md";

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  isLoading?: boolean;
  label?: string;
}

const variantStyles: Record<IconButtonVariant, string> = {
  default: "text-slate-400 hover:text-amber-500",
  "active-amber": "text-amber-500",
  "active-red": "text-red-500",
};

const sizeStyles: Record<IconButtonSize, { button: string; icon: string }> = {
  sm: { button: "p-1", icon: "h-4 w-4" },
  md: { button: "p-1.5", icon: "h-5 w-5" },
};

export function IconButton({
  icon,
  variant = "default",
  size = "md",
  isLoading,
  disabled,
  label,
  className = "",
  ...props
}: IconButtonProps) {
  const sizing = sizeStyles[size];

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={isLoading || disabled}
      className={`rounded-full bg-white/80 ${sizing.button} backdrop-blur-sm transition-all hover:bg-white hover:scale-110 disabled:cursor-default disabled:hover:scale-100 disabled:opacity-60 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      <span className={`flex items-center justify-center ${sizing.icon}`}>
        {isLoading ? <LoadingSpinner size="sm" /> : icon}
      </span>
    </button>
  );
}
