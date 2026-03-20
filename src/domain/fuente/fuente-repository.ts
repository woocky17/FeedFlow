import { Source } from "../source/source-entity";

export interface FuenteRepository {
  anadir(fuente: Source): Promise<void>;
  actualizar(fuente: Source): Promise<void>;
  obtener(id: string): Promise<Source | null>;
  obtenerActivas(): Promise<Source[]>;
  eliminar(id: string): Promise<void>;
}
