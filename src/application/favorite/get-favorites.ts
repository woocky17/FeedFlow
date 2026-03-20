import { Favorito } from "@/domain/favorite";
import { FavoritoRepository } from "@/domain/favorite";

interface GetFavoritesInput {
  userId: string;
}

export class GetFavorites {
  constructor(private readonly favoriteRepository: FavoritoRepository) {}

  async execute(input: GetFavoritesInput): Promise<Favorito[]> {
    return this.favoriteRepository.obtenerPorUsuario(input.userId);
  }
}
