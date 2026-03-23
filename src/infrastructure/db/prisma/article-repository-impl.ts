import { Noticia } from "@/domain/article";
import { NoticiaRepository } from "@/domain/article";
import { prisma } from "./client";

export class PrismaArticleRepository implements NoticiaRepository {
  async guardar(article: Noticia): Promise<void> {
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

  async obtenerTodas(): Promise<Noticia[]> {
    const rows = await prisma.article.findMany({
      orderBy: { publishedAt: "desc" },
    });

    return rows.map((row) =>
      Noticia.create({
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

  async obtenerPorCategoria(categoryId: string): Promise<Noticia[]> {
    const rows = await prisma.article.findMany({
      where: {
        categoryAssignments: { some: { categoryId } },
      },
      orderBy: { publishedAt: "desc" },
    });

    return rows.map((row) =>
      Noticia.create({
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

  async obtenerPorFuente(sourceId: string): Promise<Noticia[]> {
    const rows = await prisma.article.findMany({
      where: { sourceId },
      orderBy: { publishedAt: "desc" },
    });

    return rows.map((row) =>
      Noticia.create({
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

  async existePorUrl(url: string): Promise<boolean> {
    const count = await prisma.article.count({ where: { url } });
    return count > 0;
  }
}
