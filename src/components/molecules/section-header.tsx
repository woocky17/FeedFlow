import { ReactNode } from "react";

interface SectionHeaderProps {
  children: ReactNode;
  className?: string;
}

export function SectionHeader({ children, className = "" }: SectionHeaderProps) {
  return (
    <h2 className={`text-sm font-semibold uppercase tracking-wider text-slate-400 ${className}`}>
      {children}
    </h2>
  );
}
