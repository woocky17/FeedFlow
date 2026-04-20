export interface NewsEventProps {
  id: string;
  title: string;
  embedding: number[];
  firstSeenAt: Date;
  lastSeenAt: Date;
  createdAt: Date;
}

export class NewsEvent {
  readonly id: string;
  readonly title: string;
  readonly embedding: number[];
  readonly firstSeenAt: Date;
  readonly lastSeenAt: Date;
  readonly createdAt: Date;

  private constructor(props: NewsEventProps) {
    this.id = props.id;
    this.title = props.title;
    this.embedding = props.embedding;
    this.firstSeenAt = props.firstSeenAt;
    this.lastSeenAt = props.lastSeenAt;
    this.createdAt = props.createdAt;
  }

  static create(props: NewsEventProps): NewsEvent {
    if (!props.title || props.title.trim().length === 0) {
      throw new Error("NewsEvent title cannot be empty");
    }
    return new NewsEvent(props);
  }
}
