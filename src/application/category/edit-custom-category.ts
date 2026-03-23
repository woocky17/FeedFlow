import { Category } from "@/domain/category";
import { CategoryRepository } from "@/domain/category";

interface EditCustomCategoryInput {
  categoryId: string;
  userId: string;
  name: string;
}

export class EditCustomCategory {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(input: EditCustomCategoryInput): Promise<Category> {
    const category = await this.categoryRepository.findById(input.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    if (category.userId !== input.userId) {
      throw new Error("Category does not belong to this user");
    }

    const updated = Category.create({
      id: category.id,
      name: input.name,
      type: category.type,
      userId: category.userId,
      createdAt: category.createdAt,
    });

    await this.categoryRepository.update(updated);

    return updated;
  }
}
