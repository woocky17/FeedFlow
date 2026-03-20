import { Notificacion } from "./notificacion-entity";

export interface NotificacionRepository {
  anadir(notificacion: Notificacion): Promise<void>;
  obtenerPorUsuario(userId: string): Promise<Notificacion[]>;
  marcarComoLeida(id: string): Promise<void>;
  eliminar(id: string): Promise<void>;
}
