import { Noticia } from "./noticia-entity";

export interface NoticiaRepository {
  guardar(noticia: Noticia): Promise<void>;
  obtenerPorCategoria(categoryId: string): Promise<Noticia[]>;
  obtenerPorFuente(sourceId: string): Promise<Noticia[]>;
  existePorUrl(url: string): Promise<boolean>;
}
