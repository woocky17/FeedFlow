import {
  ArticleCandidate,
  ArticleEmbeddingRepository,
} from "@/domain/story";
import { prisma } from "./client";

export class PrismaArticleEmbeddingRepository implements ArticleEmbeddingRepository {
  async getEmbedding(articleId: string): Promise<number[] | null> {
    const row = await prisma.article.findUnique({
      where: { id: articleId },
      select: { embedding: true },
    });
    if (!row) return null;
    return Array.isArray(row.embedding) && row.embedding.length > 0
      ? row.embedding
      : null;
  }

  async setEmbedding(articleId: string, embedding: number[]): Promise<void> {
    await prisma.article.update({
      where: { id: articleId },
      data: { embedding },
    });
  }

  async findCandidatesSince(sinceDate: Date): Promise<ArticleCandidate[]> {
    const rows = await prisma.article.findMany({
      where: { publishedAt: { gte: sinceDate } },
      select: {
        id: true,
        title: true,
        description: true,
        publishedAt: true,
        embedding: true,
      },
      orderBy: { publishedAt: "desc" },
    });
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      publishedAt: row.publishedAt,
      embedding: Array.isArray(row.embedding) ? row.embedding : [],
    }));
  }
}
