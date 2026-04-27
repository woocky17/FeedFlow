import { Source, SourceKind, SourceRepository } from "@/domain/source";
import type { Language } from "@/domain/shared";

interface AddSourceInput {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  kind?: SourceKind;
  language?: Language;
}

export class AddSource {
  constructor(private readonly sourceRepository: SourceRepository) {}

  async execute(input: AddSourceInput): Promise<Source> {
    const source = Source.create({
      id: input.id,
      name: input.name,
      baseUrl: input.baseUrl,
      apiKey: input.apiKey,
      kind: input.kind ?? "worldnews",
      language: input.language ?? "en",
      active: true,
      createdAt: new Date(),
    });

    await this.sourceRepository.save(source);

    return source;
  }
}
