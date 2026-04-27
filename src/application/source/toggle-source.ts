import { Source, SourceRepository } from "@/domain/source";

interface ToggleSourceInput {
  sourceId: string;
  active: boolean;
}

export class ToggleSource {
  constructor(private readonly sourceRepository: SourceRepository) {}

  async execute(input: ToggleSourceInput): Promise<Source> {
    const source = await this.sourceRepository.findById(input.sourceId);
    if (!source) {
      throw new Error("Source not found");
    }

    const updated = Source.create({
      id: source.id,
      name: source.name,
      baseUrl: source.baseUrl,
      apiKey: source.apiKey,
      kind: source.kind,
      language: source.language,
      active: input.active,
      createdAt: source.createdAt,
    });

    await this.sourceRepository.update(updated);

    return updated;
  }
}
