"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms/button";
import { Icon, IconName } from "@/components/atoms/icon";
import { LanguageSwitcher } from "@/components/atoms/language-switcher";
import { LinkButton } from "@/components/atoms/link-button";
import { Logo } from "@/components/atoms/logo";
import { NavItem } from "@/components/molecules/nav-item";

interface NavConfig {
  href: string;
  labelKey: "feed" | "stories" | "categories" | "sources" | "notifications" | "settings";
  icon: IconName;
  adminOnly: boolean;
  authOnly: boolean;
}

const navItems: NavConfig[] = [
  { href: "/", labelKey: "feed", icon: "feed", adminOnly: false, authOnly: false },
  { href: "/stories", labelKey: "stories", icon: "book", adminOnly: false, authOnly: true },
  { href: "/categories", labelKey: "categories", icon: "categories", adminOnly: false, authOnly: false },
  { href: "/sources", labelKey: "sources", icon: "sources", adminOnly: true, authOnly: false },
  { href: "/notifications", labelKey: "notifications", icon: "bell", adminOnly: false, authOnly: false },
  { href: "/settings", labelKey: "settings", icon: "settings", adminOnly: false, authOnly: true },
];

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
}

export function AppLayout({ children, title, actions }: AppLayoutProps) {
  const { data: session } = useSession();
  const t = useTranslations("nav");
  const userRole = (session?.user as { role?: string })?.role;
  const filteredNavItems = navItems.filter((item) => {
    if (item.adminOnly && userRole !== "admin") return false;
    if (item.authOnly && !session) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-lg font-bold text-slate-900 tracking-tight">FeedFlow</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {filteredNavItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={t(item.labelKey)}
                icon={<Icon name={item.icon} />}
              />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {session ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                {t("signOut")}
              </Button>
            ) : (
              <LinkButton size="sm" variant="ghost-amber" href="/login">
                {t("signIn")}
              </LinkButton>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="flex sm:hidden overflow-x-auto border-t border-slate-100 px-2 py-1 gap-1">
          {filteredNavItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={t(item.labelKey)}
              size="sm"
              className="flex-shrink-0"
            />
          ))}
        </nav>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {actions}
        </div>
        {children}
      </main>
    </div>
  );
}
