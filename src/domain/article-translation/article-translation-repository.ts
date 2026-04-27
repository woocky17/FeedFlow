import type { Language } from "@/domain/shared";
import type { ArticleTranslation } from "./article-translation-entity";

export interface ArticleTranslationRepository {
  findOne(articleId: string, targetLang: Language): Promise<ArticleTranslation | null>;
  findManyByArticleIds(
    articleIds: string[],
    targetLang: Language,
  ): Promise<Map<string, ArticleTranslation>>;
  upsert(translation: ArticleTranslation): Promise<void>;
}
