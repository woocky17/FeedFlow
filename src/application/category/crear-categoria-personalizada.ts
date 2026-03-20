import { Categoria } from "@/domain/category";
import { CategoriaRepository } from "@/domain/category";

interface CrearCategoriaPersonalizadaInput {
  id: string;
  name: string;
  userId: string;
}

export class CrearCategoriaPersonalizada {
  constructor(private readonly categoriaRepository: CategoriaRepository) {}

  async execute(input: CrearCategoriaPersonalizadaInput): Promise<Categoria> {
    const existentes = await this.categoriaRepository.obtenerPorUsuario(input.userId);
    const duplicada = existentes.some((cat) => cat.name === input.name);
    if (duplicada) {
      throw new Error("Category name already exists for this user");
    }

    const categoria = Categoria.create({
      id: input.id,
      name: input.name,
      type: "custom",
      userId: input.userId,
      createdAt: new Date(),
    });

    await this.categoriaRepository.crear(categoria);

    return categoria;
  }
}
