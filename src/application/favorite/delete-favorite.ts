import { FavoriteRepository } from "@/domain/favorite";

interface DeleteFavoriteInput {
  favoriteId: string;
  userId: string;
}

export class DeleteFavorite {
  constructor(private readonly favoriteRepository: FavoriteRepository) {}

  async execute(input: DeleteFavoriteInput): Promise<void> {
    const favorites = await this.favoriteRepository.findByUser(input.userId);
    const favorite = favorites.find((f) => f.id === input.favoriteId);

    if (!favorite) {
      throw new Error("Favorite not found or does not belong to this user");
    }

    await this.favoriteRepository.delete(input.favoriteId);
  }
}
