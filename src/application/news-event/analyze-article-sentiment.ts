import { ArticleRepository } from "@/domain/article";
import { SentimentAnalyzer } from "@/domain/news-event";

interface AnalyzeInput {
  articleId: string;
  title: string;
  description: string | null;
}

export class AnalyzeArticleSentiment {
  constructor(
    private readonly analyzer: SentimentAnalyzer,
    private readonly articleRepository: ArticleRepository,
  ) {}

  async execute(input: AnalyzeInput): Promise<void> {
    const result = await this.analyzer.analyze(input.title, input.description ?? "");
    if (!result) return;
    await this.articleRepository.updateSentiment(input.articleId, result);
  }
}
