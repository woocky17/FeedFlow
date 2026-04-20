import { randomUUID } from "crypto";
import {
  ArticleEmbeddingRepository,
  EmbeddingService,
} from "@/domain/story";
import { NewsEvent, NewsEventRepository } from "@/domain/news-event";
import { buildEmbeddingText } from "@/infrastructure/ai/transformers-embedder";
import { cosineSimilarity, meanVector } from "@/lib/similarity";

interface ClusterInput {
  articleId: string;
  title: string;
  description: string | null;
}

const RECENT_WINDOW_DAYS = 7;
const CENTROID_RECOMPUTE_EVERY = 3;

export class ClusterArticle {
  constructor(
    private readonly eventRepository: NewsEventRepository,
    private readonly articleEmbeddingRepository: ArticleEmbeddingRepository,
    private readonly embeddingService: EmbeddingService,
    private readonly threshold: number = 0.72,
  ) {}

  async execute(input: ClusterInput): Promise<{ eventId: string; created: boolean }> {
    let embedding = await this.articleEmbeddingRepository.getEmbedding(input.articleId);
    if (!embedding) {
      embedding = await this.embeddingService.embed(
        buildEmbeddingText(input.title, input.description),
      );
      await this.articleEmbeddingRepository.setEmbedding(input.articleId, embedding);
    }

    const since = new Date();
    since.setDate(since.getDate() - RECENT_WINDOW_DAYS);
    const candidates = await this.eventRepository.findRecent(since);

    let bestEvent: NewsEvent | null = null;
    let bestSim = 0;
    for (const event of candidates) {
      if (event.embedding.length === 0) continue;
      const sim = cosineSimilarity(event.embedding, embedding);
      if (sim > bestSim) {
        bestSim = sim;
        bestEvent = event;
      }
    }

    if (bestEvent && bestSim >= this.threshold) {
      await this.eventRepository.attachArticle(bestEvent.id, input.articleId);
      const count = await this.eventRepository.countMembers(bestEvent.id);
      if (count > 0 && count % CENTROID_RECOMPUTE_EVERY === 0) {
        const members = await this.eventRepository.getMemberEmbeddings(bestEvent.id);
        if (members.length > 0) {
          await this.eventRepository.updateCentroid(
            bestEvent.id,
            meanVector(members),
            new Date(),
          );
          return { eventId: bestEvent.id, created: false };
        }
      }
      await this.eventRepository.updateCentroid(
        bestEvent.id,
        bestEvent.embedding,
        new Date(),
      );
      return { eventId: bestEvent.id, created: false };
    }

    const now = new Date();
    const newEvent = NewsEvent.create({
      id: randomUUID(),
      title: input.title,
      embedding,
      firstSeenAt: now,
      lastSeenAt: now,
      createdAt: now,
    });
    await this.eventRepository.create(newEvent);
    await this.eventRepository.attachArticle(newEvent.id, input.articleId);
    return { eventId: newEvent.id, created: true };
  }
}
