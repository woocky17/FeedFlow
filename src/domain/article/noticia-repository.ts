import type { SentimentResult } from "@/domain/news-event";
import { Article } from "./noticia-entity";

export interface ArticleSummary {
  id: string;
  title: string;
  description: string | null;
}

export interface ArticleRepository {
  save(article: Article): Promise<void>;
  findAll(): Promise<Article[]>;
  findById(id: string): Promise<Article | null>;
  findByCategory(categoryId: string): Promise<Article[]>;
  existsByUrl(url: string): Promise<boolean>;
  findUncategorizedSince(since: Date, limit: number): Promise<ArticleSummary[]>;
  /** Oldest `publishedAt` first. */
  findUnclusteredSince(since: Date, limit: number): Promise<ArticleSummary[]>;
  findWithoutSentimentSince(since: Date, limit: number): Promise<ArticleSummary[]>;
  updateSentiment(articleId: string, result: SentimentResult): Promise<void>;
}
