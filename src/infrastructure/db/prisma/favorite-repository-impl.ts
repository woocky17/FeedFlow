import { Favorito } from "@/domain/favorite";
import { FavoritoRepository } from "@/domain/favorite";
import { prisma } from "./client";

export class PrismaFavoriteRepository implements FavoritoRepository {
  async anadir(favorite: Favorito): Promise<void> {
    await prisma.favorite.create({
      data: {
        id: favorite.id,
        userId: favorite.userId,
        articleId: favorite.articleId,
        createdAt: favorite.createdAt,
      },
    });
  }

  async obtenerPorUsuario(userId: string): Promise<Favorito[]> {
    const rows = await prisma.favorite.findMany({ where: { userId } });

    return rows.map((row) =>
      Favorito.create({
        id: row.id,
        userId: row.userId,
        articleId: row.articleId,
        createdAt: row.createdAt,
      }),
    );
  }

  async eliminar(id: string): Promise<void> {
    await prisma.favorite.delete({ where: { id } });
  }
}
