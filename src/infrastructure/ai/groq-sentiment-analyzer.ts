import {
  BatchSentimentResult,
  Sentiment,
  SentimentAnalyzer,
  SentimentInput,
  SentimentResult,
} from "@/domain/news-event";
import { fetchGroqChat } from "./groq-fetch";

const SYSTEM_PROMPT_SINGLE = `You analyze the tone of news articles. Return JSON with:
- "sentiment": one of "positive", "neutral", "negative" based on the overall tone of the coverage (not the event itself).
- "framing": ONE short sentence (max 120 chars) describing how the article frames the story — tone, emphasis, implied stance. Say "Factual report" if purely neutral.

Reply with ONLY the JSON object, no prose.`;

const SYSTEM_PROMPT_BATCH = `You analyze the tone of multiple news articles at once. Return JSON:
{
  "results": [
    { "id": "<input id>", "sentiment": "positive"|"neutral"|"negative", "framing": "<=120 chars" },
    ...
  ]
}

Rules:
- Preserve the exact "id" from each input.
- "sentiment" reflects the TONE of the coverage, not whether the event is good/bad.
- "framing" = ONE short sentence (<=120 chars) describing how the article frames the story.
- Use "Factual report" for neutral framing.
- Reply with ONLY the JSON object, no prose.`;

export class GroqSentimentAnalyzer implements SentimentAnalyzer {
  constructor(private readonly apiKey: string) {}

  async analyze(title: string, description: string): Promise<SentimentResult | null> {
    if (!this.apiKey) return null;

    let data: unknown;
    try {
      data = await fetchGroqChat(this.apiKey, {
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        max_tokens: 200,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT_SINGLE },
          { role: "user", content: `Title: ${title}\nDescription: ${description}` },
        ],
      });
    } catch (err) {
      console.error(`Groq sentiment: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }

    try {
      const raw: string = (data as { choices?: Array<{ message?: { content?: string } }> })
        ?.choices?.[0]?.message?.content?.trim() ?? "";
      const parsed = JSON.parse(raw);
      return sanitizeResult(parsed);
    } catch (err) {
      console.error("Failed to parse Groq sentiment response", err);
      return null;
    }
  }

  async analyzeBatch(items: SentimentInput[]): Promise<BatchSentimentResult[]> {
    if (!this.apiKey || items.length === 0) return [];

    const userPayload = items
      .map((item) => `- id: ${item.id}\n  title: ${item.title}\n  description: ${item.description}`)
      .join("\n");

    let data: unknown;
    try {
      data = await fetchGroqChat(this.apiKey, {
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        max_tokens: Math.min(200 + items.length * 80, 2000),
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT_BATCH },
          { role: "user", content: `Analyze these ${items.length} articles:\n${userPayload}` },
        ],
      });
    } catch (err) {
      console.error(`Groq sentiment (batch): ${err instanceof Error ? err.message : String(err)}`);
      return [];
    }

    try {
      const raw: string = (data as { choices?: Array<{ message?: { content?: string } }> })
        ?.choices?.[0]?.message?.content?.trim() ?? "";
      const parsed = JSON.parse(raw);
      const resultsArray: unknown = parsed.results;
      if (!Array.isArray(resultsArray)) return [];

      const out: BatchSentimentResult[] = [];
      const validIds = new Set(items.map((i) => i.id));
      for (const entry of resultsArray) {
        const id = typeof (entry as { id?: unknown }).id === "string" ? (entry as { id: string }).id : null;
        if (!id || !validIds.has(id)) continue;
        const result = sanitizeResult(entry as Record<string, unknown>);
        if (!result) continue;
        out.push({ id, result });
      }
      return out;
    } catch (err) {
      console.error("Failed to parse Groq batch sentiment response", err);
      return [];
    }
  }
}

function sanitizeResult(parsed: Record<string, unknown>): SentimentResult | null {
  const sentiment = normalizeSentiment(parsed.sentiment);
  const framingRaw = typeof parsed.framing === "string" ? parsed.framing.trim() : "";
  if (!sentiment) return null;
  return {
    sentiment,
    framing: framingRaw.slice(0, 180) || "Factual report",
  };
}

function normalizeSentiment(value: unknown): Sentiment | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "positive" || normalized === "neutral" || normalized === "negative") {
    return normalized;
  }
  return null;
}
