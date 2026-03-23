import { Source, SourceRepository } from "@/domain/source";

interface EditSourceInput {
  sourceId: string;
  name?: string;
  baseUrl?: string;
  apiKey?: string;
}

export class EditSource {
  constructor(private readonly sourceRepository: SourceRepository) {}

  async execute(input: EditSourceInput): Promise<Source> {
    const source = await this.sourceRepository.findById(input.sourceId);
    if (!source) {
      throw new Error("Source not found");
    }

    const updated = Source.create({
      id: source.id,
      name: input.name ?? source.name,
      baseUrl: input.baseUrl ?? source.baseUrl,
      apiKey: input.apiKey ?? source.apiKey,
      active: source.active,
      createdAt: source.createdAt,
    });

    await this.sourceRepository.update(updated);

    return updated;
  }
}
