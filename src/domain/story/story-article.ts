export interface StoryArticleProps {
  id: string;
  storyId: string;
  articleId: string;
  similarity: number;
  addedAt: Date;
}

export class StoryArticle {
  readonly id: string;
  readonly storyId: string;
  readonly articleId: string;
  readonly similarity: number;
  readonly addedAt: Date;

  private constructor(props: StoryArticleProps) {
    this.id = props.id;
    this.storyId = props.storyId;
    this.articleId = props.articleId;
    this.similarity = props.similarity;
    this.addedAt = props.addedAt;
  }

  static create(props: StoryArticleProps): StoryArticle {
    if (!props.storyId) throw new Error("StoryArticle must reference a story");
    if (!props.articleId) throw new Error("StoryArticle must reference an article");
    return new StoryArticle(props);
  }
}
