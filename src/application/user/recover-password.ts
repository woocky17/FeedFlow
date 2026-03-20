import { UsuarioRepository } from "@/domain/user";
import { EmailSender } from "@/domain/notification";

export interface RecoveryTokenGenerator {
  generate(): string;
}

interface RecoverPasswordInput {
  email: string;
}

export class RecoverPassword {
  constructor(
    private readonly userRepository: UsuarioRepository,
    private readonly emailSender: EmailSender,
    private readonly tokenGenerator: RecoveryTokenGenerator,
  ) {}

  async execute(input: RecoverPasswordInput): Promise<void> {
    const user = await this.userRepository.obtenerPorEmail(input.email);
    if (!user) {
      return;
    }

    const token = this.tokenGenerator.generate();

    await this.emailSender.enviar(
      user.email,
      "Recover password",
      `Your recovery token is: ${token}`,
    );
  }
}
