import { Noticia } from "./noticia-entity";

export interface NoticiaRepository {
  guardar(noticia: Noticia): Promise<void>;
  obtenerTodas(): Promise<Noticia[]>;
  obtenerPorCategoria(categoryId: string): Promise<Noticia[]>;
  obtenerPorFuente(sourceId: string): Promise<Noticia[]>;
  existePorUrl(url: string): Promise<boolean>;
}
