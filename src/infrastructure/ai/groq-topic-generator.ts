import { GeneratedTopic, TopicGenerator } from "@/domain/story";
import { fetchGroqChat } from "./groq-fetch";

export class GroqTopicGenerator implements TopicGenerator {
  constructor(private readonly apiKey: string) {}

  async generate(title: string, description: string): Promise<GeneratedTopic> {
    const fallback = (): GeneratedTopic => ({
      name: title.length > 60 ? `${title.slice(0, 57)}...` : title,
      summary: description?.slice(0, 200) || title,
    });

    if (!this.apiKey) return fallback();

    let data: unknown;
    try {
      data = await fetchGroqChat(this.apiKey, {
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        max_tokens: 200,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You turn a news article into an ongoing "story topic" for a timeline tracker.

Given the article title and description, output a JSON object with:
- "name": a short, neutral topic name (max 6 words, no punctuation except hyphens). Describe the ongoing story, not the article. E.g. "Ukraine war", "OpenAI leadership changes", "Spanish election 2024".
- "summary": one sentence (max 200 chars) describing what the story is about.

Reply with ONLY the JSON object, no prose.`,
          },
          {
            role: "user",
            content: `Title: ${title}\nDescription: ${description}`,
          },
        ],
      });
    } catch (err) {
      console.error(`Groq topic generator: ${err instanceof Error ? err.message : String(err)}`);
      return fallback();
    }

    try {
      const raw: string = (data as { choices?: Array<{ message?: { content?: string } }> })
        ?.choices?.[0]?.message?.content?.trim() ?? "";
      const parsed = JSON.parse(raw);
      const name = typeof parsed.name === "string" ? parsed.name.trim() : "";
      const summary = typeof parsed.summary === "string" ? parsed.summary.trim() : "";
      if (!name) return fallback();
      return {
        name: name.slice(0, 80),
        summary: summary.slice(0, 280) || title,
      };
    } catch (err) {
      console.error("Failed to parse Groq topic response", err);
      return fallback();
    }
  }
}
