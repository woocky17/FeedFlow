import { XMLParser } from "fast-xml-parser";
import { Article, ArticleFetcher, FetchOptions } from "@/domain/article";
import { Source } from "@/domain/source";
import { mapRssItem, RssItem } from "./article-mapper";

const DEFAULT_LIMIT = 20;
const FETCH_TIMEOUT_MS = 10_000;

type Fetcher = typeof fetch;

interface ParsedFeed {
  rss?: { channel?: { item?: RssItem | RssItem[] } };
  feed?: { entry?: RssItem | RssItem[] };
}

export class RssArticleFetcher implements ArticleFetcher {
  private readonly parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
  });

  constructor(private readonly fetchImpl: Fetcher = fetch) {}

  async fetchBySource(source: Source, options: FetchOptions = {}): Promise<Article[]> {
    const res = await this.fetchImpl(source.baseUrl, {
      headers: {
        "User-Agent": "FeedFlow/1.0 (+https://github.com/woocky17/FeedFlow)",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!res.ok) {
      throw new Error(`RSS HTTP error ${res.status} for source "${source.name}"`);
    }

    const xml = await res.text();
    const parsed = this.parser.parse(xml) as ParsedFeed;

    const rawItems = this.extractItems(parsed);
    const limit = options.limit ?? DEFAULT_LIMIT;
    const articles: Article[] = [];

    for (const raw of rawItems) {
      const props = mapRssItem(raw, source.id, source.language);
      if (!props) continue;

      if (options.from && props.publishedAt < options.from) continue;
      if (options.to && props.publishedAt > options.to) continue;

      try {
        articles.push(Article.create(props));
      } catch {
        continue;
      }

      if (articles.length >= limit) break;
    }

    return articles;
  }

  private extractItems(parsed: ParsedFeed): RssItem[] {
    const rssItems = parsed.rss?.channel?.item;
    if (rssItems) return Array.isArray(rssItems) ? rssItems : [rssItems];

    const atomEntries = parsed.feed?.entry;
    if (atomEntries) return Array.isArray(atomEntries) ? atomEntries : [atomEntries];

    return [];
  }
}
