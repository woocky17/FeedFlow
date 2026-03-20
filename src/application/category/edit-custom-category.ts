import { Categoria } from "@/domain/category";
import { CategoriaRepository } from "@/domain/category";

interface EditCustomCategoryInput {
  categoryId: string;
  userId: string;
  name: string;
}

export class EditCustomCategory {
  constructor(private readonly categoryRepository: CategoriaRepository) {}

  async execute(input: EditCustomCategoryInput): Promise<Categoria> {
    const category = await this.categoryRepository.obtener(input.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    if (category.userId !== input.userId) {
      throw new Error("Category does not belong to this user");
    }

    const updated = Categoria.create({
      id: category.id,
      name: input.name,
      type: category.type,
      userId: category.userId,
      createdAt: category.createdAt,
    });

    await this.categoryRepository.actualizar(updated);

    return updated;
  }
}
