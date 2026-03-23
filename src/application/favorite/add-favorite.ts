import { Favorite } from "@/domain/favorite";
import { FavoriteRepository } from "@/domain/favorite";

interface AddFavoriteInput {
  id: string;
  userId: string;
  articleId: string;
}

export class AddFavorite {
  constructor(private readonly favoriteRepository: FavoriteRepository) {}

  async execute(input: AddFavoriteInput): Promise<Favorite> {
    const existing = await this.favoriteRepository.findByUser(input.userId);

    const favorite = Favorite.create(
      {
        id: input.id,
        userId: input.userId,
        articleId: input.articleId,
        createdAt: new Date(),
      },
      existing,
    );

    await this.favoriteRepository.add(favorite);

    return favorite;
  }
}
