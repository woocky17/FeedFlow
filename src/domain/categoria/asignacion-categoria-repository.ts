import { AsignacionCategoria, AssignmentOrigin } from "./asignacion-categoria-entity";

export interface AsignacionCategoriaRepository {
  crear(asignacion: AsignacionCategoria): Promise<void>;
  obtenerPorNoticia(articleId: string): Promise<AsignacionCategoria[]>;
  actualizarOrigen(articleId: string, categoryId: string, origin: AssignmentOrigin): Promise<void>;
}
