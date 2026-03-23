import { NotificationRepository } from "@/domain/notification";

interface MarkNotificationReadInput {
  notificationId: string;
  userId: string;
}

export class MarkNotificationRead {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(input: MarkNotificationReadInput): Promise<void> {
    const notifications = await this.notificationRepository.findByUser(input.userId);
    const notification = notifications.find((n) => n.id === input.notificationId);

    if (!notification) {
      throw new Error("Notification not found or does not belong to this user");
    }

    await this.notificationRepository.markAsRead(input.notificationId);
  }
}
