"use client";

import { ButtonHTMLAttributes } from "react";
import { LoadingSpinner } from "./loading-spinner";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "primary-gradient";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
  "primary-gradient":
    "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm hover:from-amber-600 hover:to-orange-600",
};

export function Button({
  variant = "primary",
  isLoading,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={isLoading || disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${className}`}
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
