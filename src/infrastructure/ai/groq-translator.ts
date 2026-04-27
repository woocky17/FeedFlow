import type { TranslationService } from "@/domain/article-translation";
import type { Language } from "@/domain/shared";
import { fetchGroqChat } from "./groq-fetch";

const MODEL = "llama-3.3-70b-versatile";
const MAX_DESCRIPTION_CHARS = 3000;

const LANGUAGE_NAMES: Record<Language, string> = {
  es: "Spanish",
  en: "English",
};

interface GroqChoice {
  message?: { content?: string };
}

interface GroqResponse {
  choices?: GroqChoice[];
}

export class GroqTranslationService implements TranslationService {
  constructor(private readonly apiKey: string) {}

  async translateTitle(text: string, from: Language, to: Language): Promise<string> {
    if (from === to) return text;
    return this.translate(text, from, to, 200);
  }

  async translateDescription(text: string, from: Language, to: Language): Promise<string> {
    if (from === to) return text;
    const trimmed = text.length > MAX_DESCRIPTION_CHARS
      ? text.slice(0, MAX_DESCRIPTION_CHARS)
      : text;
    return this.translate(trimmed, from, to, 800);
  }

  private async translate(
    text: string,
    from: Language,
    to: Language,
    maxTokens: number,
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("Groq API key is not configured");
    }

    const data = (await fetchGroqChat(this.apiKey, {
      model: MODEL,
      temperature: 0.1,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the user's message from ${LANGUAGE_NAMES[from]} to ${LANGUAGE_NAMES[to]}. Preserve named entities, numbers, hashtags and URLs. Output JSON only with shape {"text": "..."}. No explanations, no extra fields.`,
        },
        { role: "user", content: text },
      ],
    })) as GroqResponse;

    const reply = data.choices?.[0]?.message?.content?.trim() ?? "";
    if (!reply) throw new Error("Groq translator returned empty content");

    const parsed = parseTranslation(reply);
    if (!parsed) throw new Error("Groq translator returned malformed payload");

    return parsed;
  }
}

function parseTranslation(reply: string): string | null {
  try {
    const parsed = JSON.parse(reply) as { text?: unknown };
    if (typeof parsed.text === "string" && parsed.text.trim().length > 0) {
      return parsed.text.trim();
    }
  } catch {
    // fall through to regex fallback
  }
  const match = reply.match(/"text"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (match) {
    try {
      return JSON.parse(`"${match[1]}"`) as string;
    } catch {
      return match[1];
    }
  }
  return null;
}
