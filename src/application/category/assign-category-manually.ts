import { AsignacionCategoria } from "@/domain/category";
import { AsignacionCategoriaRepository } from "@/domain/category";

interface AssignCategoryManuallyInput {
  articleId: string;
  categoryId: string;
  userId: string;
}

export class AssignCategoryManually {
  constructor(
    private readonly assignmentRepository: AsignacionCategoriaRepository,
  ) {}

  async execute(input: AssignCategoryManuallyInput): Promise<AsignacionCategoria> {
    const existing = await this.assignmentRepository.obtenerPorNoticia(input.articleId);
    const match = existing.find((a) => a.categoryId === input.categoryId);

    if (match) {
      await this.assignmentRepository.actualizarOrigen(
        input.articleId,
        input.categoryId,
        "manual",
      );
      return AsignacionCategoria.create({
        articleId: input.articleId,
        categoryId: input.categoryId,
        userId: input.userId,
        origin: "manual",
        assignedAt: new Date(),
      });
    }

    const assignment = AsignacionCategoria.create({
      articleId: input.articleId,
      categoryId: input.categoryId,
      userId: input.userId,
      origin: "manual",
      assignedAt: new Date(),
    });

    await this.assignmentRepository.crear(assignment);

    return assignment;
  }
}
