import { describe, expect, it, vi } from "vitest";
import { Article, ArticleFetcher } from "@/domain/article";
import { Source, SourceRepository } from "@/domain/source";
import { SyncArticles } from "@/application/article/sync-articles";
import { IngestArticle, IngestResult } from "@/application/article/ingest-article";
import { QuotaExhaustedError } from "@/infrastructure/news/worldnewsapi/worldnewsapi-adapter";

function makeSource(id: string): Source {
  return Source.create({
    id,
    name: `src-${id}`,
    baseUrl: "https://example.com",
    apiKey: "key",
    kind: "worldnews",
    language: "en",
    active: true,
    createdAt: new Date("2026-01-01T00:00:00Z"),
  });
}

function makeArticle(url: string): Article {
  return Article.create({
    id: `art-${url.slice(-2)}`,
    title: "t",
    url,
    description: "d",
    image: "",
    sourceId: "src-1",
    language: "en",
    publishedAt: new Date(),
    savedAt: new Date(),
  });
}

function makeIngestStub(impl?: (article: Article) => Promise<IngestResult>): IngestArticle {
  const execute = vi
    .fn()
    .mockImplementation(impl ?? (async () => ({ ingested: true, errors: [] })));
  return { execute } as unknown as IngestArticle;
}

describe("SyncArticles", () => {
  it("iterates active sources and counts ingested", async () => {
    const sources = [makeSource("1"), makeSource("2")];
    const sourceRepository: SourceRepository = {
      findActive: vi.fn().mockResolvedValue(sources),
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const fetcher: ArticleFetcher = {
      fetchBySource: vi
        .fn()
        .mockResolvedValueOnce([makeArticle("https://example.com/a")])
        .mockResolvedValueOnce([
          makeArticle("https://example.com/b"),
          makeArticle("https://example.com/c"),
        ]),
    };
    const ingest = makeIngestStub();
    const sync = new SyncArticles(sourceRepository, fetcher, ingest);

    const result = await sync.execute();

    expect(result.synced).toBe(3);
    expect(result.errors).toEqual([]);
  });

  it("stops on QuotaExhaustedError and reports skipped sources", async () => {
    const sources = [makeSource("1"), makeSource("2")];
    const sourceRepository: SourceRepository = {
      findActive: vi.fn().mockResolvedValue(sources),
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const fetcher: ArticleFetcher = {
      fetchBySource: vi.fn().mockRejectedValueOnce(new QuotaExhaustedError()),
    };
    const ingest = makeIngestStub();
    const sync = new SyncArticles(sourceRepository, fetcher, ingest);

    const result = await sync.execute();

    expect(result.synced).toBe(0);
    expect(result.errors.some((e) => e.includes("quota exhausted"))).toBe(true);
    expect(result.errors.some((e) => e.includes("Skipped"))).toBe(true);
    expect(fetcher.fetchBySource).toHaveBeenCalledOnce();
  });

  it("bubbles ingest errors into the result", async () => {
    const sources = [makeSource("1")];
    const sourceRepository: SourceRepository = {
      findActive: vi.fn().mockResolvedValue(sources),
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const fetcher: ArticleFetcher = {
      fetchBySource: vi.fn().mockResolvedValue([makeArticle("https://example.com/a")]),
    };
    const ingest = makeIngestStub(async () => ({
      ingested: false,
      errors: ["Clustering failed for art-a: boom"],
    }));
    const sync = new SyncArticles(sourceRepository, fetcher, ingest);

    const result = await sync.execute();

    expect(result.synced).toBe(0);
    expect(result.errors).toContain("Clustering failed for art-a: boom");
  });
});
