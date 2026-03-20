import { Categoria } from "@/domain/category";
import { CategoriaRepository } from "@/domain/category";

interface CreateCustomCategoryInput {
  id: string;
  name: string;
  userId: string;
}

export class CreateCustomCategory {
  constructor(private readonly categoryRepository: CategoriaRepository) {}

  async execute(input: CreateCustomCategoryInput): Promise<Categoria> {
    const existing = await this.categoryRepository.obtenerPorUsuario(input.userId);
    const duplicate = existing.some((cat) => cat.name === input.name);
    if (duplicate) {
      throw new Error("Category name already exists for this user");
    }

    const category = Categoria.create({
      id: input.id,
      name: input.name,
      type: "custom",
      userId: input.userId,
      createdAt: new Date(),
    });

    await this.categoryRepository.crear(category);

    return category;
  }
}
