import { describe, expect, it, vi } from "vitest";
import { Article } from "@/domain/article";
import type { ArticleRepository } from "@/domain/article";
import { ArticleTranslation } from "@/domain/article-translation";
import type {
  ArticleTranslationRepository,
  TranslationService,
} from "@/domain/article-translation";
import { GetArticleWithTranslation } from "@/application/article-translation";

function makeArticle() {
  return Article.create({
    id: "art-1",
    title: "Hello world",
    url: "https://example.com/a",
    description: "Quick brown fox",
    image: "",
    sourceId: "src-1",
    language: "en",
    publishedAt: new Date("2026-04-20T00:00:00Z"),
    savedAt: new Date("2026-04-20T00:00:00Z"),
  });
}

function makeArticleRepository(article: Article): ArticleRepository {
  return {
    save: vi.fn(),
    findAll: vi.fn().mockResolvedValue([article]),
    findByCategory: vi.fn(),
    findBySource: vi.fn(),
    existsByUrl: vi.fn(),
  };
}

function makeRepo(initial: ArticleTranslation | null = null): ArticleTranslationRepository {
  let stored = initial;
  return {
    findOne: vi.fn(async () => stored),
    findManyByArticleIds: vi.fn(async () => new Map()),
    upsert: vi.fn(async (t) => {
      stored = t;
    }),
  };
}

function makeService(impl?: Partial<TranslationService>): TranslationService {
  return {
    translateTitle: vi.fn().mockResolvedValue("Hola mundo"),
    translateDescription: vi.fn().mockResolvedValue("Zorro marrón rápido"),
    ...impl,
  };
}

describe("GetArticleWithTranslation", () => {
  it("returns the original when target language matches the article language", async () => {
    const article = makeArticle();
    const articles = makeArticleRepository(article);
    const repo = makeRepo();
    const service = makeService();
    const useCase = new GetArticleWithTranslation(articles, repo, service);

    const result = await useCase.execute({ articleId: article.id, targetLang: "en" });

    expect(result.displayed).toEqual(result.original);
    expect(result.displayedLanguage).toBe("en");
    expect(service.translateTitle).not.toHaveBeenCalled();
  });

  it("uses cached translation when available with description", async () => {
    const article = makeArticle();
    const cached = ArticleTranslation.create({
      articleId: article.id,
      targetLang: "es",
      title: "Hola mundo",
      description: "Zorro marrón rápido",
      provider: "groq:llama-3.3-70b",
      createdAt: new Date(),
    });
    const articles = makeArticleRepository(article);
    const repo = makeRepo(cached);
    const service = makeService();
    const useCase = new GetArticleWithTranslation(articles, repo, service);

    const result = await useCase.execute({ articleId: article.id, targetLang: "es" });

    expect(result.displayed.title).toBe("Hola mundo");
    expect(result.displayed.description).toBe("Zorro marrón rápido");
    expect(result.displayedLanguage).toBe("es");
    expect(service.translateTitle).not.toHaveBeenCalled();
    expect(service.translateDescription).not.toHaveBeenCalled();
  });

  it("translates and caches when no translation exists", async () => {
    const article = makeArticle();
    const articles = makeArticleRepository(article);
    const repo = makeRepo();
    const service = makeService();
    const useCase = new GetArticleWithTranslation(articles, repo, service);

    const result = await useCase.execute({ articleId: article.id, targetLang: "es" });

    expect(result.displayed.title).toBe("Hola mundo");
    expect(result.displayed.description).toBe("Zorro marrón rápido");
    expect(repo.upsert).toHaveBeenCalledOnce();
    expect(result.translationFailed).toBe(false);
  });

  it("falls back to original when translator throws", async () => {
    const article = makeArticle();
    const articles = makeArticleRepository(article);
    const repo = makeRepo();
    const service = makeService({
      translateTitle: vi.fn().mockRejectedValue(new Error("boom")),
    });
    const useCase = new GetArticleWithTranslation(articles, repo, service);

    const result = await useCase.execute({ articleId: article.id, targetLang: "es" });

    expect(result.translationFailed).toBe(true);
    expect(result.displayed).toEqual(result.original);
    expect(result.displayedLanguage).toBe("en");
    expect(repo.upsert).not.toHaveBeenCalled();
  });
});
