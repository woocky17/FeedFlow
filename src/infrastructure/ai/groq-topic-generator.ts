import { GeneratedTopic, TopicGenerator } from "@/domain/story";

export class GroqTopicGenerator implements TopicGenerator {
  constructor(private readonly apiKey: string) {}

  async generate(title: string, description: string): Promise<GeneratedTopic> {
    const fallback = (): GeneratedTopic => ({
      name: title.length > 60 ? `${title.slice(0, 57)}...` : title,
      summary: description?.slice(0, 200) || title,
    });

    if (!this.apiKey) return fallback();

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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
      }),
    });

    if (!res.ok) {
      console.error(`Groq topic generator error: ${res.status}`);
      return fallback();
    }

    try {
      const data = await res.json();
      const raw: string = data.choices?.[0]?.message?.content?.trim() ?? "";
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
