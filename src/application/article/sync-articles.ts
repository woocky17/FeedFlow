import { NoticiaRepository, NoticiasFetcher } from "@/domain/article";
import { SourceRepository } from "@/domain/source";
import { AsignacionCategoria, AsignacionCategoriaRepository } from "@/domain/category";

export interface CategoryClassifier {
  classify(title: string, description: string): Promise<string[]>;
}

export class SyncArticles {
  constructor(
    private readonly sourceRepository: SourceRepository,
    private readonly articleRepository: NoticiaRepository,
    private readonly articlesFetcher: NoticiasFetcher,
    private readonly assignmentRepository: AsignacionCategoriaRepository,
    private readonly categoryClassifier: CategoryClassifier,
  ) {}

  async execute(): Promise<{ synced: number; errors: string[] }> {
    const sources = await this.sourceRepository.findActive();
    let synced = 0;
    const errors: string[] = [];

    for (const source of sources) {
      try {
        const articles = await this.articlesFetcher.fetchPorFuente(source);

        for (const article of articles) {
          const exists = await this.articleRepository.existePorUrl(article.url);
          if (exists) continue;

          await this.articleRepository.guardar(article);

          const categoryIds = await this.categoryClassifier.classify(
            article.title,
            article.description,
          );

          for (const categoryId of categoryIds) {
            const assignment = AsignacionCategoria.create({
              articleId: article.id,
              categoryId,
              userId: "",
              origin: "auto",
              assignedAt: new Date(),
            });
            await this.assignmentRepository.crear(assignment);
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
