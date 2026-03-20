import { Favorito } from "./favorito-entity";

export interface FavoritoRepository {
  anadir(favorito: Favorito): Promise<void>;
  obtenerPorUsuario(userId: string): Promise<Favorito[]>;
  eliminar(id: string): Promise<void>;
}
