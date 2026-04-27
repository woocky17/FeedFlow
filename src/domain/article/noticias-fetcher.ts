import { Source } from "../source/source-entity";
import { Article } from "./noticia-entity";

export interface FetchOptions {
  from?: Date;
  to?: Date;
  limit?: number;
}

export interface ArticleFetcher {
  fetchBySource(source: Source, options?: FetchOptions): Promise<Article[]>;
}
