import { Source, SourceRepository } from "@/domain/source";

interface AddSourceInput {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
}

export class AddSource {
  constructor(private readonly sourceRepository: SourceRepository) {}

  async execute(input: AddSourceInput): Promise<Source> {
    const source = Source.create({
      id: input.id,
      name: input.name,
      baseUrl: input.baseUrl,
      apiKey: input.apiKey,
      active: true,
      createdAt: new Date(),
    });

    await this.sourceRepository.save(source);

    return source;
  }
}
