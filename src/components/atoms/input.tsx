"use client";

import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export function Input({ hasError, className = "", ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 ${
        hasError ? "border-red-500" : "border-gray-300"
      } ${className}`}
      {...props}
    />
  );
}
