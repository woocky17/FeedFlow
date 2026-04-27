import { describe, expect, it, vi } from "vitest";
import { Source } from "@/domain/source";
import { RssArticleFetcher } from "@/infrastructure/news/rss/rss-adapter";

function makeSource(overrides: Partial<{ id: string; baseUrl: string }> = {}): Source {
  return Source.create({
    id: overrides.id ?? "src-rss",
    name: "rss-feed",
    baseUrl: overrides.baseUrl ?? "https://example.com/feed.xml",
    apiKey: "",
    kind: "rss",
    language: "es",
    active: true,
    createdAt: new Date("2026-01-01T00:00:00Z"),
  });
}

function mockFetchWithBody(body: string, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    text: async () => body,
  });
}

const RSS_FIXTURE = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>Example</title>
    <item>
      <title>Noticia uno</title>
      <link>https://example.com/1</link>
      <description><![CDATA[<p>Contenido <b>uno</b></p>]]></description>
      <pubDate>Wed, 22 Apr 2026 10:00:00 GMT</pubDate>
      <enclosure url="https://example.com/img1.jpg" type="image/jpeg"/>
    </item>
    <item>
      <title>Noticia dos</title>
      <link>https://example.com/2</link>
      <description>Descripcion plana</description>
      <pubDate>Thu, 23 Apr 2026 10:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Noticia tres</title>
      <link>https://example.com/3</link>
      <pubDate>Fri, 24 Apr 2026 10:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

const ATOM_FIXTURE = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Example Atom</title>
  <entry>
    <title>Atom uno</title>
    <link href="https://example.com/atom/1" rel="alternate"/>
    <summary>Resumen uno</summary>
    <updated>2026-04-22T10:00:00Z</updated>
  </entry>
  <entry>
    <title>Atom dos</title>
    <link href="https://example.com/atom/2" rel="alternate"/>
    <summary>Resumen dos</summary>
    <updated>2026-04-23T10:00:00Z</updated>
  </entry>
</feed>`;

describe("RssArticleFetcher", () => {
  it("parses RSS 2.0 items into Articles", async () => {
    const fetcher = new RssArticleFetcher(mockFetchWithBody(RSS_FIXTURE));
    const articles = await fetcher.fetchBySource(makeSource());

    expect(articles).toHaveLength(3);
    expect(articles[0].title).toBe("Noticia uno");
    expect(articles[0].url).toBe("https://example.com/1");
    expect(articles[0].description).toBe("Contenido uno");
    expect(articles[0].image).toBe("https://example.com/img1.jpg");
    expect(articles[1].image).toBe("");
  });

  it("parses Atom feeds into Articles", async () => {
    const fetcher = new RssArticleFetcher(mockFetchWithBody(ATOM_FIXTURE));
    const articles = await fetcher.fetchBySource(makeSource());

    expect(articles).toHaveLength(2);
    expect(articles[0].url).toBe("https://example.com/atom/1");
    expect(articles[0].description).toBe("Resumen uno");
  });

  it("filters by from/to date range", async () => {
    const fetcher = new RssArticleFetcher(mockFetchWithBody(RSS_FIXTURE));
    const articles = await fetcher.fetchBySource(makeSource(), {
      from: new Date("2026-04-23T00:00:00Z"),
      to: new Date("2026-04-23T23:59:59Z"),
    });

    expect(articles).toHaveLength(1);
    expect(articles[0].url).toBe("https://example.com/2");
  });

  it("respects limit", async () => {
    const fetcher = new RssArticleFetcher(mockFetchWithBody(RSS_FIXTURE));
    const articles = await fetcher.fetchBySource(makeSource(), { limit: 2 });

    expect(articles).toHaveLength(2);
  });

  it("throws on non-ok HTTP response", async () => {
    const fetcher = new RssArticleFetcher(mockFetchWithBody("", false, 500));
    await expect(fetcher.fetchBySource(makeSource())).rejects.toThrow(/RSS HTTP error 500/);
  });

  it("returns empty array when feed has no items", async () => {
    const empty = `<?xml version="1.0"?><rss version="2.0"><channel><title>x</title></channel></rss>`;
    const fetcher = new RssArticleFetcher(mockFetchWithBody(empty));
    const articles = await fetcher.fetchBySource(makeSource());
    expect(articles).toEqual([]);
  });
});
