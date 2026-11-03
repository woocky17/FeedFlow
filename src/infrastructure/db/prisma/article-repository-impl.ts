import { Article } from "@/domain/article";
import { ArticleRepository, ArticleSummary } from "@/domain/article";
import type { SentimentResult } from "@/domain/news-event";
import { prisma } from "./client";
import { fromPrismaLanguage, toPrismaLanguage } from "./language-mapper";

type ArticleRow = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  image: string | null;
  sourceId: string;
  language: "ES" | "EN";
  publishedAt: Date;
  savedAt: Date;
};

function toDomain(row: ArticleRow): Article {
  return Article.create({
    id: row.id,
    title: row.title,
    url: row.url,
    description: row.description ?? "",
    image: row.image ?? "",
    sourceId: row.sourceId,
    language: fromPrismaLanguage(row.language),
    publishedAt: row.publishedAt,
    savedAt: row.savedAt,
  });
}

export class PrismaArticleRepository implements ArticleRepository {
  async save(article: Article): Promise<void> {
    await prisma.article.create({
      data: {
        id: article.id,
        title: article.title,
        url: article.url,
        description: article.description,
        image: article.image,
        sourceId: article.sourceId,
        language: toPrismaLanguage(article.language),
        publishedAt: article.publishedAt,
        savedAt: article.savedAt,
      },
    });
  }

  async findAll(): Promise<Article[]> {
    const rows = await prisma.article.findMany({
      orderBy: { publishedAt: "desc" },
    });

    return rows.map(toDomain);
  }

  async findByCategory(categoryId: string): Promise<Article[]> {
    const rows = await prisma.article.findMany({
      where: {
        categoryAssignments: { some: { categoryId } },
      },
      orderBy: { publishedAt: "desc" },
    });

    return rows.map(toDomain);
  }

  async existsByUrl(url: string): Promise<boolean> {
    const count = await prisma.article.count({ where: { url } });
    return count > 0;
  }

  async findUncategorizedSince(since: Date, limit: number): Promise<ArticleSummary[]> {
    return prisma.article.findMany({
      where: {
        savedAt: { gte: since },
        categoryAssignments: { none: {} },
      },
      select: { id: true, title: true, description: true },
      take: limit,
    });
  }

  async findUnclusteredSince(since: Date, limit: number): Promise<ArticleSummary[]> {
    return prisma.article.findMany({
      where: {
        savedAt: { gte: since },
        newsEventId: null,
      },
      select: { id: true, title: true, description: true },
      orderBy: { publishedAt: "asc" },
      take: limit,
    });
  }

  async findWithoutSentimentSince(since: Date, limit: number): Promise<ArticleSummary[]> {
    return prisma.article.findMany({
      where: {
        savedAt: { gte: since },
        sentiment: null,
      },
      select: { id: true, title: true, description: true },
      take: limit,
    });
  }

  async updateSentiment(articleId: string, result: SentimentResult): Promise<void> {
    await prisma.article.update({
      where: { id: articleId },
      data: {
        sentiment: result.sentiment,
        framingSummary: result.framing,
      },
    });
  }
}
