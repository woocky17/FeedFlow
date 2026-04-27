import { Article, ArticleFetcher, FetchOptions } from "@/domain/article";
import { Source } from "@/domain/source";

export class MultiSourceArticleFetcher implements ArticleFetcher {
  constructor(
    private readonly worldNews: ArticleFetcher,
    private readonly rss: ArticleFetcher,
  ) {}

  fetchBySource(source: Source, options?: FetchOptions): Promise<Article[]> {
    const adapter = source.kind === "rss" ? this.rss : this.worldNews;
    return adapter.fetchBySource(source, options);
  }
}
