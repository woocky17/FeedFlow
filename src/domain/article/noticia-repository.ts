import { Article } from "./noticia-entity";

export interface ArticleRepository {
  save(article: Article): Promise<void>;
  findAll(): Promise<Article[]>;
  findByCategory(categoryId: string): Promise<Article[]>;
  findBySource(sourceId: string): Promise<Article[]>;
  existsByUrl(url: string): Promise<boolean>;
}
