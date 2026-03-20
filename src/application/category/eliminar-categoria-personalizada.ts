import { CategoriaRepository } from "@/domain/category";

interface EliminarCategoriaPersonalizadaInput {
  categoryId: string;
  userId: string;
}

export class EliminarCategoriaPersonalizada {
  constructor(private readonly categoriaRepository: CategoriaRepository) {}

  async execute(input: EliminarCategoriaPersonalizadaInput): Promise<void> {
    const categoria = await this.categoriaRepository.obtener(input.categoryId);
    if (!categoria) {
      throw new Error("Category not found");
    }

    if (categoria.userId !== input.userId) {
      throw new Error("Category does not belong to this user");
    }

    await this.categoriaRepository.eliminar(input.categoryId);
  }
}
