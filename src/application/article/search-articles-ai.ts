import { Noticia } from "@/domain/article";

export interface AISearchService {
  search(query: string): Promise<Noticia[]>;
}

interface SearchArticlesAIInput {
  query: string;
}

export class SearchArticlesAI {
  constructor(private readonly aiSearchService: AISearchService) {}

  async execute(input: SearchArticlesAIInput): Promise<Noticia[]> {
    if (!input.query || input.query.trim().length === 0) {
      throw new Error("Search query cannot be empty");
    }

    return this.aiSearchService.search(input.query);
  }
}
