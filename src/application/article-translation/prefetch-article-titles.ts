import { ArticleTranslation } from "@/domain/article-translation";
import type {
  ArticleTranslationRepository,
  TranslationService,
} from "@/domain/article-translation";
import type { Language } from "@/domain/shared";
import { SUPPORTED_LANGUAGES } from "@/domain/shared";

export interface ArticleTitleSource {
  /** Articles created in the last `windowHours` hours, with id, title and language. */
  findRecent(windowHours: number, limit: number): Promise<
    Array<{ id: string; title: string; language: Language }>
  >;
}

interface Options {
  windowHours?: number;
  limit?: number;
}

interface Result {
  scanned: number;
  translated: number;
  skipped: number;
  errors: string[];
}

export class PrefetchArticleTitles {
  constructor(
    private readonly articles: ArticleTitleSource,
    private readonly translations: ArticleTranslationRepository,
    private readonly translator: TranslationService,
    private readonly providerLabel: string = "groq:llama-3.3-70b",
  ) {}

  async execute(options: Options = {}): Promise<Result> {
    const windowHours = options.windowHours ?? 24;
    const limit = options.limit ?? 200;
    const recent = await this.articles.findRecent(windowHours, limit);

    let translated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const article of recent) {
      for (const target of SUPPORTED_LANGUAGES) {
        if (target === article.language) continue;
        try {
          const existing = await this.translations.findOne(article.id, target);
          if (existing) {
            skipped++;
            continue;
          }
          const translatedTitle = await this.translator.translateTitle(
            article.title,
            article.language,
            target,
          );
          await this.translations.upsert(
            ArticleTranslation.create({
              articleId: article.id,
              targetLang: target,
              title: translatedTitle,
              description: null,
              provider: this.providerLabel,
              createdAt: new Date(),
            }),
          );
          translated++;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          errors.push(`${article.id}->${target}: ${message}`);
        }
      }
    }

    return { scanned: recent.length, translated, skipped, errors };
  }
}
