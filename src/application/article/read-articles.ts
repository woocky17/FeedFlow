import { Noticia } from "@/domain/article";
import { NoticiaRepository } from "@/domain/article";

interface ReadArticlesInput {
  categoryId?: string;
  sourceId?: string;
}

export class ReadArticles {
  constructor(private readonly articleRepository: NoticiaRepository) {}

  async execute(input: ReadArticlesInput): Promise<Noticia[]> {
    if (input.categoryId) {
      return this.articleRepository.obtenerPorCategoria(input.categoryId);
    }

    if (input.sourceId) {
      return this.articleRepository.obtenerPorFuente(input.sourceId);
    }

    return [];
  }
}
