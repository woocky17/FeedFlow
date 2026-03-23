import { Notification } from "./notificacion-entity";

export interface NotificationRepository {
  add(notification: Notification): Promise<void>;
  findByUser(userId: string): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
  delete(id: string): Promise<void>;
}
