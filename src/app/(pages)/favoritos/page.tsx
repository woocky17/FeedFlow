"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/templates/app-layout";

interface Favorite {
  id: string;
  articleId: string;
  article?: {
    id: string;
    title: string;
    url: string;
    description: string;
    image: string;
    publishedAt: string;
  };
}

export default function FavoritosPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    try {
      const res = await fetch("/api/favoritos");
      const data = await res.json();
      setFavorites(Array.isArray(data) ? data : []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function removeFavorite(id: string) {
    try {
      await fetch(`/api/favoritos/${id}`, { method: "DELETE" });
      setFavorites((prev) => prev.filter((f) => f.id !== id));
    } catch {
      // silently fail
    }
  }

  return (
    <AppLayout title="Favorites">
      {loading ? (
        <div className="flex justify-center py-20">
          <svg className="h-8 w-8 animate-spin text-amber-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : favorites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <p className="text-slate-400">No favorites yet</p>
          <p className="mt-1 text-sm text-slate-300">Save articles from the feed to see them here.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => {
            const article = fav.article;
            if (!article) return null;
            return (
              <div
                key={fav.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-lg hover:shadow-slate-200/50 hover:border-amber-200"
              >
                {article.image && (
                  <div className="aspect-video overflow-hidden bg-slate-100">
                    <img
                      src={article.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-4">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-slate-900 line-clamp-2 hover:text-amber-700 transition-colors"
                  >
                    {article.title}
                  </a>
                  {article.description && (
                    <p className="mt-2 text-sm text-slate-400 line-clamp-2">{article.description}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <p className="text-xs text-slate-300">
                      {new Date(article.publishedAt).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                    <button
                      onClick={() => removeFavorite(fav.id)}
                      className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
