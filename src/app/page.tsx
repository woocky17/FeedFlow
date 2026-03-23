"use client";

import { useEffect, useState } from "react";
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
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/noticias")
      .then((res) => res.json())
      .then((data) => {
        setArticles(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch("/api/categorias")
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  function handleCategoryFilter(categoryId: string | null) {
    setActiveCategory(categoryId);
    setLoading(true);

    const url = categoryId ? `/api/noticias?categoryId=${categoryId}` : "/api/noticias";
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setArticles(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  return (
    <AppLayout title="Feed">
      {/* Category filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => handleCategoryFilter(null)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            activeCategory === null
              ? "bg-amber-500 text-white shadow-sm"
              : "bg-white text-slate-500 border border-slate-200 hover:border-amber-300"
          }`}
        >
          All
        </button>
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
      ) : articles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <p className="text-slate-400">No articles found</p>
          <p className="mt-1 text-sm text-slate-300">Articles will appear here once sources are synced.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-lg hover:shadow-slate-200/50 hover:border-amber-200"
            >
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
