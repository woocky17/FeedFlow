export interface GeneratedTopic {
  name: string;
  summary: string;
}

export interface TopicGenerator {
  generate(title: string, description: string): Promise<GeneratedTopic>;
}
