import { CategoriaRepository } from "@/domain/category";

interface DeleteCustomCategoryInput {
  categoryId: string;
  userId: string;
}

export class DeleteCustomCategory {
  constructor(private readonly categoryRepository: CategoriaRepository) {}

  async execute(input: DeleteCustomCategoryInput): Promise<void> {
    const category = await this.categoryRepository.obtener(input.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    if (category.userId !== input.userId) {
      throw new Error("Category does not belong to this user");
    }

    await this.categoryRepository.eliminar(input.categoryId);
  }
}
