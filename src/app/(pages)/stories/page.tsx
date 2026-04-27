"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { AppLayout } from "@/components/templates/app-layout";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { cardClassName } from "@/components/atoms/card";
import { EmptyState } from "@/components/molecules/empty-state";

interface StorySummary {
  id: string;
  name: string;
  summary: string;
  articleCount: number;
  latestArticleAt: string | null;
  createdAt: string;
}

export default function StoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations("stories");
  const locale = useLocale();
  const dateLocale = locale === "es" ? "es-ES" : "en-US";
  const [stories, setStories] = useState<StorySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    fetch("/api/stories")
      .then((res) => res.json())
      .then((data) => {
        setStories(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session, status, router]);

  return (
    <AppLayout title={t("title")}>
      <p className="mb-6 text-sm text-slate-500">{t("intro")}</p>

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : stories.length === 0 ? (
        <EmptyState
          title={t("noStoriesTitle")}
          description={t("noStoriesDescription")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {stories.map((story) => {
            const formattedDate = new Date(
              story.latestArticleAt ?? story.createdAt,
            ).toLocaleDateString(dateLocale, { day: "numeric", month: "short" });
            return (
              <Link
                key={story.id}
                href={`/stories/${story.id}`}
                className={cardClassName({ variant: "link", padding: "md", extra: "group flex flex-col" })}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-slate-900 group-hover:text-amber-700 transition-colors">
                    {story.name}
                  </h3>
                  <span className="flex-shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                    {t("articleCount", { count: story.articleCount })}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500 line-clamp-3">{story.summary}</p>
                <p className="mt-4 text-xs text-slate-300">
                  {story.latestArticleAt
                    ? t("latest", { date: formattedDate })
                    : t("started", { date: formattedDate })}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
