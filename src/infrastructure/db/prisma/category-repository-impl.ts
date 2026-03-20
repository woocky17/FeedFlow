import { Categoria } from "@/domain/category";
import { CategoriaRepository } from "@/domain/category";
import { prisma } from "./client";

export class PrismaCategoryRepository implements CategoriaRepository {
  async crear(category: Categoria): Promise<void> {
    await prisma.category.create({
      data: {
        id: category.id,
        name: category.name,
        type: category.type === "default" ? "DEFAULT" : "CUSTOM",
        userId: category.userId,
        createdAt: category.createdAt,
      },
    });
  }

  async actualizar(category: Categoria): Promise<void> {
    await prisma.category.update({
      where: { id: category.id },
      data: {
        name: category.name,
        type: category.type === "default" ? "DEFAULT" : "CUSTOM",
        userId: category.userId,
      },
    });
  }

  async obtener(id: string): Promise<Categoria | null> {
    const row = await prisma.category.findUnique({ where: { id } });
    if (!row) return null;

    return Categoria.create({
      id: row.id,
      name: row.name,
      type: row.type === "DEFAULT" ? "default" : "custom",
      userId: row.userId,
      createdAt: row.createdAt,
    });
  }

  async obtenerPorUsuario(userId: string): Promise<Categoria[]> {
    const rows = await prisma.category.findMany({ where: { userId } });

    return rows.map((row) =>
      Categoria.create({
        id: row.id,
        name: row.name,
        type: row.type === "DEFAULT" ? "default" : "custom",
        userId: row.userId,
        createdAt: row.createdAt,
      }),
    );
  }

  async eliminar(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  }
}
