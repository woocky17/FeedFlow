"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`text-sm transition-colors hover:text-gray-900 ${
        isActive ? "font-semibold text-gray-900" : "text-gray-500"
      }`}
    >
      {children}
    </Link>
  );
}
