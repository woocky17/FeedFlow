"use client";

import { useEffect, useState } from "react";
import { Session } from "next-auth";

interface StoryRow {
  sourceArticleId?: string;
  name?: string;
}

interface FollowResult {
  ok: boolean;
  storyName?: string;
  error?: string;
}

export function useFollowedStories(session: Session | null) {
  const [followedSourceIds, setFollowedSourceIds] = useState<Set<string>>(new Set());
  const [followLoadingId, setFollowLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    fetch("/api/stories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFollowedSourceIds(
            new Set(
              (data as StoryRow[])
                .map((s) => s.sourceArticleId)
                .filter((id): id is string => typeof id === "string"),
            ),
          );
        }
      })
      .catch(() => {});
  }, [session]);

  const isFollowed = (id: string) => followedSourceIds.has(id);
  const isLoading = (id: string) => followLoadingId === id;

  async function follow(articleId: string): Promise<FollowResult> {
    if (!session || followedSourceIds.has(articleId) || followLoadingId === articleId) {
      return { ok: false };
    }

    setFollowLoadingId(articleId);
    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      const data = (await res.json()) as StoryRow & { error?: string };
      if (!res.ok) {
        return { ok: false, error: data?.error ?? "Failed to follow story" };
      }
      setFollowedSourceIds((prev) => new Set(prev).add(articleId));
      return { ok: true, storyName: data.name };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Follow failed" };
    } finally {
      setFollowLoadingId(null);
    }
  }

  return { followedSourceIds, isFollowed, isLoading, follow };
}
