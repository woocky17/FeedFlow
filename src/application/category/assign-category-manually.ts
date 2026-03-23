import { CategoryAssignment } from "@/domain/category";
import { CategoryAssignmentRepository } from "@/domain/category";

interface AssignCategoryManuallyInput {
  articleId: string;
  categoryId: string;
  userId: string;
}

export class AssignCategoryManually {
  constructor(
    private readonly assignmentRepository: CategoryAssignmentRepository,
  ) {}

  async execute(input: AssignCategoryManuallyInput): Promise<CategoryAssignment> {
    const existing = await this.assignmentRepository.findByArticle(input.articleId);
    const match = existing.find((a) => a.categoryId === input.categoryId);

    if (match) {
      await this.assignmentRepository.updateOrigin(
        input.articleId,
        input.categoryId,
        "manual",
      );
      return CategoryAssignment.create({
        articleId: input.articleId,
        categoryId: input.categoryId,
        userId: input.userId,
        origin: "manual",
        assignedAt: new Date(),
      });
    }

    const assignment = CategoryAssignment.create({
      articleId: input.articleId,
      categoryId: input.categoryId,
      userId: input.userId,
      origin: "manual",
      assignedAt: new Date(),
    });

    await this.assignmentRepository.create(assignment);

    return assignment;
  }
}
