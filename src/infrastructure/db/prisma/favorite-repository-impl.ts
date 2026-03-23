import { Favorite } from "@/domain/favorite";
import { FavoriteRepository } from "@/domain/favorite";
import { prisma } from "./client";

export class PrismaFavoriteRepository implements FavoriteRepository {
  async add(favorite: Favorite): Promise<void> {
    await prisma.favorite.create({
      data: {
        id: favorite.id,
        userId: favorite.userId,
        articleId: favorite.articleId,
        createdAt: favorite.createdAt,
      },
    });
  }

  async findByUser(userId: string): Promise<Favorite[]> {
    const rows = await prisma.favorite.findMany({ where: { userId } });

    return rows.map((row) =>
      Favorite.create({
        id: row.id,
        userId: row.userId,
        articleId: row.articleId,
        createdAt: row.createdAt,
      }),
    );
  }

  async delete(id: string): Promise<void> {
    await prisma.favorite.delete({ where: { id } });
  }

  async deleteByArticle(userId: string, articleId: string): Promise<void> {
    await prisma.favorite.delete({
      where: { userId_articleId: { userId, articleId } },
    });
  }
}
