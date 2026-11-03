import { Notification, NotificationRepository } from "@/domain/notification";

const DEFAULT_LIMIT = 100;

interface ListUserNotificationsInput {
  userId: string;
  limit?: number;
}

export class ListUserNotifications {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  execute(input: ListUserNotificationsInput): Promise<Notification[]> {
    return this.notificationRepository.findRecentByUser(input.userId, input.limit ?? DEFAULT_LIMIT);
  }
}
