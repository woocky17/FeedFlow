export interface ArticleCandidate {
  id: string;
  title: string;
  description: string | null;
  publishedAt: Date;
  embedding: number[];
}

export interface ArticleEmbeddingRepository {
  getEmbedding(articleId: string): Promise<number[] | null>;
  setEmbedding(articleId: string, embedding: number[]): Promise<void>;
  findCandidatesSince(
    sinceDate: Date,
  ): Promise<ArticleCandidate[]>;
}
