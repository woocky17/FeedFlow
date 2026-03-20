import { Source } from "./source.entity";

export interface SourceRepository {
  save(source: Source): Promise<void>;
  findById(id: string): Promise<Source | null>;
  findActive(): Promise<Source[]>;
  update(source: Source): Promise<void>;
  delete(id: string): Promise<void>;
}
