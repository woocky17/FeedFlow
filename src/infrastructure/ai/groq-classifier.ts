import { CategoryClassifier } from "@/application/article/sync-articles";
import { CategoryRepository } from "@/domain/category";
import { fetchGroqChat } from "./groq-fetch";

export class GroqClassifier implements CategoryClassifier {
  private readonly apiKey: string;
  private cachedCategories: { id: string; name: string }[] | null = null;

  constructor(
    apiKey: string,
    private readonly categoryRepository: CategoryRepository,
  ) {
    this.apiKey = apiKey;
  }

  async classify(title: string, description: string): Promise<string[]> {
    const categories = await this.getCategories();
    if (categories.length === 0) return [];

    const categoryNames = categories.map((c) => c.name).join(", ");

    let data: unknown;
    try {
      data = await fetchGroqChat(this.apiKey, {
        model: "llama-3.3-70b-versatile",
        temperature: 0,
        max_tokens: 100,
        messages: [
          {
            role: "system",
            content: `You are a news article classifier. Given an article title and description, classify it into the SINGLE most relevant category from this list: ${categoryNames}.

Rules:
- Focus on the MAIN TOPIC of the article, not secondary details.
- Choose the category that best describes what the article is fundamentally about.
- "Health" is for medical, healthcare, or public health topics — NOT for articles that merely mention exercise or fitness as context.
- "Entertainment" is for movies, TV, music, celebrities, and media — NOT for general human interest stories.
- "World" is for international news, social issues, and general news stories that don't fit other categories.
- Reply with ONLY ONE category name. If no category fits, reply with "none".`,
          },
          {
            role: "user",
            content: `Title: ${title}\nDescription: ${description}`,
          },
        ],
      });
    } catch (err) {
      console.error(`Groq classifier: ${err instanceof Error ? err.message : String(err)}`);
      return [];
    }

    const reply: string = (data as { choices?: Array<{ message?: { content?: string } }> })
      ?.choices?.[0]?.message?.content?.trim() ?? "";

    if (!reply || reply.toLowerCase() === "none") return [];

    const matchedNames = reply.split(",").map((s: string) => s.trim().toLowerCase());

    return categories
      .filter((c) => matchedNames.includes(c.name.toLowerCase()))
      .map((c) => c.id);
  }

  private async getCategories(): Promise<{ id: string; name: string }[]> {
    if (this.cachedCategories) return this.cachedCategories;

    const defaults = await this.categoryRepository.findDefault();
    this.cachedCategories = defaults.map((c) => ({ id: c.id, name: c.name }));
    return this.cachedCategories;
  }
}
