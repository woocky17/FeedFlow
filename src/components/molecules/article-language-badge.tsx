"use client";

import { useTranslations } from "next-intl";
import type { Language } from "@/domain/shared";

interface ArticleLanguageBadgeProps {
  isTranslated: boolean;
  showingOriginal: boolean;
  sourceLanguage: Language;
  onToggle: () => void;
  className?: string;
}

export function ArticleLanguageBadge({
  isTranslated,
  showingOriginal,
  sourceLanguage,
  onToggle,
  className,
}: ArticleLanguageBadgeProps) {
  const t = useTranslations("articleTranslation");

  if (!isTranslated) return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={`inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-700 transition-colors hover:bg-amber-100 ${className ?? ""}`}
    >
      <span>{showingOriginal ? sourceLanguage : t("translated")}</span>
      <span aria-hidden="true">·</span>
      <span>{showingOriginal ? t("seeTranslation") : t("seeOriginal")}</span>
    </button>
  );
}
