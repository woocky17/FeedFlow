import { SourceRepository } from "@/domain/source";

interface DeleteSourceInput {
  sourceId: string;
}

export class DeleteSource {
  constructor(private readonly sourceRepository: SourceRepository) {}

  async execute(input: DeleteSourceInput): Promise<void> {
    const source = await this.sourceRepository.findById(input.sourceId);
    if (!source) {
      throw new Error("Source not found");
    }

    await this.sourceRepository.delete(input.sourceId);
  }
}
