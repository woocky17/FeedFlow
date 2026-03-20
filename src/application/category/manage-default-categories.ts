import { Categoria } from "@/domain/category";
import { CategoriaRepository } from "@/domain/category";

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
  constructor(private readonly categoryRepository: CategoriaRepository) {}

  async create(input: CreateDefaultCategoryInput): Promise<Categoria> {
    const category = Categoria.create({
      id: input.id,
      name: input.name,
      type: "default",
      userId: null,
      createdAt: new Date(),
    });

    await this.categoryRepository.crear(category);

    return category;
  }

  async update(input: UpdateDefaultCategoryInput): Promise<Categoria> {
    const category = await this.categoryRepository.obtener(input.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    if (category.type !== "default") {
      throw new Error("Only default categories can be managed here");
    }

    const updated = Categoria.create({
      id: category.id,
      name: input.name,
      type: "default",
      userId: null,
      createdAt: category.createdAt,
    });

    await this.categoryRepository.actualizar(updated);

    return updated;
  }

  async delete(input: DeleteDefaultCategoryInput): Promise<void> {
    const category = await this.categoryRepository.obtener(input.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    if (category.type !== "default") {
      throw new Error("Only default categories can be managed here");
    }

    await this.categoryRepository.eliminar(input.categoryId);
  }
}
