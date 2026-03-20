import { Noticia } from "@/domain/article";
import { NoticiaRepository } from "@/domain/article";

interface LeerNoticiasInput {
  categoryId?: string;
  sourceId?: string;
}

export class LeerNoticias {
  constructor(private readonly noticiaRepository: NoticiaRepository) {}

  async execute(input: LeerNoticiasInput): Promise<Noticia[]> {
    if (input.categoryId) {
      return this.noticiaRepository.obtenerPorCategoria(input.categoryId);
    }

    if (input.sourceId) {
      return this.noticiaRepository.obtenerPorFuente(input.sourceId);
    }

    return [];
  }
}
