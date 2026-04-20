import {
  EventArticleView,
  NewsEvent,
  NewsEventRepository,
} from "@/domain/news-event";
import { prisma } from "./client";

export class PrismaNewsEventRepository implements NewsEventRepository {
  async create(event: NewsEvent): Promise<void> {
    await prisma.newsEvent.create({
      data: {
        id: event.id,
        title: event.title,
        embedding: event.embedding,
        firstSeenAt: event.firstSeenAt,
        lastSeenAt: event.lastSeenAt,
        createdAt: event.createdAt,
      },
    });
  }

  async findRecent(sinceDate: Date): Promise<NewsEvent[]> {
    const rows = await prisma.newsEvent.findMany({
      where: { lastSeenAt: { gte: sinceDate } },
      orderBy: { lastSeenAt: "desc" },
    });
    return rows.map((row) =>
      NewsEvent.create({
        id: row.id,
        title: row.title,
        embedding: row.embedding,
        firstSeenAt: row.firstSeenAt,
        lastSeenAt: row.lastSeenAt,
        createdAt: row.createdAt,
      }),
    );
  }

  async findById(id: string): Promise<NewsEvent | null> {
    const row = await prisma.newsEvent.findUnique({ where: { id } });
    if (!row) return null;
    return NewsEvent.create({
      id: row.id,
      title: row.title,
      embedding: row.embedding,
      firstSeenAt: row.firstSeenAt,
      lastSeenAt: row.lastSeenAt,
      createdAt: row.createdAt,
    });
  }

  async attachArticle(eventId: string, articleId: string): Promise<void> {
    await prisma.article.update({
      where: { id: articleId },
      data: { newsEventId: eventId },
    });
  }

  async updateCentroid(
    eventId: string,
    embedding: number[],
    lastSeenAt: Date,
  ): Promise<void> {
    await prisma.newsEvent.update({
      where: { id: eventId },
      data: { embedding, lastSeenAt },
    });
  }

  async getMemberEmbeddings(eventId: string): Promise<number[][]> {
    const rows = await prisma.article.findMany({
      where: { newsEventId: eventId },
      select: { embedding: true },
    });
    return rows
      .map((r) => r.embedding)
      .filter((e): e is number[] => Array.isArray(e) && e.length > 0);
  }

  async countMembers(eventId: string): Promise<number> {
    return prisma.article.count({ where: { newsEventId: eventId } });
  }

  async findArticles(eventId: string): Promise<EventArticleView[]> {
    const rows = await prisma.article.findMany({
      where: { newsEventId: eventId },
      orderBy: { publishedAt: "desc" },
      include: { source: { select: { name: true } } },
    });
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      url: r.url,
      description: r.description,
      image: r.image,
      sourceId: r.sourceId,
      sourceName: r.source.name,
      publishedAt: r.publishedAt,
      sentiment: r.sentiment,
      framingSummary: r.framingSummary,
    }));
  }
}
