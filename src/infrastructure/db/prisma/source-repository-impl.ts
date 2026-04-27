import { Source, SourceKind, SourceRepository } from "@/domain/source";
import { prisma } from "./client";
import { fromPrismaLanguage, toPrismaLanguage } from "./language-mapper";

type PrismaSourceKind = "WORLDNEWS" | "RSS";

function toPrismaKind(kind: SourceKind): PrismaSourceKind {
  return kind === "rss" ? "RSS" : "WORLDNEWS";
}

function fromPrismaKind(kind: PrismaSourceKind): SourceKind {
  return kind === "RSS" ? "rss" : "worldnews";
}

type SourceRow = {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  kind: PrismaSourceKind;
  language: "ES" | "EN";
  active: boolean;
  createdAt: Date;
};

function toDomain(row: SourceRow): Source {
  return Source.create({
    id: row.id,
    name: row.name,
    baseUrl: row.baseUrl,
    apiKey: row.apiKey,
    kind: fromPrismaKind(row.kind),
    language: fromPrismaLanguage(row.language),
    active: row.active,
    createdAt: row.createdAt,
  });
}

export class PrismaSourceRepository implements SourceRepository {
  async save(source: Source): Promise<void> {
    await prisma.source.create({
      data: {
        id: source.id,
        name: source.name,
        baseUrl: source.baseUrl,
        apiKey: source.apiKey,
        kind: toPrismaKind(source.kind),
        language: toPrismaLanguage(source.language),
        active: source.active,
        createdAt: source.createdAt,
      },
    });
  }

  async findById(id: string): Promise<Source | null> {
    const row = await prisma.source.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async findAll(): Promise<Source[]> {
    const rows = await prisma.source.findMany();
    return rows.map(toDomain);
  }

  async findActive(): Promise<Source[]> {
    const rows = await prisma.source.findMany({ where: { active: true } });
    return rows.map(toDomain);
  }

  async update(source: Source): Promise<void> {
    await prisma.source.update({
      where: { id: source.id },
      data: {
        name: source.name,
        baseUrl: source.baseUrl,
        apiKey: source.apiKey,
        kind: toPrismaKind(source.kind),
        language: toPrismaLanguage(source.language),
        active: source.active,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.source.delete({ where: { id } });
  }
}
