"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

type FilterPillColor = "amber" | "red";

interface FilterPillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  color?: FilterPillColor;
  icon?: ReactNode;
}

const activeStyles: Record<FilterPillColor, string> = {
  amber: "bg-amber-500 text-white shadow-sm",
  red: "bg-red-500 text-white shadow-sm",
};

const inactiveStyles: Record<FilterPillColor, string> = {
  amber: "bg-white text-slate-500 border border-slate-200 hover:border-amber-300",
  red: "bg-white text-slate-500 border border-slate-200 hover:border-red-300",
};

export function FilterPill({
  active = false,
  color = "amber",
  icon,
  children,
  className = "",
  ...props
}: FilterPillProps) {
  const style = active ? activeStyles[color] : inactiveStyles[color];
  return (
    <button
      type="button"
      className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${style} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
