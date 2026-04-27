"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type NavItemSize = "sm" | "md";

interface NavItemProps {
  href: string;
  label: string;
  icon?: ReactNode;
  size?: NavItemSize;
  matchExact?: boolean;
  className?: string;
}

const SIZE: Record<NavItemSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-3 py-1.5 text-sm",
};

export function NavItem({
  href,
  label,
  icon,
  size = "md",
  matchExact,
  className = "",
}: NavItemProps) {
  const pathname = usePathname();
  const exact = matchExact ?? href === "/";
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  const base = `flex items-center gap-1.5 rounded-lg font-medium transition-colors ${SIZE[size]}`;
  const state = isActive
    ? "bg-amber-50 text-amber-700"
    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700";

  return (
    <Link href={href} className={`${base} ${state} ${className}`.trim()}>
      {icon}
      {label}
    </Link>
  );
}
