import { describe, expect, it, vi } from "vitest";
import type { ArticleRepository } from "@/domain/article";
import type { SentimentAnalyzer } from "@/domain/news-event";
import { AnalyzeArticleSentiment } from "@/application/news-event";

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

describe("AnalyzeArticleSentiment", () => {
  it("stores the sentiment when the analyzer returns a result", async () => {
    const analyzer: SentimentAnalyzer = {
      analyze: vi.fn().mockResolvedValue({ sentiment: "negative", framing: "critical" }),
      analyzeBatch: vi.fn(),
    };
    const articles = makeArticleRepository();

    await new AnalyzeArticleSentiment(analyzer, articles).execute({
      articleId: "art-1",
      title: "T",
      description: null,
    });

    expect(analyzer.analyze).toHaveBeenCalledWith("T", "");
    expect(articles.updateSentiment).toHaveBeenCalledWith("art-1", {
      sentiment: "negative",
      framing: "critical",
    });
  });

  it("does not write when the analyzer returns null", async () => {
    const analyzer: SentimentAnalyzer = {
      analyze: vi.fn().mockResolvedValue(null),
      analyzeBatch: vi.fn(),
    };
    const articles = makeArticleRepository();

    await new AnalyzeArticleSentiment(analyzer, articles).execute({
      articleId: "art-1",
      title: "T",
      description: "D",
    });

    expect(articles.updateSentiment).not.toHaveBeenCalled();
  });
});
