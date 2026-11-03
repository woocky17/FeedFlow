import { describe, expect, it, vi } from "vitest";
import type { ArticleRepository } from "@/domain/article";
import type { CategoryAssignmentRepository } from "@/domain/category";
import type { SentimentAnalyzer } from "@/domain/news-event";
import { HealArticles } from "@/application/article/heal-articles";
import { AnalyzeSentimentBatch } from "@/application/news-event";
import type { ArticleClusterer, CategoryClassifier } from "@/application/article/sync-articles";

describe("HealArticles", () => {
  it("heals pending articles fetched through the repository", async () => {
    const articles: ArticleRepository = {
      save: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      findByCategory: vi.fn(),
      existsByUrl: vi.fn(),
      findUncategorizedSince: vi
        .fn()
        .mockResolvedValue([{ id: "u1", title: "U1", description: null }]),
      findUnclusteredSince: vi
        .fn()
        .mockResolvedValue([{ id: "c1", title: "C1", description: "d" }]),
      findWithoutSentimentSince: vi
        .fn()
        .mockResolvedValue([{ id: "s1", title: "S1", description: null }]),
      updateSentiment: vi.fn().mockResolvedValue(undefined),
    };
    const classifier: CategoryClassifier = { classify: vi.fn().mockResolvedValue(["cat-1"]) };
    const assignments: CategoryAssignmentRepository = {
      create: vi.fn().mockResolvedValue(undefined),
    };
    const clusterer: ArticleClusterer = {
      execute: vi.fn().mockResolvedValue({ eventId: "ev-1", created: false }),
    };
    const analyzer: SentimentAnalyzer = {
      analyze: vi.fn(),
      analyzeBatch: vi
        .fn()
        .mockResolvedValue([{ id: "s1", result: { sentiment: "positive", framing: "f" } }]),
    };

    const before = Date.now();
    const report = await new HealArticles(
      articles,
      classifier,
      assignments,
      clusterer,
      new AnalyzeSentimentBatch(analyzer, articles),
    ).execute();

    expect(report).toEqual({
      classified: 1,
      clustered: 1,
      sentimentAnalyzed: 1,
      sentimentSkipped: 0,
    });
    expect(articles.findUncategorizedSince).toHaveBeenCalledWith(expect.any(Date), 50);
    expect(articles.findUnclusteredSince).toHaveBeenCalledWith(expect.any(Date), 100);
    expect(articles.findWithoutSentimentSince).toHaveBeenCalledWith(expect.any(Date), 40);
    const since = vi.mocked(articles.findUncategorizedSince).mock.calls[0][0];
    const days = (before - since.getTime()) / 86_400_000;
    expect(days).toBeGreaterThan(6.9);
    expect(days).toBeLessThan(7.1);
    expect(classifier.classify).toHaveBeenCalledWith("U1", "");
    expect(assignments.create).toHaveBeenCalledTimes(1);
    expect(clusterer.execute).toHaveBeenCalledWith({
      articleId: "c1",
      title: "C1",
      description: "d",
    });
    expect(analyzer.analyzeBatch).toHaveBeenCalledWith([
      { id: "s1", title: "S1", description: "" },
    ]);
    expect(articles.updateSentiment).toHaveBeenCalledWith("s1", {
      sentiment: "positive",
      framing: "f",
    });
  });
});
