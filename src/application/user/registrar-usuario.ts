import { User } from "@/domain/user";
import { UsuarioRepository } from "@/domain/user";

export interface PasswordHasher {
  hash(password: string): Promise<string>;
}

interface RegistrarUsuarioInput {
  id: string;
  email: string;
  password: string;
}

export class RegistrarUsuario {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: RegistrarUsuarioInput): Promise<User> {
    const existente = await this.usuarioRepository.obtenerPorEmail(input.email);
    if (existente) {
      throw new Error("Email is already registered");
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const user = User.create({
      id: input.id,
      email: input.email,
      passwordHash,
      role: "user",
      createdAt: new Date(),
    });

    await this.usuarioRepository.guardar(user);

    return user;
  }
}
