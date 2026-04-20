import {
  EventArticleView,
  NewsEvent,
  NewsEventRepository,
} from "@/domain/news-event";

interface GetInput {
  eventId: string;
}

export interface NewsEventDetails {
  event: NewsEvent;
  articles: EventArticleView[];
}

export class GetNewsEvent {
  constructor(private readonly eventRepository: NewsEventRepository) {}

  async execute(input: GetInput): Promise<NewsEventDetails> {
    const event = await this.eventRepository.findById(input.eventId);
    if (!event) throw new Error("Event not found");
    const articles = await this.eventRepository.findArticles(event.id);
    return { event, articles };
  }
}
