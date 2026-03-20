import { Categoria } from "@/domain/category";
import { CategoriaRepository } from "@/domain/category";

interface EditarCategoriaPersonalizadaInput {
  categoryId: string;
  userId: string;
  name: string;
}

export class EditarCategoriaPersonalizada {
  constructor(private readonly categoriaRepository: CategoriaRepository) {}

  async execute(input: EditarCategoriaPersonalizadaInput): Promise<Categoria> {
    const categoria = await this.categoriaRepository.obtener(input.categoryId);
    if (!categoria) {
      throw new Error("Category not found");
    }

    if (categoria.userId !== input.userId) {
      throw new Error("Category does not belong to this user");
    }

    const updated = Categoria.create({
      id: categoria.id,
      name: input.name,
      type: categoria.type,
      userId: categoria.userId,
      createdAt: categoria.createdAt,
    });

    await this.categoriaRepository.actualizar(updated);

    return updated;
  }
}
