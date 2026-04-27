import { Article } from "@/domain/article";
import { ArticleRepository } from "@/domain/article";
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

  async findBySource(sourceId: string): Promise<Article[]> {
    const rows = await prisma.article.findMany({
      where: { sourceId },
      orderBy: { publishedAt: "desc" },
    });

    return rows.map(toDomain);
  }

  async existsByUrl(url: string): Promise<boolean> {
    const count = await prisma.article.count({ where: { url } });
    return count > 0;
  }
}
