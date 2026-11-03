import { Favorite } from "./favorito-entity";

export interface FavoriteRepository {
  add(favorite: Favorite): Promise<void>;
  findByUser(userId: string): Promise<Favorite[]>;
  deleteByArticle(userId: string, articleId: string): Promise<void>;
}
