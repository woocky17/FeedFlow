import { AsignacionCategoria } from "@/domain/category";
import { AsignacionCategoriaRepository } from "@/domain/category";

interface AsignarCategoriaManualmenteInput {
  articleId: string;
  categoryId: string;
  userId: string;
}

export class AsignarCategoriaManualmente {
  constructor(
    private readonly asignacionRepository: AsignacionCategoriaRepository,
  ) {}

  async execute(input: AsignarCategoriaManualmenteInput): Promise<AsignacionCategoria> {
    const existentes = await this.asignacionRepository.obtenerPorNoticia(input.articleId);
    const existente = existentes.find((a) => a.categoryId === input.categoryId);

    if (existente) {
      await this.asignacionRepository.actualizarOrigen(
        input.articleId,
        input.categoryId,
        "manual",
      );
      return AsignacionCategoria.create({
        articleId: input.articleId,
        categoryId: input.categoryId,
        userId: input.userId,
        origin: "manual",
        assignedAt: new Date(),
      });
    }

    const asignacion = AsignacionCategoria.create({
      articleId: input.articleId,
      categoryId: input.categoryId,
      userId: input.userId,
      origin: "manual",
      assignedAt: new Date(),
    });

    await this.asignacionRepository.crear(asignacion);

    return asignacion;
  }
}
