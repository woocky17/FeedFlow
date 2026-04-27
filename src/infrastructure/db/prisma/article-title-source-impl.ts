import type { ArticleTitleSource } from "@/application/article-translation";
import type { Language } from "@/domain/shared";
import { prisma } from "./client";
import { fromPrismaLanguage } from "./language-mapper";

export class PrismaArticleTitleSource implements ArticleTitleSource {
  async findRecent(
    windowHours: number,
    limit: number,
  ): Promise<Array<{ id: string; title: string; language: Language }>> {
    const since = new Date(Date.now() - windowHours * 60 * 60 * 1000);
    const rows = await prisma.article.findMany({
      where: { savedAt: { gte: since } },
      orderBy: { savedAt: "desc" },
      take: limit,
      select: { id: true, title: true, language: true },
    });
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      language: fromPrismaLanguage(row.language),
    }));
  }
}
