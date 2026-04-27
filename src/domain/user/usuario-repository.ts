import type { Language } from "@/domain/shared";
import { User } from "../user/user-entity";

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  delete(id: string): Promise<void>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
  updateLanguage(id: string, language: Language): Promise<void>;
}
