import { FavoritoRepository } from "@/domain/favorite";

interface EliminarFavoritoInput {
  favoritoId: string;
  userId: string;
}

export class EliminarFavorito {
  constructor(private readonly favoritoRepository: FavoritoRepository) {}

  async execute(input: EliminarFavoritoInput): Promise<void> {
    const favoritos = await this.favoritoRepository.obtenerPorUsuario(input.userId);
    const favorito = favoritos.find((f) => f.id === input.favoritoId);

    if (!favorito) {
      throw new Error("Favorite not found or does not belong to this user");
    }

    await this.favoritoRepository.eliminar(input.favoritoId);
  }
}
