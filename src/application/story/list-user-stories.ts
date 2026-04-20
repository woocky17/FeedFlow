import { StoryRepository, StoryWithCounts } from "@/domain/story";

interface ListInput {
  userId: string;
}

export class ListUserStories {
  constructor(private readonly storyRepository: StoryRepository) {}

  execute(input: ListInput): Promise<StoryWithCounts[]> {
    return this.storyRepository.findByUser(input.userId);
  }
}
