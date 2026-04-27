import { describe, expect, it } from "vitest";
import { Source } from "@/domain/source";

function makeProps(overrides: Partial<Parameters<typeof Source.create>[0]> = {}) {
  return {
    id: "src-1",
    name: "Example",
    baseUrl: "https://example.com",
    apiKey: "key",
    kind: "worldnews" as const,
    language: "en" as const,
    active: true,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

describe("Source", () => {
  it("creates a valid worldnews source", () => {
    const s = Source.create(makeProps());
    expect(s.language).toBe("en");
  });

  it("accepts es language", () => {
    const s = Source.create(makeProps({ language: "es" }));
    expect(s.language).toBe("es");
  });

  it("rejects unsupported language", () => {
    expect(() => Source.create(makeProps({ language: "fr" as never }))).toThrow(
      /language/,
    );
  });

  it("rejects worldnews source without apiKey", () => {
    expect(() => Source.create(makeProps({ apiKey: "" }))).toThrow(/API key/);
  });

  it("allows rss source without apiKey", () => {
    const s = Source.create(makeProps({ kind: "rss", apiKey: "" }));
    expect(s.kind).toBe("rss");
  });
});
