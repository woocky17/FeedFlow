import { Source } from "../source/source-entity";
import { Article } from "./noticia-entity";

export interface ArticleFetcher {
  fetchBySource(source: Source): Promise<Article[]>;
}
