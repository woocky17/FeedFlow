import { Category } from "@/domain/category";
import { CategoryRepository } from "@/domain/category";

interface CreateCustomCategoryInput {
  id: string;
  name: string;
  userId: string;
}

export class CreateCustomCategory {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(input: CreateCustomCategoryInput): Promise<Category> {
    const existing = await this.categoryRepository.findByUser(input.userId);
    const duplicate = existing.some((cat) => cat.name === input.name);
    if (duplicate) {
      throw new Error("Category name already exists for this user");
    }

    const category = Category.create({
      id: input.id,
      name: input.name,
      type: "custom",
      userId: input.userId,
      createdAt: new Date(),
    });

    await this.categoryRepository.create(category);

    return category;
  }
}
