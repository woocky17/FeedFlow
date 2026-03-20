import { Source, SourceRepository } from "@/domain/source";

interface ActivarDesactivarFuenteInput {
  sourceId: string;
  active: boolean;
}

export class ActivarDesactivarFuente {
  constructor(private readonly sourceRepository: SourceRepository) {}

  async execute(input: ActivarDesactivarFuenteInput): Promise<Source> {
    const source = await this.sourceRepository.findById(input.sourceId);
    if (!source) {
      throw new Error("Source not found");
    }

    const updated = Source.create({
      id: source.id,
      name: source.name,
      baseUrl: source.baseUrl,
      active: input.active,
      createdAt: source.createdAt,
    });

    await this.sourceRepository.update(updated);

    return updated;
  }
}
