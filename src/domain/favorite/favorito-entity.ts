export interface FavoriteProps {
  id: string;
  userId: string;
  articleId: string;
  createdAt: Date;
}

export class Favorite {
  readonly id: string;
  readonly userId: string;
  readonly articleId: string;
  readonly createdAt: Date;

  private constructor(props: FavoriteProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.articleId = props.articleId;
    this.createdAt = props.createdAt;
  }

  static create(
    props: FavoriteProps,
    existingFavorites: Favorite[] = [],
  ): Favorite {
    const duplicate = existingFavorites.some(
      (fav) =>
        fav.userId === props.userId && fav.articleId === props.articleId,
    );

    if (duplicate) {
      throw new Error("User already has this article as a favorite");
    }

    return new Favorite(props);
  }
}
