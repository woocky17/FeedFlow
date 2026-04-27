"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AppLayout } from "@/components/templates/app-layout";
import { Card, cardClassName } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { EmptyState } from "@/components/molecules/empty-state";

interface TimelineArticle {
  id: string;
  title: string;
  url: string;
  description: string | null;
  image: string | null;
  sourceId: string;
  publishedAt: string;
  similarity: number;
}

interface StoryTimelineResponse {
  story: {
    id: string;
    name: string;
    summary: string;
    threshold: number;
    sourceArticleId: string;
    createdAt: string;
  };
  articles: TimelineArticle[];
}

function groupByDay(articles: TimelineArticle[]) {
  const groups = new Map<string, TimelineArticle[]>();
  for (const a of articles) {
    const d = new Date(a.publishedAt);
    const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
    const list = groups.get(key) ?? [];
    list.push(a);
    groups.set(key, list);
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([key, items]) => ({ date: new Date(key), items }));
}

function formatDayLabel(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === yesterday.getTime()) return "Yesterday";
  return date.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default function StoryTimelinePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [data, setData] = useState<StoryTimelineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unfollowing, setUnfollowing] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    fetch(`/api/stories/${params.id}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || "Failed to load story");
        }
        return res.json();
      })
      .then((body: StoryTimelineResponse) => {
        setData(body);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load");
        setLoading(false);
      });
  }, [params.id, session, status, router]);

  async function handleUnfollow() {
    if (!confirm("Stop following this story? All timeline entries will be removed.")) return;
    setUnfollowing(true);
    const res = await fetch(`/api/stories/${params.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/stories");
    } else {
      setUnfollowing(false);
    }
  }

  if (loading) {
    return (
      <AppLayout title="Loading...">
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout title="Story">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-red-700">
          {error ?? "Not found"}
        </div>
      </AppLayout>
    );
  }

  const groups = groupByDay(data.articles);

  return (
    <AppLayout
      title={data.story.name}
      actions={
        <button
          onClick={handleUnfollow}
          disabled={unfollowing}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:border-red-200 hover:text-red-600 disabled:opacity-50"
        >
          {unfollowing ? "Removing..." : "Unfollow"}
        </button>
      }
    >
      <Card padding="md" className="mb-8">
        <p className="text-slate-600">{data.story.summary}</p>
        <p className="mt-3 text-xs text-slate-400">
          {data.articles.length} {data.articles.length === 1 ? "article" : "articles"} ·
          {" "}started {new Date(data.story.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </Card>

      {groups.length === 0 ? (
        <EmptyState
          title="No articles in this timeline yet"
          description="New matching articles will appear here as they're synced."
        />
      ) : (
        <div className="space-y-8">
          {groups.map(({ date, items }) => (
            <section key={date.toISOString()}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
                {formatDayLabel(date)}
              </h2>
              <div className="space-y-3">
                {items.map((article) => (
                  <a
                    key={article.id}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cardClassName({
                      variant: "link",
                      padding: "sm",
                      extra: "group flex gap-4",
                    })}
                  >
                    {article.image && (
                      <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        <img src={article.image} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col">
                      <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-amber-700 transition-colors">
                        {article.title}
                      </h3>
                      {article.description && (
                        <p className="mt-1 text-sm text-slate-400 line-clamp-2">{article.description}</p>
                      )}
                      <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-slate-300">
                        <span>
                          {new Date(article.publishedAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <Badge variant="neutral" size="sm">
                          match {(article.similarity * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
