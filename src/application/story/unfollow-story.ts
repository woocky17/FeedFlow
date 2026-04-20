import { StoryRepository } from "@/domain/story";

interface UnfollowInput {
  storyId: string;
  userId: string;
}

export class UnfollowStory {
  constructor(private readonly storyRepository: StoryRepository) {}

  async execute(input: UnfollowInput): Promise<void> {
    const story = await this.storyRepository.findById(input.storyId);
    if (!story) throw new Error("Story not found");
    if (story.userId !== input.userId) throw new Error("Forbidden");
    await this.storyRepository.delete(story.id);
  }
}
