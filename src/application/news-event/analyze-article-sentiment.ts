import { SentimentAnalyzer } from "@/domain/news-event";
import { prisma } from "@/infrastructure/db/prisma/client";

interface AnalyzeInput {
  articleId: string;
  title: string;
  description: string | null;
}

export class AnalyzeArticleSentiment {
  constructor(private readonly analyzer: SentimentAnalyzer) {}

  async execute(input: AnalyzeInput): Promise<void> {
    const result = await this.analyzer.analyze(input.title, input.description ?? "");
    if (!result) return;
    await prisma.article.update({
      where: { id: input.articleId },
      data: {
        sentiment: result.sentiment,
        framingSummary: result.framing,
      },
    });
  }
}
