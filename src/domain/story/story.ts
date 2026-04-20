export interface StoryProps {
  id: string;
  userId: string;
  name: string;
  summary: string;
  embedding: number[];
  sourceArticleId: string;
  threshold: number;
  active: boolean;
  createdAt: Date;
}

export class Story {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly summary: string;
  readonly embedding: number[];
  readonly sourceArticleId: string;
  readonly threshold: number;
  readonly active: boolean;
  readonly createdAt: Date;

  private constructor(props: StoryProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.name = props.name;
    this.summary = props.summary;
    this.embedding = props.embedding;
    this.sourceArticleId = props.sourceArticleId;
    this.threshold = props.threshold;
    this.active = props.active;
    this.createdAt = props.createdAt;
  }

  static create(props: StoryProps): Story {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Story name cannot be empty");
    }
    if (!props.userId) {
      throw new Error("Story must belong to a user");
    }
    if (!props.sourceArticleId) {
      throw new Error("Story must have a source article");
    }
    if (props.threshold < 0 || props.threshold > 1) {
      throw new Error("Story threshold must be between 0 and 1");
    }
    return new Story(props);
  }
}
