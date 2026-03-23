import { Category } from "@/domain/category";
import { CategoryRepository } from "@/domain/category";

interface CreateDefaultCategoryInput {
  id: string;
  name: string;
}

interface UpdateDefaultCategoryInput {
  categoryId: string;
  name: string;
}

interface DeleteDefaultCategoryInput {
  categoryId: string;
}

export class ManageDefaultCategories {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(input: CreateDefaultCategoryInput): Promise<Category> {
    const category = Category.create({
      id: input.id,
      name: input.name,
      type: "default",
      userId: null,
      createdAt: new Date(),
    });

    await this.categoryRepository.create(category);

    return category;
  }

  async update(input: UpdateDefaultCategoryInput): Promise<Category> {
    const category = await this.categoryRepository.findById(input.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    if (category.type !== "default") {
      throw new Error("Only default categories can be managed here");
    }

    const updated = Category.create({
      id: category.id,
      name: input.name,
      type: "default",
      userId: null,
      createdAt: category.createdAt,
    });

    await this.categoryRepository.update(updated);

    return updated;
  }

  async delete(input: DeleteDefaultCategoryInput): Promise<void> {
    const category = await this.categoryRepository.findById(input.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    if (category.type !== "default") {
      throw new Error("Only default categories can be managed here");
    }

    await this.categoryRepository.delete(input.categoryId);
  }
}
