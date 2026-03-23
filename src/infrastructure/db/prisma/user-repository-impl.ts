import { User } from "@/domain/user";
import { UserRepository } from "@/domain/user";
import { prisma } from "./client";

export class PrismaUserRepository implements UserRepository {
  async save(user: User): Promise<void> {
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role === "admin" ? "ADMIN" : "USER",
        createdAt: user.createdAt,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    const row = await prisma.user.findUnique({ where: { id } });
    if (!row) return null;

    return User.create({
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      role: row.role === "ADMIN" ? "admin" : "user",
      createdAt: row.createdAt,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await prisma.user.findUnique({ where: { email } });
    if (!row) return null;

    return User.create({
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      role: row.role === "ADMIN" ? "admin" : "user",
      createdAt: row.createdAt,
    });
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
}
