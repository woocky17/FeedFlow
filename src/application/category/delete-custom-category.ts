import { CategoryRepository } from "@/domain/category";

interface DeleteCustomCategoryInput {
  categoryId: string;
  userId: string;
}

export class DeleteCustomCategory {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(input: DeleteCustomCategoryInput): Promise<void> {
    const category = await this.categoryRepository.findById(input.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    if (category.userId !== input.userId) {
      throw new Error("Category does not belong to this user");
    }

    await this.categoryRepository.delete(input.categoryId);
  }
}
