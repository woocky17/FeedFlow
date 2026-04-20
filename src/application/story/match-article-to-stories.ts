import { randomUUID } from "crypto";
import {
  ArticleEmbeddingRepository,
  EmbeddingService,
  StoryArticle,
  StoryRepository,
} from "@/domain/story";
import { buildEmbeddingText } from "@/infrastructure/ai/transformers-embedder";
import { cosineSimilarity, meanVector } from "@/lib/similarity";

interface MatchInput {
  articleId: string;
  title: string;
  description: string | null;
}

const CENTROID_RECOMPUTE_EVERY = 5;

export class MatchArticleToStories {
  constructor(
    private readonly storyRepository: StoryRepository,
    private readonly articleEmbeddingRepository: ArticleEmbeddingRepository,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async execute(input: MatchInput): Promise<{ storiesMatched: number }> {
    const stories = await this.storyRepository.findActive();
    if (stories.length === 0) return { storiesMatched: 0 };

    let embedding = await this.articleEmbeddingRepository.getEmbedding(input.articleId);
    if (!embedding) {
      embedding = await this.embeddingService.embed(
        buildEmbeddingText(input.title, input.description),
      );
      await this.articleEmbeddingRepository.setEmbedding(input.articleId, embedding);
    }

    let matched = 0;
    for (const story of stories) {
      if (story.embedding.length === 0) continue;
      const similarity = cosineSimilarity(story.embedding, embedding);
      if (similarity < story.threshold) continue;

      await this.storyRepository.addArticle(
        StoryArticle.create({
          id: randomUUID(),
          storyId: story.id,
          articleId: input.articleId,
          similarity,
          addedAt: new Date(),
        }),
      );
      matched++;

      const count = await this.storyRepository.countArticles(story.id);
      if (count > 0 && count % CENTROID_RECOMPUTE_EVERY === 0) {
        const memberEmbeddings = await this.storyRepository.getMemberEmbeddings(story.id);
        if (memberEmbeddings.length > 0) {
          const centroid = meanVector(memberEmbeddings);
          await this.storyRepository.updateEmbedding(story.id, centroid);
        }
      }
    }

    return { storiesMatched: matched };
  }
}
