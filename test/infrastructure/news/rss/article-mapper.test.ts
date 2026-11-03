import { describe, expect, it } from "vitest";
import { mapRssItem, RssItem } from "@/infrastructure/news/rss/article-mapper";

function map(overrides: Partial<RssItem>) {
  return mapRssItem(
    { title: "Titulo", link: "https://example.com/1", ...overrides },
    "src-rss",
    "es",
  );
}

describe("mapRssItem", () => {
  it("reads a string summary", () => {
    expect(map({ summary: "<p>Resumen <b>plano</b></p>" })?.description).toBe("Resumen plano");
  });

  it("reads a summary parsed as an object with #text and type html", () => {
    const summary = { "#text": "<p>Resumen &amp; html</p>", "@_type": "html" };
    expect(map({ summary })?.description).toBe("Resumen & html");
  });

  it("reads a description parsed as an object", () => {
    expect(map({ description: { "#text": "Descripcion" } })?.description).toBe("Descripcion");
  });

  it("falls back to summary when description is empty", () => {
    expect(map({ description: "", summary: "Resumen" })?.description).toBe("Resumen");
  });

  it("never throws on non-string text fields", () => {
    const result = map({
      description: { "@_type": "html" },
      summary: 42,
      content: null,
      pubDate: { "#text": "2026-04-22T10:00:00Z" },
    });
    expect(result?.description).toBe("42");
    expect(result?.publishedAt.toISOString()).toBe("2026-04-22T10:00:00.000Z");
  });

  it("reads a numeric title", () => {
    expect(map({ title: 2026 })?.title).toBe("2026");
  });
});
