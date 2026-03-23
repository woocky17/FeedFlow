import { Article } from "@/domain/article";
import { ArticleRepository } from "@/domain/article";
import { prisma } from "./client";

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
        publishedAt: article.publishedAt,
        savedAt: article.savedAt,
      },
    });
  }

  async findAll(): Promise<Article[]> {
    const rows = await prisma.article.findMany({
      orderBy: { publishedAt: "desc" },
    });

    return rows.map((row) =>
      Article.create({
        id: row.id,
        title: row.title,
        url: row.url,
        description: row.description ?? "",
        image: row.image ?? "",
        sourceId: row.sourceId,
        publishedAt: row.publishedAt,
        savedAt: row.savedAt,
      }),
    );
  }

  async findByCategory(categoryId: string): Promise<Article[]> {
    const rows = await prisma.article.findMany({
      where: {
        categoryAssignments: { some: { categoryId } },
      },
      orderBy: { publishedAt: "desc" },
    });

    return rows.map((row) =>
      Article.create({
        id: row.id,
        title: row.title,
        url: row.url,
        description: row.description ?? "",
        image: row.image ?? "",
        sourceId: row.sourceId,
        publishedAt: row.publishedAt,
        savedAt: row.savedAt,
      }),
    );
  }

  async findBySource(sourceId: string): Promise<Article[]> {
    const rows = await prisma.article.findMany({
      where: { sourceId },
      orderBy: { publishedAt: "desc" },
    });

    return rows.map((row) =>
      Article.create({
        id: row.id,
        title: row.title,
        url: row.url,
        description: row.description ?? "",
        image: row.image ?? "",
        sourceId: row.sourceId,
        publishedAt: row.publishedAt,
        savedAt: row.savedAt,
      }),
    );
  }

  async existsByUrl(url: string): Promise<boolean> {
    const count = await prisma.article.count({ where: { url } });
    return count > 0;
  }
}
