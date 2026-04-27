"use client";

import { useEffect, useState } from "react";
import { Session } from "next-auth";

interface FavoriteRow {
  articleId: string;
}

const ANIMATION_MS = 400;

export function useFavorites(session: Session | null) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    fetch("/api/favorites")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFavoriteIds(new Set((data as FavoriteRow[]).map((f) => f.articleId)));
        }
      })
      .catch(() => {});
  }, [session]);

  const isFavorite = (id: string) => favoriteIds.has(id);
  const isAnimating = (id: string) => animatingId === id;

  async function toggle(articleId: string) {
    if (!session) return;

    setAnimatingId(articleId);
    setTimeout(() => setAnimatingId(null), ANIMATION_MS);

    if (favoriteIds.has(articleId)) {
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

  return { favoriteIds, isFavorite, isAnimating, toggle };
}
