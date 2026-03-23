import { ArticleProps } from "@/domain/article";

export interface WorldNewsArticle {
  id: number;
  title: string;
  url: string;
  summary: string | null;
  image: string | null;
  publish_date: string;
}

export function mapWorldNewsArticle(
  raw: WorldNewsArticle,
  sourceId: string,
): ArticleProps {
  return {
    id: crypto.randomUUID(),
    title: raw.title,
    url: raw.url,
    description: raw.summary ?? "",
    image: raw.image ?? "",
    sourceId,
    publishedAt: new Date(raw.publish_date),
    savedAt: new Date(),
  };
}
