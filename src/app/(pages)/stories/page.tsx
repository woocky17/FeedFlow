"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/templates/app-layout";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
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
    <AppLayout title="Stories">
      <p className="mb-6 text-sm text-slate-500">
        Follow a news story from any article and we&apos;ll track how it evolves over time.
      </p>

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : stories.length === 0 ? (
        <EmptyState
          title="No stories followed yet"
          description="Head to the Feed and tap the book icon on any article to start following its story."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {stories.map((story) => (
            <Link
              key={story.id}
              href={`/stories/${story.id}`}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-amber-300 hover:shadow-lg hover:shadow-slate-200/50"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-slate-900 group-hover:text-amber-700 transition-colors">
                  {story.name}
                </h3>
                <span className="flex-shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                  {story.articleCount} {story.articleCount === 1 ? "article" : "articles"}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500 line-clamp-3">{story.summary}</p>
              <p className="mt-4 text-xs text-slate-300">
                {story.latestArticleAt
                  ? `Latest ${new Date(story.latestArticleAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}`
                  : `Started ${new Date(story.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}`}
              </p>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
