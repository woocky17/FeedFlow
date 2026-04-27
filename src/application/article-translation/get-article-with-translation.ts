import { ArticleTranslation } from "@/domain/article-translation";
import type {
  ArticleTranslationRepository,
  TranslationService,
} from "@/domain/article-translation";
import type { Language } from "@/domain/shared";
import type { Article, ArticleRepository } from "@/domain/article";

export interface ArticleWithTranslation {
  article: Article;
  displayed: { title: string; description: string };
  original: { title: string; description: string };
  translation: ArticleTranslation | null;
  displayedLanguage: Language;
  translationFailed: boolean;
}

interface Input {
  articleId: string;
  targetLang: Language;
}

export class GetArticleWithTranslation {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly translationRepository: ArticleTranslationRepository,
    private readonly translationService: TranslationService,
    private readonly providerLabel: string = "groq:llama-3.3-70b",
  ) {}

  async execute(input: Input): Promise<ArticleWithTranslation> {
    const article = await this.findArticleById(input.articleId);
    if (!article) {
      throw new Error(`Article ${input.articleId} not found`);
    }

    const original = { title: article.title, description: article.description };

    if (article.language === input.targetLang) {
      return {
        article,
        displayed: original,
        original,
        translation: null,
        displayedLanguage: article.language,
        translationFailed: false,
      };
    }

    const cached = await this.translationRepository.findOne(article.id, input.targetLang);
    if (cached && cached.description !== null) {
      return {
        article,
        displayed: { title: cached.title, description: cached.description },
        original,
        translation: cached,
        displayedLanguage: input.targetLang,
        translationFailed: false,
      };
    }

    try {
      const translatedTitle = cached?.title
        ?? (await this.translationService.translateTitle(
          article.title,
          article.language,
          input.targetLang,
        ));

      const translatedDescription = article.description
        ? await this.translationService.translateDescription(
            article.description,
            article.language,
            input.targetLang,
          )
        : "";

      const translation = ArticleTranslation.create({
        articleId: article.id,
        targetLang: input.targetLang,
        title: translatedTitle,
        description: translatedDescription || null,
        provider: this.providerLabel,
        createdAt: new Date(),
      });

      await this.translationRepository.upsert(translation);

      return {
        article,
        displayed: {
          title: translatedTitle,
          description: translatedDescription,
        },
        original,
        translation,
        displayedLanguage: input.targetLang,
        translationFailed: false,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[translation] failed for article ${article.id}: ${message}`);
      return {
        article,
        displayed: original,
        original,
        translation: cached,
        displayedLanguage: article.language,
        translationFailed: true,
      };
    }
  }

  private async findArticleById(id: string): Promise<Article | null> {
    const candidates = await this.articleRepository.findAll();
    return candidates.find((a) => a.id === id) ?? null;
  }
}
