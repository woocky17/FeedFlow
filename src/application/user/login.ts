import { UsuarioRepository } from "@/domain/user";

export interface PasswordVerifier {
  verify(password: string, hash: string): Promise<boolean>;
}

export interface TokenGenerator {
  generate(userId: string): string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface LoginOutput {
  token: string;
  userId: string;
}

export class Login {
  constructor(
    private readonly userRepository: UsuarioRepository,
    private readonly passwordVerifier: PasswordVerifier,
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepository.obtenerPorEmail(input.email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const valid = await this.passwordVerifier.verify(input.password, user.passwordHash);
    if (!valid) {
      throw new Error("Invalid email or password");
    }

    const token = this.tokenGenerator.generate(user.id);

    return { token, userId: user.id };
  }
}
