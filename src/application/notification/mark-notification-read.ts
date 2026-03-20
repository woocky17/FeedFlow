import { NotificacionRepository } from "@/domain/notification";

interface MarkNotificationReadInput {
  notificationId: string;
  userId: string;
}

export class MarkNotificationRead {
  constructor(
    private readonly notificationRepository: NotificacionRepository,
  ) {}

  async execute(input: MarkNotificationReadInput): Promise<void> {
    const notifications = await this.notificationRepository.obtenerPorUsuario(input.userId);
    const notification = notifications.find((n) => n.id === input.notificationId);

    if (!notification) {
      throw new Error("Notification not found or does not belong to this user");
    }

    await this.notificationRepository.marcarComoLeida(input.notificationId);
  }
}
