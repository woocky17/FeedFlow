import { Category } from "./categoria-entity";

export interface CategoryRepository {
  create(category: Category): Promise<void>;
  update(category: Category): Promise<void>;
  findById(id: string): Promise<Category | null>;
  findByUser(userId: string): Promise<Category[]>;
  findDefault(): Promise<Category[]>;
  delete(id: string): Promise<void>;
}
