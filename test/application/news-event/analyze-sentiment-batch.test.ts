import { describe, expect, it, vi } from "vitest";
import type { ArticleRepository } from "@/domain/article";
import type { SentimentAnalyzer } from "@/domain/news-event";
import { AnalyzeSentimentBatch } from "@/application/news-event";

function makeArticleRepository(): ArticleRepository {
  return {
    save: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
    findByCategory: vi.fn(),
    existsByUrl: vi.fn(),
    findUncategorizedSince: vi.fn(),
    findUnclusteredSince: vi.fn(),
    findWithoutSentimentSince: vi.fn(),
    updateSentiment: vi.fn().mockResolvedValue(undefined),
  };
}

describe("AnalyzeSentimentBatch", () => {
  it("persists results through the repository and counts skipped items", async () => {
    const analyzer: SentimentAnalyzer = {
      analyze: vi.fn(),
      analyzeBatch: vi
        .fn()
        .mockImplementation(async (items: Array<{ id: string }>) =>
          items
            .filter((i) => i.id !== "b")
            .map((i) => ({ id: i.id, result: { sentiment: "neutral", framing: `f-${i.id}` } })),
        ),
    };
    const articles = makeArticleRepository();
    const useCase = new AnalyzeSentimentBatch(analyzer, articles, 2);

    const outcome = await useCase.execute([
      { id: "a", title: "A", description: "" },
      { id: "b", title: "B", description: "" },
      { id: "c", title: "C", description: "" },
    ]);

    expect(outcome).toEqual({ analyzed: 2, skipped: 1 });
    expect(analyzer.analyzeBatch).toHaveBeenCalledTimes(2);
    expect(articles.updateSentiment).toHaveBeenCalledTimes(2);
    expect(articles.updateSentiment).toHaveBeenCalledWith("a", {
      sentiment: "neutral",
      framing: "f-a",
    });
    expect(articles.updateSentiment).toHaveBeenCalledWith("c", {
      sentiment: "neutral",
      framing: "f-c",
    });
  });
});
