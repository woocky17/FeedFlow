import { Story } from "./story";
import { StoryArticle } from "./story-article";

export interface StoryWithCounts {
  story: Story;
  articleCount: number;
  latestArticleAt: Date | null;
}

export interface StoryRepository {
  create(story: Story): Promise<void>;
  findById(id: string): Promise<Story | null>;
  findByUser(userId: string): Promise<StoryWithCounts[]>;
  findActive(): Promise<Story[]>;
  existsForUserAndArticle(userId: string, articleId: string): Promise<boolean>;
  delete(id: string): Promise<void>;
  updateEmbedding(id: string, embedding: number[]): Promise<void>;

  addArticle(link: StoryArticle): Promise<void>;
  findArticlesForStory(storyId: string): Promise<
    Array<{
      id: string;
      title: string;
      url: string;
      description: string | null;
      image: string | null;
      sourceId: string;
      publishedAt: Date;
      similarity: number;
    }>
  >;
  countArticles(storyId: string): Promise<number>;
  getMemberEmbeddings(storyId: string): Promise<number[][]>;
}
