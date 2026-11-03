import { CategoryAssignment } from "@/domain/category";
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
}
