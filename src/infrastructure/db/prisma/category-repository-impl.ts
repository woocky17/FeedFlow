import { Category } from "@/domain/category";
import { CategoryRepository } from "@/domain/category";
import { prisma } from "./client";

export class PrismaCategoryRepository implements CategoryRepository {
  async create(category: Category): Promise<void> {
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

  async update(category: Category): Promise<void> {
    await prisma.category.update({
      where: { id: category.id },
      data: {
        name: category.name,
        type: category.type === "default" ? "DEFAULT" : "CUSTOM",
        userId: category.userId,
      },
    });
  }

  async findById(id: string): Promise<Category | null> {
    const row = await prisma.category.findUnique({ where: { id } });
    if (!row) return null;

    return Category.create({
      id: row.id,
      name: row.name,
      type: row.type === "DEFAULT" ? "default" : "custom",
      userId: row.userId,
      createdAt: row.createdAt,
    });
  }

  async findByUser(userId: string): Promise<Category[]> {
    const rows = await prisma.category.findMany({ where: { userId } });

    return rows.map((row) =>
      Category.create({
        id: row.id,
        name: row.name,
        type: row.type === "DEFAULT" ? "default" : "custom",
        userId: row.userId,
        createdAt: row.createdAt,
      }),
    );
  }

  async findDefault(): Promise<Category[]> {
    const rows = await prisma.category.findMany({
      where: { type: "DEFAULT", userId: null },
    });

    return rows.map((row) =>
      Category.create({
        id: row.id,
        name: row.name,
        type: "default",
        userId: row.userId,
        createdAt: row.createdAt,
      }),
    );
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  }
}
