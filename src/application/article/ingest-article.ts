import { Article, ArticleRepository } from "@/domain/article";
import { CategoryAssignment, CategoryAssignmentRepository } from "@/domain/category";
import {
  ArticleClusterer,
  CategoryClassifier,
  SentimentEnricher,
  StoryMatcher,
} from "./sync-articles";

export interface IngestResult {
  ingested: boolean;
  errors: string[];
}

export class IngestArticle {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly assignmentRepository: CategoryAssignmentRepository,
    private readonly categoryClassifier: CategoryClassifier,
    private readonly storyMatcher?: StoryMatcher,
    private readonly articleClusterer?: ArticleClusterer,
    private readonly sentimentEnricher?: SentimentEnricher,
  ) {}

  async execute(article: Article): Promise<IngestResult> {
    const errors: string[] = [];

    const exists = await this.articleRepository.existsByUrl(article.url);
    if (exists) return { ingested: false, errors };

    await this.articleRepository.save(article);

    const categoryIds = await this.categoryClassifier.classify(
      article.title,
      article.description,
    );
    for (const categoryId of categoryIds) {
      const assignment = CategoryAssignment.create({
        articleId: article.id,
        categoryId,
        userId: "",
        origin: "auto",
        assignedAt: new Date(),
      });
      await this.assignmentRepository.create(assignment);
    }

    if (this.articleClusterer) {
      try {
        await this.articleClusterer.execute({
          articleId: article.id,
          title: article.title,
          description: article.description,
        });
      } catch (err) {
        errors.push(`Clustering failed for ${article.id}: ${err}`);
      }
    }

    if (this.storyMatcher) {
      try {
        await this.storyMatcher.execute({
          articleId: article.id,
          title: article.title,
          description: article.description,
        });
      } catch (err) {
        errors.push(`Story matching failed for ${article.id}: ${err}`);
      }
    }

    if (this.sentimentEnricher) {
      try {
        await this.sentimentEnricher.execute({
          articleId: article.id,
          title: article.title,
          description: article.description,
        });
      } catch (err) {
        errors.push(`Sentiment enrich failed for ${article.id}: ${err}`);
      }
    }

    return { ingested: true, errors };
  }
}
