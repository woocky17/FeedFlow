import { Story, StoryRepository } from "@/domain/story";

interface TimelineInput {
  storyId: string;
  userId: string;
}

export interface TimelineArticle {
  id: string;
  title: string;
  url: string;
  description: string | null;
  image: string | null;
  sourceId: string;
  publishedAt: Date;
  similarity: number;
}

export interface StoryTimeline {
  story: Story;
  articles: TimelineArticle[];
}

export class GetStoryTimeline {
  constructor(private readonly storyRepository: StoryRepository) {}

  async execute(input: TimelineInput): Promise<StoryTimeline> {
    const story = await this.storyRepository.findById(input.storyId);
    if (!story) throw new Error("Story not found");
    if (story.userId !== input.userId) throw new Error("Forbidden");

    const articles = await this.storyRepository.findArticlesForStory(story.id);

    return { story, articles };
  }
}
