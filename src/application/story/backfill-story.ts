import { randomUUID } from "crypto";
import {
  ArticleEmbeddingRepository,
  EmbeddingService,
  Story,
  StoryArticle,
  StoryRepository,
} from "@/domain/story";
import { buildEmbeddingText } from "@/infrastructure/ai/transformers-embedder";
import { cosineSimilarity } from "@/lib/similarity";

interface BackfillInput {
  story: Story;
}

const BACKFILL_WINDOW_DAYS = 90;

export class BackfillStory {
  constructor(
    private readonly storyRepository: StoryRepository,
    private readonly articleEmbeddingRepository: ArticleEmbeddingRepository,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async execute({ story }: BackfillInput): Promise<{ matched: number }> {
    const since = new Date();
    since.setDate(since.getDate() - BACKFILL_WINDOW_DAYS);

    const candidates = await this.articleEmbeddingRepository.findCandidatesSince(since);

    const missing = candidates.filter((c) => c.embedding.length === 0);
    if (missing.length > 0) {
      const texts = missing.map((c) => buildEmbeddingText(c.title, c.description));
      const vectors = await this.embeddingService.embedMany(texts);
      for (let i = 0; i < missing.length; i++) {
        missing[i].embedding = vectors[i];
        await this.articleEmbeddingRepository.setEmbedding(missing[i].id, vectors[i]);
      }
    }

    let matched = 0;
    for (const candidate of candidates) {
      if (candidate.id === story.sourceArticleId) continue;
      if (candidate.embedding.length === 0) continue;
      const similarity = cosineSimilarity(story.embedding, candidate.embedding);
      if (similarity >= story.threshold) {
        await this.storyRepository.addArticle(
          StoryArticle.create({
            id: randomUUID(),
            storyId: story.id,
            articleId: candidate.id,
            similarity,
            addedAt: new Date(),
          }),
        );
        matched++;
      }
    }

    return { matched };
  }
}
