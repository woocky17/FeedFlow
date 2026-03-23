import { Favorite } from "@/domain/favorite";
import { FavoriteRepository } from "@/domain/favorite";

interface GetFavoritesInput {
  userId: string;
}

export class GetFavorites {
  constructor(private readonly favoriteRepository: FavoriteRepository) {}

  async execute(input: GetFavoritesInput): Promise<Favorite[]> {
    return this.favoriteRepository.findByUser(input.userId);
  }
}
