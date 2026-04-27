import type { UserRepository } from "@/domain/user";
import { isLanguage, type Language } from "@/domain/shared";

interface UpdateUserLanguageInput {
  userId: string;
  language: Language;
}

export class UpdateUserLanguage {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: UpdateUserLanguageInput): Promise<void> {
    if (!isLanguage(input.language)) {
      throw new Error("Unsupported language");
    }

    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new Error("User not found");
    }

    await this.userRepository.updateLanguage(input.userId, input.language);
  }
}
