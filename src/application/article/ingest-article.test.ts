import { describe, expect, it, vi } from "vitest";
import { Article, ArticleRepository } from "@/domain/article";
import { CategoryAssignmentRepository } from "@/domain/category";
import { IngestArticle } from "./ingest-article";
import {
  ArticleClusterer,
  CategoryClassifier,
  SentimentEnricher,
  StoryMatcher,
} from "./sync-articles";

function makeArticle(overrides: Partial<{ id: string; url: string }> = {}): Article {
  return Article.create({
    id: overrides.id ?? "art-1",
    title: "A title",
    url: overrides.url ?? "https://example.com/a",
    description: "desc",
    image: "",
    sourceId: "src-1",
    publishedAt: new Date("2026-04-20T00:00:00Z"),
    savedAt: new Date("2026-04-20T00:00:00Z"),
  });
}

function makeDeps() {
  const articleRepository: ArticleRepository = {
    save: vi.fn().mockResolvedValue(undefined),
    existsByUrl: vi.fn().mockResolvedValue(false),
    findAll: vi.fn(),
    findByCategory: vi.fn(),
    findBySource: vi.fn(),
  };
  const assignmentRepository: CategoryAssignmentRepository = {
    create: vi.fn().mockResolvedValue(undefined),
    findByArticle: vi.fn().mockResolvedValue([]),
    updateOrigin: vi.fn().mockResolvedValue(undefined),
  };
  const categoryClassifier: CategoryClassifier = {
    classify: vi.fn().mockResolvedValue([]),
  };
  const storyMatcher: StoryMatcher = {
    execute: vi.fn().mockResolvedValue({ storiesMatched: 0 }),
  };
  const articleClusterer: ArticleClusterer = {
    execute: vi.fn().mockResolvedValue({ eventId: "ev-1", created: true }),
  };
  const sentimentEnricher: SentimentEnricher = {
    execute: vi.fn().mockResolvedValue(undefined),
  };
  return {
    articleRepository,
    assignmentRepository,
    categoryClassifier,
    storyMatcher,
    articleClusterer,
    sentimentEnricher,
  };
}

describe("IngestArticle", () => {
  it("skips when article URL already exists", async () => {
    const deps = makeDeps();
    deps.articleRepository.existsByUrl = vi.fn().mockResolvedValue(true);

    const ingest = new IngestArticle(
      deps.articleRepository,
      deps.assignmentRepository,
      deps.categoryClassifier,
    );

    const result = await ingest.execute(makeArticle());

    expect(result).toEqual({ ingested: false, errors: [] });
    expect(deps.articleRepository.save).not.toHaveBeenCalled();
    expect(deps.categoryClassifier.classify).not.toHaveBeenCalled();
  });

  it("saves, classifies, clusters, matches and enriches on happy path", async () => {
    const deps = makeDeps();
    deps.categoryClassifier.classify = vi.fn().mockResolvedValue(["cat-1", "cat-2"]);

    const ingest = new IngestArticle(
      deps.articleRepository,
      deps.assignmentRepository,
      deps.categoryClassifier,
      deps.storyMatcher,
      deps.articleClusterer,
      deps.sentimentEnricher,
    );

    const article = makeArticle();
    const result = await ingest.execute(article);

    expect(result).toEqual({ ingested: true, errors: [] });
    expect(deps.articleRepository.save).toHaveBeenCalledWith(article);
    expect(deps.assignmentRepository.create).toHaveBeenCalledTimes(2);
    expect(deps.articleClusterer.execute).toHaveBeenCalledOnce();
    expect(deps.storyMatcher.execute).toHaveBeenCalledOnce();
    expect(deps.sentimentEnricher.execute).toHaveBeenCalledOnce();
  });

  it("aggregates optional-step errors without aborting", async () => {
    const deps = makeDeps();
    deps.articleClusterer.execute = vi.fn().mockRejectedValue(new Error("cluster boom"));
    deps.sentimentEnricher.execute = vi.fn().mockRejectedValue(new Error("sentiment boom"));

    const ingest = new IngestArticle(
      deps.articleRepository,
      deps.assignmentRepository,
      deps.categoryClassifier,
      deps.storyMatcher,
      deps.articleClusterer,
      deps.sentimentEnricher,
    );

    const result = await ingest.execute(makeArticle());

    expect(result.ingested).toBe(true);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0]).toContain("Clustering failed");
    expect(result.errors[1]).toContain("Sentiment enrich failed");
    expect(deps.storyMatcher.execute).toHaveBeenCalledOnce();
  });

  it("works without optional ports", async () => {
    const deps = makeDeps();

    const ingest = new IngestArticle(
      deps.articleRepository,
      deps.assignmentRepository,
      deps.categoryClassifier,
    );

    const result = await ingest.execute(makeArticle());

    expect(result).toEqual({ ingested: true, errors: [] });
    expect(deps.articleRepository.save).toHaveBeenCalledOnce();
  });
});
