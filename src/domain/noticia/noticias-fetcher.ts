import { Source } from "../source/source-entity";
import { Noticia } from "./noticia-entity";

export interface NoticiasFetcher {
  fetchPorFuente(fuente: Source): Promise<Noticia[]>;
}
