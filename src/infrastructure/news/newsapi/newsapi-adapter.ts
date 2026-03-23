import { Article } from "@/domain/article";
import { ArticleFetcher } from "@/domain/article";
import { Source } from "@/domain/source";
import { mapNewsApiArticle, NewsApiArticle } from "./article-mapper";

const NEWSAPI_BASE_URL = "https://newsapi.org/v2";
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsApiArticle[];
  code?: string;
  message?: string;
}

export class NewsApiAdapter implements ArticleFetcher {
  constructor(private readonly apiKey: string) {}

  async fetchBySource(source: Source): Promise<Article[]> {
    const url = `${NEWSAPI_BASE_URL}/everything?domains=${this.extractDomain(source.baseUrl)}&apiKey=${this.apiKey}&pageSize=20`;

    const response = await this.fetchWithRetry(url);

    if (response.status !== "ok") {
      throw new Error(
        `NewsAPI error: ${response.code ?? "unknown"} - ${response.message ?? "Unknown error"}`,
      );
    }

    return response.articles
      .filter((a) => a.title && a.url)
      .map((a) => Article.create(mapNewsApiArticle(a, source.id)));
  }

  private async fetchWithRetry(
    url: string,
    attempt = 0,
  ): Promise<NewsApiResponse> {
    try {
      const res = await fetch(url);

      if (res.status === 429) {
        if (attempt < MAX_RETRIES) {
          await this.delay(RETRY_DELAY_MS * (attempt + 1));
          return this.fetchWithRetry(url, attempt + 1);
        }
        throw new Error("NewsAPI rate limit exceeded");
      }

      if (!res.ok) {
        throw new Error(`NewsAPI HTTP error: ${res.status}`);
      }

      return (await res.json()) as NewsApiResponse;
    } catch (error) {
      if (attempt < MAX_RETRIES && this.isRetryableError(error)) {
        await this.delay(RETRY_DELAY_MS * (attempt + 1));
        return this.fetchWithRetry(url, attempt + 1);
      }
      throw error;
    }
  }

  private extractDomain(url: string): string {
    return new URL(url).hostname.replace(/^www\./, "");
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private isRetryableError(error: unknown): boolean {
    return (
      error instanceof TypeError ||
      (error instanceof Error && error.message.includes("timeout"))
    );
  }
}
