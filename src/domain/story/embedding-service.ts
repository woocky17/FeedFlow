export interface EmbeddingService {
  embed(text: string): Promise<number[]>;
  embedMany(texts: string[]): Promise<number[][]>;
}

export function buildEmbeddingText(title: string, description: string | null | undefined): string {
  const desc = description?.trim() ?? "";
  return desc ? `${title}\n${desc}` : title;
}
