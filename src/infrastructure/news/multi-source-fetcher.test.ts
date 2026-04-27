import { describe, expect, it, vi } from "vitest";
import { Article, ArticleFetcher } from "@/domain/article";
import { Source, SourceKind } from "@/domain/source";
import { MultiSourceArticleFetcher } from "./multi-source-fetcher";

function makeSource(kind: SourceKind): Source {
  return Source.create({
    id: `src-${kind}`,
    name: kind,
    baseUrl: "https://example.com",
    apiKey: kind === "rss" ? "" : "key",
    kind,
    active: true,
    createdAt: new Date("2026-01-01T00:00:00Z"),
  });
}

function makeArticle(url: string): Article {
  return Article.create({
    id: `art-${url.slice(-1)}`,
    title: "t",
    url,
    description: "",
    image: "",
    sourceId: "src-any",
    publishedAt: new Date(),
    savedAt: new Date(),
  });
}

describe("MultiSourceArticleFetcher", () => {
  it("dispatches rss sources to the rss fetcher", async () => {
    const wn: ArticleFetcher = { fetchBySource: vi.fn() };
    const rss: ArticleFetcher = {
      fetchBySource: vi.fn().mockResolvedValue([makeArticle("https://example.com/rss")]),
    };
    const router = new MultiSourceArticleFetcher(wn, rss);

    const articles = await router.fetchBySource(makeSource("rss"), { limit: 5 });

    expect(rss.fetchBySource).toHaveBeenCalledOnce();
    expect(wn.fetchBySource).not.toHaveBeenCalled();
    expect(articles[0].url).toBe("https://example.com/rss");
  });

  it("dispatches worldnews sources to the worldnews fetcher", async () => {
    const wn: ArticleFetcher = {
      fetchBySource: vi.fn().mockResolvedValue([makeArticle("https://example.com/wn")]),
    };
    const rss: ArticleFetcher = { fetchBySource: vi.fn() };
    const router = new MultiSourceArticleFetcher(wn, rss);

    const articles = await router.fetchBySource(makeSource("worldnews"));

    expect(wn.fetchBySource).toHaveBeenCalledOnce();
    expect(rss.fetchBySource).not.toHaveBeenCalled();
    expect(articles[0].url).toBe("https://example.com/wn");
  });

  it("forwards options to the underlying fetcher", async () => {
    const wn: ArticleFetcher = { fetchBySource: vi.fn().mockResolvedValue([]) };
    const rss: ArticleFetcher = { fetchBySource: vi.fn().mockResolvedValue([]) };
    const router = new MultiSourceArticleFetcher(wn, rss);

    const opts = { from: new Date("2026-04-01"), to: new Date("2026-04-02"), limit: 50 };
    await router.fetchBySource(makeSource("rss"), opts);

    expect(rss.fetchBySource).toHaveBeenCalledWith(expect.any(Source), opts);
  });
});
