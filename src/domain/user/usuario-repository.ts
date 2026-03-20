import { User } from "../user/user-entity";

export interface UsuarioRepository {
  guardar(usuario: User): Promise<void>;
  obtener(id: string): Promise<User | null>;
  obtenerPorEmail(email: string): Promise<User | null>;
  eliminar(id: string): Promise<void>;
  actualizarPassword(id: string, passwordHash: string): Promise<void>;
}
