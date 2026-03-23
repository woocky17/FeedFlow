import { Article } from "@/domain/article";
import { ArticleFetcher } from "@/domain/article";
import { Source } from "@/domain/source";
import { mapWorldNewsArticle, WorldNewsArticle } from "./article-mapper";

const BASE_URL = "https://api.worldnewsapi.com";

interface WorldNewsResponse {
  news: WorldNewsArticle[];
  available: number;
}

export class WorldNewsApiAdapter implements ArticleFetcher {
  async fetchBySource(source: Source): Promise<Article[]> {
    if (!source.apiKey) {
      throw new Error(`Source "${source.name}" has no API key configured`);
    }

    const domain = this.extractDomain(source.baseUrl);
    const url = `${BASE_URL}/search-news?news-sources=${encodeURIComponent(`https://${domain}`)}&language=en&number=20`;

    const res = await fetch(url, {
      headers: { "x-api-key": source.apiKey },
    });

    if (!res.ok) {
      throw new Error(`WorldNewsAPI HTTP error: ${res.status}`);
    }

    const data = (await res.json()) as WorldNewsResponse;

    return (data.news ?? [])
      .filter((a) => a.title && a.url)
      .map((a) => Article.create(mapWorldNewsArticle(a, source.id)));
  }

  private extractDomain(url: string): string {
    return new URL(url).hostname.replace(/^www\./, "");
  }
}
