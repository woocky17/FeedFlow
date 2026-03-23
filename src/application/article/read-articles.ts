import { Article } from "@/domain/article";
import { ArticleRepository } from "@/domain/article";

interface ReadArticlesInput {
  categoryId?: string;
  sourceId?: string;
}

export class ReadArticles {
  constructor(private readonly articleRepository: ArticleRepository) {}

  async execute(input: ReadArticlesInput): Promise<Article[]> {
    if (input.categoryId) {
      return this.articleRepository.findByCategory(input.categoryId);
    }

    if (input.sourceId) {
      return this.articleRepository.findBySource(input.sourceId);
    }

    return this.articleRepository.findAll();
  }
}
