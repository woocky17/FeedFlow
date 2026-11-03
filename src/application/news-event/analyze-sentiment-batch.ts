import { ArticleRepository } from "@/domain/article";
import { SentimentAnalyzer, SentimentInput } from "@/domain/news-event";

const DEFAULT_BATCH_SIZE = 8;

export class AnalyzeSentimentBatch {
  constructor(
    private readonly analyzer: SentimentAnalyzer,
    private readonly articleRepository: ArticleRepository,
    private readonly batchSize: number = DEFAULT_BATCH_SIZE,
  ) {}

  async execute(items: SentimentInput[]): Promise<{ analyzed: number; skipped: number }> {
    let analyzed = 0;
    let skipped = 0;

    for (let i = 0; i < items.length; i += this.batchSize) {
      const batch = items.slice(i, i + this.batchSize);
      const results = await this.analyzer.analyzeBatch(batch);
      const byId = new Map(results.map((r) => [r.id, r.result]));

      for (const item of batch) {
        const result = byId.get(item.id);
        if (!result) {
          skipped++;
          continue;
        }
        await this.articleRepository.updateSentiment(item.id, result);
        analyzed++;
      }
    }

    return { analyzed, skipped };
  }
}
