import { ArticleRepository, ArticleFetcher } from "@/domain/article";
import { SourceRepository } from "@/domain/source";
import { CategoryAssignment, CategoryAssignmentRepository } from "@/domain/category";

export interface CategoryClassifier {
  classify(title: string, description: string): Promise<string[]>;
}

export interface StoryMatcher {
  execute(input: { articleId: string; title: string; description: string | null }): Promise<{ storiesMatched: number }>;
}

export class SyncArticles {
  constructor(
    private readonly sourceRepository: SourceRepository,
    private readonly articleRepository: ArticleRepository,
    private readonly articlesFetcher: ArticleFetcher,
    private readonly assignmentRepository: CategoryAssignmentRepository,
    private readonly categoryClassifier: CategoryClassifier,
    private readonly storyMatcher?: StoryMatcher,
  ) {}

  async execute(): Promise<{ synced: number; errors: string[] }> {
    const sources = await this.sourceRepository.findActive();
    let synced = 0;
    const errors: string[] = [];

    for (const source of sources) {
      try {
        const articles = await this.articlesFetcher.fetchBySource(source);

        for (const article of articles) {
          const exists = await this.articleRepository.existsByUrl(article.url);
          if (exists) continue;

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

          synced++;
        }
      } catch (error) {
        errors.push(`Failed to sync source ${source.id}: ${error}`);
      }
    }

    return { synced, errors };
  }
}
