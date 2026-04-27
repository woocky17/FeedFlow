import { ArticleProps } from "@/domain/article";
import type { Language } from "@/domain/shared";

export interface NewsApiArticle {
  title: string;
  url: string;
  description: string | null;
  urlToImage: string | null;
  publishedAt: string;
}

export function mapNewsApiArticle(
  raw: NewsApiArticle,
  sourceId: string,
  language: Language,
): ArticleProps {
  return {
    id: crypto.randomUUID(),
    title: raw.title,
    url: raw.url,
    description: raw.description ?? "",
    image: raw.urlToImage ?? "",
    sourceId,
    language,
    publishedAt: new Date(raw.publishedAt),
    savedAt: new Date(),
  };
}
