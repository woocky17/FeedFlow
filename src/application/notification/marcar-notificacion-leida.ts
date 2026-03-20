import { NotificacionRepository } from "@/domain/notification";

interface MarcarNotificacionLeidaInput {
  notificacionId: string;
  userId: string;
}

export class MarcarNotificacionLeida {
  constructor(
    private readonly notificacionRepository: NotificacionRepository,
  ) {}

  async execute(input: MarcarNotificacionLeidaInput): Promise<void> {
    const notificaciones = await this.notificacionRepository.obtenerPorUsuario(input.userId);
    const notificacion = notificaciones.find((n) => n.id === input.notificacionId);

    if (!notificacion) {
      throw new Error("Notification not found or does not belong to this user");
    }

    await this.notificacionRepository.marcarComoLeida(input.notificacionId);
  }
}
