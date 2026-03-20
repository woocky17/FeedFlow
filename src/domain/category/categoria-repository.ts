import { Categoria } from "./categoria-entity";

export interface CategoriaRepository {
  crear(categoria: Categoria): Promise<void>;
  actualizar(categoria: Categoria): Promise<void>;
  obtener(id: string): Promise<Categoria | null>;
  obtenerPorUsuario(userId: string): Promise<Categoria[]>;
  eliminar(id: string): Promise<void>;
}
