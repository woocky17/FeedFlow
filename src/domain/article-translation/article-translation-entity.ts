import { isLanguage, type Language } from "@/domain/shared";

export interface ArticleTranslationProps {
  articleId: string;
  targetLang: Language;
  title: string;
  description: string | null;
  provider: string;
  createdAt: Date;
}

export class ArticleTranslation {
  readonly articleId: string;
  readonly targetLang: Language;
  readonly title: string;
  readonly description: string | null;
  readonly provider: string;
  readonly createdAt: Date;

  private constructor(props: ArticleTranslationProps) {
    this.articleId = props.articleId;
    this.targetLang = props.targetLang;
    this.title = props.title;
    this.description = props.description;
    this.provider = props.provider;
    this.createdAt = props.createdAt;
  }

  static create(props: ArticleTranslationProps): ArticleTranslation {
    if (!props.articleId || props.articleId.trim().length === 0) {
      throw new Error("ArticleTranslation articleId cannot be empty");
    }

    if (!isLanguage(props.targetLang)) {
      throw new Error("ArticleTranslation targetLang must be a supported language");
    }

    if (!props.title || props.title.trim().length === 0) {
      throw new Error("ArticleTranslation title cannot be empty");
    }

    if (!props.provider || props.provider.trim().length === 0) {
      throw new Error("ArticleTranslation provider cannot be empty");
    }

    return new ArticleTranslation(props);
  }
}
