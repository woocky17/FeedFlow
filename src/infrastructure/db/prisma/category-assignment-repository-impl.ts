import { CategoryAssignment, AssignmentOrigin } from "@/domain/category";
import { CategoryAssignmentRepository } from "@/domain/category";
import { prisma } from "./client";

export class PrismaCategoryAssignmentRepository implements CategoryAssignmentRepository {
  async create(assignment: CategoryAssignment): Promise<void> {
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

  async findByArticle(articleId: string): Promise<CategoryAssignment[]> {
    const rows = await prisma.categoryAssignment.findMany({
      where: { articleId },
    });

    return rows.map((row) =>
      CategoryAssignment.create({
        articleId: row.articleId,
        categoryId: row.categoryId,
        userId: row.userId ?? "",
        origin: row.origin === "MANUAL" ? "manual" : "auto",
        assignedAt: row.assignedAt,
      }),
    );
  }

  async updateOrigin(
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
