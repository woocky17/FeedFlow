import { Source, SourceRepository } from "@/domain/source";
import { prisma } from "./client";

export class PrismaSourceRepository implements SourceRepository {
  async save(source: Source): Promise<void> {
    await prisma.source.create({
      data: {
        id: source.id,
        name: source.name,
        baseUrl: source.baseUrl,
        active: source.active,
        createdAt: source.createdAt,
      },
    });
  }

  async findById(id: string): Promise<Source | null> {
    const row = await prisma.source.findUnique({ where: { id } });

    if (!row) return null;

    return Source.create({
      id: row.id,
      name: row.name,
      baseUrl: row.baseUrl,
      active: row.active,
      createdAt: row.createdAt,
    });
  }

  async findActive(): Promise<Source[]> {
    const rows = await prisma.source.findMany({ where: { active: true } });

    return rows.map((row) =>
      Source.create({
        id: row.id,
        name: row.name,
        baseUrl: row.baseUrl,
        active: row.active,
        createdAt: row.createdAt,
      }),
    );
  }

  async update(source: Source): Promise<void> {
    await prisma.source.update({
      where: { id: source.id },
      data: {
        name: source.name,
        baseUrl: source.baseUrl,
        active: source.active,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.source.delete({ where: { id } });
  }
}
