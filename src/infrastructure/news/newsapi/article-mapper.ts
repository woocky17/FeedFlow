import { ArticleProps } from "@/domain/article";

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
): ArticleProps {
  return {
    id: crypto.randomUUID(),
    title: raw.title,
    url: raw.url,
    description: raw.description ?? "",
    image: raw.urlToImage ?? "",
    sourceId,
    publishedAt: new Date(raw.publishedAt),
    savedAt: new Date(),
  };
}
