import { Favorito } from "@/domain/favorite";
import { FavoritoRepository } from "@/domain/favorite";

interface AddFavoriteInput {
  id: string;
  userId: string;
  articleId: string;
}

export class AddFavorite {
  constructor(private readonly favoriteRepository: FavoritoRepository) {}

  async execute(input: AddFavoriteInput): Promise<Favorito> {
    const existing = await this.favoriteRepository.obtenerPorUsuario(input.userId);

    const favorite = Favorito.create(
      {
        id: input.id,
        userId: input.userId,
        articleId: input.articleId,
        createdAt: new Date(),
      },
      existing,
    );

    await this.favoriteRepository.anadir(favorite);

    return favorite;
  }
}
