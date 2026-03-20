export interface NoticiaProps {
  id: string;
  title: string;
  url: string;
  description: string;
  image: string;
  sourceId: string;
  publishedAt: Date;
  savedAt: Date;
}

export class Noticia {
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly description: string;
  readonly image: string;
  readonly sourceId: string;
  readonly publishedAt: Date;
  readonly savedAt: Date;

  private constructor(props: NoticiaProps) {
    this.id = props.id;
    this.title = props.title;
    this.url = props.url;
    this.description = props.description;
    this.image = props.image;
    this.sourceId = props.sourceId;
    this.publishedAt = props.publishedAt;
    this.savedAt = props.savedAt;
  }

  static create(props: NoticiaProps): Noticia {
    if (!props.title || props.title.trim().length === 0) {
      throw new Error("Noticia title cannot be empty");
    }

    if (!props.url || props.url.trim().length === 0) {
      throw new Error("Noticia url cannot be empty");
    }

    return new Noticia(props);
  }
}
