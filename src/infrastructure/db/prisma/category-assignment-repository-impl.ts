import { AsignacionCategoria, AssignmentOrigin } from "@/domain/category";
import { AsignacionCategoriaRepository } from "@/domain/category";
import { prisma } from "./client";

export class PrismaCategoryAssignmentRepository implements AsignacionCategoriaRepository {
  async crear(assignment: AsignacionCategoria): Promise<void> {
    await prisma.categoryAssignment.create({
      data: {
        articleId: assignment.articleId,
        categoryId: assignment.categoryId,
        userId: assignment.userId || null,
        origin: assignment.origin === "manual" ? "MANUAL" : "AUTO",
        assignedAt: assignment.assignedAt,
      },
    });
  }

  async obtenerPorNoticia(articleId: string): Promise<AsignacionCategoria[]> {
    const rows = await prisma.categoryAssignment.findMany({
      where: { articleId },
    });

    return rows.map((row) =>
      AsignacionCategoria.create({
        articleId: row.articleId,
        categoryId: row.categoryId,
        userId: row.userId ?? "",
        origin: row.origin === "MANUAL" ? "manual" : "auto",
        assignedAt: row.assignedAt,
      }),
    );
  }

  async actualizarOrigen(
    articleId: string,
    categoryId: string,
    origin: AssignmentOrigin,
  ): Promise<void> {
    await prisma.categoryAssignment.updateMany({
      where: { articleId, categoryId },
      data: { origin: origin === "manual" ? "MANUAL" : "AUTO" },
    });
  }
}
