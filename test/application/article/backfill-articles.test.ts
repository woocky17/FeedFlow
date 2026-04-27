import { describe, expect, it, vi } from "vitest";
import { Article, ArticleFetcher, FetchOptions } from "@/domain/article";
import { Source, SourceRepository } from "@/domain/source";
import { BackfillArticles } from "@/application/article/backfill-articles";
import { IngestArticle, IngestResult } from "@/application/article/ingest-article";
import { QuotaExhaustedError } from "@/infrastructure/news/worldnewsapi/worldnewsapi-adapter";

function makeSource(id: string, active = true): Source {
  return Source.create({
    id,
    name: `src-${id}`,
    baseUrl: "https://example.com",
    apiKey: "key",
    kind: "worldnews",
    language: "en",
    active,
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

function makeIngestStub(): IngestArticle {
  const execute = vi.fn().mockImplementation(async (): Promise<IngestResult> => ({
    ingested: true,
    errors: [],
  }));
  return { execute } as unknown as IngestArticle;
}

describe("BackfillArticles", () => {
  it("splits daysBack into daily windows and fetches each", async () => {
    const sourceRepository: SourceRepository = {
      findActive: vi.fn().mockResolvedValue([makeSource("1")]),
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const calls: FetchOptions[] = [];
    const fetcher: ArticleFetcher = {
      fetchBySource: vi.fn().mockImplementation(async (_s: Source, opts: FetchOptions) => {
        calls.push(opts);
        return [makeArticle(`https://example.com/${calls.length}`)];
      }),
    };
    const ingest = makeIngestStub();
    const backfill = new BackfillArticles(sourceRepository, fetcher, ingest);

    const result = await backfill.execute({ daysBack: 3, windowHours: 24 });

    expect(calls).toHaveLength(3);
    for (const opts of calls) {
      expect(opts.from).toBeInstanceOf(Date);
      expect(opts.to).toBeInstanceOf(Date);
      expect(opts.to!.getTime() - opts.from!.getTime()).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
      expect(opts.limit).toBe(100);
    }
    expect(result.fetched).toBe(3);
    expect(result.ingested).toBe(3);
    expect(result.errors).toEqual([]);
  });

  it("filters sources by sourceIds when provided", async () => {
    const sources = [makeSource("1"), makeSource("2"), makeSource("3")];
    const sourceRepository: SourceRepository = {
      findActive: vi.fn().mockResolvedValue(sources),
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const fetcher: ArticleFetcher = {
      fetchBySource: vi.fn().mockResolvedValue([]),
    };
    const ingest = makeIngestStub();
    const backfill = new BackfillArticles(sourceRepository, fetcher, ingest);

    await backfill.execute({ daysBack: 1, sourceIds: ["2"] });

    const calls = (fetcher.fetchBySource as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls).toHaveLength(1);
    expect((calls[0][0] as Source).id).toBe("2");
  });

  it("aborts remaining work on QuotaExhaustedError", async () => {
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
    const backfill = new BackfillArticles(sourceRepository, fetcher, ingest);

    const result = await backfill.execute({ daysBack: 1 });

    expect(result.fetched).toBe(0);
    expect(result.errors.some((e) => e.includes("Quota exhausted"))).toBe(true);
    expect(result.errors.some((e) => e.includes("Skipped"))).toBe(true);
  });

  it("rejects daysBack <= 0", async () => {
    const sourceRepository: SourceRepository = {
      findActive: vi.fn().mockResolvedValue([]),
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const fetcher: ArticleFetcher = { fetchBySource: vi.fn() };
    const ingest = makeIngestStub();
    const backfill = new BackfillArticles(sourceRepository, fetcher, ingest);

    const result = await backfill.execute({ daysBack: 0 });

    expect(result.errors).toContain("daysBack must be > 0");
    expect(fetcher.fetchBySource).not.toHaveBeenCalled();
  });

  it("records generic fetch errors without aborting", async () => {
    const sourceRepository: SourceRepository = {
      findActive: vi.fn().mockResolvedValue([makeSource("1")]),
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const fetcher: ArticleFetcher = {
      fetchBySource: vi
        .fn()
        .mockRejectedValueOnce(new Error("timeout"))
        .mockResolvedValueOnce([makeArticle("https://example.com/ok")]),
    };
    const ingest = makeIngestStub();
    const backfill = new BackfillArticles(sourceRepository, fetcher, ingest);

    const result = await backfill.execute({ daysBack: 2, windowHours: 24 });

    expect(result.fetched).toBe(1);
    expect(result.ingested).toBe(1);
    expect(result.errors.some((e) => e.includes("Fetch failed"))).toBe(true);
  });
});
