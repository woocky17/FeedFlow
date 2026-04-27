import { describe, expect, it } from "vitest";
import { Article } from "@/domain/article";

function makeProps(overrides: Partial<Parameters<typeof Article.create>[0]> = {}) {
  return {
    id: "art-1",
    title: "A title",
    url: "https://example.com/a",
    description: "desc",
    image: "",
    sourceId: "src-1",
    language: "en" as const,
    publishedAt: new Date("2026-04-20T00:00:00Z"),
    savedAt: new Date("2026-04-20T00:00:00Z"),
    ...overrides,
  };
}

describe("Article", () => {
  it("creates a valid article", () => {
    const article = Article.create(makeProps());
    expect(article.title).toBe("A title");
    expect(article.language).toBe("en");
  });

  it("accepts es language", () => {
    const article = Article.create(makeProps({ language: "es" }));
    expect(article.language).toBe("es");
  });

  it("rejects empty title", () => {
    expect(() => Article.create(makeProps({ title: "" }))).toThrow(/title/);
  });

  it("rejects invalid url", () => {
    expect(() => Article.create(makeProps({ url: "not-a-url" }))).toThrow(/URL/);
  });

  it("rejects unsupported language", () => {
    expect(() => Article.create(makeProps({ language: "fr" as never }))).toThrow(
      /language/,
    );
  });
});
