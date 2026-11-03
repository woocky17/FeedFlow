import { Notification } from "./notificacion-entity";

export interface NotificationRepository {
  add(notification: Notification): Promise<void>;
  findByUser(userId: string): Promise<Notification[]>;
  findRecentByUser(userId: string, limit: number): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
}
