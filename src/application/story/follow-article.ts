import { randomUUID } from "crypto";
import {
  ArticleEmbeddingRepository,
  EmbeddingService,
  Story,
  StoryArticle,
  StoryRepository,
  TopicGenerator,
} from "@/domain/story";
import { buildEmbeddingText } from "@/infrastructure/ai/transformers-embedder";
import { BackfillStory } from "./backfill-story";

interface FollowArticleInput {
  userId: string;
  articleId: string;
}

interface ArticleSnapshot {
  id: string;
  title: string;
  description: string | null;
}

interface ArticleReader {
  getById(id: string): Promise<ArticleSnapshot | null>;
}

export class FollowArticle {
  constructor(
    private readonly storyRepository: StoryRepository,
    private readonly articleEmbeddingRepository: ArticleEmbeddingRepository,
    private readonly articleReader: ArticleReader,
    private readonly embeddingService: EmbeddingService,
    private readonly topicGenerator: TopicGenerator,
    private readonly backfillStory: BackfillStory,
    private readonly defaultThreshold: number = 0.55,
  ) {}

  async execute(input: FollowArticleInput): Promise<Story> {
    const alreadyFollowed = await this.storyRepository.existsForUserAndArticle(
      input.userId,
      input.articleId,
    );
    if (alreadyFollowed) {
      throw new Error("You are already following this story");
    }

    const article = await this.articleReader.getById(input.articleId);
    if (!article) throw new Error("Article not found");

    let embedding = await this.articleEmbeddingRepository.getEmbedding(article.id);
    if (!embedding) {
      embedding = await this.embeddingService.embed(
        buildEmbeddingText(article.title, article.description),
      );
      await this.articleEmbeddingRepository.setEmbedding(article.id, embedding);
    }

    const topic = await this.topicGenerator.generate(
      article.title,
      article.description ?? "",
    );

    const story = Story.create({
      id: randomUUID(),
      userId: input.userId,
      name: topic.name,
      summary: topic.summary,
      embedding,
      sourceArticleId: article.id,
      threshold: this.defaultThreshold,
      active: true,
      createdAt: new Date(),
    });

    await this.storyRepository.create(story);

    const sourceLink = StoryArticle.create({
      id: randomUUID(),
      storyId: story.id,
      articleId: article.id,
      similarity: 1,
      addedAt: new Date(),
    });
    await this.storyRepository.addArticle(sourceLink);

    await this.backfillStory.execute({ story });

    return story;
  }
}
