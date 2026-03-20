import { UsuarioRepository } from "@/domain/user";

export interface PasswordVerifier {
  verify(password: string, hash: string): Promise<boolean>;
}

export interface TokenGenerator {
  generate(userId: string): string;
}

interface IniciarSesionInput {
  email: string;
  password: string;
}

interface IniciarSesionOutput {
  token: string;
  userId: string;
}

export class IniciarSesion {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly passwordVerifier: PasswordVerifier,
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  async execute(input: IniciarSesionInput): Promise<IniciarSesionOutput> {
    const user = await this.usuarioRepository.obtenerPorEmail(input.email);
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
