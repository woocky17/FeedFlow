"use client";

import { ButtonHTMLAttributes } from "react";
import { LoadingSpinner } from "./loading-spinner";

type ButtonVariant = "primary-gradient" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  "primary-gradient":
    "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm hover:shadow-md hover:brightness-110 active:scale-[0.98]",
  secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  danger: "bg-red-500 text-white hover:bg-red-600",
  ghost: "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
};

export function Button({
  variant = "primary-gradient",
  size = "md",
  isLoading,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={isLoading || disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" color={variant === "secondary" || variant === "ghost" ? "slate" : "white"} />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
