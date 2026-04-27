import type { Language } from "@/domain/shared";

export type PrismaLanguage = "ES" | "EN";

export function toPrismaLanguage(lang: Language): PrismaLanguage {
  return lang === "es" ? "ES" : "EN";
}

export function fromPrismaLanguage(lang: PrismaLanguage): Language {
  return lang === "ES" ? "es" : "en";
}
