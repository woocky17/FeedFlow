import type { Language } from "@/domain/shared";

export interface TranslationService {
  translateTitle(text: string, from: Language, to: Language): Promise<string>;
  translateDescription(text: string, from: Language, to: Language): Promise<string>;
}
