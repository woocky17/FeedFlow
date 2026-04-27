import { describe, expect, it } from "vitest";
import { ArticleTranslation } from "@/domain/article-translation";

function makeProps(overrides: Partial<Parameters<typeof ArticleTranslation.create>[0]> = {}) {
  return {
    articleId: "art-1",
    targetLang: "en" as const,
    title: "Translated title",
    description: "Translated description",
    provider: "groq:llama-3.3-70b",
    createdAt: new Date("2026-04-27T00:00:00Z"),
    ...overrides,
  };
}

describe("ArticleTranslation", () => {
  it("creates a valid translation", () => {
    const t = ArticleTranslation.create(makeProps());

    expect(t.articleId).toBe("art-1");
    expect(t.targetLang).toBe("en");
    expect(t.title).toBe("Translated title");
    expect(t.description).toBe("Translated description");
    expect(t.provider).toBe("groq:llama-3.3-70b");
  });

  it("accepts null description", () => {
    const t = ArticleTranslation.create(makeProps({ description: null }));
    expect(t.description).toBeNull();
  });

  it("rejects empty articleId", () => {
    expect(() => ArticleTranslation.create(makeProps({ articleId: "" }))).toThrow(
      /articleId/,
    );
  });

  it("rejects unsupported targetLang", () => {
    expect(() =>
      ArticleTranslation.create(makeProps({ targetLang: "fr" as never })),
    ).toThrow(/targetLang/);
  });

  it("rejects empty title", () => {
    expect(() => ArticleTranslation.create(makeProps({ title: "   " }))).toThrow(/title/);
  });

  it("rejects empty provider", () => {
    expect(() => ArticleTranslation.create(makeProps({ provider: "" }))).toThrow(
      /provider/,
    );
  });
});
