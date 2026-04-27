export type Language = "es" | "en";

export const SUPPORTED_LANGUAGES: readonly Language[] = ["es", "en"] as const;

export const DEFAULT_LANGUAGE: Language = "es";

export function isLanguage(value: unknown): value is Language {
  return value === "es" || value === "en";
}

export function assertLanguage(value: unknown): Language {
  if (!isLanguage(value)) {
    throw new Error(`Invalid language: ${String(value)}`);
  }
  return value;
}
