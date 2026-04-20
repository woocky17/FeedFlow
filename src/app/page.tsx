"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AppLayout } from "@/components/templates/app-layout";

interface Article {
  id: string;
  title: string;
  url: string;
  description: string;
  image: string;
  sourceId: string;
  publishedAt: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

export default function FeedPage() {
  const { data: session } = useSession();
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
      {/* Category filters */}
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill={showFavorites ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
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

      {/* Articles grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <svg className="h-8 w-8 animate-spin text-amber-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : displayedArticles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <p className="text-slate-400">{showFavorites ? "No favorites yet" : "No articles found"}</p>
          <p className="mt-1 text-sm text-slate-300">
            {showFavorites
              ? "Tap the heart on any article to save it here."
              : "Articles will appear here once sources are synced."}
          </p>
        </div>
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
                      <svg className="h-5 w-5 animate-spin text-amber-500" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill={followedSourceIds.has(article.id) ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-all duration-300 ${
                          followedSourceIds.has(article.id)
                            ? "text-amber-500"
                            : "text-slate-400 hover:text-amber-500"
                        }`}
                      >
                        <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={(e) => toggleFavorite(e, article.id)}
                    className="rounded-full bg-white/80 p-1.5 backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={favoriteIds.has(article.id) ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-all duration-300 ${
                        favoriteIds.has(article.id)
                          ? "text-red-500"
                          : "text-slate-400 hover:text-red-400"
                      } ${animatingId === article.id ? "scale-125" : ""}`}
                      style={{
                        transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.3s, fill 0.3s",
                      }}
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
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
                <p className="mt-auto pt-3 text-xs text-slate-300">
                  {new Date(article.publishedAt).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
