import { CategoryAssignment, CategoryAssignmentRepository } from "@/domain/category";
import { prisma } from "@/infrastructure/db/prisma/client";
import {
  ArticleClusterer,
  CategoryClassifier,
} from "./sync-articles";
import { AnalyzeSentimentBatch } from "../news-event/analyze-sentiment-batch";

interface HealReport {
  classified: number;
  clustered: number;
  sentimentAnalyzed: number;
  sentimentSkipped: number;
}

const HEAL_WINDOW_DAYS = 7;

export class HealArticles {
  constructor(
    private readonly categoryClassifier: CategoryClassifier,
    private readonly assignmentRepository: CategoryAssignmentRepository,
    private readonly articleClusterer: ArticleClusterer,
    private readonly analyzeSentimentBatch: AnalyzeSentimentBatch,
  ) {}

  async execute(): Promise<HealReport> {
    const since = new Date();
    since.setDate(since.getDate() - HEAL_WINDOW_DAYS);

    const report: HealReport = {
      classified: 0,
      clustered: 0,
      sentimentAnalyzed: 0,
      sentimentSkipped: 0,
    };

    const missingCategories = await prisma.article.findMany({
      where: {
        savedAt: { gte: since },
        categoryAssignments: { none: {} },
      },
      select: { id: true, title: true, description: true },
      take: 50,
    });

    for (const a of missingCategories) {
      const categoryIds = await this.categoryClassifier.classify(
        a.title,
        a.description ?? "",
      );
      if (categoryIds.length === 0) continue;
      for (const categoryId of categoryIds) {
        try {
          await this.assignmentRepository.create(
            CategoryAssignment.create({
              articleId: a.id,
              categoryId,
              userId: "",
              origin: "auto",
              assignedAt: new Date(),
            }),
          );
        } catch {
          // ignore duplicates
        }
      }
      report.classified++;
    }

    const missingCluster = await prisma.article.findMany({
      where: {
        savedAt: { gte: since },
        newsEventId: null,
      },
      select: { id: true, title: true, description: true },
      orderBy: { publishedAt: "asc" },
      take: 100,
    });

    for (const a of missingCluster) {
      try {
        await this.articleClusterer.execute({
          articleId: a.id,
          title: a.title,
          description: a.description,
        });
        report.clustered++;
      } catch (err) {
        console.error(`Heal cluster failed for ${a.id}: ${err}`);
      }
    }

    const missingSentiment = await prisma.article.findMany({
      where: {
        savedAt: { gte: since },
        sentiment: null,
      },
      select: { id: true, title: true, description: true },
      take: 40,
    });

    if (missingSentiment.length > 0) {
      const outcome = await this.analyzeSentimentBatch.execute(
        missingSentiment.map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description ?? "",
        })),
      );
      report.sentimentAnalyzed = outcome.analyzed;
      report.sentimentSkipped = outcome.skipped;
    }

    return report;
  }
}
