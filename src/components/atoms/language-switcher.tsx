"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { setLocaleCookie } from "@/app/actions/set-locale";
import { SUPPORTED_LANGUAGES, type Language } from "@/domain/shared";

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const locale = useLocale() as Language;
  const t = useTranslations("common.languageSwitcher");
  const { data: session, update } = useSession();
  const [isPending, startTransition] = useTransition();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value as Language;
    if (next === locale) return;
    startTransition(async () => {
      await setLocaleCookie(next);
      if (session?.user) {
        await update({ language: next });
      }
    });
  }

  return (
    <label className={`inline-flex items-center gap-2 text-xs text-slate-500 ${className ?? ""}`}>
      <span className="sr-only">{t("label")}</span>
      <select
        aria-label={t("label")}
        value={locale}
        onChange={handleChange}
        disabled={isPending}
        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 disabled:opacity-60"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {lang === "es" ? t("spanish") : t("english")}
          </option>
        ))}
      </select>
    </label>
  );
}
