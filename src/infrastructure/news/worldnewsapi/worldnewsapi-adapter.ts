import { Article } from "@/domain/article";
import { ArticleFetcher, FetchOptions } from "@/domain/article";
import { Source } from "@/domain/source";
import { mapWorldNewsArticle, WorldNewsArticle } from "./article-mapper";

const BASE_URL = "https://api.worldnewsapi.com";
const DEFAULT_LIMIT = 20;

interface WorldNewsResponse {
  news: WorldNewsArticle[];
  available: number;
}

export class QuotaExhaustedError extends Error {
  constructor(message = "WorldNewsAPI daily quota exhausted") {
    super(message);
    this.name = "QuotaExhaustedError";
  }
}

export class WorldNewsApiAdapter implements ArticleFetcher {
  async fetchBySource(source: Source, options: FetchOptions = {}): Promise<Article[]> {
    if (!source.apiKey) {
      throw new Error(`Source "${source.name}" has no API key configured`);
    }

    const domain = this.extractDomain(source.baseUrl);
    const limit = options.limit ?? DEFAULT_LIMIT;

    const params = new URLSearchParams({
      "news-sources": `https://${domain}`,
      language: source.language,
      number: String(limit),
    });
    if (options.from) params.set("earliest-publish-date", this.formatDate(options.from));
    if (options.to) params.set("latest-publish-date", this.formatDate(options.to));

    const url = `${BASE_URL}/search-news?${params.toString()}`;

    const res = await fetch(url, {
      headers: { "x-api-key": source.apiKey },
    });

    const left = res.headers.get("x-api-quota-left");
    const used = res.headers.get("x-api-quota-used");
    const cost = res.headers.get("x-api-quota-request");
    if (left !== null || used !== null) {
      console.log(
        `[WorldNewsAPI] source=${source.name} cost=${cost ?? "?"} used=${used ?? "?"} left=${left ?? "?"}`,
      );
    }

    if (res.status === 402) {
      throw new QuotaExhaustedError();
    }

    if (!res.ok) {
      throw new Error(`WorldNewsAPI HTTP error: ${res.status}`);
    }

    const data = (await res.json()) as WorldNewsResponse;

    return (data.news ?? [])
      .filter((a) => a.title && a.url)
      .map((a) => Article.create(mapWorldNewsArticle(a, source.id, source.language)));
  }

  private extractDomain(url: string): string {
    return new URL(url).hostname.replace(/^www\./, "");
  }

  private formatDate(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
  }
}
