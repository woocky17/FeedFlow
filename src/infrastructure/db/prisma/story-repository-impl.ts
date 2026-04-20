import {
  Story,
  StoryArticle,
  StoryRepository,
  StoryWithCounts,
} from "@/domain/story";
import { prisma } from "./client";

export class PrismaStoryRepository implements StoryRepository {
  async create(story: Story): Promise<void> {
    await prisma.story.create({
      data: {
        id: story.id,
        userId: story.userId,
        name: story.name,
        summary: story.summary,
        embedding: story.embedding,
        sourceArticleId: story.sourceArticleId,
        threshold: story.threshold,
        active: story.active,
        createdAt: story.createdAt,
      },
    });
  }

  async findById(id: string): Promise<Story | null> {
    const row = await prisma.story.findUnique({ where: { id } });
    if (!row) return null;
    return Story.create({
      id: row.id,
      userId: row.userId,
      name: row.name,
      summary: row.summary,
      embedding: row.embedding,
      sourceArticleId: row.sourceArticleId,
      threshold: row.threshold,
      active: row.active,
      createdAt: row.createdAt,
    });
  }

  async findByUser(userId: string): Promise<StoryWithCounts[]> {
    const rows = await prisma.story.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { articles: true } },
        articles: {
          orderBy: { article: { publishedAt: "desc" } },
          take: 1,
          include: { article: { select: { publishedAt: true } } },
        },
      },
    });

    return rows.map((row) => ({
      story: Story.create({
        id: row.id,
        userId: row.userId,
        name: row.name,
        summary: row.summary,
        embedding: row.embedding,
        sourceArticleId: row.sourceArticleId,
        threshold: row.threshold,
        active: row.active,
        createdAt: row.createdAt,
      }),
      articleCount: row._count.articles,
      latestArticleAt: row.articles[0]?.article.publishedAt ?? null,
    }));
  }

  async findActive(): Promise<Story[]> {
    const rows = await prisma.story.findMany({ where: { active: true } });
    return rows.map((row) =>
      Story.create({
        id: row.id,
        userId: row.userId,
        name: row.name,
        summary: row.summary,
        embedding: row.embedding,
        sourceArticleId: row.sourceArticleId,
        threshold: row.threshold,
        active: row.active,
        createdAt: row.createdAt,
      }),
    );
  }

  async existsForUserAndArticle(userId: string, articleId: string): Promise<boolean> {
    const count = await prisma.story.count({
      where: { userId, sourceArticleId: articleId },
    });
    return count > 0;
  }

  async delete(id: string): Promise<void> {
    await prisma.story.delete({ where: { id } });
  }

  async updateEmbedding(id: string, embedding: number[]): Promise<void> {
    await prisma.story.update({ where: { id }, data: { embedding } });
  }

  async addArticle(link: StoryArticle): Promise<void> {
    await prisma.storyArticle.upsert({
      where: {
        storyId_articleId: { storyId: link.storyId, articleId: link.articleId },
      },
      update: { similarity: link.similarity },
      create: {
        id: link.id,
        storyId: link.storyId,
        articleId: link.articleId,
        similarity: link.similarity,
        addedAt: link.addedAt,
      },
    });
  }

  async findArticlesForStory(storyId: string) {
    const rows = await prisma.storyArticle.findMany({
      where: { storyId },
      orderBy: { article: { publishedAt: "desc" } },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            url: true,
            description: true,
            image: true,
            sourceId: true,
            publishedAt: true,
          },
        },
      },
    });

    return rows.map((row) => ({
      id: row.article.id,
      title: row.article.title,
      url: row.article.url,
      description: row.article.description,
      image: row.article.image,
      sourceId: row.article.sourceId,
      publishedAt: row.article.publishedAt,
      similarity: row.similarity,
    }));
  }

  async countArticles(storyId: string): Promise<number> {
    return prisma.storyArticle.count({ where: { storyId } });
  }

  async getMemberEmbeddings(storyId: string): Promise<number[][]> {
    const rows = await prisma.storyArticle.findMany({
      where: { storyId },
      include: { article: { select: { embedding: true } } },
    });
    return rows
      .map((r) => r.article.embedding)
      .filter((e): e is number[] => Array.isArray(e) && e.length > 0);
  }
}
