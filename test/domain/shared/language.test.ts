import { describe, expect, it } from "vitest";
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  assertLanguage,
  isLanguage,
} from "@/domain/shared";

describe("Language", () => {
  it("supports es and en", () => {
    expect(SUPPORTED_LANGUAGES).toEqual(["es", "en"]);
  });

  it("defaults to es", () => {
    expect(DEFAULT_LANGUAGE).toBe("es");
  });

  describe("isLanguage", () => {
    it.each(["es", "en"])("returns true for %s", (lang) => {
      expect(isLanguage(lang)).toBe(true);
    });

    it.each(["fr", "EN", "", null, undefined, 0, {}])(
      "returns false for %s",
      (value) => {
        expect(isLanguage(value)).toBe(false);
      },
    );
  });

  describe("assertLanguage", () => {
    it("returns the language when valid", () => {
      expect(assertLanguage("es")).toBe("es");
    });

    it("throws when invalid", () => {
      expect(() => assertLanguage("fr")).toThrow(/Invalid language/);
    });
  });
});
