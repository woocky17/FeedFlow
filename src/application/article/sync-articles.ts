import { ArticleFetcher } from "@/domain/article";
import { SourceRepository } from "@/domain/source";
import { IngestArticle } from "./ingest-article";

export interface CategoryClassifier {
  classify(title: string, description: string): Promise<string[]>;
}

export interface StoryMatcher {
  execute(input: { articleId: string; title: string; description: string | null }): Promise<{ storiesMatched: number }>;
}

export interface ArticleClusterer {
  execute(input: { articleId: string; title: string; description: string | null }): Promise<{ eventId: string; created: boolean }>;
}

export interface SentimentEnricher {
  execute(input: { articleId: string; title: string; description: string | null }): Promise<void>;
}

export class SyncArticles {
  constructor(
    private readonly sourceRepository: SourceRepository,
    private readonly articlesFetcher: ArticleFetcher,
    private readonly ingestArticle: IngestArticle,
  ) {}

  async execute(): Promise<{ synced: number; errors: string[] }> {
    const sources = await this.sourceRepository.findActive();
    let synced = 0;
    const errors: string[] = [];

    let quotaExhausted = false;

    for (const source of sources) {
      if (quotaExhausted) {
        errors.push(`Skipped ${source.name}: WorldNewsAPI quota exhausted`);
        continue;
      }
      try {
        const articles = await this.articlesFetcher.fetchBySource(source);

        for (const article of articles) {
          const result = await this.ingestArticle.execute(article);
          if (result.ingested) synced++;
          errors.push(...result.errors);
        }
      } catch (error) {
        if (error && typeof error === "object" && (error as { name?: string }).name === "QuotaExhaustedError") {
          quotaExhausted = true;
          errors.push(`WorldNewsAPI quota exhausted at source ${source.name}`);
          continue;
        }
        errors.push(`Failed to sync source ${source.id}: ${error}`);
      }
    }

    return { synced, errors };
  }
}
