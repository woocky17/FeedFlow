import { Favorito } from "@/domain/favorite";
import { FavoritoRepository } from "@/domain/favorite";

interface VerFavoritosInput {
  userId: string;
}

export class VerFavoritos {
  constructor(private readonly favoritoRepository: FavoritoRepository) {}

  async execute(input: VerFavoritosInput): Promise<Favorito[]> {
    return this.favoritoRepository.obtenerPorUsuario(input.userId);
  }
}
