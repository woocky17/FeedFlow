import { Noticia } from "@/domain/article";

export interface IASearchService {
  search(query: string): Promise<Noticia[]>;
}

interface BuscarNoticiasConIAInput {
  query: string;
}

export class BuscarNoticiasConIA {
  constructor(private readonly iaSearchService: IASearchService) {}

  async execute(input: BuscarNoticiasConIAInput): Promise<Noticia[]> {
    if (!input.query || input.query.trim().length === 0) {
      throw new Error("Search query cannot be empty");
    }

    return this.iaSearchService.search(input.query);
  }
}
