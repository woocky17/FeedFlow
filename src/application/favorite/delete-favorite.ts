import { FavoritoRepository } from "@/domain/favorite";

interface DeleteFavoriteInput {
  favoriteId: string;
  userId: string;
}

export class DeleteFavorite {
  constructor(private readonly favoriteRepository: FavoritoRepository) {}

  async execute(input: DeleteFavoriteInput): Promise<void> {
    const favorites = await this.favoriteRepository.obtenerPorUsuario(input.userId);
    const favorite = favorites.find((f) => f.id === input.favoriteId);

    if (!favorite) {
      throw new Error("Favorite not found or does not belong to this user");
    }

    await this.favoriteRepository.eliminar(input.favoriteId);
  }
}
