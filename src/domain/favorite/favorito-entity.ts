export interface FavoritoProps {
  id: string;
  userId: string;
  articleId: string;
  createdAt: Date;
}

export class Favorito {
  readonly id: string;
  readonly userId: string;
  readonly articleId: string;
  readonly createdAt: Date;

  private constructor(props: FavoritoProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.articleId = props.articleId;
    this.createdAt = props.createdAt;
  }

  static create(
    props: FavoritoProps,
    existingFavoritos: Favorito[] = [],
  ): Favorito {
    const duplicate = existingFavoritos.some(
      (fav) =>
        fav.userId === props.userId && fav.articleId === props.articleId,
    );

    if (duplicate) {
      throw new Error("User already has this article as a favorite");
    }

    return new Favorito(props);
  }
}
