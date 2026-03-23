import { User } from "@/domain/user";
import { UserRepository } from "@/domain/user";

export interface PasswordHasher {
  hash(password: string): Promise<string>;
}

interface RegisterUserInput {
  id: string;
  email: string;
  password: string;
}

export class RegisterUser {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: RegisterUserInput): Promise<User> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
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

    await this.userRepository.save(user);

    return user;
  }
}
