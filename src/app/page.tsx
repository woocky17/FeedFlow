"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { AppLayout } from "@/components/templates/app-layout";
import { Icon } from "@/components/atoms/icon";
import { IconButton } from "@/components/atoms/icon-button";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { cardClassName } from "@/components/atoms/card";
import { EmptyState } from "@/components/molecules/empty-state";
import { EventSourcesPill } from "@/components/molecules/event-sources-pill";
import { FilterPill } from "@/components/molecules/filter-pill";
import { useFavorites } from "@/lib/hooks/use-favorites";
import { useFollowedStories } from "@/lib/hooks/use-followed-stories";

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
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const favorites = useFavorites(session);
  const followed = useFollowedStories(session);

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
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timeout);
  }, [toast]);

  async function handleFollow(e: React.MouseEvent, articleId: string) {
    e.preventDefault();
    e.stopPropagation();
    const result = await followed.follow(articleId);
    if (result.ok) {
      setToast({ type: "success", text: `Following "${result.storyName}"` });
    } else if (result.error) {
      setToast({ type: "error", text: result.error });
    }
  }

  function handleToggleFavorite(e: React.MouseEvent, articleId: string) {
    e.preventDefault();
    e.stopPropagation();
    favorites.toggle(articleId);
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
    ? articles.filter((a) => favorites.isFavorite(a.id))
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
        <FilterPill
          active={activeCategory === null && !showFavorites}
          onClick={() => { handleCategoryFilter(null); setShowFavorites(false); }}
        >
          All
        </FilterPill>
        {session && (
          <FilterPill
            active={showFavorites}
            color="red"
            icon={<Icon name="heart" size={14} filled={showFavorites} />}
            onClick={() => setShowFavorites(!showFavorites)}
          >
            Favorites
          </FilterPill>
        )}
        {categories.map((cat) => (
          <FilterPill
            key={cat.id}
            active={activeCategory === cat.id}
            onClick={() => handleCategoryFilter(cat.id)}
          >
            {cat.name}
          </FilterPill>
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
              className={cardClassName({
                variant: "link",
                padding: "none",
                extra: "group relative flex flex-col overflow-hidden",
              })}
            >
              {session && (
                <div className="absolute top-3 right-3 z-10 flex gap-1.5">
                  <IconButton
                    appearance="overlay"
                    onClick={(e) => handleFollow(e, article.id)}
                    disabled={followed.isFollowed(article.id) || followed.isLoading(article.id)}
                    isLoading={followed.isLoading(article.id)}
                    label={followed.isFollowed(article.id) ? "Already following" : "Follow this story"}
                    icon={
                      <Icon
                        name="book"
                        size={20}
                        filled={followed.isFollowed(article.id)}
                        className={`transition-all duration-300 ${
                          followed.isFollowed(article.id)
                            ? "text-amber-500"
                            : "text-slate-400 hover:text-amber-500"
                        }`}
                      />
                    }
                  />
                  <IconButton
                    appearance="overlay"
                    onClick={(e) => handleToggleFavorite(e, article.id)}
                    label={favorites.isFavorite(article.id) ? "Remove from favorites" : "Add to favorites"}
                    icon={
                      <Icon
                        name="heart"
                        size={20}
                        filled={favorites.isFavorite(article.id)}
                        className={`${
                          favorites.isFavorite(article.id)
                            ? "text-red-500"
                            : "text-slate-400 hover:text-red-400"
                        } ${favorites.isAnimating(article.id) ? "scale-125" : ""}`}
                        style={{
                          transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.3s, fill 0.3s",
                        }}
                      />
                    }
                  />
                </div>
              )}
              {article.image && (
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  <Image
                    src={article.image}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover transition-transform group-hover:scale-105"
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
                    <EventSourcesPill
                      eventId={article.newsEventId}
                      count={article.eventMemberCount ?? 0}
                    />
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
