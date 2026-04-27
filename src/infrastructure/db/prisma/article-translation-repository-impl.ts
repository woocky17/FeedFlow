import { ArticleTranslation } from "@/domain/article-translation";
import type { ArticleTranslationRepository } from "@/domain/article-translation";
import type { Language } from "@/domain/shared";
import { prisma } from "./client";
import { fromPrismaLanguage, toPrismaLanguage } from "./language-mapper";

type ArticleTranslationRow = {
  articleId: string;
  targetLang: "ES" | "EN";
  title: string;
  description: string | null;
  provider: string;
  createdAt: Date;
};

function toDomain(row: ArticleTranslationRow): ArticleTranslation {
  return ArticleTranslation.create({
    articleId: row.articleId,
    targetLang: fromPrismaLanguage(row.targetLang),
    title: row.title,
    description: row.description,
    provider: row.provider,
    createdAt: row.createdAt,
  });
}

export class PrismaArticleTranslationRepository implements ArticleTranslationRepository {
  async findOne(articleId: string, targetLang: Language): Promise<ArticleTranslation | null> {
    const row = await prisma.articleTranslation.findUnique({
      where: {
        articleId_targetLang: {
          articleId,
          targetLang: toPrismaLanguage(targetLang),
        },
      },
    });
    return row ? toDomain(row) : null;
  }

  async findManyByArticleIds(
    articleIds: string[],
    targetLang: Language,
  ): Promise<Map<string, ArticleTranslation>> {
    if (articleIds.length === 0) return new Map();
    const rows = await prisma.articleTranslation.findMany({
      where: {
        articleId: { in: articleIds },
        targetLang: toPrismaLanguage(targetLang),
      },
    });
    return new Map(rows.map((row) => [row.articleId, toDomain(row)]));
  }

  async upsert(translation: ArticleTranslation): Promise<void> {
    const targetLang = toPrismaLanguage(translation.targetLang);
    await prisma.articleTranslation.upsert({
      where: {
        articleId_targetLang: { articleId: translation.articleId, targetLang },
      },
      update: {
        title: translation.title,
        description: translation.description,
        provider: translation.provider,
      },
      create: {
        articleId: translation.articleId,
        targetLang,
        title: translation.title,
        description: translation.description,
        provider: translation.provider,
      },
    });
  }
}
