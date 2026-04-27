"use client";

import { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export function Select({ hasError, className = "", children, ...props }: SelectProps) {
  const base =
    "w-full rounded-xl bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:ring-2";
  const state = hasError
    ? "border border-red-400 focus:border-red-500 focus:ring-red-400/20"
    : "border border-slate-200 focus:border-amber-400 focus:ring-amber-400/20";

  return (
    <select className={`${base} ${state} ${className}`} {...props}>
      {children}
    </select>
  );
}
