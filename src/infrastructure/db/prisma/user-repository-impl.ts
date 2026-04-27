import { User } from "@/domain/user";
import { UserRepository } from "@/domain/user";
import type { Language } from "@/domain/shared";
import { prisma } from "./client";
import { fromPrismaLanguage, toPrismaLanguage } from "./language-mapper";

type UserRow = {
  id: string;
  email: string;
  passwordHash: string;
  role: "USER" | "ADMIN";
  language: "ES" | "EN";
  createdAt: Date;
};

function toDomain(row: UserRow): User {
  return User.create({
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    role: row.role === "ADMIN" ? "admin" : "user",
    language: fromPrismaLanguage(row.language),
    createdAt: row.createdAt,
  });
}

export class PrismaUserRepository implements UserRepository {
  async save(user: User): Promise<void> {
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role === "admin" ? "ADMIN" : "USER",
        language: toPrismaLanguage(user.language),
        createdAt: user.createdAt,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    const row = await prisma.user.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await prisma.user.findUnique({ where: { email } });
    return row ? toDomain(row) : null;
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async updateLanguage(id: string, language: Language): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { language: toPrismaLanguage(language) },
    });
  }
}
