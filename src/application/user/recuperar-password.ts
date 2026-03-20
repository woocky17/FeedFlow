import { UsuarioRepository } from "@/domain/user";
import { EmailSender } from "@/domain/notification";

export interface TokenGeneratorForRecovery {
  generate(): string;
}

interface RecuperarPasswordInput {
  email: string;
}

export class RecuperarPassword {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly emailSender: EmailSender,
    private readonly tokenGenerator: TokenGeneratorForRecovery,
  ) {}

  async execute(input: RecuperarPasswordInput): Promise<void> {
    const user = await this.usuarioRepository.obtenerPorEmail(input.email);
    if (!user) {
      return;
    }

    const token = this.tokenGenerator.generate();

    await this.emailSender.enviar(
      user.email,
      "Recuperar contraseña",
      `Tu token de recuperación es: ${token}`,
    );
  }
}
