import { NewsEvent } from "./news-event";

export interface EventArticleView {
  id: string;
  title: string;
  url: string;
  description: string | null;
  image: string | null;
  sourceId: string;
  sourceName: string;
  publishedAt: Date;
  sentiment: string | null;
  framingSummary: string | null;
}

export interface NewsEventRepository {
  create(event: NewsEvent): Promise<void>;
  findRecent(sinceDate: Date): Promise<NewsEvent[]>;
  findById(id: string): Promise<NewsEvent | null>;
  attachArticle(eventId: string, articleId: string): Promise<void>;
  updateCentroid(eventId: string, embedding: number[], lastSeenAt: Date): Promise<void>;
  getMemberEmbeddings(eventId: string): Promise<number[][]>;
  countMembers(eventId: string): Promise<number>;
  findArticles(eventId: string): Promise<EventArticleView[]>;
}
