import { Favorite } from "./favorito-entity";

export interface FavoriteRepository {
  add(favorite: Favorite): Promise<void>;
  findByUser(userId: string): Promise<Favorite[]>;
  delete(id: string): Promise<void>;
  deleteByArticle(userId: string, articleId: string): Promise<void>;
}
