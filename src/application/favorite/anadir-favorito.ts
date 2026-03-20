import { Favorito } from "@/domain/favorite";
import { FavoritoRepository } from "@/domain/favorite";

interface AnadirFavoritoInput {
  id: string;
  userId: string;
  articleId: string;
}

export class AnadirFavorito {
  constructor(private readonly favoritoRepository: FavoritoRepository) {}

  async execute(input: AnadirFavoritoInput): Promise<Favorito> {
    const existentes = await this.favoritoRepository.obtenerPorUsuario(input.userId);

    const favorito = Favorito.create(
      {
        id: input.id,
        userId: input.userId,
        articleId: input.articleId,
        createdAt: new Date(),
      },
      existentes,
    );

    await this.favoritoRepository.anadir(favorito);

    return favorito;
  }
}
