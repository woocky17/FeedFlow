"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/templates/app-layout";
import { Icon } from "@/components/atoms/icon";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { EmptyState } from "@/components/molecules/empty-state";

interface Article {
  id: string;
  title: string;
  url: string;
  description: string;
  image: string;
  sourceId: string;
  publishedAt: string;
  newsEventId?: string | null;
  eventMemberCount?: number;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

export default function FeedPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [followedSourceIds, setFollowedSourceIds] = useState<Set<string>>(new Set());
  const [followLoadingId, setFollowLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/articles")
      .then((res) => res.json())
      .then((data) => {
        setArticles(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!session) return;
    fetch("/api/favorites")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFavoriteIds(new Set(data.map((f: { articleId: string }) => f.articleId)));
        }
      })
      .catch(() => {});

    fetch("/api/stories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFollowedSourceIds(
            new Set(
              data
                .map((s: { sourceArticleId?: string }) => s.sourceArticleId)
                .filter((id): id is string => typeof id === "string"),
            ),
          );
        }
      })
      .catch(() => {});
  }, [session]);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timeout);
  }, [toast]);

  async function followStory(e: React.MouseEvent, articleId: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!session || followedSourceIds.has(articleId) || followLoadingId === articleId) return;

    setFollowLoadingId(articleId);
    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to follow story");
      setFollowedSourceIds((prev) => new Set(prev).add(articleId));
      setToast({ type: "success", text: `Following "${data.name}"` });
    } catch (err) {
      setToast({ type: "error", text: err instanceof Error ? err.message : "Follow failed" });
    } finally {
      setFollowLoadingId(null);
    }
  }

  async function toggleFavorite(e: React.MouseEvent, articleId: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!session) return;

    const isFav = favoriteIds.has(articleId);
    setAnimatingId(articleId);
    setTimeout(() => setAnimatingId(null), 400);

    if (isFav) {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        next.delete(articleId);
        return next;
      });
      await fetch(`/api/favorites/${articleId}`, { method: "DELETE" }).catch(() => {});
    } else {
      setFavoriteIds((prev) => new Set(prev).add(articleId));
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      }).catch(() => {});
    }
  }

  function handleCategoryFilter(categoryId: string | null) {
    setActiveCategory(categoryId);
    setLoading(true);

    const url = categoryId ? `/api/articles?categoryId=${categoryId}` : "/api/articles";
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setArticles(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  const displayedArticles = showFavorites
    ? articles.filter((a) => favoriteIds.has(a.id))
    : articles;

  return (
    <AppLayout title="Feed">
      {toast && (
        <div
          className={`fixed top-20 right-4 z-50 rounded-lg px-4 py-2 text-sm font-medium shadow-lg transition-all ${
            toast.type === "success"
              ? "bg-emerald-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {toast.text}
        </div>
      )}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => { handleCategoryFilter(null); setShowFavorites(false); }}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            activeCategory === null && !showFavorites
              ? "bg-amber-500 text-white shadow-sm"
              : "bg-white text-slate-500 border border-slate-200 hover:border-amber-300"
          }`}
        >
          All
        </button>
        {session && (
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              showFavorites
                ? "bg-red-500 text-white shadow-sm"
                : "bg-white text-slate-500 border border-slate-200 hover:border-red-300"
            }`}
          >
            <Icon name="heart" size={14} filled={showFavorites} />
            Favorites
          </button>
        )}
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryFilter(cat.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === cat.id
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-white text-slate-500 border border-slate-200 hover:border-amber-300"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : displayedArticles.length === 0 ? (
        <EmptyState
          title={showFavorites ? "No favorites yet" : "No articles found"}
          description={
            showFavorites
              ? "Tap the heart on any article to save it here."
              : "Articles will appear here once sources are synced."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayedArticles.map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-lg hover:shadow-slate-200/50 hover:border-amber-200"
            >
              {session && (
                <div className="absolute top-3 right-3 z-10 flex gap-1.5">
                  <button
                    onClick={(e) => followStory(e, article.id)}
                    disabled={followedSourceIds.has(article.id) || followLoadingId === article.id}
                    title={followedSourceIds.has(article.id) ? "Already following" : "Follow this story"}
                    className="rounded-full bg-white/80 p-1.5 backdrop-blur-sm transition-all hover:bg-white hover:scale-110 disabled:cursor-default disabled:hover:scale-100"
                  >
                    {followLoadingId === article.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Icon
                        name="book"
                        size={20}
                        filled={followedSourceIds.has(article.id)}
                        className={`transition-all duration-300 ${
                          followedSourceIds.has(article.id)
                            ? "text-amber-500"
                            : "text-slate-400 hover:text-amber-500"
                        }`}
                      />
                    )}
                  </button>
                  <button
                    onClick={(e) => toggleFavorite(e, article.id)}
                    className="rounded-full bg-white/80 p-1.5 backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                  >
                    <Icon
                      name="heart"
                      size={20}
                      filled={favoriteIds.has(article.id)}
                      className={`${
                        favoriteIds.has(article.id)
                          ? "text-red-500"
                          : "text-slate-400 hover:text-red-400"
                      } ${animatingId === article.id ? "scale-125" : ""}`}
                      style={{
                        transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.3s, fill 0.3s",
                      }}
                    />
                  </button>
                </div>
              )}
              {article.image && (
                <div className="aspect-video overflow-hidden bg-slate-100">
                  <img
                    src={article.image}
                    alt=""
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-amber-700 transition-colors">
                  {article.title}
                </h3>
                {article.description && (
                  <p className="mt-2 text-sm text-slate-400 line-clamp-3">{article.description}</p>
                )}
                <div className="mt-auto flex items-center justify-between pt-3">
                  <p className="text-xs text-slate-300">
                    {new Date(article.publishedAt).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  {article.newsEventId && (article.eventMemberCount ?? 1) > 1 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(`/events/${article.newsEventId}`);
                      }}
                      className="flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
                      title="Compare sources"
                    >
                      <Icon name="compare" size={12} />
                      {article.eventMemberCount} sources
                    </button>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
